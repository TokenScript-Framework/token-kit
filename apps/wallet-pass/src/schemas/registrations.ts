import {index, pgTable, timestamp, uuid} from 'drizzle-orm/pg-core';

export const registrations = pgTable(
  'wallet_pass_registrations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    deviceId: uuid('device_id'),
    passId: uuid('pass_id').notNull(),
    createdAt: timestamp('created_at', {
      precision: 6,
      withTimezone: true,
    }).defaultNow(),
    updatedAt: timestamp('updated_at', {
      precision: 6,
      withTimezone: true,
    }).defaultNow(),
    deletedAt: timestamp('deleted_at', {
      precision: 6,
      withTimezone: true,
    }),
  },
  table => {
    return {
      indexPassIdDeviceIdDeletedAt: index(
        'index_pass_id_device_id_deleted_at'
      ).on(table.passId, table.deviceId, table.deletedAt),
    };
  }
);
