import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { config } from '../../core/config';
import * as schema from '../../db/generator';
import { stocks } from '../../db/generator/stocks';

const pool = new Pool({
  connectionString: config.databaseUrl,
});

const db = drizzle(pool, { schema });

export class StocksRepository {
  async getAll() {
    return db.select().from(stocks);
  }

  async getByTicker(ticker: string) {
    const results = await db
      .select()
      .from(stocks)
      .where(eq(stocks.ticker, ticker.toUpperCase()));
    return results[0] || null;
  }

  async create(ticker: string, name: string, sector: string) {
    const results = await db
      .insert(stocks)
      .values({
        ticker: ticker.toUpperCase(),
        name,
        sector,
      })
      .returning();
    return results[0];
  }
}
