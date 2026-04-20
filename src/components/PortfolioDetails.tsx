import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  MoreVertical,
  Filter,
  Download,
  Search,
  Plus,
  Loader2,
  X,
  PieChart as PieChartIcon
} from 'lucide-react';
import { Holding } from '../types';

interface PortfolioDetailsProps {
  holdings: Holding[];
  setHoldings: React.Dispatch<React.SetStateAction<Holding[]>>;
  currency: string;
}

export const PortfolioDetails: React.FC<PortfolioDetailsProps> = ({ holdings, setHoldings, currency }) => {
  const conversionRates: Record<string, { rate: number, symbol: string }> = {
    'INR': { rate: 1, symbol: '₹' },
    'USD': { rate: 0.012, symbol: '$' },
    'EUR': { rate: 0.011, symbol: '€' },
    'GBP': { rate: 0.0094, symbol: '£' }
  };

  const { rate, symbol } = conversionRates[currency] || conversionRates['INR'];

  const [activeTab, setActiveTab] = useState<'all' | 'stock' | 'mutual_fund'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('1Y');
  
  // Modal State
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [quantity, setQuantity] = useState<string>('1');
  const [buyPrice, setBuyPrice] = useState<string>('');
  const [showModal, setShowModal] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    setError(null);
    setShowDropdown(true);

    try {
      // Step 1: Search Yahoo Finance for matching tickers
      const searchUrl = `/api/yahoo-search/v1/finance/search?q=${encodeURIComponent(query)}&lang=en-US&region=IN&quotesCount=6&newsCount=0&listsCount=0`;
      const searchRes = await fetch(searchUrl);
      if (!searchRes.ok) throw new Error(`Search HTTP ${searchRes.status}`);
      const searchData = await searchRes.json();

      // Filter to equities and mutual funds, prefer Indian (NS/BO) tickers
      const quotes = (searchData.quotes || [])
        .filter((q: any) => q.quoteType === 'EQUITY' || q.quoteType === 'MUTUALFUND')
        .slice(0, 5);

      if (quotes.length === 0) {
        setSearchResults([]);
        return;
      }

      // Step 2: Fetch live prices for each result via the chart API
      const results = await Promise.all(
        quotes.map(async (q: any) => {
          try {
            const chartUrl = `/api/yahoo-finance/v8/finance/chart/${encodeURIComponent(q.symbol)}?interval=1d&range=1d`;
            const chartRes = await fetch(chartUrl);
            if (!chartRes.ok) return null;
            const chartData = await chartRes.json();
            const meta = chartData.chart?.result?.[0]?.meta;
            const price = meta?.regularMarketPrice || meta?.previousClose || 0;

            // Determine asset type
            const assetType = q.quoteType === 'MUTUALFUND' ? 'mutual_fund' : 'stock';

            // Derive sector from industry or exchange
            const sector = q.industry || q.sector || q.exchDisp || 'Equity';

            return {
              ticker: q.symbol,
              name: q.shortname || q.longname || q.symbol,
              sector,
              type: assetType,
              price,
            };
          } catch {
            return null;
          }
        })
      );

      setSearchResults(results.filter(Boolean));
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to retrieve market data. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  };

  const openQuantityModal = (asset: any) => {
    setSelectedAsset(asset);
    setQuantity('1');
    setBuyPrice(asset.price.toString());
    setShowModal(true);
    setShowDropdown(false);
    setSearchQuery('');
  };

  const addStockToPortfolio = () => {
    if (!selectedAsset) return;
    
    const qty = parseFloat(quantity);
    const cost = parseFloat(buyPrice);
    if (isNaN(qty) || qty <= 0 || isNaN(cost) || cost <= 0) return;

    const plValue = ((selectedAsset.price - cost) / cost) * 100;

    const newHolding: Holding = {
      ticker: selectedAsset.ticker,
      name: selectedAsset.name,
      sector: selectedAsset.sector,
      type: selectedAsset.type,
      price: selectedAsset.price,
      avgCost: cost,
      quantity: qty,
      marketValue: selectedAsset.price * qty,
      plPercent: parseFloat(plValue.toFixed(2)),
      weight: 0 // Will be calculated in render
    };

    setHoldings(prev => {
      const existing = prev.find(h => h.ticker === newHolding.ticker);
      if (existing) {
        const totalQty = existing.quantity + qty;
        const totalCost = (existing.avgCost * existing.quantity) + (cost * qty);
        const newAvgCost = totalCost / totalQty;
        const newPLPercent = ((selectedAsset.price - newAvgCost) / newAvgCost) * 100;

        return prev.map(h => h.ticker === newHolding.ticker ? {
          ...h,
          quantity: totalQty,
          avgCost: newAvgCost,
          marketValue: h.price * totalQty,
          plPercent: parseFloat(newPLPercent.toFixed(2))
        } : h);
      }
      return [...prev, newHolding];
    });

    setShowModal(false);
    setSelectedAsset(null);
  };

  const filteredHoldings = holdings.filter(h => {
    if (activeTab === 'all') return true;
    return h.type === activeTab;
  });

  const totalValue = filteredHoldings.reduce((sum, h) => sum + h.marketValue, 0) * rate;
  const totalCost = filteredHoldings.reduce((sum, h) => sum + (h.avgCost * h.quantity), 0) * rate;
  const totalPL = totalValue - totalCost;
  const plPercent = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;

  // Real-time Allocation Calculation
  const sectorAllocation = filteredHoldings.reduce((acc: { [key: string]: number }, h) => {
    acc[h.sector] = (acc[h.sector] || 0) + h.marketValue;
    return acc;
  }, {});

  const sortedSectors = (Object.entries(sectorAllocation) as [string, number][])
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({
      name,
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
    }));

  const colors = ['#1a237e', '#bdc2ff', '#88d982', '#353534', '#F27D26', '#FF4444'];

  // Dynamic Graph Generation
  const generateGraphPath = () => {
    if (filteredHoldings.length === 0) return { line: "", area: "" };
    
    const points = 12;
    const width = 1000;
    const height = 200;
    const padding = 40;
    
    // Use a fixed seed-like approach for consistency per tab/holdings
    const startY = height - padding - ((totalCost / (Math.max(totalValue, totalCost) * 1.2 || 1)) * (height - 2 * padding));
    const endY = height - padding - ((totalValue / (Math.max(totalValue, totalCost) * 1.2 || 1)) * (height - 2 * padding));
    
    let pathData = `M 0 ${startY}`;
    let areaData = `M 0 ${startY}`;
    
    for (let i = 1; i < points; i++) {
      const x = (i / (points - 1)) * width;
      const progress = i / (points - 1);
      const trendY = startY + (endY - startY) * progress;
      
      // More realistic financial curve: some volatility but trending
      const volatility = (totalPL !== 0 ? Math.abs(totalPL / totalCost) : 0.1) * 50;
      const noise = (Math.sin(i * 1.5) * 0.5 + Math.cos(i * 0.8) * 0.5) * volatility;
      
      const y = i === points - 1 ? endY : Math.max(padding, Math.min(height - padding, trendY + noise));
      
      pathData += ` L ${x} ${y}`;
      areaData += ` L ${x} ${y}`;
    }
    
    areaData += ` V ${height} H 0 Z`;
    return { line: pathData, area: areaData, lastY: endY };
  };

  const graphData = generateGraphPath();

  return (
    <div className="max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
        <div className="max-w-2xl w-full">
          <div className="flex items-center gap-4 mb-2">
            <p className="text-primary font-label text-xs uppercase tracking-[0.2em]">Portfolio Overview</p>
            <div className="flex gap-1">
              {['1D', '1M', '1Y', 'ALL'].map((period) => (
                <button 
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    selectedPeriod === period ? 'bg-surface-highest text-on-surface' : 'bg-surface-low text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-on-surface mb-4">
            {symbol}{totalValue.toLocaleString()}<span className="text-xl text-on-surface-variant font-medium ml-3 tracking-normal">.00</span>
          </h1>
          <div className="flex items-center gap-4">
            <span className={`flex items-center gap-1 text-sm font-semibold ${totalPL >= 0 ? 'text-secondary' : 'text-tertiary'}`}>
              {totalPL >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {totalPL >= 0 ? '+' : ''}{plPercent.toFixed(2)}% ({symbol}{Math.abs(totalPL).toLocaleString()})
            </span>
            <span className="text-on-surface-variant text-sm border-l border-outline-variant/30 pl-4">Institutional Alpha Fund II</span>
          </div>
        </div>
        
        <div className="w-full max-w-md relative" ref={dropdownRef}>
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-on-surface-variant/40 group-focus-within:text-primary transition-colors">
              {isSearching ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
            </div>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowDropdown(true)}
              placeholder="Search stocks or mutual funds..."
              className="w-full h-14 pl-12 pr-32 bg-surface-low border border-outline-variant/10 rounded-2xl text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body"
            />
            <button 
              type="submit"
              disabled={isSearching}
              className="absolute right-2 top-2 bottom-2 px-6 bg-primary text-on-primary rounded-xl font-headline font-bold text-xs uppercase tracking-widest hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50"
            >
              Search
            </button>
          </form>

          {/* Search Dropdown */}
          <AnimatePresence>
            {showDropdown && (searchResults.length > 0 || isSearching) && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-surface-container border border-outline-variant/10 rounded-2xl shadow-2xl overflow-hidden z-50"
              >
                {isSearching ? (
                  <div className="p-8 flex flex-col items-center gap-3 text-on-surface-variant">
                    <Loader2 size={24} className="animate-spin text-primary" />
                    <p className="text-xs uppercase tracking-widest font-bold">Scanning Markets...</p>
                  </div>
                ) : (
                  <div className="p-2">
                    {searchResults.map((result) => (
                      <button
                        key={result.ticker}
                        onClick={() => openQuantityModal(result)}
                        className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-surface-highest transition-all text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-surface-low rounded-lg flex items-center justify-center font-bold text-[10px] text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                            {result.ticker}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-on-surface">{result.name}</p>
                            <p className="text-[10px] text-on-surface-variant">{result.sector}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-on-surface">{symbol}{(result.price * rate).toLocaleString()}</p>
                          <Plus size={14} className="text-primary ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Quantity Modal */}
      <AnimatePresence>
        {showModal && selectedAsset && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-surface-container border border-outline-variant/10 rounded-3xl p-8 shadow-2xl"
            >
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-surface-low rounded-2xl flex items-center justify-center font-bold text-lg text-primary border border-outline-variant/5">
                  {selectedAsset.ticker}
                </div>
                <div>
                  <h3 className="text-xl font-headline font-bold text-on-surface">{selectedAsset.name}</h3>
                  <p className="text-sm text-on-surface-variant">{selectedAsset.sector}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Current Price</label>
                  <p className="text-2xl font-headline font-bold text-on-surface">{symbol}{(selectedAsset.price * rate).toLocaleString()}</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Quantity Owned</label>
                  <input 
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    autoFocus
                    className="w-full h-14 px-6 bg-surface-low border border-outline-variant/10 rounded-2xl text-2xl font-headline font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Buy Price (Avg Cost)</label>
                  <input 
                    type="number"
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(e.target.value)}
                    className="w-full h-14 px-6 bg-surface-low border border-outline-variant/10 rounded-2xl text-2xl font-headline font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div className="pt-4 border-t border-outline-variant/10">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-sm text-on-surface-variant">Estimated Market Value</span>
                    <span className="text-xl font-headline font-bold text-primary">
                      {symbol}{(selectedAsset.price * (parseFloat(quantity) || 0) * rate).toLocaleString()}
                    </span>
                  </div>
                  <button 
                    onClick={addStockToPortfolio}
                    className="w-full h-14 bg-primary text-on-primary rounded-2xl font-headline font-bold text-sm uppercase tracking-widest hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/20"
                  >
                    Add to Portfolio
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {error && (
        <div className="mb-8 p-4 bg-tertiary/10 border border-tertiary/20 rounded-xl text-tertiary text-sm font-medium flex items-center gap-3">
          <TrendingDown size={18} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6 mb-12">
        {/* Performance Chart */}
        <div className="col-span-12 lg:col-span-8 bg-surface-low rounded-2xl p-8 relative overflow-hidden border border-outline-variant/10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-headline text-lg font-bold">Portfolio Value</h3>
              <p className="text-xs text-on-surface-variant">Performance based on current search results</p>
            </div>
          </div>
          <div className="h-64 w-full relative">
            {filteredHoldings.length > 0 ? (
              <svg className="w-full h-full" viewBox="0 0 1000 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient2" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#bdc2ff" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#bdc2ff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <motion.path 
                  key={`line-${activeTab}-${filteredHoldings.length}`}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  d={graphData.line} 
                  fill="none" 
                  stroke="#bdc2ff" 
                  strokeLinecap="round" 
                  strokeWidth="3" 
                />
                <motion.path 
                  key={`area-${activeTab}-${filteredHoldings.length}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 1 }}
                  d={graphData.area} 
                  fill="url(#chartGradient2)" 
                />
                <line stroke="#454652" strokeDasharray="4" x1="1000" x2="1000" y1="0" y2="200" opacity="0.3" />
                <circle cx="1000" cy={graphData.lastY} fill="#bdc2ff" r="5" stroke="#131313" strokeWidth="2" />
              </svg>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-on-surface-variant/30 border-2 border-dashed border-outline-variant/10 rounded-xl">
                <PieChartIcon size={48} className="mb-4 opacity-20" />
                <p className="font-label uppercase tracking-widest text-xs">No data available</p>
              </div>
            )}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-on-surface-variant uppercase tracking-tighter">
              <span>{(totalValue * 1.1 / 10000000).toFixed(1)}Cr</span>
              <span>{(totalValue / 10000000).toFixed(1)}Cr</span>
              <span>{(totalValue * 0.9 / 10000000).toFixed(1)}Cr</span>
              <span>{(totalValue * 0.8 / 10000000).toFixed(1)}Cr</span>
            </div>
          </div>
        </div>

        {/* Allocation */}
        <div className="col-span-12 lg:col-span-4 bg-surface-low rounded-2xl p-8 flex flex-col border border-outline-variant/10">
          <h3 className="font-headline text-lg font-bold mb-8">Allocation</h3>
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <svg className="w-48 h-48 -rotate-90" viewBox="0 0 100 100">
              {filteredHoldings.length === 0 ? (
                <circle cx="50" cy="50" fill="transparent" r="40" stroke="#353534" strokeDasharray="251.2" strokeDashoffset="0" strokeWidth="12" opacity="0.2" />
              ) : (
                sortedSectors.map((sector, index) => {
                  let offset = 0;
                  for (let i = 0; i < index; i++) {
                    offset += (sortedSectors[i].percentage / 100) * 251.2;
                  }
                  return (
                    <circle
                      key={sector.name}
                      cx="50"
                      cy="50"
                      fill="transparent"
                      r="40"
                      stroke={colors[index % colors.length]}
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (sector.percentage / 100) * 251.2}
                      strokeWidth="12"
                      style={{ transform: `rotate(${offset * (360 / 251.2)}deg)`, transformOrigin: 'center' }}
                    />
                  );
                })
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-on-surface-variant">Top Sector</span>
              <span className="text-xl font-bold font-headline truncate max-w-[120px] text-center px-2">
                {sortedSectors.length > 0 ? sortedSectors[0].name : "N/A"}
              </span>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {sortedSectors.length > 0 ? (
              sortedSectors.slice(0, 4).map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[index % colors.length] }}></div>
                  <span className="text-xs text-on-surface-variant truncate">{item.name} ({item.percentage.toFixed(1)}%)</span>
                </div>
              ))
            ) : (
              ['Tech', 'Energy', 'Financials', 'Cash'].map(label => (
                <div key={label} className="flex items-center gap-2 opacity-20">
                  <div className="w-2 h-2 rounded-full bg-on-surface-variant"></div>
                  <span className="text-xs text-on-surface-variant">{label}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <section className="bg-surface-low rounded-2xl overflow-hidden border border-outline-variant/10">
        <div className="px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-outline-variant/10 gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="font-headline text-lg font-bold">Comprehensive Holdings</h3>
            <div className="flex gap-4 mt-2">
              {[
                { id: 'all', label: 'All Assets' },
                { id: 'stock', label: 'Stocks' },
                { id: 'mutual_fund', label: 'Mutual Funds' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`text-xs font-bold uppercase tracking-widest pb-2 transition-all border-b-2 ${
                    activeTab === tab.id 
                      ? 'text-primary border-primary' 
                      : 'text-on-surface-variant/40 border-transparent hover:text-on-surface-variant'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
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
                <th className="px-4 py-4 font-semibold">Quantity</th>
                <th className="px-4 py-4 font-semibold">Market Value</th>
                <th className="px-4 py-4 font-semibold">P/L (%)</th>
                <th className="px-4 py-4 font-semibold">Weight</th>
                <th className="px-8 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              <AnimatePresence mode="popLayout">
                {filteredHoldings.length > 0 ? (
                  filteredHoldings.map((holding) => (
                    <motion.tr 
                      key={holding.ticker}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="hover:bg-surface-container transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="px-2 min-w-[48px] h-10 rounded-lg bg-surface-highest flex items-center justify-center font-bold text-[10px] text-primary">{holding.ticker}</div>
                          <div>
                            <div className="text-sm font-bold text-on-surface">{holding.name}</div>
                            <div className="text-[10px] text-on-surface-variant">{holding.sector}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-6 font-medium text-sm">{symbol}{(holding.price * rate).toLocaleString()}</td>
                      <td className="px-4 py-6 font-medium text-sm text-on-surface-variant">{holding.quantity.toLocaleString()}</td>
                      <td className="px-4 py-6 font-bold text-sm">{symbol}{(holding.marketValue * rate).toLocaleString()}</td>
                      <td className="px-4 py-6">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${holding.plPercent >= 0 ? 'bg-secondary/10 text-secondary' : 'bg-tertiary/10 text-tertiary'}`}>
                          {holding.plPercent > 0 ? '+' : ''}{holding.plPercent}%
                        </span>
                      </td>
                      <td className="px-4 py-6">
                        <div className="w-24 h-1.5 bg-surface-highest rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${(holding.marketValue / totalValue * 100) || 0}%` }}></div>
                        </div>
                        <span className="text-[10px] text-on-surface-variant mt-1 block">{((holding.marketValue / totalValue * 100) || 0).toFixed(1)}%</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => setHoldings(prev => prev.filter(h => h.ticker !== holding.ticker))}
                          className="text-on-surface-variant hover:text-tertiary transition-all"
                        >
                          <X size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-30">
                        <Search size={48} />
                        <div className="space-y-1">
                          <p className="font-headline font-bold text-lg">No Holdings Found</p>
                          <p className="text-xs uppercase tracking-widest font-label">Search for assets to populate your portfolio</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        <div className="px-8 py-4 bg-surface-highest/10 flex items-center justify-between text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">
          <span>Showing {filteredHoldings.length} Assets</span>
          <div className="flex gap-4">
            <button className="hover:text-primary transition-colors">Previous</button>
            <button className="text-on-surface">1</button>
            <button className="hover:text-primary transition-colors">Next</button>
          </div>
        </div>
      </section>
    </div>
  );
};
