'use client';

import React from 'react';
import { JournalEntryItem } from '../services/finance-api.service';
import { formatMinorCurrency } from '@/lib/money';
import { CheckCircle2, RotateCcw, Send } from 'lucide-react';

interface JournalEntryTableProps {
  journals: JournalEntryItem[];
  onApprove?: (id: string) => void;
  onPost?: (id: string) => void;
  onReverse?: (id: string) => void;
}

const STATUS_STYLE: Record<JournalEntryItem['status'], string> = {
  DRAFT: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  PENDING_APPROVAL: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  APPROVED: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
  POSTED: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  REVERSED: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
};

export function JournalEntryTable({ journals, onApprove, onPost, onReverse }: JournalEntryTableProps) {
  if (journals.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] p-6 text-center text-xs text-slate-500">
        No journal entries match the selected filter.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] overflow-x-auto">
      <table className="w-full min-w-[680px] text-left text-xs">
        <thead className="bg-slate-50 dark:bg-[#0d1a14] text-slate-500 dark:text-slate-400 uppercase text-[11px]">
          <tr>
            <th className="px-4 py-3">Journal #</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Source</th>
            <th className="px-4 py-3">Description</th>
            <th className="px-4 py-3 text-right">Debit = Credit</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {journals.map((j) => (
            <tr key={j._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/30">
              <td className="px-4 py-3 font-mono font-bold text-[#087F5B] dark:text-emerald-400">
                {j.journalNumber}
              </td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                {new Date(j.transactionDate).toLocaleDateString('en-IN')}
              </td>
              <td className="px-4 py-3">
                <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold">
                  {j.referenceType}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-800 dark:text-slate-200 max-w-xs truncate">
                {j.description}
              </td>
              <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                {formatMinorCurrency(j.totalDebitMinor, j.currency)}
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${STATUS_STYLE[j.status]}`}>
                  {j.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap space-x-1.5">
                {(j.status === 'DRAFT' || j.status === 'PENDING_APPROVAL') && onApprove && (
                  <button
                    type="button"
                    onClick={() => onApprove(j._id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700 hover:bg-sky-100"
                  >
                    <CheckCircle2 className="h-3 w-3" /> Approve
                  </button>
                )}
                {j.status === 'APPROVED' && onPost && (
                  <button
                    type="button"
                    onClick={() => onPost(j._id)}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#087F5B] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700"
                  >
                    <Send className="h-3 w-3" /> Post
                  </button>
                )}
                {j.status === 'POSTED' && !j.isReversed && onReverse && (
                  <button
                    type="button"
                    onClick={() => onReverse(j._id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100"
                  >
                    <RotateCcw className="h-3 w-3" /> Reverse
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
