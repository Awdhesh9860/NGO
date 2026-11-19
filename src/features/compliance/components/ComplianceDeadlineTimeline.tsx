'use client';

import React from 'react';
import { ComplianceDeadlineEval } from '../services/compliance-api.service';
import { AlertTriangle, Calendar, CheckCircle2, Clock } from 'lucide-react';

interface ComplianceDeadlineTimelineProps {
  overdue: ComplianceDeadlineEval[];
  dueSoon: ComplianceDeadlineEval[];
  upcoming: ComplianceDeadlineEval[];
}

export function ComplianceDeadlineTimeline({
  overdue,
  dueSoon,
  upcoming,
}: ComplianceDeadlineTimelineProps) {
  const combined = [...overdue, ...dueSoon, ...upcoming];

  if (combined.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] p-5 text-center text-xs text-slate-500">
        No upcoming compliance expiry or filing deadlines configured.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] p-4 space-y-3">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <Calendar className="h-4 w-4 text-[#087F5B]" />
        Statutory Expiry & Filing Deadlines
      </h3>
      <div className="space-y-2.5">
        {combined.map((item) => {
          const isOverdue = item.urgency === 'OVERDUE';
          const isSoon = item.urgency === 'DUE_SOON';
          return (
            <div
              key={item.id}
              className={`rounded-xl border p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                isOverdue
                  ? 'border-rose-200 bg-rose-50/60 dark:border-rose-900/50 dark:bg-rose-950/20'
                  : isSoon
                  ? 'border-amber-200 bg-amber-50/60 dark:border-amber-900/50 dark:bg-amber-950/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {isOverdue ? (
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                  ) : isSoon ? (
                    <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#087F5B] shrink-0" />
                  )}
                  <span className="font-bold text-slate-900 dark:text-white truncate">
                    [{item.complianceType}] {item.title}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Jurisdiction: {item.jurisdiction} •{' '}
                  {item.isIndependentlyVerified ? 'Independently Verified' : 'Document Recorded (Not Yet Verified)'}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono font-bold text-slate-800 dark:text-slate-100">
                  {item.effectiveDeadline ? new Date(item.effectiveDeadline).toLocaleDateString('en-IN') : 'No Date'}
                </p>
                {item.daysUntilDeadline !== null && (
                  <p
                    className={`text-[11px] font-bold ${
                      isOverdue ? 'text-rose-600' : isSoon ? 'text-amber-700' : 'text-emerald-700'
                    }`}
                  >
                    {item.daysUntilDeadline < 0
                      ? `${Math.abs(item.daysUntilDeadline)} day(s) overdue`
                      : `${item.daysUntilDeadline} day(s) left`}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
