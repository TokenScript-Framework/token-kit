import {eq} from 'drizzle-orm';
import {ethers} from 'ethers';
import {z} from 'zod';
import {DbService} from '../_core/services/dbService';
import {decrypt} from '../_core/utils/crypto';
import {env} from '../env';
import {projects} from '../schemas/projects';

export const configSchema = z.object({
  walletPass: z
    .object({
      webhookUrl: z.string(), // notify client about wallet pass installation and removal
      subscribedEvents: z.array(z.string()),
      google: z // google service account credentials
        .object({
          issuerId: z.string(),
          passTypeIdentifier: z.string(),
          passType: z.string(),
          credentials: z.any(),
        }),
      apple: z // apple certificate and key
        .object({
          teamIdentifier: z.string(),
          passTypeIdentifier: z.string(),
          passType: z.string(),
          cert: z.string(),
          key: z.string(),
          keySecret: z.string(),
        }),
    })
    .optional(),
});

export type ProjectConfig = z.infer<typeof configSchema>;

export async function findConfigByApiKey(dbService: DbService, apiKey: string) {
  const result = await dbService
    .db()
    .select({config: projects.config})
    .from(projects)
    .where(eq(projects.apiKey, apiKey))
    .limit(1);
  return result.length ? result[0] : undefined;
}

const configCache: {
  [apiKey: string]: ProjectConfig;
} = {};

export async function findConfig(dbService: DbService, apiKey: string) {
  if (configCache[apiKey]) {
    return configCache[apiKey];
  }

  const config = await dbService
    .db()
    .select({config: projects.config, project: projects.project})
    .from(projects)
    .where(eq(projects.apiKey, apiKey))
    .limit(1);

  if (!config.length) {
    throw new Error('No config found');
  }

  configCache[apiKey] = config[0].config as ProjectConfig;

  const iv = createIvByProject(config[0].project);

  if (configCache[apiKey].walletPass?.apple?.key) {
    configCache[apiKey].walletPass!.apple.key = decrypt(
      env.KEY_FOR_DB_CRYPTO,
      iv,
      configCache[apiKey].walletPass!.apple.key
    );
  }

  if (configCache[apiKey].walletPass?.google?.credentials?.private_key) {
    configCache[apiKey].walletPass!.google.credentials.private_key = decrypt(
      env.KEY_FOR_DB_CRYPTO,
      iv,
      configCache[apiKey].walletPass!.google.credentials.private_key
    );
  }

  return configCache[apiKey];
}

export function createIvByProject(project: string) {
  return ethers.utils.id(project).substring(2, 34);
}

export async function findProjectByProject(
  dbService: DbService,
  project: string
) {
  const result = await dbService
    .db()
    .select()
    .from(projects)
    .where(eq(projects.project, project))
    .limit(1);
  return result.length ? result[0] : undefined;
}

export async function findProjectById(dbService: DbService, id: number) {
  const result = await dbService
    .db()
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);

  return result.length ? result[0] : undefined;
}

export async function findProjectByApiKey(
  dbService: DbService,
  apiKey: string
) {
  const result = await dbService
    .db()
    .select()
    .from(projects)
    .where(eq(projects.apiKey, apiKey))
    .limit(1);

  return result.length ? result[0] : undefined;
}
