import { motion } from 'framer-motion';
import { useFinancial } from '@/context/FinancialContext';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight } from 'lucide-react';

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? 'hsl(142,71%,45%)' : score >= 40 ? 'hsl(38,92%,50%)' : 'hsl(0,84%,60%)';

  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(222,30%,20%)" strokeWidth="6" />
        <motion.circle cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="6"
          className="score-ring" initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }} transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{ strokeDasharray: circumference }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className="text-4xl font-bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          {score}
        </motion.span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

export default function HealthScorePage() {
  const { healthScore } = useFinancial();
  const trendIcon = { up: TrendingUp, down: TrendingDown, stable: Minus };

  return (
    <div className="p-6 space-y-6 max-w-[1000px]">
      <div>
        <h1 className="text-2xl font-bold mb-1">Business Health Score</h1>
        <p className="text-sm text-muted-foreground">A comprehensive assessment of your financial well-being</p>
      </div>

      <div className="glass-card p-8 text-center">
        <ScoreRing score={healthScore.overall} />
        <p className="mt-4 text-accent font-semibold">Good Standing</p>
        <p className="text-sm text-muted-foreground mt-1">Your business is performing above average across key financial metrics</p>
      </div>

      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-4">Score Breakdown</h3>
        <div className="space-y-4">
          {healthScore.factors.map((f, i) => {
            const Icon = trendIcon[f.trend];
            const color = f.score >= 70 ? 'bg-accent' : f.score >= 40 ? 'bg-warning' : 'bg-destructive';
            return (
              <motion.div key={f.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{f.name}</span>
                    <Icon className={`w-3.5 h-3.5 ${f.trend === 'up' ? 'text-accent' : f.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'}`} />
                  </div>
                  <span className="text-sm font-semibold">{f.score}</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <motion.div className={`h-full rounded-full ${color}`}
                    initial={{ width: 0 }} animate={{ width: `${f.score}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Weight: {f.weight}%</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="glass-card p-5 border-l-2 border-l-accent">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><ArrowUpRight className="w-4 h-4 text-accent" /> What improves your score</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Consistent revenue growth over 4 months</li>
            <li>• Strong profitability ratio at 40%</li>
            <li>• Positive cash flow trajectory</li>
          </ul>
        </div>
        <div className="glass-card p-5 border-l-2 border-l-destructive">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><TrendingDown className="w-4 h-4 text-destructive" /> What hurts your score</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Increasing expense volatility (+23%)</li>
            <li>• High supplier concentration risk</li>
            <li>• Customer revenue concentration (top 3 = 52%)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
