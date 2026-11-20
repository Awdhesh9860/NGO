'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  adminApiService,
  AdminUser,
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
  UserPlus,
  Eye,
  Ban,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  X,
} from 'lucide-react';

export default function AdminUsersPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [departments, setDepartments] = useState<AdminDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'TEAM_MEMBER' as (typeof USER_ROLES_ARRAY)[number],
    departmentId: '',
    designation: '',
    phone: '',
  });

  // Suspend Confirm
  const [suspendTarget, setSuspendTarget] = useState<AdminUser | null>(null);
  const [processingAction, setProcessingAction] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApiService.getUsers({
        page,
        limit: 15,
        search: search || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        departmentId: deptFilter || undefined,
        sortBy,
        sortOrder,
      });

      if (res.success && res.data) {
        setUsers(res.data);
        setTotalPages(res.meta?.pagination?.totalPages || 1);
        setTotalCount(res.meta?.pagination?.totalCount || res.data.length);
      } else {
        setError(res.error?.message || 'Failed to load user directory');
      }
    } catch {
      setError('Unable to reach user administration API');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter, deptFilter, sortBy, sortOrder]);

  useEffect(() => {
    const id = setTimeout(() => {
      void loadUsers();
    }, 0);
    return () => clearTimeout(id);
  }, [loadUsers]);

  useEffect(() => {
    adminApiService
      .getDepartments({ limit: 100 })
      .then((res) => {
        if (res.success && res.data) setDepartments(res.data);
      })
      .catch(() => {});
  }, []);

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      setError(null);
      const res = await adminApiService.createUser({
        name: createForm.name,
        email: createForm.email,
        password: createForm.password || undefined,
        role: createForm.role,
        departmentId: createForm.departmentId || null,
        designation: createForm.designation || null,
        phone: createForm.phone || null,
        status: 'active',
      });

      if (!res.success) {
        setError(res.error?.message || 'Could not create user');
        return;
      }

      setNotice(`User "${createForm.name}" created successfully.`);
      setIsCreateOpen(false);
      setCreateForm({
        name: '',
        email: '',
        password: '',
        role: 'TEAM_MEMBER',
        departmentId: '',
        designation: '',
        phone: '',
      });
      loadUsers();
    } catch {
      setError('Failed to create user account');
    } finally {
      setCreating(false);
    }
  };

  const handleConfirmSuspend = async () => {
    if (!suspendTarget) return;
    try {
      setProcessingAction(true);
      setError(null);
      const res =
        suspendTarget.status === 'active'
          ? await adminApiService.deactivateUser(suspendTarget.id)
          : await adminApiService.updateUser(suspendTarget.id, { status: 'active' });

      if (!res.success) {
        setError(res.error?.message || 'Action could not be completed');
      } else {
        setNotice(
          suspendTarget.status === 'active'
            ? `Suspended ${suspendTarget.name} and revoked active sessions.`
            : `Re-activated ${suspendTarget.name}.`
        );
        loadUsers();
      }
    } catch {
      setError('Error updating user status');
    } finally {
      setProcessingAction(false);
      setSuspendTarget(null);
    }
  };

  const assignableRoles = USER_ROLES_ARRAY.filter(
    (r) => r !== 'SUPER_ADMIN' || currentUser?.role === 'SUPER_ADMIN'
  );

  const columns: DataTableColumn<AdminUser>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 font-bold text-xs">
            {u.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 dark:text-white truncate">{u.name}</p>
            {u.designation && <p className="text-[10px] text-slate-400 truncate">{u.designation}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      render: (u) => <span className="text-slate-600 dark:text-slate-300">{u.email}</span>,
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (u) => (
        <span className="inline-block rounded-lg bg-slate-100 dark:bg-[#172b22] px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-200">
          {u.role.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (u) => {
        const deptName =
          typeof u.departmentId === 'object' && u.departmentId ? u.departmentId.name : '—';
        return <span className="text-slate-600 dark:text-slate-300">{deptName}</span>;
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (u) => <StatusBadge status={u.status} />,
    },
    {
      key: 'lastLoginAt',
      header: 'Last Active',
      sortable: true,
      render: (u) => (
        <span className="text-slate-500 dark:text-slate-400">
          {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (u) => (
        <span className="text-slate-500 dark:text-slate-400">
          {new Date(u.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (u) => (
        <div className="inline-flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => router.push(`/dashboard/admin/users/${u.id}`)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-emerald-500 hover:text-emerald-600 transition"
          >
            <Eye className="h-3 w-3" />
            <span>Manage</span>
          </button>

          <PermissionGate permission="users.manage">
            <button
              type="button"
              onClick={() => setSuspendTarget(u)}
              title={u.status === 'active' ? 'Suspend User' : 'Activate User'}
              className={`rounded-lg p-1.5 transition ${
                u.status === 'active'
                  ? 'text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40'
                  : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              {u.status === 'active' ? <Ban className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            </button>
          </PermissionGate>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage organization accounts, role assignments, departments, managers, and account statuses."
        actions={
          <>
            <button
              type="button"
              onClick={loadUsers}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <PermissionGate permission="users.manage">
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#087F5B] px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Add User</span>
              </button>
            </PermissionGate>
          </>
        }
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300 flex items-center justify-between gap-2">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss">
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
        searchPlaceholder="Search by name, email, phone, or designation…"
        filters={[
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
          {
            id: 'status',
            label: 'All Statuses',
            value: statusFilter,
            onChange: (val) => {
              setStatusFilter(val);
              setPage(1);
            },
            options: [
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
              { label: 'Suspended', value: 'suspended' },
            ],
          },
          {
            id: 'department',
            label: 'All Departments',
            value: deptFilter,
            onChange: (val) => {
              setDeptFilter(val);
              setPage(1);
            },
            options: departments.map((d) => ({ label: d.name, value: d.id })),
          },
        ]}
        onReset={() => {
          setSearch('');
          setRoleFilter('');
          setStatusFilter('');
          setDeptFilter('');
          setPage(1);
        }}
      />

      <DataTable
        columns={columns}
        data={users}
        rowKey={(u) => u.id}
        loading={loading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        emptyTitle="No users match your filters"
        emptyDescription="Create a user account or invite new staff members via email."
        pagination={{
          page,
          totalPages,
          totalCount,
          pageSize: 15,
          onPageChange: setPage,
        }}
      />

      {/* Create User Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#1d332b]">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create Organization User</h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                  <input
                    required
                    minLength={2}
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                  <input
                    required
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Role *</label>
                  <select
                    value={createForm.role}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        role: e.target.value as (typeof USER_ROLES_ARRAY)[number],
                      })
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
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <select
                    value={createForm.departmentId}
                    onChange={(e) => setCreateForm({ ...createForm, departmentId: e.target.value })}
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
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Designation</label>
                  <input
                    type="text"
                    value={createForm.designation}
                    onChange={(e) => setCreateForm({ ...createForm, designation: e.target.value })}
                    placeholder="e.g. Program Coordinator"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Initial Password (optional — auto-generated if left blank)
                </label>
                <input
                  type="password"
                  minLength={8}
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="Minimum 8 characters"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl bg-[#087F5B] px-4 py-2 font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {creating ? 'Creating…' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(suspendTarget)}
        title={suspendTarget?.status === 'active' ? 'Suspend User Account?' : 'Activate User Account?'}
        description={
          suspendTarget?.status === 'active'
            ? `Suspending ${suspendTarget.name} (${suspendTarget.email}) will immediately terminate all active sessions and block sign-in. The last active organization administrator is protected from suspension.`
            : `Re-activating ${suspendTarget?.name} will restore their access according to their assigned role.`
        }
        confirmLabel={suspendTarget?.status === 'active' ? 'Suspend Account' : 'Activate Account'}
        variant={suspendTarget?.status === 'active' ? 'danger' : 'default'}
        loading={processingAction}
        onConfirm={handleConfirmSuspend}
        onCancel={() => setSuspendTarget(null)}
      />
    </div>
  );
}
