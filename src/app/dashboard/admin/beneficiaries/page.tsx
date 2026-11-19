'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, EmptyState, PermissionGate } from '@/features/admin';
import {
  beneficiaryApiService,
  BeneficiaryListItem,
  BeneficiaryStatusBadge,
  BeneficiaryRegistrationForm,
  CreateBeneficiaryInput,
} from '@/features/beneficiaries';
import { PlusCircle, RefreshCw, Search, ShieldAlert, X } from 'lucide-react';

export default function AdminBeneficiariesPage() {
  const router = useRouter();
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryListItem[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRegister, setShowRegister] = useState(false);

  const loadBeneficiaries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await beneficiaryApiService.list({
        search: search || undefined,
        status: status || undefined,
      });
      if (res.success && res.data) setBeneficiaries(res.data);
      else setError(res.error?.message || 'Unable to load beneficiaries');
    } catch {
      setError('Failed to connect to beneficiaries service');
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) void loadBeneficiaries();
    });
    return () => {
      active = false;
    };
  }, [loadBeneficiaries]);

  const handleRegister = async (data: CreateBeneficiaryInput) => {
    const res = await beneficiaryApiService.register(data);
    if (!res.success) throw new Error(res.error?.message || 'Registration failed');
    setShowRegister(false);
    await loadBeneficiaries();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Beneficiary Management (Privacy-Protected)"
        description="Purpose-limited operational beneficiary directory. Sensitive demographic fields, child details, documents, and case notes are strictly omitted from this listing."
        actions={
          <>
            <button
              type="button"
              onClick={loadBeneficiaries}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs font-semibold"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <PermissionGate permission="beneficiaries.create">
              <button
                type="button"
                onClick={() => setShowRegister(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#087F5B] px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
              >
                <PlusCircle className="h-3.5 w-3.5" /> Register Beneficiary
              </button>
            </PermissionGate>
          </>
        }
      />

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by beneficiary code, district, or village..."
            className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#12221b] pl-9 pr-3 py-2 text-xs"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#12221b] px-3 py-2 text-xs"
        >
          <option value="">All Lifecycle Statuses</option>
          {['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'REJECTED', 'WITHDRAWN'].map(
            (s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            )
          )}
        </select>
      </div>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</div>}

      {beneficiaries.length === 0 && !loading ? (
        <EmptyState
          title="No beneficiaries registered yet"
          description="Authorized field staff can register beneficiaries with purpose-limited information and human eligibility review."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b]">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#162720] text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Beneficiary</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Verification</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Safeguarding</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1d332b]">
              {beneficiaries.map((b) => (
                <tr
                  key={b.id}
                  onClick={() => router.push(`/dashboard/admin/beneficiaries/${b.id}`)}
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-[#172b22]"
                >
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900 dark:text-white">{b.displayName}</div>
                    <div className="font-mono text-[10px] text-slate-400">{b.beneficiaryCode}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {[b.village, b.district].filter(Boolean).join(', ')}
                  </td>
                  <td className="px-4 py-3">{b.assistanceCategory}</td>
                  <td className="px-4 py-3">
                    <BeneficiaryStatusBadge status={b.verificationStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <BeneficiaryStatusBadge status={b.status} />
                  </td>
                  <td className="px-4 py-3">
                    {b.requiresSafeguarding ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-800 px-2 py-0.5 text-[10px] font-bold">
                        <ShieldAlert className="h-3 w-3" /> Protected
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">Standard</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 overflow-y-auto backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6 shadow-xl my-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Register New Beneficiary
              </h2>
              <button type="button" onClick={() => setShowRegister(false)}>
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>
            <BeneficiaryRegistrationForm
              onSubmit={handleRegister}
              onCancel={() => setShowRegister(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
