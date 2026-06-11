import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../../core/logger';

export interface ChatMessage {
  role: 'user' | 'model';
  parts: string;
}

export class AIService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.BE_GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    } else {
      logger.warn('⚠️ GEMINI_API_KEY/BE_GEMINI_API_KEY tidak dikonfigurasi. Respon AI akan menggunakan mode simulasi offline.');
    }
  }

  async chatWithAI(message: string, history: ChatMessage[] = []): Promise<string> {
    if (!this.genAI) {
      return this.getMockChatResponse(message);
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: `
          Anda adalah Asisten Trading AI profesional untuk Screener Trade.
          Tugas Anda adalah membantu pengguna (trader/investor) menganalisis pasar saham, memahami indikator teknikal/fundamental, dan menjawab pertanyaan seputar finansial dengan bijak.
          
          Panduan respon Anda:
          - Jawab dalam Bahasa Indonesia yang profesional dan mudah dimengerti.
          - Selalu sertakan peringatan risiko (disclaimer) bahwa analisis ini adalah opini edukatif, bukan nasihat keuangan mutlak.
          - Jika ditanya tentang ticker tertentu, cobalah berikan analisis berdasarkan indikator teknikal umum (RSI, MACD, MA).
        `,
      });

      // Konversi format history ke format SDK Gemini
      const geminiHistory = history.map(h => ({
        role: h.role,
        parts: [{ text: h.parts }],
      }));

      const chat = model.startChat({
        history: geminiHistory,
      });

      const result = await chat.sendMessage(message);
      return result.response.text();
    } catch (error) {
      logger.error(error, 'Error calling Gemini AI in chatWithAI');
      return 'Maaf, terjadi kesalahan koneksi saat berkomunikasi dengan asisten AI kami. Silakan coba sesaat lagi.';
    }
  }

  async analyzeStock(ticker: string, stockData: any): Promise<string> {
    if (!this.genAI) {
      return this.getMockStockAnalysis(ticker, stockData);
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: `
          Anda adalah Analis Saham Bersertifikasi (Financial Analyst AI).
          Tugas Anda adalah merangkum prospek saham berdasarkan data teknikal & fundamental yang dikirimkan oleh sistem dalam format ringkas, padat, dan terstruktur.
          
          Rangkum respon Anda dalam Markdown dengan bagian:
          1. **Ringkasan Kondisi**: (Pilihan: Bullish / Bearish / Sideways beserta alasannya dalam 2-3 kalimat)
          2. **Analisis Teknikal**: (Bahas RSI, MACD, dan Bollinger Bands dari data yang dikirimkan)
          3. **Analisis Fundamental**: (Bahas valuasi P/E Ratio dan Market Cap)
          4. **Rekomendasi & Level Kunci**: (Sebutkan level support/resistance estimasi, level TP/SL hipotetis, dan tindakan beli/tahan/jual)
          
          Gunakan Bahasa Indonesia yang lugas dan berikan disclaimer hukum di akhir.
        `,
      });

      const prompt = `
        Minta analisis lengkap untuk saham:
        Ticker: ${ticker}
        Nama: ${stockData.name}
        Sektor: ${stockData.sector}
        Harga Terkini: Rp ${stockData.price?.toLocaleString('id-ID')}
        Perubahan Harian: ${stockData.change}%
        
        Indikator Teknikal:
        - RSI (14): ${stockData.indicators?.rsi}
        - MACD Line: ${stockData.indicators?.macd?.macdLine} (Signal: ${stockData.indicators?.macd?.signalLine})
        - SMA (20): ${stockData.indicators?.sma}
        - Bollinger Bands Upper: ${stockData.indicators?.bollingerBands?.upper}, Lower: ${stockData.indicators?.bollingerBands?.lower}
        
        Data Fundamental:
        - P/E Ratio: ${stockData.peRatio}x
        - Market Cap: Rp ${stockData.marketCap?.toLocaleString('id-ID')}
      `;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      logger.error(error, `Error calling Gemini AI in analyzeStock for ${ticker}`);
      return this.getMockStockAnalysis(ticker, stockData);
    }
  }

  private getMockChatResponse(message: string): string {
    const msgLower = message.toLowerCase();
    if (msgLower.includes('rsi')) {
      return `[Mode Simulasi Offline] RSI (Relative Strength Index) adalah indikator momentum untuk mengukur kecepatan dan perubahan pergerakan harga. Nilai di atas 70 menunjukkan kondisi Overbought (jenuh beli / potensi koreksi turun), sedangkan di bawah 30 menunjukkan Oversold (jenuh jual / potensi rebound naik).`;
    }
    if (msgLower.includes('macd')) {
      return `[Mode Simulasi Offline] MACD (Moving Average Convergence Divergence) digunakan untuk mengidentifikasi momentum tren baru. Jika garis MACD memotong ke atas garis sinyal (Golden Cross), itu adalah sinyal bullish. Sebaliknya jika memotong ke bawah (Death Cross), itu sinyal bearish.`;
    }
    return `[Mode Simulasi Offline] Halo! Saya adalah Asisten Trading AI. Saat ini saya berjalan dalam mode offline karena kunci API Gemini belum dikonfigurasi. Anda dapat bertanya tentang konsep trading dasar seperti RSI, MACD, atau Bollinger Bands.`;
  }

  private getMockStockAnalysis(ticker: string, stockData: any): string {
    const isBullish = stockData.change >= 0;
    const rsiText = stockData.indicators?.rsi > 70 ? 'Overbought' : stockData.indicators?.rsi < 30 ? 'Oversold' : 'Neutral';
    return `
### 🤖 Laporan Analisis AI Terkomputerisasi (Offline Mode) untuk **${ticker}** - **${stockData.name}**

1. **Ringkasan Kondisi**: 
   Saham ${ticker} saat ini menunjukkan sentimen **${isBullish ? 'BULLISH' : 'BEARISH'}** jangka pendek dengan kenaikan harian sebesar ${stockData.change}%.

2. **Analisis Teknikal**:
   * **RSI (14)** berada pada level **${stockData.indicators?.rsi}** yang tergolong **${rsiText}**.
   * **MACD** menunjukkan histogram berada pada **${stockData.indicators?.macd?.histogram}** yang mencerminkan momentum pergerakan ${isBullish ? 'positif/akumulasi' : 'negatif/distribusi'}.
   * Harga saat ini berada di kisaran Rp ${stockData.price?.toLocaleString('id-ID')}, diperdagangkan dekat garis rata-rata SMA 20 (Rp ${stockData.indicators?.sma?.toLocaleString('id-ID')}).

3. **Analisis Fundamental**:
   * Rasio **P/E (Price-to-Earnings)** berada pada tingkat sehat **${stockData.peRatio}x** dengan total kapitalisasi pasar sebesar Rp ${stockData.marketCap?.toLocaleString('id-ID')}.

4. **Rekomendasi & Level Kunci**:
   * **Rekomendasi**: ${isBullish ? 'BUY ON WEAKNESS' : 'HOLD / WAIT AND SEE'}
   * **Target Harga (TP)**: Rp ${(stockData.price * 1.08).toFixed(0)}
   * **Batasan Risiko (SL)**: Rp ${(stockData.price * 0.95).toFixed(0)}

*Disclaimer: Analisis ini disimulasikan secara offline. Investasi saham mengandung risiko tinggi. Lakukan riset mandiri Anda sebelum bertransaksi.*
    `;
  }
}
