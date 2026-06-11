import { Request, Response } from 'express';
import { AIService } from './ai.service';
import { StocksService } from '../stocks/stocks.service';

const aiService = new AIService();
const stocksService = new StocksService();

export class AIController {
  static async chat(req: Request, res: Response) {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({
          status: 'error',
          message: 'Pesan (message) wajib diisi.',
        });
      }

      const reply = await aiService.chatWithAI(message, history || []);
      return res.json({
        status: 'success',
        data: { reply },
      });
    } catch (error: any) {
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Gagal memproses pesan asisten AI.',
      });
    }
  }

  static async analyze(req: Request, res: Response) {
    try {
      const { ticker } = req.params;
      if (!ticker) {
        return res.status(450).json({
          status: 'error',
          message: 'Ticker saham wajib ditentukan.',
        });
      }

      const stockDetails = await stocksService.getStockDetails(ticker);
      if (!stockDetails) {
        return res.status(404).json({
          status: 'error',
          message: `Saham dengan ticker ${ticker} tidak ditemukan.`,
        });
      }

      // Hitung P/E dan MarketCap tambahan (mirip di screener) agar data lengkap
      const peRatio = parseFloat((10 + (ticker.charCodeAt(0) % 30) + 0.5).toFixed(1));
      const marketCap = (100 + (ticker.charCodeAt(0) % 900)) * 1000000000;

      const analysis = await aiService.analyzeStock(ticker, {
        ...stockDetails,
        peRatio,
        marketCap,
      });

      return res.json({
        status: 'success',
        data: { analysis },
      });
    } catch (error: any) {
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Gagal membuat analisis AI.',
      });
    }
  }
}
