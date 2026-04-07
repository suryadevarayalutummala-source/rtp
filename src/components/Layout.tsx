import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Eye, 
  PieChart, 
  ShieldCheck, 
  History, 
  HelpCircle, 
  LogOut,
  Bell,
  Settings,
  Search,
  User,
  ChevronRight,
  Shield,
  CreditCard,
  Activity,
  Loader2,
  Plus,
  Cpu,
  Zap
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'watchlist', label: 'Watchlist', icon: <Eye size={20} /> },
    { id: 'positions', label: 'Positions', icon: <PieChart size={20} /> },
    { id: 'predictions', label: 'Predictions', icon: <Cpu size={20} /> },
    { id: 'insights', label: 'Insights', icon: <Zap size={20} /> },
    { id: 'risk', label: 'Risk Metrics', icon: <ShieldCheck size={20} /> },
    { id: 'history', label: 'History', icon: <History size={20} /> },
  ];

  return (
    <aside className="hidden lg:flex flex-col h-screen w-64 fixed left-0 top-16 bg-surface-low p-4 gap-2 z-40 border-r border-outline-variant/10">
      <div className="mb-8 px-4 py-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center">
            <PieChart className="text-primary fill-primary/20" size={24} />
          </div>
          <div>
            <h3 className="font-headline font-bold text-on-surface text-sm">Global Equity</h3>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-medium">Institutional Alpha</p>
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-3 px-4 py-3 transition-all cursor-pointer rounded-lg font-medium text-sm ${
              activeTab === item.id 
                ? 'bg-surface-container text-primary' 
                : 'text-on-surface/50 hover:bg-surface-container/50 hover:text-on-surface'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto px-4 pb-4">
        <div className="mt-6 flex flex-col gap-2">
          <button className="flex items-center gap-3 px-4 py-2 text-on-surface/40 hover:text-primary transition-all text-xs uppercase tracking-widest text-left">
            <HelpCircle size={14} />
            <span>Support</span>
          </button>
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-2 text-on-surface/40 hover:text-primary transition-all text-xs uppercase tracking-widest text-left"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export const TopNav: React.FC<{ 
  userType?: 'institutional' | 'personal',
  activeTab: string,
  setActiveTab: (tab: string) => void,
  onLogout?: () => void,
  onSettingsOpen?: () => void,
  currency: string
}> = ({ userType = 'institutional', activeTab, setActiveTab, onLogout, onSettingsOpen, currency }) => {
  const conversionRates: Record<string, { rate: number, symbol: string }> = {
    'INR': { rate: 1, symbol: '₹' },
    'USD': { rate: 0.012, symbol: '$' },
    'EUR': { rate: 0.011, symbol: '€' },
    'GBP': { rate: 0.0094, symbol: '£' }
  };

  const { rate, symbol } = conversionRates[currency] || conversionRates['INR'];

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
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
        setShowSearchDropdown(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    setShowSearchDropdown(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Search for Indian stocks or mutual funds matching "${query}". 
        Return a list of up to 5 relevant results with their ticker symbol, full name, sector, asset type ('stock' or 'mutual_fund'), and current market price in INR.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                ticker: { type: Type.STRING },
                name: { type: Type.STRING },
                sector: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["stock", "mutual_fund"] },
                price: { type: Type.NUMBER },
              },
              required: ["ticker", "name", "sector", "type", "price"],
            },
          },
        },
      });

      const results = JSON.parse(response.text || "[]");
      setSearchResults(results);
    } catch (err) {
      console.error("Global search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const profileImage = userType === 'institutional' 
    ? "https://lh3.googleusercontent.com/aida-public/AB6AXuAJ8RqUhcGXj4Msjh07-dz-QA9tsTit0jswBg-27e0E1iDOLJ7vMqiFklzeMSsLAB8f7OPruKS7QaAsO9CalQCme3TPeYzoiKFH7Q4eRobA3MY0bUEwWz8RSFHLSDLtVWZR9UDB-fb9uHocaZEnCUTUrAdF0QmAXc5RZ8DScojVgSo5v3d7Io9GFJxumSEExuR-vVLEbmbmsoKF0-S8G1ZEUIZaaUZf4MSB_k9OYbV03oghO9FPxZc7IXBqaCFGK8bIkAUmdzPv344"
    : "https://lh3.googleusercontent.com/aida-public/AB6AXuA1smqbOYnk5U6LsXbOX9Ty3ZLYvOnFQZ8PLIgTrXiOCgiEylqe34GTyHIzFh03nE4GfG745rCFMZ93LNdvfjCtIYFwTZdsh5A-ob83ff9rGPj3sZT1i_fKlT6yPuiS9NwCOAPAgtmpwNTPrxETmju72mHVwqrPkLhsQCcY9N933JHiMM0y4XfMr7a1l7eU7L8cB4GZY9NXHUJoxb_qmSmzrHymrDp1vQlXI8gCi_wIXD0tqZcMEAx29uSvrdGvjg0Obuvl0bsBr-I";

  return (
    <header className="fixed top-0 w-full z-50 bg-background/70 backdrop-blur-xl shadow-[0_32px_32px_rgba(229,226,225,0.06)] h-16 flex items-center justify-between px-8 border-b border-outline-variant/10">
      <div className="flex items-center gap-8">
        <span className="text-xl font-bold tracking-tighter text-on-surface font-headline">Sovereign Intelligence</span>
        <nav className="hidden md:flex gap-6 items-center">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`font-headline tracking-tight transition-all ${activeTab === 'overview' ? 'text-primary border-b-2 border-primary pb-1' : 'text-on-surface/60 hover:text-on-surface'}`}
          >
            Markets
          </button>
          <button 
            onClick={() => setActiveTab('predictions')}
            className={`font-headline tracking-tight transition-all ${activeTab === 'predictions' ? 'text-primary border-b-2 border-primary pb-1' : 'text-on-surface/60 hover:text-on-surface'}`}
          >
            Predictions
          </button>
          <button 
            onClick={() => setActiveTab('insights')}
            className={`font-headline tracking-tight transition-all ${activeTab === 'insights' ? 'text-primary border-b-2 border-primary pb-1' : 'text-on-surface/60 hover:text-on-surface'}`}
          >
            Analysis
          </button>
          <button 
            onClick={() => setActiveTab('positions')}
            className={`font-headline tracking-tight transition-all ${activeTab === 'positions' ? 'text-primary border-b-2 border-primary pb-1' : 'text-on-surface/60 hover:text-on-surface'}`}
          >
            Portfolio
          </button>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center relative" ref={searchRef}>
          <div className="flex items-center bg-surface-highest/50 rounded-lg px-3 py-1.5 gap-2 hover:bg-surface-highest/70 transition-all border border-outline-variant/10 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
            <Search size={14} className="text-on-surface/60" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowSearchDropdown(true)}
              placeholder="Search Terminal..."
              className="bg-transparent border-none outline-none text-xs text-on-surface placeholder:text-on-surface/40 w-32 focus:w-48 transition-all"
            />
          </div>

          <AnimatePresence>
            {showSearchDropdown && (searchResults.length > 0 || isSearching) && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full right-0 mt-2 w-80 bg-surface-container border border-outline-variant/10 rounded-2xl shadow-2xl overflow-hidden z-50"
              >
                {isSearching ? (
                  <div className="p-6 flex flex-col items-center gap-2 text-on-surface-variant">
                    <Loader2 size={20} className="animate-spin text-primary" />
                    <p className="text-[10px] uppercase tracking-widest font-bold">Querying Markets...</p>
                  </div>
                ) : (
                  <div className="p-2">
                    {searchResults.map((result) => (
                      <button
                        key={result.ticker}
                        onClick={() => {
                          setActiveTab('positions');
                          setShowSearchDropdown(false);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-highest transition-all text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-surface-low rounded-lg flex items-center justify-center font-bold text-[9px] text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                            {result.ticker}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-on-surface truncate max-w-[140px]">{result.name}</p>
                            <p className="text-[9px] text-on-surface-variant uppercase">{result.type.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-on-surface">{symbol}{(result.price * rate).toLocaleString()}</p>
                          <ChevronRight size={12} className="text-primary ml-auto mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button className="p-2 hover:bg-surface-highest/50 rounded-full transition-all active:scale-95 duration-200">
          <Bell size={20} className="text-on-surface" />
        </button>
        <button 
          onClick={onSettingsOpen}
          className="p-2 hover:bg-surface-highest/50 rounded-full transition-all active:scale-95 duration-200"
        >
          <Settings size={20} className="text-on-surface" />
        </button>
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-8 h-8 rounded-full overflow-hidden ml-2 bg-surface-highest border border-outline-variant/20 active:scale-90 transition-transform cursor-pointer"
          >
            <img 
              className="w-full h-full object-cover" 
              src={profileImage}
              alt="User Profile"
              referrerPolicy="no-referrer"
            />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute right-0 mt-3 w-72 bg-surface-container rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.3)] border border-outline-variant/10 overflow-hidden"
              >
                <div className="p-5 border-b border-outline-variant/10 bg-surface-highest/30">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-primary/20">
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-on-surface text-sm">Institutional Admin</h4>
                      <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Tier-1 Access</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-on-surface-variant/60 uppercase tracking-widest font-bold">
                    <span>Account ID</span>
                    <span className="text-on-surface">SOV-IND-001</span>
                  </div>
                </div>

                <div className="p-2">
                  {[
                    { icon: <User size={16} />, label: 'Profile Settings', sub: 'Security & Identity' },
                    { icon: <Shield size={16} />, label: 'Security Keys', sub: 'MFA Management' },
                    { icon: <CreditCard size={16} />, label: 'Billing', sub: 'Institutional Tier' },
                    { icon: <Activity size={16} />, label: 'Audit Logs', sub: 'Access History' },
                  ].map((item, idx) => (
                    <button 
                      key={idx}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-highest/50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-on-surface-variant group-hover:text-primary transition-colors">
                          {item.icon}
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold text-on-surface">{item.label}</p>
                          <p className="text-[9px] text-on-surface-variant uppercase tracking-wider">{item.sub}</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-on-surface-variant/30 group-hover:text-primary transition-all group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>

                <div className="p-2 border-t border-outline-variant/10 bg-surface-low/30">
                  <button 
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-tertiary/10 text-on-surface-variant hover:text-tertiary transition-all group"
                  >
                    <LogOut size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest">Terminate Session</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
