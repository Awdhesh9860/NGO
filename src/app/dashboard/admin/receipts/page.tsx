'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader, EmptyState, PermissionGate } from '@/features/admin';
import {
  donationApiService,
  ReceiptRecordItem,
  DonationReceiptViewer,
} from '@/features/donations';
import { formatMinorCurrency } from '@/lib/money';
import { Ban, RefreshCw, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function AdminReceiptsPage() {
  const [receipts, setReceipts] = useState<ReceiptRecordItem[]>([]);
  const [selected, setSelected] = useState<ReceiptRecordItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReceipts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await donationApiService.listReceipts();
      if (res.success && res.data) {
        setReceipts(res.data);
        if (res.data.length > 0 && !selected) setSelected(res.data[0]);
      } else {
        setError(res.error?.message || 'Unable to load receipts');
      }
    } catch {
      setError('Failed to connect to receipts API');
    } finally {
      setLoading(false);
    }
  }, [selected]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) void loadReceipts();
    });
    return () => {
      active = false;
    };
  }, [loadReceipts]);

  const handleCancel = async (receiptId: string, reissue: boolean) => {
    const reason = window.prompt('Enter audited reason for cancelling this receipt:');
    if (!reason?.trim()) return;
    const res = await donationApiService.cancelReceipt(receiptId, reason.trim(), reissue);
    if (!res.success) setError(res.error?.message || 'Failed to cancel receipt');
    else {
      setSelected(null);
      await loadReceipts();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Official Donation Receipts & 80G/12A Compliance"
        description="Sequential organization-scoped receipt registry with strict verification gating for Section 80G / 12A tax-benefit disclosures."
        actions={
          <button
            type="button"
            onClick={loadReceipts}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs font-semibold"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        }
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700">
          {error}
        </div>
      )}

      {receipts.length === 0 && !loading ? (
        <EmptyState
          title="No donation receipts issued yet"
          description="Receipts are automatically or manually issued only after a donation is verified as SUCCESSFUL."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-2.5">
            {receipts.map((r) => (
              <button
                key={r._id}
                type="button"
                onClick={() => setSelected(r)}
                className={`w-full text-left rounded-2xl border p-4 transition ${
                  selected?._id === r._id
                    ? 'border-[#087F5B] bg-emerald-50/50 dark:bg-emerald-950/30'
                    : 'border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-mono font-black text-slate-900 dark:text-white">
                    {r.receiptNumber}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      r.status === 'ISSUED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {r.donorSnapshot.name} • {formatMinorCurrency(r.amountMinor, r.currency)}
                </div>
                <div className="mt-1.5 flex items-center gap-1.5 text-[10px]">
                  {r.taxBenefitEligible ? (
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400">
                      <ShieldCheck className="h-3 w-3" /> Verified 80G Eligible
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-300">
                      <AlertTriangle className="h-3 w-3" /> Standard Receipt (No 80G Claim)
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-3 space-y-3">
            {selected && (
              <>
                <DonationReceiptViewer receipt={selected} onPrint={() => window.print()} />
                {selected.status === 'ISSUED' && (
                  <PermissionGate permission="receipts.cancel">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleCancel(selected._id, false)}
                        className="inline-flex items-center gap-1 rounded-xl border border-rose-300 px-3 py-1.5 text-xs font-bold text-rose-700"
                      >
                        <Ban className="h-3.5 w-3.5" /> Cancel Receipt
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCancel(selected._id, true)}
                        className="inline-flex items-center gap-1 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white"
                      >
                        Cancel &amp; Reissue
                      </button>
                    </div>
                  </PermissionGate>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
