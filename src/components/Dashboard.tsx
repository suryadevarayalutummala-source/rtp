import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ShieldCheck, 
  Zap,
  AlertCircle,
  Clock
} from 'lucide-react';
import { MARKET_INDICES } from '../constants';

export const Dashboard: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Market Indicators Ticker */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {MARKET_INDICES.map((index) => (
          <div key={index.name} className="bg-surface-low p-6 rounded-xl flex items-center justify-between group hover:bg-surface-container transition-all border border-outline-variant/5">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-on-surface-variant font-label font-medium mb-1">{index.name}</p>
              <h2 className="text-2xl font-headline font-bold tracking-tight text-on-surface">{index.value.toLocaleString()}</h2>
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
              </div>
              <h1 className="text-5xl font-headline font-extrabold tracking-[-0.04em] text-on-surface">₹12,84,25,509.64</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="bg-secondary/10 text-secondary px-2 py-1 rounded text-xs font-bold flex items-center">
                  <TrendingUp size={12} className="mr-1" />
                  +₹2,41,083.12 (1.91%)
                </span>
                <span className="text-on-surface-variant/60 text-xs">Past 24 hours</span>
              </div>
            </div>

            {/* Performance Chart Mockup */}
            <div className="h-64 w-full relative overflow-hidden rounded-xl bg-surface-low/50 border border-outline-variant/5">
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
                <path d="M0,80 Q50,60 100,75 T200,40 T300,20 T400,10 L400,100 L0,100 Z" fill="url(#chartGradient)" />
                <path d="M0,80 Q50,60 100,75 T200,40 T300,20 T400,10" fill="none" stroke="#bdc2ff" strokeLinecap="round" strokeWidth="2.5" />
              </svg>
              <div className="absolute top-4 right-6 flex flex-col items-end">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tighter">Peak Value</span>
                <span className="text-sm font-headline font-bold">₹13.1Cr</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-low p-6 rounded-2xl border border-outline-variant/10">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="text-primary" size={20} />
                <h4 className="font-headline font-bold text-on-surface">Alpha Signal</h4>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-4">Sentiment score indicates strong buy pressure in Tech sectors over the next 72 hours.</p>
              <div className="w-full bg-surface-highest rounded-full h-1.5 overflow-hidden">
                <div className="bg-primary h-full w-[84%]"></div>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-on-surface-variant font-bold uppercase">Confidence</span>
                <span className="text-[10px] text-primary font-bold uppercase">84% High</span>
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
              {[
                { ticker: 'RELIANCE', name: 'Reliance Ind.', sector: 'Energy & Retail', price: 2984.30, change: 1.85 },
                { ticker: 'TCS', name: 'Tata Consultancy', sector: 'Technology', price: 4115.50, change: 1.42 },
                { ticker: 'HDFCBANK', name: 'HDFC Bank', sector: 'Banking', price: 1475.20, change: 0.95 }
              ].map((stock) => (
                <div key={stock.ticker} className="flex items-center justify-between p-4 rounded-xl hover:bg-surface-highest/50 transition-all group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="px-2 min-w-[48px] h-10 bg-surface-low rounded-lg flex items-center justify-center font-bold text-[10px] text-primary">{stock.ticker}</div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">{stock.name}</p>
                      <p className="text-[10px] text-on-surface-variant">{stock.sector}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-on-surface">₹{stock.price}</p>
                    <p className="text-xs text-secondary font-bold">+{stock.change}%</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-surface-low/30 text-center border-t border-outline-variant/5">
              <button className="text-[11px] font-headline font-bold text-primary uppercase tracking-widest hover:text-on-surface transition-all">View Full Market Activity</button>
            </div>
          </div>

          <div className="bg-surface-low p-6 rounded-2xl border-l-4 border-primary/40 border-y border-r border-outline-variant/10">
            <p className="text-[10px] font-bold text-primary uppercase mb-2">Institutional Alert</p>
            <h4 className="font-headline font-bold text-on-surface mb-2 leading-snug">Reserve Bank of India hints at potential rate stability in upcoming MPC review.</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-4">Minutes from the private committee session suggest a softening of previous hawkish stances.</p>
            <div className="flex items-center gap-2 text-on-surface-variant/60">
              <Clock size={14} />
              <span className="text-[10px] font-bold uppercase">14 MINS AGO</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
