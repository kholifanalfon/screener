export interface Stock {
  id: number;
  ticker: string;
  name: string;
  sector: string;
  createdAt: string;
}

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BollingerBands {
  upper: number;
  middle: number;
  lower: number;
}

export interface Macd {
  macdLine: number;
  signalLine: number;
  histogram: number;
}

export interface TechnicalIndicators {
  sma: number;
  bollingerBands: BollingerBands;
  rsi: number;
  macd: Macd;
}

export interface StockDetails extends Stock {
  price: number;
  change: number;
  high: number;
  low: number;
  volume: number;
  indicators: TechnicalIndicators;
  history: Candle[];
}

export interface ScreenedStock {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  rsi: number;
  macd: number;
  peRatio: number;
  marketCap: number;
}

export interface StocksApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}
