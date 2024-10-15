import {index, jsonb, pgTable, varchar} from 'drizzle-orm/pg-core';

export const walletPasses = pgTable(
  'api_wallet_passes',
  {
    // external id for wallet pass
    id: varchar('id', {length: 100}).primaryKey(),
    apiKey: varchar('api_key', {length: 200}).notNull(),
    result: jsonb('details').notNull(),
  },
  table => {
    return {
      apiKeyIndex: index('idx_api_key_wallet_pass').on(table.apiKey),
    };
  }
);
