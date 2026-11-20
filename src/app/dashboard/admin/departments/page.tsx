'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  adminApiService,
  AdminDepartment,
  AdminUser,
  PageHeader,
  SearchFilterBar,
  StatusBadge,
  EmptyState,
  LoadingSkeleton,
  ConfirmDialog,
  PermissionGate,
} from '@/features/admin';
import {
  Building2,
  PlusCircle,
  Users,
  ArrowUpRight,
  Trash2,
  AlertCircle,
  X,
} from 'lucide-react';

const SUGGESTED_DEPARTMENTS = [
  'Administration',
  'Finance & Accounts',
  'Programs',
  'Project Management',
  'Human Resources',
  'Volunteer Management',
  'Communications',
  'Fundraising',
  'Monitoring & Evaluation',
  'IT & Technology',
];

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AdminDepartmentsPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<AdminDepartment[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Create Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    headUserId: '',
    budget: 0,
    status: 'active' as 'active' | 'inactive',
  });

  // Delete Confirm
  const [deleteTarget, setDeleteTarget] = useState<AdminDepartment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadDepartments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApiService.getDepartments({
        limit: 100,
        search: search || undefined,
        status: statusFilter || undefined,
      });
      if (res.success && res.data) {
        setDepartments(res.data);
      } else {
        setError(res.error?.message || 'Failed to load departments');
      }
    } catch {
      setError('Unable to reach departments API');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const id = setTimeout(() => {
      void loadDepartments();
    }, 0);
    return () => clearTimeout(id);
  }, [loadDepartments]);

  useEffect(() => {
    adminApiService
      .getUsers({ limit: 100 })
      .then((res) => {
        if (res.success && res.data) setUsers(res.data);
      })
      .catch(() => {});
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      setError(null);
      const res = await adminApiService.createDepartment({
        name: form.name,
        slug: form.slug || slugify(form.name),
        description: form.description || undefined,
        headUserId: form.headUserId || null,
        budget: Number(form.budget) || 0,
        status: form.status,
      });

      if (!res.success) {
        setError(res.error?.message || 'Could not create department');
        return;
      }

      setCreateOpen(false);
      setForm({ name: '', slug: '', description: '', headUserId: '', budget: 0, status: 'active' });
      loadDepartments();
    } catch {
      setError('Failed to create department');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const res = await adminApiService.deleteDepartment(deleteTarget.id);
      if (!res.success) {
        setError(res.error?.message || 'Could not delete department');
      } else {
        loadDepartments();
      }
    } catch {
      setError('Error deleting department');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Department Management"
        description="Structure operational departments, designate department heads, track budgets, and organize staff rosters."
        actions={
          <PermissionGate permission="departments.manage">
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#087F5B] px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Create Department</span>
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

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search departments by name or description…"
        filters={[
          {
            id: 'status',
            label: 'All Statuses',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ],
          },
        ]}
        onReset={() => {
          setSearch('');
          setStatusFilter('');
        }}
      />

      {loading ? (
        <LoadingSkeleton variant="cards" rows={4} />
      ) : departments.length === 0 ? (
        <EmptyState
          title="No departments configured"
          description="Create operational units such as Programs, Finance & Accounts, Volunteer Management, or Communications."
          icon={<Building2 className="h-6 w-6" />}
          action={
            <PermissionGate permission="departments.manage">
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="rounded-xl bg-[#087F5B] px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
              >
                Create First Department
              </button>
            </PermissionGate>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{dept.name}</h3>
                    <p className="text-[10px] font-mono text-slate-400">/{dept.slug}</p>
                  </div>
                  <StatusBadge status={dept.status} />
                </div>

                <p className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[32px]">
                  {dept.description || 'No description provided yet.'}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 dark:bg-[#162920] p-3 text-xs">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Members</p>
                    <p className="mt-0.5 font-bold text-slate-900 dark:text-white flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-emerald-600" />
                      {dept.memberCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Budget</p>
                    <p className="mt-0.5 font-bold text-slate-900 dark:text-white">
                      ₹{(dept.budget || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Head:</span>{' '}
                  {dept.headUser ? `${dept.headUser.name}` : 'Unassigned'}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1d332b] flex items-center justify-between">
                <PermissionGate permission="departments.manage">
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(dept)}
                    className="inline-flex items-center gap-1 rounded-lg p-1.5 text-xs text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                    title="Delete department"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </PermissionGate>

                <button
                  type="button"
                  onClick={() => router.push(`/dashboard/admin/departments/${dept.id}`)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                >
                  <span>Manage Roster</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Department Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1d332b] pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create Department</h3>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {SUGGESTED_DEPARTMENTS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, name: preset, slug: slugify(preset) }))}
                  className="rounded-full border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600"
                >
                  + {preset}
                </button>
              ))}
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department Name *
                  </label>
                  <input
                    required
                    minLength={2}
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })
                    }
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Slug *</label>
                  <input
                    required
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2 font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department Head
                  </label>
                  <select
                    value={form.headUserId}
                    onChange={(e) => setForm({ ...form, headUserId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Annual Budget (INR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl bg-[#087F5B] px-4 py-2 font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {creating ? 'Creating…' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="Deleting this department will unassign all current members from it without deleting their user accounts. This action is audit-logged."
        confirmLabel="Delete Department"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
