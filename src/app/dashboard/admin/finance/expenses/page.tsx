'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { PageHeader, PermissionGate } from '@/features/admin';
import {
  financeApiService,
  ExpenseApprovalPanel,
  ExpenseForm,
  ExpenseItem,
  VendorItem,
} from '@/features/finance';

export default function AdminExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [expRes, vndRes] = await Promise.all([
      financeApiService.listExpenses(statusFilter || undefined),
      financeApiService.listVendors().catch(() => ({ success: false, data: [] as VendorItem[] })),
    ]);
    if (expRes.success && expRes.data) setExpenses(expRes.data);
    if (vndRes.success && vndRes.data) setVendors(vndRes.data);
  }, [statusFilter]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) void loadData();
    });
    return () => {
      active = false;
    };
  }, [loadData]);

  const handleSubmitExpense = async (payload: Record<string, unknown>) => {
    setError(null);
    const res = await financeApiService.createExpense(payload);
    if (!res.success) throw new Error(res.error?.message || 'Submission failed');
    setNotice(`Submitted expense ${res.data?.expenseNumber || ''} for review.`);
    await loadData();
  };

  const handleApprove = async (id: string) => {
    setError(null);
    const comment = window.prompt('Optional approval comment:') || 'Approved within authorization threshold';
    const res = await financeApiService.decideExpenseApproval(id, {
      decision: 'APPROVED',
      stage: 'FINAL_APPROVAL',
      comment,
    });
    if (!res.success) setError(res.error?.message || 'Approval blocked');
    else {
      setNotice('Expense approved and ready for treasury payment.');
      await loadData();
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt('Enter mandatory rejection reason:');
    if (!reason?.trim()) return;
    setError(null);
    const res = await financeApiService.decideExpenseApproval(id, {
      decision: 'REJECTED',
      rejectionReason: reason.trim(),
    });
    if (!res.success) setError(res.error?.message || 'Rejection failed');
    else {
      setNotice('Expense rejected.');
      await loadData();
    }
  };

  const handlePay = async (id: string) => {
    const paymentReference = window.prompt('Enter UTR / Cheque / Payment Reference:');
    if (!paymentReference?.trim()) return;
    setError(null);
    const res = await financeApiService.payExpense(id, {
      paymentMethod: 'BANK_TRANSFER',
      paymentReference: paymentReference.trim(),
    });
    if (!res.success) setError(res.error?.message || 'Payment recording failed');
    else {
      setNotice(`Expense paid and posted to ledger (${res.data?.journal?.journalNumber || 'posted'}).`);
      await loadData();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expense Claims, Threshold Approvals & Disbursement"
        description="Enforces separation between expense submission, role-threshold approval (no self-approval), and payment ledger posting."
      />

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</div>}
      {notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">{notice}</div>}

      <PermissionGate permission="finance.expenses.create">
        <ExpenseForm vendors={vendors} onSubmit={handleSubmitExpense} />
      </PermissionGate>

      <div className="flex flex-wrap items-center gap-2">
        {['', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PAID', 'REJECTED'].map((st) => (
          <button
            key={st || 'ALL'}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold border ${
              statusFilter === st
                ? 'border-[#087F5B] bg-[#087F5B] text-white'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b]'
            }`}
          >
            {st || 'All Expenses'}
          </button>
        ))}
      </div>

      <ExpenseApprovalPanel
        expenses={expenses}
        onApprove={handleApprove}
        onReject={handleReject}
        onPay={handlePay}
      />
    </div>
  );
}
