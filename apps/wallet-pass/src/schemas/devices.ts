import {
  index,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const devices = pgTable(
  'wallet_pass_devices',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    deviceLibraryIdentifier: varchar('device_library_identifier', {
      length: 50,
    }).notNull(),
    pushToken: varchar('push_token', {length: 100}).notNull(),
    createdAt: timestamp('created_at', {
      precision: 6,
      withTimezone: true,
    }).defaultNow(),
    updatedAt: timestamp('updated_at', {
      precision: 6,
      withTimezone: true,
    }).defaultNow(),
    platform: varchar('platform', {length: 10}).notNull(),
  },
  table => {
    return {
      uniquePlatformDeviceLibraryIdentifier: uniqueIndex(
        'unique_platform_device_library_identifier'
      ).on(table.platform, table.deviceLibraryIdentifier),
      indexCreatedAt: index('index_created_at').on(table.createdAt),
    };
  }
);
