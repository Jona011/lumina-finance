import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Upload, Shield, Brain, BarChart3, Zap, TrendingUp, Target, LineChart, MessageSquare, Check, Sparkles } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
};

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">Finora AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/auth')}
              className="px-5 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </button>
            <button onClick={() => navigate('/auth')}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all shadow-lg shadow-primary/20">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 mb-6">
              <Sparkles className="w-3.5 h-3.5" /> AI-Powered Financial Intelligence
            </span>
          </motion.div>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6">
            Your AI CFO for{' '}
            <span className="gradient-text">Business Intelligence</span>
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Upload your Excel files. Instantly understand revenue, costs, risks, forecasts, and growth opportunities — powered by intelligent financial analysis.
          </motion.p>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/auth')}
              className="px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-base flex items-center gap-2 hover:brightness-110 transition-all shadow-xl shadow-primary/25">
              <Upload className="w-5 h-5" /> Start Free Analysis
            </button>
            <button onClick={() => navigate('/pricing')}
              className="px-8 py-3.5 rounded-2xl bg-card text-foreground font-semibold text-base flex items-center gap-2 hover:bg-muted transition-all border border-border shadow-lg">
              View Pricing <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 gradient-surface">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything a CFO does,<br />automated by AI</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">From anomaly detection to revenue forecasting — Finora AI transforms raw spreadsheets into strategic financial intelligence.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: TrendingUp, title: 'Revenue Forecasting', desc: 'Predict next month and quarter revenue with confidence intervals using time-series analysis.' },
              { icon: Target, title: 'Anomaly Detection', desc: 'Automatically detect unusual spending patterns, irregular payments, and cash flow risks.' },
              { icon: BarChart3, title: 'Business Health Score', desc: 'A 0-100 score synthesizing growth, stability, profitability, and risk into one metric.' },
              { icon: LineChart, title: 'Scenario Simulator', desc: 'Test "what if" scenarios — adjust revenue, cut costs, and see instant financial impact.' },
              { icon: MessageSquare, title: 'AI Financial Chat', desc: 'Ask questions about your finances in plain English and get data-grounded answers.' },
              { icon: Brain, title: 'Smart Recommendations', desc: 'Actionable advice for cost optimization, growth opportunities, and risk management.' },
            ].map((f, i) => (
              <motion.div key={f.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="glass-card-hover p-6 group">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">How it works</h2>
          <div className="space-y-12">
            {[
              { step: '01', title: 'Upload your spreadsheet', desc: 'Drag and drop your Excel or CSV file. Finora AI auto-detects columns, cleans data, and normalizes formats.' },
              { step: '02', title: 'AI builds your financial model', desc: 'The engine structures your data, detects patterns, identifies anomalies, and generates forecasts in seconds.' },
              { step: '03', title: 'Explore insights & take action', desc: 'Navigate an interactive dashboard with KPIs, charts, health scores, and ask your AI copilot any question.' },
            ].map((s, i) => (
              <motion.div key={s.step} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="flex gap-6 items-start">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xl font-extrabold gradient-text">{s.step}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
                  <p className="text-muted-foreground">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 gradient-surface">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-10">Start free. Upgrade when you need the full power of AI financial intelligence.</p>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            {[
              { name: 'Free', price: '$0', features: ['1 spreadsheet', 'Partial analysis', 'Limited insights'] },
              { name: 'Pro', price: '$29/mo', features: ['Unlimited uploads', 'Full AI copilot', 'Forecasting', 'Reports & exports'], highlight: true },
              { name: 'Business', price: '$79/mo', features: ['Everything in Pro', 'Team workspace', 'Priority support'] },
            ].map(plan => (
              <div key={plan.name} className={`glass-card p-6 ${plan.highlight ? 'border-primary/40 ring-2 ring-primary/20 shadow-xl shadow-primary/10' : ''}`}>
                <h3 className="font-semibold mb-1">{plan.name}</h3>
                <p className="text-3xl font-extrabold mb-4">{plan.price}</p>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  {plan.features.map(f => <li key={f} className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> {f}</li>)}
                </ul>
                <button onClick={() => navigate(plan.highlight ? '/auth' : '/pricing')}
                  className={`w-full mt-6 py-3 rounded-xl text-sm font-semibold transition-all ${plan.highlight ? 'bg-primary text-primary-foreground hover:brightness-110 shadow-lg shadow-primary/20' : 'bg-muted text-foreground hover:bg-muted/80'}`}>
                  {plan.highlight ? 'Get Started' : 'Learn More'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Enterprise-grade security</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-10">Your financial data is encrypted end-to-end, processed securely, and never shared.</p>
          <div className="flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
            {['End-to-end encryption', 'SOC 2 ready', 'No data resold', 'GDPR compliant', 'Data ownership'].map(t => (
              <span key={t} className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-card border border-border shadow-sm">
                <Shield className="w-3.5 h-3.5 text-primary" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 purple-gradient-bg">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to understand your finances?</h2>
          <p className="text-muted-foreground mb-8">Upload a spreadsheet and get CFO-level insights in seconds.</p>
          <button onClick={() => navigate('/auth')}
            className="px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-base flex items-center gap-2 mx-auto hover:brightness-110 transition-all shadow-xl shadow-primary/25">
            <Upload className="w-5 h-5" /> Start Free Analysis
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 text-center text-sm text-muted-foreground">
        © 2026 Finora AI. All rights reserved.
      </footer>
    </div>
  );
}
