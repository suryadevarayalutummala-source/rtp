import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Key, 
  ArrowLeft,
  ShieldAlert,
  Info,
  RefreshCw
} from 'lucide-react';

interface SecurityKeyRecoveryProps {
  onNavigateToLogin: () => void;
}

export const SecurityKeyRecovery: React.FC<SecurityKeyRecoveryProps> = ({ onNavigateToLogin }) => {
  const [step, setStep] = React.useState(1);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background px-6">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[5%] right-[20%] w-[30%] h-[30%] bg-secondary/5 blur-[100px] rounded-full"></div>
      </div>

      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[480px] relative z-10"
      >
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-primary-container/30 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20">
            <Key className="text-primary" size={32} />
          </div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-3">
            Establish Security Key
          </h1>
          <p className="text-on-surface-variant font-body text-sm max-w-[320px] mx-auto">
            Generate a new hardware-bound security key for your institutional identity.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-outline-variant/10 shadow-2xl mb-8">
          {step === 1 ? (
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-surface-highest/30 rounded-xl border border-outline-variant/5">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0 text-primary font-bold text-xs">1</div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">Connect your authorized hardware security device (YubiKey, Titan, etc.) to the terminal.</p>
                </div>
                <div className="flex items-start gap-4 p-4 bg-surface-highest/30 rounded-xl border border-outline-variant/5">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0 text-primary font-bold text-xs">2</div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">Follow the system prompt to perform the biometric or touch verification.</p>
                </div>
              </div>

              <button 
                onClick={() => setStep(2)}
                className="w-full py-4 premium-gradient rounded-xl text-on-primary font-headline font-bold text-sm tracking-wide uppercase flex items-center justify-center gap-3 shadow-lg"
              >
                Initialize Device
                <ShieldCheck size={18} />
              </button>
            </div>
          ) : (
            <div className="text-center py-6 space-y-6">
              <div className="relative w-24 h-24 mx-auto">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <RefreshCw className="text-primary/40" size={32} />
                </div>
              </div>
              <div>
                <h3 className="font-headline font-bold text-on-surface mb-2">Awaiting Hardware Response</h3>
                <p className="text-xs text-on-surface-variant">Please touch your security key or provide biometric input when prompted by your browser.</p>
              </div>
              <button 
                onClick={() => setStep(1)}
                className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
              >
                Cancel Protocol
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-4 p-5 bg-surface/50 border border-outline-variant/5 rounded-xl">
          <ShieldAlert className="text-tertiary shrink-0" size={20} />
          <div className="text-[11px] leading-relaxed text-on-surface-variant/80 font-body">
            <span className="font-bold text-on-surface block mb-1">Security Enforcement</span>
            This key will be bound to your institutional profile. Previous keys will be revoked immediately upon successful establishment.
          </div>
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={onNavigateToLogin}
            className="font-label text-[11px] uppercase tracking-[0.1em] text-on-surface/30 hover:text-primary transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowLeft size={14} />
            Return to Gateway
          </button>
        </div>
      </motion.section>
    </div>
  );
};
