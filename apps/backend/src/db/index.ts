import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { config } from '../core/config';
import * as schema from './generator';
import { logger } from '../core/logger';

// Create a connection pool for Drizzle ORM
// Using Enterprise Connection Pooling best practices
const pool = new Pool({
  connectionString: config.databaseUrl,
  // Configure pool size based on your deployment size (PgBouncer friendly)
  max: 20, 
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  logger.error(err, 'Unexpected error on idle database client');
  process.exit(-1);
});

export const db = drizzle(pool, { schema });
