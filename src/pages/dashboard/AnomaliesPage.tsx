import { useState } from 'react';
import { motion } from 'framer-motion';
import { useFinancial } from '@/context/FinancialContext';
import { AlertTriangle, AlertCircle, Info, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import PremiumGate from '@/components/PremiumGate';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Anomaly } from '@/lib/mockData';

const severityConfig = {
  high: { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30' },
  medium: { icon: AlertCircle, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30' },
  low: { icon: Info, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' },
};

export default function AnomaliesPage() {
  const { anomalies, setAnomalies, monthlyData, categoryBreakdown, rawData, realData } = useFinancial();
  const [isDetecting, setIsDetecting] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [riskScore, setRiskScore] = useState<number | null>(null);

  const detectAnomalies = async () => {
    setIsDetecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('financial-anomalies', {
        body: {
          monthlyData,
          categoryBreakdown,
          rawSample: rawData.slice(0, 20),
        },
      });

      if (error) throw error;
      if (data.error) {
        toast.error(data.error);
        return;
      }

      const detected: Anomaly[] = (data.anomalies || []).map((a: any, i: number) => ({
        id: String(i + 1),
        severity: a.severity,
        title: a.title,
        description: a.description,
        category: a.category || 'General',
        date: a.date || new Date().toISOString().split('T')[0],
        confidence: a.confidence,
        recommendation: a.recommendation,
        amount: a.amount,
      }));

      setAnomalies(detected);
      setSummary(data.summary);
      setRiskScore(data.riskScore);
      toast.success(`Detected ${detected.length} anomalies`);
    } catch (e) {
      console.error('Anomaly detection error:', e);
      toast.error('Failed to detect anomalies');
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Anomaly Detection</h1>
          <p className="text-sm text-muted-foreground">AI-detected unusual financial patterns requiring attention</p>
        </div>
        <button
          onClick={detectAnomalies}
          disabled={isDetecting}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all glow-primary disabled:opacity-50"
        >
          {isDetecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {isDetecting ? 'Detecting...' : 'Run AI Detection'}
        </button>
      </div>

      {summary && (
        <div className="glass-card p-4 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">AI Summary</span>
            {riskScore !== null && (
              <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${
                riskScore > 70 ? 'bg-destructive/10 text-destructive' : riskScore > 40 ? 'bg-warning/10 text-warning' : 'bg-accent/10 text-accent'
              }`}>
                Risk Score: {riskScore}/100
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{summary}</p>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        {(['high', 'medium', 'low'] as const).map(sev => {
          const count = anomalies.filter(a => a.severity === sev).length;
          const cfg = severityConfig[sev];
          return (
            <div key={sev} className={`glass-card p-4 border ${cfg.border}`}>
              <p className={`text-xs font-medium uppercase tracking-wider ${cfg.color} mb-1`}>{sev} severity</p>
              <p className="text-2xl font-bold">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Show first 2 anomalies, gate the rest */}
      <div className="space-y-4">
        {anomalies.slice(0, 2).map((anomaly, i) => {
          const cfg = severityConfig[anomaly.severity];
          const Icon = cfg.icon;
          return (
            <motion.div key={anomaly.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className={`glass-card p-5 border ${cfg.border}`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm">{anomaly.title}</h3>
                    <span className="text-[10px] text-muted-foreground">{anomaly.confidence}% confidence</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{anomaly.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <span>📁 {anomaly.category}</span>
                    <span>📅 {anomaly.date}</span>
                    {anomaly.amount && <span>💰 ${anomaly.amount.toLocaleString()}</span>}
                  </div>
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary/50">
                    <ChevronRight className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground">{anomaly.recommendation}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <PremiumGate featureLabel="Full anomaly detection available on Pro" blurIntensity="md">
        <div className="space-y-4">
          {anomalies.slice(2).map((anomaly) => {
            const cfg = severityConfig[anomaly.severity];
            const Icon = cfg.icon;
            return (
              <div key={anomaly.id} className={`glass-card p-5 border ${cfg.border}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{anomaly.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{anomaly.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </PremiumGate>
    </div>
  );
}
