'use client';

import React from 'react';
import { VolunteerAttendanceItem } from '../services/volunteer-api.service';
import { CheckCircle2, XCircle } from 'lucide-react';

export function VolunteerAttendanceTable({
  records,
  canApprove = false,
  onDecision,
}: {
  records: VolunteerAttendanceItem[];
  canApprove?: boolean;
  onDecision?: (attendanceId: string, decision: 'APPROVE' | 'REJECT') => void;
}) {
  if (!records || records.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 dark:border-[#1d332b] p-6 text-center text-xs text-slate-500">
        No attendance sessions logged for this volunteer yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b]">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 dark:bg-[#162720] text-[11px] font-bold uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Activity</th>
            <th className="px-4 py-3">Duration</th>
            <th className="px-4 py-3">Attendance</th>
            <th className="px-4 py-3">Approval</th>
            {canApprove && <th className="px-4 py-3 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-[#1d332b]">
          {records.map((r) => (
            <tr key={r._id}>
              <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                {r.attendanceDate}
              </td>
              <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                <div>{r.activityDescription}</div>
                <div className="text-[10px] text-slate-400">Source: {r.entrySource}</div>
              </td>
              <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                {(r.minutesLogged / 60).toFixed(2)} hrs
              </td>
              <td className="px-4 py-3 text-[11px] font-semibold">{r.status}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    r.approvalStatus === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : r.approvalStatus === 'REJECTED'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {r.approvalStatus}
                </span>
              </td>
              {canApprove && (
                <td className="px-4 py-3 text-right">
                  {r.approvalStatus === 'PENDING' && onDecision && (
                    <div className="inline-flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => onDecision(r._id, 'APPROVE')}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white"
                      >
                        <CheckCircle2 className="h-3 w-3" /> Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => onDecision(r._id, 'REJECT')}
                        className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2 py-1 text-[10px] font-bold text-white"
                      >
                        <XCircle className="h-3 w-3" /> Reject
                      </button>
                    </div>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
