import { Settings, User, CreditCard, Shield, Crown, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import UpgradeModal from '@/components/UpgradeModal';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const isPremium = user?.plan === 'pro' || user?.plan === 'business';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[800px]">
      <div>
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2"><Settings className="w-6 h-6 text-primary" /> Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and workspace</p>
      </div>

      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Profile</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Name</span>
            <span className="text-sm font-medium">{user?.name || 'Unknown'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="text-sm font-medium">{user?.email || 'Unknown'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Login method</span>
            <span className="px-3 py-1 rounded-full bg-muted text-xs font-medium capitalize">{user?.authProvider || 'email'}</span>
          </div>
          {user?.isAdmin && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Role</span>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">ADMIN</span>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Crown className="w-4 h-4 text-primary" /> Plan</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current plan</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isPremium ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
              {user?.plan?.toUpperCase() || 'FREE'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Spreadsheet uploads</span>
            <span className="text-sm font-medium">
              {user?.spreadsheetsUsed || 0} of {user?.plan === 'free' ? user?.maxSpreadsheets : '∞'}
            </span>
          </div>
          {!isPremium && (
            <>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${((user?.spreadsheetsUsed || 0) / (user?.maxSpreadsheets || 1)) * 100}%` }} />
              </div>
              <button onClick={() => setShowUpgrade(true)}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 transition-all shadow-lg shadow-primary/20">
                Upgrade to Pro
              </button>
            </>
          )}
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary" /> Billing</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Payment method</span>
            <span className="text-sm text-muted-foreground/60">{isPremium ? 'Visa •••• 4242' : 'None'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Next billing date</span>
            <span className="text-sm text-muted-foreground/60">{isPremium ? 'Apr 8, 2026' : '—'}</span>
          </div>
        </div>
      </div>

      {[
        { title: 'Currency', desc: 'Default currency', value: 'USD ($)' },
        { title: 'Date Format', desc: 'Preferred date format', value: 'MM/DD/YYYY' },
        { title: 'Fiscal Year Start', desc: 'When your fiscal year begins', value: 'January' },
        { title: 'Industry', desc: 'For benchmark comparisons', value: 'Technology / SaaS' },
      ].map(item => (
        <div key={item.title} className="glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{item.title}</p>
            <p className="text-xs text-muted-foreground">{item.desc}</p>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-muted text-sm text-muted-foreground">{item.value}</span>
        </div>
      ))}

      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Data & Privacy</h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>• Your data is encrypted at rest and in transit</p>
          <p>• Files are processed securely and never shared</p>
          <p>• You can delete all uploaded data at any time</p>
        </div>
        <button className="mt-4 px-4 py-2 rounded-xl bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors">
          Delete All Data
        </button>
      </div>

      <button onClick={handleLogout}
        className="w-full glass-card p-4 flex items-center justify-center gap-2 text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors">
        <LogOut className="w-4 h-4" /> Sign Out
      </button>

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  );
}
