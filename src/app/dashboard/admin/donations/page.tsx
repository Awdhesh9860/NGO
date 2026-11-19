'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, EmptyState } from '@/features/admin';
import {
  donationApiService,
  DonationRecordItem,
  DonationStatusBadge,
} from '@/features/donations';
import { formatMinorCurrency } from '@/lib/money';
import { RefreshCw, Search } from 'lucide-react';

export default function AdminDonationsPage() {
  const router = useRouter();
  const [donations, setDonations] = useState<DonationRecordItem[]>([]);
  const [status, setStatus] = useState('');
  const [provider, setProvider] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDonations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await donationApiService.listDonations({
        status: status || undefined,
        paymentProvider: provider || undefined,
        search: search || undefined,
        limit: 50,
      });
      if (res.success && res.data) setDonations(res.data);
      else setError(res.error?.message || 'Unable to load donations');
    } catch {
      setError('Failed to connect to donations API');
    } finally {
      setLoading(false);
    }
  }, [status, provider, search]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) void loadDonations();
    });
    return () => {
      active = false;
    };
  }, [loadDonations]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Donation Ledger"
        description="Verified, pending, failed, and refunded donations stored in integer minor currency units. Click any donation to verify manual transfers, issue receipts, or initiate refunds."
        actions={
          <button
            type="button"
            onClick={loadDonations}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs font-semibold"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        }
      />

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search donation code, payment ref, donor name or email..."
            className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#12221b] pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#12221b] px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
        >
          <option value="">All Statuses</option>
          {['INITIATED', 'PENDING', 'SUCCESSFUL', 'FAILED', 'CANCELLED', 'PARTIALLY_REFUNDED', 'REFUNDED'].map(
            (st) => (
              <option key={st} value={st}>
                {st.replace(/_/g, ' ')}
              </option>
            )
          )}
        </select>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#12221b] px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
        >
          <option value="">All Payment Methods</option>
          <option value="RAZORPAY">Razorpay</option>
          <option value="STRIPE">Stripe</option>
          <option value="UPI">UPI (Manual)</option>
          <option value="BANK_TRANSFER">Bank Transfer (Manual)</option>
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700">
          {error}
        </div>
      )}

      {donations.length === 0 && !loading ? (
        <EmptyState
          title="No donations recorded"
          description="Verified online payments and pending manual UPI/Bank transfers will appear here in real time."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b]">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#162720] text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Donor</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Receipt</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1d332b]">
              {donations.map((d) => (
                <tr
                  key={d._id}
                  onClick={() => router.push(`/dashboard/admin/donations/${d._id}`)}
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-[#172b22]"
                >
                  <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                    {d.donationCode}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {d.donorSnapshot.name}
                    </div>
                    <div className="text-[11px] text-slate-500">{d.donorSnapshot.email}</div>
                  </td>
                  <td className="px-4 py-3 font-black text-slate-900 dark:text-white">
                    {formatMinorCurrency(d.amountMinor, d.currency)}
                    {d.refundedAmountMinor > 0 && (
                      <div className="text-[10px] font-semibold text-rose-600">
                        Refunded: {formatMinorCurrency(d.refundedAmountMinor, d.currency)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{d.paymentProvider}</td>
                  <td className="px-4 py-3">
                    <DonationStatusBadge status={d.status} />
                  </td>
                  <td className="px-4 py-3 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    {d.receiptStatus}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(d.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
