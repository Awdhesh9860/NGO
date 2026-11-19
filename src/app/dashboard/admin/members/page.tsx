'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, EmptyState, PermissionGate } from '@/features/admin';
import {
  membershipApiService,
  MemberRecordItem,
  MembershipApplicationItem,
  MembershipStatusBadge,
} from '@/features/membership';
import { BadgeCheck, CheckCircle2, RefreshCw, Search, XCircle } from 'lucide-react';

export default function AdminMembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<MemberRecordItem[]>([]);
  const [applications, setApplications] = useState<MembershipApplicationItem[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [mRes, aRes] = await Promise.all([
        membershipApiService.listMembers({
          search: search || undefined,
          status: status || undefined,
        }),
        membershipApiService.listApplications('SUBMITTED').catch(() => ({ success: false, data: [] })),
      ]);
      if (mRes.success && mRes.data) setMembers(mRes.data);
      else setError(mRes.error?.message || 'Unable to load member directory');
      if (aRes.success && Array.isArray(aRes.data)) setApplications(aRes.data);
    } catch {
      setError('Failed to connect to membership service');
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) void loadData();
    });
    return () => {
      active = false;
    };
  }, [loadData]);

  const handleReviewApp = async (id: string, action: 'APPROVE' | 'REJECT') => {
    setError(null);
    const reason = action === 'REJECT' ? window.prompt('Rejection reason:') || '' : undefined;
    if (action === 'REJECT' && !reason) return;
    const res = await membershipApiService.reviewApplication(id, {
      action,
      rejectionReason: reason,
      activateImmediately: true,
    });
    if (!res.success) setError(res.error?.message || 'Review failed');
    else {
      setNotice(`Membership application ${action === 'APPROVE' ? 'approved' : 'rejected'}`);
      await loadData();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Member Directory & Applications"
        description="Manage approved NGO members, pending membership applications, renewals, and membership status history."
        actions={
          <>
            <button
              type="button"
              onClick={loadData}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs font-semibold"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard/admin/members/plans')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#087F5B] px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
            >
              <BadgeCheck className="h-3.5 w-3.5" /> Configure Plans
            </button>
          </>
        }
      />

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</div>}
      {notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">{notice}</div>}

      {/* Pending Applications */}
      {applications.length > 0 && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 p-5 space-y-3">
          <h3 className="text-sm font-black text-amber-900 dark:text-amber-200">
            Pending Membership Applications ({applications.length})
          </h3>
          <div className="space-y-2">
            {applications.map((a) => (
              <div
                key={a._id}
                className="rounded-xl border border-amber-200/70 bg-white dark:bg-[#12221b] p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {a.fullName} ({a.category}) • <span className="font-mono text-slate-400">{a.applicationCode}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">{a.email} • {a.reasonForJoining}</div>
                </div>
                <PermissionGate permission="members.approve">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleReviewApp(a._id, 'APPROVE')}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReviewApp(a._id, 'REJECT')}
                      className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-[11px] font-bold text-white"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </button>
                  </div>
                </PermissionGate>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Directory Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search member name, email, or membership number..."
            className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#12221b] pl-9 pr-3 py-2 text-xs"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#12221b] px-3 py-2 text-xs"
        >
          <option value="">All Member Statuses</option>
          {['APPROVED', 'ACTIVE', 'EXPIRED', 'SUSPENDED', 'CANCELLED'].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {members.length === 0 && !loading ? (
        <EmptyState
          title="No members registered yet"
          description="Configure membership plans and approve incoming applications to build your member directory."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b]">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#162720] text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Member Number</th>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1d332b]">
              {members.map((m) => (
                <tr
                  key={m._id}
                  onClick={() => router.push(`/dashboard/admin/members/${m._id}`)}
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-[#172b22]"
                >
                  <td className="px-4 py-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {m.membershipNumber}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900 dark:text-white">{m.fullName}</div>
                    <div className="text-[11px] text-slate-500">{m.email}</div>
                  </td>
                  <td className="px-4 py-3">{m.category}</td>
                  <td className="px-4 py-3">
                    <MembershipStatusBadge status={m.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {m.isLifetime
                      ? 'Lifetime'
                      : m.expiryDate
                      ? new Date(m.expiryDate).toLocaleDateString('en-IN')
                      : '—'}
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
