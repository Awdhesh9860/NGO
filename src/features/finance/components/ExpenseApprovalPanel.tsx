'use client';

import React from 'react';
import { ExpenseItem } from '../services/finance-api.service';
import { ExpenseStatusBadge } from './ExpenseStatusBadge';
import { formatMinorCurrency } from '@/lib/money';
import { CheckCircle2, CreditCard, XCircle } from 'lucide-react';

interface ExpenseApprovalPanelProps {
  expenses: ExpenseItem[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onPay?: (id: string) => void;
}

export function ExpenseApprovalPanel({
  expenses,
  onApprove,
  onReject,
  onPay,
}: ExpenseApprovalPanelProps) {
  if (expenses.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] p-6 text-center text-xs text-slate-500">
        No expense claims found for the selected filter.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] overflow-x-auto">
      <table className="w-full min-w-[700px] text-left text-xs">
        <thead className="bg-slate-50 dark:bg-[#0d1a14] text-slate-500 uppercase text-[11px]">
          <tr>
            <th className="px-4 py-3">Expense #</th>
            <th className="px-4 py-3">Title & Category</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3 text-right">Amount</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Workflow Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {expenses.map((exp) => (
            <tr key={exp._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/30">
              <td className="px-4 py-3 font-mono font-bold text-[#087F5B] dark:text-emerald-400">
                {exp.expenseNumber}
              </td>
              <td className="px-4 py-3">
                <p className="font-semibold text-slate-900 dark:text-white">{exp.title}</p>
                <p className="text-[11px] text-slate-500">
                  {exp.category} {exp.invoiceNumber ? `• Inv: ${exp.invoiceNumber}` : ''}
                </p>
                {exp.rejectionReason && (
                  <p className="text-[11px] text-rose-600 mt-0.5">Reason: {exp.rejectionReason}</p>
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                {new Date(exp.expenseDate).toLocaleDateString('en-IN')}
              </td>
              <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                {formatMinorCurrency(exp.amountMinor, exp.currency)}
              </td>
              <td className="px-4 py-3">
                <ExpenseStatusBadge status={exp.status} />
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap space-x-1.5">
                {['SUBMITTED', 'UNDER_REVIEW'].includes(exp.status) && onApprove && (
                  <button
                    type="button"
                    onClick={() => onApprove(exp._id)}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#087F5B] px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                  </button>
                )}
                {['SUBMITTED', 'UNDER_REVIEW'].includes(exp.status) && onReject && (
                  <button
                    type="button"
                    onClick={() => onReject(exp._id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11px] font-bold text-rose-700 hover:bg-rose-100"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Reject
                  </button>
                )}
                {['APPROVED', 'PAYMENT_PENDING'].includes(exp.status) && onPay && (
                  <button
                    type="button"
                    onClick={() => onPay(exp._id)}
                    className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-indigo-700"
                  >
                    <CreditCard className="h-3.5 w-3.5" /> Record Payment
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
