/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { MarketInsights } from './components/MarketInsights';
import { PortfolioDetails } from './components/PortfolioDetails';
import { AccessRequest } from './components/AccessRequest';
import { AccessRecovery } from './components/AccessRecovery';
import { SecurityKeyRecovery } from './components/SecurityKeyRecovery';
import { PredictionEngine } from './components/PredictionEngine';
import { HistoryTab } from './components/HistoryTab';
import { Sidebar, TopNav } from './components/Layout';
import { AuthProvider } from './context/AuthContext';
import { SettingsModal } from './components/SettingsModal';
import { HOLDINGS_BASE, FALLBACK_PRICES, FALLBACK_INDICES } from './constants';
import { Holding } from './types';
import { fetchLivePrices, fetchMarketIndices, type PriceData, type MarketIndex } from './services/marketData';
import { fetchMarketNews, Article } from './services/newsService';

type Screen = 'login' | 'dashboard' | 'request' | 'recovery' | 'key-recovery';
type DashboardTab = 'overview' | 'watchlist' | 'positions' | 'risk' | 'history' | 'predictions' | 'insights';

// Persistent State Initialization
const getInitialScreen = (): Screen => {
  const saved = localStorage.getItem('rtp_screen');
  return (saved as Screen) || 'login';
};

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>(getInitialScreen);

  useEffect(() => {
    localStorage.setItem('rtp_screen', screen);
  }, [screen]);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [userType, setUserType] = useState<'institutional' | 'personal'>('institutional');
  const [holdings, setHoldings] = useState<Holding[]>(() => 
    HOLDINGS_BASE.map(h => ({
      ...h,
      price: FALLBACK_PRICES[h.ticker] || 0,
      marketValue: (FALLBACK_PRICES[h.ticker] || 0) * h.quantity,
      plPercent: 0,
      weight: 0
    }))
  );
  const [livePrices, setLivePrices] = useState<Record<string, PriceData>>({});
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>(FALLBACK_INDICES);
  const [news, setNews] = useState<Article[]>([]);
  const [reliancePrice, setReliancePrice] = useState<number>(FALLBACK_PRICES['RELIANCE']);
  const [pricesLoading, setPricesLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(true);
  const [latency, setLatency] = useState<number>(14);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currency, setCurrency] = useState('INR');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [notifications, setNotifications] = useState({
    priceAlerts: true,
    marketNews: true,
    securityAlerts: true,
    alphaSignals: false
  });

  // Fetch live prices on mount and set up polling
  const fetchPrices = useCallback(async () => {
    // Fetch for all current holdings + market indices
    const tickers = holdings.map(h => h.ticker);
    
    // Add default tickers if not in holdings to ensure dashboard charts work
    HOLDINGS_BASE.forEach(h => {
      if (!tickers.includes(h.ticker)) tickers.push(h.ticker);
    });

    const [prices, indices] = await Promise.all([
      fetchLivePrices(tickers),
      fetchMarketIndices()
    ]);

    setLivePrices(prev => ({ ...prev, ...prices }));
    if (indices.length > 0) setMarketIndices(indices);
    if (prices['RELIANCE']?.price) setReliancePrice(prices['RELIANCE'].price);
    setPricesLoading(false);
  }, [holdings]);

  const fetchMarketIntelligence = useCallback(async () => {
    try {
      const articles = await fetchMarketNews('Indian Stock Market Business');
      setNews(articles);
    } catch (err) {
      console.error('Failed to fetch news:', err);
    } finally {
      setNewsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    fetchMarketIntelligence();
    const pollInterval = setInterval(fetchPrices, 30000); 
    const newsInterval = setInterval(fetchMarketIntelligence, 60000);
    return () => {
      clearInterval(pollInterval);
      clearInterval(newsInterval);
    };
  }, [fetchPrices, fetchMarketIntelligence]);

  // Sync holdings with live prices periodically
  useEffect(() => {
    if (Object.keys(livePrices).length > 0) {
      setHoldings(prev => {
        const updated = prev.map(h => {
          const liveData = livePrices[h.ticker];
          if (!liveData) return h;

          const price = liveData.price;
          const marketValue = price * h.quantity;
          const costBasis = h.avgCost * h.quantity;
          const plPercent = costBasis > 0 ? ((marketValue - costBasis) / costBasis) * 100 : 0;

          return {
            ...h,
            price,
            marketValue,
            plPercent
          };
        });

        // Calculate weights on updated set
        const totalValue = updated.reduce((sum, h) => sum + h.marketValue, 0);
        return updated.map(h => ({
          ...h,
          weight: totalValue > 0 ? (h.marketValue / totalValue) * 100 : 0
        }));
      });
    }
  }, [livePrices]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setLatency(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        const next = prev + change;
        return Math.max(8, Math.min(32, next));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = () => {
    setScreen('dashboard');
  };

  const handleLogout = () => {
    setScreen('login');
  };

  const renderDashboardContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Dashboard holdings={holdings} currency={currency} marketIndices={marketIndices} pricesLoading={pricesLoading} livePrices={livePrices} news={news} />;
      case 'positions':
        return <PortfolioDetails holdings={holdings} setHoldings={setHoldings} currency={currency} />;
      case 'predictions':
        return <PredictionEngine currency={currency} currentPrice={reliancePrice} />;
      case 'insights':
        return <MarketInsights articles={news} loading={newsLoading} />;
      case 'history':
        return <HistoryTab />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-on-surface-variant">
            <h2 className="text-4xl font-headline font-extrabold mb-4 tracking-tighter text-on-surface">Under Development</h2>
            <p className="text-sm font-body opacity-60">This institutional module is currently being optimized for Tier-1 access.</p>
          </div>
        );
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background text-on-surface selection:bg-primary/30">
        <AnimatePresence mode="wait">
        {screen === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Login 
              onLogin={handleLogin} 
              onNavigateToRequest={() => setScreen('request')}
              onNavigateToRecovery={() => setScreen('recovery')}
            />
          </motion.div>
        )}

        {screen === 'request' && (
          <motion.div
            key="request"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AccessRequest onNavigateToLogin={() => setScreen('login')} />
          </motion.div>
        )}

        {screen === 'recovery' && (
          <motion.div
            key="recovery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AccessRecovery onNavigateToLogin={() => setScreen('login')} />
          </motion.div>
        )}

        {screen === 'key-recovery' && (
          <motion.div
            key="key-recovery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SecurityKeyRecovery onNavigateToLogin={() => setScreen('login')} />
          </motion.div>
        )}

        {screen === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`flex flex-col min-h-screen ${theme === 'light' ? 'bg-white text-slate-900' : 'bg-background text-on-surface'}`}
          >
            <SettingsModal 
              isOpen={isSettingsOpen} 
              onClose={() => setIsSettingsOpen(false)} 
              currency={currency}
              setCurrency={setCurrency}
              theme={theme}
              setTheme={setTheme}
              notifications={notifications}
              setNotifications={setNotifications}
            />
            <TopNav 
              userType={userType} 
              activeTab={activeTab} 
              setActiveTab={(tab) => setActiveTab(tab as DashboardTab)} 
              onLogout={handleLogout}
              onSettingsOpen={() => setIsSettingsOpen(true)}
              currency={currency}
            />
            <div className="flex flex-1 pt-16">
              <Sidebar 
                activeTab={activeTab === 'predictions' || activeTab === 'insights' ? 'overview' : activeTab} 
                setActiveTab={(tab) => setActiveTab(tab as DashboardTab)} 
                onLogout={handleLogout}
              />
              <main className="flex-1 lg:ml-64 p-8 lg:p-12 overflow-y-auto no-scrollbar">
                {/* Internal Navigation for Demo Purposes */}
                <div className="mb-8 flex gap-4 overflow-x-auto no-scrollbar pb-2">
                  {[
                    { id: 'overview', label: 'Dashboard' },
                    { id: 'insights', label: 'Market Insights' },
                    { id: 'positions', label: 'Portfolio' },
                    { id: 'predictions', label: 'Prediction Engine' }
                  ].map(nav => (
                    <button
                      key={nav.id}
                      onClick={() => setActiveTab(nav.id as DashboardTab)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${
                        activeTab === nav.id 
                          ? 'bg-primary text-on-primary border-primary shadow-lg shadow-primary/20' 
                          : 'bg-surface-low text-on-surface-variant border-outline-variant/10 hover:border-primary/40'
                      }`}
                    >
                      {nav.label}
                    </button>
                  ))}
                </div>
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderDashboardContent()}
                  </motion.div>
                </AnimatePresence>

                <footer className="mt-20 pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4 opacity-40">
                  <div className="flex gap-6">
                    <span className="text-[10px] font-label uppercase tracking-widest">System Status: Operational</span>
                    <span className="text-[10px] font-label uppercase tracking-widest">Latency: {latency}ms</span>
                  </div>
                </footer>
              </main>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </AuthProvider>
  );
};

export default App;
