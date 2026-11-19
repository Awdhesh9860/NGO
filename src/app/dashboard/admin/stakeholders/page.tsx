'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader, StatCard } from '@/features/admin';
import {
  beneficiaryApiService,
  StakeholderAnalyticsResponse,
} from '@/features/beneficiaries';
import {
  UserCheck,
  Award,
  UsersRound,
  Clock,
  ShieldAlert,
  PackageCheck,
  RefreshCw,
} from 'lucide-react';

export default function AdminStakeholderAnalyticsPage() {
  const [data, setData] = useState<StakeholderAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await beneficiaryApiService.getStakeholderAnalytics();
      if (res.success && res.data) setData(res.data);
      else setError(res.error?.message || 'Unable to load stakeholder analytics');
    } catch {
      setError('Failed to connect to stakeholder analytics API');
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Volunteer, Membership & Beneficiary Analytics"
        description="Real database aggregations across all stakeholder operations. Beneficiary figures are strictly aggregated and anonymized."
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

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</div>}

      {/* Volunteer KPIs */}
      {data?.volunteers && (
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
            Volunteer Operations
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Active Volunteers"
              value={data.volunteers.activeVolunteers}
              subtitle={`of ${data.volunteers.totalVolunteers}`}
              loading={loading}
              accent="emerald"
              icon={<UserCheck className="h-5 w-5" />}
              footer={`${data.volunteers.verifiedVolunteers} verified • ${data.volunteers.pendingApplications} pending apps`}
            />
            <StatCard
              title="Verified Volunteer Hours"
              value={`${data.volunteers.verifiedHoursTotal} hrs`}
              subtitle="approved only"
              loading={loading}
              accent="sky"
              icon={<Clock className="h-5 w-5" />}
              footer={`${data.volunteers.approvedAttendanceSessions} approved sessions`}
            />
            <StatCard
              title="Active Assignments"
              value={data.volunteers.activeAssignments}
              subtitle="project placements"
              loading={loading}
              accent="amber"
              icon={<UserCheck className="h-5 w-5" />}
              footer="Tenant-validated project placements"
            />
            <StatCard
              title="Pending Applications"
              value={data.volunteers.pendingApplications}
              subtitle="awaiting review"
              loading={loading}
              accent="violet"
              icon={<UserCheck className="h-5 w-5" />}
              footer="Manual review required"
            />
          </div>
        </div>
      )}

      {/* Membership KPIs */}
      {data?.membership && (
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
            Membership Governance
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Active Members"
              value={data.membership.activeMembers}
              subtitle={`of ${data.membership.totalMembers}`}
              loading={loading}
              accent="emerald"
              icon={<Award className="h-5 w-5" />}
              footer={`${data.membership.pendingApplications} pending applications`}
            />
            <StatCard
              title="Expiring (Next 30 Days)"
              value={data.membership.expiringSoon}
              subtitle="renewal window"
              loading={loading}
              accent="amber"
              icon={<Award className="h-5 w-5" />}
              footer={`${data.membership.expiredMembers} expired`}
            />
            <StatCard
              title="Completed Renewals"
              value={data.membership.completedRenewals}
              subtitle="renewed"
              loading={loading}
              accent="sky"
              icon={<Award className="h-5 w-5" />}
              footer="Membership fees tracked separately"
            />
            <StatCard
              title="Suspended Members"
              value={data.membership.suspendedMembers}
              subtitle="restricted"
              loading={loading}
              accent="rose"
              icon={<Award className="h-5 w-5" />}
              footer="Audited governance actions"
            />
          </div>
        </div>
      )}

      {/* Aggregated & Anonymized Beneficiary KPIs */}
      {data?.beneficiaries && (
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
            Beneficiary Reach &amp; Assistance Delivery (Aggregated &amp; Anonymized)
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Active Beneficiaries"
              value={data.beneficiaries.activeBeneficiaries}
              subtitle={`of ${data.beneficiaries.totalBeneficiaries}`}
              loading={loading}
              accent="emerald"
              icon={<UsersRound className="h-5 w-5" />}
              footer={`${data.beneficiaries.pendingVerification} pending verification`}
            />
            <StatCard
              title="Assistance Deliveries"
              value={data.beneficiaries.assistanceDeliveredCount}
              subtitle="verified records"
              loading={loading}
              accent="sky"
              icon={<PackageCheck className="h-5 w-5" />}
              footer={`${data.beneficiaries.followUpsDueCount} follow-ups due`}
            />
            <StatCard
              title="Safeguarded Records"
              value={data.beneficiaries.safeguardedCount}
              subtitle="protected"
              loading={loading}
              accent="rose"
              icon={<ShieldAlert className="h-5 w-5" />}
              footer={`${data.beneficiaries.anonymizedCount} anonymized`}
            />
            <StatCard
              title="Tracked Cases"
              value={data.beneficiaries.casesByStatus.reduce((s, c) => s + c.count, 0)}
              subtitle="all statuses"
              loading={loading}
              accent="violet"
              icon={<UsersRound className="h-5 w-5" />}
              footer="Sensitive case notes excluded from analytics"
            />
          </div>
        </div>
      )}
    </div>
  );
}
