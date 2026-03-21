import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Bookmark,
  ArrowRight,
  Filter,
  Zap,
  Clock,
  ShieldCheck,
  BarChart3
} from 'lucide-react';
import { ARTICLES } from '../constants';

export const MarketInsights: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-4xl font-headline font-extrabold tracking-tighter text-on-surface mb-2">Market Insights</h1>
            <p className="text-on-surface-variant font-body">Curated institutional intelligence for your portfolio positions.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-surface-low px-4 py-2 rounded-xl flex items-center gap-3 shadow-inner border border-outline-variant/5">
              <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant/60">Filter by</span>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-surface-highest text-primary text-xs font-bold rounded-lg transition-all">All Sources</button>
                <button className="px-3 py-1 hover:bg-surface-highest text-on-surface-variant text-xs font-bold rounded-lg transition-all">Sentiment</button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* News Feed */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          {ARTICLES.map((article, index) => (
            <motion.article 
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
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
                      <span className="px-3 py-1 bg-secondary/20 text-secondary text-[10px] font-bold uppercase tracking-widest rounded-lg flex items-center gap-1 backdrop-blur-md">
                        <TrendingUp size={12} />
                        Bullish
                      </span>
                    </div>
                  </div>
                )}
                <div className={`${article.image ? 'md:w-2/3' : 'w-full'} p-8 flex flex-col justify-between`}>
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-primary text-[11px] font-label uppercase tracking-widest font-bold">{article.category}</span>
                      <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                      <span className="text-on-surface-variant text-[11px] font-label uppercase tracking-widest">{article.time}</span>
                    </div>
                    <h2 className="text-2xl font-headline font-bold text-on-surface leading-tight mb-4 group-hover:text-primary transition-colors">
                      {article.title}
                    </h2>
                    <p className="text-on-surface-variant text-sm font-body leading-relaxed line-clamp-2">
                      {article.excerpt}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex gap-2">
                      {article.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-surface-highest text-on-surface text-[10px] font-bold rounded-md">{tag}</span>
                      ))}
                    </div>
                    <button className="flex items-center gap-1 text-primary text-xs font-bold uppercase tracking-widest hover:gap-2 transition-all">
                      Full Insight <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </section>

        {/* Sidebar */}
        <aside className="lg:col-span-4 flex flex-col gap-8">
          <div className="bg-surface-container rounded-2xl p-6 shadow-xl border border-outline-variant/10">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="text-primary" size={20} />
              <h3 className="font-headline font-bold text-lg text-on-surface">Trending Insights</h3>
            </div>
            <div className="flex flex-col gap-6">
              {[
                { sector: 'Energy Sector', title: 'Hydrogen Fuel Adoption in EU Fleet', growth: '+4.2%', progress: 75 },
                { sector: 'Tech Sector', title: 'Quantum Encryption Standards v2.0', growth: 'Vol High', progress: 40 },
                { sector: 'Defense Sector', title: 'Autonomous Marine Surveillance Contracts', growth: 'Watch List', progress: 62 }
              ].map((item, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/60">{item.sector}</span>
                    <span className={`text-[10px] font-label font-bold ${i === 2 ? 'text-tertiary' : 'text-secondary'}`}>{item.growth}</span>
                  </div>
                  <h4 className="text-sm font-headline font-bold text-on-surface group-hover:text-primary transition-colors">{item.title}</h4>
                  <div className="mt-2 h-1 w-full bg-surface-highest rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${item.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-2 border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-highest transition-all text-xs font-bold rounded-lg uppercase tracking-widest">
              View Market Heatmap
            </button>
          </div>

          <div className="bg-surface-low rounded-2xl p-6 border border-outline-variant/10">
            <h3 className="font-headline font-bold text-sm text-on-surface mb-4">Portfolio Sentiment</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-on-surface-variant">Bullish Bias</span>
                <span className="text-xs font-bold text-secondary">62%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-on-surface-variant">Institutional Buying</span>
                <span className="text-xs font-bold text-primary">Heavy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-on-surface-variant">Retail Fear Index</span>
                <span className="text-xs font-bold text-tertiary">Extreme</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-highest/50 rounded-2xl p-6 relative overflow-hidden border border-outline-variant/10">
            <div className="relative z-10">
              <h3 className="font-headline font-bold text-sm text-on-surface mb-1">NY Trading Session</h3>
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-4">Market Open</p>
              <div className="text-3xl font-headline font-extrabold text-on-surface tracking-tighter">14:32:05</div>
              <p className="text-[10px] text-on-surface-variant mt-2 font-medium">Until Close: 01h 27m</p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Clock size={96} strokeWidth={1} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
