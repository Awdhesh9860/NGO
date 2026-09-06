import React from 'react';
import {
  Menu,
  X,
  Bell,
  LogOut,
  FolderKanban,
  CheckSquare,
  Clock,
  CalendarDays,
  Calendar,
  FileSpreadsheet,
  User,
  LayoutDashboard,
  ExternalLink,
} from 'lucide-react';
import { NAVIGATION_CONFIG } from '../../config/navigation';
import { Avatar } from '../ui/Avatar';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export interface TeamLayoutProps {
  activeNavId?: string;
  onNavigate: (view: string) => void;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-4 w-4" />,
  FolderKanban: <FolderKanban className="h-4 w-4" />,
  CheckSquare: <CheckSquare className="h-4 w-4" />,
  Clock: <Clock className="h-4 w-4" />,
  CalendarDays: <CalendarDays className="h-4 w-4" />,
  Calendar: <Calendar className="h-4 w-4" />,
  FileSpreadsheet: <FileSpreadsheet className="h-4 w-4" />,
  Bell: <Bell className="h-4 w-4" />,
  User: <User className="h-4 w-4" />,
};

export const TeamLayout: React.FC<TeamLayoutProps> = ({
  activeNavId = 'team-dash',
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
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Streamlined Team Sidebar */}
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
              <h2 className="text-xs font-bold text-slate-900">Staff Portal</h2>
              <p className="text-[10px] text-slate-400">Team Operations</p>
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
          {NAVIGATION_CONFIG.team.map((item) => {
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
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-xs font-bold text-slate-800">Team Workspace</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar fallback={user?.name || 'Staff'} size="xs" status="online" />
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

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">
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
