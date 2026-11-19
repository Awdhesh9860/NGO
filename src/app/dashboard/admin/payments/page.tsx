'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, PermissionGate } from '@/features/admin';
import {
  donationApiService,
  PaymentMonitoringOverview,
  PaymentStatusPanel,
  DonationStatusBadge,
} from '@/features/donations';
import { formatMinorCurrency } from '@/lib/money';
import { RefreshCw, ShieldCheck } from 'lucide-react';

export default function AdminPaymentsMonitoringPage() {
  const router = useRouter();
  const [overview, setOverview] = useState<PaymentMonitoringOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await donationApiService.getPaymentMonitoring();
      if (res.success && res.data) setOverview(res.data);
      else setError(res.error?.message || 'Unable to load payment monitoring data');
    } catch {
      setError('Failed to connect to payments status service');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) void loadData();
    });
    return () => {
      active = false;
    };
  }, [loadData]);

  const handleReconcile = async (donationId: string) => {
    setError(null);
    setNotice(null);
    const res = await donationApiService.reconcilePayment(donationId);
    if (!res.success) setError(res.error?.message || 'Reconciliation failed');
    else {
      setNotice('Reconciliation completed against payment gateway');
      await loadData();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Gateway Monitoring & Reconciliation"
        description="Honest provider configuration status, cryptographic webhook event log, immutable transaction ledger, and pending reconciliation queue."
        actions={
          <button
            type="button"
            onClick={loadData}
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
      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800">
          {notice}
        </div>
      )}

      {overview && <PaymentStatusPanel providers={overview.providers} />}

      {/* Pending Verification / Reconciliation Queue */}
      <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-black text-slate-900 dark:text-white">
          Pending Payments Queue (Manual Verification &amp; Gateway Reconciliation)
        </h3>
        {!overview?.pendingManualAndGateway?.length ? (
          <p className="text-xs text-slate-500">No pending payments awaiting action.</p>
        ) : (
          <div className="space-y-2">
            {overview.pendingManualAndGateway.map((d) => {
              const isManual = d.paymentProvider === 'UPI' || d.paymentProvider === 'BANK_TRANSFER';
              return (
                <div
                  key={d._id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 dark:border-[#1d332b] p-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {d.donationCode} • {d.donorSnapshot.name} ({formatMinorCurrency(d.amountMinor, d.currency)})
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {d.paymentProvider} • Order: {d.providerOrderId || '—'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DonationStatusBadge status={d.status} />
                    {isManual ? (
                      <button
                        type="button"
                        onClick={() => router.push(`/dashboard/admin/donations/${d._id}`)}
                        className="rounded-lg bg-amber-600 px-3 py-1.5 text-[11px] font-bold text-white"
                      >
                        Review Manual Proof
                      </button>
                    ) : (
                      <PermissionGate permission="payments.reconcile">
                        <button
                          type="button"
                          onClick={() => handleReconcile(d._id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#087F5B] px-3 py-1.5 text-[11px] font-bold text-white"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" /> Reconcile Gateway
                        </button>
                      </PermissionGate>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Webhook Events & Recent Transactions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-black text-slate-900 dark:text-white">
            Verified Webhook Event Log (Idempotent)
          </h3>
          {!overview?.recentWebhooks?.length ? (
            <p className="text-xs text-slate-500">No webhook events received yet.</p>
          ) : (
            <div className="space-y-2">
              {overview.recentWebhooks.map((w) => (
                <div
                  key={w._id}
                  className="rounded-xl border border-slate-100 dark:border-[#1d332b] p-3 text-xs flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 dark:text-white truncate">
                      {w.provider} • {w.eventType}
                    </div>
                    <div className="font-mono text-[10px] text-slate-400 truncate">
                      {w.providerEventId}
                    </div>
                  </div>
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold shrink-0">
                    {w.processingStatus}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-black text-slate-900 dark:text-white">
            Recent Immutable Payment Transactions
          </h3>
          {!overview?.recentTransactions?.length ? (
            <p className="text-xs text-slate-500">No payment transactions logged yet.</p>
          ) : (
            <div className="space-y-2">
              {overview.recentTransactions.map((t) => (
                <div
                  key={t._id}
                  className="rounded-xl border border-slate-100 dark:border-[#1d332b] p-3 text-xs flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {t.provider} • {t.status}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {t.eventSource} • Sig: {t.signatureVerified ? 'OK' : 'N/A'}
                    </div>
                  </div>
                  <div className="text-right font-bold">
                    {formatMinorCurrency(t.amountMinor, t.currency)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
