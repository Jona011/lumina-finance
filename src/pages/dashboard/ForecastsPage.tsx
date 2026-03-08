import { motion } from 'framer-motion';
import { useFinancial } from '@/context/FinancialContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Info } from 'lucide-react';
import PremiumGate from '@/components/PremiumGate';

export default function ForecastsPage() {
  const { forecastData } = useFinancial();

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <div>
        <h1 className="text-2xl font-bold mb-1">Revenue Forecast</h1>
        <p className="text-sm text-muted-foreground">Predicted revenue with confidence intervals</p>
      </div>

      {/* Preview cards visible */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Next Month', value: '$70,500', conf: '±$5,500' },
          { label: 'Next Quarter', value: '$220,000', conf: '±$18,000' },
          { label: 'Cash Flow Risk', value: 'Low', conf: '88% confidence' },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{item.label}</p>
            <PremiumGate featureLabel="Forecast details available on Pro" blurIntensity="sm">
              <div>
                <p className="text-2xl font-bold">{item.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.conf}</p>
              </div>
            </PremiumGate>
          </motion.div>
        ))}
      </div>

      <PremiumGate featureLabel="Advanced forecasting available on Pro" blurIntensity="lg">
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Historical vs Projected Revenue</h3>
          </div>
          <ResponsiveContainer width="100%" height={360}>
            <AreaChart data={forecastData}>
              <defs>
                <linearGradient id="fActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(239,84%,67%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(239,84%,67%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142,71%,45%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(142,71%,45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,30%,20%)" />
              <XAxis dataKey="month" stroke="hsl(215,20%,55%)" fontSize={12} />
              <YAxis stroke="hsl(215,20%,55%)" fontSize={12} tickFormatter={(v) => `$${v/1000}k`} />
              <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
              <Area type="monotone" dataKey="upperBound" stroke="none" fill="hsl(142,71%,45%)" fillOpacity={0.08} name="Upper Bound" />
              <Area type="monotone" dataKey="lowerBound" stroke="none" fill="hsl(142,71%,45%)" fillOpacity={0.08} name="Lower Bound" />
              <Area type="monotone" dataKey="actual" stroke="hsl(239,84%,67%)" fill="url(#fActual)" strokeWidth={2} name="Actual" />
              <Area type="monotone" dataKey="forecast" stroke="hsl(142,71%,45%)" fill="url(#fForecast)" strokeWidth={2} strokeDasharray="6 4" name="Forecast" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </PremiumGate>

      <PremiumGate featureLabel="Model assumptions on Pro">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Model Assumptions</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Based on 12-month historical data with seasonal adjustment</li>
            <li>• Confidence interval: 80% probability band</li>
            <li>• Assumes no major external shocks or market shifts</li>
            <li>• Revenue growth rate weighted toward recent 3-month trend</li>
          </ul>
        </div>
      </PremiumGate>
    </div>
  );
}
