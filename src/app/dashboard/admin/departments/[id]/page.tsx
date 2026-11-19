'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  adminApiService,
  AdminDepartment,
  AdminUser,
  PageHeader,
  StatusBadge,
  LoadingSkeleton,
  ActivityTimeline,
  EmptyState,
  PermissionGate,
} from '@/features/admin';
import {
  ArrowLeft,
  Save,
  UserPlus,
  UserMinus,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function AdminDepartmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const deptId = params.id as string;

  const [dept, setDept] = useState<AdminDepartment | null>(null);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    headUserId: '',
    budget: 0,
    status: 'active' as 'active' | 'inactive',
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [deptRes, usersRes] = await Promise.all([
        adminApiService.getDepartmentById(deptId),
        adminApiService.getUsers({ limit: 100 }),
      ]);

      if (!deptRes.success || !deptRes.data) {
        setError(deptRes.error?.message || 'Department not found');
        return;
      }

      const d = deptRes.data;
      setDept(d);
      setForm({
        name: d.name,
        description: d.description || '',
        headUserId: d.headUser?._id || '',
        budget: d.budget || 0,
        status: d.status,
      });

      if (usersRes.success && usersRes.data) setAllUsers(usersRes.data);
    } catch {
      setError('Failed to load department details');
    } finally {
      setLoading(false);
    }
  }, [deptId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const res = await adminApiService.updateDepartment(deptId, {
        name: form.name,
        description: form.description || null,
        headUserId: form.headUserId || null,
        budget: Number(form.budget) || 0,
        status: form.status,
      });
      if (!res.success) {
        setError(res.error?.message || 'Could not update department');
        return;
      }
      setSuccess('Department updated successfully.');
      loadData();
    } catch {
      setError('Failed to save department');
    } finally {
      setSaving(false);
    }
  };

  const handleAssignMember = async () => {
    if (!selectedUserId) return;
    setError(null);
    const res = await adminApiService.assignDepartmentMember(deptId, selectedUserId);
    if (!res.success) {
      setError(res.error?.message || 'Could not assign member');
    } else {
      setSelectedUserId('');
      setSuccess('Member assigned to department.');
      loadData();
    }
  };

  const handleRemoveMember = async (userId: string) => {
    setError(null);
    const res = await adminApiService.removeDepartmentMember(deptId, userId);
    if (!res.success) {
      setError(res.error?.message || 'Could not remove member');
    } else {
      setSuccess('Member removed from department.');
      loadData();
    }
  };

  if (loading) return <LoadingSkeleton variant="form" rows={5} />;

  if (!dept) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-xs text-rose-700">
        {error || 'Department not found'}
      </div>
    );
  }

  const currentMemberIds = new Set((dept.members || []).map((m) => m.id));
  const unassignedCandidates = allUsers.filter((u) => !currentMemberIds.has(u.id));

  return (
    <div className="space-y-6">
      <PageHeader
        title={dept.name}
        description={`Slug: /${dept.slug} • ${dept.memberCount} assigned member(s)`}
        badge={<StatusBadge status={dept.status} />}
        actions={
          <button
            type="button"
            onClick={() => router.push('/dashboard/admin/departments')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Departments</span>
          </button>
        }
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Edit Department Details */}
        <form
          onSubmit={handleSave}
          className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6 space-y-4 text-xs shadow-xs"
        >
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Department Settings</h3>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Name</label>
            <input
              required
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Department Head</label>
            <select
              value={form.headUserId}
              onChange={(e) => setForm({ ...form, headUserId: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
            >
              <option value="">Unassigned</option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Budget (INR)</label>
              <input
                type="number"
                min={0}
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as 'active' | 'inactive' })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <PermissionGate permission="departments.manage">
            <button
              type="submit"
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#087F5B] px-4 py-2 font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{saving ? 'Saving…' : 'Save Department'}</span>
            </button>
          </PermissionGate>
        </form>

        {/* Department Members Roster */}
        <div className="lg:col-span-2 rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6 shadow-xs space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Department Roster ({dept.members?.length || 0})
              </h3>
              <p className="text-xs text-slate-500">Assign or remove team members in this department</p>
            </div>

            <PermissionGate permission="departments.manage">
              <div className="flex items-center gap-2">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-1.5 text-xs"
                >
                  <option value="">Select user to assign…</option>
                  {unassignedCandidates.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={!selectedUserId}
                  onClick={handleAssignMember}
                  className="inline-flex items-center gap-1 rounded-xl bg-[#087F5B] px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-40"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Assign</span>
                </button>
              </div>
            </PermissionGate>
          </div>

          {!dept.members || dept.members.length === 0 ? (
            <EmptyState
              title="No members assigned yet"
              description="Select an organization user above to assign them to this department."
            />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-[#1d332b]">
              {dept.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between gap-3 py-3 text-xs">
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => router.push(`/dashboard/admin/users/${member.id}`)}
                      className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 transition"
                    >
                      {member.name}
                    </button>
                    <p className="text-[11px] text-slate-500 truncate">
                      {member.email} • {member.role.replace(/_/g, ' ')}
                      {member.designation ? ` • ${member.designation}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={member.status} />
                    <PermissionGate permission="departments.manage">
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.id)}
                        title="Remove from department"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                      >
                        <UserMinus className="h-3.5 w-3.5" />
                      </button>
                    </PermissionGate>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Department Activity */}
      <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Department Activity Log</h3>
        <ActivityTimeline
          items={dept.activity || []}
          emptyTitle="No department activity yet"
          emptyDescription="Creation, updates, and member assignments are recorded here."
        />
      </div>
    </div>
  );
}
