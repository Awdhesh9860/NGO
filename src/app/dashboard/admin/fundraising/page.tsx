'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/features/admin';
import {
  donationApiService,
  FundraisingAnalyticsData,
  FundraisingStatCard,
  FundraisingTrendChart,
  PaymentStatusPanel,
} from '@/features/donations';
import { formatMinorCurrency } from '@/lib/money';
import {
  HandCoins,
  Clock,
  RotateCcw,
  Users,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';

export default function AdminFundraisingAnalyticsPage() {
  const [data, setData] = useState<FundraisingAnalyticsData | null>(null);
  const [granularity, setGranularity] = useState<'monthly' | 'daily' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await donationApiService.getFundraisingAnalytics();
      if (res.success && res.data) setData(res.data);
      else setError(res.error?.message || 'Unable to load fundraising analytics');
    } catch {
      setError('Failed to connect to analytics service');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) void loadAnalytics();
    });
    return () => {
      active = false;
    };
  }, [loadAnalytics]);

  const currency = data?.currency || 'INR';
  const trendPoints = data?.trends?.[granularity] || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fundraising & Financial Analytics"
        description="Real integer minor-unit MongoDB aggregations distinguishing gross verified donations, pending transfers, refunds, and net revenue."
        actions={
          <button
            type="button"
            onClick={loadAnalytics}
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

      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FundraisingStatCard
          title="Net Verified Donations"
          amountMinor={data?.overview.netDonationsMinor ?? 0}
          currency={currency}
          subtitle={`Gross ${formatMinorCurrency(
            data?.overview.grossSuccessfulMinor ?? 0,
            currency
          )} (${data?.overview.successfulDonationCount ?? 0} verified)`}
          accent="emerald"
          icon={<HandCoins className="h-5 w-5" />}
        />
        <FundraisingStatCard
          title="Pending Verification"
          amountMinor={data?.overview.pendingAmountMinor ?? 0}
          currency={currency}
          subtitle={`${data?.overview.pendingDonationCount ?? 0} pending (excluded from net totals)`}
          accent="amber"
          icon={<Clock className="h-5 w-5" />}
        />
        <FundraisingStatCard
          title="Total Refunded"
          amountMinor={data?.overview.refundedAmountMinor ?? 0}
          currency={currency}
          subtitle={`Avg verified gift: ${formatMinorCurrency(
            data?.overview.averageDonationMinor ?? 0,
            currency
          )}`}
          accent="rose"
          icon={<RotateCcw className="h-5 w-5" />}
        />
        <FundraisingStatCard
          title="Donor Retention"
          rawValue={`${data?.donorInsights.retentionPercentage ?? 0}%`}
          subtitle={`${data?.donorInsights.repeatDonors ?? 0} repeat • ${data?.donorInsights.firstTimeDonors ?? 0} first-time • ${data?.donorInsights.majorDonors ?? 0} major`}
          accent="sky"
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      {/* Trend Chart with Granularity Switcher */}
      <div className="space-y-2">
        <div className="flex items-center justify-end gap-1.5">
          {(['daily', 'monthly', 'yearly'] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGranularity(g)}
              className={`rounded-lg px-3 py-1 text-xs font-bold capitalize transition ${
                granularity === g
                  ? 'bg-[#087F5B] text-white'
                  : 'border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#12221b] text-slate-600 dark:text-slate-300'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <FundraisingTrendChart
          title={`Net Verified Donation Trends (${granularity})`}
          subtitle="Gross verified successful donations minus processed refunds — pending and failed attempts excluded."
          points={trendPoints}
          currency={currency}
        />
      </div>

      {/* Campaign-wise & Payment Method Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" /> Campaign-wise Fundraising Performance
          </h3>
          {!data?.campaignBreakdown?.length ? (
            <p className="text-xs text-slate-500">
              No verified campaign donations recorded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {data.campaignBreakdown.map((c) => (
                <div key={c.campaignId} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {c.title}
                    </span>
                    <span className="font-black text-emerald-700 dark:text-emerald-400">
                      {formatMinorCurrency(c.netRaisedMinor, currency)} ({c.progressPercentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#087F5B]"
                      style={{ width: `${Math.min(100, c.progressPercentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white">
            Payment Method Breakdown (Verified)
          </h3>
          {!data?.paymentMethods?.length ? (
            <p className="text-xs text-slate-500">
              No verified donations by payment method yet.
            </p>
          ) : (
            <div className="space-y-2.5">
              {data.paymentMethods.map((pm) => (
                <div
                  key={pm.provider}
                  className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-[#1d332b] p-3 text-xs"
                >
                  <div>
                    <span className="font-black text-slate-900 dark:text-white">{pm.provider}</span>
                    <span className="ml-2 text-slate-500">({pm.count} verified)</span>
                  </div>
                  <span className="font-black text-emerald-700 dark:text-emerald-400">
                    {formatMinorCurrency(pm.netMinor, currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {data?.providers && <PaymentStatusPanel providers={data.providers} />}
    </div>
  );
}
