'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  Search,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ADMIN_ACCESS_ROLES } from '@/features/admin/config/navigation';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageSelector } from '@/components/navigation/LanguageSelector';
import { DonateButton } from '@/components/navigation/DonateButton';
import { PUBLIC_NAVIGATION_ITEMS } from '../config/public-navigation';
import { NAV_TOKENS } from '../config/tokens';
import { useScrollDirection } from '../hooks/useScrollDirection';
import { useResponsiveNavigation } from '../hooks/useResponsiveNavigation';
import { PrimaryNavigation } from './PrimaryNavigation';
import { MobileNavigation } from './MobileNavigation';

export interface MainNavigationProps {
  currentView: string;
  onNavigate: (view: string, id?: string) => void;
  onOpenDonate: (campaignId?: string) => void;
  onOpenSearch?: () => void;
  onSearchClick?: () => void;
  mobileMenuOpen?: boolean;
  onMobileMenuToggle?: (open: boolean) => void;
}

export const MainNavigation: React.FC<MainNavigationProps> = ({
  currentView,
  onNavigate,
  onOpenDonate,
  onOpenSearch,
  onSearchClick,
  mobileMenuOpen,
  onMobileMenuToggle,
}) => {
  const pathname = usePathname();
  const { currentUser, openAuthModal, openProfileModal, logout } = useAuth();
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isMenuOpen = mobileMenuOpen !== undefined ? mobileMenuOpen : internalMobileOpen;
  const setMenuOpen = (open: boolean) => {
    if (onMobileMenuToggle) onMobileMenuToggle(open);
    else setInternalMobileOpen(open);
  };

  const triggerSearch = onOpenSearch || onSearchClick;

  // Smart scroll auto-hide: hides on scroll down, immediately reappears on scroll up.
  // Stays locked visible whenever any dropdown or mobile drawer is open.
  const { isHidden, isScrolled } = useScrollDirection({
    lockedVisible: isMenuOpen || activeDropdownId !== null || userMenuOpen,
    resetKey: pathname,
  });

  // Intelligent viewport-responsive navigation partitioning (Mobile / Tablet / Small Laptop / Desktop)
  const { tier, visibleItems, overflowItems } = useResponsiveNavigation(PUBLIC_NAVIGATION_ITEMS);

  // Close open dropdowns cleanly on route change
  useEffect(() => {
    const raf = window.requestAnimationFrame(() => {
      setActiveDropdownId(null);
      setUserMenuOpen(false);
    });
    return () => window.cancelAnimationFrame(raf);
  }, [pathname]);

  // Outside-click & Escape close for user menu
  useEffect(() => {
    if (!userMenuOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [userMenuOpen]);

  // Cmd/Ctrl+K global search shortcut
  useEffect(() => {
    if (!triggerSearch) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        triggerSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerSearch]);

  const canAccessAdmin = currentUser ? ADMIN_ACCESS_ROLES.includes(currentUser.role) : false;

  return (
    <header
      id="main-app-header"
      data-nav-hidden={isHidden ? 'true' : 'false'}
      data-nav-tier={tier}
      className={`sticky top-0 z-40 w-full border-b ${NAV_TOKENS.autoHideTransitionClass} ${
        isHidden ? '-translate-y-full pointer-events-none' : 'translate-y-0'
      } ${
        isScrolled
          ? 'border-slate-200/90 dark:border-[#1d332b] bg-white/95 dark:bg-[#0e1b16]/95 shadow-md shadow-slate-900/5 dark:shadow-black/30 backdrop-blur-xl'
          : 'border-slate-200/70 dark:border-[#1d332b]/80 bg-white/90 dark:bg-[#0e1b16]/90 backdrop-blur-md'
      }`}
    >
      <div className={NAV_TOKENS.containerClass}>
        {/* Left: Fixed-Dimension Brand Logo */}
        <button
          type="button"
          id="header-brand-logo"
          onClick={() => {
            onNavigate('home');
            setMenuOpen(false);
            setActiveDropdownId(null);
            setUserMenuOpen(false);
          }}
          className="flex items-center gap-2.5 shrink-0 text-left group cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#087F5B] rounded-xl"
        >
          <span className={NAV_TOKENS.logoMarkClass}>
            <Heart className="h-4 w-4 fill-white" />
          </span>
          <span className="flex flex-col">
            <span className={`${NAV_TOKENS.logoTitleClass} text-slate-900 dark:text-white group-hover:text-[#087F5B] dark:group-hover:text-emerald-300 transition-colors`}>
              HopeHorizon
            </span>
            <span className={`${NAV_TOKENS.logoSubtitleClass} text-slate-500 dark:text-emerald-400/90`}>
              NGO Ecosystem
            </span>
          </span>
        </button>

        {/* Center: Smart Primary Navigation + Overflow `More` Dropdown */}
        <PrimaryNavigation
          visibleItems={visibleItems}
          overflowItems={overflowItems}
          showOverflowDropdown={tier === 'small-laptop'}
          currentView={currentView}
          pathname={pathname}
          activeDropdownId={activeDropdownId}
          setActiveDropdownId={setActiveDropdownId}
          onNavigate={onNavigate}
        />

        {/* Right: Consistent Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {triggerSearch && (
            <button
              type="button"
              onClick={triggerSearch}
              aria-label="Open Search (⌘K)"
              title="Search programs, projects, reports (⌘K)"
              className={`hidden sm:inline-flex ${NAV_TOKENS.iconButtonClass} border-slate-200 dark:border-[#1d332b] bg-slate-50 dark:bg-[#152721] text-slate-600 dark:text-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-[#1d352c] dark:hover:text-white cursor-pointer`}
            >
              <Search className={NAV_TOKENS.iconSizeClass} />
            </button>
          )}

          <div className="hidden xl:flex items-center gap-1.5">
            <LanguageSelector isScrolled={true} />
          </div>

          <div className="hidden sm:flex items-center">
            <ThemeToggle />
          </div>

          {/* Authenticated User Dropdown or Sign In */}
          {currentUser ? (
            <div className="relative hidden md:block" ref={userMenuRef}>
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 dark:border-[#1d332b] bg-slate-50 dark:bg-[#152721] px-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#1d352c] transition cursor-pointer"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#087F5B] text-[10px] font-bold text-white">
                  {currentUser.name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden xl:inline max-w-[84px] truncate">
                  {currentUser.name.split(' ')[0]}
                </span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60 shrink-0" />
              </button>

              {userMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#10201a] p-1.5 shadow-2xl z-50"
                >
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-[#1d332b]">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] font-semibold uppercase text-[#087F5B] dark:text-emerald-400">
                      {currentUser.role.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setUserMenuOpen(false);
                      onNavigate('dashboard');
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#172b22] cursor-pointer"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5 text-[#087F5B]" />
                    <span>My Portal Dashboard</span>
                  </button>
                  {canAccessAdmin && (
                    <a
                      href="/dashboard/admin"
                      role="menuitem"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#172b22]"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-[#087F5B]" />
                      <span>Admin Console</span>
                    </a>
                  )}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setUserMenuOpen(false);
                      openProfileModal();
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#172b22] cursor-pointer"
                  >
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span>Profile & Settings</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="mt-1 flex w-full items-center gap-2 rounded-xl border-t border-slate-100 dark:border-[#1d332b] px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="hidden md:inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 dark:border-[#1d332b] bg-slate-50 dark:bg-[#152721] px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-[#1d352c] transition whitespace-nowrap cursor-pointer"
            >
              <User className="h-3.5 w-3.5 shrink-0" />
              <span>Sign In</span>
            </button>
          )}

          {/* Primary Donate CTA */}
          <DonateButton
            size="sm"
            isScrolled={isScrolled}
            onClick={() => onOpenDonate()}
            className="hidden xs:inline-flex sm:inline-flex h-9 rounded-xl px-3.5"
          />

          {/* Mobile & Tablet Drawer Trigger */}
          <MobileNavigation
            isOpen={isMenuOpen}
            onOpen={() => setMenuOpen(true)}
            onClose={() => setMenuOpen(false)}
            items={PUBLIC_NAVIGATION_ITEMS}
            currentView={currentView}
            pathname={pathname}
            onNavigate={onNavigate}
            onOpenDonate={() => onOpenDonate()}
            onOpenSearch={triggerSearch}
          />
        </div>
      </div>
    </header>
  );
};
