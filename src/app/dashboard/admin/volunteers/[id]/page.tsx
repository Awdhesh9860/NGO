'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader, PermissionGate } from '@/features/admin';
import {
  volunteerApiService,
  VolunteerItem,
  VolunteerAssignmentItem,
  VolunteerAttendanceItem,
  VolunteerHoursSummaryData,
  VolunteerCertificateItem,
  VolunteerProfileCard,
  VolunteerSkillsPanel,
  VolunteerAssignmentCard,
  VolunteerAttendanceTable,
  VolunteerHoursSummary,
  VolunteerCertificateViewer,
} from '@/features/volunteers';
import { ArrowLeft, Award, ShieldCheck } from 'lucide-react';

export default function AdminVolunteerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const volunteerId = String(params?.id || '');

  const [data, setData] = useState<{
    volunteer: VolunteerItem;
    assignments: VolunteerAssignmentItem[];
    attendance: VolunteerAttendanceItem[];
    hoursSummary: VolunteerHoursSummaryData;
    certificates: VolunteerCertificateItem[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [roleTitle, setRoleTitle] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [requiresVerification, setRequiresVerification] = useState(false);

  const [attDate, setAttDate] = useState(new Date().toISOString().slice(0, 10));
  const [attMinutes, setAttMinutes] = useState('180');
  const [attDesc, setAttDesc] = useState('');

  const loadDetail = useCallback(async () => {
    if (!volunteerId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await volunteerApiService.getVolunteerDetail(volunteerId);
      if (res.success && res.data) setData(res.data);
      else setError(res.error?.message || 'Volunteer not found');
    } catch {
      setError('Failed to fetch volunteer details');
    } finally {
      setLoading(false);
    }
  }, [volunteerId]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) void loadDetail();
    });
    return () => {
      active = false;
    };
  }, [loadDetail]);

  const handleMarkVerified = async () => {
    setError(null);
    const res = await volunteerApiService.updateVolunteer(volunteerId, {
      verificationAction: {
        verificationStatus: 'VERIFIED',
        checks: { emailVerified: true, mobileVerified: true },
        notes: 'Verified by authorized coordinator',
      },
    });
    if (!res.success) setError(res.error?.message || 'Verification failed');
    else {
      setNotice('Volunteer marked VERIFIED');
      await loadDetail();
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await volunteerApiService.createAssignment(volunteerId, {
      roleTitle: roleTitle.trim(),
      responsibilities: responsibilities.trim(),
      requiresVerification,
      startDate: new Date().toISOString().slice(0, 10),
      scheduledDays: [],
    });
    if (!res.success) setError(res.error?.message || 'Assignment failed');
    else {
      setRoleTitle('');
      setResponsibilities('');
      setNotice('Volunteer assignment created');
      await loadDetail();
    }
  };

  const handleRecordAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await volunteerApiService.recordAttendance(volunteerId, {
      attendanceDate: attDate,
      minutesLogged: Number(attMinutes) || 0,
      status: 'PRESENT',
      activityDescription: attDesc.trim(),
      entrySource: 'MANUAL_STAFF',
    });
    if (!res.success) setError(res.error?.message || 'Failed to log attendance');
    else {
      setAttDesc('');
      setNotice('Attendance recorded (pending supervisor approval)');
      await loadDetail();
    }
  };

  const handleAttendanceDecision = async (attendanceId: string, decision: 'APPROVE' | 'REJECT') => {
    setError(null);
    const reason = decision === 'REJECT' ? window.prompt('Rejection reason:') || '' : undefined;
    if (decision === 'REJECT' && !reason) return;
    const res = await volunteerApiService.reviewAttendance(volunteerId, {
      attendanceId,
      decision,
      reason,
    });
    if (!res.success) setError(res.error?.message || 'Failed to update attendance');
    else {
      setNotice(`Attendance ${decision === 'APPROVE' ? 'approved' : 'rejected'}`);
      await loadDetail();
    }
  };

  const handleIssueCertificate = async () => {
    setError(null);
    const title = window.prompt('Certificate Title:', 'Certificate of Volunteer Service');
    if (!title?.trim()) return;
    const res = await volunteerApiService.issueCertificate(volunteerId, {
      certificateType: 'PARTICIPATION',
      title: title.trim(),
      participationStartDate: '2026-01-01',
      participationEndDate: new Date().toISOString().slice(0, 10),
      signatoryName: 'Executive Director',
      signatoryRole: 'Authorized Signatory',
      minimumRequiredMinutes: 60,
    });
    if (!res.success) setError(res.error?.message || 'Cannot issue certificate');
    else {
      setNotice('Verified volunteer certificate issued');
      await loadDetail();
    }
  };

  if (loading) return <div className="h-64 rounded-2xl bg-slate-100 dark:bg-[#162720] animate-pulse" />;

  if (!data) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => router.push('/dashboard/admin/volunteers')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Volunteers
        </button>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
          {error || 'Volunteer not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Volunteer: ${data.volunteer.fullName}`}
        description={`${data.volunteer.volunteerCode} • Verification, assignments, attendance, verified hours, and certificates`}
        actions={
          <div className="flex flex-wrap gap-2">
            {data.volunteer.verificationStatus !== 'VERIFIED' && (
              <PermissionGate permission="volunteers.verify">
                <button
                  type="button"
                  onClick={handleMarkVerified}
                  className="inline-flex items-center gap-1 rounded-xl bg-teal-600 px-3 py-2 text-xs font-bold text-white"
                >
                  <ShieldCheck className="h-3.5 w-3.5" /> Mark Verified
                </button>
              </PermissionGate>
            )}
            <PermissionGate permission="volunteers.certificates.issue">
              <button
                type="button"
                onClick={handleIssueCertificate}
                className="inline-flex items-center gap-1 rounded-xl bg-[#087F5B] px-3 py-2 text-xs font-bold text-white"
              >
                <Award className="h-3.5 w-3.5" /> Issue Certificate
              </button>
            </PermissionGate>
            <button
              type="button"
              onClick={() => router.push('/dashboard/admin/volunteers')}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs font-semibold"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Directory
            </button>
          </div>
        }
      />

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</div>}
      {notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">{notice}</div>}

      <VolunteerProfileCard volunteer={data.volunteer} />
      <VolunteerHoursSummary summary={data.hoursSummary} />
      <VolunteerSkillsPanel volunteer={data.volunteer} />

      {/* Assignments */}
      <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 space-y-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white">Assignments</h3>
        <PermissionGate permission="volunteers.assign">
          <form onSubmit={handleCreateAssignment} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pb-4 border-b border-slate-100 dark:border-[#1d332b]">
            <input
              type="text"
              required
              placeholder="Role Title *"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs"
            />
            <input
              type="text"
              required
              placeholder="Responsibilities *"
              value={responsibilities}
              onChange={(e) => setResponsibilities(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs"
            />
            <div className="flex items-center justify-between gap-2">
              <label className="flex items-center gap-1.5 text-[11px]">
                <input
                  type="checkbox"
                  checked={requiresVerification}
                  onChange={(e) => setRequiresVerification(e.target.checked)}
                />
                Restricted
              </label>
              <button type="submit" className="rounded-xl bg-[#087F5B] px-3.5 py-2 text-xs font-bold text-white">
                Assign
              </button>
            </div>
          </form>
        </PermissionGate>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.assignments.map((a) => (
            <VolunteerAssignmentCard
              key={a._id}
              assignment={a}
              onStatusChange={async (assignmentId, status) => {
                await volunteerApiService.updateAssignment(volunteerId, { assignmentId, status });
                await loadDetail();
              }}
            />
          ))}
        </div>
      </div>

      {/* Attendance */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-slate-900 dark:text-white">Attendance &amp; Hours Ledger</h3>
        <PermissionGate permission="volunteers.attendance.manage">
          <form onSubmit={handleRecordAttendance} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-4">
            <input
              type="date"
              required
              value={attDate}
              onChange={(e) => setAttDate(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-[#1d332b] px-3 py-2 text-xs"
            />
            <input
              type="number"
              min="1"
              max="1440"
              required
              placeholder="Minutes"
              value={attMinutes}
              onChange={(e) => setAttMinutes(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-[#1d332b] px-3 py-2 text-xs"
            />
            <input
              type="text"
              required
              placeholder="Activity Description *"
              value={attDesc}
              onChange={(e) => setAttDesc(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-[#1d332b] px-3 py-2 text-xs"
            />
            <button type="submit" className="rounded-xl bg-[#087F5B] px-4 py-2 text-xs font-bold text-white">
              Log Attendance
            </button>
          </form>
        </PermissionGate>
        <VolunteerAttendanceTable
          records={data.attendance}
          canApprove
          onDecision={handleAttendanceDecision}
        />
      </div>

      {/* Certificates */}
      {data.certificates.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-black text-slate-900 dark:text-white">Issued Service Certificates</h3>
          <div className="space-y-4">
            {data.certificates.map((cert) => (
              <VolunteerCertificateViewer
                key={cert.certificateNumber}
                certificate={cert}
                onPrint={() => window.print()}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
