import {Template} from '@walletpass/pass-js';
import axios from 'axios';
import {and, eq} from 'drizzle-orm';
import {ethers} from 'ethers';
import {v4 as uuidv4} from 'uuid';
import {LOGGER} from '../_core/constant';
import {DbService} from '../_core/services/dbService';
import {PASS_APPLE_PLATFORM, PASS_GOOGLE_PLATFORM} from '../constant';
import {env} from '../env';
import {passes} from '../schemas/passes';
import {buildApplePass, buildUpdatedApplePass} from './appleWalletPassService';
import {
  buildGooglePass,
  buildUpdatedGooglePass,
  safeCreateGoogleWalletObject,
  safeUpdateGoogleWalletObject,
} from './googleWalletPassService';
import {notifyAppleDevice} from './passkitService';
import {findConfig, ProjectConfig} from './projectService';
import {findTemplate} from './walletPassTemplateService';

const logger = LOGGER.child({from: 'walletPassService'});

export async function createWalletPass(
  dbService: DbService,
  apiKey: string,
  config: ProjectConfig,
  externalId: string,
  params: any
) {
  const {platform, templateId} = params;

  const existingPass = await getPassByExternalId(
    dbService,
    templateId,
    externalId
  );
  if (existingPass) {
    logger.info(
      'skip creating already exist pass, templateId: %s, externalId: %s',
      templateId,
      externalId
    );
    return {
      id: existingPass.id,
      fileURL: `${env.ROOT_URL}/link/wallet-pass/${existingPass.id}`,
      platform,
      createdAt: existingPass.createdAt,
      externalId,
    };
  }

  const primaryKey = uuidv4();
  const passTypeIdentifier =
    config.walletPass![platform as 'apple' | 'google'].passTypeIdentifier;
  const serialNumber = await generateSerialNumber(
    dbService,
    externalId,
    platform,
    passTypeIdentifier
  );

  let pass;
  let passVendorId;
  if (platform === PASS_APPLE_PLATFORM) {
    pass = buildApplePass(config, params, primaryKey, serialNumber);
    passVendorId = serialNumber;
  } else {
    pass = buildGooglePass(config, params, primaryKey, serialNumber);
    passVendorId = pass.id;
  }

  const result = await dbService
    .db()
    .insert(passes)
    .values({
      id: primaryKey,
      passTypeIdentifier,
      serialNumber: passVendorId,
      json: pass,
      platform,
      templateId,
      externalId,
      barcodeUrl: params.barcode?.redirect?.url,
      apiKey,
    })
    .returning({
      createdAt: passes.createdAt,
    });

  if (platform === PASS_GOOGLE_PLATFORM) {
    const credentials = config.walletPass!.google!.credentials;
    const template = (await findTemplate(templateId, platform)) as Template;

    await safeCreateGoogleWalletObject(credentials, {
      ...template,
      ...pass,
    });
  }

  return {
    id: primaryKey,
    fileURL: `${env.ROOT_URL}/link/wallet-pass/${primaryKey}`,
    platform,
    createdAt: result[0].createdAt,
    externalId,
  };
}

const passFields = {
  id: passes.id,
  passTypeIdentifier: passes.passTypeIdentifier,
  serialNumber: passes.serialNumber,
  json: passes.json,
  platform: passes.platform,
  templateId: passes.templateId,
  externalId: passes.externalId,
  barcodeUrl: passes.barcodeUrl,
  apiKey: passes.apiKey,
  createdAt: passes.createdAt,
  updatedAt: passes.updatedAt,
};

export async function updateWalletPass(
  dbService: DbService,
  config: ProjectConfig,
  id: string,
  params: any
) {
  const pass = await getPassById(dbService, id);
  if (!pass) return;

  let updatedJson;
  let googleMessage;
  if (pass.platform === PASS_APPLE_PLATFORM) {
    updatedJson = buildUpdatedApplePass(pass.json, params, config);
  } else {
    updatedJson = buildUpdatedGooglePass(pass.json, params);
    googleMessage = params.message;
  }

  await dbService
    .db()
    .update(passes)
    .set({
      json: updatedJson,
      updatedAt: new Date(),
    })
    .where(eq(passes.id, id));

  if (pass.platform === PASS_APPLE_PLATFORM) {
    await notifyAppleDevice(dbService, config, id);
  }
  if (pass.platform === PASS_GOOGLE_PLATFORM) {
    await safeUpdateGoogleWalletObject(
      config.walletPass!.google!.credentials,
      updatedJson,
      googleMessage
    );
  }
}

export async function getPassByVendorIdentifier(
  dbService: DbService,
  platform: string,
  passTypeIdentifier: string,
  serialNumber: string
) {
  const results = await dbService
    .db()
    .select(passFields)
    .from(passes)
    .where(
      and(
        eq(passes.platform, platform),
        eq(passes.passTypeIdentifier, passTypeIdentifier),
        eq(passes.serialNumber, serialNumber)
      )
    )
    .limit(1);

  return results.length ? results[0] : undefined;
}

export async function getPassById(dbService: DbService, id: string) {
  const results = await dbService
    .db()
    .select(passFields)
    .from(passes)
    .where(eq(passes.id, id))
    .limit(1);

  return results.length ? results[0] : undefined;
}

export async function getPassByExternalId(
  dbService: DbService,
  templateId: string,
  externalId: string
) {
  const results = await dbService
    .db()
    .select(passFields)
    .from(passes)
    .where(
      and(eq(passes.templateId, templateId), eq(passes.externalId, externalId))
    )
    .limit(1);

  return results.length ? results[0] : undefined;
}

async function generateSerialNumber(
  dbService: DbService,
  externalId: string,
  platform: string,
  passTypeIdentifier: string
): Promise<string> {
  const ethersId = ethers.utils
    .id(
      `${externalId}${new Date().getTime()}${Math.floor(Math.random() * 1000)}`
    )
    .substring(50);

  const serialNumber = parseInt(
    `${ethersId.slice(0, 6)}${ethersId.slice(-6, ethersId.length)}`,
    16
  ).toString();

  if (
    await getPassByVendorIdentifier(
      dbService,
      platform,
      passTypeIdentifier,
      serialNumber
    )
  ) {
    return generateSerialNumber(
      dbService,
      externalId,
      platform,
      passTypeIdentifier
    );
  } else {
    return serialNumber;
  }
}

export async function notifyClient(
  dbService: DbService,
  pass: {id: string; platform: string; apiKey: string},
  event: string
) {
  const {id, platform, apiKey} = pass;
  const config = await findConfig(dbService, apiKey);
  const {webhookUrl, subscribedEvents} = config.walletPass!;

  if (!subscribedEvents.includes(event)) return;

  try {
    await axios.post(webhookUrl, {
      event,
      result: {
        id,
        platform,
      },
    });
  } catch (err) {
    logger.error(
      err,
      'failed to notify client, event: %s, id: %s, platform: %s',
      event,
      id,
      platform
    );
  }
}
