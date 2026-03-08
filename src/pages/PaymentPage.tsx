import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Lock, Check, Shield } from 'lucide-react';
import { useAuth, PlanType } from '@/context/AuthContext';
import { toast } from 'sonner';

const planDetails: Record<string, { name: string; price: string; priceNum: number }> = {
  pro: { name: 'Pro', price: '$29', priceNum: 29 },
  business: { name: 'Business', price: '$79', priceNum: 79 },
};

function formatCardNumber(value: string) {
  const v = value.replace(/\D/g, '').slice(0, 16);
  return v.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiry(value: string) {
  const v = value.replace(/\D/g, '').slice(0, 4);
  if (v.length >= 2) return v.slice(0, 2) + '/' + v.slice(2);
  return v;
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planKey = searchParams.get('plan') || 'pro';
  const plan = planDetails[planKey] || planDetails.pro;
  const { upgradePlan } = useAuth();

  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const rawDigits = cardNumber.replace(/\s/g, '');
  const isVisa = rawDigits.startsWith('4');
  const isMastercard = rawDigits.startsWith('5') || rawDigits.startsWith('2');
  const cardType = isVisa ? 'Visa' : isMastercard ? 'Mastercard' : rawDigits.length > 0 ? 'Card' : '';

  const isValid = rawDigits.length === 16 && cardName.trim().length >= 2 && expiry.length === 5 && cvv.length >= 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(r => setTimeout(r, 2000));
    await upgradePlan(planKey as PlanType);
    setIsProcessing(false);
    setIsComplete(true);
    toast.success(`Successfully upgraded to ${plan.name}!`);
    setTimeout(() => navigate('/dashboard'), 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <button onClick={() => navigate(-1)} className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm z-10">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="relative z-10 w-full max-w-md">
        {/* Card Preview */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl p-6 h-48 flex flex-col justify-between relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, hsl(239 84% 50%), hsl(260 80% 45%), hsl(280 70% 40%))' }}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 w-32 h-32 rounded-full border border-white/20" />
            <div className="absolute top-12 right-12 w-24 h-24 rounded-full border border-white/20" />
          </div>

          <div className="flex items-center justify-between relative z-10">
            <CreditCard className="w-8 h-8 text-white/80" />
            <div className="flex items-center gap-1">
              {isVisa && (
                <span className="text-white font-bold text-lg italic tracking-wider">VISA</span>
              )}
              {isMastercard && (
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-red-500/80" />
                  <div className="w-6 h-6 rounded-full bg-yellow-500/80" />
                </div>
              )}
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-white/90 font-mono text-lg tracking-[0.2em] mb-3">
              {rawDigits.length > 0 ? formatCardNumber(rawDigits) : '•••• •••• •••• ••••'}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-white/70 text-xs uppercase tracking-wider">
                {cardName || 'YOUR NAME'}
              </p>
              <p className="text-white/70 text-xs font-mono">
                {expiry || 'MM/YY'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Payment Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold">Subscribe to {plan.name}</h2>
              <p className="text-sm text-muted-foreground">{plan.price}/month • Cancel anytime</p>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold">
              {plan.price}/mo
            </div>
          </div>

          {isComplete ? (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-accent" />
              </div>
              <p className="text-lg font-semibold">Payment Successful!</p>
              <p className="text-sm text-muted-foreground mt-1">Redirecting to dashboard...</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formatCardNumber(rawDigits)}
                    onChange={e => setCardNumber(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                    maxLength={19}
                  />
                  {cardType && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                      {cardType}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardName}
                  onChange={e => setCardName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={e => setExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
                    CVV
                  </label>
                  <input
                    type="password"
                    value={cvv}
                    onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="•••"
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                    maxLength={4}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!isValid || isProcessing}
                className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all glow-primary disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Pay {plan.price}/month
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Shield className="w-3.5 h-3.5" />
                  <span>SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Secure Payment</span>
                </div>
              </div>
            </form>
          )}
        </motion.div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Your card will be charged {plan.price} monthly. Cancel anytime from settings.
        </p>
      </div>
    </div>
  );
}
