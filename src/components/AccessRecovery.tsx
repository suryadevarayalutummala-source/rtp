import React from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  Mail, 
  ShieldCheck, 
  ArrowLeft,
  ShieldAlert,
  Info
} from 'lucide-react';

interface RecoveryProps {
  onNavigateToLogin: () => void;
}

export const AccessRecovery: React.FC<RecoveryProps> = ({ onNavigateToLogin }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[5%] left-[20%] w-[30%] h-[30%] bg-secondary/5 blur-[100px] rounded-full"></div>
      </div>

      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[480px] relative z-10 px-6"
      >
        <div className="mb-12">
          <h1 className="font-headline text-4xl font-extrabold text-on-surface tracking-[-0.03em] mb-4 leading-tight">
            Recovery Protocol <span className="text-primary">Initiated</span>
          </h1>
          <p className="text-on-surface-variant font-body text-sm leading-relaxed max-w-[320px]">
            Access restoration requires institutional identity validation. Please provide your authorized credentials.
          </p>
        </div>

        <div className="space-y-8">
          <div className="bg-surface-low p-8 rounded-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] border border-outline-variant/10">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="font-label text-[11px] uppercase tracking-[0.1em] text-on-surface/40 px-1">Institutional ID</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface/30 group-focus-within:text-primary transition-colors">
                    <Building2 size={20} />
                  </div>
                  <input 
                    className="w-full bg-surface-highest border border-outline-variant/15 text-on-surface py-4 pl-12 pr-4 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-on-surface/20 outline-none" 
                    placeholder="SOV-XXXX-XXXX" 
                    type="text"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-label text-[11px] uppercase tracking-[0.1em] text-on-surface/40 px-1">Recovery Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface/30 group-focus-within:text-primary transition-colors">
                    <Mail size={20} />
                  </div>
                  <input 
                    className="w-full bg-surface-highest border border-outline-variant/15 text-on-surface py-4 pl-12 pr-4 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-on-surface/20 outline-none" 
                    placeholder="official@institution.pvt" 
                    type="email"
                  />
                </div>
              </div>
            </div>
          </div>

          <button className="w-full py-5 rounded-xl premium-gradient text-on-primary font-headline font-bold text-sm tracking-wide uppercase shadow-xl hover:shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
            Send Recovery Protocol
            <ShieldAlert size={18} />
          </button>

          <div className="flex gap-4 p-5 bg-surface/50 border border-outline-variant/5 rounded-xl">
            <Info className="text-primary shrink-0" size={20} />
            <div className="text-[11px] leading-relaxed text-on-surface-variant/80 font-body">
              <span className="font-bold text-on-surface block mb-1">Institutional Policy Notice</span>
              Unauthorized access attempts are monitored and logged. Standard MFA verification will follow.
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={onNavigateToLogin}
            className="font-label text-[11px] uppercase tracking-[0.1em] text-on-surface/30 hover:text-primary transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft size={14} />
            Return to Vault Entry
          </button>
        </div>
      </motion.section>

      <footer className="fixed bottom-0 w-full flex justify-end items-center px-12 py-8 z-50 opacity-30">
        <div className="flex gap-8">
          <button className="text-[11px] uppercase tracking-widest hover:text-primary transition-colors">Terms of Service</button>
          <button className="text-[11px] uppercase tracking-widest hover:text-primary transition-colors">Privacy Policy</button>
          <button className="text-[11px] uppercase tracking-widest hover:text-primary transition-colors">Security Disclosure</button>
        </div>
      </footer>
    </div>
  );
};
