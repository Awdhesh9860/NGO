'use client';

import React from 'react';
import { ChartOfAccountItem } from '../services/finance-api.service';
import { FolderTree, Lock, Trash2 } from 'lucide-react';

interface ChartOfAccountsTreeProps {
  accounts: ChartOfAccountItem[];
  onToggleActive?: (account: ChartOfAccountItem) => void;
  onDelete?: (account: ChartOfAccountItem) => void;
}

const ACCOUNT_GROUPS: Array<ChartOfAccountItem['accountType']> = [
  'ASSET',
  'LIABILITY',
  'EQUITY',
  'INCOME',
  'EXPENSE',
];

const TYPE_BADGE: Record<ChartOfAccountItem['accountType'], string> = {
  ASSET: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  LIABILITY: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  EQUITY: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
  INCOME: 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300',
  EXPENSE: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
};

export function ChartOfAccountsTree({ accounts, onToggleActive, onDelete }: ChartOfAccountsTreeProps) {
  return (
    <div className="space-y-4">
      {ACCOUNT_GROUPS.map((group) => {
        const groupAccounts = accounts.filter((a) => a.accountType === group);
        return (
          <div
            key={group}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-[#0d1a14] border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FolderTree className="h-4 w-4 text-[#087F5B]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {group} Accounts
                </h3>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${TYPE_BADGE[group]}`}>
                {groupAccounts.length}
              </span>
            </div>

            {groupAccounts.length === 0 ? (
              <p className="p-4 text-xs text-slate-500">No {group.toLowerCase()} accounts configured.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {groupAccounts.map((acc) => (
                  <div
                    key={acc._id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 text-xs ${
                      acc.parentAccountId ? 'sm:pl-8 bg-slate-50/40 dark:bg-slate-900/20' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-[#087F5B] dark:text-emerald-400">
                          {acc.code}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">{acc.name}</span>
                        <span className="text-[11px] text-slate-500">({acc.category})</span>
                        {acc.isSystemAccount && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                            <Lock className="h-2.5 w-2.5" /> System
                          </span>
                        )}
                        {!acc.isActive && (
                          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
                            Inactive
                          </span>
                        )}
                      </div>
                      {acc.description && (
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{acc.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="rounded-md border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[10px] font-mono text-slate-600 dark:text-slate-300">
                        Normal: {acc.normalBalance}
                      </span>
                      {onToggleActive && !acc.isSystemAccount && (
                        <button
                          type="button"
                          onClick={() => onToggleActive(acc)}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 px-2 py-1 text-[11px] font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          {acc.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                      {onDelete && !acc.isSystemAccount && (
                        <button
                          type="button"
                          onClick={() => onDelete(acc)}
                          aria-label={`Delete account ${acc.code}`}
                          className="rounded-lg border border-rose-200 text-rose-600 p-1.5 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-950/30"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
