import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FlaskConical, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useFinancial } from '@/context/FinancialContext';

interface Scenario {
  revenueChange: number;
  marketingChange: number;
  payrollChange: number;
  operationsChange: number;
}

const presets: Record<string, Scenario> = {
  baseline: { revenueChange: 0, marketingChange: 0, payrollChange: 0, operationsChange: 0 },
  moderate: { revenueChange: 10, marketingChange: 5, payrollChange: 3, operationsChange: 0 },
  aggressive: { revenueChange: 25, marketingChange: 15, payrollChange: 8, operationsChange: 5 },
  costCut: { revenueChange: 0, marketingChange: -15, payrollChange: -5, operationsChange: -10 },
  downturn: { revenueChange: -15, marketingChange: 0, payrollChange: 0, operationsChange: 10 },
};

function Slider({ label, value, onChange, min, max }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className={`text-sm font-semibold ${value > 0 ? 'text-accent' : value < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
          {value > 0 ? '+' : ''}{value}%
        </span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full bg-secondary appearance-none cursor-pointer accent-primary" />
    </div>
  );
}

export default function ScenarioLabPage() {
  const { kpi } = useFinancial();
  const [scenario, setScenario] = useState<Scenario>(presets.baseline);
  const [activePreset, setActivePreset] = useState('baseline');

  const results = useMemo(() => {
    const baseRevenue = kpi.revenue.value;
    const baseExpenses = kpi.expenses.value;
    const marketingBase = baseExpenses * 0.32;
    const payrollBase = baseExpenses * 0.20;
    const opsBase = baseExpenses * 0.23;
    const otherExp = baseExpenses - marketingBase - payrollBase - opsBase;

    const newRevenue = baseRevenue * (1 + scenario.revenueChange / 100);
    const newMarketing = marketingBase * (1 + scenario.marketingChange / 100);
    const newPayroll = payrollBase * (1 + scenario.payrollChange / 100);
    const newOps = opsBase * (1 + scenario.operationsChange / 100);
    const newExpenses = newMarketing + newPayroll + newOps + otherExp;
    const newProfit = newRevenue - newExpenses;
    const baseProfit = baseRevenue - baseExpenses;
    const profitChange = baseProfit !== 0 ? ((newProfit - baseProfit) / baseProfit) * 100 : 0;

    const baseScore = 82;
    const scoreImpact = (scenario.revenueChange * 0.3) - (scenario.marketingChange * 0.1) - (scenario.payrollChange * 0.1) - (scenario.operationsChange * 0.05);
    const newScore = Math.max(0, Math.min(100, Math.round(baseScore + scoreImpact)));

    return { newRevenue, newExpenses, newProfit, profitChange, newScore };
  }, [scenario, kpi]);

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <div>
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2"><FlaskConical className="w-6 h-6 text-primary" /> Scenario Lab</h1>
        <p className="text-sm text-muted-foreground">Simulate financial decisions and see instant impact</p>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(presets).map(([key, preset]) => (
          <button key={key} onClick={() => { setScenario(preset); setActivePreset(key); }}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activePreset === key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}>
            {key === 'baseline' ? 'Baseline' : key === 'moderate' ? 'Moderate Growth' : key === 'aggressive' ? 'Aggressive Growth' : key === 'costCut' ? 'Cost Reduction' : 'Downturn Test'}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="glass-card p-6 space-y-6">
          <h3 className="text-sm font-semibold">Adjust Parameters</h3>
          <Slider label="Revenue Change" value={scenario.revenueChange} onChange={(v) => { setScenario(s => ({ ...s, revenueChange: v })); setActivePreset(''); }} min={-30} max={50} />
          <Slider label="Marketing Spend" value={scenario.marketingChange} onChange={(v) => { setScenario(s => ({ ...s, marketingChange: v })); setActivePreset(''); }} min={-50} max={50} />
          <Slider label="Payroll Adjustment" value={scenario.payrollChange} onChange={(v) => { setScenario(s => ({ ...s, payrollChange: v })); setActivePreset(''); }} min={-30} max={30} />
          <Slider label="Operations Cost" value={scenario.operationsChange} onChange={(v) => { setScenario(s => ({ ...s, operationsChange: v })); setActivePreset(''); }} min={-30} max={30} />
        </div>

        {/* Results */}
        <div className="space-y-4">
          {[
            { label: 'Projected Revenue', value: results.newRevenue, prefix: '$' },
            { label: 'Projected Expenses', value: results.newExpenses, prefix: '$' },
            { label: 'Projected Profit', value: results.newProfit, prefix: '$', change: results.profitChange },
            { label: 'Health Score', value: results.newScore, suffix: '/100' },
          ].map((item, i) => (
            <motion.div key={item.label} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card p-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold">{item.prefix}{Math.round(item.value).toLocaleString()}{item.suffix}</span>
                {item.change !== undefined && (
                  <span className={`flex items-center gap-0.5 text-xs font-medium ${item.change >= 0 ? 'text-accent' : 'text-destructive'}`}>
                    {item.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(Math.round(item.change))}%
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
