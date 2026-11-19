'use client';

import React from 'react';
import { ProjectMilestoneItem } from '@/features/projects/services/project-api.service';
import { EmptyState, PermissionGate } from '@/features/admin';
import { CheckCircle2, Clock, Flag, Trash2 } from 'lucide-react';

export interface MilestoneTimelineProps {
  milestones: ProjectMilestoneItem[];
  onComplete?: (milestoneId: string) => void;
  onDelete?: (milestoneId: string) => void;
}

export function MilestoneTimeline({ milestones, onComplete, onDelete }: MilestoneTimelineProps) {
  if (!milestones || milestones.length === 0) {
    return (
      <EmptyState
        title="No milestones defined"
        description="Define measurable delivery milestones with target dates and deliverables."
        icon={<Flag className="h-6 w-6" />}
      />
    );
  }

  return (
    <div className="space-y-3">
      {milestones.map((m) => {
        const done = m.status === 'COMPLETED';
        const overdue = !done && m.status !== 'CANCELLED' && new Date(m.targetDate) < new Date();
        return (
          <div
            key={m.id}
            className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-4 shadow-xs space-y-2.5 text-xs"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">{m.title}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      done
                        ? 'bg-emerald-50 text-emerald-700'
                        : overdue
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-sky-50 text-sky-700'
                    }`}
                  >
                    {overdue ? 'OVERDUE' : m.status.replace(/_/g, ' ')}
                  </span>
                </div>
                {m.project?.name && (
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                    {m.project.code} • {m.project.name}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                  <Clock className="h-3.5 w-3.5" />
                  Target: {new Date(m.targetDate).toLocaleDateString()}
                </span>

                <PermissionGate anyPermissions={['milestones.manage', 'projects.manage']}>
                  {!done && onComplete && (
                    <button
                      type="button"
                      onClick={() => onComplete(m.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Complete</span>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(m.id)}
                      title="Delete milestone"
                      className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </PermissionGate>
              </div>
            </div>

            {m.description && <p className="text-slate-600 dark:text-slate-300">{m.description}</p>}

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>
                  Owner: <strong>{m.responsibleUser?.name || 'Unassigned'}</strong>
                </span>
                <strong>{m.completionPercentage}%</strong>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full ${done ? 'bg-emerald-600' : overdue ? 'bg-rose-500' : 'bg-sky-500'}`}
                  style={{ width: `${m.completionPercentage}%` }}
                />
              </div>
            </div>

            {m.deliverables && m.deliverables.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {m.deliverables.map((d, idx) => (
                  <span
                    key={idx}
                    className="rounded-md bg-slate-100 dark:bg-[#172b22] px-2 py-0.5 text-[10px] text-slate-600 dark:text-slate-300"
                  >
                    ✓ {d}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
