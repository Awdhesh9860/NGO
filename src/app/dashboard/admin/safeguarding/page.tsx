'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, EmptyState } from '@/features/admin';
import {
  beneficiaryApiService,
  BeneficiaryListItem,
  StakeholderAnalyticsResponse,
  BeneficiaryStatusBadge,
} from '@/features/beneficiaries';
import { RefreshCw, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function AdminSafeguardingConsentPage() {
  const router = useRouter();
  const [safeguarded, setSafeguarded] = useState<BeneficiaryListItem[]>([]);
  const [analytics, setAnalytics] = useState<StakeholderAnalyticsResponse['beneficiaries']>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [listRes, statsRes] = await Promise.all([
        beneficiaryApiService.list({ requiresSafeguarding: true }).catch(() => ({ success: false, data: [] })),
        beneficiaryApiService.getStakeholderAnalytics(),
      ]);
      if (listRes.success && Array.isArray(listRes.data)) setSafeguarded(listRes.data);
      if (statsRes.success && statsRes.data) setAnalytics(statsRes.data.beneficiaries);
    } catch {
      setError('Failed to connect to safeguarding & privacy services');
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Child Safeguarding, Privacy & Consent Governance"
        description="Strict least-privilege monitoring of safeguarded records, purpose-specific consent metrics, and anonymization workflows."
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

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-rose-200 bg-rose-50/40 dark:border-rose-900/50 dark:bg-rose-950/20 p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-800 dark:text-rose-300">
            <ShieldAlert className="h-4 w-4" /> Safeguarded Records
          </div>
          <div className="mt-2 text-2xl font-black text-rose-900 dark:text-white">
            {analytics?.safeguardedCount ?? 0}
          </div>
          <p className="text-[11px] text-rose-700/80 dark:text-rose-300/80 mt-1">
            Protected under explicit safeguarding clearance
          </p>
        </div>

        <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4" /> Anonymized Records
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {analytics?.anonymizedCount ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Personal identifiers scrubbed under data retention
          </p>
        </div>

        <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5">
          <div className="text-xs font-bold text-slate-500">Purpose-Specific Consent Entries</div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {(analytics?.consentsSummary || []).reduce((acc, c) => acc + c.count, 0)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Media &amp; storytelling separated from essential aid
          </p>
        </div>
      </div>

      {/* Safeguarded Records Queue */}
      <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 space-y-3">
        <h3 className="text-sm font-black text-slate-900 dark:text-white">
          Safeguarded Beneficiary Queue (Redacted View)
        </h3>
        {safeguarded.length === 0 ? (
          <EmptyState
            title="No safeguarded records flagged"
            description="Minor or vulnerable beneficiary records requiring safeguarding protection appear here with redacted identities."
          />
        ) : (
          <div className="space-y-2">
            {safeguarded.map((b) => (
              <div
                key={b.id}
                onClick={() => router.push(`/dashboard/admin/beneficiaries/${b.id}`)}
                className="cursor-pointer rounded-xl border border-slate-100 dark:border-[#1d332b] p-3 text-xs flex items-center justify-between gap-2 hover:border-rose-300"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{b.displayName}</div>
                  <div className="text-[11px] text-slate-500">
                    {b.district} • {b.assistanceCategory}
                  </div>
                </div>
                <BeneficiaryStatusBadge status={b.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
