import { motion } from 'framer-motion';
import { useFinancial } from '@/context/FinancialContext';
import { AlertTriangle, AlertCircle, Info, ChevronRight } from 'lucide-react';

const severityConfig = {
  high: { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30' },
  medium: { icon: AlertCircle, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30' },
  low: { icon: Info, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' },
};

export default function AnomaliesPage() {
  const { anomalies } = useFinancial();

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <div>
        <h1 className="text-2xl font-bold mb-1">Anomaly Detection</h1>
        <p className="text-sm text-muted-foreground">AI-detected unusual financial patterns requiring attention</p>
      </div>

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

      <div className="space-y-4">
        {anomalies.map((anomaly, i) => {
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
    </div>
  );
}
