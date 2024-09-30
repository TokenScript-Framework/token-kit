import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

export default class S3 {
  private readonly s3: S3Client;
  constructor(options: { region: string }) {
    this.s3 = new S3Client({ region: options.region });
  }

  async get(bucket: string, key: string): Promise<string | undefined> {
    const result = await this.s3.send(
      new GetObjectCommand({ Bucket: bucket, Key: key }),
    );
    return result.Body?.transformToString("utf8");
  }

  async put(
    bucket: string,
    key: string,
    body: string | Buffer,
    mime?: string,
    cacheControl?: string,
  ) {
    return this.s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: mime,
        CacheControl: cacheControl,
      }),
    );
  }

  async exists(bucket: string, key: string): Promise<boolean> {
    return this.s3
      .send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
      .then(() => true)
      .catch(() => false);
  }
}
