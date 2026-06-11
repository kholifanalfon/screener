import { StocksRepository } from './stocks.repository';

interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export class StocksService {
  private repository: StocksRepository;

  constructor() {
    this.repository = new StocksRepository();
  }

  async listStocks() {
    return this.repository.getAll();
  }

  async getStockDetails(ticker: string) {
    const stock = await this.repository.getByTicker(ticker);
    if (!stock) return null;

    // Generate price info
    const history = this.generateHistoricalData(ticker, 50); // 50 days of history
    const latest = history[history.length - 1];

    // Calculate indicators based on history
    const indicators = this.calculateIndicators(history);

    return {
      ...stock,
      price: latest.close,
      change: parseFloat((((latest.close - latest.open) / latest.open) * 100).toFixed(2)),
      high: latest.high,
      low: latest.low,
      volume: latest.volume,
      indicators,
      history,
    };
  }

  async screenStocks(filters: {
    sector?: string;
    minRsi?: number;
    maxRsi?: number;
    minPe?: number;
    maxPe?: number;
  }) {
    const allStocks = await this.repository.getAll();
    const results = [];

    for (const stock of allStocks) {
      if (filters.sector && stock.sector?.toLowerCase() !== filters.sector.toLowerCase()) {
        continue;
      }

      const details = await this.getStockDetails(stock.ticker);
      if (!details) continue;

      // Calculate a stable Mock P/E ratio based on ticker hash
      const peRatio = parseFloat((10 + (stock.ticker.charCodeAt(0) % 30) + 0.5).toFixed(1));
      const marketCap = (100 + (stock.ticker.charCodeAt(0) % 900)) * 1000000000; // in IDR/USD

      const rsi = details.indicators.rsi;

      if (filters.minRsi && rsi < filters.minRsi) continue;
      if (filters.maxRsi && rsi > filters.maxRsi) continue;
      if (filters.minPe && peRatio < filters.minPe) continue;
      if (filters.maxPe && peRatio > filters.maxPe) continue;

      results.push({
        ticker: stock.ticker,
        name: stock.name,
        sector: stock.sector,
        price: details.price,
        change: details.change,
        rsi: parseFloat(rsi.toFixed(1)),
        macd: parseFloat(details.indicators.macd.macdLine.toFixed(2)),
        peRatio,
        marketCap,
      });
    }

    return results;
  }

  // Helper to generate realistic historical stock data
  private generateHistoricalData(ticker: string, days: number): Candle[] {
    const candles: Candle[] = [];
    const seed = ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Base price determined by ticker characters (e.g. between 100 and 15000)
    let basePrice = 50 + (seed % 1000) * 10;
    if (basePrice < 100) basePrice = 150;

    const today = new Date();
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      const timeStr = date.toISOString().split('T')[0];

      // Add a pseudo-random price movement using sine waves + seed value
      const wave = Math.sin(i * 0.1 + seed) * (basePrice * 0.05);
      const trend = (days - i) * (basePrice * 0.002); // positive general trend
      const randomNoise = (Math.sin(i * 0.5 + seed * 2) + Math.cos(i * 0.8)) * (basePrice * 0.02);

      const close = parseFloat((basePrice + wave + trend + randomNoise).toFixed(2));
      const open = parseFloat((close - (Math.sin(i + seed) * (basePrice * 0.015))).toFixed(2));
      const high = parseFloat((Math.max(open, close) + Math.abs(Math.cos(i * 0.3)) * (basePrice * 0.01)).toFixed(2));
      const low = parseFloat((Math.min(open, close) - Math.abs(Math.sin(i * 0.4)) * (basePrice * 0.01)).toFixed(2));
      const volume = Math.floor(100000 + (seed % 50000) * 100 + Math.random() * 50000);

      candles.push({
        time: timeStr,
        open,
        high,
        low,
        close,
        volume,
      });
    }

    return candles;
  }

  // Calculate standard technical indicators
  private calculateIndicators(history: Candle[]) {
    const closes = history.map(c => c.close);
    const len = closes.length;

    // 1. Simple Moving Average (SMA 20)
    const smaPeriod = 20;
    let sma = closes[len - 1];
    if (len >= smaPeriod) {
      const sum = closes.slice(len - smaPeriod).reduce((acc, v) => acc + v, 0);
      sma = sum / smaPeriod;
    }

    // 2. Bollinger Bands (20, 2)
    let standardDeviation = 0;
    if (len >= smaPeriod) {
      const variance = closes.slice(len - smaPeriod).reduce((acc, v) => acc + Math.pow(v - sma, 2), 0) / smaPeriod;
      standardDeviation = Math.sqrt(variance);
    }
    const bbUpper = sma + 2 * standardDeviation;
    const bbLower = sma - 2 * standardDeviation;

    // 3. RSI (14)
    const rsiPeriod = 14;
    let rsi = 50; // default
    if (len > rsiPeriod) {
      let gains = 0;
      let losses = 0;
      for (let i = len - rsiPeriod; i < len; i++) {
        const diff = closes[i] - closes[i - 1];
        if (diff > 0) gains += diff;
        else losses -= diff;
      }
      const rs = gains / (losses || 1);
      rsi = 100 - 100 / (1 + rs);
    }

    // 4. MACD (12, 26, 9)
    const macdLine = (closes[len - 1] - closes[Math.max(0, len - 12)]) - (closes[len - 1] - closes[Math.max(0, len - 26)]);
    const signalLine = macdLine * 0.9; // simplified signal line

    return {
      sma: parseFloat(sma.toFixed(2)),
      bollingerBands: {
        upper: parseFloat(bbUpper.toFixed(2)),
        middle: parseFloat(sma.toFixed(2)),
        lower: parseFloat(bbLower.toFixed(2)),
      },
      rsi: parseFloat(rsi.toFixed(2)),
      macd: {
        macdLine: parseFloat(macdLine.toFixed(2)),
        signalLine: parseFloat(signalLine.toFixed(2)),
        histogram: parseFloat((macdLine - signalLine).toFixed(2)),
      },
    };
  }
}
