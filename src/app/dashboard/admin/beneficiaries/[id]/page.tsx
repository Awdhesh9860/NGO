'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/features/admin';
import {
  beneficiaryApiService,
  BeneficiaryDetailResponse,
  BeneficiaryProfileCard,
  BeneficiaryVerificationPanel,
  BeneficiaryEnrollmentPanel,
  AssistanceHistoryTimeline,
  CaseManagementPanel,
  ConsentManagementPanel,
  SafeguardingAccessPanel,
} from '@/features/beneficiaries';
import { ArrowLeft } from 'lucide-react';

export default function AdminBeneficiaryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const beneficiaryId = String(params?.id || '');

  const [detail, setDetail] = useState<BeneficiaryDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    if (!beneficiaryId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await beneficiaryApiService.getDetail(beneficiaryId);
      if (res.success && res.data) setDetail(res.data);
      else setError(res.error?.message || 'Beneficiary record not found');
    } catch {
      setError('Failed to connect to beneficiary details API');
    } finally {
      setLoading(false);
    }
  }, [beneficiaryId]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) void loadDetail();
    });
    return () => {
      active = false;
    };
  }, [loadDetail]);

  if (loading) return <div className="h-64 rounded-2xl bg-slate-100 dark:bg-[#162720] animate-pulse" />;

  if (!detail) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => router.push('/dashboard/admin/beneficiaries')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Beneficiaries
        </button>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
          {error || 'Beneficiary record not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Beneficiary Record: ${detail.beneficiary.beneficiaryCode}`}
        description="Permission-gated eligibility verification, project enrollment, actual assistance delivery, case management, and consent registry."
        actions={
          <button
            type="button"
            onClick={() => router.push('/dashboard/admin/beneficiaries')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs font-semibold"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All Beneficiaries
          </button>
        }
      />

      <SafeguardingAccessPanel beneficiary={detail.beneficiary} clearance={detail.clearance} />
      <BeneficiaryProfileCard beneficiary={detail.beneficiary} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BeneficiaryVerificationPanel
          beneficiaryId={beneficiaryId}
          verifications={detail.verifications}
          canVerify
          onVerified={loadDetail}
        />
        <BeneficiaryEnrollmentPanel
          beneficiaryId={beneficiaryId}
          enrollments={detail.enrollments}
          canEnroll
          onEnrolled={loadDetail}
        />
      </div>

      <AssistanceHistoryTimeline
        beneficiaryId={beneficiaryId}
        assistance={detail.assistance}
        canRecord
        onRecorded={loadDetail}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CaseManagementPanel
          beneficiaryId={beneficiaryId}
          cases={detail.cases}
          caseNotes={detail.caseNotes}
          canManageCases={detail.clearance.canManageCases}
          onUpdated={loadDetail}
        />
        <ConsentManagementPanel
          beneficiaryId={beneficiaryId}
          consents={detail.consents}
          canManageConsent
          onUpdated={loadDetail}
        />
      </div>
    </div>
  );
}
