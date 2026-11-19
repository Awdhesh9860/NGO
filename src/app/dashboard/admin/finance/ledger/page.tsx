'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { PageHeader, PermissionGate } from '@/features/admin';
import {
  financeApiService,
  ChartOfAccountItem,
  GeneralLedgerTable,
  LedgerEntryItem,
  TrialBalanceData,
  TrialBalanceTable,
} from '@/features/finance';
import { Download } from 'lucide-react';

export default function AdminGeneralLedgerPage() {
  const [accounts, setAccounts] = useState<ChartOfAccountItem[]>([]);
  const [accountId, setAccountId] = useState('');
  const [ledger, setLedger] = useState<{
    entries: LedgerEntryItem[];
    totalDebitMinor: number;
    totalCreditMinor: number;
  }>({ entries: [], totalDebitMinor: 0, totalCreditMinor: 0 });
  const [trialBalance, setTrialBalance] = useState<TrialBalanceData>({
    rows: [],
    totalDebitMinor: 0,
    totalCreditMinor: 0,
    isBalanced: true,
  });

  const loadData = useCallback(async () => {
    const [accRes, glRes, tbRes] = await Promise.all([
      financeApiService.listAccounts(true),
      financeApiService.getLedger({ accountId: accountId || undefined }),
      financeApiService.getTrialBalance(),
    ]);
    if (accRes.success && accRes.data) setAccounts(accRes.data);
    if (glRes.success && glRes.data) setLedger(glRes.data);
    if (tbRes.success && tbRes.data) setTrialBalance(tbRes.data);
  }, [accountId]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) void loadData();
    });
    return () => {
      active = false;
    };
  }, [loadData]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="General Ledger & Trial Balance"
        description="Authoritative posted ledger entries and balanced Trial Balance verification."
        actions={
          <PermissionGate permission="finance.reports.export">
            <a
              href="/api/v1/finance/trial-balance?export=csv"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#087F5B] px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
            >
              <Download className="h-3.5 w-3.5" /> Export Trial Balance CSV
            </a>
          </PermissionGate>
        }
      />

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] p-4 flex flex-wrap items-center gap-3">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Filter by Ledger Account:</label>
        <select
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs"
        >
          <option value="">All Posted Accounts</option>
          {accounts.map((a) => (
            <option key={a._id} value={a._id}>
              {a.code} — {a.name}
            </option>
          ))}
        </select>
      </div>

      <TrialBalanceTable data={trialBalance} />

      <GeneralLedgerTable
        entries={ledger.entries}
        totalDebitMinor={ledger.totalDebitMinor}
        totalCreditMinor={ledger.totalCreditMinor}
      />
    </div>
  );
}
