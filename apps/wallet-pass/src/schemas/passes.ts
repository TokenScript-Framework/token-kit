import {
  index,
  jsonb,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const passes = pgTable(
  'wallet_pass_passes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    passTypeIdentifier: varchar('pass_type_identifier', {
      length: 100,
    }).notNull(),
    serialNumber: varchar('serial_number', {length: 300}).notNull(),
    createdAt: timestamp('created_at', {
      precision: 6,
      withTimezone: true,
    }).defaultNow(),
    updatedAt: timestamp('updated_at', {
      precision: 6,
      withTimezone: true,
    }).defaultNow(),
    json: jsonb('json'),
    lastScannedAt: timestamp('last_scanned_at', {
      precision: 6,
      withTimezone: true,
    }),
    platform: varchar('platform', {length: 10}).notNull(),
    templateId: varchar('template_id', {length: 50}).notNull(),
    expiredAt: timestamp('expired_at', {
      precision: 6,
      withTimezone: true,
    }),
    expireAction: varchar('expire_action', {length: 50}),
    externalId: varchar('external_id', {length: 100}).notNull(),
    barcodeUrl: varchar('barcode_url', {length: 500}),
    apiKey: varchar('api_key', {length: 200}).notNull(),
  },
  table => {
    return {
      uniquePlatformPassTypeIdentifierSerialNumber: uniqueIndex(
        'unique_platform_pass_type_identifier_serial_number'
      ).on(table.platform, table.passTypeIdentifier, table.serialNumber),
      uniqueTemplateIdExternalId: uniqueIndex(
        'unique_template_id_external_id'
      ).on(table.templateId, table.externalId),
      indexCreatedAt: index('index_created_at').on(table.createdAt),
      indexPassTypeIdentifierUpdatedAt: index(
        'index_pass_type_identifier_updated_at'
      ).on(table.passTypeIdentifier, table.updatedAt),
    };
  }
);
