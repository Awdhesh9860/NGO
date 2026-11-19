'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { PageHeader, PermissionGate } from '@/features/admin';
import {
  financeApiService,
  AccountingPeriodItem,
  AccountingPeriodSelector,
  ChartOfAccountItem,
  JournalEntryForm,
  JournalEntryItem,
  JournalEntryTable,
} from '@/features/finance';
import { CalendarPlus, Link2 } from 'lucide-react';

export default function AdminJournalsPage() {
  const [accounts, setAccounts] = useState<ChartOfAccountItem[]>([]);
  const [periods, setPeriods] = useState<AccountingPeriodItem[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [journals, setJournals] = useState<JournalEntryItem[]>([]);
  const [syncSourceId, setSyncSourceId] = useState('');
  const [syncType, setSyncType] = useState<'DONATION' | 'REFUND'>('DONATION');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    const [accRes, perRes, jrRes] = await Promise.all([
      financeApiService.listAccounts(false),
      financeApiService.listPeriods(),
      financeApiService.listJournals({ periodId: selectedPeriodId || undefined }),
    ]);
    if (accRes.success && accRes.data) setAccounts(accRes.data);
    if (perRes.success && perRes.data) setPeriods(perRes.data);
    if (jrRes.success && jrRes.data) setJournals(jrRes.data);
  }, [selectedPeriodId]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) void loadAll();
    });
    return () => {
      active = false;
    };
  }, [loadAll]);

  const handleCreatePeriod = async () => {
    const fy = window.prompt('Financial Year Label (e.g., FY 2026-27):', 'FY 2026-27');
    if (!fy?.trim()) return;
    const name = window.prompt('Period Name (e.g., Annual FY 2026-27):', `Annual ${fy.trim()}`);
    if (!name?.trim()) return;
    const startDate = window.prompt('Start Date (YYYY-MM-DD):', '2026-04-01');
    const endDate = window.prompt('End Date (YYYY-MM-DD):', '2027-03-31');
    if (!startDate || !endDate) return;

    const res = await financeApiService.createPeriod({
      financialYearLabel: fy.trim(),
      periodName: name.trim(),
      startDate,
      endDate,
    });
    if (!res.success) setError(res.error?.message || 'Unable to create period');
    else {
      setNotice(`Opened accounting period ${name.trim()}.`);
      await loadAll();
    }
  };

  const handlePeriodAction = async (periodId: string, action: 'CLOSE' | 'LOCK' | 'REOPEN') => {
    const reason = window.prompt(`Reason to ${action} accounting period:`);
    if (!reason?.trim()) return;
    const res = await financeApiService.updatePeriodStatus({ periodId, action, reason: reason.trim() });
    if (!res.success) setError(res.error?.message || 'Period update failed');
    else {
      setNotice(`Period status updated (${action}).`);
      await loadAll();
    }
  };

  const handleCreateJournal = async (payload: Record<string, unknown>) => {
    setError(null);
    const res = await financeApiService.createJournal(payload);
    if (!res.success) throw new Error(res.error?.message || 'Failed to create journal');
    setNotice(`Created balanced journal ${res.data?.journal.journalNumber || ''}.`);
    await loadAll();
  };

  const handleApprove = async (id: string) => {
    setError(null);
    const res = await financeApiService.approveJournal(id, 'APPROVE');
    if (!res.success) setError(res.error?.message || 'Approval failed');
    else {
      setNotice('Journal entry approved.');
      await loadAll();
    }
  };

  const handlePost = async (id: string) => {
    setError(null);
    const res = await financeApiService.postJournal(id);
    if (!res.success) setError(res.error?.message || 'Posting failed');
    else {
      setNotice(`Journal posted to ledger. ${res.data?.transactionNote || ''}`);
      await loadAll();
    }
  };

  const handleReverse = async (id: string) => {
    const reason = window.prompt('Enter mandatory reversal reason (posted entries are immutable):');
    if (!reason?.trim()) return;
    setError(null);
    const res = await financeApiService.reverseJournal(id, reason.trim());
    if (!res.success) setError(res.error?.message || 'Reversal failed');
    else {
      setNotice(`Traceable reversal journal ${res.data?.reversalJournal.journalNumber || ''} posted.`);
      await loadAll();
    }
  };

  const handleSyncIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!syncSourceId.trim()) return;
    setError(null);
    const res = await financeApiService.syncIncomeEvent(syncType, syncSourceId.trim());
    if (!res.success) setError(res.error?.message || 'Ledger sync failed');
    else {
      setNotice(
        res.data?.idempotentReplay
          ? `Already synced (idempotent replay): ${res.data.journal.journalNumber}`
          : `Synced ${syncType} -> posted journal ${res.data?.journal.journalNumber}`
      );
      setSyncSourceId('');
      await loadAll();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Double-Entry Journal Entries & Accounting Periods"
        description="Create balanced DR = CR vouchers, enforce separation of approval and posting, reverse posted entries traceably, and lock closed periods."
        actions={
          <PermissionGate permission="finance.periods.manage">
            <button
              type="button"
              onClick={handleCreatePeriod}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#087F5B] px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
            >
              <CalendarPlus className="h-3.5 w-3.5" /> New Accounting Period
            </button>
          </PermissionGate>
        }
      />

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</div>}
      {notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">{notice}</div>}

      <AccountingPeriodSelector
        periods={periods}
        selectedPeriodId={selectedPeriodId}
        onSelect={setSelectedPeriodId}
        onPeriodAction={handlePeriodAction}
      />

      <PermissionGate permission="finance.income.manage">
        <form
          onSubmit={handleSyncIncome}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 shrink-0">
            <Link2 className="h-4 w-4 text-[#087F5B]" /> Idempotent Phase 08 Sync:
          </div>
          <select
            value={syncType}
            onChange={(e) => setSyncType(e.target.value as 'DONATION' | 'REFUND')}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs"
          >
            <option value="DONATION">Verified Donation</option>
            <option value="REFUND">Processed Refund</option>
          </select>
          <input
            type="text"
            placeholder="Paste Donation or Refund ObjectId"
            value={syncSourceId}
            onChange={(e) => setSyncSourceId(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs font-mono"
          />
          <button
            type="submit"
            className="rounded-xl bg-[#087F5B] px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
          >
            Sync to Ledger
          </button>
        </form>
      </PermissionGate>

      <PermissionGate permission="finance.journals.create">
        <JournalEntryForm accounts={accounts} onSubmit={handleCreateJournal} />
      </PermissionGate>

      <JournalEntryTable
        journals={journals}
        onApprove={handleApprove}
        onPost={handlePost}
        onReverse={handleReverse}
      />
    </div>
  );
}
