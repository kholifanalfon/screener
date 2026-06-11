import { Request, Response } from 'express';
import { StocksService } from './stocks.service';

const stocksService = new StocksService();

export class StocksController {
  static async list(req: Request, res: Response) {
    try {
      const list = await stocksService.listStocks();
      return res.json({
        status: 'success',
        data: list,
      });
    } catch (error: any) {
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Gagal memuat daftar saham.',
      });
    }
  }

  static async getDetails(req: Request, res: Response) {
    try {
      const { ticker } = req.params;
      const details = await stocksService.getStockDetails(ticker);
      if (!details) {
        return res.status(404).json({
          status: 'error',
          message: `Saham dengan ticker ${ticker} tidak ditemukan.`,
        });
      }
      return res.json({
        status: 'success',
        data: details,
      });
    } catch (error: any) {
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Gagal memuat detail saham.',
      });
    }
  }

  static async screen(req: Request, res: Response) {
    try {
      const { sector, minRsi, maxRsi, minPe, maxPe } = req.query;
      const parsedFilters = {
        sector: sector ? String(sector) : undefined,
        minRsi: minRsi ? Number(minRsi) : undefined,
        maxRsi: maxRsi ? Number(maxRsi) : undefined,
        minPe: minPe ? Number(minPe) : undefined,
        maxPe: maxPe ? Number(maxPe) : undefined,
      };

      const screened = await stocksService.screenStocks(parsedFilters);
      return res.json({
        status: 'success',
        data: screened,
      });
    } catch (error: any) {
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Gagal memproses screening saham.',
      });
    }
  }
}
