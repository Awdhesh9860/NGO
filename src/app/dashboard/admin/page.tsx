'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApiService, AdminExecutiveStats } from '@/features/admin';
import {
  Users,
  Building2,
  Mail,
  ShieldCheck,
  UserCheck,
  UserX,
  History,
  ArrowUpRight,
  PlusCircle,
  RefreshCw,
  Building,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function AdminOverviewPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminExecutiveStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await adminApiService.getExecutiveStats();
      if (res.success && res.data) {
        setStats(res.data);
      } else {
        setError(res.error?.message || 'Failed to load executive statistics');
      }
    } catch {
      setError('Unable to connect to administration service');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Executive Admin Control Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time multi-tenant organizational metrics, role-based controls, and security audit status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#14261e] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1b3127] transition disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => router.push('/dashboard/admin/invitations')}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Invite User</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Users
            </span>
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 p-2 text-emerald-600 dark:text-emerald-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {isLoading ? '...' : stats?.userMetrics.total ?? 0}
            </span>
            <span className="text-xs font-medium text-slate-500">accounts</span>
          </div>
          <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <UserCheck className="h-3.5 w-3.5" /> {stats?.userMetrics.active ?? 0} active
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 text-rose-600 font-semibold">
              <UserX className="h-3.5 w-3.5" /> {stats?.userMetrics.suspended ?? 0} suspended
            </span>
          </div>
        </div>

        {/* Departments */}
        <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Departments
            </span>
            <div className="rounded-xl bg-sky-50 dark:bg-sky-950/60 p-2 text-sky-600 dark:text-sky-400">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {isLoading ? '...' : stats?.organizationMetrics.departmentCount ?? 0}
            </span>
            <span className="text-xs font-medium text-slate-500">operational units</span>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Program, Finance, Field Ops & Communications
          </p>
        </div>

        {/* Pending Invitations */}
        <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pending Invites
            </span>
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/60 p-2 text-amber-600 dark:text-amber-400">
              <Mail className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {isLoading ? '...' : stats?.organizationMetrics.pendingInvitationsCount ?? 0}
            </span>
            <span className="text-xs font-medium text-slate-500">awaiting acceptance</span>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Secure token dispatch via Nodemailer
          </p>
        </div>

        {/* Security & Audit Logs */}
        <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Audit Stream
            </span>
            <div className="rounded-xl bg-violet-50 dark:bg-violet-950/60 p-2 text-violet-600 dark:text-violet-400">
              <History className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {isLoading ? '...' : stats?.organizationMetrics.recentAuditCount ?? 0}
            </span>
            <span className="text-xs font-medium text-slate-500">recent events</span>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Immutable tenant action trail
          </p>
        </div>
      </div>

      {/* Role Distribution & Quick Actions Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Role Distribution Card */}
        <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Role & Permissions Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                13-Role RBAC hierarchy distribution across the organization
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard/admin/roles')}
              className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              <span>View RBAC Matrix</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {[
              { role: 'SUPER_ADMIN', label: 'Super Admin', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' },
              { role: 'ADMIN', label: 'Admin', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' },
              { role: 'EXECUTIVE_DIRECTOR', label: 'Director', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' },
              { role: 'MANAGER', label: 'Manager', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' },
              { role: 'PROJECT_MANAGER', label: 'Project Lead', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
              { role: 'ACCOUNTANT', label: 'Accountant', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300' },
              { role: 'COMMUNICATIONS', label: 'Comms', color: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300' },
              { role: 'CONTENT_EDITOR', label: 'Editor', color: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300' },
              { role: 'TEAM_MEMBER', label: 'Staff Member', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' },
              { role: 'VOLUNTEER', label: 'Volunteer', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
              { role: 'DONOR', label: 'Donor', color: 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300' },
              { role: 'MEMBER', label: 'Member', color: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300' },
            ].map((item) => {
              const count = stats?.userMetrics.byRole[item.role] || 0;
              return (
                <div
                  key={item.role}
                  className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#162720]/50 p-3"
                >
                  <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${item.color}`}>
                    {item.label}
                  </span>
                  <div className="mt-2 text-xl font-black text-slate-900 dark:text-white">
                    {count}
                  </div>
                  <span className="text-[10px] text-slate-400">assigned</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Admin Actions */}
        <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Admin Quick Launch
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Frequently accessed administrative workflows
            </p>

            <div className="space-y-2">
              <button
                onClick={() => router.push('/dashboard/admin/users')}
                className="w-full flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-3 text-left hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/60 p-2 text-emerald-600">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Manage Users</p>
                    <p className="text-[10px] text-slate-500">Edit roles, status & deactivation</p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition" />
              </button>

              <button
                onClick={() => router.push('/dashboard/admin/departments')}
                className="w-full flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-3 text-left hover:border-sky-500 hover:bg-sky-50/30 dark:hover:bg-sky-950/20 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-sky-50 dark:bg-sky-950/60 p-2 text-sky-600">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Department Setup</p>
                    <p className="text-[10px] text-slate-500">Assign heads & budgets</p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-sky-600 transition" />
              </button>

              <button
                onClick={() => router.push('/dashboard/admin/organization')}
                className="w-full flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-3 text-left hover:border-amber-500 hover:bg-amber-50/30 dark:hover:bg-amber-950/20 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-50 dark:bg-amber-950/60 p-2 text-amber-600">
                    <Building className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Statutory & 80G</p>
                    <p className="text-[10px] text-slate-500">PAN, 12A, FCRA & Darpan</p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-amber-600 transition" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              <span>Security Baseline: Enforced</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Security & Activity Audit Log */}
      <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Recent Organizational Activity
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live audit stream of administrative actions in HopeHorizon
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/admin/audit-logs')}
            className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
          >
            <span>View Full Audit Trail</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {stats.recentActivity.map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg bg-slate-100 dark:bg-[#172b22] p-1.5 text-slate-600 dark:text-slate-300">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {log.actorName}{' '}
                      <span className="font-normal text-slate-500">({log.actorRole})</span>
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">{log.details || log.action}</p>
                    <p className="text-[10px] text-slate-400">
                      IP: {log.ipAddress || '127.0.0.1'} &bull; Resource: {log.resource}
                    </p>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No administrative events recorded yet. New actions will stream here live.
          </div>
        )}
      </div>
    </div>
  );
}
