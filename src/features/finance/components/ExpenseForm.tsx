'use client';

import React, { useState } from 'react';
import { toMinorUnits } from '@/lib/money';
import { VendorItem } from '../services/finance-api.service';

export const EXPENSE_CATEGORIES = [
  'Program Expenses',
  'Project Expenses',
  'Salaries and Personnel',
  'Travel and Transportation',
  'Training and Workshops',
  'Equipment',
  'Infrastructure',
  'Healthcare Supplies',
  'Educational Materials',
  'Administrative Expenses',
  'Communication and Marketing',
  'Utilities',
  'Other Expenses',
];

interface ExpenseFormProps {
  vendors?: VendorItem[];
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
}

export function ExpenseForm({ vendors = [], onSubmit }: ExpenseFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [amountMajor, setAmountMajor] = useState('');
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [vendorId, setVendorId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const amountNum = Number(amountMajor);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      setError('Enter a valid positive expense amount');
      return;
    }
    try {
      setSubmitting(true);
      await onSubmit({
        title,
        description,
        category,
        amountMinor: toMinorUnits(amountNum, 'INR'),
        currency: 'INR',
        expenseDate,
        vendorId: vendorId || undefined,
        paymentMethod,
        invoiceNumber: invoiceNumber || undefined,
        submitImmediately: true,
      });
      setTitle('');
      setDescription('');
      setAmountMajor('');
      setInvoiceNumber('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to submit expense');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] p-4 sm:p-5 space-y-4"
    >
      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Submit New Expense Claim</h3>
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Expense Title
          </label>
          <input
            type="text"
            required
            minLength={3}
            placeholder="e.g., School Learning Kits Procurement"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs"
          >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Amount (INR ₹)
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="0.00"
            value={amountMajor}
            onChange={(e) => setAmountMajor(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs font-mono"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Expense Date
          </label>
          <input
            type="date"
            required
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Vendor (Optional)
          </label>
          <select
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs"
          >
            <option value="">No Linked Vendor</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.vendorCode})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Invoice # & Method
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="INV-001"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-2.5 py-2 text-xs"
            />
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-2 py-2 text-xs"
            >
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="UPI">UPI</option>
              <option value="CHEQUE">Cheque</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
          Detailed Description & Justification
        </label>
        <textarea
          required
          minLength={5}
          rows={2}
          placeholder="Specify program/project purpose and receipt details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-[#087F5B] px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit for Approval'}
        </button>
      </div>
    </form>
  );
}
