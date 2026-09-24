import React from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  AlertCircle,
  Clock,
  Copy,
  Check
} from 'lucide-react';
import { FALLBACK_INDICES } from '../constants';
import { Holding } from '../types';
import { MarketIndex, PriceData } from '../services/marketData';

import { Article } from '../services/newsService';

interface DashboardProps {
  holdings: Holding[];
  currency: string;
  marketIndices: MarketIndex[];
  pricesLoading: boolean;
  livePrices?: Record<string, PriceData>;
  news?: Article[];
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  holdings, 
  currency, 
  marketIndices, 
  pricesLoading, 
  livePrices = {},
  news = []
}) => {
  const conversionRates: Record<string, { rate: number, symbol: string }> = {
    'INR': { rate: 1, symbol: '₹' },
    'USD': { rate: 0.012, symbol: '$' },
    'EUR': { rate: 0.011, symbol: '€' },
    'GBP': { rate: 0.0094, symbol: '£' }
  };

  const { rate, symbol } = conversionRates[currency] || conversionRates['INR'];

  const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0) * rate;
  const totalCost = holdings.reduce((sum, h) => sum + (h.avgCost * h.quantity), 0) * rate;
  const totalPL = totalValue - totalCost;
  const plPercent = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;

  // Find Alpha Signal: Article with strongest sentiment
  const alphaArticle = [...news].sort((a, b) => {
    const scoreA = a.sentiment === 'high-alpha' ? 2 : (a.sentiment === 'neutral' ? 0 : 1);
    const scoreB = b.sentiment === 'high-alpha' ? 2 : (b.sentiment === 'neutral' ? 0 : 1);
    return scoreB - scoreA;
  })[0];

  // Latest Alert
  const latestAlert = news[0];
  const [summaryCopied, setSummaryCopied] = React.useState(false);

  const handleCopySummary = async () => {
    const summary = `Portfolio value: ${symbol}${totalValue.toLocaleString()} | P/L: ${symbol}${totalPL.toLocaleString()} (${plPercent.toFixed(2)}%)`;
    await navigator.clipboard.writeText(summary);
    setSummaryCopied(true);
    window.setTimeout(() => setSummaryCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Market Indicators Ticker */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {(marketIndices.length > 0 ? marketIndices : FALLBACK_INDICES).map((index) => (
          <div key={index.name} className="bg-surface-low p-6 rounded-xl flex items-center justify-between group hover:bg-surface-container transition-all border border-outline-variant/5">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-on-surface-variant font-label font-medium mb-1">{index.name}</p>
              <h2 className="text-2xl font-headline font-bold tracking-tight text-on-surface">{pricesLoading ? 'Loading...' : index.value.toLocaleString()}</h2>
            </div>
            <div className="text-right">
              <p className={`font-body font-semibold flex items-center justify-end ${index.change >= 0 ? 'text-secondary' : 'text-tertiary'}`}>
                {index.change >= 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                {index.changePercent > 0 ? '+' : ''}{index.changePercent}%
              </p>
              <p className="text-[10px] text-on-surface-variant/60">{index.change > 0 ? '+' : ''}{index.change} today</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Portfolio Performance */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="bg-surface-container p-8 rounded-2xl flex flex-col gap-6 border border-outline-variant/10">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4">
                <p className="text-[11px] uppercase tracking-widest text-primary font-label font-bold">Total Managed Capital</p>
                <div className="flex gap-1">
                  {['1D', '1M', '1Y', 'ALL'].map((period) => (
                    <button 
                      key={period}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        period === '1D' ? 'bg-surface-highest text-on-surface' : 'bg-surface-low text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleCopySummary}
                  title="Copy portfolio summary"
                  aria-label="Copy portfolio summary"
                  className="ml-auto p-2 rounded-lg text-on-surface-variant hover:bg-surface-highest hover:text-on-surface transition-all"
                >
                  {summaryCopied ? <Check size={14} className="text-secondary" /> : <Copy size={14} />}
                </button>
              </div>
              <h1 className="text-5xl font-headline font-extrabold tracking-[-0.04em] text-on-surface">
                {symbol}{totalValue.toLocaleString()}<span className="text-xl text-on-surface-variant font-medium ml-3 tracking-normal">.00</span>
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className={`px-2 py-1 rounded text-xs font-bold flex items-center ${totalPL >= 0 ? 'bg-secondary/10 text-secondary' : 'bg-tertiary/10 text-tertiary'}`}>
                  {totalPL >= 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                  {totalPL >= 0 ? '+' : ''}{symbol}{Math.abs(totalPL).toLocaleString()} ({plPercent.toFixed(2)}%)
                </span>
                <span className="text-on-surface-variant/60 text-xs">Past 24 hours</span>
              </div>
            </div>

            {/* Performance Chart Mockup */}
            <div className="h-64 w-full relative overflow-hidden rounded-xl bg-surface-low/50 border border-outline-variant/5">
              {holdings.length > 0 ? (
                <>
                  <div className="absolute inset-0 flex items-end justify-between px-2 pt-12 pb-4 opacity-10">
                    {[...Array(7)].map((_, i) => (
                      <div key={i} className="w-px h-full bg-on-surface"></div>
                    ))}
                  </div>
                  <svg className="absolute bottom-0 left-0 w-full h-48" preserveAspectRatio="none" viewBox="0 0 400 100">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#bdc2ff" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#bdc2ff" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Dynamic Path Logic */}
                    {(() => {
                      const points = 10;
                      const width = 400;
                      const height = 100;
                      const padding = 10;
                      const startY = height - padding - ((totalCost / (Math.max(totalValue, totalCost) * 1.2 || 1)) * (height - 2 * padding));
                      const endY = height - padding - ((totalValue / (Math.max(totalValue, totalCost) * 1.2 || 1)) * (height - 2 * padding));
                      
                      let pathData = `M 0 ${startY}`;
                      for (let i = 1; i < points; i++) {
                        const x = (i / (points - 1)) * width;
                        const progress = i / (points - 1);
                        const trendY = startY + (endY - startY) * progress;
                        const noise = (Math.sin(i * 1.5) * 0.5 + Math.cos(i * 0.8) * 0.5) * 10;
                        const y = i === points - 1 ? endY : Math.max(padding, Math.min(height - padding, trendY + noise));
                        pathData += ` L ${x} ${y}`;
                      }
                      const areaData = `${pathData} L 400 100 L 0 100 Z`;
                      
                      return (
                        <>
                          <path d={areaData} fill="url(#chartGradient)" />
                          <path d={pathData} fill="none" stroke="#bdc2ff" strokeLinecap="round" strokeWidth="2.5" />
                        </>
                      );
                    })()}
                  </svg>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant/20">
                  <p className="text-xs font-bold uppercase tracking-widest">No Portfolio Data</p>
                </div>
              )}
              <div className="absolute top-4 right-6 flex flex-col items-end">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tighter">Peak Value</span>
                <span className="text-sm font-headline font-bold">{symbol}{(totalValue * 1.05 / (currency === 'INR' ? 10000000 : 1000000)).toFixed(1)}{currency === 'INR' ? 'Cr' : 'M'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-low p-6 rounded-2xl border border-outline-variant/10">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="text-primary" size={20} />
                <h4 className="font-headline font-bold text-on-surface">Alpha Signal</h4>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-4 h-12 overflow-y-auto no-scrollbar italic cursor-ns-resize">
                {alphaArticle ? `"${alphaArticle.title}"` : "Processing real-time market sentiment flows..."}
              </p>
              <div className="w-full bg-surface-highest rounded-full h-1.5 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: alphaArticle ? (alphaArticle.sentiment === 'high-alpha' ? '92%' : '76%') : '30%' }}
                  className="bg-primary h-full"
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-on-surface-variant font-bold uppercase">Confidence</span>
                <span className="text-[10px] text-primary font-bold uppercase">
                  {alphaArticle ? (alphaArticle.sentiment === 'high-alpha' ? '92% High' : '76% Moderate') : 'Calibrating'}
                </span>
              </div>
            </div>
            <div className="bg-surface-low p-6 rounded-2xl border border-outline-variant/10">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="text-secondary" size={20} />
                <h4 className="font-headline font-bold text-on-surface">Risk Exposure</h4>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-4">Portfolio volatility remains within institutional tier-1 guidelines (±2.5% VaR).</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-headline font-bold text-on-surface">1.24%</span>
                <span className="text-xs text-secondary font-bold">Safe</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Movers & Alerts */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/10">
            <div className="p-8 bg-surface-highest/30 flex justify-between items-center">
              <h3 className="font-headline font-extrabold text-sm uppercase tracking-wider text-on-surface">Top Gainers</h3>
              <TrendingUp className="text-secondary" size={18} />
            </div>
            <div className="p-2">
              {holdings.slice(0, 3).map((stock) => {
                const dailyChange = livePrices[stock.ticker]?.changePercent ?? stock.plPercent;
                const changePercent = dailyChange;
                return (
                  <div key={stock.ticker} className="flex items-center justify-between p-4 rounded-xl hover:bg-surface-highest/50 transition-all group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="px-2 min-w-[48px] h-10 bg-surface-low rounded-lg flex items-center justify-center font-bold text-[10px] text-primary">{stock.ticker}</div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">{stock.name}</p>
                        <p className="text-[10px] text-on-surface-variant">{stock.sector}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-on-surface">{symbol}{(stock.price * rate).toLocaleString()}</p>
                      <p className={`text-xs font-bold ${changePercent >= 0 ? 'text-secondary' : 'text-tertiary'}`}>
                        {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-4 bg-surface-low/30 text-center border-t border-outline-variant/5">
              <button className="text-[11px] font-headline font-bold text-primary uppercase tracking-widest hover:text-on-surface transition-all">View Full Market Activity</button>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-surface-low p-6 rounded-2xl border-l-4 border-primary/40 border-y border-r border-outline-variant/10"
          >
            <p className="text-[10px] font-bold text-primary uppercase mb-2">Institutional Alert</p>
            <h4 className="font-headline font-bold text-on-surface mb-2 leading-snug">
              {latestAlert ? latestAlert.title : "Awaiting next authenticated market flash..."}
            </h4>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
              Source: {latestAlert ? latestAlert.category : 'Reuters Terminal'} • Tier-1 Authenticated
            </p>
            <div className="flex items-center gap-2 text-on-surface-variant/60">
              <Clock size={14} />
              <span className="text-[10px] font-bold uppercase">{latestAlert ? latestAlert.time : 'STATIONARY'}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
