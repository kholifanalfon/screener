import { pgTable, serial, integer, numeric, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { stocks } from './stocks';

export const portfolios = pgTable('portfolios', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  stockId: integer('stock_id').references(() => stocks.id, { onDelete: 'cascade' }).notNull(),
  buyPrice: numeric('buy_price', { precision: 15, scale: 4 }).notNull(),
  quantity: integer('quantity').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
