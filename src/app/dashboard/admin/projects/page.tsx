'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  projectApiService,
  ProjectListItem,
  ProjectCard,
  ProjectForm,
  PROJECT_STATUSES,
  PRIORITY_LEVELS,
  CreateProjectInput,
} from '@/features/projects';
import { programApiService, PROGRAM_CATEGORIES } from '@/features/programs';
import {
  adminApiService,
  PageHeader,
  SearchFilterBar,
  EmptyState,
  LoadingSkeleton,
  PermissionGate,
} from '@/features/admin';
import { FolderKanban, PlusCircle, AlertCircle, X } from 'lucide-react';

export default function AdminProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [programs, setPrograms] = useState<Array<{ id: string; title: string; code: string }>>([]);
  const [managers, setManagers] = useState<Array<{ id: string; name: string; role: string }>>([]);
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await projectApiService.list({
        limit: 50,
        search: search || undefined,
        status: statusFilter || undefined,
        programId: programFilter || undefined,
        category: categoryFilter || undefined,
        priority: priorityFilter || undefined,
      });
      if (res.success && res.data) {
        setProjects(res.data);
      } else {
        setError(res.error?.message || 'Failed to load projects');
      }
    } catch {
      setError('Unable to reach projects service');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, programFilter, categoryFilter, priorityFilter]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    Promise.all([
      programApiService.list({ limit: 100 }).catch(() => ({ success: false, data: [] })),
      adminApiService.getUsers({ limit: 100 }).catch(() => ({ success: false, data: [] })),
      adminApiService.getDepartments({ limit: 100 }).catch(() => ({ success: false, data: [] })),
    ]).then(([pRes, uRes, dRes]) => {
      if (pRes.success && pRes.data) {
        setPrograms(pRes.data.map((p) => ({ id: p.id, title: p.title, code: p.code })));
      }
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

  const handleCreate = async (data: CreateProjectInput) => {
    try {
      setSubmitting(true);
      setError(null);
      const res = await projectApiService.create(data);
      if (!res.success) {
        setError(res.error?.message || 'Could not create project');
        return;
      }
      setCreateOpen(false);
      loadProjects();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project Management"
        description="Coordinate grassroots field projects, budgets, milestones, tasks, teams, approvals, documents, and risks."
        actions={
          <PermissionGate anyPermissions={['projects.create', 'projects.manage']}>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#087F5B] px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Create Project</span>
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
        searchPlaceholder="Search projects by name, code, location, or district…"
        filters={[
          {
            id: 'status',
            label: 'All Statuses',
            value: statusFilter,
            onChange: setStatusFilter,
            options: PROJECT_STATUSES.map((s) => ({ label: s.replace(/_/g, ' '), value: s })),
          },
          {
            id: 'program',
            label: 'All Programs',
            value: programFilter,
            onChange: setProgramFilter,
            options: programs.map((p) => ({ label: `${p.code} • ${p.title}`, value: p.id })),
          },
          {
            id: 'category',
            label: 'All Categories',
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: PROGRAM_CATEGORIES.map((c) => ({ label: c, value: c })),
          },
          {
            id: 'priority',
            label: 'All Priorities',
            value: priorityFilter,
            onChange: setPriorityFilter,
            options: PRIORITY_LEVELS.map((p) => ({ label: p, value: p })),
          },
        ]}
        onReset={() => {
          setSearch('');
          setStatusFilter('');
          setProgramFilter('');
          setCategoryFilter('');
          setPriorityFilter('');
        }}
      />

      {loading ? (
        <LoadingSkeleton variant="cards" rows={3} />
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects found"
          description="Launch a field project linked to a parent program or as an independent initiative."
          icon={<FolderKanban className="h-6 w-6" />}
          action={
            <PermissionGate anyPermissions={['projects.create', 'projects.manage']}>
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="rounded-xl bg-[#087F5B] px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
              >
                Create Project
              </button>
            </PermissionGate>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpen={(id) => router.push(`/dashboard/admin/projects/${id}`)}
            />
          ))}
        </div>
      )}

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1d332b] pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create Field Project</h3>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <ProjectForm
              programs={programs}
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
