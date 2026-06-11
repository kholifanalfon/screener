import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../core/config';
import { logger } from '../core/logger';
import * as schema from '../db/generator';
import { stocks } from '../db/generator/stocks';

const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 1,
});

const db = drizzle(pool, { schema });

async function syncStocks() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.BE_GEMINI_API_KEY;
  if (!apiKey) {
    logger.error('❌ GEMINI_API_KEY atau BE_GEMINI_API_KEY tidak ditemukan di environment variables!');
    process.exit(1);
  }

  logger.info('🤖 Menghubungi Gemini AI untuk menganalisis dan merekomendasikan saham-saham yang profit...');

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      Hasilkan daftar 10 saham teratas (bisa campuran antara saham Indonesia IHSG seperti BBCA, TLKM, ASII, BMRI, BBNI, UNVR dan saham global populer seperti NVDA, AAPL, MSFT, TSLA, AMZN) yang memiliki performa profit/keuntungan positif atau paling diunggulkan dalam beberapa hari terakhir.
      
      Format keluaran harus berupa JSON Array murni yang berisi objek dengan properti persis seperti berikut:
      [
        { "ticker": "BBCA", "name": "Bank Central Asia Tbk", "sector": "Financials" },
        { "ticker": "NVDA", "name": "NVIDIA Corporation", "sector": "Technology" }
      ]
      
      Aturan sangat penting:
      - Jangan menyertakan penjelasan teks apa pun sebelum atau sesudah JSON.
      - Jangan gunakan markdown code block (seperti \`\`\`json atau \`\`\`).
      - Berikan string JSON mentah yang valid dan dapat langsung di-parse menggunakan JSON.parse().
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Bersihkan kemungkinan output markdown code block
    const cleanJson = responseText.replace(/```json|```/gi, '').trim();
    
    logger.info('Parsing data rekomendasi dari Gemini...');
    const recommendedStocks = JSON.parse(cleanJson);

    if (!Array.isArray(recommendedStocks) || recommendedStocks.length === 0) {
      throw new Error('Format respon Gemini bukan merupakan array atau kosong.');
    }

    logger.info(`Menyinkronkan ${recommendedStocks.length} saham ke database...`);

    let insertedCount = 0;
    let skippedCount = 0;

    for (const stockItem of recommendedStocks) {
      if (!stockItem.ticker || !stockItem.name) {
        logger.warn(`Dilewati karena data tidak lengkap: ${JSON.stringify(stockItem)}`);
        skippedCount++;
        continue;
      }

      // Upsert / Insert ignore
      const existing = await db.query.stocks.findFirst({
        where: (s, { eq }) => eq(s.ticker, stockItem.ticker),
      });

      if (!existing) {
        await db.insert(stocks).values({
          ticker: stockItem.ticker.toUpperCase(),
          name: stockItem.name,
          sector: stockItem.sector || 'General',
        });
        insertedCount++;
        logger.info(`✨ Saham ditambahkan: ${stockItem.ticker} - ${stockItem.name}`);
      } else {
        skippedCount++;
        logger.info(`ℹ️ Saham sudah ada, dilewati: ${stockItem.ticker}`);
      }
    }

    logger.info(`🎉 Proses sinkronisasi selesai! Berhasil menambahkan ${insertedCount} saham baru, melewatkan ${skippedCount} saham.`);
  } catch (error) {
    logger.error(error, '❌ Terjadi kesalahan saat sinkronisasi saham');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

syncStocks();
