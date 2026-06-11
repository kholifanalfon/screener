import { pgTable, serial, integer, text, numeric, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).unique().notNull(),
  apiKeyFinnhub: text('api_key_finnhub'),
  apiKeyGemini: text('api_key_gemini'),
  defaultTp: numeric('default_tp', { precision: 5, scale: 2 }),
  defaultSl: numeric('default_sl', { precision: 5, scale: 2 }),
  aiModel: text('ai_model').default('gemini-1.5-flash'),
  targetIndex: text('target_index').default('^JKSE'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
