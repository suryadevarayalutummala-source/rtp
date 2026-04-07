import React from 'react';
import { motion } from 'motion/react';
import { 
  Lock, 
  ShieldCheck, 
  Building2, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginProps {
  onLogin: () => void;
  onNavigateToRequest: () => void;
  onNavigateToRecovery: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onNavigateToRequest, onNavigateToRecovery }) => {
  const { login } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
      onLogin();
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Subtle Technical Background Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#454652 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }}></div>
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] bg-primary-container/10"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] bg-secondary/5"></div>
      </div>

      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-[440px] px-6"
      >
        <header className="text-center mb-10">
          <h1 className="font-headline font-extrabold text-2xl tracking-tighter text-on-surface mb-2 uppercase">
            Sovereign Intelligence
          </h1>
          <p className="font-body text-on-surface-variant/60 text-sm tracking-wide">
            Private Wealth & Intelligence Gateway
          </p>
        </header>

        <section className="glass-panel p-10 rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.4)] border border-outline-variant/10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 bg-tertiary/10 border border-tertiary/20 rounded-xl text-tertiary text-[11px] font-bold text-center"
              >
                {error}
              </motion.div>
            )}
            <div className="space-y-2">
              <label className="block font-label text-[11px] uppercase tracking-widest text-on-surface-variant/80 ml-1" htmlFor="email">
                Account ID
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-on-surface-variant/40 group-focus-within:text-primary transition-colors">
                  <Building2 size={20} />
                </div>
                <input 
                  className="w-full h-12 pl-12 pr-4 bg-surface-highest border border-outline-variant/15 rounded-xl text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-body text-sm" 
                  id="email" 
                  type="text" 
                  placeholder="admin"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="block font-label text-[11px] uppercase tracking-widest text-on-surface-variant/80" htmlFor="password">
                  Security Key
                </label>
                <button 
                  type="button"
                  onClick={onNavigateToRecovery}
                  className="font-label text-[10px] uppercase tracking-wider text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot Password
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-on-surface-variant/40 group-focus-within:text-primary transition-colors">
                  <Lock size={20} />
                </div>
                <input 
                  className="w-full h-12 pl-12 pr-4 bg-surface-highest border border-outline-variant/15 rounded-xl text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-body text-sm" 
                  id="password" 
                  type="password" 
                  placeholder="admin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 p-3 rounded-lg bg-surface/50 border border-outline-variant/5">
              <ShieldCheck className="text-secondary shrink-0" size={18} />
              <p className="text-[11px] text-on-surface-variant/60 leading-relaxed font-body">
                Multi-factor authentication is required for all private accounts as per Tier-1 security standards.
              </p>
            </div>

            <button 
              type="submit"
              className="w-full h-14 premium-gradient rounded-xl text-on-primary font-headline font-bold tracking-tight text-sm active:scale-95 transition-all shadow-lg shadow-primary-container/20 mt-4"
            >
              Enter Terminal
            </button>
          </form>
        </section>

        <footer className="mt-8 text-center space-y-4">
          <p className="text-[12px] font-body text-on-surface-variant/50">
            New institution? 
            <button 
              onClick={onNavigateToRequest}
              className="text-primary font-semibold hover:text-primary/80 underline decoration-primary/40 underline-offset-4 transition-all ml-1"
            >
              Request Access
            </button>
          </p>
          <div className="flex items-center justify-center gap-6 pt-6 border-t border-outline-variant/10">
            <span className="flex items-center gap-2 text-[10px] font-label text-on-surface-variant/40 uppercase tracking-widest">
              <ShieldAlert size={14} />
              256-Bit Encrypted
            </span>
            <span className="flex items-center gap-2 text-[10px] font-label text-on-surface-variant/40 uppercase tracking-widest">
              <ShieldCheck size={14} />
              Private Client Policy
            </span>
          </div>
        </footer>
      </motion.main>
    </div>
  );
};
