import { api } from '@/shared/config/axios';
import type { Stock, StockDetails, ScreenedStock, StocksApiResponse } from '@/features/stocks/types/stocks.types';

export const stocksApi = {
  list: async (): Promise<StocksApiResponse<Stock[]>> => {
    const response = await api.get('/stocks');
    return response.data;
  },

  getDetails: async (ticker: string): Promise<StocksApiResponse<StockDetails>> => {
    const response = await api.get(`/stocks/${ticker}`);
    return response.data;
  },

  screen: async (filters: {
    sector?: string;
    minRsi?: number;
    maxRsi?: number;
    minPe?: number;
    maxPe?: number;
  }): Promise<StocksApiResponse<ScreenedStock[]>> => {
    const response = await api.get('/stocks/screener', { params: filters });
    return response.data;
  },
};
