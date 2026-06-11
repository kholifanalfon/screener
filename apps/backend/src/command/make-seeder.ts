import fs from 'fs';
import path from 'path';

// Mendapatkan argumen nama seeder dari terminal
const seedName = process.argv[2];

if (!seedName) {
  console.error("❌ Tolong masukkan nama seeder. Contoh: bun run db:make:seed users");
  process.exit(1);
}

// Memastikan format nama file adalah kebab-case
const kebabCaseName = seedName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
// Mengubah menjadi camelCase untuk referensi schema
const camelCaseName = kebabCaseName.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

const seedersDir = path.join(__dirname, '../db/seeders');
// Agar urutan eksekusi seeder dapat diatur (jika ada relasi tabel), 
// kita bisa gunakan prefix angka opsional, tapi defaultnya kebab-case
const seederFilePath = path.join(seedersDir, `${kebabCaseName}.seeder.ts`);

if (!fs.existsSync(seedersDir)) {
  fs.mkdirSync(seedersDir, { recursive: true });
}

if (fs.existsSync(seederFilePath)) {
  console.error(`❌ Seeder ${kebabCaseName}-seed.ts sudah ada!`);
  process.exit(1);
}

const boilerplate = `import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../generator';

export async function run(db: NodePgDatabase<typeof schema>) {
  console.log('🌱 Menjalankan seeder untuk ${kebabCaseName}...');
  
  // TODO: Hapus/komentari baris ini jika tidak ingin mengosongkan tabel
  // await db.delete(schema.${camelCaseName});
  
  // TODO: Masukkan data dummy Anda di sini
  // await db.insert(schema.${camelCaseName}).values([
  //   { name: 'Data Dummy 1' },
  //   { name: 'Data Dummy 2' }
  // ]);
}
`;

fs.writeFileSync(seederFilePath, boilerplate, 'utf8');
console.log(`✅ File seeder berhasil dibuat di: src/db/seeders/${kebabCaseName}.seeder.ts`);
