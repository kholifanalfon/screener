import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const stocks = pgTable('stocks', {
  id: serial('id').primaryKey(),
  ticker: text('ticker').unique().notNull(),
  name: text('name').notNull(),
  sector: text('sector'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
