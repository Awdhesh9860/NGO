'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, EmptyState, PermissionGate } from '@/features/admin';
import { donorApiService, DonorItem } from '@/features/donors';
import { formatMinorCurrency } from '@/lib/money';
import { Download, PlusCircle, RefreshCw, Search, X } from 'lucide-react';

export default function AdminDonorsPage() {
  const router = useRouter();
  const [donors, setDonors] = useState<DonorItem[]>([]);
  const [search, setSearch] = useState('');
  const [donorType, setDonorType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<'INDIVIDUAL' | 'CORPORATE' | 'INSTITUTIONAL' | 'FOUNDATION'>('INDIVIDUAL');

  const loadDonors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await donorApiService.list({
        search: search || undefined,
        donorType: donorType || undefined,
        limit: 50,
      });
      if (res.success && res.data) {
        setDonors(res.data);
      } else {
        setError(res.error?.message || 'Unable to load donors');
      }
    } catch {
      setError('Failed to connect to donor service');
    } finally {
      setLoading(false);
    }
  }, [search, donorType]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) void loadDonors();
    });
    return () => {
      active = false;
    };
  }, [loadDonors]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await donorApiService.create({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      donorType: type,
      anonymousDisplayDefault: false,
      status: 'ACTIVE',
      tags: [],
    });
    if (!res.success) {
      setError(res.error?.message || 'Failed to create donor');
      return;
    }
    setShowCreate(false);
    setName('');
    setEmail('');
    setPhone('');
    await loadDonors();
  };

  const handleExport = async () => {
    const res = await donorApiService.exportDonors();
    if (!res.success || !res.data) {
      setError(res.error?.message || 'Export failed');
      return;
    }
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ngo-donors-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Donor CRM & Segmentation"
        description="Tenant-isolated donor directory with verified lifetime contribution metrics, automated segments, and sensitive field controls."
        actions={
          <>
            <button
              type="button"
              onClick={loadDonors}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <PermissionGate permission="donors.export">
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200"
              >
                <Download className="h-3.5 w-3.5" /> Export
              </button>
            </PermissionGate>
            <PermissionGate permission="donors.manage">
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#087F5B] px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
              >
                <PlusCircle className="h-3.5 w-3.5" /> Add Donor
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
            placeholder="Search donor name, email, or organization..."
            className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#12221b] pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white"
          />
        </div>
        <select
          value={donorType}
          onChange={(e) => setDonorType(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#12221b] px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
        >
          <option value="">All Donor Types</option>
          <option value="INDIVIDUAL">Individual</option>
          <option value="CORPORATE">Corporate</option>
          <option value="INSTITUTIONAL">Institutional</option>
          <option value="FOUNDATION">Foundation</option>
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700">
          {error}
        </div>
      )}

      {donors.length === 0 && !loading ? (
        <EmptyState
          title="No donors recorded yet"
          description="Donors are automatically profiled when donations are initiated or added directly by fundraising staff."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b]">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#162720] text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Donor</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Lifetime Verified</th>
                <th className="px-4 py-3">Count</th>
                <th className="px-4 py-3">Segments</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1d332b]">
              {donors.map((d) => (
                <tr
                  key={d.id}
                  onClick={() => router.push(`/dashboard/admin/donors/${d.id}`)}
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-[#172b22]"
                >
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900 dark:text-white">{d.name}</div>
                    <div className="text-[11px] text-slate-500">{d.email}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{d.donorType}</td>
                  <td className="px-4 py-3 font-black text-emerald-700 dark:text-emerald-400">
                    {formatMinorCurrency(d.lifetimeAmountMinor, 'INR')}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{d.donationCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {d.segments.map((s) => (
                        <span
                          key={s}
                          className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300"
                        >
                          {s.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {d.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Add Donor Profile</h3>
              <button type="button" onClick={() => setShowCreate(false)}>
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Full Name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs text-slate-900 dark:text-white"
              />
              <input
                type="email"
                required
                placeholder="Email Address *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs text-slate-900 dark:text-white"
              />
              <input
                type="tel"
                placeholder="Phone (Optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs text-slate-900 dark:text-white"
              />
              <select
                value={type}
                onChange={(e) => setType(e.target.value as typeof type)}
                className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs text-slate-900 dark:text-white"
              >
                <option value="INDIVIDUAL">Individual</option>
                <option value="CORPORATE">Corporate</option>
                <option value="INSTITUTIONAL">Institutional</option>
                <option value="FOUNDATION">Foundation</option>
              </select>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#087F5B] px-4 py-2 text-xs font-bold text-white"
                >
                  Save Donor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
