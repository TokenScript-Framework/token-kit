import {GetObjectCommand, S3Client} from '@aws-sdk/client-s3';
import {Template} from '@walletpass/pass-js';
import {env} from '../env';

const templateFileKey = {
  apple: 'template.zip',
  google: 'template.json',
};

const templateCache: {
  [cacheKey: string]: Template | {};
} = {};

const s3Client = new S3Client({
  region: 'us-west-1',
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
});

export async function findTemplate(templateId: string, platform: string) {
  const cacheKey = `${templateId}_${platform}`;
  if (templateCache[cacheKey]) return templateCache[cacheKey];

  const getCommand = new GetObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: `wallet-pass/${templateId}/${platform}/${
      templateFileKey[platform as 'apple' | 'google']
    }`,
  });
  const response = await s3Client.send(getCommand);

  let template;
  if (platform === 'apple') {
    const templateData = await response.Body!.transformToByteArray();
    template = await Template.fromBuffer(Buffer.from(templateData));
  } else {
    const templateData = await response.Body!.transformToString();
    template = JSON.parse(templateData);
  }
  templateCache[cacheKey] = template;

  return template;
}
