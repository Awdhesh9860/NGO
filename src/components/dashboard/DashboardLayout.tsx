'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { AdminDashboard } from './AdminDashboard';
import { VolunteerPortal } from './VolunteerPortal';
import { DonorPortal } from './DonorPortal';
import { MemberPortal } from './MemberPortal';
import { StaffPortal } from './StaffPortal';
import { ThemeToggle } from '../ui/ThemeToggle';
import { ADMIN_ACCESS_ROLES } from '@/features/admin';
import { NAV_TOKENS, useScrollDirection } from '@/features/navigation';
import { Globe, Heart, ShieldCheck, Lock } from 'lucide-react';

interface DashboardLayoutProps {
  onBackToPublic: () => void;
  onOpenDonate: (campaignId?: string) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  onBackToPublic,
  onOpenDonate,
}) => {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { isHidden, isScrolled } = useScrollDirection();

  const role = currentUser?.role || 'GUEST';
  const canOpenAdminConsole = ADMIN_ACCESS_ROLES.includes(role);

  return (
    <div className="min-h-screen bg-[#f7faf8] dark:bg-[#0c1813] text-[#172b24] dark:text-[#f0f7f4] transition-colors duration-200">
      {/* Auto-hide responsive header for authenticated role workspace */}
      <header
        id="portal-workspace-header"
        data-nav-hidden={isHidden ? 'true' : 'false'}
        className={`sticky top-0 z-30 border-b border-[#e3ebe6] dark:border-[#223c32] bg-white/95 dark:bg-[#10201a]/95 backdrop-blur-md ${NAV_TOKENS.autoHideTransitionClass} ${
          isHidden ? '-translate-y-full pointer-events-none' : 'translate-y-0'
        } ${isScrolled ? 'shadow-sm shadow-slate-900/5' : ''}`}
      >
        <div className={NAV_TOKENS.containerClass}>
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={onBackToPublic}
              className="flex items-center gap-2 shrink-0 text-left cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#087F5B] rounded-xl"
            >
              <span className={NAV_TOKENS.logoMarkClass}>
                <Heart className="h-4 w-4 fill-white" />
              </span>
              <span className="hidden sm:flex flex-col">
                <span className={`${NAV_TOKENS.logoTitleClass} text-slate-900 dark:text-white`}>
                  HopeHorizon
                </span>
                <span className={`${NAV_TOKENS.logoSubtitleClass} text-[#087F5B] dark:text-emerald-400`}>
                  Workspace
                </span>
              </span>
            </button>

            <span className="text-slate-300 dark:text-slate-700 shrink-0">/</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {role === 'GUEST'
                ? 'Sign In Required'
                : role === 'VOLUNTEER'
                ? 'Volunteer Service Hub'
                : role === 'DONOR'
                ? 'Donor Impact Portfolio'
                : role === 'MEMBER'
                ? 'Assembly Member Portal'
                : role === 'PROJECT_MANAGER' ||
                  role === 'COMMUNICATIONS' ||
                  role === 'CONTENT_EDITOR' ||
                  role === 'TEAM_MEMBER'
                ? 'Field Staff Control Center'
                : 'Enterprise Administration Suite'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={onBackToPublic}
              className="hidden md:inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#e3ebe6] dark:border-[#223c32] bg-[#f7faf8] dark:bg-[#152721] px-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1d332b] transition cursor-pointer whitespace-nowrap"
            >
              <Globe className="h-3.5 w-3.5 text-[#087F5B]" />
              <span>Public Site</span>
            </button>

            {canOpenAdminConsole && (
              <button
                type="button"
                onClick={() => router.push('/dashboard/admin')}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 sm:px-3 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition cursor-pointer whitespace-nowrap"
              >
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">Admin Console</span>
              </button>
            )}

            <ThemeToggle />

            {currentUser && (
              <div className="hidden lg:flex h-9 items-center gap-2 rounded-xl bg-slate-100 dark:bg-[#152721] px-3 text-xs border border-transparent dark:border-[#223c32]">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-slate-700 dark:text-slate-200 max-w-[110px] truncate">
                  {currentUser.name}
                </span>
                <span className="rounded bg-slate-200 dark:bg-[#1d332b] px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-600 dark:text-slate-300">
                  {role.replace(/_/g, ' ')}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => onOpenDonate()}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#087F5B] px-3 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs cursor-pointer whitespace-nowrap"
            >
              <Heart className="h-3.5 w-3.5 fill-white shrink-0" />
              <span>Donate</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container rendering appropriate portal based on role */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {role === 'GUEST' && (
          <div className="mx-auto max-w-md rounded-2xl border border-[#e3ebe6] dark:border-[#223c32] bg-white dark:bg-[#13231d] p-8 text-center shadow-xs">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Authentication Required
            </h2>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Guests are public website visitors and do not have access to internal dashboards. Sign in to access your authorized role workspace.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => router.push('/login')}
                className="rounded-xl bg-[#087F5B] px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
              >
                Sign In
              </button>
              <button
                onClick={onBackToPublic}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition"
              >
                Public Website
              </button>
            </div>
          </div>
        )}

        {role === 'VOLUNTEER' && <VolunteerPortal />}
        {role === 'DONOR' && <DonorPortal onOpenDonate={onOpenDonate} />}
        {role === 'MEMBER' && <MemberPortal />}
        {(role === 'PROJECT_MANAGER' ||
          role === 'COMMUNICATIONS' ||
          role === 'CONTENT_EDITOR' ||
          role === 'TEAM_MEMBER') && <StaffPortal />}
        {(role === 'SUPER_ADMIN' ||
          role === 'ADMIN' ||
          role === 'EXECUTIVE_DIRECTOR' ||
          role === 'MANAGER' ||
          role === 'ACCOUNTANT') && <AdminDashboard onOpenDonate={onOpenDonate} />}
      </main>
    </div>
  );
};
