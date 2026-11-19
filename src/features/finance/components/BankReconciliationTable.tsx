'use client';

import React from 'react';
import { BankTransactionItem } from '../services/finance-api.service';
import { formatMinorCurrency } from '@/lib/money';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface BankReconciliationTableProps {
  transactions: BankTransactionItem[];
  onMatch?: (txn: BankTransactionItem) => void;
  onFlagDiscrepancy?: (txn: BankTransactionItem) => void;
}

export function BankReconciliationTable({
  transactions,
  onMatch,
  onFlagDiscrepancy,
}: BankReconciliationTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] p-6 text-center text-xs text-slate-500">
        No bank statement transactions imported yet. Upload a CSV bank statement to begin manual reconciliation.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] overflow-x-auto">
      <table className="w-full min-w-[700px] text-left text-xs">
        <thead className="bg-slate-50 dark:bg-[#0d1a14] text-slate-500 uppercase text-[11px]">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Narration / Ref</th>
            <th className="px-4 py-3 text-right">Debit (Out)</th>
            <th className="px-4 py-3 text-right">Credit (In)</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Reconcile</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {transactions.map((txn) => (
            <tr key={txn._id}>
              <td className="px-4 py-2.5 whitespace-nowrap">
                {new Date(txn.transactionDate).toLocaleDateString('en-IN')}
              </td>
              <td className="px-4 py-2.5">
                <p className="font-medium text-slate-800 dark:text-slate-200 max-w-xs truncate">{txn.description}</p>
                {txn.reference && <p className="text-[11px] font-mono text-slate-500">Ref: {txn.reference}</p>}
                {txn.matchedEntityType && (
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    Matched: {txn.matchedEntityType} ({txn.matchedEntityId})
                  </p>
                )}
              </td>
              <td className="px-4 py-2.5 text-right font-mono text-rose-700 dark:text-rose-400">
                {txn.debitMinor > 0 ? formatMinorCurrency(txn.debitMinor, txn.currency) : '—'}
              </td>
              <td className="px-4 py-2.5 text-right font-mono text-emerald-700 dark:text-emerald-400">
                {txn.creditMinor > 0 ? formatMinorCurrency(txn.creditMinor, txn.currency) : '—'}
              </td>
              <td className="px-4 py-2.5">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    txn.reconciliationStatus === 'MATCHED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : txn.reconciliationStatus === 'DISCREPANCY'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {txn.reconciliationStatus}
                </span>
              </td>
              <td className="px-4 py-2.5 text-right whitespace-nowrap space-x-1.5">
                {txn.reconciliationStatus !== 'MATCHED' && onMatch && (
                  <button
                    type="button"
                    onClick={() => onMatch(txn)}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#087F5B] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="h-3 w-3" /> Match
                  </button>
                )}
                {txn.reconciliationStatus === 'UNMATCHED' && onFlagDiscrepancy && (
                  <button
                    type="button"
                    onClick={() => onFlagDiscrepancy(txn)}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700"
                  >
                    <AlertTriangle className="h-3 w-3" /> Flag
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
