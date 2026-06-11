import { pgTable, serial, integer, numeric, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { stocks } from './stocks';

export const recaps = pgTable('recaps', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  stockId: integer('stock_id').references(() => stocks.id, { onDelete: 'cascade' }).notNull(),
  type: text('type').notNull(), // 'buy' | 'sell'
  price: numeric('price', { precision: 15, scale: 4 }).notNull(),
  quantity: integer('quantity').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
