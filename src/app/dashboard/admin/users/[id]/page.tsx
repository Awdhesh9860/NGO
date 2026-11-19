'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  adminApiService,
  AdminUser,
  AdminDepartment,
  AdminUserSession,
  AdminRoleSummary,
  USER_ROLES_ARRAY,
  PageHeader,
  StatusBadge,
  ActivityTimeline,
  LoadingSkeleton,
  ConfirmDialog,
  PermissionGate,
} from '@/features/admin';
import { useAuth } from '@/context/AuthContext';
import {
  ArrowLeft,
  Save,
  Monitor,
  Trash2,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser } = useAuth();
  const userId = params.id as string;

  const [user, setUser] = useState<AdminUser | null>(null);
  const [departments, setDepartments] = useState<AdminDepartment[]>([]);
  const [managers, setManagers] = useState<AdminUser[]>([]);
  const [customRoles, setCustomRoles] = useState<AdminRoleSummary[]>([]);
  const [sessions, setSessions] = useState<AdminUserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [revokeAllConfirm, setRevokeAllConfirm] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    designation: '',
    role: 'TEAM_MEMBER' as (typeof USER_ROLES_ARRAY)[number],
    customRoleId: '',
    departmentId: '',
    managerId: '',
    status: 'active' as 'active' | 'inactive' | 'suspended',
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [userRes, deptsRes, usersRes, rolesRes, sessionsRes] = await Promise.all([
        adminApiService.getUserById(userId),
        adminApiService.getDepartments({ limit: 100 }),
        adminApiService.getUsers({ limit: 100 }),
        adminApiService.getRoles(),
        adminApiService.getUserSessions(userId).catch(() => ({ success: false, data: [] })),
      ]);

      if (!userRes.success || !userRes.data) {
        setError(userRes.error?.message || 'User not found');
        return;
      }

      const u = userRes.data;
      setUser(u);
      setForm({
        name: u.name,
        phone: u.phone || '',
        designation: u.designation || '',
        role: (USER_ROLES_ARRAY.includes(u.role as (typeof USER_ROLES_ARRAY)[number])
          ? u.role
          : 'TEAM_MEMBER') as (typeof USER_ROLES_ARRAY)[number],
        customRoleId: typeof u.customRoleId === 'object' && u.customRoleId ? u.customRoleId._id : (u.customRoleId || ''),
        departmentId: typeof u.departmentId === 'object' && u.departmentId ? u.departmentId._id : (u.departmentId || ''),
        managerId: typeof u.managerId === 'object' && u.managerId ? u.managerId._id : (u.managerId || ''),
        status: u.status,
      });

      if (deptsRes.success && deptsRes.data) setDepartments(deptsRes.data);
      if (usersRes.success && usersRes.data) setManagers(usersRes.data.filter((m) => m.id !== userId));
      if (rolesRes.success && rolesRes.data) setCustomRoles(rolesRes.data.customRoles);
      if (sessionsRes.success && sessionsRes.data) setSessions(sessionsRes.data);
    } catch {
      setError('Failed to load user profile details');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const res = await adminApiService.updateUser(userId, {
        name: form.name,
        phone: form.phone || null,
        designation: form.designation || null,
        role: form.role,
        customRoleId: form.customRoleId || null,
        departmentId: form.departmentId || null,
        managerId: form.managerId || null,
        status: form.status,
      });

      if (!res.success) {
        setError(res.error?.message || 'Could not update user profile');
        return;
      }

      setSuccess('User profile and authorization settings updated.');
      loadData();
    } catch {
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    const res = await adminApiService.revokeUserSession(userId, { sessionId });
    if (res.success) {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      setSuccess('Session terminated successfully.');
    } else {
      setError(res.error?.message || 'Could not terminate session');
    }
  };

  const handleRevokeAllSessions = async () => {
    const res = await adminApiService.revokeUserSession(userId, { all: true });
    setRevokeAllConfirm(false);
    if (res.success) {
      setSessions([]);
      setSuccess(`Terminated ${res.data?.revokedCount || 0} active session(s).`);
    } else {
      setError(res.error?.message || 'Could not revoke sessions');
    }
  };

  if (loading) return <LoadingSkeleton variant="form" rows={6} />;

  if (!user) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-xs text-rose-700">
        {error || 'User not found'}
      </div>
    );
  }

  const assignableRoles = USER_ROLES_ARRAY.filter(
    (r) => r !== 'SUPER_ADMIN' || currentUser?.role === 'SUPER_ADMIN'
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={user.name}
        description={`${user.email} • Joined ${new Date(user.createdAt).toLocaleDateString()}`}
        badge={<StatusBadge status={user.status} />}
        actions={
          <button
            type="button"
            onClick={() => router.push('/dashboard/admin/users')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Users</span>
          </button>
        }
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Editable Profile & Access Form */}
        <form
          onSubmit={handleSave}
          className="lg:col-span-2 rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6 space-y-5 text-xs shadow-xs"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1d332b] pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Profile, Role & Organization Assignment
              </h3>
              <p className="text-[11px] text-slate-500">
                Changes are audit-logged and trigger notifications for role or status transitions.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-[#172b22] px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              2FA: {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input
                required
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Designation</label>
              <input
                type="text"
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Account Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as 'active' | 'inactive' | 'suspended' })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2 focus:border-emerald-500 focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Primary System Role</label>
              <select
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value as (typeof USER_ROLES_ARRAY)[number] })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2 focus:border-emerald-500 focus:outline-none"
              >
                {assignableRoles.map((r) => (
                  <option key={r} value={r}>
                    {r.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Custom Organization Role (optional)
              </label>
              <select
                value={form.customRoleId}
                onChange={(e) => setForm({ ...form, customRoleId: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2 focus:border-emerald-500 focus:outline-none"
              >
                <option value="">None</option>
                {customRoles
                  .filter((r) => r.status === 'active')
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.key})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
              <select
                value={form.departmentId}
                onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2 focus:border-emerald-500 focus:outline-none"
              >
                <option value="">Unassigned</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Reporting Manager</label>
              <select
                value={form.managerId}
                onChange={(e) => setForm({ ...form, managerId: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2 focus:border-emerald-500 focus:outline-none"
              >
                <option value="">None</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <PermissionGate permission="users.manage">
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#087F5B] px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{saving ? 'Saving…' : 'Save Changes'}</span>
              </button>
            </div>
          </PermissionGate>
        </form>

        {/* Active Sessions Panel */}
        <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Sessions</h3>
              <p className="text-[11px] text-slate-500">{sessions.length} live session(s)</p>
            </div>
            <PermissionGate permission="users.manage">
              {sessions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setRevokeAllConfirm(true)}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-700"
                >
                  Revoke All
                </button>
              )}
            </PermissionGate>
          </div>

          {sessions.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-4 text-center text-xs text-slate-400">
              No active sessions currently recorded for this account.
            </p>
          ) : (
            <div className="space-y-2.5">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-start justify-between gap-2 rounded-xl border border-slate-100 dark:border-[#1d332b] bg-slate-50/70 dark:bg-[#162920]/60 p-3 text-xs"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <Monitor className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{s.device}</p>
                      <p className="text-[10px] text-slate-500 truncate">{s.browser}</p>
                      <p className="text-[10px] text-slate-400">
                        IP: {s.ipAddress} • Active {new Date(s.lastActiveAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <PermissionGate permission="users.manage">
                    <button
                      type="button"
                      onClick={() => handleRevokeSession(s.id)}
                      title="Revoke session"
                      className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </PermissionGate>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User Activity Timeline */}
      <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">User Activity History</h3>
        <ActivityTimeline
          items={user.activity || []}
          emptyTitle="No recorded actions yet"
          emptyDescription="Actions performed by this user will appear here."
        />
      </div>

      <ConfirmDialog
        open={revokeAllConfirm}
        title="Revoke All Active Sessions?"
        description={`This will immediately sign out ${user.name} from all active devices and browsers.`}
        confirmLabel="Revoke All Sessions"
        variant="danger"
        onConfirm={handleRevokeAllSessions}
        onCancel={() => setRevokeAllConfirm(false)}
      />
    </div>
  );
}
