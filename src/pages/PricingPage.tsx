import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, Brain, ArrowLeft, Crown, Sparkles, Building2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const plans = [
  {
    name: 'Free', price: '$0', period: 'forever', icon: Sparkles,
    description: 'Get started with basic financial analysis',
    features: ['1 spreadsheet upload', 'Partial dashboard analysis', 'Limited KPI visibility', 'Preview charts', 'Limited AI insights', 'No report exports'],
    cta: 'Current Plan', highlighted: false, planKey: 'free' as const,
  },
  {
    name: 'Pro', price: '$29', period: '/month', icon: Crown,
    description: 'Full access to AI-powered financial intelligence',
    features: ['Unlimited spreadsheet uploads', 'Full dashboard access', 'Full AI copilot & insights', 'Revenue forecasting', 'Full anomaly detection', 'Scenario simulator', 'Reports & export (PDF, CSV, Excel)', 'Advanced financial intelligence'],
    cta: 'Upgrade to Pro', highlighted: true, planKey: 'pro' as const,
  },
  {
    name: 'Business', price: '$79', period: '/month', icon: Building2,
    description: 'For teams and growing organizations',
    features: ['Everything in Pro', 'Multi-user workspace', 'Priority support', 'Advanced integrations', 'Team collaboration', 'Custom branding', 'API access', 'Dedicated account manager'],
    cta: 'Contact Sales', highlighted: false, planKey: 'business' as const,
  },
];

export default function PricingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">Finora AI</span>
          </div>
          <div className="w-16" />
        </div>
      </nav>

      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              Choose your <span className="gradient-text">plan</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Unlock deeper visibility into your business performance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <motion.div key={plan.name}
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className={`rounded-2xl p-6 flex flex-col relative ${
                  plan.highlighted ? 'glass-card border-primary/40 ring-2 ring-primary/20 shadow-xl shadow-primary/10' : 'glass-card'
                }`}>
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    Most Popular
                  </div>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.highlighted ? 'bg-primary/20' : 'bg-muted'}`}>
                    <plan.icon className={`w-5 h-5 ${plan.highlighted ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <h3 className="font-semibold">{plan.name}</h3>
                </div>
                <div className="mb-4">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
                <div className="space-y-3 mb-8 flex-1">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-center gap-2.5 text-sm">
                      <Check className={`w-4 h-4 shrink-0 ${plan.highlighted ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    if (plan.planKey === 'free') return;
                    if (!user) { navigate('/auth'); return; }
                    navigate(`/payment?plan=${plan.planKey}`);
                  }}
                  disabled={user?.plan === plan.planKey}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                    plan.highlighted
                      ? 'bg-primary text-primary-foreground hover:brightness-110 shadow-lg shadow-primary/20'
                      : user?.plan === plan.planKey
                        ? 'bg-muted text-muted-foreground cursor-default'
                        : 'bg-muted text-foreground hover:bg-muted/80 border border-border'
                  }`}>
                  {user?.plan === plan.planKey ? 'Current Plan' : plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
