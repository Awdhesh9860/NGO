'use client';

import React from 'react';

const STATUS_MAP: Record<string, string> = {
  INITIATED: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
  SUCCESSFUL: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
  FAILED: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
  CANCELLED: 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  PARTIALLY_REFUNDED: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300',
  REFUNDED: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
};

export function DonationStatusBadge({ status }: { status: string }) {
  const cls = STATUS_MAP[status] || STATUS_MAP.INITIATED;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${cls}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
