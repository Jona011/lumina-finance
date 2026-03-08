import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFinancial } from '@/context/FinancialContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Info, Loader2, Sparkles } from 'lucide-react';
import PremiumGate from '@/components/PremiumGate';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { ForecastPoint } from '@/lib/mockData';

export default function ForecastsPage() {
  const { forecastData, monthlyData, categoryBreakdown, setForecastData, realData } = useFinancial();
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [growthRate, setGrowthRate] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);

  const generateForecast = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('financial-forecast', {
        body: { monthlyData, categoryBreakdown },
      });

      if (error) throw error;
      if (data.error) {
        if (data.error.includes('Rate limit')) toast.error('Rate limit exceeded. Try again shortly.');
        else toast.error(data.error);
        return;
      }

      // Merge actual data with forecasts
      const historicalPoints: ForecastPoint[] = monthlyData.slice(-6).map(m => ({
        month: m.month,
        actual: m.revenue,
      }));
      const forecastPoints: ForecastPoint[] = data.forecasts.map((f: any) => ({
        month: f.month,
        forecast: f.forecast,
        upperBound: f.upperBound,
        lowerBound: f.lowerBound,
      }));

      setForecastData([...historicalPoints, ...forecastPoints]);
      setAiInsights(data.insights || []);
      setGrowthRate(data.growthRate);
      setConfidence(data.confidence);
      toast.success('AI forecast generated!');
    } catch (e) {
      console.error('Forecast error:', e);
      toast.error('Failed to generate forecast');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Revenue Forecast</h1>
          <p className="text-sm text-muted-foreground">AI-predicted revenue with confidence intervals</p>
        </div>
        <button
          onClick={generateForecast}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all glow-primary disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {isGenerating ? 'Generating...' : 'Generate AI Forecast'}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Growth Rate', value: growthRate !== null ? `${growthRate.toFixed(1)}%` : '—', conf: growthRate !== null ? 'AI-calculated' : 'Run forecast' },
          { label: 'Confidence', value: confidence !== null ? `${confidence}%` : '—', conf: confidence !== null ? 'Model confidence' : 'Run forecast' },
          { label: 'Data Source', value: realData ? 'Real Data' : 'Sample', conf: realData ? 'From your spreadsheet' : 'Upload to customize' },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{item.label}</p>
            <p className="text-2xl font-bold">{item.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{item.conf}</p>
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

      {/* AI Insights */}
      {aiInsights.length > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">AI Forecast Insights</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {aiInsights.map((ins, i) => (
              <li key={i}>• {ins}</li>
            ))}
          </ul>
        </div>
      )}

      <PremiumGate featureLabel="Model assumptions on Pro">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Model Assumptions</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Based on your uploaded historical data with seasonal adjustment</li>
            <li>• AI model: Gemini 3 Flash for pattern recognition</li>
            <li>• Confidence interval: AI-calculated probability band</li>
            <li>• Revenue growth rate weighted toward recent trends</li>
          </ul>
        </div>
      </PremiumGate>
    </div>
  );
}
