'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  adminApiService,
  AdminRoleSummary,
  PermissionCatalogItem,
  PageHeader,
  StatusBadge,
  LoadingSkeleton,
  EmptyState,
  PermissionGate,
} from '@/features/admin';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  PlusCircle,
  Lock,
  Check,
  Minus,
  ArrowUpRight,
  AlertCircle,
  X,
} from 'lucide-react';

export default function AdminRolesPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const [systemRoles, setSystemRoles] = useState<Record<string, string[]>>({});
  const [customRoles, setCustomRoles] = useState<AdminRoleSummary[]>([]);
  const [catalog, setCatalog] = useState<PermissionCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'roles' | 'matrix'>('roles');

  // Create Custom Role Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: '',
    key: '',
    description: '',
    permissions: [] as string[],
  });

  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApiService.getRoles();
      if (res.success && res.data) {
        setSystemRoles(res.data.systemRoles);
        setCustomRoles(res.data.customRoles);
        setCatalog(res.data.allPermissionsCatalog);
      } else {
        setError(res.error?.message || 'Failed to load roles catalog');
      }
    } catch {
      setError('Unable to reach role management API');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      void loadRoles();
    }, 0);
    return () => clearTimeout(id);
  }, [loadRoles]);

  const modules = Array.from(new Set(catalog.map((p) => p.module)));
  const systemRoleKeys = Object.keys(systemRoles);

  const togglePermission = (key: string) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter((p) => p !== key)
        : [...prev.permissions, key],
    }));
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.permissions.length === 0) {
      setError('Select at least one permission for the custom role');
      return;
    }
    try {
      setCreating(true);
      setError(null);
      const res = await adminApiService.createRole({
        name: form.name,
        key: form.key.toUpperCase().replace(/[^A-Z0-9_]/g, '_'),
        description: form.description || undefined,
        permissions: form.permissions,
      });

      if (!res.success) {
        setError(res.error?.message || 'Could not create custom role');
        return;
      }

      setCreateOpen(false);
      setForm({ name: '', key: '', description: '', permissions: [] });
      loadRoles();
    } catch {
      setError('Failed to create custom role');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Permissions (RBAC)"
        description="13 built-in system roles, organization-defined custom roles, and module-wise permission matrix."
        actions={
          <PermissionGate permission="roles.manage">
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#087F5B] px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Create Custom Role</span>
            </button>
          </PermissionGate>
        }
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e2ece6] dark:border-[#1d332b]">
        <button
          type="button"
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            activeTab === 'roles'
              ? 'border-[#087F5B] text-[#087F5B] dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          System & Custom Roles
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            activeTab === 'matrix'
              ? 'border-[#087F5B] text-[#087F5B] dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Permission Matrix ({catalog.length} Permissions)
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton variant="cards" rows={4} />
      ) : activeTab === 'roles' ? (
        <div className="space-y-8">
          {/* Custom Roles */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Organization Custom Roles ({customRoles.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Tenant-scoped roles created for specialized workflows. Cannot override protected platform permissions.
                </p>
              </div>
            </div>

            {customRoles.length === 0 ? (
              <EmptyState
                title="No custom roles created yet"
                description="Use built-in system roles or create a custom organization role with granular permissions."
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {customRoles.map((role) => (
                  <div
                    key={role.id}
                    className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{role.name}</h4>
                          <p className="text-[10px] font-mono text-slate-400">{role.key}</p>
                        </div>
                        <StatusBadge status={role.status} />
                      </div>
                      {role.description && (
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{role.description}</p>
                      )}
                      <p className="mt-3 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                        {role.permissions.length} permission(s) assigned
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1d332b] flex justify-end">
                      <button
                        type="button"
                        onClick={() => router.push(`/dashboard/admin/roles/${role.id}`)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                      >
                        <span>Configure</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* System Roles */}
          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Built-in System Roles ({systemRoleKeys.length})
              </h3>
              <p className="text-xs text-slate-500">
                Standard 13-role hierarchy enforced server-side. System roles are immutable to guarantee security boundaries.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {systemRoleKeys.map((roleKey) => {
                const perms = systemRoles[roleKey] || [];
                return (
                  <div
                    key={roleKey}
                    className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-4 shadow-xs flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {roleKey.replace(/_/g, ' ')}
                        </h4>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {roleKey === 'GUEST'
                          ? 'Unauthenticated public visitor (0 admin perms)'
                          : `${perms.length} baseline permission(s)`}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => router.push(`/dashboard/admin/roles/${roleKey}`)}
                      className="rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 shrink-0 transition"
                    >
                      Inspect
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      ) : (
        /* Module-wise Permission Matrix */
        <div className="overflow-hidden rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left text-[11px]">
              <thead>
                <tr className="border-b border-[#e2ece6] dark:border-[#1d332b] bg-slate-50 dark:bg-[#162920]">
                  <th className="sticky left-0 z-10 bg-slate-50 dark:bg-[#162920] px-4 py-3 font-bold uppercase text-slate-500">
                    Permission
                  </th>
                  {systemRoleKeys.filter((k) => k !== 'GUEST').map((roleKey) => (
                    <th key={roleKey} className="px-2.5 py-3 text-center font-bold text-slate-600 dark:text-slate-300">
                      <span className="block max-w-[72px] truncate" title={roleKey}>
                        {roleKey.replace(/_/g, ' ')}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1d332b]">
                {modules.map((mod) => (
                  <React.Fragment key={mod}>
                    <tr className="bg-emerald-50/40 dark:bg-emerald-950/30">
                      <td
                        colSpan={systemRoleKeys.length}
                        className="px-4 py-2 text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300"
                      >
                        {mod} Module
                      </td>
                    </tr>
                    {catalog
                      .filter((p) => p.module === mod)
                      .map((perm) => (
                        <tr key={perm.key} className="hover:bg-slate-50/60 dark:hover:bg-[#162920]/40">
                          <td className="sticky left-0 bg-white dark:bg-[#12221b] px-4 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-900 dark:text-white">{perm.label}</span>
                              {perm.isPlatformProtected && (
                                <span
                                  title="Platform-protected permission"
                                  className="inline-flex items-center gap-0.5 rounded bg-purple-100 dark:bg-purple-950/60 px-1 py-0.5 text-[9px] font-bold text-purple-700 dark:text-purple-300"
                                >
                                  <Lock className="h-2.5 w-2.5" /> Platform
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] font-mono text-slate-400">{perm.key}</p>
                          </td>
                          {systemRoleKeys
                            .filter((k) => k !== 'GUEST')
                            .map((roleKey) => {
                              const has = (systemRoles[roleKey] || []).includes(perm.key);
                              return (
                                <td key={roleKey} className="px-2 py-2.5 text-center">
                                  {has ? (
                                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400">
                                      <Check className="h-3 w-3" />
                                    </span>
                                  ) : (
                                    <Minus className="mx-auto h-3 w-3 text-slate-300 dark:text-slate-700" />
                                  )}
                                </td>
                              );
                            })}
                        </tr>
                      ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Custom Role Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1d332b] pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create Organization Custom Role</h3>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Role Name *</label>
                  <input
                    required
                    minLength={2}
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                        key: form.key || e.target.value.toUpperCase().replace(/[^A-Z0-9]+/g, '_'),
                      })
                    }
                    placeholder="e.g. Regional Coordinator"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Role Key (UPPER_SNAKE) *
                  </label>
                  <input
                    required
                    type="text"
                    value={form.key}
                    onChange={(e) => setForm({ ...form, key: e.target.value.toUpperCase() })}
                    placeholder="REGIONAL_COORDINATOR"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2 font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Purpose and operational scope of this custom role"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-3">
                <p className="font-bold text-slate-900 dark:text-white">
                  Select Permissions ({form.permissions.length} selected)
                </p>
                {modules.map((mod) => (
                  <div
                    key={mod}
                    className="rounded-xl border border-slate-100 dark:border-[#1d332b] bg-slate-50/50 dark:bg-[#162920]/40 p-3"
                  >
                    <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      {mod}
                    </p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {catalog
                        .filter((p) => p.module === mod)
                        .map((perm) => {
                          const locked = perm.isPlatformProtected && !isSuperAdmin;
                          const checked = form.permissions.includes(perm.key);
                          return (
                            <label
                              key={perm.key}
                              className={`flex items-start gap-2 rounded-lg p-1.5 ${
                                locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white dark:hover:bg-[#12221b]'
                              }`}
                            >
                              <input
                                type="checkbox"
                                disabled={locked}
                                checked={checked}
                                onChange={() => togglePermission(perm.key)}
                                className="mt-0.5 rounded border-slate-300 text-[#087F5B] focus:ring-emerald-500"
                              />
                              <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-100">
                                  {perm.label}{' '}
                                  {locked && <span className="text-[10px] text-purple-600">(Platform Protected)</span>}
                                </p>
                                <p className="text-[10px] text-slate-400">{perm.description}</p>
                              </div>
                            </label>
                          );
                        })}
                    </div>
                  </div>
                ))}
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
                  {creating ? 'Creating…' : 'Create Custom Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
