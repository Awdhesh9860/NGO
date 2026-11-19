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

  const role = currentUser?.role || 'GUEST';
  const canOpenAdminConsole = ADMIN_ACCESS_ROLES.includes(role);

  return (
    <div className="min-h-screen bg-[#f7faf8] dark:bg-[#0c1813] text-[#172b24] dark:text-[#f0f7f4] transition-colors duration-200">
      {/* Sub-header for authenticated workspace */}
      <header className="sticky top-0 z-30 border-b border-[#e3ebe6] dark:border-[#223c32] bg-white/95 dark:bg-[#13231d]/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToPublic}
              className="flex items-center gap-1.5 rounded-xl border border-[#e3ebe6] dark:border-[#223c32] bg-[#f7faf8] dark:bg-[#152721] px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1d332b] transition"
            >
              <Globe className="h-3.5 w-3.5 text-emerald-600" />
              <span>Public Portal</span>
            </button>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
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

          <div className="flex items-center gap-2.5">
            {canOpenAdminConsole && (
              <button
                onClick={() => router.push('/dashboard/admin')}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Admin Console</span>
              </button>
            )}

            <ThemeToggle />

            {currentUser && (
              <div className="hidden sm:flex items-center gap-2 rounded-full bg-slate-100 dark:bg-[#152721] px-3 py-1 text-xs border border-transparent dark:border-[#223c32]">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-medium text-slate-700 dark:text-slate-200">{currentUser.name}</span>
                <span className="rounded bg-slate-200 dark:bg-[#1d332b] px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-600 dark:text-slate-300">
                  {role.replace(/_/g, ' ')}
                </span>
              </div>
            )}

            <button
              onClick={() => onOpenDonate()}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs"
            >
              <Heart className="h-3.5 w-3.5 fill-white" />
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
