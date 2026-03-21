import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Zap,
  Target,
  BarChart3,
  Cpu,
  Clock,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const PredictionEngine: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center">
              <Cpu className="text-primary" size={24} />
            </div>
            <div>
              <h1 className="text-4xl font-headline font-extrabold tracking-tighter text-on-surface">RELIANCE Prediction Engine</h1>
              <p className="text-on-surface-variant font-body">Reliance Industries Ltd. • Quantitative Forecast v4.2</p>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="bg-surface-low px-6 py-3 rounded-2xl border border-outline-variant/10">
            <span className="text-[10px] text-on-surface-variant uppercase tracking-widest block mb-1">Current Price</span>
            <span className="text-2xl font-headline font-bold text-on-surface">₹2,984.30</span>
            <span className="text-xs text-secondary font-bold ml-2">+1.4%</span>
          </div>
          <div className="bg-primary-container/20 px-6 py-3 rounded-2xl border border-primary/20">
            <span className="text-[10px] text-primary uppercase tracking-widest block mb-1">Projected (30D)</span>
            <span className="text-2xl font-headline font-bold text-primary">₹3,450.80</span>
            <span className="text-xs text-secondary font-bold ml-2">+15.6%</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* Prediction Chart */}
        <div className="col-span-12 lg:col-span-9 bg-surface-low rounded-3xl p-10 border border-outline-variant/10 relative overflow-hidden">
          <div className="flex justify-between items-center mb-10">
            <div className="flex gap-8">
              <div>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-widest block mb-1">Model Confidence</span>
                <span className="text-lg font-headline font-bold text-on-surface">87.4%</span>
              </div>
              <div>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-widest block mb-1">Volatility Index</span>
                <span className="text-lg font-headline font-bold text-on-surface">Medium</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-surface-highest text-on-surface text-xs font-bold rounded-xl">Price Forecast</button>
              <button className="px-4 py-2 text-on-surface-variant hover:bg-surface-highest text-xs font-bold rounded-xl transition-all">Volume Analysis</button>
            </div>
          </div>

          <div className="h-[400px] w-full relative">
            <svg className="w-full h-full" viewBox="0 0 1000 400">
              <defs>
                <linearGradient id="forecastGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#bdc2ff" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#bdc2ff" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="historicalGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#88d982" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#88d982" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Grid Lines */}
              {[...Array(5)].map((_, i) => (
                <line key={i} x1="0" x2="1000" y1={i * 100} y2={i * 100} stroke="#454652" strokeOpacity="0.1" />
              ))}

              {/* Historical Path */}
              <path d="M0,350 Q100,320 200,340 T400,280 T600,240" fill="none" stroke="#88d982" strokeWidth="2" opacity="0.5" />
              
              {/* Prediction Path */}
              <path d="M600,240 Q700,200 800,120 T1000,40" fill="none" stroke="#bdc2ff" strokeWidth="4" strokeDasharray="8 4" />
              <path d="M600,240 Q700,200 800,120 T1000,40 V400 H600 Z" fill="url(#forecastGradient)" />

              {/* Current Point */}
              <circle cx="600" cy="240" r="6" fill="#bdc2ff" stroke="#131313" strokeWidth="3" />
              
              {/* Target Point */}
              <circle cx="1000" cy="40" r="8" fill="#bdc2ff" className="animate-pulse" />
            </svg>
            
            <div className="absolute top-0 left-[60%] h-full w-px bg-primary/20 border-l border-dashed border-primary/40"></div>
            <div className="absolute top-4 left-[62%] bg-primary/10 backdrop-blur-md border border-primary/20 px-3 py-1 rounded-lg">
              <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Forecast Horizon</span>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-4 gap-4 border-t border-outline-variant/10 pt-8">
            {[
              { label: 'Bull Case', value: '₹3,650.00', color: 'text-secondary' },
              { label: 'Base Case', value: '₹3,450.80', color: 'text-primary' },
              { label: 'Bear Case', value: '₹2,820.00', color: 'text-tertiary' },
              { label: 'Prob. Distribution', value: 'Gaussian', color: 'text-on-surface-variant' }
            ].map(item => (
              <div key={item.label}>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-widest block mb-1">{item.label}</span>
                <span className={`text-xl font-headline font-bold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Prediction Insights */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
          <div className="bg-surface-container rounded-3xl p-6 border border-outline-variant/10">
            <h3 className="font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
              <Target size={18} className="text-primary" />
              Key Drivers
            </h3>
            <div className="space-y-6">
              {[
                { label: 'Energy Demand', impact: 'High', color: 'text-secondary' },
                { label: 'Retail Growth', impact: 'Neutral', color: 'text-on-surface-variant' },
                { label: 'Macro Liquidity', impact: 'Positive', color: 'text-secondary' }
              ].map(driver => (
                <div key={driver.label}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-on-surface">{driver.label}</span>
                    <span className={`text-[10px] font-bold uppercase ${driver.color}`}>{driver.impact}</span>
                  </div>
                  <div className="h-1 w-full bg-surface-highest rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-low rounded-3xl p-6 border border-outline-variant/10">
            <h3 className="font-headline font-bold text-on-surface mb-4">Model Summary</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
              The Sovereign v4.2 engine utilizes a hybrid Transformer-LSTM architecture trained on 15 years of institutional order flow and semantic macro data.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-on-surface">
                <ShieldCheck size={14} className="text-secondary" />
                <span>Backtested Accuracy: 92.1%</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-on-surface">
                <Clock size={14} className="text-primary" />
                <span>Last Updated: 12m ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
