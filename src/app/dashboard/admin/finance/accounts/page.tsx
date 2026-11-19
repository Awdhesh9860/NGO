'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { PageHeader, PermissionGate } from '@/features/admin';
import {
  financeApiService,
  ChartOfAccountItem,
  ChartOfAccountsTree,
} from '@/features/finance';
import { Plus, Sparkles } from 'lucide-react';

export default function AdminChartOfAccountsPage() {
  const [accounts, setAccounts] = useState<ChartOfAccountItem[]>([]);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState<ChartOfAccountItem['accountType']>('EXPENSE');
  const [category, setCategory] = useState('Program Expenses');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    const res = await financeApiService.listAccounts(true);
    if (res.success && res.data) setAccounts(res.data);
    else setError(res.error?.message || 'Unable to load Chart of Accounts');
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) void loadAccounts();
    });
    return () => {
      active = false;
    };
  }, [loadAccounts]);

  const handleSeed = async () => {
    setError(null);
    const res = await financeApiService.seedDefaultAccounts();
    if (!res.success) setError(res.error?.message || 'Seeding failed');
    else {
      setNotice(`Seeded ${res.data?.createdCount ?? 0} standard NGO accounts.`);
      await loadAccounts();
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await financeApiService.createAccount({ code, name, accountType, category, description });
    if (!res.success) setError(res.error?.message || 'Failed to create account');
    else {
      setNotice(`Account ${code.toUpperCase()} created.`);
      setCode('');
      setName('');
      setDescription('');
      await loadAccounts();
    }
  };

  const handleToggle = async (acc: ChartOfAccountItem) => {
    const res = await financeApiService.updateAccount(acc._id, { isActive: !acc.isActive });
    if (!res.success) setError(res.error?.message || 'Update failed');
    else await loadAccounts();
  };

  const handleDelete = async (acc: ChartOfAccountItem) => {
    const res = await financeApiService.deleteAccount(acc._id);
    if (!res.success) setError(res.error?.message || 'Cannot delete account');
    else {
      setNotice(`Deleted unused account ${acc.code}`);
      await loadAccounts();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chart of Accounts"
        description="Hierarchical, organization-scoped accounting structure with system account protection and posted-transaction deletion guards."
        actions={
          <PermissionGate permission="finance.accounts.manage">
            <button
              type="button"
              onClick={handleSeed}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#087F5B] px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
            >
              <Sparkles className="h-3.5 w-3.5" /> Seed Standard NGO Accounts
            </button>
          </PermissionGate>
        }
      />

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</div>}
      {notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">{notice}</div>}

      <PermissionGate permission="finance.accounts.manage">
        <form
          onSubmit={handleCreate}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
        >
          <input
            type="text"
            required
            placeholder="Code (e.g. 5120)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs font-mono"
          />
          <input
            type="text"
            required
            placeholder="Account Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs"
          />
          <select
            value={accountType}
            onChange={(e) => setAccountType(e.target.value as ChartOfAccountItem['accountType'])}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs"
          >
            <option value="ASSET">ASSET</option>
            <option value="LIABILITY">LIABILITY</option>
            <option value="EQUITY">EQUITY</option>
            <option value="INCOME">INCOME</option>
            <option value="EXPENSE">EXPENSE</option>
          </select>
          <input
            type="text"
            required
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1 rounded-xl bg-[#087F5B] px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
          >
            <Plus className="h-3.5 w-3.5" /> Add Account
          </button>
        </form>
      </PermissionGate>

      <ChartOfAccountsTree accounts={accounts} onToggleActive={handleToggle} onDelete={handleDelete} />
    </div>
  );
}
