import {Template} from '@walletpass/pass-js';
import {FastifyReply} from 'fastify';
import {env} from '../env';
import {ProjectConfig} from './projectService';
import {findTemplate} from './walletPassTemplateService';

export function buildApplePass(
  config: ProjectConfig,
  params: any,
  primaryKey: string,
  serialNumber: string
) {
  const {passTypeIdentifier, passType, teamIdentifier} =
    config.walletPass!.apple;

  const {
    backFields,
    headerFields,
    primaryFields,
    secondaryFields,
    description,
  } = params.pass;

  const pass: any = {
    description,
    teamIdentifier,
    passTypeIdentifier,
    authenticationToken: env.PASSKIT_AUTH_TOKEN,
    serialNumber,
    webServiceURL: `${env.ROOT_URL}/passkit/`,
  };

  pass[passType] = {
    backFields: [
      ...backFields,
      {
        key: 'notification',
        label: 'Latest Notification',
        value: '',
        changeMessage: '%@',
        textAlignment: 'PKTextAlignmentNatural',
      },
    ],
    headerFields,
    primaryFields,
    secondaryFields,
  };

  if (params.barcode) {
    pass.barcodes = [
      {
        format: 'PKBarcodeFormatQR',
        altText: params.barcode.altText,
        message: `${env.ROOT_URL}/link/barcode/${primaryKey}`,
      },
    ];
  }

  return pass;
}

export function buildUpdatedApplePass(
  json: any,
  params: any,
  config: ProjectConfig
) {
  const {passType} = config.walletPass!.apple!;

  return {
    ...json,
    [passType]: {
      ...json[passType],
      ...params.pass,
    },
  };
}

export async function generateAppleWalletPassFile(
  pass: {
    templateId: string;
    platform: string;
    json: any;
    updatedAt: Date | null;
  },
  config: ProjectConfig,
  reply: FastifyReply
) {
  const template = (await findTemplate(
    pass.templateId,
    pass.platform
  )) as Template;

  template.setCertificate(config.walletPass!.apple!.cert);
  template.setPrivateKey(
    config.walletPass!.apple!.key,
    config.walletPass!.apple!.keySecret
  );

  // Imported data from Ethpass does not have the messageEncoding
  // to make it consistent, we need to add it to the pass json during pass creation
  pass.json.barcodes[0].messageEncoding = 'iso-8859-1';

  const passObject = template.createPass(pass.json);
  const buf = await passObject.asBuffer();

  return reply
    .header('Last-Modified', Math.round(pass.updatedAt!.getTime() / 1000))
    .type('application/vnd.apple.pkpass')
    .send(buf);
}
