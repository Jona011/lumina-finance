import { NavLink, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, AlertTriangle, Heart, FlaskConical, FileText, Database, MessageSquare, Settings, Brain, ChevronLeft, ChevronRight, Crown, Users, BarChart3, Shield, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const userNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', premium: false },
  { to: '/dashboard/forecasts', icon: TrendingUp, label: 'Forecasts', premium: true },
  { to: '/dashboard/anomalies', icon: AlertTriangle, label: 'Anomalies', premium: false },
  { to: '/dashboard/health', icon: Heart, label: 'Health Score', premium: false },
  { to: '/dashboard/scenario', icon: FlaskConical, label: 'Scenario Lab', premium: true },
  { to: '/dashboard/reports', icon: FileText, label: 'Reports', premium: true },
  { to: '/dashboard/data-quality', icon: Database, label: 'Data Quality', premium: false },
  { to: '/dashboard/copilot', icon: MessageSquare, label: 'AI Copilot', premium: false },
];

const adminNavItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', premium: false },
  { to: '/admin/users', icon: Users, label: 'User Management', premium: false },
  { to: '/admin/analytics', icon: BarChart3, label: 'Platform Analytics', premium: false },
  { to: '/admin/content', icon: Shield, label: 'Content & Data', premium: false },
  { to: '/admin/api-logs', icon: Database, label: 'API Logs', premium: false },
  { to: '/admin/settings', icon: Settings, label: 'Settings', premium: false },
];

export default function DashboardLayout({ isAdmin = false }: { isAdmin?: boolean }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isPremium = user?.plan === 'pro' || user?.plan === 'business';
  const navItems = isAdmin ? adminNavItems : userNavItems;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex">
      <aside className={`${collapsed ? 'w-[72px]' : 'w-64'} shrink-0 bg-sidebar flex flex-col transition-all duration-300 rounded-r-3xl`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 gap-3">
          <div className="w-9 h-9 rounded-xl bg-sidebar-primary flex items-center justify-center shrink-0">
            <Brain className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <span className="font-bold text-sidebar-primary-foreground text-sm">Finora AI</span>
              {isAdmin && <span className="block text-[10px] text-sidebar-foreground">Admin Panel</span>}
            </div>
          )}
        </div>

        {/* Plan badge */}
        {!collapsed && !isAdmin && (
          <div className="mx-3 mt-1 px-3 py-2 rounded-xl bg-sidebar-accent/50">
            <div className="flex items-center gap-2">
              <Crown className={`w-3.5 h-3.5 ${isPremium ? 'text-sidebar-primary' : 'text-sidebar-foreground'}`} />
              <span className="text-xs font-medium text-sidebar-primary-foreground">{user?.plan?.toUpperCase() || 'FREE'}</span>
            </div>
          </div>
        )}

        {/* Switch link */}
        {!collapsed && user?.isAdmin && (
          <div className="mx-3 mt-2">
            <NavLink
              to={isAdmin ? '/dashboard' : '/admin'}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-sidebar-foreground hover:text-sidebar-primary-foreground hover:bg-sidebar-accent/50 transition-colors"
            >
              {isAdmin ? <LayoutDashboard className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
              {isAdmin ? 'User Dashboard' : 'Admin Panel'}
            </NavLink>
          </div>
        )}

        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/dashboard' || item.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/40 hover:text-sidebar-primary-foreground'
                }`
              }>
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && (
                <span className="flex items-center gap-2">
                  {item.label}
                  {item.premium && !isPremium && !isAdmin && <Crown className="w-3 h-3 text-warning" />}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-2 space-y-1">
          {!isAdmin && (
            <NavLink to="/dashboard/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'bg-sidebar-accent text-sidebar-primary-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/40'
                }`
              }>
              <Settings className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span>Settings</span>}
            </NavLink>
          )}
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground hover:bg-sidebar-accent/40 hover:text-sidebar-primary-foreground transition-all">
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
          <button onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground hover:bg-sidebar-accent/40 transition-all">
            {collapsed ? <ChevronRight className="w-[18px] h-[18px]" /> : <><ChevronLeft className="w-[18px] h-[18px]" /><span>Collapse</span></>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
