'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  adminApiService,
  AdminInvitation,
  AdminDepartment,
  USER_ROLES_ARRAY,
  PageHeader,
  SearchFilterBar,
  DataTable,
  DataTableColumn,
  StatusBadge,
  ConfirmDialog,
  PermissionGate,
} from '@/features/admin';
import { useAuth } from '@/context/AuthContext';
import {
  MailPlus,
  RotateCw,
  Ban,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';

export default function AdminInvitationsPage() {
  const { currentUser } = useAuth();
  const [invitations, setInvitations] = useState<AdminInvitation[]>([]);
  const [departments, setDepartments] = useState<AdminDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Send Invitation Modal
  const [inviteOpen, setInviteOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    email: '',
    role: 'TEAM_MEMBER' as (typeof USER_ROLES_ARRAY)[number],
    departmentId: '',
    expiryDays: 7,
  });

  // Revoke Confirm
  const [revokeTarget, setRevokeTarget] = useState<AdminInvitation | null>(null);
  const [processing, setProcessing] = useState(false);

  const loadInvitations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApiService.getInvitations({
        page,
        limit: 20,
        search: search || undefined,
        status: statusFilter || undefined,
        role: roleFilter || undefined,
      });

      if (res.success && res.data) {
        setInvitations(res.data);
        setTotalPages(res.meta?.pagination?.totalPages || 1);
        setTotalCount(res.meta?.pagination?.totalCount || res.data.length);
      } else {
        setError(res.error?.message || 'Failed to load invitations');
      }
    } catch {
      setError('Unable to connect to invitation service');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, roleFilter]);

  useEffect(() => {
    loadInvitations();
  }, [loadInvitations]);

  useEffect(() => {
    adminApiService
      .getDepartments({ limit: 100 })
      .then((res) => {
        if (res.success && res.data) setDepartments(res.data);
      })
      .catch(() => {});
  }, []);

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSending(true);
      setError(null);
      const res = await adminApiService.sendInvitation({
        email: form.email,
        role: form.role,
        departmentId: form.departmentId || null,
        expiryDays: Number(form.expiryDays) || 7,
      });

      if (!res.success) {
        setError(res.error?.message || 'Could not send invitation');
        return;
      }

      setNotice(`Invitation sent securely to ${form.email}.`);
      setInviteOpen(false);
      setForm({ email: '', role: 'TEAM_MEMBER', departmentId: '', expiryDays: 7 });
      loadInvitations();
    } catch {
      setError('Failed to dispatch invitation');
    } finally {
      setSending(false);
    }
  };

  const handleResend = async (inv: AdminInvitation) => {
    setError(null);
    const res = await adminApiService.resendInvitation(inv.id);
    if (!res.success) {
      setError(res.error?.message || 'Could not resend invitation');
    } else {
      setNotice(`Fresh invitation token dispatched to ${inv.email}.`);
      loadInvitations();
    }
  };

  const handleConfirmRevoke = async () => {
    if (!revokeTarget) return;
    try {
      setProcessing(true);
      const res = await adminApiService.revokeInvitation(revokeTarget.id);
      if (!res.success) {
        setError(res.error?.message || 'Could not revoke invitation');
      } else {
        setNotice(`Revoked invitation for ${revokeTarget.email}.`);
        loadInvitations();
      }
    } finally {
      setProcessing(false);
      setRevokeTarget(null);
    }
  };

  const assignableRoles = USER_ROLES_ARRAY.filter(
    (r) => r !== 'SUPER_ADMIN' || currentUser?.role === 'SUPER_ADMIN'
  );

  const columns: DataTableColumn<AdminInvitation>[] = [
    {
      key: 'email',
      header: 'Recipient Email',
      render: (inv) => <span className="font-bold text-slate-900 dark:text-white">{inv.email}</span>,
    },
    {
      key: 'role',
      header: 'Assigned Role',
      render: (inv) => (
        <span className="inline-block rounded-lg bg-slate-100 dark:bg-[#172b22] px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-200">
          {inv.role.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (inv) => (
        <span className="text-slate-600 dark:text-slate-300">{inv.department?.name || '—'}</span>
      ),
    },
    {
      key: 'invitedBy',
      header: 'Invited By',
      render: (inv) => (
        <span className="text-slate-500 dark:text-slate-400">{inv.invitedBy?.name || 'Administrator'}</span>
      ),
    },
    {
      key: 'expiresAt',
      header: 'Expires',
      render: (inv) => (
        <span className="text-slate-500 dark:text-slate-400">
          {new Date(inv.expiresAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (inv) => <StatusBadge status={inv.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (inv) => (
        <div className="inline-flex items-center justify-end gap-1.5">
          {(inv.status === 'pending' || inv.status === 'expired') && (
            <button
              type="button"
              onClick={() => handleResend(inv)}
              title="Resend invitation with new token"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-emerald-500 hover:text-emerald-600 transition"
            >
              <RotateCw className="h-3 w-3" />
              <span>Resend</span>
            </button>
          )}
          {inv.status === 'pending' && (
            <button
              type="button"
              onClick={() => setRevokeTarget(inv)}
              title="Revoke invitation"
              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 dark:border-rose-900/60 px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
            >
              <Ban className="h-3 w-3" />
              <span>Revoke</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invitation Management"
        description="Send token-hashed email invitations to onboard staff, coordinators, and board members."
        actions={
          <PermissionGate permission="users.manage">
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#087F5B] px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs"
            >
              <MailPlus className="h-3.5 w-3.5" />
              <span>Send Invitation</span>
            </button>
          </PermissionGate>
        }
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-800 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {notice}
          </span>
          <button type="button" onClick={() => setNotice(null)}>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <SearchFilterBar
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder="Search invitations by recipient email…"
        filters={[
          {
            id: 'status',
            label: 'All Statuses',
            value: statusFilter,
            onChange: (val) => {
              setStatusFilter(val);
              setPage(1);
            },
            options: [
              { label: 'Pending', value: 'pending' },
              { label: 'Accepted', value: 'accepted' },
              { label: 'Revoked', value: 'revoked' },
              { label: 'Expired', value: 'expired' },
            ],
          },
          {
            id: 'role',
            label: 'All Roles',
            value: roleFilter,
            onChange: (val) => {
              setRoleFilter(val);
              setPage(1);
            },
            options: USER_ROLES_ARRAY.map((r) => ({ label: r.replace(/_/g, ' '), value: r })),
          },
        ]}
        onReset={() => {
          setSearch('');
          setStatusFilter('');
          setRoleFilter('');
          setPage(1);
        }}
      />

      <DataTable
        columns={columns}
        data={invitations}
        rowKey={(i) => i.id}
        loading={loading}
        emptyTitle="No invitations found"
        emptyDescription="Send an invitation to onboard new team members with role and department scoping."
        pagination={{
          page,
          totalPages,
          totalCount,
          pageSize: 20,
          onPageChange: setPage,
        }}
      />

      {/* Send Invitation Modal */}
      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1d332b] pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Invite Organization Member</h3>
              <button
                type="button"
                onClick={() => setInviteOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSendInvitation} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Recipient Email *
                </label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="coordinator@organization.org"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Permitted Role *
                </label>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <select
                    value={form.departmentId}
                    onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">Optional</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expiry (Days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={form.expiryDays}
                    onChange={(e) => setForm({ ...form, expiryDays: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                A 256-bit cryptographically secure token is generated and only its SHA-256 hash is stored in MongoDB.
              </p>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setInviteOpen(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="rounded-xl bg-[#087F5B] px-4 py-2 font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {sending ? 'Dispatching…' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(revokeTarget)}
        title="Revoke Pending Invitation?"
        description={`Revoking the invitation for ${revokeTarget?.email} will invalidate its registration link immediately.`}
        confirmLabel="Revoke Invitation"
        variant="danger"
        loading={processing}
        onConfirm={handleConfirmRevoke}
        onCancel={() => setRevokeTarget(null)}
      />
    </div>
  );
}
