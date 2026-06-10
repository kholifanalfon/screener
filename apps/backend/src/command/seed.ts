import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { config } from '../core/config';
import { logger } from '../core/logger';
import * as schema from '../db/generator'; // Import seluruh skema

const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 1, // Hanya butuh 1 koneksi untuk proses seed
});

const db = drizzle(pool, { schema });

async function main() {
  if (config.env === 'production') {
    logger.error('❌ FATAL: Proses Seeding diblokir di environment Production!');
    process.exit(1);
  }

  const seedersDir = path.join(__dirname, '../db/seeders');
  
  if (!fs.existsSync(seedersDir)) {
    logger.info('⚠️ Folder seeders belum ada. Jalankan "bun run db:make:seed [nama]" terlebih dahulu.');
    process.exit(0);
  }

  // Membaca dan mengurutkan file secara alfabetikal agar eksekusi berurutan (misal: 01-users.seeder.ts)
  const files = fs.readdirSync(seedersDir)
    .filter(f => f.endsWith('.seeder.ts'))
    .sort();

  if (files.length === 0) {
    logger.info('⚠️ Tidak ada file seeder yang ditemukan di folder src/db/seeders.');
    process.exit(0);
  }

  logger.info('🌱 Memulai eksekusi Seeder Database massal...');

  try {
    for (const file of files) {
      const seederPath = path.join(seedersDir, file);
      
      // Dynamic import file seeder
      const seeder = await import(seederPath);
      
      if (typeof seeder.run === 'function') {
        logger.info(`▶️ Mengeksekusi: ${file}`);
        await seeder.run(db);
        logger.info(`✅ Selesai: ${file}`);
      } else {
        logger.warn(`⚠️ File ${file} dilewati karena tidak memiliki fungsi 'export async function run(db)'`);
      }
    }
    logger.info('🎉 Seluruh proses seeding database berhasil diselesaikan!');
  } catch (error) {
    logger.error(error, '❌ Terjadi kesalahan saat mengeksekusi seeder');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
