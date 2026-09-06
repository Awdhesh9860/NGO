import React from 'react';
import {
  Menu,
  X,
  LogOut,
  HeartHandshake,
  Receipt,
  FileCheck,
  Repeat,
  Target,
  TrendingUp,
  User,
  LayoutDashboard,
  ExternalLink,
} from 'lucide-react';
import { NAVIGATION_CONFIG } from '../../config/navigation';
import { Avatar } from '../ui/Avatar';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export interface DonorLayoutProps {
  activeNavId?: string;
  onNavigate: (view: string) => void;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

const iconMap: Record<string, React.ReactNode> = {
  HeartHandshake: <HeartHandshake className="h-4 w-4" />,
  Receipt: <Receipt className="h-4 w-4" />,
  FileCheck: <FileCheck className="h-4 w-4" />,
  Repeat: <Repeat className="h-4 w-4" />,
  Target: <Target className="h-4 w-4" />,
  TrendingUp: <TrendingUp className="h-4 w-4" />,
  User: <User className="h-4 w-4" />,
};

export const DonorLayout: React.FC<DonorLayoutProps> = ({
  activeNavId = 'donor-dash',
  onNavigate,
  title,
  subtitle,
  actions,
  children,
}) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased font-sans">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Donor Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-slate-200 text-slate-700 flex flex-col transition-transform duration-200 ease-in-out md:static md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
              V
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900">Donor Portal</h2>
              <span className="text-[10px] text-emerald-600 font-bold">80G TAX-EXEMPT</span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAVIGATION_CONFIG.donor.map((item) => {
            const isActive = activeNavId === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setSidebarOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition text-left',
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                {item.icon && (iconMap[item.icon] || <LayoutDashboard className="h-4 w-4" />)}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <button
            onClick={() => onNavigate('home')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:bg-slate-50 transition"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Public Site</span>
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-xs font-bold text-slate-800">Donor Impact Hub</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar fallback={user?.name || 'Donor'} size="xs" />
              <span className="text-xs font-semibold text-slate-700 hidden sm:inline">{user?.name}</span>
            </div>
            <button
              onClick={() => logout()}
              title="Sign out"
              className="p-1 text-slate-400 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-6">
          {(title || subtitle || actions) && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                {title && <h1 className="text-lg font-bold text-slate-900">{title}</h1>}
                {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
              </div>
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
};
