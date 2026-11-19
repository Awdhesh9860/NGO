'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  programApiService,
  ProgramItem,
  ProgramCard,
  ProgramForm,
  PROGRAM_STATUSES,
  PROGRAM_CATEGORIES,
  CreateProgramInput,
} from '@/features/programs';
import {
  adminApiService,
  PageHeader,
  SearchFilterBar,
  EmptyState,
  LoadingSkeleton,
  PermissionGate,
} from '@/features/admin';
import { Layers, PlusCircle, AlertCircle, X } from 'lucide-react';

export default function AdminProgramsPage() {
  const router = useRouter();
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [managers, setManagers] = useState<Array<{ id: string; name: string; role: string }>>([]);
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadPrograms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await programApiService.list({
        limit: 50,
        search: search || undefined,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
      });
      if (res.success && res.data) {
        setPrograms(res.data);
      } else {
        setError(res.error?.message || 'Failed to load programs');
      }
    } catch {
      setError('Unable to reach programs service');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter]);

  useEffect(() => {
    loadPrograms();
  }, [loadPrograms]);

  useEffect(() => {
    Promise.all([
      adminApiService.getUsers({ limit: 100 }).catch(() => ({ success: false, data: [] })),
      adminApiService.getDepartments({ limit: 100 }).catch(() => ({ success: false, data: [] })),
    ]).then(([uRes, dRes]) => {
      if (uRes.success && uRes.data) {
        setManagers(
          uRes.data
            .filter((u) => u.status === 'active')
            .map((u) => ({ id: u.id, name: u.name, role: u.role }))
        );
      }
      if (dRes.success && dRes.data) {
        setDepartments(dRes.data.map((d) => ({ id: d.id, name: d.name })));
      }
    });
  }, []);

  const handleCreate = async (data: CreateProgramInput) => {
    try {
      setSubmitting(true);
      setError(null);
      const res = await programApiService.create(data);
      if (!res.success) {
        setError(res.error?.message || 'Could not create program');
        return;
      }
      setCreateOpen(false);
      loadPrograms();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Program Management"
        description="Direct multi-year NGO strategic programs, KPIs, departmental ownership, approvals, and linked projects."
        actions={
          <PermissionGate anyPermissions={['programs.create', 'programs.manage']}>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#087F5B] px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Create Program</span>
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
        searchPlaceholder="Search programs by title, code, or focus area…"
        filters={[
          {
            id: 'status',
            label: 'All Statuses',
            value: statusFilter,
            onChange: setStatusFilter,
            options: PROGRAM_STATUSES.map((s) => ({ label: s.replace(/_/g, ' '), value: s })),
          },
          {
            id: 'category',
            label: 'All Categories',
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: PROGRAM_CATEGORIES.map((c) => ({ label: c, value: c })),
          },
        ]}
        onReset={() => {
          setSearch('');
          setStatusFilter('');
          setCategoryFilter('');
        }}
      />

      {loading ? (
        <LoadingSkeleton variant="cards" rows={3} />
      ) : programs.length === 0 ? (
        <EmptyState
          title="No programs created yet"
          description="Create your first humanitarian program to organize field projects, budgets, and KPIs."
          icon={<Layers className="h-6 w-6" />}
          action={
            <PermissionGate anyPermissions={['programs.create', 'programs.manage']}>
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="rounded-xl bg-[#087F5B] px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
              >
                Create First Program
              </button>
            </PermissionGate>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              onOpen={(id) => router.push(`/dashboard/admin/programs/${id}`)}
            />
          ))}
        </div>
      )}

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1d332b] pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create Strategic Program</h3>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <ProgramForm
              managers={managers}
              departments={departments}
              submitting={submitting}
              onSubmit={handleCreate}
              onCancel={() => setCreateOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
