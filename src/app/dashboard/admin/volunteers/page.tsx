'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, EmptyState } from '@/features/admin';
import {
  volunteerApiService,
  VolunteerItem,
  VolunteerStatusBadge,
} from '@/features/volunteers';
import { ClipboardList, RefreshCw, Search } from 'lucide-react';

export default function AdminVolunteersPage() {
  const router = useRouter();
  const [volunteers, setVolunteers] = useState<VolunteerItem[]>([]);
  const [status, setStatus] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVolunteers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await volunteerApiService.listVolunteers({
        status: status || undefined,
        verificationStatus: verificationStatus || undefined,
        search: search || undefined,
      });
      if (res.success && res.data) setVolunteers(res.data);
      else setError(res.error?.message || 'Unable to load volunteers');
    } catch {
      setError('Failed to connect to volunteer directory');
    } finally {
      setLoading(false);
    }
  }, [status, verificationStatus, search]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) void loadVolunteers();
    });
    return () => {
      active = false;
    };
  }, [loadVolunteers]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Volunteer Directory"
        description="Manage approved volunteer profiles, verification checks, project assignments, verified hours, and service certificates."
        actions={
          <>
            <button
              type="button"
              onClick={loadVolunteers}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs font-semibold"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard/admin/volunteers/applications')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#087F5B] px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
            >
              <ClipboardList className="h-3.5 w-3.5" /> Review Applications
            </button>
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
            placeholder="Search volunteer name, email, code, or city..."
            className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#12221b] pl-9 pr-3 py-2 text-xs"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#12221b] px-3 py-2 text-xs"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
        <select
          value={verificationStatus}
          onChange={(e) => setVerificationStatus(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#12221b] px-3 py-2 text-xs"
        >
          <option value="">All Verification States</option>
          <option value="UNVERIFIED">Unverified</option>
          <option value="PENDING">Pending</option>
          <option value="VERIFIED">Verified</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700">
          {error}
        </div>
      )}

      {volunteers.length === 0 && !loading ? (
        <EmptyState
          title="No volunteers onboarded yet"
          description="Approve incoming volunteer applications to create active volunteer profiles."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b]">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#162720] text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Volunteer</th>
                <th className="px-4 py-3">Skills</th>
                <th className="px-4 py-3">Verification</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Verified Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1d332b]">
              {volunteers.map((v) => (
                <tr
                  key={v.id}
                  onClick={() => router.push(`/dashboard/admin/volunteers/${v.id}`)}
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-[#172b22]"
                >
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {v.fullName}{' '}
                      <span className="font-mono text-[10px] text-slate-400">({v.volunteerCode})</span>
                    </div>
                    <div className="text-[11px] text-slate-500">{v.email}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {v.skills.slice(0, 3).join(', ') || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <VolunteerStatusBadge status={v.verificationStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <VolunteerStatusBadge status={v.status} />
                  </td>
                  <td className="px-4 py-3 font-black text-emerald-700 dark:text-emerald-400">
                    {v.verifiedHoursTotal} hrs
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
