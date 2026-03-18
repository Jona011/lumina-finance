import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, FileSpreadsheet, MessageSquare, Trash2, Eye, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function ContentModerationPage() {
  const [tab, setTab] = useState<'spreadsheets' | 'messages'>('spreadsheets');
  const [spreadsheets, setSpreadsheets] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [ss, msgs] = await Promise.all([
        supabase.from('spreadsheets').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('chat_messages').select('*').order('created_at', { ascending: false }).limit(200),
      ]);
      setSpreadsheets(ss.data || []);
      setMessages(msgs.data || []);
      setLoading(false);
    }
    load();
  }, []);

  const deleteSpreadsheet = async (id: string) => {
    if (!confirm('Delete this spreadsheet?')) return;
    await supabase.from('spreadsheets').delete().eq('id', id);
    setSpreadsheets(prev => prev.filter(s => s.id !== id));
    toast.success('Spreadsheet deleted');
  };

  const deleteMessage = async (id: string) => {
    await supabase.from('chat_messages').delete().eq('id', id);
    setMessages(prev => prev.filter(m => m.id !== id));
    toast.success('Message deleted');
  };

  const deleteAllUserMessages = async (userId: string) => {
    if (!confirm('Delete all messages for this user?')) return;
    await supabase.from('chat_messages').delete().eq('user_id', userId);
    setMessages(prev => prev.filter(m => m.user_id !== userId));
    toast.success('All user messages deleted');
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 rounded-full border-3 border-primary border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1200px]">
      <div>
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2"><Shield className="w-6 h-6 text-primary" /> Content & Data Management</h1>
        <p className="text-sm text-muted-foreground">View and moderate all user-generated content</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('spreadsheets')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'spreadsheets' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}>
          <FileSpreadsheet className="w-4 h-4 inline mr-2" />
          Spreadsheets ({spreadsheets.length})
        </button>
        <button onClick={() => setTab('messages')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'messages' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}>
          <MessageSquare className="w-4 h-4 inline mr-2" />
          Chat Messages ({messages.length})
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder={`Search ${tab}...`}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
      </div>

      {tab === 'spreadsheets' && (
        <div className="space-y-3">
          {spreadsheets
            .filter(s => s.file_name.toLowerCase().includes(search.toLowerCase()) || s.user_id.includes(search))
            .map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
              className="glass-card overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{s.file_name}</p>
                    <p className="text-[11px] text-muted-foreground">User: {s.user_id.slice(0, 8)}... • {new Date(s.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                    {expandedId === s.id ? <ChevronUp className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => deleteSpreadsheet(s.id)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {expandedId === s.id && (
                <div className="p-4 pt-0 border-t border-border/50">
                  <pre className="text-xs text-muted-foreground bg-muted/50 rounded-xl p-3 max-h-48 overflow-auto">
                    {JSON.stringify(s.processed_data, null, 2)?.slice(0, 2000) || 'No data'}
                  </pre>
                </div>
              )}
            </motion.div>
          ))}
          {spreadsheets.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No spreadsheets uploaded yet</p>}
        </div>
      )}

      {tab === 'messages' && (
        <div className="space-y-2">
          {messages
            .filter(m => m.content.toLowerCase().includes(search.toLowerCase()) || m.user_id.includes(search))
            .map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01 }}
              className="glass-card p-4 flex items-start gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${m.role === 'assistant' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                {m.role === 'assistant' ? 'AI' : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-semibold uppercase text-muted-foreground">{m.role}</span>
                  <span className="text-[10px] text-muted-foreground">{new Date(m.created_at).toLocaleString()}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">user:{m.user_id.slice(0, 6)}</span>
                </div>
                <p className="text-sm text-foreground line-clamp-3">{m.content}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => deleteMessage(m.id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
          {messages.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No messages yet</p>}
        </div>
      )}
    </div>
  );
}
