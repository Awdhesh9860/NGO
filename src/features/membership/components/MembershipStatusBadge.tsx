'use client';

import React from 'react';

const STYLES: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  SUBMITTED: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300',
  UNDER_REVIEW: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
  APPROVED: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300',
  ACTIVE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
  EXPIRED: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300',
  SUSPENDED: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
  CANCELLED: 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  REJECTED: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
};

export function MembershipStatusBadge({ status }: { status: string }) {
  const cls = STYLES[status] || STYLES.DRAFT;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${cls}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
