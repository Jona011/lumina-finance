import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Clock, AlertCircle, CheckCircle, Search, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function ApiLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'error'>('all');

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await supabase.from('api_logs').select('*').order('created_at', { ascending: false }).limit(200);
    setLogs(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  const filtered = logs.filter(l => {
    const matchSearch = l.function_name.toLowerCase().includes(search.toLowerCase()) ||
      (l.error_message || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || (statusFilter === 'success' ? l.status < 400 : l.status >= 400);
    return matchSearch && matchStatus;
  });

  const avgResponseTime = logs.length > 0
    ? Math.round(logs.filter(l => l.response_time_ms).reduce((a, l) => a + (l.response_time_ms || 0), 0) / Math.max(1, logs.filter(l => l.response_time_ms).length))
    : 0;
  const errorRate = logs.length > 0 ? Math.round((logs.filter(l => l.status >= 400).length / logs.length) * 100) : 0;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2"><Database className="w-6 h-6 text-primary" /> API Logs</h1>
          <p className="text-sm text-muted-foreground">{logs.length} total requests logged</p>
        </div>
        <button onClick={fetchLogs} className="p-2 rounded-xl bg-card border border-border hover:bg-muted transition-all">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold">{avgResponseTime}ms</p>
          <p className="text-xs text-muted-foreground">Avg Response Time</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-success">{logs.filter(l => l.status < 400).length}</p>
          <p className="text-xs text-muted-foreground">Successful</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-destructive">{errorRate}%</p>
          <p className="text-xs text-muted-foreground">Error Rate</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search functions or errors..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div className="flex gap-1">
          {(['all', 'success', 'error'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Logs list */}
      <div className="space-y-2">
        {filtered.map((log, i) => (
          <motion.div key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01 }}
            className="glass-card p-4 flex items-center gap-4">
            {log.status < 400 ? (
              <CheckCircle className="w-5 h-5 text-success shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-semibold">{log.function_name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${log.status < 400 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                  {log.status}
                </span>
                {log.response_time_ms && (
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {log.response_time_ms}ms
                  </span>
                )}
              </div>
              {log.error_message && (
                <p className="text-xs text-destructive mt-1 truncate">{log.error_message}</p>
              )}
              <p className="text-[10px] text-muted-foreground mt-1">
                {new Date(log.created_at).toLocaleString()}
                {log.user_id && <span className="ml-2 font-mono">user:{log.user_id.slice(0, 8)}</span>}
              </p>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No logs found</p>}
      </div>
    </div>
  );
}
