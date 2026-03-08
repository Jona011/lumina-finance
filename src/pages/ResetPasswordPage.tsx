import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, ArrowLeft, Loader2, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { resetPassword, isLoading } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    try {
      await resetPassword(password);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch {
      setError('Failed to reset password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">Finora AI</span>
        </div>

        {success ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 text-accent" />
            </div>
            <h2 className="text-xl font-bold mb-2">Password updated!</h2>
            <p className="text-sm text-muted-foreground">Redirecting to your dashboard...</p>
          </motion.div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-1">Set new password</h1>
            <p className="text-sm text-muted-foreground mb-8">Enter your new password below</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">New Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Confirm Password</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50" />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <button type="submit" disabled={isLoading}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
