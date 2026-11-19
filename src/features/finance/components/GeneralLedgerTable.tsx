'use client';

import React from 'react';
import { LedgerEntryItem } from '../services/finance-api.service';
import { formatMinorCurrency } from '@/lib/money';

interface GeneralLedgerTableProps {
  entries: LedgerEntryItem[];
  totalDebitMinor: number;
  totalCreditMinor: number;
  currency?: string;
}

export function GeneralLedgerTable({
  entries,
  totalDebitMinor,
  totalCreditMinor,
  currency = 'INR',
}: GeneralLedgerTableProps) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] overflow-x-auto">
      <table className="w-full min-w-[680px] text-left text-xs">
        <thead className="bg-slate-50 dark:bg-[#0d1a14] text-slate-500 uppercase text-[11px]">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Account</th>
            <th className="px-4 py-3">Description</th>
            <th className="px-4 py-3 text-right">Debit</th>
            <th className="px-4 py-3 text-right">Credit</th>
            <th className="px-4 py-3 text-right">Running Bal.</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {entries.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                No posted general ledger transactions found (draft entries are excluded).
              </td>
            </tr>
          ) : (
            entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/30">
                <td className="px-4 py-2.5 whitespace-nowrap text-slate-600 dark:text-slate-300">
                  {new Date(entry.transactionDate).toLocaleDateString('en-IN')}
                </td>
                <td className="px-4 py-2.5">
                  <span className="font-mono font-bold text-[#087F5B] dark:text-emerald-400 mr-1.5">
                    {entry.accountCode}
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{entry.accountName}</span>
                </td>
                <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                  {entry.description || '—'}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-slate-800 dark:text-slate-100">
                  {entry.debitMinor > 0 ? formatMinorCurrency(entry.debitMinor, currency) : '—'}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-slate-800 dark:text-slate-100">
                  {entry.creditMinor > 0 ? formatMinorCurrency(entry.creditMinor, currency) : '—'}
                </td>
                <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                  {formatMinorCurrency(entry.runningBalanceMinor, currency)}
                </td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot className="bg-slate-50 dark:bg-[#0d1a14] font-bold border-t border-slate-200 dark:border-slate-700">
          <tr>
            <td colSpan={3} className="px-4 py-3 text-slate-700 dark:text-slate-200">
              Posted Ledger Totals
            </td>
            <td className="px-4 py-3 text-right font-mono text-slate-900 dark:text-white">
              {formatMinorCurrency(totalDebitMinor, currency)}
            </td>
            <td className="px-4 py-3 text-right font-mono text-slate-900 dark:text-white">
              {formatMinorCurrency(totalCreditMinor, currency)}
            </td>
            <td className="px-4 py-3" />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
