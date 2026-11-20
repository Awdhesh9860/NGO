'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  programApiService,
  ProgramDetailResponse,
  ProgramStatusBadge,
} from '@/features/programs';
import { ProjectStatusBadge, ProjectProgress } from '@/features/projects';
import { ApprovalPanel } from '@/features/project-approvals';
import {
  adminApiService,
  PageHeader,
  StatCard,
  ActivityTimeline,
  LoadingSkeleton,
  EmptyState,
  PermissionGate,
} from '@/features/admin';
import {
  ArrowLeft,
  Wallet,
  FolderKanban,
  Users,
  TrendingUp,
  Globe,
  Archive,
  AlertCircle,
  CheckCircle2,
  PlusCircle,
} from 'lucide-react';

export default function AdminProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const programId = params.id as string;

  const [detail, setDetail] = useState<ProgramDetailResponse | null>(null);
  const [approvers, setApprovers] = useState<Array<{ id: string; name: string; role: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'kpis' | 'approvals' | 'activity'>('overview');

  // KPI quick add state
  const [kpiName, setKpiName] = useState('');
  const [kpiTarget, setKpiTarget] = useState(100);
  const [kpiCurrent, setKpiCurrent] = useState(0);
  const [kpiUnit, setKpiUnit] = useState('beneficiaries');

  const loadDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await programApiService.getById(programId);
      if (res.success && res.data) {
        setDetail(res.data);
      } else {
        setError(res.error?.message || 'Program not found');
      }
    } catch {
      setError('Failed to load program workspace');
    } finally {
      setLoading(false);
    }
  }, [programId]);

  useEffect(() => {
    const id = setTimeout(() => {
      void loadDetail();
    }, 0);
    adminApiService
      .getUsers({ limit: 100 })
      .then((res) => {
        if (res.success && res.data) {
          setApprovers(
            res.data
              .filter((u) => ['SUPER_ADMIN', 'ADMIN', 'EXECUTIVE_DIRECTOR', 'MANAGER'].includes(u.role))
              .map((u) => ({ id: u.id, name: u.name, role: u.role }))
          );
        }
      })
      .catch(() => {});
    return () => clearTimeout(id);
  }, [loadDetail]);

  const handleTransition = async (nextStatus: string) => {
    setError(null);
    setNotice(null);
    const res = await programApiService.update(programId, { status: nextStatus as never });
    if (!res.success) {
      setError(res.error?.message || 'Status transition denied');
    } else {
      setNotice(`Program status transitioned to ${nextStatus}.`);
      loadDetail();
    }
  };

  const handleTogglePublic = async () => {
    if (!detail) return;
    setError(null);
    const res = await programApiService.update(programId, {
      isPublicVisible: !detail.program.isPublicVisible,
    });
    if (!res.success) {
      setError(res.error?.message || 'Could not update public visibility');
    } else {
      setNotice(
        !detail.program.isPublicVisible
          ? 'Program published to the public NGO website (internal budgets remain private).'
          : 'Program unpublished from public website.'
      );
      loadDetail();
    }
  };

  const handleAddKpi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail || !kpiName.trim()) return;
    const nextKpis = [
      ...(detail.program.kpis || []),
      { name: kpiName.trim(), targetValue: Number(kpiTarget) || 0, currentValue: Number(kpiCurrent) || 0, unit: kpiUnit },
    ];
    const res = await programApiService.update(programId, { kpis: nextKpis });
    if (!res.success) {
      setError(res.error?.message || 'Could not add KPI');
    } else {
      setKpiName('');
      setNotice('KPI added to program performance scorecard.');
      loadDetail();
    }
  };

  if (loading) return <LoadingSkeleton variant="form" rows={6} />;

  if (!detail) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-xs text-rose-700">
        {error || 'Program not found'}
      </div>
    );
  }

  const { program, projects, approvals, activity, performance } = detail;

  return (
    <div className="space-y-6">
      <PageHeader
        title={program.title}
        description={`${program.code} • ${program.category} • Lead: ${program.programManager?.name || 'Unassigned'}`}
        badge={<ProgramStatusBadge status={program.status} />}
        actions={
          <>
            <button
              type="button"
              onClick={() => router.push('/dashboard/admin/programs')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>All Programs</span>
            </button>

            {['APPROVED', 'ACTIVE', 'COMPLETED'].includes(program.status) && (
              <PermissionGate anyPermissions={['content.publish', 'programs.approve']}>
                <button
                  type="button"
                  onClick={handleTogglePublic}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 dark:border-sky-800 dark:bg-sky-950/50 px-3 py-2 text-xs font-bold text-sky-800 dark:text-sky-300"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>{program.isPublicVisible ? 'Published Publicly' : 'Publish to Website'}</span>
                </button>
              </PermissionGate>
            )}

            {program.status === 'APPROVED' && (
              <button
                type="button"
                onClick={() => handleTransition('ACTIVE')}
                className="rounded-xl bg-[#087F5B] px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
              >
                Activate Program
              </button>
            )}
            {program.status === 'ACTIVE' && (
              <>
                <button
                  type="button"
                  onClick={() => handleTransition('ON_HOLD')}
                  className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800"
                >
                  Hold
                </button>
                <button
                  type="button"
                  onClick={() => handleTransition('COMPLETED')}
                  className="rounded-xl bg-teal-600 px-3 py-2 text-xs font-bold text-white"
                >
                  Mark Completed
                </button>
              </>
            )}
            {program.status === 'ON_HOLD' && (
              <button
                type="button"
                onClick={() => handleTransition('ACTIVE')}
                className="rounded-xl bg-[#087F5B] px-3.5 py-2 text-xs font-bold text-white"
              >
                Resume Active
              </button>
            )}
            {program.status !== 'ARCHIVED' && (
              <PermissionGate anyPermissions={['programs.archive', 'programs.manage']}>
                <button
                  type="button"
                  onClick={() => handleTransition('ARCHIVED')}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-rose-600"
                >
                  <Archive className="h-3.5 w-3.5" />
                  <span>Archive</span>
                </button>
              </PermissionGate>
            )}
          </>
        }
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Program Budget"
          value={`₹${performance.programBudget.toLocaleString('en-IN')}`}
          accent="emerald"
          icon={<Wallet className="h-5 w-5" />}
          footer={`Allocated to projects: ₹${performance.allocatedProjectBudgets.toLocaleString('en-IN')}`}
        />
        <StatCard
          title="Actual Expenditure"
          value={`₹${performance.totalActualExpenditure.toLocaleString('en-IN')}`}
          accent="sky"
          icon={<TrendingUp className="h-5 w-5" />}
          footer={`Utilization: ${performance.utilizationPercentage}%`}
        />
        <StatCard
          title="Linked Projects"
          value={performance.projectCount}
          accent="amber"
          icon={<FolderKanban className="h-5 w-5" />}
          footer={`${performance.activeProjectCount} active • ${performance.completedProjectCount} completed`}
        />
        <StatCard
          title="Beneficiaries Reached"
          value={performance.actualBeneficiaries.toLocaleString('en-IN')}
          accent="violet"
          icon={<Users className="h-5 w-5" />}
          footer={`Target: ${performance.targetBeneficiaries.toLocaleString('en-IN')}`}
        />
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-[#e2ece6] dark:border-[#1d332b] pb-2">
        {[
          { id: 'overview', label: 'Overview & Objectives' },
          { id: 'projects', label: `Linked Projects (${projects.length})` },
          { id: 'kpis', label: `KPIs (${program.kpis?.length || 0})` },
          { id: 'approvals', label: `Approvals (${approvals.length})` },
          { id: 'activity', label: `Activity (${activity.length})` },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id as typeof activeTab)}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
              activeTab === t.id
                ? 'bg-[#087F5B] text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#172b22]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 text-xs">
          <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Charter & Description</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{program.shortDescription}</p>
            {program.detailedDescription && (
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {program.detailedDescription}
              </p>
            )}
            <dl className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-[#1d332b]">
              <div>
                <dt className="text-[10px] font-bold uppercase text-slate-400">Department</dt>
                <dd className="font-semibold text-slate-900 dark:text-white">{program.department?.name || 'Unassigned'}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase text-slate-400">Focus Area</dt>
                <dd className="font-semibold text-slate-900 dark:text-white">{program.focusArea || '—'}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase text-slate-400">Target Audience</dt>
                <dd className="font-semibold text-slate-900 dark:text-white">{program.targetAudience || '—'}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase text-slate-400">Geographic Coverage</dt>
                <dd className="font-semibold text-slate-900 dark:text-white">
                  {program.geographicCoverage?.join(', ') || '—'}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Strategic Objectives & Outcomes</h3>
            <div>
              <p className="text-[11px] font-bold uppercase text-emerald-700 dark:text-emerald-400 mb-2">Objectives</p>
              {program.objectives && program.objectives.length > 0 ? (
                <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-300">
                  {program.objectives.map((o, i) => (
                    <li key={i}>{o}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-400">No objectives listed yet.</p>
              )}
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-[#1d332b]">
              <p className="text-[11px] font-bold uppercase text-sky-700 dark:text-sky-400 mb-2">Expected Outcomes</p>
              {program.expectedOutcomes && program.expectedOutcomes.length > 0 ? (
                <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-300">
                  {program.expectedOutcomes.map((o, i) => (
                    <li key={i}>{o}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-400">No expected outcomes listed yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="space-y-3">
          {projects.length === 0 ? (
            <EmptyState
              title="No projects linked to this program"
              description="Create a project and assign this program as its parent to roll up budgets and beneficiaries."
              action={
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/admin/projects')}
                  className="rounded-xl bg-[#087F5B] px-4 py-2 text-xs font-bold text-white"
                >
                  Go to Projects
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {projects.map((pr) => (
                <div
                  key={pr.id}
                  onClick={() => router.push(`/dashboard/admin/projects/${pr.id}`)}
                  className="cursor-pointer rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 hover:border-emerald-500 transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400">{pr.code}</span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{pr.name}</h4>
                    </div>
                    <ProjectStatusBadge status={pr.status} />
                  </div>
                  <ProjectProgress percentage={pr.progressPercentage} />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Budget: ₹{(pr.approvedBudget || 0).toLocaleString('en-IN')}</span>
                    <span>Beneficiaries: {pr.actualBeneficiaries}/{pr.targetBeneficiaries}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'kpis' && (
        <div className="space-y-4">
          <PermissionGate anyPermissions={['programs.update', 'programs.manage']}>
            <form
              onSubmit={handleAddKpi}
              className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-4 grid grid-cols-1 gap-3 sm:grid-cols-5 text-xs"
            >
              <input
                required
                type="text"
                value={kpiName}
                onChange={(e) => setKpiName(e.target.value)}
                placeholder="KPI Name (e.g. Digital Labs Deployed)"
                className="sm:col-span-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
              />
              <input
                type="number"
                min={0}
                value={kpiTarget}
                onChange={(e) => setKpiTarget(Number(e.target.value))}
                placeholder="Target"
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
              />
              <input
                type="text"
                value={kpiUnit}
                onChange={(e) => setKpiUnit(e.target.value)}
                placeholder="Unit"
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1 rounded-xl bg-[#087F5B] px-3 py-2 font-bold text-white hover:bg-emerald-700"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Add KPI</span>
              </button>
            </form>
          </PermissionGate>

          {!program.kpis || program.kpis.length === 0 ? (
            <EmptyState
              title="No KPIs tracked yet"
              description="Define key performance indicators with numeric targets and units to measure program outcomes."
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {program.kpis.map((kpi, idx) => {
                const pct = kpi.targetValue > 0 ? Math.min(100, Math.round((kpi.currentValue / kpi.targetValue) * 100)) : 0;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-4 space-y-2"
                  >
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">{kpi.name}</span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                        {kpi.currentValue} / {kpi.targetValue} {kpi.unit}
                      </span>
                    </div>
                    <ProjectProgress percentage={pct} label="KPI Achievement" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'approvals' && (
        <ApprovalPanel
          entityType="PROGRAM"
          entityStatus={program.status}
          approvals={approvals as never}
          approvers={approvers}
          onSubmitApproval={async (payload) => {
            const res = await programApiService.submitApproval(programId, payload);
            if (!res.success) setError(res.error?.message || 'Submission failed');
            else {
              setNotice('Program submitted for approval.');
              loadDetail();
            }
          }}
          onDecideApproval={async (payload) => {
            const res = await programApiService.decideApproval(programId, payload);
            if (!res.success) setError(res.error?.message || 'Decision failed');
            else {
              setNotice(`Program ${payload.decision.toLowerCase()}.`);
              loadDetail();
            }
          }}
        />
      )}

      {activeTab === 'activity' && (
        <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6">
          <ActivityTimeline items={activity} />
        </div>
      )}
    </div>
  );
}
