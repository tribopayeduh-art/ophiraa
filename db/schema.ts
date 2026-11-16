import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const gatewaySecrets = sqliteTable('gateway_secrets', {
  provider: text().primaryKey(),
  ciphertext: text().notNull(),
  iv: text().notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const withdrawalFeeSettings = sqliteTable('withdrawal_fee_settings', {
  id: text().primaryKey(),
  rules: text().notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const depositFunnelSettings = sqliteTable('deposit_funnel_settings', {
  id: text().primaryKey(),
  funnels: text().notNull(),
  updatedAt: text('updated_at').notNull(),
});
