import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Brain, User } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const sampleResponses: Record<string, string> = {
  'default': "Based on your uploaded financial data, I can see several key trends. Revenue has been growing steadily at approximately 12% month-over-month, while expenses have remained relatively stable. Your strongest performing month was June with $67,000 in revenue.\n\nWould you like me to dive deeper into any specific area?",
  'expense': "Looking at your expense data, **Marketing** is your largest cost center at 32% of total expenses ($156,000), followed by Operations at 23% and Payroll at 20%.\n\n**Key observation:** Marketing spend increased 45% in the last 2 weeks compared to the 3-month average. I recommend reviewing campaign ROI to ensure this increased investment is generating proportional returns.",
  'profit': "Your net profit has shown a strong upward trend over the past 6 months:\n\n- **Best month:** June at $27,000 (40% margin)\n- **Growth rate:** 22.7% increase from last month\n- **Trend:** Consistent improvement since January\n\nHowever, if expense volatility continues to increase at the current rate, margin compression could occur within 60 days. I recommend implementing budget caps for variable cost categories.",
  'cash': "Based on current revenue and expense trajectories, your cash flow position is **healthy** with low risk of depletion in the next 90 days.\n\n**Projected cash flow:**\n- 30 days: +$28,500 (strong)\n- 60 days: +$25,200 (moderate)\n- 90 days: +$22,000 (adequate)\n\nThe slight decline is driven by increasing operational costs. Consider tightening payment terms with late-paying clients to improve collection timing.",
};

function getResponse(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes('expense') || lower.includes('cost') || lower.includes('category')) return sampleResponses['expense'];
  if (lower.includes('profit') || lower.includes('margin') || lower.includes('profitable')) return sampleResponses['profit'];
  if (lower.includes('cash') || lower.includes('runway') || lower.includes('run out')) return sampleResponses['cash'];
  return sampleResponses['default'];
}

export default function CopilotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your AI financial copilot. I've analyzed your uploaded data and I'm ready to answer any questions about your business finances. Try asking me about expenses, revenue trends, or cash flow projections." },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: getResponse(userMsg) }]);
      setIsTyping(false);
    }, 1200);
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
        <p className="text-sm text-muted-foreground">Ask questions about your financial data in plain English</p>
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
        {isTyping && (
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

      {messages.length === 1 && (
        <div className="px-6 pb-3 flex flex-wrap gap-2">
          {suggestions.map(s => (
            <button key={s} onClick={() => { setInput(s); }} className="px-3 py-1.5 rounded-full bg-secondary text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="p-4 border-t border-border/50">
        <div className="flex gap-3 max-w-3xl mx-auto">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about your finances..."
            className="flex-1 px-4 py-3 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          <button onClick={sendMessage} disabled={!input.trim() || isTyping}
            className="px-4 py-3 rounded-xl bg-primary text-primary-foreground disabled:opacity-50 hover:brightness-110 transition-all">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
