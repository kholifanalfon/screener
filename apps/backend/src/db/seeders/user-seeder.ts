import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../generator';

export async function run(db: NodePgDatabase<typeof schema>) {
  console.log('🌱 Menjalankan seeder untuk user-seeder...');
  
  // TODO: Hapus/komentari baris ini jika tidak ingin mengosongkan tabel
  await db.delete(schema.users);
  
  // TODO: Masukkan data dummy Anda di sini
  await db.insert(schema.users).values([
    { name: 'Data Dummy 1' },
    { name: 'Data Dummy 2' }
  ]);
}
