import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

export default function AdminAnalyticsPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [apiLogs, setApiLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [p, l] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('api_logs').select('*').order('created_at', { ascending: true }).limit(500),
      ]);
      setProfiles(p.data || []);
      setApiLogs(l.data || []);
      setLoading(false);
    }
    load();
  }, []);

  // Plan distribution
  const planCounts = profiles.reduce((acc: any, p: any) => {
    acc[p.plan] = (acc[p.plan] || 0) + 1;
    return acc;
  }, {});
  const planData = Object.entries(planCounts).map(([name, value]) => ({ name: name.toUpperCase(), value }));
  const planColors = ['hsl(258,70%,55%)', 'hsl(280,65%,60%)', 'hsl(220,70%,55%)'];

  // API usage by function
  const funcCounts = apiLogs.reduce((acc: any, l: any) => {
    acc[l.function_name] = (acc[l.function_name] || 0) + 1;
    return acc;
  }, {});
  const funcData = Object.entries(funcCounts).map(([name, value]) => ({ name: name.replace('financial-', ''), calls: value }));

  // Response time trend
  const timeBuckets = apiLogs.reduce((acc: any, l: any) => {
    const date = new Date(l.created_at).toLocaleDateString();
    if (!acc[date]) acc[date] = { date, avgTime: 0, count: 0, total: 0 };
    if (l.response_time_ms) { acc[date].total += l.response_time_ms; acc[date].count++; }
    acc[date].avgTime = acc[date].count > 0 ? Math.round(acc[date].total / acc[date].count) : 0;
    return acc;
  }, {});
  const timeData = Object.values(timeBuckets).slice(-14) as any[];

  // Upload distribution
  const uploadBuckets = [
    { range: '0', count: profiles.filter((p: any) => p.spreadsheets_used === 0).length },
    { range: '1', count: profiles.filter((p: any) => p.spreadsheets_used === 1).length },
    { range: '2-5', count: profiles.filter((p: any) => p.spreadsheets_used >= 2 && p.spreadsheets_used <= 5).length },
    { range: '6+', count: profiles.filter((p: any) => p.spreadsheets_used > 5).length },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 rounded-full border-3 border-primary border-t-transparent animate-spin" />
    </div>
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
      <div className="glass-card p-3 text-xs">
        <p className="font-medium mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value?.toLocaleString()}</p>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2"><BarChart3 className="w-6 h-6 text-primary" /> Platform Analytics</h1>
        <p className="text-sm text-muted-foreground">Usage metrics and platform health</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Plan distribution */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><PieChartIcon className="w-4 h-4 text-primary" /> Plan Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={planData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4}>
                {planData.map((_, i) => <Cell key={i} fill={planColors[i % planColors.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {planData.map((p, i) => (
              <div key={p.name} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: planColors[i % planColors.length] }} />
                <span>{p.name}: {p.value as number}</span>
              </div>
            ))}
          </div>
        </div>

        {/* API usage */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" /> API Usage by Function</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={funcData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(252,20%,90%)" />
              <XAxis dataKey="name" stroke="hsl(240,10%,46%)" fontSize={11} />
              <YAxis stroke="hsl(240,10%,46%)" fontSize={11} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="calls" fill="hsl(258,70%,55%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Response time trend */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Avg Response Time (ms)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={timeData}>
              <defs>
                <linearGradient id="timeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(258,70%,55%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(258,70%,55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(252,20%,90%)" />
              <XAxis dataKey="date" stroke="hsl(240,10%,46%)" fontSize={10} />
              <YAxis stroke="hsl(240,10%,46%)" fontSize={10} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="avgTime" stroke="hsl(258,70%,55%)" fill="url(#timeGrad)" strokeWidth={2} name="Avg Time" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Upload distribution */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Upload Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={uploadBuckets}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(252,20%,90%)" />
              <XAxis dataKey="range" stroke="hsl(240,10%,46%)" fontSize={12} label={{ value: 'Uploads', position: 'bottom', offset: -5 }} />
              <YAxis stroke="hsl(240,10%,46%)" fontSize={12} label={{ value: 'Users', angle: -90, position: 'insideLeft' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="hsl(280,65%,60%)" radius={[6, 6, 0, 0]} name="Users" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
