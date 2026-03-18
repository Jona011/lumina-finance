import { motion } from 'framer-motion';
import { useFinancial } from '@/context/FinancialContext';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import PremiumGate from '@/components/PremiumGate';

function KPICard({ label, value, change, prefix, suffix }: { label: string; value: number; change: number; prefix?: string; suffix?: string }) {
  const isPositive = change >= 0;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold">
          {prefix}{value.toLocaleString()}{suffix}
        </p>
        <span className={`flex items-center gap-0.5 text-xs font-medium px-2 py-1 rounded-full ${isPositive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(change)}%
        </span>
      </div>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-card p-3 text-xs">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: ${p.value?.toLocaleString()}</p>
      ))}
    </div>
  );
};

export default function OverviewPage() {
  const { kpi, monthlyData, categoryBreakdown, insights } = useFinancial();

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-bold mb-1">Financial Overview</h1>
        <p className="text-sm text-muted-foreground">Your business performance at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard {...kpi.revenue} />
        <KPICard {...kpi.expenses} />
        <PremiumGate featureLabel="Upgrade to see full metrics">
          <KPICard {...kpi.profit} />
        </PremiumGate>
        <PremiumGate featureLabel="Upgrade to see health score">
          <KPICard {...kpi.healthScore} />
        </PremiumGate>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {insights.slice(0, 2).map((ins, i) => (
          <motion.div key={ins.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className={`glass-card p-4 min-w-[280px] shrink-0 border-l-4 ${
              ins.type === 'growth' ? 'border-l-success' : ins.type === 'risk' ? 'border-l-destructive' : ins.type === 'optimization' ? 'border-l-warning' : 'border-l-primary'
            }`}>
            <div className="flex items-start justify-between mb-2">
              <span className="text-lg">{ins.icon}</span>
              <span className="text-[10px] text-muted-foreground">{ins.confidence}% confidence</span>
            </div>
            <p className="text-sm font-medium mb-1">{ins.title}</p>
            <p className="text-xs text-muted-foreground">{ins.description}</p>
          </motion.div>
        ))}
        <PremiumGate featureLabel="Premium insights available on Pro" blurIntensity="sm">
          <div className="flex gap-4">
            {insights.slice(2, 4).map((ins) => (
              <div key={ins.id} className={`glass-card p-4 min-w-[280px] shrink-0 border-l-4 border-l-primary`}>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-lg">{ins.icon}</span>
                  <span className="text-[10px] text-muted-foreground">{ins.confidence}% confidence</span>
                </div>
                <p className="text-sm font-medium mb-1">{ins.title}</p>
                <p className="text-xs text-muted-foreground">{ins.description}</p>
              </div>
            ))}
          </div>
        </PremiumGate>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Revenue vs Expenses</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(258,70%,55%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(258,70%,55%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(280,65%,60%)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(280,65%,60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(252,20%,90%)" />
              <XAxis dataKey="month" stroke="hsl(240,10%,46%)" fontSize={12} />
              <YAxis stroke="hsl(240,10%,46%)" fontSize={12} tickFormatter={(v) => `$${v/1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(258,70%,55%)" fill="url(#revGrad)" strokeWidth={2} name="Revenue" />
              <Area type="monotone" dataKey="expenses" stroke="hsl(280,65%,60%)" fill="url(#expGrad)" strokeWidth={2} name="Expenses" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <PremiumGate featureLabel="Full breakdown on Pro">
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold mb-4">Expense Breakdown</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categoryBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {categoryBreakdown.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {categoryBreakdown.slice(0, 4).map(c => (
                <div key={c.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                    <span>{c.name}</span>
                  </div>
                  <span className="text-muted-foreground">{c.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </PremiumGate>
      </div>

      <PremiumGate featureLabel="Profit trend available on Pro">
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4">Net Profit Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(252,20%,90%)" />
              <XAxis dataKey="month" stroke="hsl(240,10%,46%)" fontSize={12} />
              <YAxis stroke="hsl(240,10%,46%)" fontSize={12} tickFormatter={(v) => `$${v/1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="profit" fill="hsl(142,71%,45%)" radius={[6, 6, 0, 0]} name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </PremiumGate>
    </div>
  );
}
