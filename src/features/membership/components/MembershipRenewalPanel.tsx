'use client';

import React, { useState } from 'react';
import {
  MemberRecordItem,
  MembershipRenewalItem,
  membershipApiService,
} from '../services/membership-api.service';
import { formatMinorCurrency } from '@/lib/money';
import { RefreshCw } from 'lucide-react';

export function MembershipRenewalPanel({
  member,
  renewals,
  canRenew = false,
  onRenewed,
}: {
  member: MemberRecordItem;
  renewals: MembershipRenewalItem[];
  canRenew?: boolean;
  onRenewed?: () => void;
}) {
  const [paymentStatus, setPaymentStatus] = useState<'NOT_REQUIRED' | 'PENDING' | 'PAID' | 'WAIVED'>(
    member.feeAmountMinor === 0 ? 'NOT_REQUIRED' : 'PAID'
  );
  const [paymentReference, setPaymentReference] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRenew = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setSubmitting(true);
      const res = await membershipApiService.processRenewal(member._id, {
        paymentStatus,
        paymentReference: paymentReference.trim() || undefined,
        notes: notes.trim() || undefined,
        approveAndComplete: paymentStatus !== 'PENDING',
      });
      if (!res.success) {
        setError(res.error?.message || 'Unable to process renewal');
        return;
      }
      setPaymentReference('');
      setNotes('');
      onRenewed?.();
    } catch {
      setError('Network error processing membership renewal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs space-y-4">
      <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
        <RefreshCw className="h-4 w-4 text-emerald-600" /> Membership Renewal Workflow
      </h3>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          {error}
        </div>
      )}

      {canRenew && !member.isLifetime && !['CANCELLED', 'SUSPENDED'].includes(member.status) && (
        <form onSubmit={handleRenew} className="grid grid-cols-1 gap-3 sm:grid-cols-3 border-b border-slate-100 dark:border-[#1d332b] pb-4">
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as typeof paymentStatus)}
            className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs text-slate-900 dark:text-white"
          >
            <option value="PAID">Fee Confirmed (PAID)</option>
            <option value="WAIVED">Fee Waived (WAIVED)</option>
            <option value="PENDING">Request Only (PENDING Fee)</option>
            <option value="NOT_REQUIRED">No Fee Required</option>
          </select>
          <input
            type="text"
            placeholder="Fee Payment Reference (if paid)"
            value={paymentReference}
            onChange={(e) => setPaymentReference(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs text-slate-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-[#087F5B] px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {submitting ? 'Processing...' : 'Record Renewal'}
          </button>
        </form>
      )}

      {renewals.length === 0 ? (
        <p className="text-xs text-slate-500">No renewal history recorded yet.</p>
      ) : (
        <div className="space-y-2">
          {renewals.map((r) => (
            <div
              key={r._id}
              className="rounded-xl border border-slate-100 dark:border-[#1d332b] p-3 text-xs flex items-center justify-between gap-2"
            >
              <div>
                <div className="font-bold text-slate-900 dark:text-white">
                  {r.status} • {r.paymentStatus}
                </div>
                <div className="text-[11px] text-slate-500">
                  Valid until:{' '}
                  {r.newExpiryDate
                    ? new Date(r.newExpiryDate).toLocaleDateString('en-IN')
                    : 'Lifetime'}
                </div>
              </div>
              <div className="font-bold text-emerald-700 dark:text-emerald-400">
                {formatMinorCurrency(r.feeAmountMinor, r.currency)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
