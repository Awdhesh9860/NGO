'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  adminApiService,
  AdminExecutiveStats,
  PageHeader,
  StatCard,
  ActivityTimeline,
  EmptyState,
  PermissionGate,
} from '@/features/admin';
import {
  Users,
  Building2,
  Mail,
  History,
  UserCheck,
  UserX,
  ArrowUpRight,
  PlusCircle,
  RefreshCw,
  Building,
  AlertCircle,
  HeartHandshake,
  BarChart3,
  TrendingUp,
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
      setError('Unable to connect to administration service. Ensure you have an active authenticated session.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const maxMonthlyCount = Math.max(
    1,
    ...(stats?.charts?.monthlyRegistrations?.map((m) => m.count) || [1])
  );
  const maxDeptCount = Math.max(
    1,
    ...(stats?.charts?.departmentDistribution?.map((d) => d.count) || [1])
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Executive Admin Control Center"
        description="Live multi-tenant organization metrics, monthly registration trends, department distribution, and immutable audit stream."
        actions={
          <>
            <button
              type="button"
              onClick={fetchStats}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1a3026] transition disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <PermissionGate permission="users.manage">
              <button
                type="button"
                onClick={() => router.push('/dashboard/admin/invitations')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#087F5B] px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Invite Member</span>
              </button>
            </PermissionGate>
          </>
        }
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats?.userMetrics.total ?? 0}
          subtitle="accounts"
          loading={isLoading}
          accent="emerald"
          icon={<Users className="h-5 w-5" />}
          footer={
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <UserCheck className="h-3.5 w-3.5" /> {stats?.userMetrics.active ?? 0} active
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
                <UserX className="h-3.5 w-3.5" /> {stats?.userMetrics.suspended ?? 0} suspended
              </span>
            </div>
          }
        />

        <StatCard
          title="Departments"
          value={stats?.organizationMetrics.departmentCount ?? 0}
          subtitle="units"
          loading={isLoading}
          accent="sky"
          icon={<Building2 className="h-5 w-5" />}
          footer={`${stats?.organizationMetrics.activeDepartmentCount ?? 0} active operational units`}
        />

        <StatCard
          title="Pending Invitations"
          value={stats?.organizationMetrics.pendingInvitationsCount ?? 0}
          subtitle="pending"
          loading={isLoading}
          accent="amber"
          icon={<Mail className="h-5 w-5" />}
          footer="Token-hashed email invitations"
        />

        <StatCard
          title="Community Roster"
          value={(stats?.organizationMetrics.volunteersCount ?? 0) + (stats?.organizationMetrics.membersCount ?? 0)}
          subtitle="volunteers & members"
          loading={isLoading}
          accent="violet"
          icon={<HeartHandshake className="h-5 w-5" />}
          footer={`${stats?.organizationMetrics.volunteersCount ?? 0} volunteers • ${stats?.organizationMetrics.membersCount ?? 0} members • ${stats?.organizationMetrics.donorsCount ?? 0} donors`}
        />
      </div>

      {/* Real Database Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Registration Trends */}
        <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6 shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                Monthly Registration Trends
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real user registrations over the last 6 months (MongoDB aggregation)
              </p>
            </div>
          </div>

          {stats?.charts.monthlyRegistrations && stats.charts.monthlyRegistrations.length > 0 ? (
            <div className="flex items-end gap-3 h-48 pt-4">
              {stats.charts.monthlyRegistrations.map((point) => {
                const heightPct = Math.max(8, Math.round((point.count / maxMonthlyCount) * 100));
                return (
                  <div key={point.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {point.count}
                    </span>
                    <div
                      className="w-full max-w-[44px] rounded-t-lg bg-[#087F5B] dark:bg-emerald-500 transition-all"
                      style={{ height: `${heightPct}%` }}
                      title={`${point.month}: ${point.count} registration(s)`}
                    />
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 text-center">
                      {point.month}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No registration history yet"
              description="Monthly registration bars will appear automatically as users are created or accept invitations."
            />
          )}
        </div>

        {/* Department Distribution */}
        <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6 shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-sky-600" />
                Department Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Assigned staff and members per organization department
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/dashboard/admin/departments')}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              <span>Manage</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {stats?.charts.departmentDistribution && stats.charts.departmentDistribution.length > 0 ? (
            <div className="space-y-3.5">
              {stats.charts.departmentDistribution.map((dept) => {
                const widthPct = Math.max(6, Math.round((dept.count / maxDeptCount) * 100));
                return (
                  <div key={dept.departmentId} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {dept.name}
                      </span>
                      <span className="font-bold text-slate-600 dark:text-slate-300">
                        {dept.count} member{dept.count === 1 ? '' : 's'}
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-sky-600 dark:bg-sky-400 transition-all"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No department assignments yet"
              description="Create departments and assign staff members to visualize organizational distribution."
              action={
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/admin/departments')}
                  className="rounded-xl bg-[#087F5B] px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
                >
                  Setup Departments
                </button>
              }
            />
          )}
        </div>
      </div>

      {/* Role Distribution & Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6 shadow-xs lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Role Distribution (13-Role RBAC)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Active user count per role • {stats?.organizationMetrics.customRolesCount ?? 0} custom role(s) defined
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/dashboard/admin/roles')}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              <span>RBAC Matrix</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {[
              { role: 'SUPER_ADMIN', label: 'Super Admin', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' },
              { role: 'ADMIN', label: 'Admin', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' },
              { role: 'EXECUTIVE_DIRECTOR', label: 'Exec Director', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' },
              { role: 'MANAGER', label: 'Manager', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' },
              { role: 'PROJECT_MANAGER', label: 'Project Mgr', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
              { role: 'ACCOUNTANT', label: 'Accountant', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300' },
              { role: 'COMMUNICATIONS', label: 'Comms', color: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300' },
              { role: 'CONTENT_EDITOR', label: 'Editor', color: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300' },
              { role: 'TEAM_MEMBER', label: 'Team Member', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' },
              { role: 'VOLUNTEER', label: 'Volunteer', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
              { role: 'DONOR', label: 'Donor', color: 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300' },
              { role: 'MEMBER', label: 'Member', color: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300' },
            ].map((item) => (
              <div
                key={item.role}
                className="rounded-xl border border-slate-100 dark:border-[#1d332b] bg-slate-50/50 dark:bg-[#162720]/50 p-3"
              >
                <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${item.color}`}>
                  {item.label}
                </span>
                <div className="mt-2 text-xl font-black text-slate-900 dark:text-white">
                  {stats?.userMetrics.byRole[item.role] || 0}
                </div>
                <span className="text-[10px] text-slate-400">assigned</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Quick Actions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Direct administrative workflows
            </p>

            <div className="space-y-2.5">
              {[
                {
                  label: 'User Directory',
                  sub: 'Roles, status, sessions & managers',
                  href: '/dashboard/admin/users',
                  icon: Users,
                },
                {
                  label: 'Departments & Rosters',
                  sub: 'Heads, budgets & team members',
                  href: '/dashboard/admin/departments',
                  icon: Building2,
                },
                {
                  label: 'Organization Settings',
                  sub: 'Identity, regional & security policies',
                  href: '/dashboard/admin/organization/settings',
                  icon: Building,
                },
                {
                  label: 'Audit Trail',
                  sub: 'Immutable security event history',
                  href: '/dashboard/admin/audit-logs',
                  icon: History,
                },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.href}
                    type="button"
                    onClick={() => router.push(action.href)}
                    className="w-full flex items-center justify-between rounded-xl border border-slate-200 dark:border-[#1d332b] p-3 text-left hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/60 p-2 text-emerald-700 dark:text-emerald-400 shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{action.label}</p>
                        <p className="text-[10px] text-slate-500 truncate">{action.sub}</p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 shrink-0 transition" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Live Audit Timeline */}
      <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6 shadow-xs">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Recent Administrative Activity
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Latest immutable audit records for this organization
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/dashboard/admin/audit-logs')}
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
          >
            <span>Full Audit Log</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <ActivityTimeline items={stats?.recentActivity || []} />
      </div>
    </div>
  );
}
