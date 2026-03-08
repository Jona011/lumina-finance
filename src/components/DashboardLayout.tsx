import { NavLink, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, AlertTriangle, Heart, FlaskConical, FileText, Database, MessageSquare, Settings, Brain, ChevronLeft, ChevronRight, Crown } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', premium: false },
  { to: '/dashboard/forecasts', icon: TrendingUp, label: 'Forecasts', premium: true },
  { to: '/dashboard/anomalies', icon: AlertTriangle, label: 'Anomalies', premium: false },
  { to: '/dashboard/health', icon: Heart, label: 'Health Score', premium: false },
  { to: '/dashboard/scenario', icon: FlaskConical, label: 'Scenario Lab', premium: true },
  { to: '/dashboard/reports', icon: FileText, label: 'Reports', premium: true },
  { to: '/dashboard/data-quality', icon: Database, label: 'Data Quality', premium: false },
  { to: '/dashboard/copilot', icon: MessageSquare, label: 'AI Copilot', premium: false },
];

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const isPremium = user?.plan === 'pro' || user?.plan === 'business';

  return (
    <div className="min-h-screen bg-background flex">
      <aside className={`${collapsed ? 'w-16' : 'w-60'} shrink-0 border-r border-border/50 bg-sidebar flex flex-col transition-all duration-300`}>
        <div className="h-16 flex items-center px-4 border-b border-sidebar-border gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && <span className="font-bold text-foreground">Finora AI</span>}
        </div>

        {/* Plan badge */}
        {!collapsed && (
          <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-secondary/50 border border-border/50">
            <div className="flex items-center gap-2">
              <Crown className={`w-3.5 h-3.5 ${isPremium ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="text-xs font-medium">{user?.plan?.toUpperCase() || 'FREE'} Plan</span>
            </div>
          </div>
        )}

        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-sidebar-accent text-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground'
                }`
              }>
              <item.icon className="w-4.5 h-4.5 shrink-0" />
              {!collapsed && (
                <span className="flex items-center gap-2">
                  {item.label}
                  {item.premium && !isPremium && <Crown className="w-3 h-3 text-warning" />}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-2 border-t border-sidebar-border">
          <NavLink to="/dashboard/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-sidebar-accent text-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`
            }>
            <Settings className="w-4.5 h-4.5 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </NavLink>
          <button onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors mt-1">
            {collapsed ? <ChevronRight className="w-4.5 h-4.5" /> : <><ChevronLeft className="w-4.5 h-4.5" /><span>Collapse</span></>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
