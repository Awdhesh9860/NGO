'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
  Heart,
  ChevronDown,
  LayoutGrid,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { NotificationPanel } from './NotificationPanel';
import { adminApiService, AdminSearchResult } from '../services/admin-api.service';
import { getGroupedAdminNav } from '../config/navigation';
import { NAV_TOKENS, useScrollDirection } from '@/features/navigation';
import { UserRole } from '@/types';

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
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AdminSearchResult | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickJumpOpen, setQuickJumpOpen] = useState(false);
  const quickJumpRef = useRef<HTMLDivElement>(null);

  const groupedNav = getGroupedAdminNav(userRole as UserRole);

  // Auto-hide header smoothly on scroll down, immediately reappear on scroll up.
  // Locked visible whenever sidebar, search results, or quick-jump menu is open.
  const { isHidden, isScrolled } = useScrollDirection({
    lockedVisible: isSidebarOpen || searchOpen || quickJumpOpen,
    resetKey: pathname,
  });

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      const clearTimer = setTimeout(() => setSearchResults(null), 0);
      return () => clearTimeout(clearTimer);
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

  // Outside click & Escape for Quick Modules dropdown
  useEffect(() => {
    if (!quickJumpOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (quickJumpRef.current && !quickJumpRef.current.contains(e.target as Node)) {
        setQuickJumpOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setQuickJumpOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [quickJumpOpen]);

  const hasResults =
    searchResults &&
    (searchResults.users.length > 0 ||
      searchResults.departments.length > 0 ||
      searchResults.invitations.length > 0 ||
      searchResults.roles.length > 0);

  return (
    <header
      id="admin-dashboard-header"
      data-nav-hidden={isHidden ? 'true' : 'false'}
      className={`sticky top-0 z-40 border-b border-[#e2ece6] dark:border-[#1d332b] bg-white/95 dark:bg-[#10201a]/95 backdrop-blur-md ${NAV_TOKENS.autoHideTransitionClass} ${
        isHidden ? '-translate-y-full pointer-events-none' : 'translate-y-0'
      } ${isScrolled ? 'shadow-sm shadow-slate-900/5' : ''}`}
    >
      <div className="flex h-16 items-center justify-between gap-2 sm:gap-3 px-4 sm:px-6">
        {/* Left: Mobile Sidebar Toggle + Consistent Fixed Logo */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-expanded={isSidebarOpen}
            aria-label="Toggle navigation sidebar"
            className={`lg:hidden ${NAV_TOKENS.iconButtonClass} border-slate-200 dark:border-[#1d332b] bg-slate-50 dark:bg-[#152721] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a3026] cursor-pointer`}
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <button
            type="button"
            onClick={() => router.push('/dashboard/admin')}
            className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#087F5B] rounded-xl"
          >
            <span className={NAV_TOKENS.logoMarkClass}>
              <Heart className="h-4 w-4 fill-white" />
            </span>
            <span className="min-w-0 flex flex-col">
              <span className="text-[14px] sm:text-[15px] font-black leading-none text-slate-900 dark:text-white flex items-center gap-1.5 whitespace-nowrap">
                <span>HopeHorizon</span>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 shrink-0">
                  <Lock className="h-2.5 w-2.5" /> Admin
                </span>
              </span>
              <span className="hidden md:block text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-none mt-0.5 truncate">
                Enterprise NGO Console
              </span>
            </span>
          </button>

          {/* Role-Filtered Quick Modules Dropdown (Desktop / Small Laptop) */}
          {groupedNav.length > 0 && (
            <div className="relative hidden md:block ml-1" ref={quickJumpRef}>
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={quickJumpOpen}
                onClick={() => setQuickJumpOpen((prev) => !prev)}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#e2ece6] dark:border-[#1d332b] bg-slate-50 dark:bg-[#152721] px-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1a3026] transition cursor-pointer whitespace-nowrap"
              >
                <LayoutGrid className="h-3.5 w-3.5 text-[#087F5B] dark:text-emerald-400 shrink-0" />
                <span>Modules</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 opacity-60 transition-transform duration-150 ${
                    quickJumpOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {quickJumpOpen && (
                <div
                  role="menu"
                  aria-label="Authorized dashboard modules"
                  className="absolute left-0 top-full mt-2 w-[560px] max-w-[calc(100vw-2rem)] z-50 rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#10201a] p-3.5 shadow-2xl grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[70vh] overflow-y-auto"
                >
                  {groupedNav.map((section) => (
                    <div key={section.group} className="space-y-1">
                      <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {section.group}
                      </p>
                      {section.items.map((item) => {
                        const isActive = item.exact
                          ? pathname === item.href
                          : pathname === item.href || pathname?.startsWith(`${item.href}/`);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setQuickJumpOpen(false);
                              router.push(item.href);
                            }}
                            className={`w-full rounded-lg px-2 py-1.5 text-left text-xs font-semibold transition cursor-pointer truncate ${
                              isActive
                                ? 'bg-emerald-50 text-[#087F5B] dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#172b22]'
                            }`}
                          >
                            {item.name}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center: Global Tenant-Scoped Admin Search */}
        <div className="relative hidden lg:block flex-1 max-w-md mx-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchResults && setSearchOpen(true)}
            placeholder="Search users, departments, invitations, roles…"
            className="h-9 w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-slate-50 dark:bg-[#0f1d17] pl-9 pr-3 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:border-[#087F5B] focus:bg-white dark:focus:bg-[#12221b] focus:outline-none"
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
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#e2ece6] dark:border-[#1d332b] bg-slate-50 dark:bg-[#152721] px-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#087F5B] transition shrink-0 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Portal</span>
          </button>

          <button
            type="button"
            onClick={() => router.push('/')}
            className="hidden xl:inline-flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#172b22] transition cursor-pointer whitespace-nowrap"
          >
            <Globe className="h-3.5 w-3.5 text-[#087F5B]" />
            <span>Public Site</span>
          </button>

          <NotificationPanel />
          <ThemeToggle />

          <div className="flex items-center gap-2 pl-1.5 sm:pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold leading-tight text-slate-900 dark:text-slate-100 max-w-[110px] truncate">
                {userName}
              </p>
              <p className="text-[10px] font-semibold text-[#087F5B] dark:text-emerald-400">
                {userRole.replace(/_/g, ' ')}
              </p>
            </div>

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600/10 text-[#087F5B] dark:bg-emerald-500/20 dark:text-emerald-300 font-bold text-xs ring-1 ring-emerald-500/30">
              {userName ? userName.charAt(0).toUpperCase() : 'A'}
            </div>

            <button
              type="button"
              onClick={onLogout}
              title="Log out"
              aria-label="Log out"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
