import {FastifyReply} from 'fastify';
import {GoogleAuth} from 'google-auth-library';
import jwt from 'jsonwebtoken';
import {LOGGER} from '../_core/constant';
import {env} from '../env';
import {ProjectConfig} from './projectService';

const logger = LOGGER.child({from: 'googleWalletPassService'});

const GOOGLE_WALLET_OBJECT_URL =
  'https://walletobjects.googleapis.com/walletobjects/v1/genericObject';

export function buildGooglePass(
  config: ProjectConfig,
  params: any,
  primaryKey: string,
  serialNumber: string
) {
  const {passTypeIdentifier, issuerId} = config.walletPass!.google;

  const {
    logo,
    header,
    cardTitle,
    heroImage,
    subheader,
    linksModuleData,
    textModulesData,
    hexBackgroundColor,
  } = params.pass;

  const pass: any = {
    id: `${issuerId}.${serialNumber}-${passTypeIdentifier}`,
    classId: passTypeIdentifier,
    logo,
    state: 'ACTIVE',
    header,
    cardTitle,
    heroImage,
    subheader,
    linksModuleData,
    textModulesData,
    hexBackgroundColor,
  };

  if (params.barcode) {
    pass.barcode = {
      type: 'QR_CODE',
      value: `${env.ROOT_URL}/link/barcode/${primaryKey}`,
      alternateText: params.barcode.altText,
    };
  }

  return pass;
}

export function buildUpdatedGooglePass(json: any, params: any) {
  return {
    ...json,
    ...params.pass,
  };
}

const googleAuthCache: {
  [keyId: string]: GoogleAuth;
} = {};

function findGoogleAuthClient(credentials: any) {
  if (googleAuthCache[credentials.private_key_id])
    return googleAuthCache[credentials.private_key_id];

  const client = new GoogleAuth({
    credentials: credentials,
    scopes: 'https://www.googleapis.com/auth/wallet_object.issuer',
  });
  googleAuthCache[credentials.private_key_id] = client;

  return client;
}

export async function generateGoogleWalletPassLink(
  pass: {
    serialNumber: string;
  },
  config: ProjectConfig,
  reply: FastifyReply
) {
  const credentials = config.walletPass!.google!.credentials;
  const passLink = buildGooglePassLink(credentials, pass.serialNumber);

  return reply.redirect(307, passLink);
}

export async function safeCreateGoogleWalletObject(
  credentials: any,
  passObject: any
) {
  const client = findGoogleAuthClient(credentials);

  // Check if the object exists
  try {
    await client.request({
      url: `${GOOGLE_WALLET_OBJECT_URL}/${passObject.id}`,
      method: 'GET',
    });

    logger.info('skip create as pass object exists: %s', passObject.id);
    return;
  } catch (err: any) {
    if (err.response?.status !== 404) throw err;
  }

  await client.request({
    url: GOOGLE_WALLET_OBJECT_URL,
    method: 'POST',
    data: passObject,
  });
  logger.info('pass object created: %s', passObject.id);
}

export async function safeUpdateGoogleWalletObject(
  credentials: any,
  passObject: any,
  message: any
) {
  const client = findGoogleAuthClient(credentials);
  // Check if the object exists
  try {
    await client.request({
      url: `${GOOGLE_WALLET_OBJECT_URL}/${passObject.id}`,
      method: 'GET',
    });
  } catch (err: any) {
    if (err.response?.status === 404) {
      logger.info('skip update as pass object not exists: %s', passObject.id);
      return;
    } else {
      throw err;
    }
  }

  await client.request({
    url: `${GOOGLE_WALLET_OBJECT_URL}/${passObject.id}`,
    method: 'PUT',
    data: passObject,
  });

  if (message) {
    await client.request({
      url: `${GOOGLE_WALLET_OBJECT_URL}/${passObject.id}/addMessage`,
      method: 'POST',
      data: {message},
    });
  }

  logger.info('pass object updated: %s', passObject.id);
}

function buildGooglePassLink(credentials: any, objectId: string) {
  const claims = {
    iss: credentials.client_email,
    aud: 'google',
    origins: ['https://www.smarttokenlabs.com'],
    typ: 'savetowallet',
    payload: {
      genericObjects: [
        {
          id: objectId,
        },
      ],
    },
  };

  const token = jwt.sign(claims, credentials.private_key, {
    algorithm: 'RS256',
  });

  return `https://pay.google.com/gp/v/save/${token}`;
}
