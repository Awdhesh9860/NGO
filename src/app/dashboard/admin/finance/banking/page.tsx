'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { PageHeader, PermissionGate } from '@/features/admin';
import {
  financeApiService,
  BankAccountCard,
  BankAccountItem,
  BankReconciliationTable,
  BankTransactionItem,
} from '@/features/finance';
import { toMinorUnits } from '@/lib/money';
import { Plus, Upload, CheckSquare } from 'lucide-react';

export default function AdminBankingReconciliationPage() {
  const [accounts, setAccounts] = useState<BankAccountItem[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<BankAccountItem | null>(null);
  const [transactions, setTransactions] = useState<BankTransactionItem[]>([]);

  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [openingMajor, setOpeningMajor] = useState('0');
  const [csvContent, setCsvContent] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    const res = await financeApiService.listBankAccounts();
    if (res.success && res.data) setAccounts(res.data);
  }, []);

  const loadTransactions = useCallback(async (bankAccountId: string) => {
    const res = await financeApiService.listBankTransactions(bankAccountId);
    if (res.success && res.data) setTransactions(res.data);
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

  const handleSelectAccount = (acc: BankAccountItem) => {
    setSelectedAccount(acc);
    void loadTransactions(acc.id);
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const openNum = Number(openingMajor) || 0;
    const res = await financeApiService.createBankAccount({
      accountName,
      bankName,
      accountNumber,
      ifscCode: ifscCode || undefined,
      openingBalanceMinor: toMinorUnits(openNum, 'INR'),
    });
    if (!res.success) setError(res.error?.message || 'Unable to register bank account');
    else {
      setNotice(`Bank account "${accountName}" registered (encrypted & masked as ${res.data?.accountNumberMasked}).`);
      setAccountName('');
      setBankName('');
      setAccountNumber('');
      setIfscCode('');
      setOpeningMajor('0');
      await loadAccounts();
    }
  };

  const handleImportCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount || !csvContent.trim()) return;
    setError(null);
    const res = await financeApiService.importBankStatement(selectedAccount.id, csvContent);
    if (!res.success) setError(res.error?.message || 'CSV statement import failed');
    else {
      setNotice(
        `Imported ${res.data?.importedCount ?? 0} row(s), skipped ${res.data?.duplicatesSkipped ?? 0} duplicate(s). ${res.data?.note || ''}`
      );
      setCsvContent('');
      await loadTransactions(selectedAccount.id);
    }
  };

  const handleMatch = async (txn: BankTransactionItem) => {
    const matchedEntityType = window.prompt(
      'Enter entity type (DONATION, EXPENSE, VENDOR_BILL, JOURNAL_ENTRY, GRANT):',
      txn.creditMinor > 0 ? 'DONATION' : 'EXPENSE'
    );
    if (!matchedEntityType?.trim()) return;
    const matchedEntityId = window.prompt('Enter matched record ID / Reference:');
    if (!matchedEntityId?.trim()) return;
    setError(null);
    const res = await financeApiService.reconcile({
      action: 'MATCH',
      transactionId: txn._id,
      matchedEntityType: matchedEntityType.trim().toUpperCase(),
      matchedEntityId: matchedEntityId.trim(),
    });
    if (!res.success) setError(res.error?.message || 'Match failed');
    else if (selectedAccount) {
      setNotice('Statement row manually matched.');
      await loadTransactions(selectedAccount.id);
    }
  };

  const handleFlag = async (txn: BankTransactionItem) => {
    const note = window.prompt('Describe discrepancy for investigation:');
    if (!note?.trim()) return;
    const res = await financeApiService.reconcile({
      action: 'DISCREPANCY',
      transactionId: txn._id,
      note: note.trim(),
    });
    if (!res.success) setError(res.error?.message || 'Unable to flag discrepancy');
    else if (selectedAccount) {
      setNotice('Statement row flagged as discrepancy.');
      await loadTransactions(selectedAccount.id);
    }
  };

  const handleFinalizeSession = async () => {
    if (!selectedAccount) return;
    const closingMajor = window.prompt('Enter statement closing balance (₹):');
    if (!closingMajor?.trim()) return;
    const num = Number(closingMajor);
    if (!Number.isFinite(num)) return;
    const today = new Date().toISOString().slice(0, 10);
    const res = await financeApiService.reconcile({
      action: 'FINALIZE_SESSION',
      bankAccountId: selectedAccount.id,
      statementFromDate: '2026-04-01',
      statementToDate: today,
      statementClosingBalanceMinor: toMinorUnits(num, selectedAccount.currency),
    });
    if (!res.success) setError(res.error?.message || 'Reconciliation session failed');
    else {
      setNotice('Reconciliation session recorded. Accounts remain Provisional until zero unmatched rows & zero variance.');
      await loadAccounts();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bank Accounts & Statement Reconciliation"
        description="Encrypted bank registry (masked account numbers), CSV statement import with duplicate detection, and explicit manual reconciliation. No automated bank API connectivity is assumed."
      />

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</div>}
      {notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">{notice}</div>}

      <PermissionGate permission="finance.bank_accounts.manage">
        <form
          onSubmit={handleCreateAccount}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3"
        >
          <input
            type="text"
            required
            placeholder="Account Label (e.g. Main Operations)"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs"
          />
          <input
            type="text"
            required
            placeholder="Bank Name"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs"
          />
          <input
            type="password"
            required
            placeholder="Account # (AES-256 Encrypted)"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs"
          />
          <input
            type="text"
            placeholder="IFSC Code"
            value={ifscCode}
            onChange={(e) => setIfscCode(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs font-mono"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Opening Balance (₹)"
            value={openingMajor}
            onChange={(e) => setOpeningMajor(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs font-mono"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1 rounded-xl bg-[#087F5B] px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
          >
            <Plus className="h-3.5 w-3.5" /> Add Bank Account
          </button>
        </form>
      </PermissionGate>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accounts.map((acc) => (
          <BankAccountCard
            key={acc.id}
            account={acc}
            isSelected={selectedAccount?.id === acc.id}
            onSelect={handleSelectAccount}
          />
        ))}
      </div>

      {selectedAccount && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Reconciling: {selectedAccount.accountName} ({selectedAccount.accountNumberMasked})
            </h3>
            <PermissionGate permission="finance.reconciliation.manage">
              <button
                type="button"
                onClick={handleFinalizeSession}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#087F5B] px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
              >
                <CheckSquare className="h-3.5 w-3.5" /> Record Reconciliation Session
              </button>
            </PermissionGate>
          </div>

          <PermissionGate permission="finance.reconciliation.manage">
            <form
              onSubmit={handleImportCsv}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] p-4 space-y-3"
            >
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                Import Bank Statement CSV (Columns: Date, Description, Reference, Debit, Credit, Balance)
              </label>
              <textarea
                rows={4}
                placeholder={'Date,Description,Reference,Debit,Credit,Balance\n2026-11-01,Donation Settlement,UTR12345,0,25000,125000'}
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] p-3 text-xs font-mono"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#087F5B] px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  <Upload className="h-3.5 w-3.5" /> Validate & Import Statement Rows
                </button>
              </div>
            </form>
          </PermissionGate>

          <BankReconciliationTable
            transactions={transactions}
            onMatch={handleMatch}
            onFlagDiscrepancy={handleFlag}
          />
        </div>
      )}
    </div>
  );
}
