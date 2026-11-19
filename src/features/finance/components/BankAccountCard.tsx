'use client';

import React from 'react';
import { BankAccountItem } from '../services/finance-api.service';
import { formatMinorCurrency } from '@/lib/money';
import { Landmark, CheckCircle2, Clock } from 'lucide-react';

interface BankAccountCardProps {
  account: BankAccountItem;
  isSelected?: boolean;
  onSelect?: (account: BankAccountItem) => void;
}

export function BankAccountCard({ account, isSelected, onSelect }: BankAccountCardProps) {
  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        isSelected
          ? 'border-[#087F5B] bg-emerald-50/40 dark:bg-emerald-950/20'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b]'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Landmark className="h-4 w-4 text-[#087F5B] shrink-0" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{account.accountName}</h4>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {account.bankName} • {account.accountType.replace(/_/g, ' ')}
          </p>
        </div>
        <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-mono font-bold">
          {account.accountNumberMasked}
        </span>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <div>
          <p className="text-[11px] text-slate-500">
            {account.isReconciled ? 'Last Reconciled Balance' : 'Opening Balance (Unreconciled)'}
          </p>
          <p className="font-mono font-extrabold text-base text-slate-900 dark:text-white">
            {formatMinorCurrency(
              account.isReconciled && account.lastReconciledBalanceMinor !== undefined
                ? account.lastReconciledBalanceMinor
                : account.openingBalanceMinor,
              account.currency
            )}
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
            account.isReconciled
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
          }`}
        >
          {account.isReconciled ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
          {account.isReconciled ? 'Reconciled' : 'Provisional'}
        </span>
      </div>

      {onSelect && (
        <button
          type="button"
          onClick={() => onSelect(account)}
          className="mt-3 w-full rounded-xl border border-slate-200 dark:border-slate-700 py-1.5 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          {isSelected ? 'Selected for Reconciliation' : 'Reconcile Statement'}
        </button>
      )}
    </div>
  );
}
