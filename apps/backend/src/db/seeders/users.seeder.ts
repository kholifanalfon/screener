import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../generator';

export async function run(db: NodePgDatabase<typeof schema>) {
  console.log('🌱 Menjalankan seeder untuk users...');
  
  // Kosongkan tabel users terlebih dahulu
  await db.delete(schema.users);
  
  // Buat hash password
  const adminPasswordHash = await Bun.password.hash('admin123', {
    algorithm: 'bcrypt',
    cost: 10
  });
  const userPasswordHash = await Bun.password.hash('user123', {
    algorithm: 'bcrypt',
    cost: 10
  });

  // Masukkan data seeder
  await db.insert(schema.users).values([
    {
      email: 'admin@screener.com',
      passwordHash: adminPasswordHash,
      fullName: 'Admin Screener',
      role: 'admin',
    },
    {
      email: 'user@screener.com',
      passwordHash: userPasswordHash,
      fullName: 'Regular User',
      role: 'user',
    }
  ]);

  console.log('✅ Seeder users selesai dijalankan!');
}
