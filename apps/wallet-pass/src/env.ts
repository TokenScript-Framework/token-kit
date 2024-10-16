import {createEnv} from '@t3-oss/env-core';
import dotenv from 'dotenv';
import {z} from 'zod';

dotenv.config();

export const env = createEnv({
  clientPrefix: '',
  server: {
    NODE_ENV: z.enum(['prod', 'test', 'dev']).default('dev'),
    MODE: z.enum(['API', 'WATCHER', '']).default(''),
    JWT_SECRET: z.string().default('SuPeRpaSsW0rd'),
    FASTIFY_PORT: z.coerce.number().default(3005),
    FASTIFY_ADDRESS: z.string().default('127.0.0.1'),
    LOG_LEVEL: z.string().default('debug'),
    DB_HOST: z.string().default('127.0.0.1'),
    DB_PORT: z.coerce.number().default(5432),
    DB_USER: z.string().default('test_admin'),
    DB_PASSWORD: z.string().default('admin'),
    DB_DATABASE: z.string().default('test'),
    KEY_FOR_DB_CRYPTO: z
      .string()
      .default('Eqz95UpfjkWUbYq5sMWIUcxmVliIug0ItM5UrhDnioA='),
    S3_ACCESS_KEY_ID: z.string(),
    S3_SECRET_ACCESS_KEY: z.string(),
    S3_BUCKET: z.string(),
    SIGNATURE_PRIVATE_KEY: z.string(),
    ROOT_URL: z.string().default('http://127.0.0.1:3005'),
    PASSKIT_AUTH_TOKEN: z.string(),
  },
  client: {},
  runtimeEnv: process.env,
});
