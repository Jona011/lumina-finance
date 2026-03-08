import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Brain, User } from 'lucide-react';
import PremiumGate from '@/components/PremiumGate';
import { useAuth } from '@/context/AuthContext';
import { useFinancial } from '@/context/FinancialContext';
import UpgradeModal from '@/components/UpgradeModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/financial-chat`;
const FREE_MESSAGE_LIMIT = 3;

export default function CopilotPage() {
  const { user } = useAuth();
  const { kpi, monthlyData, categoryBreakdown, insights } = useFinancial();
  const isPremium = user?.plan === 'pro' || user?.plan === 'business';
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your AI financial copilot. I've analyzed your uploaded data and I'm ready to answer any questions about your business finances. Try asking me about expenses, revenue trends, or cash flow projections." },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const userMessageCount = messages.filter(m => m.role === 'user').length;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Build financial context string for the AI
  const financialContext = `
Revenue: $${kpi.revenue.value.toLocaleString()} (${kpi.revenue.change > 0 ? '+' : ''}${kpi.revenue.change}% change)
Expenses: $${kpi.expenses.value.toLocaleString()} (${kpi.expenses.change > 0 ? '+' : ''}${kpi.expenses.change}% change)
Profit: $${kpi.profit.value.toLocaleString()} (${kpi.profit.change > 0 ? '+' : ''}${kpi.profit.change}% change)
Health Score: ${kpi.healthScore.value}/100

Monthly Data: ${JSON.stringify(monthlyData.slice(-6))}

Top Expense Categories: ${categoryBreakdown.map(c => `${c.name}: $${c.value.toLocaleString()} (${c.percentage}%)`).join(', ')}

Key Insights: ${insights.map(i => i.title + ': ' + i.description).join('; ')}
  `.trim();

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;
    if (!isPremium && userMessageCount >= FREE_MESSAGE_LIMIT) {
      setShowUpgrade(true);
      return;
    }

    const userMsg = input.trim();
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setIsStreaming(true);

    let assistantContent = '';

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          financialContext,
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        if (resp.status === 429) {
          toast.error('Rate limit exceeded. Please wait a moment and try again.');
        } else if (resp.status === 402) {
          toast.error('AI usage limit reached. Please add credits.');
        } else {
          toast.error(errData.error || 'AI service error');
        }
        setIsStreaming(false);
        return;
      }

      const reader = resp.body?.getReader();
      if (!reader) throw new Error('No stream');
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant' && prev.length > 1) {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
                }
                return [...prev, { role: 'assistant', content: assistantContent }];
              });
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // Save messages to DB
      if (user) {
        await supabase.from('chat_messages').insert([
          { user_id: user.id, role: 'user', content: userMsg },
          { user_id: user.id, role: 'assistant', content: assistantContent },
        ]);
      }
    } catch (e) {
      console.error('Stream error:', e);
      toast.error('Failed to get AI response. Please try again.');
    }

    setIsStreaming(false);
  };

  const suggestions = [
    "Which expense category costs the most?",
    "Is my business becoming more profitable?",
    "Will I run out of cash in 3 months?",
    "Why did expenses increase recently?",
  ];

  return (
    <div className="flex flex-col h-screen">
      <div className="p-6 border-b border-border/50">
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2"><Brain className="w-6 h-6 text-primary" /> AI Copilot</h1>
        <p className="text-sm text-muted-foreground">
          Ask questions about your financial data in plain English
          {!isPremium && <span className="ml-2 text-warning">({Math.max(0, FREE_MESSAGE_LIMIT - userMessageCount)} free questions remaining)</span>}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Brain className="w-4 h-4 text-primary" />
              </div>
            )}
            <div className={`max-w-[600px] rounded-xl p-4 text-sm leading-relaxed ${
              msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'glass-card'
            }`}>
              {msg.content.split('\n').map((line, j) => (
                <p key={j} className={j > 0 ? 'mt-2' : ''}>
                  {line.split('**').map((part, k) => k % 2 === 1 ? <strong key={k}>{part}</strong> : part)}
                </p>
              ))}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
          </motion.div>
        ))}
        {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <div className="glass-card px-4 py-3 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {!isPremium && userMessageCount >= FREE_MESSAGE_LIMIT && (
        <PremiumGate featureLabel="Full AI copilot access on Pro" blurIntensity="sm">
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Unlimited AI conversations available on Pro</p>
          </div>
        </PremiumGate>
      )}

      {messages.length === 1 && (
        <div className="px-6 pb-3 flex flex-wrap gap-2">
          {suggestions.map(s => (
            <button key={s} onClick={() => setInput(s)} className="px-3 py-1.5 rounded-full bg-secondary text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="p-4 border-t border-border/50">
        <div className="flex gap-3 max-w-3xl mx-auto">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={!isPremium && userMessageCount >= FREE_MESSAGE_LIMIT ? "Upgrade to continue asking..." : "Ask about your finances..."}
            disabled={!isPremium && userMessageCount >= FREE_MESSAGE_LIMIT}
            className="flex-1 px-4 py-3 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50" />
          <button onClick={sendMessage} disabled={!input.trim() || isStreaming || (!isPremium && userMessageCount >= FREE_MESSAGE_LIMIT)}
            className="px-4 py-3 rounded-xl bg-primary text-primary-foreground disabled:opacity-50 hover:brightness-110 transition-all">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  );
}
