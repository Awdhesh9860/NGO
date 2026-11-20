'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronRight,
  Heart,
  LayoutDashboard,
  LogOut,
  Search,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ADMIN_ACCESS_ROLES } from '@/features/admin/config/navigation';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageSelector } from '@/components/navigation/LanguageSelector';
import { DonateButton } from '@/components/navigation/DonateButton';
import {
  PublicPrimaryNavItem,
  isPublicNavItemActive,
} from '../config/public-navigation';
import { NAV_TOKENS } from '../config/tokens';
import { NavigationGroup } from './NavigationGroup';
import { NavigationItem } from './NavigationItem';

export interface MobileNavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: PublicPrimaryNavItem[];
  currentView: string;
  pathname?: string | null;
  onNavigate: (view: string, subId?: string) => void;
  onOpenDonate: () => void;
  onOpenSearch?: () => void;
}

export const MobileNavigationDrawer: React.FC<MobileNavigationDrawerProps> = ({
  isOpen,
  onClose,
  items,
  currentView,
  pathname,
  onNavigate,
  onOpenDonate,
  onOpenSearch,
}) => {
  const { currentUser, openAuthModal, openProfileModal, logout } = useAuth();
  const [openAccordionId, setOpenAccordionId] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Lock background scroll cleanly while mobile drawer is open
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 30);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (view: string, subId?: string) => {
    onNavigate(view, subId);
    onClose();
  };

  const canAccessAdmin = currentUser ? ADMIN_ACCESS_ROLES.includes(currentUser.role) : false;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" data-testid="mobile-nav-drawer">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Drawer"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0e1b16] text-slate-900 dark:text-slate-100 shadow-2xl animate-in slide-in-from-right duration-200 motion-reduce:animate-none"
      >
        {/* Fixed-height Drawer Header */}
        <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-slate-200/80 dark:border-[#1d332b] px-4">
          <button
            type="button"
            onClick={() => handleSelect('home')}
            className="flex items-center gap-2.5 text-left cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#087F5B] rounded-xl"
          >
            <span className={NAV_TOKENS.logoMarkClass}>
              <Heart className="h-4 w-4 fill-white" />
            </span>
            <span>
              <span className="block text-[15px] font-black tracking-tight text-slate-900 dark:text-white leading-none">
                HopeHorizon
              </span>
              <span className="mt-0.5 block text-[10px] font-semibold text-[#087F5B] dark:text-emerald-400 leading-none">
                NGO Ecosystem
              </span>
            </span>
          </button>

          <div className="flex items-center gap-1.5">
            <LanguageSelector isScrolled={true} />
            <ThemeToggle />
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close navigation menu"
              className={`${NAV_TOKENS.iconButtonClass} border-slate-200 dark:border-[#1d332b] bg-slate-50 dark:bg-[#152721] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1d352c] cursor-pointer`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Quick Search Trigger */}
        {onOpenSearch && (
          <div className="px-4 pt-3 pb-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSearch();
              }}
              className="flex w-full min-h-[42px] items-center justify-between rounded-xl border border-slate-200 dark:border-[#1d332b] bg-slate-50 dark:bg-[#12221b] px-3 py-2 text-xs text-slate-500 dark:text-slate-400 hover:border-emerald-400 transition cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span>Search programs, projects, reports...</span>
              </span>
              <span className="rounded bg-white dark:bg-[#192f26] border border-slate-200 dark:border-[#244035] px-1.5 py-0.5 text-[10px] font-mono">
                ⌘K
              </span>
            </button>
          </div>
        )}

        {/* Scrollable Accordion Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {items.map((item) => {
            const active = isPublicNavItemActive(item, currentView, pathname);

            if (item.type === 'link' && item.view) {
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={active ? 'page' : undefined}
                  onClick={() => handleSelect(item.view!)}
                  className={`flex w-full min-h-[44px] items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                    active
                      ? 'border-emerald-300 bg-emerald-50 text-[#087F5B] dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                      : 'border-slate-200/80 bg-white text-slate-800 hover:bg-slate-50 dark:border-[#1d332b] dark:bg-[#12221b] dark:text-slate-100'
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronRight className="h-4 w-4 opacity-50" />
                </button>
              );
            }

            const totalLeaves = (item.groups || []).reduce((acc, g) => acc + g.items.length, 0);
            const isAccordionOpen = openAccordionId === item.id;

            return (
              <NavigationGroup
                key={item.id}
                id={`mobile-${item.id}`}
                title={item.label}
                badgeCount={totalLeaves}
                collapsible
                isOpen={isAccordionOpen}
                isActive={active}
                onToggle={() => setOpenAccordionId(isAccordionOpen ? null : item.id)}
              >
                <div className="space-y-3">
                  {(item.groups || []).map((group) => (
                    <div key={group.id} className="space-y-1">
                      {(item.groups?.length || 0) > 1 && (
                        <p className="px-2.5 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {group.title}
                        </p>
                      )}
                      {group.items.map((leaf) => {
                        const leafActive =
                          currentView === leaf.view ||
                          Boolean(
                            pathname &&
                              leaf.href !== '/' &&
                              (pathname === leaf.href || pathname.startsWith(`${leaf.href}/`))
                          );
                        return (
                          <NavigationItem
                            key={leaf.id}
                            label={leaf.label}
                            description={leaf.description}
                            iconName={leaf.iconName}
                            badge={leaf.badge}
                            highlight={leaf.highlight}
                            isActive={leafActive}
                            variant="drawer"
                            role="button"
                            onClick={() => handleSelect(leaf.view, leaf.subId)}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </NavigationGroup>
            );
          })}
        </div>

        {/* Drawer Footer: Account Access + Primary Donate Action */}
        <div className="shrink-0 space-y-2.5 border-t border-slate-200/80 dark:border-[#1d332b] bg-slate-50/90 dark:bg-[#10201a] p-4">
          {currentUser ? (
            <div className="space-y-1.5 rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-2.5">
              <div className="flex items-center justify-between gap-2 px-1 pb-1.5 border-b border-slate-100 dark:border-[#1d332b]">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] font-semibold uppercase text-[#087F5B] dark:text-emerald-400">
                    {currentUser.role.replace(/_/g, ' ')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    logout();
                  }}
                  aria-label="Sign out"
                  className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleSelect('dashboard')}
                  className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1.5 text-xs font-bold text-[#087F5B] dark:text-emerald-300 cursor-pointer"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span>My Portal</span>
                </button>
                {canAccessAdmin ? (
                  <a
                    href="/dashboard/admin"
                    onClick={onClose}
                    className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-[#1d332b] px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-[#087F5B]" />
                    <span>Admin</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      openProfileModal();
                    }}
                    className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-[#1d332b] px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <User className="h-3.5 w-3.5" />
                    <span>Profile</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                openAuthModal('login');
              }}
              className="flex w-full min-h-[42px] items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#12221b] px-4 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-[#172b22] transition cursor-pointer"
            >
              <User className="h-4 w-4 text-[#087F5B]" />
              <span>Sign In / Member Portal</span>
            </button>
          )}

          <DonateButton
            size="md"
            onClick={() => {
              onClose();
              onOpenDonate();
            }}
            className="w-full min-h-[44px] py-2.5 text-sm shadow-md"
          />
        </div>
      </div>
    </div>
  );
};
