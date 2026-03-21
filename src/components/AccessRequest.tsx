import React from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  User, 
  Mail, 
  Globe, 
  ShieldCheck, 
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

interface RequestProps {
  onNavigateToLogin: () => void;
}

export const AccessRequest: React.FC<RequestProps> = ({ onNavigateToLogin }) => {
  const [submitted, setSubmitted] = React.useState(false);

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-12 rounded-3xl max-w-md text-center border border-outline-variant/10 shadow-2xl"
        >
          <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="text-secondary" size={40} />
          </div>
          <h2 className="text-3xl font-headline font-extrabold text-on-surface mb-4">Request Received</h2>
          <p className="text-on-surface-variant leading-relaxed mb-10">
            Our institutional verification team will review your application. You will receive a secure communication once your identity is validated.
          </p>
          <button 
            onClick={onNavigateToLogin}
            className="w-full py-4 bg-surface-highest text-on-surface font-bold rounded-xl hover:bg-surface-container transition-all"
          >
            Return to Gateway
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background py-20 px-6">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] bg-primary-container/10"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] bg-secondary/5"></div>
      </div>

      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-2xl"
      >
        <header className="mb-12">
          <button 
            onClick={onNavigateToLogin}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest mb-8"
          >
            <ArrowLeft size={14} />
            Back to Login
          </button>
          <h1 className="text-5xl font-headline font-extrabold tracking-tighter text-on-surface mb-4">
            Private Access <span className="text-primary">Request</span>
          </h1>
          <p className="text-on-surface-variant text-lg font-body max-w-lg">
            Join our exclusive network of institutional investors and private family offices.
          </p>
        </header>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-8" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block font-label text-[11px] uppercase tracking-widest text-on-surface-variant/80 ml-1">Full Identity</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-on-surface-variant/40 group-focus-within:text-primary transition-colors">
                  <User size={18} />
                </div>
                <input className="w-full h-12 pl-12 pr-4 bg-surface-low border border-outline-variant/15 rounded-xl text-on-surface focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all" placeholder="Johnathan Sterling" required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block font-label text-[11px] uppercase tracking-widest text-on-surface-variant/80 ml-1">Official Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-on-surface-variant/40 group-focus-within:text-primary transition-colors">
                  <Mail size={18} />
                </div>
                <input className="w-full h-12 pl-12 pr-4 bg-surface-low border border-outline-variant/15 rounded-xl text-on-surface focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all" placeholder="j.sterling@institution.pvt" type="email" required />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block font-label text-[11px] uppercase tracking-widest text-on-surface-variant/80 ml-1">Institution Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-on-surface-variant/40 group-focus-within:text-primary transition-colors">
                  <Building2 size={18} />
                </div>
                <input className="w-full h-12 pl-12 pr-4 bg-surface-low border border-outline-variant/15 rounded-xl text-on-surface focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all" placeholder="Sterling Global Equity" required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block font-label text-[11px] uppercase tracking-widest text-on-surface-variant/80 ml-1">Jurisdiction</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-on-surface-variant/40 group-focus-within:text-primary transition-colors">
                  <Globe size={18} />
                </div>
                <select className="w-full h-12 pl-12 pr-4 bg-surface-low border border-outline-variant/15 rounded-xl text-on-surface focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all appearance-none cursor-pointer">
                  <option>India (SEBI)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="p-6 bg-surface-container/50 rounded-2xl border border-outline-variant/10">
              <div className="flex items-start gap-4">
                <ShieldCheck className="text-primary shrink-0 mt-1" size={24} />
                <div>
                  <h4 className="font-headline font-bold text-on-surface mb-2">Compliance Verification</h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    By submitting this request, you authorize Sovereign Intelligence to perform a preliminary institutional background check. All data is handled according to our Private Client Policy.
                  </p>
                </div>
              </div>
            </div>
            <button className="w-full h-16 premium-gradient rounded-2xl text-on-primary font-headline font-extrabold text-lg tracking-tight shadow-2xl active:scale-[0.98] transition-all">
              Submit Institutional Application
            </button>
          </div>
        </form>
      </motion.main>
    </div>
  );
};
