import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Bookmark,
  ArrowRight,
  Filter,
  Zap,
  Clock,
  ShieldCheck,
  BarChart3,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { fetchMarketNews, Article } from '../services/newsService';

export interface MarketInsightsProps {
  articles: Article[];
  loading: boolean;
}

export const MarketInsights: React.FC<MarketInsightsProps> = ({ articles, loading }) => {
  const [error, setError] = useState<string | null>(null);

  const getSentimentConfig = (sentiment: Article['sentiment']) => {
    switch (sentiment) {
      case 'high-alpha':
        return { label: 'High Alpha', color: 'text-primary bg-primary/20', icon: <Zap size={12} /> };
      case 'bullish':
        return { label: 'Bullish', color: 'text-secondary bg-secondary/20', icon: <TrendingUp size={12} /> };
      case 'bearish':
        return { label: 'Bearish', color: 'text-tertiary bg-tertiary/20', icon: <TrendingDown size={12} /> };
      default:
        return { label: 'Neutral', color: 'text-on-surface-variant bg-surface-highest', icon: <BarChart3 size={12} /> };
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-4xl font-headline font-extrabold tracking-tighter text-on-surface mb-2">Market Insights</h1>
            <p className="text-on-surface-variant font-body">Real-time institutional intelligence processed via VADER sentiment engine.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-surface-low px-4 py-2 rounded-xl flex items-center gap-3 shadow-inner border border-outline-variant/10">
              <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/60">Intelligence Feed</span>
              <div className="flex items-center gap-2 px-2 py-1 bg-surface-highest rounded-lg">
                <div className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-primary animate-pulse' : 'bg-secondary'}`}></div>
                <span className="text-[10px] font-bold uppercase tracking-tighter">Live</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* News Feed */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-surface-low rounded-2xl h-48 animate-pulse border border-outline-variant/10"></div>
            ))
          ) : error ? (
            <div className="bg-tertiary/10 border border-tertiary/20 rounded-2xl p-12 text-center">
              <AlertCircle className="text-tertiary mx-auto mb-4" size={48} />
              <p className="text-on-surface font-headline font-bold">{error}</p>
              <button onClick={() => window.location.reload()} className="mt-4 text-xs font-bold uppercase tracking-widest text-primary underline">Try Reconnect</button>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {articles.map((article, index) => {
                const config = getSentimentConfig(article.sentiment);
                return (
                  <motion.article 
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-surface-low rounded-2xl overflow-hidden hover:bg-surface-container transition-all duration-300 border border-outline-variant/10"
                  >
                    <div className="flex flex-col md:flex-row h-full">
                      {article.image && (
                        <div className="md:w-1/3 relative h-48 md:h-auto overflow-hidden">
                          <img 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                            src={article.image} 
                            alt={article.title}
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-surface-low/80 to-transparent"></div>
                          <div className="absolute top-4 left-4">
                            <span className={`px-2.5 py-1 ${config.color} text-[10px] font-bold uppercase tracking-widest rounded-lg flex items-center gap-1.5 backdrop-blur-md border border-white/5 shadow-lg`}>
                              {config.icon}
                              {config.label}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className={`${article.image ? 'md:w-2/3' : 'w-full'} p-8 flex flex-col justify-between`}>
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-primary text-[10px] font-label uppercase tracking-widest font-bold px-2 py-0.5 bg-primary/5 rounded border border-primary/10">
                              {article.category}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-outline-variant/30"></span>
                            <span className="text-on-surface-variant text-[10px] font-label uppercase tracking-widest font-medium italic">{article.time}</span>
                          </div>
                          <h2 className="text-xl font-headline font-bold text-on-surface leading-tight mb-4 group-hover:text-primary transition-colors line-clamp-2">
                            {article.title}
                          </h2>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {article.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="px-1.5 py-0.5 bg-surface-highest text-on-surface-variant text-[9px] font-bold rounded border border-outline-variant/5 uppercase tracking-tighter">
                                ${tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-outline-variant/5 flex items-center justify-between">
                          <span className="text-[10px] text-on-surface-variant font-medium">Source Authenticated</span>
                          <a 
                            href={article.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-primary text-[10px] font-bold uppercase tracking-widest hover:gap-2.5 transition-all group/link"
                          >
                            Full Insight <ArrowRight size={12} className="group-hover/link:translate-x-1 transition-transform" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          )}
        </section>

        {/* Sidebar */}
        <aside className="lg:col-span-4 flex flex-col gap-8">
          <div className="bg-surface-container rounded-3xl p-8 shadow-xl border border-outline-variant/10 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-8">
                <Zap className="text-primary" size={20} />
                <h3 className="font-headline font-bold text-lg text-on-surface">Alpha Signals</h3>
              </div>
              <div className="flex flex-col gap-8">
                {[
                  { sector: 'Energy Sector', title: 'Hydrogen Transition Pulse', growth: '+4.2%', progress: 75 },
                  { sector: 'Tech Sector', title: 'Quantum Standard Alignment', growth: 'Vol High', progress: 40 },
                  { sector: 'Defense', title: 'Autonomous Marine Contracts', growth: 'Watch List', progress: 62 }
                ].map((item, i) => (
                  <div key={i} className="group cursor-pointer">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/60">{item.sector}</span>
                      <span className={`text-[10px] font-label font-bold ${i === 2 ? 'text-tertiary' : 'text-secondary'}`}>{item.growth}</span>
                    </div>
                    <h4 className="text-sm font-headline font-bold text-on-surface group-hover:text-primary transition-colors mb-3">{item.title}</h4>
                    <div className="h-1 w-full bg-surface-highest rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progress}%` }}
                        className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(189,194,255,0.3)]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          </div>

          <div className="bg-surface-low rounded-3xl p-8 border border-outline-variant/10 shadow-sm">
            <h3 className="font-headline font-bold text-sm text-on-surface mb-6 flex items-center gap-2">
              <BarChart3 size={16} className="text-primary" />
              Intelligence Metrics
            </h3>
            <div className="space-y-6">
              {[
                { label: 'Bullish Bias', value: '62%', color: 'text-secondary', sub: 'Institutional' },
                { label: 'Buying Pressure', value: 'High', color: 'text-primary', sub: 'Alpha Optimized' },
                { label: 'Retail Fear', value: 'Extreme', color: 'text-tertiary', sub: 'Contrarian Signal' }
              ].map((metric, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div>
                    <p className="text-xs text-on-surface-variant font-medium">{metric.label}</p>
                    <p className="text-[9px] uppercase tracking-widest text-on-surface-variant/40 mt-0.5">{metric.sub}</p>
                  </div>
                  <span className={`text-sm font-bold ${metric.color} group-hover:scale-110 transition-transform`}>{metric.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-8 relative overflow-hidden border border-white/5 shadow-2xl">
            <div className="relative z-10">
              <h3 className="font-headline font-bold text-sm text-white mb-1">Global Session Monitor</h3>
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                Markets Active
              </p>
              <div className="text-4xl font-headline font-extrabold text-white tracking-tighter mb-2">14:32:05</div>
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Latency</span>
                <span className="text-[10px] text-secondary font-bold font-mono">0.02ms</span>
              </div>
            </div>
            <Clock className="absolute -right-6 -bottom-6 opacity-5 text-white/20" size={120} strokeWidth={1} />
          </div>
        </aside>
      </div>
    </div>
  );
};
