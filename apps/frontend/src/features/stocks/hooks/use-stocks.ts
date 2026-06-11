import { useQuery } from '@tanstack/react-query';
import { stocksApi } from '../services/stocks.api';
import { stocksKeys } from '../stocks.keys';
import type { Stock, StockDetails, ScreenedStock } from '../types/stocks.types';

export function useListStocks() {
  return useQuery<Stock[]>({
    queryKey: stocksKeys.lists(),
    queryFn: async () => {
      const response = await stocksApi.list();
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 menit cache
  });
}

export function useStockDetails(ticker: string) {
  return useQuery<StockDetails | null>({
    queryKey: stocksKeys.details(ticker),
    queryFn: async () => {
      if (!ticker) return null;
      const response = await stocksApi.getDetails(ticker);
      return response.data;
    },
    enabled: !!ticker,
    staleTime: 30 * 1000, // 30 detik untuk real-time price info
  });
}

export function useScreenStocks(filters: {
  sector?: string;
  minRsi?: number;
  maxRsi?: number;
  minPe?: number;
  maxPe?: number;
}) {
  return useQuery<ScreenedStock[]>({
    queryKey: stocksKeys.screener(filters),
    queryFn: async () => {
      const response = await stocksApi.screen(filters);
      return response.data;
    },
    staleTime: 60 * 1000, // 1 menit untuk cache screener
  });
}
