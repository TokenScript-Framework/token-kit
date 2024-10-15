import {jsonb, pgTable, smallint, varchar} from 'drizzle-orm/pg-core';

export const walletPassQueue = pgTable('api_wallet_pass_queue', {
  // external id for wallet pass
  id: varchar('id', {length: 100}).primaryKey(),
  apiKey: varchar('api_key', {length: 200}).notNull(),
  jobType: varchar('job_type', {length: 10}).notNull(),
  params: jsonb('params').notNull(),
  callbackUrl: varchar('callback_url', {length: 200}),
  done: smallint('done').notNull().default(-1),
});
