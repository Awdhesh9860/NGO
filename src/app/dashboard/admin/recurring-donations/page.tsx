'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/features/admin';
import {
  donationApiService,
  RecurringDonationItem,
  RecurringDonationPanel,
} from '@/features/donations';
import { Info, RefreshCw } from 'lucide-react';

export default function AdminRecurringDonationsPage() {
  const [items, setItems] = useState<RecurringDonationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await donationApiService.listRecurring();
      if (res.success && res.data) setItems(res.data);
      else setError(res.error?.message || 'Unable to load recurring plans');
    } catch {
      setError('Failed to connect to recurring donations API');
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

  const handleAction = async (id: string, action: 'PAUSE' | 'RESUME' | 'CANCEL') => {
    const res = await donationApiService.updateRecurring(id, { action });
    if (!res.success) setError(res.error?.message || 'Failed to update recurring mandate');
    else await loadData();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recurring Donations & Mandates"
        description="Manage provider-mandated MONTHLY, QUARTERLY, and YEARLY recurring donation subscriptions via Razorpay and Stripe."
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

      <div className="rounded-xl border border-sky-200 bg-sky-50/70 dark:border-sky-900/50 dark:bg-sky-950/30 p-3.5 text-xs text-sky-900 dark:text-sky-200 flex items-start gap-2.5">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <p>
          <strong>Zero Simulated Billing Guarantee:</strong> Recurring donations are strictly executed through authorized Razorpay or Stripe subscription mandates. When a provider charges a cycle, verified webhook callbacks create each official donation and receipt record.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700">
          {error}
        </div>
      )}

      <RecurringDonationPanel items={items} canManage onAction={handleAction} />
    </div>
  );
}
