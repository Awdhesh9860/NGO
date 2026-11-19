'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader, EmptyState, PermissionGate } from '@/features/admin';
import {
  volunteerApiService,
  VolunteerApplicationItem,
  VolunteerStatusBadge,
} from '@/features/volunteers';
import { Calendar, CheckCircle2, RefreshCw, XCircle } from 'lucide-react';

function getDefaultInterviewTimestamp(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().slice(0, 16);
}

export default function AdminVolunteerApplicationsPage() {
  const [applications, setApplications] = useState<VolunteerApplicationItem[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadApps = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await volunteerApiService.listApplications(statusFilter || undefined);
      if (res.success && res.data) setApplications(res.data);
      else setError(res.error?.message || 'Unable to load volunteer applications');
    } catch {
      setError('Failed to connect to volunteer applications API');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) void loadApps();
    });
    return () => {
      active = false;
    };
  }, [loadApps]);

  const handleAction = async (
    id: string,
    action: 'UNDER_REVIEW' | 'SCHEDULE_INTERVIEW' | 'APPROVE' | 'REJECT'
  ) => {
    setError(null);
    setNotice(null);
    let rejectionReason: string | undefined;
    let interviewScheduledAt: string | undefined;

    if (action === 'REJECT') {
      const reason = window.prompt('Enter rejection reason:');
      if (!reason?.trim()) return;
      rejectionReason = reason.trim();
    } else if (action === 'SCHEDULE_INTERVIEW') {
      const dt = window.prompt(
        'Enter interview date/time (ISO or YYYY-MM-DDTHH:mm):',
        getDefaultInterviewTimestamp()
      );
      if (!dt?.trim()) return;
      interviewScheduledAt = dt.trim();
    }

    const res = await volunteerApiService.reviewApplication(id, {
      action,
      rejectionReason,
      interviewScheduledAt,
      interviewMode: 'VIDEO',
      allowResubmission: true,
    });

    if (!res.success) setError(res.error?.message || 'Review action failed');
    else {
      setNotice(`Application updated -> ${action}`);
      await loadApps();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Volunteer Application Review Queue"
        description="Review incoming registrations, schedule orientation interviews, approve volunteer onboarding, or record audited rejections."
        actions={
          <button
            type="button"
            onClick={loadApps}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs font-semibold"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        }
      />

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#12221b] px-3 py-2 text-xs"
      >
        <option value="">All Application Statuses</option>
        {['SUBMITTED', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED', 'APPROVED', 'REJECTED', 'WITHDRAWN'].map((s) => (
          <option key={s} value={s}>
            {s.replace(/_/g, ' ')}
          </option>
        ))}
      </select>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</div>}
      {notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">{notice}</div>}

      {applications.length === 0 && !loading ? (
        <EmptyState
          title="No volunteer applications found"
          description="Public applications submitted via /volunteer appear here for structured review."
        />
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <div
              key={app._id}
              className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs flex flex-wrap items-start justify-between gap-4 text-xs"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-black text-sm text-slate-900 dark:text-white">{app.fullName}</span>
                  <span className="font-mono text-[11px] text-slate-400">{app.applicationCode}</span>
                  <VolunteerStatusBadge status={app.status} />
                </div>
                <p className="text-slate-500">
                  {app.email} • {app.mobileNumber} • Availability: {app.availability}
                </p>
                {app.skills.length > 0 && (
                  <p className="text-slate-600 dark:text-slate-300">
                    Skills: <strong>{app.skills.join(', ')}</strong>
                  </p>
                )}
              </div>

              {['SUBMITTED', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED'].includes(app.status) && (
                <PermissionGate permission="volunteers.manage">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleAction(app._id, 'SCHEDULE_INTERVIEW')}
                      className="inline-flex items-center gap-1 rounded-lg border border-indigo-300 px-2.5 py-1.5 text-[11px] font-bold text-indigo-700"
                    >
                      <Calendar className="h-3.5 w-3.5" /> Interview
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction(app._id, 'APPROVE')}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-bold text-white"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction(app._id, 'REJECT')}
                      className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1.5 text-[11px] font-bold text-white"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </button>
                  </div>
                </PermissionGate>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
