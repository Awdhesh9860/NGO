import React from 'react';
import {
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  ShieldAlert,
  Sliders,
  ExternalLink,
  ChevronRight,
  LayoutDashboard,
  Target,
  Receipt,
  Users,
  Calendar,
  FileText,
  Settings,
} from 'lucide-react';
import { NAVIGATION_CONFIG, NavItem } from '../../config/navigation';
import { Avatar } from '../ui/Avatar';
import { Breadcrumb, BreadcrumbItem } from '../ui/Breadcrumb';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export interface AdminLayoutProps {
  activeNavId?: string;
  onNavigate: (view: string) => void;
  breadcrumbs?: BreadcrumbItem[];
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-4 w-4" />,
  Target: <Target className="h-4 w-4" />,
  Receipt: <Receipt className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />,
  Calendar: <Calendar className="h-4 w-4" />,
  FileText: <FileText className="h-4 w-4" />,
  Settings: <Settings className="h-4 w-4" />,
};

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeNavId = 'admin-dash',
  onNavigate,
  breadcrumbs = [{ label: 'Admin Portal' }],
  title,
  subtitle,
  actions,
  children,
}) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    'admin-impact': true,
    'admin-finance': true,
  });

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row antialiased font-sans">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out md:static md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-md">
              V
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">Vikas Admin</h1>
              <span className="text-[10px] text-emerald-400 font-mono tracking-wide">ENTERPRISE TIER</span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tree */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
          {NAVIGATION_CONFIG.admin.map((item: NavItem) => {
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedSections[item.id] ?? false;
            const isActive = activeNavId === item.id;

            if (hasChildren) {
              return (
                <div key={item.id} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleSection(item.id)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg text-slate-300 hover:bg-slate-800/80 hover:text-white transition"
                  >
                    <div className="flex items-center gap-2.5">
                      {item.icon && (iconMap[item.icon] || <LayoutDashboard className="h-4 w-4" />)}
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        'h-3.5 w-3.5 text-slate-500 transition-transform',
                        isExpanded && 'rotate-180 text-emerald-400'
                      )}
                    />
                  </button>

                  {isExpanded && (
                    <div className="pl-6 space-y-1 border-l border-slate-800 ml-3">
                      {item.children?.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => {
                            onNavigate(sub.id);
                            setSidebarOpen(false);
                          }}
                          className={cn(
                            'w-full text-left px-3 py-1.5 text-xs rounded-md transition flex items-center justify-between',
                            activeNavId === sub.id
                              ? 'bg-emerald-600/20 text-emerald-400 font-bold'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                          )}
                        >
                          <span>{sub.label}</span>
                          {sub.badge && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                              {sub.badge}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setSidebarOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition',
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                )}
              >
                {item.icon && (iconMap[item.icon] || <LayoutDashboard className="h-4 w-4" />)}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <button
            onClick={() => onNavigate('home')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5" />
              Public Website
            </span>
            <ChevronRight className="h-3 w-3 text-slate-600" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Breadcrumb items={breadcrumbs} />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
              aria-label="Notifications"
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            </button>

            <div className="h-6 w-px bg-slate-200" />

            <div className="flex items-center gap-2.5">
              <Avatar fallback={user?.name || 'Admin User'} size="sm" status="online" />
              <div className="hidden sm:block text-left text-xs">
                <p className="font-bold text-slate-800 leading-tight">{user?.name || 'Admin'}</p>
                <p className="text-[10px] text-slate-400">{user?.role || 'SUPER_ADMIN'}</p>
              </div>
              <button
                onClick={() => logout()}
                title="Sign out"
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {(title || subtitle || actions) && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                {title && <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>}
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
