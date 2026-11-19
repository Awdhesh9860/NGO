'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { projectApiService, ProjectMilestoneItem } from '@/features/projects';
import { MilestoneTimeline, MILESTONE_STATUSES } from '@/features/milestones';
import { PageHeader, SearchFilterBar, LoadingSkeleton } from '@/features/admin';
import { AlertCircle } from 'lucide-react';

export default function AdminMilestonesPage() {
  const [milestones, setMilestones] = useState<ProjectMilestoneItem[]>([]);
  const [projects, setProjects] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [projectFilter, setProjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(false);

  const loadMilestones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await projectApiService.listAllMilestones({
        projectId: projectFilter || undefined,
        status: statusFilter || undefined,
        overdueOnly,
      });
      if (res.success && res.data) setMilestones(res.data);
      else setError(res.error?.message || 'Failed to load milestones');
    } catch {
      setError('Unable to reach milestones service');
    } finally {
      setLoading(false);
    }
  }, [projectFilter, statusFilter, overdueOnly]);

  useEffect(() => {
    loadMilestones();
  }, [loadMilestones]);

  useEffect(() => {
    projectApiService
      .list({ limit: 100 })
      .then((res) => {
        if (res.success && res.data) setProjects(res.data.map((p) => ({ id: p.id, name: p.name, code: p.code })));
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project Milestones"
        description="Track cross-project delivery targets, completion percentages, deliverables, and overdue milestones."
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <SearchFilterBar
        searchValue=""
        onSearchChange={() => {}}
        searchPlaceholder="Filter by project or status using selectors →"
        filters={[
          {
            id: 'project',
            label: 'All Projects',
            value: projectFilter,
            onChange: setProjectFilter,
            options: projects.map((p) => ({ label: `${p.code} • ${p.name}`, value: p.id })),
          },
          {
            id: 'status',
            label: 'All Statuses',
            value: statusFilter,
            onChange: setStatusFilter,
            options: MILESTONE_STATUSES.map((s) => ({ label: s.replace(/_/g, ' '), value: s })),
          },
        ]}
        rightSlot={
          <label className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs font-semibold text-rose-600 cursor-pointer">
            <input
              type="checkbox"
              checked={overdueOnly}
              onChange={(e) => setOverdueOnly(e.target.checked)}
              className="rounded border-slate-300 text-rose-600"
            />
            <span>Overdue Only</span>
          </label>
        }
        onReset={() => {
          setProjectFilter('');
          setStatusFilter('');
          setOverdueOnly(false);
        }}
      />

      {loading ? (
        <LoadingSkeleton variant="table" rows={5} />
      ) : (
        <MilestoneTimeline
          milestones={milestones}
          onComplete={async (milestoneId) => {
            const target = milestones.find((m) => m.id === milestoneId);
            if (!target?.project?._id) return;
            await projectApiService.updateMilestone(target.project._id, milestoneId, {
              status: 'COMPLETED',
              completionPercentage: 100,
            });
            loadMilestones();
          }}
        />
      )}
    </div>
  );
}
