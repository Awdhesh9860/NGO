'use client';

import React, { useState } from 'react';
import Link from 'next/navigation';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Building2,
  Mail,
  Building,
  Settings,
  History,
  Bell,
  ChevronRight,
  Menu,
  X,
  Globe,
  LogOut,
  ArrowLeft,
  Lock,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Executive Overview', href: '/dashboard/admin', icon: LayoutDashboard, exact: true },
    { name: 'User Management', href: '/dashboard/admin/users', icon: Users },
    { name: 'Roles & Permissions', href: '/dashboard/admin/roles', icon: ShieldCheck },
    { name: 'Departments', href: '/dashboard/admin/departments', icon: Building2 },
    { name: 'Invitations', href: '/dashboard/admin/invitations', icon: Mail },
    { name: 'Organization Profile', href: '/dashboard/admin/organization', icon: Building, exact: true },
    { name: 'System Settings', href: '/dashboard/admin/organization/settings', icon: Settings },
    { name: 'Audit Logs & Security', href: '/dashboard/admin/audit-logs', icon: History },
    { name: 'Alerts & Notifications', href: '/dashboard/admin/notifications', icon: Bell },
  ];

  const isActive = (itemHref: string, exact = false) => {
    if (exact) return pathname === itemHref;
    return pathname.startsWith(itemHref);
  };

  const getBreadcrumbs = () => {
    const parts = pathname.split('/').filter(Boolean);
    return parts.map((part, index) => {
      const href = '/' + parts.slice(0, index + 1).join('/');
      const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
      return { href, label, isLast: index === parts.length - 1 };
    });
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] dark:bg-[#0c1813] text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-150">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-[#e2ece6] dark:border-[#1d332b] bg-white/95 dark:bg-[#12221b]/95 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a3026]"
              aria-label="Toggle navigation"
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              className="hidden sm:flex items-center gap-2 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[#e2ece6] dark:border-[#1d332b] bg-slate-50 dark:bg-[#172b22] text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Portal</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-black text-sm">
                HH
              </span>
              <div>
                <h1 className="text-sm font-bold leading-none text-slate-900 dark:text-white flex items-center gap-1.5">
                  HopeHorizon NGO
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                    <Lock className="h-2.5 w-2.5" /> Admin Console
                  </span>
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Enterprise Administration & RBAC</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#172b22] transition"
            >
              <Globe className="h-3.5 w-3.5 text-emerald-600" />
              <span>Public Website</span>
            </button>

            <ThemeToggle />

            {/* User Profile info */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold leading-tight text-slate-900 dark:text-slate-100">
                  {currentUser?.name || 'Administrator'}
                </p>
                <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                  {currentUser?.role || 'SUPER_ADMIN'}
                </p>
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 font-bold text-xs ring-1 ring-emerald-500/30">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
              </div>

              <button
                onClick={logout}
                title="Log out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 transform border-r border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] pt-16 lg:pt-0 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-0 hidden lg:block'
          }`}
        >
          <div className="flex h-full flex-col justify-between p-4">
            <div className="space-y-1">
              <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Administration Modules
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const active = isActive(item.href, item.exact);
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.href}
                      onClick={() => {
                        router.push(item.href);
                        setIsSidebarOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                        active
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#172b22] hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Organization Info Footer Card */}
            <div className="rounded-xl border border-[#e2ece6] dark:border-[#1d332b] bg-slate-50 dark:bg-[#162920] p-3 text-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold">
                <span>Tenant Scoping</span>
                <span className="text-emerald-600">Active</span>
              </div>
              <p className="mt-1 font-bold text-slate-800 dark:text-slate-100 truncate">HopeHorizon Foundation</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">80G &bull; 12A Verified</p>
            </div>
          </div>
        </aside>

        {/* Backdrop for mobile sidebar */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Breadcrumbs */}
          <nav className="mb-6 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <button
              onClick={() => router.push('/dashboard')}
              className="hover:text-emerald-600 transition"
            >
              Dashboard
            </button>
            {getBreadcrumbs().map((b, idx) => (
              <React.Fragment key={b.href + idx}>
                <ChevronRight className="h-3 w-3 text-slate-400" />
                {b.isLast ? (
                  <span className="font-semibold text-slate-900 dark:text-white">{b.label}</span>
                ) : (
                  <button
                    onClick={() => router.push(b.href)}
                    className="hover:text-emerald-600 transition"
                  >
                    {b.label}
                  </button>
                )}
              </React.Fragment>
            ))}
          </nav>

          {children}
        </main>
      </div>
    </div>
  );
}
