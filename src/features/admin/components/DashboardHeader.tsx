'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu,
  X,
  ArrowLeft,
  Lock,
  Globe,
  LogOut,
  Search,
  Users,
  Building2,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { NotificationPanel } from './NotificationPanel';
import { adminApiService, AdminSearchResult } from '../services/admin-api.service';

export interface DashboardHeaderProps {
  userName?: string;
  userRole?: string;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onLogout: () => void;
}

export function DashboardHeader({
  userName = 'Administrator',
  userRole = 'ADMIN',
  isSidebarOpen,
  onToggleSidebar,
  onLogout,
}: DashboardHeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AdminSearchResult | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSearchResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await adminApiService.globalSearch(trimmed);
        if (res.success && res.data) {
          setSearchResults(res.data);
          setSearchOpen(true);
        }
      } catch {
        setSearchResults(null);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const hasResults =
    searchResults &&
    (searchResults.users.length > 0 ||
      searchResults.departments.length > 0 ||
      searchResults.invitations.length > 0 ||
      searchResults.roles.length > 0);

  return (
    <header className="sticky top-0 z-40 border-b border-[#e2ece6] dark:border-[#1d332b] bg-white/95 dark:bg-[#12221b]/95 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden rounded-lg p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a3026]"
            aria-label="Toggle navigation sidebar"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-[#e2ece6] dark:border-[#1d332b] bg-slate-50 dark:bg-[#172b22] px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Portal</span>
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#087F5B] text-white font-black text-sm">
              HH
            </span>
            <div className="min-w-0">
              <h1 className="text-sm font-bold leading-none text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                <span className="truncate">HopeHorizon NGO</span>
                <span className="hidden xs:inline-flex items-center gap-1 rounded bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 shrink-0">
                  <Lock className="h-2.5 w-2.5" /> Admin
                </span>
              </h1>
              <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Enterprise Administration & Organization Suite
              </p>
            </div>
          </div>
        </div>

        {/* Global Tenant-Scoped Admin Search */}
        <div className="relative hidden md:block flex-1 max-w-md mx-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchResults && setSearchOpen(true)}
            placeholder="Search users, departments, invitations, roles…"
            className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-slate-50 dark:bg-[#0f1d17] py-1.5 pl-9 pr-3 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white dark:focus:bg-[#12221b] focus:outline-none"
          />

          {searchOpen && searchResults && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setSearchOpen(false)} />
              <div className="absolute left-0 right-0 mt-1.5 z-50 rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-2 shadow-xl max-h-96 overflow-y-auto">
                {!hasResults ? (
                  <p className="p-4 text-center text-xs text-slate-400">
                    No matches found for &ldquo;{searchQuery}&rdquo;
                  </p>
                ) : (
                  <div className="space-y-2 text-xs">
                    {searchResults.users.length > 0 && (
                      <div>
                        <p className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400">Users</p>
                        {searchResults.users.map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => {
                              setSearchOpen(false);
                              setSearchQuery('');
                              router.push(`/dashboard/admin/users/${u.id}`);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-[#172b22]"
                          >
                            <Users className="h-3.5 w-3.5 text-emerald-600" />
                            <div className="min-w-0">
                              <p className="font-semibold truncate text-slate-900 dark:text-white">{u.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">
                                {u.email} • {u.role}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {searchResults.departments.length > 0 && (
                      <div>
                        <p className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400">Departments</p>
                        {searchResults.departments.map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => {
                              setSearchOpen(false);
                              setSearchQuery('');
                              router.push(`/dashboard/admin/departments/${d.id}`);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-[#172b22]"
                          >
                            <Building2 className="h-3.5 w-3.5 text-sky-600" />
                            <span className="font-semibold text-slate-900 dark:text-white">{d.name}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {searchResults.invitations.length > 0 && (
                      <div>
                        <p className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400">Invitations</p>
                        {searchResults.invitations.map((inv) => (
                          <button
                            key={inv.id}
                            type="button"
                            onClick={() => {
                              setSearchOpen(false);
                              setSearchQuery('');
                              router.push('/dashboard/admin/invitations');
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-[#172b22]"
                          >
                            <Mail className="h-3.5 w-3.5 text-amber-600" />
                            <span className="truncate text-slate-900 dark:text-white">
                              {inv.email} ({inv.status})
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {searchResults.roles.length > 0 && (
                      <div>
                        <p className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400">Custom Roles</p>
                        {searchResults.roles.map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => {
                              setSearchOpen(false);
                              setSearchQuery('');
                              router.push(`/dashboard/admin/roles/${r.id}`);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-[#172b22]"
                          >
                            <ShieldCheck className="h-3.5 w-3.5 text-violet-600" />
                            <span className="font-semibold text-slate-900 dark:text-white">{r.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="hidden xl:inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#172b22] transition"
          >
            <Globe className="h-3.5 w-3.5 text-emerald-600" />
            <span>Public Site</span>
          </button>

          <NotificationPanel />
          <ThemeToggle />

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold leading-tight text-slate-900 dark:text-slate-100 max-w-[120px] truncate">
                {userName}
              </p>
              <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                {userRole}
              </p>
            </div>

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 font-bold text-xs ring-1 ring-emerald-500/30">
              {userName ? userName.charAt(0).toUpperCase() : 'A'}
            </div>

            <button
              type="button"
              onClick={onLogout}
              title="Log out"
              aria-label="Log out"
              className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
