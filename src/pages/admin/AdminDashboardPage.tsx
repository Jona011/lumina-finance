import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, FileSpreadsheet, MessageSquare, Activity, TrendingUp, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  totalUsers: number;
  totalSpreadsheets: number;
  totalMessages: number;
  totalApiCalls: number;
  recentUsers: any[];
  recentLogs: any[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalSpreadsheets: 0, totalMessages: 0, totalApiCalls: 0, recentUsers: [], recentLogs: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [profiles, spreadsheets, messages, logs] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact' }),
        supabase.from('spreadsheets').select('*', { count: 'exact' }),
        supabase.from('chat_messages').select('*', { count: 'exact' }),
        supabase.from('api_logs').select('*', { count: 'exact' }).order('created_at', { ascending: false }).limit(10),
      ]);
      setStats({
        totalUsers: profiles.count || 0,
        totalSpreadsheets: spreadsheets.count || 0,
        totalMessages: messages.count || 0,
        totalApiCalls: logs.count || 0,
        recentUsers: profiles.data?.slice(0, 5) || [],
        recentLogs: logs.data || [],
      });
      setLoading(false);
    }
    load();
  }, []);

  const kpis = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, change: 12, color: 'text-primary' },
    { label: 'Spreadsheets', value: stats.totalSpreadsheets, icon: FileSpreadsheet, change: 8, color: 'text-accent' },
    { label: 'Chat Messages', value: stats.totalMessages, icon: MessageSquare, change: 23, color: 'text-chart-3' },
    { label: 'API Calls', value: stats.totalApiCalls, icon: Activity, change: -5, color: 'text-chart-5' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 rounded-full border-3 border-primary border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-bold mb-1">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Platform overview and key metrics</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-medium px-2 py-1 rounded-full ${kpi.change >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                {kpi.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(kpi.change)}%
              </span>
            </div>
            <p className="text-2xl font-bold">{kpi.value.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent users */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" /> Recent Users
          </h3>
          <div className="space-y-3">
            {stats.recentUsers.map((u: any) => (
              <div key={u.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {(u.full_name || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{u.full_name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">{u.plan} plan • {u.spreadsheets_used} uploads</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${u.plan === 'pro' ? 'bg-primary/10 text-primary' : u.plan === 'business' ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'}`}>
                  {u.plan?.toUpperCase()}
                </span>
              </div>
            ))}
            {stats.recentUsers.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No users yet</p>}
          </div>
        </div>

        {/* Recent API logs */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" /> Recent API Activity
          </h3>
          <div className="space-y-2">
            {stats.recentLogs.map((log: any) => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${log.status >= 200 && log.status < 300 ? 'bg-success' : 'bg-destructive'}`} />
                  <div>
                    <p className="text-sm font-medium">{log.function_name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {log.response_time_ms ? `${log.response_time_ms}ms` : 'N/A'} • {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${log.status >= 200 && log.status < 300 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                  {log.status}
                </span>
              </div>
            ))}
            {stats.recentLogs.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No API activity yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
