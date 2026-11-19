'use client';

import React, { useState } from 'react';
import { formatMinorCurrency, fromMinorUnits, toMinorUnits } from '@/lib/money';
import { donationApiService } from '../services/donation-api.service';

export interface RefundRequestDialogProps {
  donationId: string;
  donationCode: string;
  remainingRefundableMinor: number;
  currency?: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function RefundRequestDialog({
  donationId,
  donationCode,
  remainingRefundableMinor,
  currency = 'INR',
  onSuccess,
  onClose,
}: RefundRequestDialogProps) {
  const [amountMajor, setAmountMajor] = useState(
    String(fromMinorUnits(remainingRefundableMinor, currency))
  );
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const amountMinor = toMinorUnits(Number(amountMajor), currency);
    if (amountMinor <= 0 || amountMinor > remainingRefundableMinor) {
      setError(
        `Refund must be between 0.01 and ${formatMinorCurrency(remainingRefundableMinor, currency)}`
      );
      return;
    }

    try {
      setSubmitting(true);
      const idempotencyKey = `ref-${donationId}-${Date.now()}`;
      const res = await donationApiService.requestRefund({
        donationId,
        amountMinor,
        reason: reason.trim(),
        idempotencyKey,
      });
      if (!res.success) {
        setError(res.error?.message || 'Failed to submit refund request');
        return;
      }
      onSuccess();
    } catch {
      setError('Network error submitting refund request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6 shadow-xl">
        <h3 className="text-base font-black text-slate-900 dark:text-white">
          Request Refund — {donationCode}
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Maximum refundable balance: <strong>{formatMinorCurrency(remainingRefundableMinor, currency)}</strong>. A separate approver with <code>refunds.approve</code> must review this request.
        </p>

        {error && (
          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
              Refund Amount ({currency}) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={fromMinorUnits(remainingRefundableMinor, currency)}
              required
              value={amountMajor}
              onChange={(e) => setAmountMajor(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
              Refund Reason (Audited) *
            </label>
            <textarea
              rows={3}
              required
              minLength={5}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Duplicate payment reported by donor..."
              className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50 transition"
            >
              {submitting ? 'Submitting...' : 'Submit Refund Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
