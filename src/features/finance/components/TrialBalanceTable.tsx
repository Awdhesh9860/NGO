'use client';

import React from 'react';
import { TrialBalanceData } from '../services/finance-api.service';
import { formatMinorCurrency } from '@/lib/money';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface TrialBalanceTableProps {
  data: TrialBalanceData;
  currency?: string;
}

export function TrialBalanceTable({ data, currency = 'INR' }: TrialBalanceTableProps) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-slate-50 dark:bg-[#0d1a14] border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
          Trial Balance (Posted Entries Only)
        </h3>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
            data.isBalanced
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
              : 'bg-rose-100 text-rose-800'
          }`}
        >
          {data.isBalanced ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
          {data.isBalanced ? 'Balanced (DR = CR)' : 'Out of Balance'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-xs">
          <thead className="text-slate-500 uppercase text-[11px] border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="px-4 py-2.5">Code</th>
              <th className="px-4 py-2.5">Account Name</th>
              <th className="px-4 py-2.5">Type</th>
              <th className="px-4 py-2.5 text-right">Net Debit</th>
              <th className="px-4 py-2.5 text-right">Net Credit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  No posted ledger balances yet.
                </td>
              </tr>
            ) : (
              data.rows.map((row) => (
                <tr key={row.accountId}>
                  <td className="px-4 py-2.5 font-mono font-bold text-[#087F5B] dark:text-emerald-400">
                    {row.accountCode}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-slate-800 dark:text-slate-200">{row.accountName}</td>
                  <td className="px-4 py-2.5 text-[11px] text-slate-500">{row.accountType}</td>
                  <td className="px-4 py-2.5 text-right font-mono">
                    {row.netDebitMinor > 0 ? formatMinorCurrency(row.netDebitMinor, currency) : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono">
                    {row.netCreditMinor > 0 ? formatMinorCurrency(row.netCreditMinor, currency) : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="bg-slate-50 dark:bg-[#0d1a14] font-bold border-t border-slate-200 dark:border-slate-700">
            <tr>
              <td colSpan={3} className="px-4 py-3">
                Total Trial Balance
              </td>
              <td className="px-4 py-3 text-right font-mono">{formatMinorCurrency(data.totalDebitMinor, currency)}</td>
              <td className="px-4 py-3 text-right font-mono">{formatMinorCurrency(data.totalCreditMinor, currency)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
