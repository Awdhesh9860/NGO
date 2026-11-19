'use client';

import React from 'react';
import { VolunteerAssignmentItem } from '../services/volunteer-api.service';
import { VolunteerStatusBadge } from './VolunteerStatusBadge';
import { Calendar, ShieldAlert } from 'lucide-react';

export function VolunteerAssignmentCard({
  assignment,
  onStatusChange,
}: {
  assignment: VolunteerAssignmentItem;
  onStatusChange?: (assignmentId: string, status: 'ACCEPTED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'WITHDRAWN') => void;
}) {
  const projectLabel =
    typeof assignment.projectId === 'object' && assignment.projectId
      ? `${assignment.projectId.name} (${assignment.projectId.code})`
      : undefined;

  return (
    <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-4 shadow-xs space-y-2.5 text-xs">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h4 className="font-black text-slate-900 dark:text-white">{assignment.roleTitle}</h4>
          {projectLabel && <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">{projectLabel}</p>}
        </div>
        <div className="flex items-center gap-1.5">
          {assignment.requiresVerification && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-bold">
              <ShieldAlert className="h-3 w-3" /> Verified Required
            </span>
          )}
          <VolunteerStatusBadge status={assignment.status} />
        </div>
      </div>

      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{assignment.responsibilities}</p>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-[#1d332b] text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(assignment.startDate).toLocaleDateString('en-IN')}
          {assignment.endDate ? ` — ${new Date(assignment.endDate).toLocaleDateString('en-IN')}` : ' (Ongoing)'}
        </span>

        {onStatusChange && !['COMPLETED', 'WITHDRAWN'].includes(assignment.status) && (
          <div className="flex flex-wrap gap-1.5">
            {assignment.status === 'INVITED' && (
              <button
                type="button"
                onClick={() => onStatusChange(assignment._id, 'ACTIVE')}
                className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white"
              >
                Activate
              </button>
            )}
            {assignment.status === 'ACTIVE' && (
              <button
                type="button"
                onClick={() => onStatusChange(assignment._id, 'COMPLETED')}
                className="rounded-lg bg-indigo-600 px-2.5 py-1 text-[10px] font-bold text-white"
              >
                Mark Completed
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
