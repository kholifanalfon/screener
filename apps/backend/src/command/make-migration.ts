import fs from 'fs';
import path from 'path';

// Mendapatkan argumen nama tabel dari terminal
const tableName = process.argv[2];

if (!tableName) {
  console.error("❌ Tolong masukkan nama tabel. Contoh: bun run db:make users");
  process.exit(1);
}

// Memastikan format nama file adalah kebab-case
const kebabCaseName = tableName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

// Mengubah menjadi camelCase untuk nama variabel tabel
const camelCaseName = kebabCaseName.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

const generatorDir = path.join(__dirname, '../db/generator');
const modelFilePath = path.join(generatorDir, `${kebabCaseName}-migration.ts`);
const schemaIndexFilePath = path.join(generatorDir, 'index.ts');

// 1. Buat folder generator jika belum ada
if (!fs.existsSync(generatorDir)) {
  fs.mkdirSync(generatorDir, { recursive: true });
}

// 2. Buat file model dengan boilerplate Drizzle
if (fs.existsSync(modelFilePath)) {
  console.error(`❌ Model ${kebabCaseName}.ts sudah ada di folder generator!`);
  process.exit(1);
}

const boilerplate = `import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const ${camelCaseName} = pgTable('${kebabCaseName}', {
  id: serial('id').primaryKey(),
  
  // TODO: Tambahkan kolom-kolom tabel Anda di sini
  name: text('name').notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
`;

fs.writeFileSync(modelFilePath, boilerplate, 'utf8');
console.log(`✅ File model berhasil dibuat di: src/db/generator/${kebabCaseName}.ts`);

// 3. Tambahkan (export) model tersebut ke src/db/generator/index.ts
const exportStatement = `export * from './${kebabCaseName}';\n`;

let schemaContent = '';
if (fs.existsSync(schemaIndexFilePath)) {
  schemaContent = fs.readFileSync(schemaIndexFilePath, 'utf8');
} else {
  fs.writeFileSync(schemaIndexFilePath, '// Auto-generated Schema Hub\n', 'utf8');
  schemaContent = fs.readFileSync(schemaIndexFilePath, 'utf8');
}

if (!schemaContent.includes(exportStatement)) {
  fs.appendFileSync(schemaIndexFilePath, exportStatement, 'utf8');
  console.log(`✅ Model berhasil di-export ke src/db/generator/index.ts`);
} else {
  console.log(`⚠️ Model sudah ada di src/db/generator/index.ts`);
}

console.log(`\n🎉 Selesai! Jangan lupa jalankan 'bun run db:generate' setelah memodifikasi skema kolom.`);
