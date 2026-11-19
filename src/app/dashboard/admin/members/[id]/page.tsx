'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader, PermissionGate } from '@/features/admin';
import {
  membershipApiService,
  MemberRecordItem,
  MembershipRenewalItem,
  MemberProfileCard,
  MembershipRenewalPanel,
} from '@/features/membership';
import { ArrowLeft, Ban, CheckCircle2 } from 'lucide-react';

export default function AdminMemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const memberId = String(params?.id || '');

  const [data, setData] = useState<{
    member: MemberRecordItem;
    renewals: MembershipRenewalItem[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    if (!memberId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await membershipApiService.getMemberDetail(memberId);
      if (res.success && res.data) setData(res.data);
      else setError(res.error?.message || 'Member not found');
    } catch {
      setError('Failed to fetch member details');
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) void loadDetail();
    });
    return () => {
      active = false;
    };
  }, [loadDetail]);

  const handleStatusAction = async (action: 'ACTIVATE' | 'SUSPEND' | 'CANCEL') => {
    setError(null);
    const reason =
      action === 'ACTIVATE'
        ? 'Activated by administrator'
        : window.prompt(`Enter audited reason for ${action}:`) || '';
    if (action !== 'ACTIVATE' && !reason) return;
    const res = await membershipApiService.updateMemberStatus(memberId, {
      action,
      reason,
      feePaymentStatus: action === 'ACTIVATE' ? 'PAID' : undefined,
    });
    if (!res.success) setError(res.error?.message || 'Status update failed');
    else {
      setNotice(`Membership ${action.toLowerCase()}d`);
      await loadDetail();
    }
  };

  if (loading) return <div className="h-56 rounded-2xl bg-slate-100 dark:bg-[#162720] animate-pulse" />;

  if (!data) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => router.push('/dashboard/admin/members')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Members
        </button>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
          {error || 'Member not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Member: ${data.member.fullName}`}
        description={`${data.member.membershipNumber} • ${data.member.category} Membership`}
        actions={
          <div className="flex flex-wrap gap-2">
            {data.member.status !== 'ACTIVE' && (
              <PermissionGate permission="members.manage">
                <button
                  type="button"
                  onClick={() => handleStatusAction('ACTIVATE')}
                  className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Activate
                </button>
              </PermissionGate>
            )}
            {data.member.status === 'ACTIVE' && (
              <PermissionGate permission="members.suspend">
                <button
                  type="button"
                  onClick={() => handleStatusAction('SUSPEND')}
                  className="inline-flex items-center gap-1 rounded-xl border border-rose-300 px-3 py-2 text-xs font-bold text-rose-700"
                >
                  <Ban className="h-3.5 w-3.5" /> Suspend
                </button>
              </PermissionGate>
            )}
            <button
              type="button"
              onClick={() => router.push('/dashboard/admin/members')}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs font-semibold"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Directory
            </button>
          </div>
        }
      />

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</div>}
      {notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">{notice}</div>}

      <MemberProfileCard member={data.member} />
      <MembershipRenewalPanel
        member={data.member}
        renewals={data.renewals}
        canRenew
        onRenewed={() => {
          setNotice('Membership renewal recorded');
          loadDetail();
        }}
      />
    </div>
  );
}
