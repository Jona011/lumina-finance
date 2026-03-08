import { Lock, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import UpgradeModal from './UpgradeModal';

interface PremiumGateProps {
  children: React.ReactNode;
  featureLabel?: string;
  blurIntensity?: 'sm' | 'md' | 'lg';
  showTeaser?: boolean;
}

export default function PremiumGate({ children, featureLabel = 'Premium insight hidden', blurIntensity = 'md', showTeaser = true }: PremiumGateProps) {
  const { user } = useAuth();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const isPremium = user?.plan === 'pro' || user?.plan === 'business';

  if (isPremium) return <>{children}</>;

  const blur = blurIntensity === 'sm' ? 'blur-[3px]' : blurIntensity === 'lg' ? 'blur-[12px]' : 'blur-[6px]';

  return (
    <>
      <div className="relative group cursor-pointer" onClick={() => setShowUpgrade(true)}>
        {showTeaser && (
          <div className={`${blur} select-none pointer-events-none`}>
            {children}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent flex flex-col items-center justify-center gap-3 rounded-xl">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center backdrop-blur-sm">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground/90">{featureLabel}</p>
          <button className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 transition-all glow-primary">
            <Sparkles className="w-4 h-4" /> Upgrade to unlock
          </button>
        </div>
      </div>
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </>
  );
}
