import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, Mail, Eye, EyeOff, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type AuthView = 'login' | 'signup' | 'forgot' | 'reset' | 'verify';

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ characters', pass: password.length >= 8 },
    { label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'Number', pass: /\d/.test(password) },
    { label: 'Special character', pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.pass).length;
  const colors = ['bg-destructive', 'bg-destructive', 'bg-warning', 'bg-accent', 'bg-accent'];

  if (!password) return null;
  return (
    <div className="space-y-2 mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < score ? colors[score] : 'bg-secondary'}`} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map(c => (
          <span key={c.label} className={`text-[10px] flex items-center gap-1 ${c.pass ? 'text-accent' : 'text-muted-foreground'}`}>
            <Check className={`w-2.5 h-2.5 ${c.pass ? 'opacity-100' : 'opacity-30'}`} /> {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, signup, socialLogin, forgotPassword, isLoading } = useAuth();
  const [view, setView] = useState<AuthView>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (view === 'login') {
        if (!email || !password) { setError('Please enter email and password'); return; }
        await login(email, password);
        navigate('/upload');
      } else if (view === 'signup') {
        if (!name || !email || !password) { setError('Please fill all fields'); return; }
        if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
        await signup(name, email, password);
        navigate('/upload');
      } else if (view === 'forgot') {
        if (!email) { setError('Please enter your email'); return; }
        await forgotPassword(email);
        setSuccess('Password reset link sent to your email');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
  };

  const handleSocial = async (provider: 'google' | 'apple') => {
    try {
      await socialLogin(provider);
      navigate('/upload');
    } catch {
      setError('Social login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="relative z-10 max-w-md px-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Brain className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">Finora AI</span>
          </div>
          <h2 className="text-3xl font-bold mb-4 leading-tight">
            Your AI CFO for <span className="gradient-text">Financial Intelligence</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Upload spreadsheets. Uncover insights. Forecast growth. Make smarter decisions — all powered by intelligent financial analysis.
          </p>
          <div className="mt-10 space-y-4">
            {['Revenue forecasting & trend analysis', 'Anomaly detection & risk alerts', 'AI-powered financial copilot'].map(f => (
              <div key={f} className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-accent" />
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right auth panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">Finora AI</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={view} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              {(view === 'login' || view === 'signup') && (
                <>
                  <h1 className="text-2xl font-bold mb-1">{view === 'login' ? 'Welcome back' : 'Create your account'}</h1>
                  <p className="text-sm text-muted-foreground mb-8">
                    {view === 'login' ? 'Sign in to your financial workspace' : 'Start your AI-powered financial journey'}
                  </p>

                  {/* Social buttons */}
                  <div className="space-y-3 mb-6">
                    <button onClick={() => handleSocial('apple')} disabled={isLoading}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-foreground text-background font-medium text-sm hover:opacity-90 transition-all disabled:opacity-50">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                      Continue with Apple
                    </button>
                    <button onClick={() => handleSocial('google')} disabled={isLoading}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-secondary border border-border font-medium text-sm hover:bg-secondary/80 transition-all disabled:opacity-50">
                      <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                      Continue with Google
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">or continue with email</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {view === 'signup' && (
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Full Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Alex Johnson"
                          className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50" />
                      </div>
                    )}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Password</label>
                      <div className="relative">
                        <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                          className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 pr-10 placeholder:text-muted-foreground/50" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {view === 'signup' && <PasswordStrength password={password} />}
                    </div>
                    {view === 'login' && (
                      <button type="button" onClick={() => { setView('forgot'); setError(''); setSuccess(''); }} className="text-xs text-primary hover:underline">
                        Forgot password?
                      </button>
                    )}
                    {error && <p className="text-xs text-destructive">{error}</p>}
                    {success && <p className="text-xs text-accent">{success}</p>}
                    <button type="submit" disabled={isLoading}
                      className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50">
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : view === 'login' ? 'Sign In' : 'Create Account'}
                    </button>
                  </form>

                  <p className="text-center text-xs text-muted-foreground mt-6">
                    {view === 'login' ? "Don't have an account? " : 'Already have an account? '}
                    <button onClick={() => { setView(view === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); }} className="text-primary hover:underline font-medium">
                      {view === 'login' ? 'Sign up' : 'Sign in'}
                    </button>
                  </p>
                  <p className="text-center text-[10px] text-muted-foreground/60 mt-4">
                    Secure access to your financial intelligence workspace. Your data is encrypted and private.
                  </p>
                </>
              )}

              {view === 'forgot' && (
                <>
                  <button onClick={() => { setView('login'); setError(''); setSuccess(''); }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
                    <ArrowLeft className="w-4 h-4" /> Back to login
                  </button>
                  <h1 className="text-2xl font-bold mb-1">Reset password</h1>
                  <p className="text-sm text-muted-foreground mb-8">Enter your email and we'll send a reset link</p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com"
                        className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50" />
                    </div>
                    {error && <p className="text-xs text-destructive">{error}</p>}
                    {success && <p className="text-xs text-accent">{success}</p>}
                    <button type="submit" disabled={isLoading}
                      className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50">
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Reset Link'}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
