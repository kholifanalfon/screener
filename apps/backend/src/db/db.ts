import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { config } from '../core/config';
import { logger } from '../core/logger';

const pool = new Pool({
  connectionString: config.databaseUrl || 'postgres://postgres:password@localhost:5432/screener_trade',
});

pool.on('error', (err) => {
  logger.error('Unexpected database error on idle client', err);
});

export const db = drizzle(pool);
