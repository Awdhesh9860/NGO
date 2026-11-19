'use client';

import React from 'react';

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  PENDING_APPROVAL: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
  APPROVED: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300',
  ACTIVE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
  PAUSED: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300',
  GOAL_REACHED: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300',
  COMPLETED: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300',
  CANCELLED: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
  ARCHIVED: 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

export function CampaignStatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.DRAFT;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${style}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
