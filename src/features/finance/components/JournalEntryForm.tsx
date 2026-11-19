'use client';

import React, { useState } from 'react';
import { ChartOfAccountItem } from '../services/finance-api.service';
import { formatMinorCurrency, sumMinorUnits, toMinorUnits } from '@/lib/money';
import { Plus, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';

interface JournalEntryFormProps {
  accounts: ChartOfAccountItem[];
  onSubmit: (payload: {
    transactionDate: string;
    description: string;
    submitForApproval: boolean;
    lines: Array<{ accountId: string; debitMinor: number; creditMinor: number; description?: string }>;
  }) => Promise<void>;
}

interface DraftLine {
  accountId: string;
  side: 'DEBIT' | 'CREDIT';
  amountMajor: string;
  description: string;
}

export function JournalEntryForm({ accounts, onSubmit }: JournalEntryFormProps) {
  const [transactionDate, setTransactionDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [submitForApproval, setSubmitForApproval] = useState(true);
  const [lines, setLines] = useState<DraftLine[]>([
    { accountId: '', side: 'DEBIT', amountMajor: '', description: '' },
    { accountId: '', side: 'CREDIT', amountMajor: '', description: '' },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedLines = lines.map((l) => {
    const num = Number(l.amountMajor);
    const minor = Number.isFinite(num) && num > 0 ? toMinorUnits(num, 'INR') : 0;
    return {
      accountId: l.accountId,
      debitMinor: l.side === 'DEBIT' ? minor : 0,
      creditMinor: l.side === 'CREDIT' ? minor : 0,
      description: l.description || undefined,
    };
  });

  const totalDebit = sumMinorUnits(parsedLines.map((l) => l.debitMinor));
  const totalCredit = sumMinorUnits(parsedLines.map((l) => l.creditMinor));
  const isBalanced = totalDebit > 0 && totalDebit === totalCredit;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isBalanced) {
      setError('Double-entry rule: Total Debits must strictly equal Total Credits and be greater than zero.');
      return;
    }
    if (parsedLines.some((l) => !l.accountId)) {
      setError('Select an account for every journal line.');
      return;
    }
    try {
      setSubmitting(true);
      await onSubmit({
        transactionDate,
        description,
        submitForApproval,
        lines: parsedLines,
      });
      setDescription('');
      setLines([
        { accountId: '', side: 'DEBIT', amountMajor: '', description: '' },
        { accountId: '', side: 'CREDIT', amountMajor: '', description: '' },
      ]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create journal entry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSave}
      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] p-4 sm:p-5 space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">New Double-Entry Journal Voucher</h3>
        <div
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
            isBalanced
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
          }`}
        >
          {isBalanced ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
          DR {formatMinorCurrency(totalDebit)} / CR {formatMinorCurrency(totalCredit)}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Transaction Date
          </label>
          <input
            type="date"
            required
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Narration / Description
          </label>
          <input
            type="text"
            required
            minLength={3}
            placeholder="e.g., Monthly office rent allocation or bank transfer adjustment"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs"
          />
        </div>
      </div>

      <div className="space-y-2">
        {lines.map((line, idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center rounded-xl bg-slate-50 dark:bg-[#0d1a14] p-2.5"
          >
            <select
              required
              value={line.accountId}
              onChange={(e) =>
                setLines((prev) => prev.map((item, i) => (i === idx ? { ...item, accountId: e.target.value } : item)))
              }
              className="sm:col-span-5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12221b] px-2.5 py-2 text-xs"
            >
              <option value="">Select Account...</option>
              {accounts.map((acc) => (
                <option key={acc._id} value={acc._id}>
                  {acc.code} — {acc.name} ({acc.accountType})
                </option>
              ))}
            </select>

            <select
              value={line.side}
              onChange={(e) =>
                setLines((prev) =>
                  prev.map((item, i) =>
                    i === idx ? { ...item, side: e.target.value as 'DEBIT' | 'CREDIT' } : item
                  )
                )
              }
              className="sm:col-span-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12221b] px-2 py-2 text-xs font-bold"
            >
              <option value="DEBIT">DEBIT</option>
              <option value="CREDIT">CREDIT</option>
            </select>

            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="Amount (₹)"
              value={line.amountMajor}
              onChange={(e) =>
                setLines((prev) => prev.map((item, i) => (i === idx ? { ...item, amountMajor: e.target.value } : item)))
              }
              className="sm:col-span-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12221b] px-2.5 py-2 text-xs font-mono"
            />

            <input
              type="text"
              placeholder="Line memo (optional)"
              value={line.description}
              onChange={(e) =>
                setLines((prev) => prev.map((item, i) => (i === idx ? { ...item, description: e.target.value } : item)))
              }
              className="sm:col-span-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12221b] px-2.5 py-2 text-xs"
            />

            <div className="sm:col-span-1 flex justify-end">
              {lines.length > 2 && (
                <button
                  type="button"
                  onClick={() => setLines((prev) => prev.filter((_, i) => i !== idx))}
                  className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              setLines((prev) => [...prev, { accountId: '', side: 'CREDIT', amountMajor: '', description: '' }])
            }
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
          >
            <Plus className="h-3.5 w-3.5" /> Add Line
          </button>

          <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={submitForApproval}
              onChange={(e) => setSubmitForApproval(e.target.checked)}
              className="rounded border-slate-300 text-[#087F5B]"
            />
            Submit for approval
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting || !isBalanced}
          className="rounded-xl bg-[#087F5B] px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {submitting ? 'Saving...' : 'Create Balanced Journal'}
        </button>
      </div>
    </form>
  );
}
