import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { config } from '../core/config';
import { logger } from '../core/logger';

const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 1, // Only 1 connection needed for migrations
});

const db = drizzle(pool);

async function main() {
  logger.info('Running database migrations...');
  try {
    await migrate(db, { migrationsFolder: './src/db/migrations' });
    logger.info('Database migrations completed successfully');
  } catch (error) {
    logger.error(error, 'Error running database migrations');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
