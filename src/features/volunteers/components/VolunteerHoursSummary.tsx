'use client';

import React from 'react';
import { VolunteerHoursSummaryData } from '../services/volunteer-api.service';

export function VolunteerHoursSummary({ summary }: { summary: VolunteerHoursSummaryData }) {
  return (
    <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
        <div className="rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 p-3">
          <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400">
            Verified Hours
          </span>
          <div className="mt-1 text-xl font-black text-emerald-800 dark:text-emerald-300">
            {summary.verifiedHours} hrs
          </div>
          <span className="text-[10px] text-slate-500">{summary.approvedSessions} approved sessions</span>
        </div>
        <div className="rounded-xl bg-amber-50/70 dark:bg-amber-950/30 p-3">
          <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-300">
            Pending Review
          </span>
          <div className="mt-1 text-xl font-black text-amber-800 dark:text-amber-200">
            {summary.pendingHours} hrs
          </div>
          <span className="text-[10px] text-slate-500">{summary.pendingSessions} pending sessions</span>
        </div>
        <div className="rounded-xl bg-slate-50 dark:bg-[#162720] p-3">
          <span className="text-[10px] font-bold uppercase text-slate-400">Verified Minutes</span>
          <div className="mt-1 text-xl font-black text-slate-900 dark:text-white">
            {summary.verifiedMinutes}
          </div>
        </div>
        <div className="rounded-xl bg-slate-50 dark:bg-[#162720] p-3">
          <span className="text-[10px] font-bold uppercase text-slate-400">Active Months</span>
          <div className="mt-1 text-xl font-black text-slate-900 dark:text-white">
            {summary.monthlyBreakdown.length}
          </div>
        </div>
      </div>

      {summary.monthlyBreakdown.length > 0 && (
        <div className="space-y-1.5 text-xs">
          <p className="text-[11px] font-bold uppercase text-slate-400">Monthly Verified Breakdown</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {summary.monthlyBreakdown.map((m) => (
              <div
                key={m.month}
                className="rounded-lg border border-slate-100 dark:border-[#1d332b] px-3 py-2 flex items-center justify-between"
              >
                <span className="font-mono text-slate-500">{m.month}</span>
                <span className="font-black text-emerald-700 dark:text-emerald-400">{m.hours}h</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
