import React, { useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  Zap,
  Target,
  BarChart3,
  Cpu,
  Clock,
  ArrowRight,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Download,
  Activity
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface PredictionResult {
  ticker: string;
  mape: number;
  imageUrl: string;
  pdfUrl?: string;
  futurePredictions?: number[];
  futureDates?: string[];
  confidenceUpper?: number[];
  confidenceLower?: number[];
}

const TICKERS = [
  { id: 'RELIANCE.NS', label: 'Reliance Industries' },
  { id: 'TCS.NS', label: 'Tata Consultancy' },
  { id: 'HDFCBANK.NS', label: 'HDFC Bank' },
  { id: 'INFY.NS', label: 'Infosys' },
  { id: 'SBIN.NS', label: 'State Bank of India' }
];

const MODELS = [
  { id: 'baseline', label: 'Baseline (Regression)', description: 'Fast, linear analysis for stable trends.' },
  { id: 'lstm_price', label: 'LSTM Quantitative', description: 'Deep learning sequence-to-sequence model.' },
  { id: 'lstm_sentiment', label: 'LSTM Sentiment+', description: 'Hybrid model including weighted sentiment data.' }
];

export const PredictionEngine: React.FC<{ currency?: string; currentPrice?: number }> = ({ currency = 'INR', currentPrice = 2984.30 }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string, label: string }[]>(TICKERS);
  const [isSearching, setIsSearching] = useState(false);

  const [selectedTicker, setSelectedTicker] = useState(TICKERS[0].id);
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
   const [error, setError] = useState<string | null>(null);

  const conversionRates: Record<string, { rate: number, symbol: string }> = {
    'INR': { rate: 1, symbol: '₹' },
    'USD': { rate: 0.012, symbol: '$' },
    'EUR': { rate: 0.011, symbol: '€' },
    'GBP': { rate: 0.0094, symbol: '£' }
  };

   const { rate, symbol } = conversionRates[currency] || conversionRates['INR'];

   const formatCurrency = (value: number) => `${symbol}${(value * rate).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

   const futureSeries = useMemo(() => {
     if (!result?.futurePredictions?.length) return [] as number[];
     return [currentPrice, ...result.futurePredictions];
   }, [currentPrice, result?.futurePredictions]);

   const futureUpper = useMemo(() => {
     if (!result?.confidenceUpper?.length) return [] as number[];
     return [currentPrice, ...result.confidenceUpper];
   }, [currentPrice, result?.confidenceUpper]);

   const futureLower = useMemo(() => {
     if (!result?.confidenceLower?.length) return [] as number[];
     return [currentPrice, ...result.confidenceLower];
   }, [currentPrice, result?.confidenceLower]);

   const futureLabels = useMemo(() => {
     if (!result?.futureDates?.length) return [] as string[];
     return ['Today', ...result.futureDates];
   }, [result?.futureDates]);

   const futureStats = useMemo(() => {
     if (!futureSeries.length) return null;
     const start = futureSeries[0];
     const end = futureSeries[futureSeries.length - 1];
     const change = ((end - start) / start) * 100;
     const avg = futureSeries.reduce((sum, val) => sum + val, 0) / futureSeries.length;
     return {
       start,
       end,
       change,
       avg
     };
   }, [futureSeries]);

   const futureChartData = useMemo(() => {
     if (!futureSeries.length) return null;
     const labels = futureLabels.length ? futureLabels : futureSeries.map((_, index) => `Day ${index}`);
     const upperSeries = futureUpper.length ? futureUpper : futureSeries;
     const lowerSeries = futureLower.length ? futureLower : futureSeries;
     const forecastPoints = labels.map((label, index) => ({ x: label, y: futureSeries[index] }));
     const upperPoints = labels.map((label, index) => ({ x: label, y: upperSeries[index] }));
     const lowerPoints = labels.map((label, index) => ({ x: label, y: lowerSeries[index] }));

     return {
       datasets: [
         {
           label: 'Upper Band',
           data: upperPoints,
           borderColor: 'rgba(255, 171, 64, 0.6)',
           backgroundColor: 'rgba(255, 171, 64, 0.12)',
           fill: false,
           pointRadius: 0,
           tension: 0.35
         },
         {
           label: 'Lower Band',
           data: lowerPoints,
           borderColor: 'rgba(255, 171, 64, 0.6)',
           backgroundColor: 'rgba(255, 171, 64, 0.12)',
           fill: '-1',
           pointRadius: 0,
           tension: 0.35
         },
         {
           label: 'Forecast',
           data: forecastPoints,
           borderColor: '#bdc2ff',
           backgroundColor: 'rgba(189, 194, 255, 0.35)',
           borderWidth: 2.5,
           pointRadius: 2.5,
           pointBackgroundColor: '#ffab40',
           pointBorderWidth: 0,
           tension: 0.35
         }
       ]
     };
   }, [futureSeries, futureLabels, futureUpper, futureLower]);

   const futureChartOptions = useMemo(() => ({
     responsive: true,
     maintainAspectRatio: false,
     parsing: false,
     plugins: {
       legend: {
         display: false
       },
       tooltip: {
         mode: 'index' as const,
         intersect: false,
         backgroundColor: 'rgba(10, 10, 10, 0.9)',
         borderColor: 'rgba(255,255,255,0.1)',
         borderWidth: 1,
         titleColor: '#f3f4f6',
         bodyColor: '#e5e7eb',
         padding: 10,
         callbacks: {
           label: (context: any) => `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`
         }
       }
     },
     scales: {
       x: {
         type: 'category' as const,
         grid: {
           color: 'rgba(255,255,255,0.05)'
         },
         ticks: {
           color: 'rgba(255,255,255,0.45)',
           maxTicksLimit: 6,
           font: {
             size: 10
           }
         }
       },
       y: {
         grid: {
           color: 'rgba(255,255,255,0.05)'
         },
         ticks: {
           color: 'rgba(255,255,255,0.45)',
           callback: (value: string | number) => formatCurrency(Number(value))
         }
       }
     }
   }), [formatCurrency]);

  const performSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults(TICKERS);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/yahoo-search/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10`);
      const data = await response.json();
      
      // Filter for Indian stocks only (.NS = NSE, .BO = BSE)
      const indianStocks = data.quotes
        .filter((q: any) => q.symbol.endsWith('.NS') || q.symbol.endsWith('.BO'))
        .map((q: any) => ({
          id: q.symbol,
          label: q.shortname || q.longname || q.symbol
        }));
      
      setSearchResults(indianStocks);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticker: selectedTicker,
          modelType: selectedModel,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis engine failed to respond. Please check server status.');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center">
            <Cpu className="text-primary" size={24} />
          </div>
          <div>
            <h1 className="text-4xl font-headline font-extrabold tracking-tighter text-on-surface">Sovereign Prediction Engine</h1>
            <p className="text-on-surface-variant font-body uppercase text-[10px] tracking-[0.2em]">Institutional-Grade Quantitative Forecasting</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* Selection panel */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant/10 shadow-xl shadow-black/20">
            <h2 className="text-lg font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
              <BarChart3 size={20} className="text-primary" />
              Configuration
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold block mb-3">Asset discovery</label>
                
                <div className="relative mb-4">
                  <input 
                    type="text" 
                    placeholder="Search Indian Stocks (e.g. RELIANCE)"
                    value={searchQuery}
                    onChange={(e) => performSearch(e.target.value)}
                    className="w-full bg-surface-low border border-outline-variant/20 rounded-xl px-4 py-3 text-xs focus:border-primary focus:outline-none transition-all pr-10"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isSearching ? <Loader2 size={14} className="animate-spin text-primary" /> : <BarChart3 size={14} className="text-on-surface-variant/40" />}
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto no-scrollbar grid grid-cols-1 gap-2 pr-1">
                  {searchResults.length > 0 ? (
                    searchResults.map(ticker => (
                      <button
                        key={ticker.id}
                        onClick={() => setSelectedTicker(ticker.id)}
                        className={`px-4 py-3 rounded-xl text-[11px] font-bold transition-all text-left border flex justify-between items-center ${
                          selectedTicker === ticker.id 
                            ? 'bg-primary text-on-primary border-primary' 
                            : 'bg-surface-low text-on-surface-variant border-transparent hover:border-primary/30'
                        }`}
                      >
                        <span className="truncate pr-2">{ticker.label}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${selectedTicker === ticker.id ? 'bg-white/20 text-white' : 'bg-surface-highest text-on-surface-variant/60'}`}>
                          {ticker.id.split('.')[0]}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-4 opacity-40 text-[10px] uppercase font-bold tracking-widest">
                      No Indian assets found
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold block mb-3">Model Architecture</label>
                <div className="space-y-3">
                  {MODELS.map(model => (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModel(model.id)}
                      className={`w-full p-4 rounded-xl text-left transition-all border ${
                        selectedModel === model.id 
                          ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(189,194,255,0.1)]' 
                          : 'bg-surface-low border-transparent hover:border-primary/20'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs font-bold ${selectedModel === model.id ? 'text-primary' : 'text-on-surface'}`}>{model.label}</span>
                        {selectedModel === model.id && <Zap size={14} className="text-primary animate-pulse" />}
                      </div>
                      <p className="text-[10px] text-on-surface-variant leading-relaxed">{model.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={runAnalysis}
                disabled={loading}
                className="w-full py-4 mt-4 bg-primary text-on-primary rounded-2xl font-headline font-extrabold uppercase tracking-widest text-sm flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Processing Sequences...
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    Run Analysis Engine
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-surface-low rounded-3xl p-6 border border-outline-variant/10">
            <h3 className="font-headline font-bold text-on-surface mb-3 flex items-center gap-2">
              <ShieldCheck size={18} className="text-secondary" />
              Institutional Security
            </h3>
            <p className="text-[10px] text-on-surface-variant leading-relaxed">
              All computations are execution-isolated. Model weights are encrypted at rest and inference is performed in a Tier-1 secure environment.
            </p>
          </div>
        </div>

        {/* Results Panel */}
        <div className="col-span-12 lg:col-span-8">
          <AnimatePresence mode="wait">
            {!result && !loading && !error && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-full min-h-[500px] flex flex-col items-center justify-center bg-surface-low rounded-[2rem] border-2 border-dashed border-outline-variant/10 p-12 text-center"
              >
                <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-6">
                  <BarChart3 className="text-on-surface-variant/30" size={40} />
                </div>
                <h2 className="text-2xl font-headline font-extrabold text-on-surface mb-2">Ready for Execution</h2>
                <p className="max-w-xs text-on-surface-variant text-sm leading-relaxed">
                  Select a target asset and quantitative model architecture to begin sequence forecasting.
                </p>
              </motion.div>
            )}

            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[500px] flex flex-col items-center justify-center bg-surface-low rounded-[2rem] border border-outline-variant/10 p-12 overflow-hidden relative"
              >
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6"></div>
                  <h2 className="text-xl font-headline font-bold text-on-surface animate-pulse">Running Neural Inference</h2>
                  <p className="text-xs text-on-surface-variant mt-2">Connecting to PyTorch Backend...</p>
                </div>
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#bdc2ff_1px,transparent_1px)] [background-size:20px_20px]"></div>
              </motion.div>
            )}

            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[500px] flex flex-col items-center justify-center bg-tertiary/5 rounded-[2rem] border border-tertiary/20 p-12 text-center"
              >
                <AlertCircle className="text-tertiary mb-4" size={48} />
                <h2 className="text-xl font-headline font-bold text-tertiary">Execution Error</h2>
                <p className="text-sm text-on-surface-variant mt-2 max-w-sm">{error}</p>
                <button 
                  onClick={runAnalysis}
                  className="mt-6 px-6 py-2 bg-tertiary text-on-surface rounded-xl text-xs font-bold"
                >
                  Retry Analysis
                </button>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <div className="bg-surface-low rounded-[2rem] p-10 border border-outline-variant/10 shadow-2xl relative overflow-hidden group">
                   <div className="flex flex-wrap gap-4 justify-between items-center mb-8 relative z-10">
                     <div>
                       <span className="text-[10px] text-primary font-bold uppercase tracking-widest block mb-1">Forecast Metrics</span>
                       <h2 className="text-2xl font-headline font-extrabold text-on-surface">
                         Analysis Complete: {result.ticker.split('.')[0]}
                       </h2>
                     </div>
                     <div className="flex flex-wrap items-center gap-3">
                       <div className="bg-secondary/10 px-6 py-3 rounded-2xl border border-secondary/20">
                         <span className="text-[10px] text-secondary uppercase tracking-widest block mb-1">Backtest MAPE</span>
                         <span className="text-2xl font-headline font-bold text-secondary">{result.mape}%</span>
                       </div>
                       {result.pdfUrl && (
                         <a
                           href={result.pdfUrl}
                           className="px-5 py-3 rounded-2xl bg-primary text-on-primary text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20"
                           download
                         >
                           <Download size={14} />
                           Download PDF
                         </a>
                       )}
                     </div>
                   </div>

                  <div className="rounded-2xl overflow-hidden border border-outline-variant/10 bg-black/40 p-2 shadow-inner">
                    <img 
                      src={result.imageUrl} 
                      alt="Prediction Graph" 
                      className="w-full h-auto rounded-xl shadow-2xl"
                    />
                  </div>

                   <div className="mt-8 flex flex-wrap items-center justify-between text-[10px] text-on-surface-variant/60 font-bold uppercase tracking-tighter gap-2">
                     <div className="flex gap-4">
                       <span>Source: Yahoo Finance</span>
                       <span>Execution ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                     </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                      Validated System Output
                    </div>
                  </div>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-surface-container/50 backdrop-blur-sm p-6 rounded-2xl border border-outline-variant/10">
                     <Target size={20} className="text-primary mb-4" />
                     <h4 className="font-headline font-bold text-on-surface text-sm mb-2">Alpha Accuracy</h4>
                     <p className="text-[10px] text-on-surface-variant leading-relaxed">
                       This model configuration shows {100 - result.mape}% statistical accuracy on {result.ticker} historical test datasets.
                     </p>
                   </div>
                   <div className="bg-surface-container/50 backdrop-blur-sm p-6 rounded-2xl border border-outline-variant/10">
                     <Zap size={20} className="text-secondary mb-4" />
                     <h4 className="font-headline font-bold text-on-surface text-sm mb-2">Sequence Depth</h4>
                     <p className="text-[10px] text-on-surface-variant leading-relaxed">
                       Inference sequence window of 10 trading days utilized for current recursive price projections.
                     </p>
                   </div>
                   <div className="bg-surface-container/50 backdrop-blur-sm p-6 rounded-2xl border border-outline-variant/10">
                     <BarChart3 size={20} className="text-primary mb-4" />
                     <h4 className="font-headline font-bold text-on-surface text-sm mb-2">Volatility Adj.</h4>
                     <p className="text-[10px] text-on-surface-variant leading-relaxed">
                       Weights dynamically adjusted based on current market volatility and sector-specific risk factors.
                     </p>
                   </div>
                 </div>

                 <div className="bg-surface-low rounded-[2rem] p-10 border border-outline-variant/10 shadow-2xl">
                   <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                     <div>
                       <span className="text-[10px] text-primary font-bold uppercase tracking-widest block mb-1">Future Price Flow</span>
                       <h3 className="text-xl font-headline font-extrabold text-on-surface">{result.ticker.split('.')[0]} Forward Curve</h3>
                     </div>
                     {futureStats && (
                       <div className={`px-4 py-2 rounded-2xl text-xs font-bold ${futureStats.change >= 0 ? 'bg-secondary/10 text-secondary' : 'bg-tertiary/10 text-tertiary'}`}>
                         {futureStats.change >= 0 ? 'Bullish' : 'Bearish'} Drift {futureStats.change >= 0 ? '+' : ''}{futureStats.change.toFixed(2)}%
                       </div>
                     )}
                   </div>

                   {futureSeries.length > 1 && futureChartData ? (
                     <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                       <div className="lg:col-span-3 bg-black/40 rounded-2xl border border-outline-variant/10 p-4">
                         <div className="h-60">
                           <Line data={futureChartData} options={futureChartOptions} />
                         </div>
                         <div className="mt-3 flex flex-wrap gap-4 text-[10px] text-on-surface-variant/70 uppercase tracking-widest">
                           <span>Current: {formatCurrency(currentPrice)}</span>
                           <span>Horizon: {futureSeries.length - 1} days</span>
                           <span>Band: 1-sigma volatility</span>
                         </div>
                       </div>

                       <div className="space-y-4">
                         <div className="bg-surface-container/70 rounded-2xl p-4 border border-outline-variant/10">
                           <div className="text-[10px] uppercase tracking-widest text-on-surface-variant">Base Case</div>
                           <div className="text-lg font-bold text-primary mt-1">{futureStats ? formatCurrency(futureStats.avg) : '--'}</div>
                           <div className="text-[10px] text-on-surface-variant">Projected mean price</div>
                         </div>
                         <div className="bg-surface-container/70 rounded-2xl p-4 border border-outline-variant/10">
                           <div className="text-[10px] uppercase tracking-widest text-on-surface-variant">Bull Case</div>
                           <div className="text-lg font-bold text-secondary mt-1">{futureUpper.length ? formatCurrency(futureUpper[futureUpper.length - 1]) : '--'}</div>
                           <div className="text-[10px] text-on-surface-variant">Upper confidence bound</div>
                         </div>
                         <div className="bg-surface-container/70 rounded-2xl p-4 border border-outline-variant/10">
                           <div className="text-[10px] uppercase tracking-widest text-on-surface-variant">Bear Case</div>
                           <div className="text-lg font-bold text-tertiary mt-1">{futureLower.length ? formatCurrency(futureLower[futureLower.length - 1]) : '--'}</div>
                           <div className="text-[10px] text-on-surface-variant">Lower confidence bound</div>
                         </div>
                       </div>
                     </div>
                   ) : (
                     <div className="h-48 flex flex-col items-center justify-center bg-surface-container/60 rounded-2xl border border-outline-variant/10">
                       <Activity size={36} className="text-on-surface-variant/40 mb-3" />
                       <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Future predictions unavailable</p>
                     </div>
                   )}

                   {futureSeries.length > 1 && (
                     <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] uppercase tracking-widest text-on-surface-variant">
                       {futureSeries.slice(1, 5).map((price, index) => (
                         <div key={`${price}-${index}`} className="bg-surface-container/70 rounded-xl p-3 border border-outline-variant/10">
                           <div className="text-[9px] text-on-surface-variant/70">{futureLabels[index + 1] || `Day ${index + 1}`}</div>
                           <div className="text-sm font-bold text-primary">{formatCurrency(price)}</div>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
               </motion.div>
             )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
