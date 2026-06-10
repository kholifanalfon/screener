import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import path from 'path';

// Load the root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

if (!process.env.BE_DATABASE_URL) {
  throw new Error('BE_DATABASE_URL environment variable is missing');
}

export default defineConfig({
  schema: './src/db/generator/*.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.BE_DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
