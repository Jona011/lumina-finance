import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Trash2, Crown, Shield, ChevronDown, Edit2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserRow {
  id: string;
  user_id: string;
  full_name: string | null;
  plan: string;
  spreadsheets_used: number;
  max_spreadsheets: number;
  created_at: string;
  updated_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingPlan, setEditingPlan] = useState<string | null>(null);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (!error && data) setUsers(data);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const updatePlan = async (userId: string, plan: string) => {
    const maxSheets = plan === 'free' ? 1 : 999999;
    const { error } = await supabase.from('profiles').update({ plan, max_spreadsheets: maxSheets }).eq('user_id', userId);
    if (error) { toast.error('Failed to update plan'); return; }
    toast.success('Plan updated');
    setEditingPlan(null);
    fetchUsers();
  };

  const deleteUser = async (userId: string, name: string) => {
    if (!confirm(`Delete user "${name || 'Unknown'}" and all their data?`)) return;
    await Promise.all([
      supabase.from('chat_messages').delete().eq('user_id', userId),
      supabase.from('spreadsheets').delete().eq('user_id', userId),
    ]);
    await supabase.from('profiles').delete().eq('user_id', userId);
    toast.success('User data deleted');
    fetchUsers();
  };

  const filtered = users.filter(u =>
    (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    u.user_id.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 rounded-full border-3 border-primary border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2"><Users className="w-6 h-6 text-primary" /> User Management</h1>
          <p className="text-sm text-muted-foreground">{users.length} total users</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Plan</th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Uploads</th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Joined</th>
                <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {(u.full_name || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{u.full_name || 'Unknown'}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">{u.user_id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {editingPlan === u.user_id ? (
                      <div className="flex items-center gap-1">
                        {['free', 'pro', 'business'].map(p => (
                          <button key={p} onClick={() => updatePlan(u.user_id, p)}
                            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${u.plan === p ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-primary/10'}`}>
                            {p.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <button onClick={() => setEditingPlan(u.user_id)}
                        className={`px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 ${
                          u.plan === 'pro' ? 'bg-primary/10 text-primary' : u.plan === 'business' ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'
                        }`}>
                        <Crown className="w-3 h-3" /> {u.plan.toUpperCase()}
                        <Edit2 className="w-2.5 h-2.5 ml-1 opacity-50" />
                      </button>
                    )}
                  </td>
                  <td className="p-4 text-sm">{u.spreadsheets_used}</td>
                  <td className="p-4 text-sm text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => deleteUser(u.user_id, u.full_name || '')}
                      className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">No users found</p>
        )}
      </div>
    </div>
  );
}
