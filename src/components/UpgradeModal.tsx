import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Sparkles, Crown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

const benefits = [
  'Unlimited spreadsheet uploads',
  'Full dashboard access',
  'Full AI insights and recommendations',
  'Forecasting and anomaly detection',
  'Scenario simulator',
  'Exportable reports',
  'Advanced financial intelligence tools',
];

export default function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  const { upgradePlan } = useAuth();
  const navigate = useNavigate();

  const handleUpgrade = () => {
    upgradePlan('pro');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass-card p-8 max-w-md w-full relative border border-primary/20"
            onClick={e => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-secondary transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
            
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Crown className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Upgrade to continue</h2>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Unlock the full power of AI financial analysis, forecasting, premium insights, and advanced reporting.
            </p>

            <div className="space-y-3 mb-6">
              {benefits.map(b => (
                <div key={b} className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 text-accent shrink-0" />
                  <span>{b}</span>
                </div>
              ))}
            </div>

            <button onClick={handleUpgrade}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:brightness-110 transition-all glow-primary mb-3">
              <Sparkles className="w-4 h-4" /> Upgrade Now
            </button>
            <button onClick={() => { onClose(); navigate('/pricing'); }}
              className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm hover:bg-secondary/80 transition-colors">
              View Pricing Plans
            </button>
            <p className="text-center text-xs text-muted-foreground mt-4">
              No risk. Cancel anytime. Built for growing businesses.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
