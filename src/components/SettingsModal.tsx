import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Moon, 
  Sun, 
  Globe, 
  Bell, 
  Shield, 
  Key, 
  Database,
  Cpu,
  ChevronRight,
  Check
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: string;
  setCurrency: (currency: string) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  notifications: {
    priceAlerts: boolean;
    marketNews: boolean;
    securityAlerts: boolean;
    alphaSignals: boolean;
  };
  setNotifications: React.Dispatch<React.SetStateAction<{
    priceAlerts: boolean;
    marketNews: boolean;
    securityAlerts: boolean;
    alphaSignals: boolean;
  }>>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose,
  currency,
  setCurrency,
  theme,
  setTheme,
  notifications,
  setNotifications
}) => {
  const [activeSection, setActiveSection] = useState('general');

  const sections = [
    { id: 'general', label: 'General', icon: <Globe size={18} /> },
    { id: 'appearance', label: 'Appearance', icon: <Moon size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
    { id: 'api', label: 'API Access', icon: <Key size={18} /> },
    { id: 'data', label: 'Data Management', icon: <Database size={18} /> },
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-bold text-on-surface mb-4 uppercase tracking-widest">Regional Settings</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-surface-low rounded-xl border border-outline-variant/5">
                  <div>
                    <p className="text-sm font-bold text-on-surface">Base Currency</p>
                    <p className="text-[10px] text-on-surface-variant uppercase">All valuations will be shown in this currency</p>
                  </div>
                  <select 
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="bg-surface-highest text-on-surface text-xs font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-4 bg-surface-low rounded-xl border border-outline-variant/5">
                  <div>
                    <p className="text-sm font-bold text-on-surface">Timezone</p>
                    <p className="text-[10px] text-on-surface-variant uppercase">System time for audit logs and history</p>
                  </div>
                  <span className="text-xs font-bold text-primary">UTC +5:30 (IST)</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-on-surface mb-4 uppercase tracking-widest">Institutional Tier</h4>
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Shield size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">Alpha Tier-1 Access</p>
                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Active Subscription</p>
                  </div>
                </div>
                <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Manage Plan</button>
              </div>
            </div>
          </div>
        );
      case 'appearance':
        return (
          <div className="space-y-6">
            <h4 className="text-sm font-bold text-on-surface mb-4 uppercase tracking-widest">Theme Preferences</h4>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setTheme('dark')}
                className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                  theme === 'dark' ? 'border-primary bg-primary/5' : 'border-outline-variant/10 bg-surface-low hover:border-primary/40'
                }`}
              >
                <Moon size={24} className={theme === 'dark' ? 'text-primary' : 'text-on-surface-variant'} />
                <span className="text-xs font-bold uppercase tracking-widest">Deep Space</span>
              </button>
              <button 
                onClick={() => setTheme('light')}
                className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                  theme === 'light' ? 'border-primary bg-primary/5' : 'border-outline-variant/10 bg-surface-low hover:border-primary/40'
                }`}
              >
                <Sun size={24} className={theme === 'light' ? 'text-primary' : 'text-on-surface-variant'} />
                <span className="text-xs font-bold uppercase tracking-widest">Solar Flare</span>
              </button>
            </div>
            <div className="p-4 bg-surface-low rounded-xl border border-outline-variant/5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-on-surface">Dynamic Contrast</p>
                <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-on-primary rounded-full"></div>
                </div>
              </div>
              <p className="text-[10px] text-on-surface-variant uppercase">Adjust contrast based on ambient light sensors</p>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-on-surface mb-4 uppercase tracking-widest">Alert Configuration</h4>
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-4 bg-surface-low rounded-xl border border-outline-variant/5">
                <div>
                  <p className="text-sm font-bold text-on-surface capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase">Push and email delivery</p>
                </div>
                <button 
                  onClick={() => setNotifications(prev => ({ ...prev, [key]: !value }))}
                  className={`w-12 h-6 rounded-full transition-all relative ${value ? 'bg-primary' : 'bg-surface-highest'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${value ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>
            ))}
          </div>
        );
      case 'api':
        return (
          <div className="space-y-6">
            <h4 className="text-sm font-bold text-on-surface mb-4 uppercase tracking-widest">Gemini Intelligence Engine</h4>
            <div className="p-6 bg-surface-low rounded-2xl border border-outline-variant/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Cpu size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Model Status: Active</p>
                  <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">Gemini 3.1 Pro Preview</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">API Key</label>
                  <div className="flex gap-2">
                    <input 
                      type="password" 
                      value="••••••••••••••••••••••••••••" 
                      readOnly
                      className="flex-1 bg-surface-highest border border-outline-variant/10 rounded-lg px-4 py-2 text-sm font-mono text-on-surface focus:outline-none"
                    />
                    <button className="px-4 py-2 bg-surface-highest hover:bg-surface-highest/80 rounded-lg text-xs font-bold uppercase tracking-widest transition-all">Rotate</button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-on-surface-variant uppercase tracking-widest font-bold pt-4 border-t border-outline-variant/5">
                  <span>Tokens Consumed (24h)</span>
                  <span className="text-on-surface">142,842 / 1,000,000</span>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-64 text-on-surface-variant/40">
            <Shield size={48} className="mb-4 opacity-20" />
            <p className="text-xs font-bold uppercase tracking-widest">Section Under Maintenance</p>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-5xl h-[80vh] bg-surface-container border border-outline-variant/10 rounded-[32px] shadow-2xl overflow-hidden flex"
          >
            {/* Sidebar */}
            <div className="w-64 border-r border-outline-variant/10 bg-surface-low/50 p-6 flex flex-col gap-2">
              <div className="mb-8">
                <h2 className="text-xl font-headline font-bold text-on-surface">Settings</h2>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">System Configuration</p>
              </div>
              <nav className="flex flex-col gap-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold ${
                      activeSection === section.id 
                        ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' 
                        : 'text-on-surface-variant hover:bg-surface-highest/50 hover:text-on-surface'
                    }`}
                  >
                    {section.icon}
                    <span>{section.label}</span>
                  </button>
                ))}
              </nav>
              <div className="mt-auto p-4 bg-surface-highest/30 rounded-2xl border border-outline-variant/5">
                <p className="text-[9px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">System Version</p>
                <p className="text-xs font-mono text-on-surface">v2.4.8-alpha.institutional</p>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col">
              <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container">
                <div>
                  <h3 className="text-2xl font-headline font-bold text-on-surface capitalize">{activeSection}</h3>
                  <p className="text-xs text-on-surface-variant">Configure your {activeSection} preferences and system behavior.</p>
                </div>
                <button 
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-surface-low hover:bg-surface-highest flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-all border border-outline-variant/10"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                <div className="max-w-2xl">
                  {renderSectionContent()}
                </div>
              </div>
              <div className="p-6 border-t border-outline-variant/10 bg-surface-low/30 flex justify-end gap-4">
                <button 
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-all"
                >
                  Discard Changes
                </button>
                <button 
                  onClick={onClose}
                  className="px-8 py-3 bg-primary text-on-primary rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
