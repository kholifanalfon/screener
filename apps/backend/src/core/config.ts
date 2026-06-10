import dotenv from 'dotenv';
import path from 'path';

// Load .env from root
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config(); // fallback to local

export const config = {
  port: process.env.BE_PORT || process.env.PORT || 3000,
  env: process.env.BE_NODE_ENV || process.env.NODE_ENV || 'development',
  databaseUrl: process.env.BE_DATABASE_URL || process.env.DATABASE_URL || '',
  jwtSecret: process.env.BE_JWT_SECRET || 'super-secret-key-change-me',
};
