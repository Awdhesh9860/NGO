'use client';

import React from 'react';
import { Calendar, Flag, CheckCircle2, Clock } from 'lucide-react';
import { ProjectMilestoneItem } from '../services/project-api.service';

export interface ProjectTimelineProps {
  startDate?: string;
  endDate?: string;
  milestones: ProjectMilestoneItem[];
}

export function ProjectTimeline({ startDate, endDate, milestones }: ProjectTimelineProps) {
  return (
    <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-[#1d332b] pb-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <Calendar className="h-4 w-4 text-emerald-600" />
          <span>Project Schedule & Delivery Horizon</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>Start: <strong className="text-slate-800 dark:text-slate-200">{startDate ? new Date(startDate).toLocaleDateString() : 'TBD'}</strong></span>
          <span>→</span>
          <span>End: <strong className="text-slate-800 dark:text-slate-200">{endDate ? new Date(endDate).toLocaleDateString() : 'TBD'}</strong></span>
        </div>
      </div>

      {milestones.length === 0 ? (
        <p className="py-6 text-center text-xs text-slate-400">
          Add milestones to visualize the project delivery timeline.
        </p>
      ) : (
        <div className="relative flex flex-col gap-3 pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-100 dark:before:bg-emerald-950">
          {milestones.map((m) => {
            const done = m.status === 'COMPLETED';
            const overdue = !done && new Date(m.targetDate) < new Date();
            return (
              <div key={m.id} className="relative rounded-xl border border-slate-100 dark:border-[#1d332b] bg-slate-50/60 dark:bg-[#162920]/40 p-3 text-xs">
                <span
                  className={`absolute -left-[22px] top-3.5 flex h-4 w-4 items-center justify-center rounded-full ${
                    done
                      ? 'bg-emerald-600 text-white'
                      : overdue
                      ? 'bg-rose-600 text-white'
                      : 'bg-white dark:bg-[#12221b] border-2 border-emerald-500 text-emerald-600'
                  }`}
                >
                  {done ? <CheckCircle2 className="h-2.5 w-2.5" /> : <Flag className="h-2 w-2" />}
                </span>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">{m.title}</span>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${overdue ? 'text-rose-600' : 'text-slate-500'}`}>
                    <Clock className="h-3 w-3" />
                    {new Date(m.targetDate).toLocaleDateString()} ({m.completionPercentage}%)
                  </span>
                </div>
                {m.description && <p className="mt-1 text-slate-500 dark:text-slate-400">{m.description}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
