'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader, PermissionGate } from '@/features/admin';
import {
  donationApiService,
  DonationRecordItem,
  ReceiptRecordItem,
  RefundRecordItem,
  DonationStatusBadge,
  DonationReceiptViewer,
  RefundRequestDialog,
  RefundStatusTimeline,
} from '@/features/donations';
import { formatMinorCurrency, subtractMinorUnits } from '@/lib/money';
import { ArrowLeft, CheckCircle2, FileText, RotateCcw, XCircle } from 'lucide-react';

export default function AdminDonationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const donationId = String(params?.id || '');

  const [data, setData] = useState<{
    donation: DonationRecordItem;
    transactions: Array<{
      _id: string;
      provider: string;
      providerPaymentId?: string;
      amountMinor: number;
      currency: string;
      status: string;
      signatureVerified: boolean;
      eventSource: string;
      failureReason?: string;
      createdAt: string;
    }>;
    attempts: Array<{ _id: string; attemptNumber: number; status: string; provider: string; createdAt: string }>;
    receipts: ReceiptRecordItem[];
    refunds: RefundRecordItem[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [manualRef, setManualRef] = useState('');
  const [showRefundModal, setShowRefundModal] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!donationId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await donationApiService.getDonationDetail(donationId);
      if (res.success && res.data) {
        setData(res.data);
        setManualRef(res.data.donation.paymentReference || '');
      } else {
        setError(res.error?.message || 'Donation not found');
      }
    } catch {
      setError('Failed to fetch donation details');
    } finally {
      setLoading(false);
    }
  }, [donationId]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) void loadDetail();
    });
    return () => {
      active = false;
    };
  }, [loadDetail]);

  const handleManualDecision = async (decision: 'APPROVE' | 'REJECT') => {
    setError(null);
    setNotice(null);
    let rejectionReason: string | undefined;
    if (decision === 'REJECT') {
      const input = window.prompt('Enter rejection reason for this manual transfer:');
      if (!input?.trim()) return;
      rejectionReason = input.trim();
    }

    const res = await donationApiService.verifyManualDonation(donationId, {
      decision,
      paymentReference: manualRef.trim() || undefined,
      rejectionReason,
    });
    if (!res.success) {
      setError(res.error?.message || 'Verification action failed');
    } else {
      setNotice(
        decision === 'APPROVE'
          ? 'Manual donation verified as SUCCESSFUL'
          : 'Manual donation marked FAILED/REJECTED'
      );
      await loadDetail();
    }
  };

  const handleIssueReceipt = async () => {
    setError(null);
    const res = await donationApiService.issueReceipt(donationId);
    if (!res.success) {
      setError(res.error?.message || 'Failed to issue receipt');
    } else {
      setNotice('Official donation receipt issued');
      await loadDetail();
    }
  };

  if (loading) {
    return <div className="h-64 rounded-2xl bg-slate-100 dark:bg-[#162720] animate-pulse" />;
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => router.push('/dashboard/admin/donations')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Donations
        </button>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
          {error || 'Donation not found'}
        </div>
      </div>
    );
  }

  const { donation, transactions, receipts, refunds } = data;
  const remainingRefundable = subtractMinorUnits(donation.amountMinor, donation.refundedAmountMinor);
  const isManualPending =
    (donation.paymentProvider === 'UPI' || donation.paymentProvider === 'BANK_TRANSFER') &&
    ['INITIATED', 'PENDING'].includes(donation.status);
  const activeReceipt = receipts.find((r) => r.status === 'ISSUED') || receipts[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Donation ${donation.donationCode}`}
        description={`${donation.donorSnapshot.name} (${donation.donorSnapshot.email}) • ${donation.purpose}`}
        actions={
          <button
            type="button"
            onClick={() => router.push('/dashboard/admin/donations')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs font-semibold"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Donations
          </button>
        }
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700">
          {error}
        </div>
      )}
      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800">
          {notice}
        </div>
      )}

      {/* Summary & Action Bar */}
      <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {formatMinorCurrency(donation.amountMinor, donation.currency)}
              </span>
              <DonationStatusBadge status={donation.status} />
            </div>
            <p className="text-xs text-slate-500">
              Provider: <strong>{donation.paymentProvider}</strong> • Ref:{' '}
              <span className="font-mono">{donation.paymentReference || donation.providerOrderId || '—'}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {['SUCCESSFUL', 'PARTIALLY_REFUNDED'].includes(donation.status) && !activeReceipt && (
              <PermissionGate permission="receipts.issue">
                <button
                  type="button"
                  onClick={handleIssueReceipt}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#087F5B] px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  <FileText className="h-3.5 w-3.5" /> Issue Official Receipt
                </button>
              </PermissionGate>
            )}

            {['SUCCESSFUL', 'PARTIALLY_REFUNDED'].includes(donation.status) && remainingRefundable > 0 && (
              <PermissionGate permission="refunds.request">
                <button
                  type="button"
                  onClick={() => setShowRefundModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Request Refund
                </button>
              </PermissionGate>
            )}
          </div>
        </div>

        {/* Manual UPI / Bank Transfer Verification Panel */}
        {isManualPending && (
          <PermissionGate permission="donations.verify">
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/30 p-4 space-y-3">
              <h4 className="text-xs font-black text-amber-900 dark:text-amber-200">
                Pending Manual {donation.paymentProvider} Verification
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300">
                Confirm the bank statement / UTR settlement reference before marking this donation SUCCESSFUL.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={manualRef}
                  onChange={(e) => setManualRef(e.target.value)}
                  placeholder="Verified UTR / Bank Reference"
                  className="flex-1 min-w-[200px] rounded-xl border border-amber-300 bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => handleManualDecision('APPROVE')}
                  className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Verify & Confirm
                </button>
                <button
                  type="button"
                  onClick={() => handleManualDecision('REJECT')}
                  className="inline-flex items-center gap-1 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-rose-700"
                >
                  <XCircle className="h-3.5 w-3.5" /> Reject Transfer
                </button>
              </div>
            </div>
          </PermissionGate>
        )}
      </div>

      {/* Receipt Preview */}
      {activeReceipt && (
        <DonationReceiptViewer receipt={activeReceipt} onPrint={() => window.print()} />
      )}

      {/* Immutable Payment Ledger & Refunds */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-black text-slate-900 dark:text-white">
            Immutable Payment Transactions
          </h3>
          {transactions.length === 0 ? (
            <p className="text-xs text-slate-500">No transaction records logged yet.</p>
          ) : (
            <div className="space-y-2.5">
              {transactions.map((t) => (
                <div
                  key={t._id}
                  className="rounded-xl border border-slate-100 dark:border-[#1d332b] p-3 text-xs flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {t.status} • <span className="text-[11px] font-semibold text-slate-500">{t.eventSource}</span>
                    </div>
                    <div className="font-mono text-[10px] text-slate-400">
                      {t.providerPaymentId || '—'} • Signature: {t.signatureVerified ? 'VERIFIED' : 'UNVERIFIED'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatMinorCurrency(t.amountMinor, t.currency)}</div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(t.createdAt).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-black text-slate-900 dark:text-white">Refund History</h3>
          {refunds.length === 0 ? (
            <p className="text-xs text-slate-500">No refund requests associated with this donation.</p>
          ) : (
            <div className="space-y-4">
              {refunds.map((r) => (
                <div key={r._id} className="rounded-xl border border-slate-100 dark:border-[#1d332b] p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-slate-900 dark:text-white">
                      {formatMinorCurrency(r.amountMinor, r.currency)} ({r.isPartial ? 'Partial' : 'Full'})
                    </span>
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold">
                      {r.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{r.reason}</p>
                  <RefundStatusTimeline history={r.history} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showRefundModal && (
        <RefundRequestDialog
          donationId={donation._id}
          donationCode={donation.donationCode}
          remainingRefundableMinor={remainingRefundable}
          currency={donation.currency}
          onSuccess={() => {
            setShowRefundModal(false);
            setNotice('Refund request submitted for approval');
            loadDetail();
          }}
          onClose={() => setShowRefundModal(false)}
        />
      )}
    </div>
  );
}
