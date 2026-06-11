import { useState } from 'react';
import { useScreenStocks, useStockDetails } from '@/features/stocks/hooks/use-stocks';
import { useAIAnalyzeStock } from '@/features/ai/hooks/use-ai';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  SlidersHorizontal,
  Search,
  X,
  LineChart,
  Sparkles,
  Bot,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

function StockDetailModal({ ticker, onClose }: { ticker: string; onClose: () => void }) {
  const { data: details, isLoading } = useStockDetails(ticker);
  const aiAnalyzeMutation = useAIAnalyzeStock();
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm animate-pulse">Memuat analisis AI & indikator teknikal...</p>
        </div>
      </div>
    );
  }

  if (!details) return null;

  const isProfit = details.change >= 0;

  const handleRequestAIAnalysis = () => {
    aiAnalyzeMutation.mutate(ticker, {
      onSuccess: (data) => {
        setAiAnalysis(data.analysis);
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-850 pb-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md font-bold text-lg tracking-wide">
                  {details.ticker}
                </span>
                <h2 className="text-2xl font-bold text-slate-100">{details.name}</h2>
              </div>
              <p className="text-sm text-slate-400 mt-1">{details.sector}</p>
            </div>

            <div className="text-left md:text-right flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4 w-full md:w-auto">
              <div>
                <div className="text-3xl font-extrabold text-slate-100 tracking-tight">
                  {details.price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }).replace('IDR', 'Rp ')}
                </div>
                <div className={`flex items-center gap-1 mt-1 text-sm font-semibold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>
                    {isProfit ? '+' : ''}
                    {details.change}%
                  </span>
                </div>
              </div>

              <Button
                onClick={handleRequestAIAnalysis}
                disabled={aiAnalyzeMutation.isPending}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold flex items-center gap-2 shadow-lg shadow-indigo-950/40 text-xs py-1.5 h-9"
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                {aiAnalyzeMutation.isPending ? 'Menganalisis...' : 'Analisis dengan Gemini AI'}
              </Button>
            </div>
          </div>

          {/* AI Analysis Result Section */}
          {(aiAnalysis || aiAnalyzeMutation.isPending) && (
            <div className="bg-indigo-950/10 border border-indigo-500/20 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <Bot className="w-5 h-5" />
                Asisten Analis Keuangan AI (Gemini 1.5 Flash)
              </div>
              {aiAnalyzeMutation.isPending ? (
                <div className="flex items-center gap-3 text-slate-400 text-xs py-2">
                  <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Sedang memproses seluruh data teknikal dan fundamental untuk menyusun laporan...</span>
                </div>
              ) : (
                <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line prose prose-invert max-w-none">
                  {aiAnalysis}
                </div>
              )}
            </div>
          )}

          {/* Chart & Indicators */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                  <LineChart className="w-4 h-4 text-indigo-400" />
                  Grafik Pergerakan Harga (50 Hari Terakhir)
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={details.history}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={isProfit ? '#10b981' : '#ef4444'} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={isProfit ? '#10b981' : '#ef4444'} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                      <YAxis domain={['auto', 'auto']} stroke="#64748b" fontSize={11} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
                        labelStyle={{ color: '#94a3b8' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="close"
                        stroke={isProfit ? '#10b981' : '#ef4444'}
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Technical & Fundamental Indicators */}
            <div className="space-y-4">
              <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Indikator Teknikal (14 Hari)
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                    <span className="text-xs text-slate-400 block">RSI (14)</span>
                    <span className="text-lg font-bold text-slate-100">{details.indicators.rsi}</span>
                    <span className={`text-[10px] block font-semibold mt-0.5 ${
                      details.indicators.rsi > 70 ? 'text-red-400' : details.indicators.rsi < 30 ? 'text-emerald-400' : 'text-slate-400'
                    }`}>
                      {details.indicators.rsi > 70 ? 'Overbought' : details.indicators.rsi < 30 ? 'Oversold' : 'Neutral'}
                    </span>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                    <span className="text-xs text-slate-400 block">MACD Histogram</span>
                    <span className="text-lg font-bold text-slate-100">{details.indicators.macd.histogram}</span>
                    <span className={`text-[10px] block font-semibold mt-0.5 ${
                      details.indicators.macd.histogram >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {details.indicators.macd.histogram >= 0 ? 'Bullish' : 'Bearish'}
                    </span>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                    <span className="text-xs text-slate-400 block">SMA (20)</span>
                    <span className="text-md font-bold text-slate-100">
                      {details.indicators.sma.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }).replace('IDR', 'Rp ')}
                    </span>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                    <span className="text-xs text-slate-400 block">Bollinger Upper</span>
                    <span className="text-md font-bold text-slate-100">
                      {details.indicators.bollingerBands.upper.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }).replace('IDR', 'Rp ')}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-850 pt-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Harga Tertinggi Harian</span>
                    <span className="font-bold text-slate-200">
                      {details.high.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }).replace('IDR', 'Rp ')}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Harga Terendah Harian</span>
                    <span className="font-bold text-slate-200">
                      {details.low.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }).replace('IDR', 'Rp ')}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Volume</span>
                    <span className="font-bold text-slate-200">{details.volume.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StockScreenerPage() {
  const [sector, setSector] = useState<string>('');
  const [minRsi, setMinRsi] = useState<string>('');
  const [maxRsi, setMaxRsi] = useState<string>('');
  const [minPe, setMinPe] = useState<string>('');
  const [maxPe, setMaxPe] = useState<string>('');

  const [activeFilters, setActiveFilters] = useState({
    sector: '',
    minRsi: undefined as number | undefined,
    maxRsi: undefined as number | undefined,
    minPe: undefined as number | undefined,
    maxPe: undefined as number | undefined,
  });

  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

  const { data: stocks, isLoading } = useScreenStocks(activeFilters);

  const handleApplyFilters = () => {
    setActiveFilters({
      sector,
      minRsi: minRsi ? Number(minRsi) : undefined,
      maxRsi: maxRsi ? Number(maxRsi) : undefined,
      minPe: minPe ? Number(minPe) : undefined,
      maxPe: maxPe ? Number(maxPe) : undefined,
    });
  };

  const handleResetFilters = () => {
    setSector('');
    setMinRsi('');
    setMaxRsi('');
    setMinPe('');
    setMaxPe('');
    setActiveFilters({
      sector: '',
      minRsi: undefined,
      maxRsi: undefined,
      minPe: undefined,
      maxPe: undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Stock Screener</h1>
          <p className="text-sm text-slate-400 mt-1">
            Filter dan temukan peluang trading berdasarkan indikator teknikal & fundamental terkini.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Panel */}
        <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-800 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-200">
              <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
              Filter Saham
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Saring saham berdasarkan preferensi Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300">Sektor Industri</Label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-md py-2 px-3 focus:outline-none focus:border-indigo-500 text-sm"
              >
                <option value="">Semua Sektor</option>
                <option value="Technology">Technology</option>
                <option value="Financials">Financials</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Consumer Cyclical">Consumer Cyclical</option>
                <option value="Industrials">Industrials</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-300">RSI Range</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={minRsi}
                  onChange={(e) => setMinRsi(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-slate-200 focus-visible:ring-indigo-500"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxRsi}
                  onChange={(e) => setMaxRsi(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-slate-200 focus-visible:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-300">P/E Ratio Range</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={minPe}
                  onChange={(e) => setMinPe(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-slate-200 focus-visible:ring-indigo-500"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxPe}
                  onChange={(e) => setMaxPe(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-slate-200 focus-visible:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button onClick={handleApplyFilters} className="bg-indigo-600 hover:bg-indigo-500 text-white w-full">
                Terapkan Filter
              </Button>
              <Button onClick={handleResetFilters} variant="outline" className="border-slate-800 hover:bg-slate-800 text-slate-300 w-full">
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <div className="lg:col-span-3">
          <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-800 h-full">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-20 gap-4">
                  <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-slate-400 text-sm">Sedang melakukan pencarian saham...</p>
                </div>
              ) : !stocks || stocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 text-center">
                  <Search className="w-10 h-10 text-slate-500 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-300">Tidak Ada Saham yang Cocok</h3>
                  <p className="text-slate-500 text-sm mt-1">Coba sesuaikan filter pencarian Anda.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
                        <th className="py-4 px-6">Ticker</th>
                        <th className="py-4 px-6">Nama Perusahaan</th>
                        <th className="py-4 px-6 text-right">Harga</th>
                        <th className="py-4 px-6 text-right">Perubahan</th>
                        <th className="py-4 px-6 text-right">RSI (14)</th>
                        <th className="py-4 px-6 text-right">P/E</th>
                        <th className="py-4 px-6 text-right">Market Cap</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 text-sm text-slate-300">
                      {stocks.map((stock) => {
                        const isProfit = stock.change >= 0;
                        return (
                          <tr
                            key={stock.ticker}
                            onClick={() => setSelectedTicker(stock.ticker)}
                            className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                          >
                            <td className="py-4 px-6 font-bold text-indigo-400">{stock.ticker}</td>
                            <td className="py-4 px-6">
                              <div>
                                <div className="font-semibold text-slate-200">{stock.name}</div>
                                <div className="text-xs text-slate-500">{stock.sector}</div>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-right font-semibold text-slate-200">
                              {stock.price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }).replace('IDR', 'Rp ')}
                            </td>
                            <td className={`py-4 px-6 text-right font-bold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                              {isProfit ? '+' : ''}
                              {stock.change}%
                            </td>
                            <td className="py-4 px-6 text-right font-medium">
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                stock.rsi > 70 ? 'bg-red-500/10 text-red-400' : stock.rsi < 30 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                              }`}>
                                {stock.rsi}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">{stock.peRatio}x</td>
                            <td className="py-4 px-6 text-right text-xs">
                              {stock.marketCap.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }).replace('IDR', 'Rp ')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedTicker && (
        <StockDetailModal ticker={selectedTicker} onClose={() => setSelectedTicker(null)} />
      )}
    </div>
  );
}
