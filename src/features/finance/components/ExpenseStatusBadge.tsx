'use client';

import React from 'react';
import { ExpenseItem } from '../services/finance-api.service';

const STYLES: Record<ExpenseItem['status'], string> = {
  DRAFT: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  SUBMITTED: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
  UNDER_REVIEW: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  APPROVED: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300',
  REJECTED: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
  PAYMENT_PENDING: 'bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300',
  PAID: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  CANCELLED: 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

export function ExpenseStatusBadge({ status }: { status: ExpenseItem['status'] }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${STYLES[status] || STYLES.DRAFT}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
