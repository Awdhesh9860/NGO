'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  adminApiService,
  AdminOrganization,
  DashboardHeader,
  DashboardSidebar,
  Breadcrumbs,
  ADMIN_ACCESS_ROLES,
} from '@/features/admin';
import { UserRole } from '@/types';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [org, setOrg] = useState<AdminOrganization | null>(null);

  const role: UserRole = currentUser?.role || 'GUEST';
  const hasAdminPortalAccess = ADMIN_ACCESS_ROLES.includes(role);

  useEffect(() => {
    if (!hasAdminPortalAccess) return;
    adminApiService
      .getOrganization()
      .then((res) => {
        if (res.success && res.data) {
          setOrg(res.data);
        }
      })
      .catch(() => {});
  }, [hasAdminPortalAccess]);

  if (!hasAdminPortalAccess) {
    return (
      <div className="min-h-screen bg-[#f8faf9] dark:bg-[#0c1813] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            Administrative Access Required
          </h2>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {role === 'GUEST'
              ? 'Guests cannot access internal NGO administration dashboards. Please sign in with an authorized organization account.'
              : `Your current role (${role}) does not have administrative console clearance. Access is enforced both here and on every backend API endpoint.`}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => router.push(role === 'GUEST' ? '/login' : '/dashboard')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#087F5B] px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{role === 'GUEST' ? 'Sign In' : 'Return to My Workspace'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf9] dark:bg-[#0c1813] text-slate-800 dark:text-slate-100 flex flex-col overflow-x-hidden transition-colors duration-150">
      <DashboardHeader
        userName={currentUser?.name}
        userRole={role}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onLogout={logout}
      />

      <div className="flex flex-1 min-w-0">
        <DashboardSidebar
          role={role}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          orgName={org?.name}
          orgStatus={org?.status}
          orgVerificationStatus={org?.verificationStatus}
        />

        <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Breadcrumbs />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
