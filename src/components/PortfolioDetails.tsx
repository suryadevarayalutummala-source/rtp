import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  MoreVertical,
  Filter,
  Download,
  PieChart as PieChartIcon
} from 'lucide-react';
import { HOLDINGS } from '../constants';

export const PortfolioDetails: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
        <div className="max-w-2xl">
          <p className="text-primary font-label text-xs uppercase tracking-[0.2em] mb-2">Portfolio Overview</p>
          <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-on-surface mb-4">
            ₹4,29,15,502<span className="text-xl text-on-surface-variant font-medium ml-3 tracking-normal">.84</span>
          </h1>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-secondary text-sm font-semibold">
              <TrendingUp size={14} />
              +12.4% (₹4.73L)
            </span>
            <span className="text-on-surface-variant text-sm border-l border-outline-variant/30 pl-4">Institutional Alpha Fund II</span>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="bg-surface-container px-4 py-2 rounded-xl flex flex-col items-end border border-outline-variant/10">
            <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">Available Liquidity</span>
            <span className="font-headline font-bold text-on-surface">₹1,28,402.00</span>
          </div>
          <div className="bg-surface-container px-4 py-2 rounded-xl flex flex-col items-end border border-outline-variant/10">
            <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">Buying Power</span>
            <span className="font-headline font-bold text-primary">₹5,13,608.00</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6 mb-12">
        {/* Performance Chart */}
        <div className="col-span-12 lg:col-span-8 bg-surface-low rounded-2xl p-8 relative overflow-hidden border border-outline-variant/10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-headline text-lg font-bold">Portfolio Value</h3>
              <p className="text-xs text-on-surface-variant">Past 12 months performance</p>
            </div>
            <div className="flex gap-1">
              <button className="px-3 py-1 text-[10px] rounded-lg bg-surface-highest text-on-surface font-bold">1Y</button>
              <button className="px-3 py-1 text-[10px] rounded-lg text-on-surface-variant hover:bg-surface-highest transition-all">ALL</button>
            </div>
          </div>
          <div className="h-64 w-full relative">
            <svg className="w-full h-full" viewBox="0 0 1000 200">
              <defs>
                <linearGradient id="chartGradient2" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#bdc2ff" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#bdc2ff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,150 Q100,160 200,140 T400,100 T600,80 T800,40 T1000,20" fill="none" stroke="#bdc2ff" strokeLinecap="round" strokeWidth="3" />
              <path d="M0,150 Q100,160 200,140 T400,100 T600,80 T800,40 T1000,20 V200 H0 Z" fill="url(#chartGradient2)" />
              <line stroke="#454652" strokeDasharray="4" x1="800" x2="800" y1="0" y2="200" opacity="0.3" />
              <circle cx="800" cy="40" fill="#bdc2ff" r="5" stroke="#131313" strokeWidth="2" />
            </svg>
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-on-surface-variant uppercase tracking-tighter">
              <span>4.5Cr</span>
              <span>4.0Cr</span>
              <span>3.5Cr</span>
              <span>3.0Cr</span>
            </div>
          </div>
        </div>

        {/* Allocation */}
        <div className="col-span-12 lg:col-span-4 bg-surface-low rounded-2xl p-8 flex flex-col border border-outline-variant/10">
          <h3 className="font-headline text-lg font-bold mb-8">Allocation</h3>
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <svg className="w-48 h-48 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="transparent" r="40" stroke="#1a237e" strokeDasharray="251.2" strokeDashoffset="0" strokeWidth="12" />
              <circle cx="50" cy="50" fill="transparent" r="40" stroke="#bdc2ff" strokeDasharray="251.2" strokeDashoffset="100" strokeWidth="12" />
              <circle cx="50" cy="50" fill="transparent" r="40" stroke="#88d982" strokeDasharray="251.2" strokeDashoffset="180" strokeWidth="12" />
              <circle cx="50" cy="50" fill="transparent" r="40" stroke="#353534" strokeDasharray="251.2" strokeDashoffset="230" strokeWidth="12" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-on-surface-variant">Equities</span>
              <span className="text-xl font-bold font-headline">64.2%</span>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              { label: 'Tech', color: 'bg-primary' },
              { label: 'Energy', color: 'bg-secondary' },
              { label: 'Financials', color: 'bg-primary-container' },
              { label: 'Cash', color: 'bg-surface-highest' }
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                <span className="text-xs text-on-surface-variant">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="bg-surface-low rounded-2xl overflow-hidden border border-outline-variant/10">
        <div className="px-8 py-6 flex justify-between items-center border-b border-outline-variant/10">
          <h3 className="font-headline text-lg font-bold">Comprehensive Holdings</h3>
          <div className="flex gap-4">
            <button className="text-xs font-semibold text-primary flex items-center gap-1">
              <Filter size={14} />
              Filter
            </button>
            <button className="text-xs font-semibold text-primary flex items-center gap-1">
              <Download size={14} />
              Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant border-b border-outline-variant/10">
                <th className="px-8 py-4 font-semibold">Ticker</th>
                <th className="px-4 py-4 font-semibold">Price</th>
                <th className="px-4 py-4 font-semibold">Avg Cost</th>
                <th className="px-4 py-4 font-semibold">Market Value</th>
                <th className="px-4 py-4 font-semibold">P/L (%)</th>
                <th className="px-4 py-4 font-semibold">Weight</th>
                <th className="px-8 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {HOLDINGS.map((holding) => (
                <tr key={holding.ticker} className="hover:bg-surface-container transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="px-2 min-w-[48px] h-10 rounded-lg bg-surface-highest flex items-center justify-center font-bold text-xs text-primary">{holding.ticker}</div>
                      <div>
                        <div className="text-sm font-bold text-on-surface">{holding.name}</div>
                        <div className="text-[10px] text-on-surface-variant">{holding.sector}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-6 font-medium text-sm">₹{holding.price}</td>
                  <td className="px-4 py-6 font-medium text-sm text-on-surface-variant">₹{holding.avgCost}</td>
                  <td className="px-4 py-6 font-bold text-sm">₹{holding.marketValue.toLocaleString()}</td>
                  <td className="px-4 py-6">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${holding.plPercent >= 0 ? 'bg-secondary/10 text-secondary' : 'bg-tertiary/10 text-tertiary'}`}>
                      {holding.plPercent > 0 ? '+' : ''}{holding.plPercent}%
                    </span>
                  </td>
                  <td className="px-4 py-6">
                    <div className="w-24 h-1.5 bg-surface-highest rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${holding.weight}%` }}></div>
                    </div>
                    <span className="text-[10px] text-on-surface-variant mt-1 block">{holding.weight}%</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="text-on-surface-variant hover:text-primary transition-all">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-8 py-4 bg-surface-highest/10 flex items-center justify-between text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">
          <span>Showing 4 of 28 Assets</span>
          <div className="flex gap-4">
            <button className="hover:text-primary transition-colors">Previous</button>
            <button className="text-on-surface">1</button>
            <button className="hover:text-primary transition-colors">2</button>
            <button className="hover:text-primary transition-colors">3</button>
            <button className="hover:text-primary transition-colors">Next</button>
          </div>
        </div>
      </section>
    </div>
  );
};
