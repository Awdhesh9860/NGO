'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader, EmptyState, PermissionGate } from '@/features/admin';
import {
  donationApiService,
  RefundRecordItem,
  RefundStatusTimeline,
} from '@/features/donations';
import { formatMinorCurrency } from '@/lib/money';
import { CheckCircle2, Play, RefreshCw, XCircle } from 'lucide-react';

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<RefundRecordItem[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadRefunds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await donationApiService.listRefunds(statusFilter || undefined);
      if (res.success && res.data) setRefunds(res.data);
      else setError(res.error?.message || 'Unable to load refunds');
    } catch {
      setError('Failed to connect to refunds API');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) void loadRefunds();
    });
    return () => {
      active = false;
    };
  }, [loadRefunds]);

  const handleDecision = async (id: string, decision: 'APPROVE' | 'REJECT') => {
    setError(null);
    setNotice(null);
    let rejectionReason: string | undefined;
    if (decision === 'REJECT') {
      const promptVal = window.prompt('Enter rejection reason:');
      if (!promptVal?.trim()) return;
      rejectionReason = promptVal.trim();
    }
    const res = await donationApiService.decideRefund(id, {
      decision,
      rejectionReason,
      processImmediately: false,
    });
    if (!res.success) setError(res.error?.message || 'Refund decision failed');
    else {
      setNotice(`Refund ${decision === 'APPROVE' ? 'approved' : 'rejected'}`);
      await loadRefunds();
    }
  };

  const handleProcess = async (id: string) => {
    setError(null);
    setNotice(null);
    const res = await donationApiService.processRefund(id);
    if (!res.success) setError(res.error?.message || 'Refund execution failed');
    else {
      setNotice('Refund executed and ledger updated');
      await loadRefunds();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Refund Management & Financial Approval Queue"
        description="Two-stage separation of duties: requesters cannot approve their own refunds. All partial and full refunds are capped at remaining verified balances."
        actions={
          <button
            type="button"
            onClick={loadRefunds}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs font-semibold"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        }
      />

      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#12221b] px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
        >
          <option value="">All Refund Statuses</option>
          {['REQUESTED', 'PENDING_APPROVAL', 'APPROVED', 'PROCESSING', 'SUCCESSFUL', 'FAILED', 'REJECTED'].map(
            (st) => (
              <option key={st} value={st}>
                {st.replace(/_/g, ' ')}
              </option>
            )
          )}
        </select>
      </div>

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

      {refunds.length === 0 && !loading ? (
        <EmptyState
          title="No refund requests found"
          description="Refund requests initiated from verified donation details appear here for authorized approval and execution."
        />
      ) : (
        <div className="space-y-4">
          {refunds.map((r) => {
            const donationCode =
              typeof r.donationId === 'object' && r.donationId
                ? r.donationId.donationCode
                : String(r.donationId);
            const requesterName =
              typeof r.requestedBy === 'object' && r.requestedBy ? r.requestedBy.name : 'Staff';
            return (
              <div
                key={r._id}
                className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-slate-900 dark:text-white">
                        {donationCode}
                      </span>
                      <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold">
                        {r.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {r.isPartial ? 'Partial Refund' : 'Full Refund'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{r.reason}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Requested by {requesterName} • Provider: {r.provider}
                      {r.providerRefundId ? ` • Ref: ${r.providerRefundId}` : ''}
                    </p>
                  </div>

                  <div className="text-right space-y-2">
                    <div className="text-lg font-black text-rose-600 dark:text-rose-400">
                      {formatMinorCurrency(r.amountMinor, r.currency)}
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      {['REQUESTED', 'PENDING_APPROVAL'].includes(r.status) && (
                        <PermissionGate permission="refunds.approve">
                          <button
                            type="button"
                            onClick={() => handleDecision(r._id, 'APPROVE')}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDecision(r._id, 'REJECT')}
                            className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-[11px] font-bold text-white"
                          >
                            <XCircle className="h-3.5 w-3.5" /> Reject
                          </button>
                        </PermissionGate>
                      )}
                      {r.status === 'APPROVED' && (
                        <PermissionGate permission="refunds.process">
                          <button
                            type="button"
                            onClick={() => handleProcess(r._id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#087F5B] px-3 py-1.5 text-[11px] font-bold text-white"
                          >
                            <Play className="h-3.5 w-3.5" /> Execute Refund
                          </button>
                        </PermissionGate>
                      )}
                    </div>
                  </div>
                </div>

                <RefundStatusTimeline history={r.history} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
