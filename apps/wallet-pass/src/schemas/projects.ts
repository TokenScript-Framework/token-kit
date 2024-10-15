import {
  bigint,
  jsonb,
  pgTable,
  serial,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

export const projects = pgTable(
  'api_projects',
  {
    id: serial('id').primaryKey(),
    apiKey: varchar('api_key', {length: 200}).notNull(),
    project: varchar('project', {length: 50}).notNull(),
    config: jsonb('config'),
    createdAt: bigint('created_at', {mode: 'number'}).notNull(),
  },
  table => {
    return {
      uniqueApiKey: uniqueIndex('unique_api_key_config').on(table.apiKey),
      uniqueProject: uniqueIndex('unique_project_config').on(table.project),
    };
  }
);
