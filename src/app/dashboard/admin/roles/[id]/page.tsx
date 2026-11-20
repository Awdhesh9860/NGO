'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  adminApiService,
  AdminRoleSummary,
  PermissionCatalogItem,
  PageHeader,
  StatusBadge,
  LoadingSkeleton,
  PermissionGate,
} from '@/features/admin';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Save, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminRoleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const roleId = params.id as string;

  const [role, setRole] = useState<AdminRoleSummary | null>(null);
  const [catalog, setCatalog] = useState<PermissionCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const loadRole = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApiService.getRoleById(roleId);
      if (!res.success || !res.data) {
        setError(res.error?.message || 'Role not found');
        return;
      }
      const r = res.data.role;
      setRole(r);
      setCatalog(res.data.allPermissionsCatalog);
      setName(r.name);
      setDescription(r.description || '');
      setPermissions(r.permissions);
      setStatus(r.status);
    } catch {
      setError('Failed to load role details');
    } finally {
      setLoading(false);
    }
  }, [roleId]);

  useEffect(() => {
    const id = setTimeout(() => {
      void loadRole();
    }, 0);
    return () => clearTimeout(id);
  }, [loadRole]);

  const togglePermission = (key: string) => {
    if (role?.isSystemRole) return;
    setPermissions((prev) => (prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || role.isSystemRole) return;
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const res = await adminApiService.updateRole(role.id, {
        name,
        description: description || null,
        permissions,
        status,
      });
      if (!res.success) {
        setError(res.error?.message || 'Could not update role');
        return;
      }
      setSuccess('Custom role updated successfully.');
      loadRole();
    } catch {
      setError('Failed to save role');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSkeleton variant="form" rows={5} />;

  if (!role) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-xs text-rose-700">
        {error || 'Role not found'}
      </div>
    );
  }

  const modules = Array.from(new Set(catalog.map((p) => p.module)));

  return (
    <div className="space-y-6">
      <PageHeader
        title={role.name}
        description={`Key: ${role.key} • ${role.assignedUserCount ?? 0} assigned user(s)`}
        badge={
          <div className="flex items-center gap-1.5">
            <StatusBadge status={role.status} />
            {role.isSystemRole && (
              <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-[11px] font-semibold text-purple-700 dark:border-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                <Lock className="h-3 w-3" /> System Role
              </span>
            )}
          </div>
        }
        actions={
          <button
            type="button"
            onClick={() => router.push('/dashboard/admin/roles')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Roles</span>
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

      <form
        onSubmit={handleSave}
        className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6 space-y-6 text-xs shadow-xs"
      >
        {role.isSystemRole && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/30 p-3.5 text-amber-800 dark:text-amber-200">
            This is a built-in system role. Its permission baseline is read-only to protect core RBAC security boundaries. To tailor permissions, create an organization custom role.
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Role Name</label>
            <input
              type="text"
              disabled={role.isSystemRole}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2 disabled:opacity-60"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <input
              type="text"
              disabled={role.isSystemRole}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2 disabled:opacity-60"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
            <select
              disabled={role.isSystemRole}
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2 disabled:opacity-60"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Permission Preview ({permissions.length} granted)
          </h3>

          {modules.map((mod) => (
            <div
              key={mod}
              className="rounded-xl border border-slate-100 dark:border-[#1d332b] bg-slate-50/50 dark:bg-[#162920]/40 p-4"
            >
              <p className="mb-2.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                {mod}
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {catalog
                  .filter((p) => p.module === mod)
                  .map((perm) => {
                    const checked = permissions.includes(perm.key);
                    const locked = role.isSystemRole || (perm.isPlatformProtected && !isSuperAdmin);
                    return (
                      <label
                        key={perm.key}
                        className={`flex items-start gap-2 rounded-lg p-2 border ${
                          checked
                            ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/60 dark:bg-emerald-950/30'
                            : 'border-transparent'
                        } ${locked ? 'opacity-75' : 'cursor-pointer'}`}
                      >
                        <input
                          type="checkbox"
                          disabled={locked}
                          checked={checked}
                          onChange={() => togglePermission(perm.key)}
                          className="mt-0.5 rounded border-slate-300 text-[#087F5B]"
                        />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{perm.label}</p>
                          <p className="text-[10px] font-mono text-slate-400">{perm.key}</p>
                        </div>
                      </label>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        {!role.isSystemRole && (
          <PermissionGate permission="roles.manage">
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#087F5B] px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{saving ? 'Saving…' : 'Save Role Changes'}</span>
              </button>
            </div>
          </PermissionGate>
        )}
      </form>
    </div>
  );
}
