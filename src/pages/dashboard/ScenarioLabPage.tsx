import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FlaskConical, TrendingUp, TrendingDown } from 'lucide-react';
import { useFinancial } from '@/context/FinancialContext';
import PremiumGate from '@/components/PremiumGate';

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

export default function ScenarioLabPage() {
  const { kpi } = useFinancial();
  const [scenario] = useState<Scenario>(presets.baseline);

  const results = useMemo(() => {
    const baseRevenue = kpi.revenue.value;
    const baseExpenses = kpi.expenses.value;
    const newRevenue = baseRevenue * (1 + scenario.revenueChange / 100);
    const newExpenses = baseExpenses;
    const newProfit = newRevenue - newExpenses;
    return { newRevenue, newExpenses, newProfit, profitChange: 0, newScore: 82 };
  }, [scenario, kpi]);

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <div>
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2"><FlaskConical className="w-6 h-6 text-primary" /> Scenario Lab</h1>
        <p className="text-sm text-muted-foreground">Simulate financial decisions and see instant impact</p>
      </div>

      <PremiumGate featureLabel="Scenario simulation available on Pro" blurIntensity="lg">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {Object.keys(presets).map(key => (
              <button key={key} className="px-4 py-2 rounded-lg text-xs font-medium bg-secondary text-secondary-foreground">
                {key === 'baseline' ? 'Baseline' : key === 'moderate' ? 'Moderate Growth' : key === 'aggressive' ? 'Aggressive Growth' : key === 'costCut' ? 'Cost Reduction' : 'Downturn Test'}
              </button>
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass-card p-6 space-y-6">
              <h3 className="text-sm font-semibold">Adjust Parameters</h3>
              {['Revenue Change', 'Marketing Spend', 'Payroll Adjustment', 'Operations Cost'].map(label => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-sm font-semibold text-muted-foreground">0%</span>
                  </div>
                  <input type="range" min={-30} max={50} value={0} readOnly className="w-full h-1.5 rounded-full bg-secondary appearance-none" />
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {[
                { label: 'Projected Revenue', value: results.newRevenue, prefix: '$' },
                { label: 'Projected Expenses', value: results.newExpenses, prefix: '$' },
                { label: 'Projected Profit', value: results.newProfit, prefix: '$', change: 0 },
                { label: 'Health Score', value: results.newScore, suffix: '/100' },
              ].map((item, i) => (
                <div key={item.label} className="glass-card p-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-lg font-bold">{item.prefix}{Math.round(item.value).toLocaleString()}{item.suffix}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PremiumGate>
    </div>
  );
}
