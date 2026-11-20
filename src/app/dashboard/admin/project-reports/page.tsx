'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { projectReportsApiService, OperationalAnalyticsData } from '@/features/project-reports';
import {
  PageHeader,
  StatCard,
  EmptyState,
  LoadingSkeleton,
  PermissionGate,
} from '@/features/admin';
import {
  Layers,
  FolderKanban,
  Wallet,
  AlertTriangle,
  Download,
  RefreshCw,
  MapPin,
  Building2,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

export default function AdminProjectReportsPage() {
  const router = useRouter();
  const [data, setData] = useState<OperationalAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await projectReportsApiService.getOperationalAnalytics();
      if (res.success && res.data) setData(res.data);
      else setError(res.error?.message || 'Failed to load operational analytics');
    } catch {
      setError('Unable to reach operational analytics service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = setTimeout(() => {
      void loadAnalytics();
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const handleExportSummary = () => {
    if (!data) return;
    const rows = [
      ['Metric', 'Value'],
      ['Total Programs', String(data.programOverview.total)],
      ['Active Programs', String(data.programOverview.active)],
      ['Completed Programs', String(data.programOverview.completed)],
      ['Total Program Budget (INR)', String(data.programOverview.totalBudget)],
      ['Total Projects', String(data.projectOverview.total)],
      ['Active Projects', String(data.projectOverview.active)],
      ['Completed Projects', String(data.projectOverview.completed)],
      ['Overdue Projects', String(data.projectOverview.overdue)],
      ['Approved Project Budget (INR)', String(data.budgetOverview.totalApprovedBudget)],
      ['Planned Expenditure (INR)', String(data.budgetOverview.totalPlannedExpenditure)],
      ['Actual Expenditure (INR)', String(data.budgetOverview.totalActualExpenditure)],
      ['Budget Utilization (%)', String(data.budgetOverview.utilizationPercentage)],
      ['Overdue Milestones', String(data.attentionRequired.overdueMilestones.length)],
      ['Overdue Tasks', String(data.attentionRequired.overdueTasks.length)],
      ['Projects Exceeding Planned Budget', String(data.attentionRequired.projectsExceedingPlannedBudgetCount)],
      ['Pending Approvals', String(data.attentionRequired.pendingApprovals.length)],
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ngo-operational-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingSkeleton variant="cards" rows={4} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Program & Project Operational Dashboard"
        description="Real MongoDB aggregations across programs, projects, budgets, geography, and attention-required operational items."
        actions={
          <>
            <button
              type="button"
              onClick={loadAnalytics}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </button>
            <PermissionGate permission="project_reports.export">
              <button
                type="button"
                disabled={!data}
                onClick={handleExportSummary}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#087F5B] px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-40"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export CSV Summary</span>
              </button>
            </PermissionGate>
          </>
        }
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {data && (
        <>
          {/* Program & Project KPIs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Programs"
              value={data.programOverview.total}
              accent="emerald"
              icon={<Layers className="h-5 w-5" />}
              footer={`${data.programOverview.active} active • ${data.programOverview.completed} completed • ${data.programOverview.pendingApproval} pending`}
            />
            <StatCard
              title="Total Projects"
              value={data.projectOverview.total}
              accent="sky"
              icon={<FolderKanban className="h-5 w-5" />}
              footer={`${data.projectOverview.active} active • ${data.projectOverview.onHold} on hold • ${data.projectOverview.overdue} overdue`}
            />
            <StatCard
              title="Approved Budget"
              value={`₹${data.budgetOverview.totalApprovedBudget.toLocaleString('en-IN')}`}
              accent="amber"
              icon={<Wallet className="h-5 w-5" />}
              footer={`Actual: ₹${data.budgetOverview.totalActualExpenditure.toLocaleString('en-IN')} (${data.budgetOverview.utilizationPercentage}%)`}
            />
            <StatCard
              title="Attention Required"
              value={
                data.attentionRequired.overdueMilestones.length +
                data.attentionRequired.overdueTasks.length +
                data.attentionRequired.pendingApprovals.length +
                data.attentionRequired.unresolvedHighRisks.length
              }
              accent="rose"
              icon={<AlertTriangle className="h-5 w-5" />}
              footer={`${data.attentionRequired.projectsExceedingPlannedBudgetCount} project(s) over planned budget`}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Monthly Project Creation Trends */}
            <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                Monthly Project Creations
              </h3>
              {data.charts.monthlyProjectCreations.length === 0 ? (
                <EmptyState title="No project data yet" description="Creation trend bars appear once projects exist." />
              ) : (
                <div className="flex items-end gap-2.5 h-44 pt-4">
                  {data.charts.monthlyProjectCreations.map((pt) => {
                    const max = Math.max(1, ...data.charts.monthlyProjectCreations.map((x) => x.count));
                    const h = Math.max(10, Math.round((pt.count / max) * 100));
                    return (
                      <div key={pt.month} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                        <span className="text-[11px] font-bold">{pt.count}</span>
                        <div className="w-full max-w-[36px] rounded-t-lg bg-[#087F5B]" style={{ height: `${h}%` }} />
                        <span className="text-[10px] text-slate-500 text-center">{pt.month}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Department Distribution */}
            <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4 text-sky-600" />
                Projects by Department
              </h3>
              {data.charts.departmentDistribution.length === 0 ? (
                <EmptyState title="No department links yet" description="Assign departments to projects to see breakdown." />
              ) : (
                <div className="space-y-3 text-xs">
                  {data.charts.departmentDistribution.map((d) => {
                    const max = Math.max(1, ...data.charts.departmentDistribution.map((x) => x.count));
                    return (
                      <div key={d.departmentId} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="font-semibold">{d.name}</span>
                          <strong>{d.count}</strong>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div className="h-full bg-sky-600" style={{ width: `${Math.round((d.count / max) * 100)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Geographic Distribution */}
            <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-amber-600" />
                Geographic Coverage (State)
              </h3>
              {data.charts.geographicDistribution.length === 0 ? (
                <EmptyState title="No location data yet" description="Add state & district info to projects to view regional reach." />
              ) : (
                <div className="space-y-2.5 text-xs">
                  {data.charts.geographicDistribution.map((g) => (
                    <div
                      key={g.state}
                      className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-[#162920] px-3 py-2"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{g.state}</span>
                      <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                        {g.count} project{g.count === 1 ? '' : 's'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Attention Required Panels */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 text-xs">
            <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Pending Approvals ({data.attentionRequired.pendingApprovals.length})
              </h3>
              {data.attentionRequired.pendingApprovals.length === 0 ? (
                <p className="text-slate-400 py-4 text-center">No submissions awaiting approval.</p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-[#1d332b]">
                  {data.attentionRequired.pendingApprovals.map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() =>
                        router.push(
                          app.entityType === 'PROGRAM'
                            ? `/dashboard/admin/programs/${app.entityId}`
                            : `/dashboard/admin/projects/${app.entityId}`
                        )
                      }
                      className="w-full py-2.5 text-left flex items-center justify-between hover:text-emerald-600"
                    >
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          [{app.entityType}] {app.entityTitle}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Submitted by {app.submittedBy?.name || 'Staff'} • {app.stage.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-amber-700">Review →</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Overdue Tasks & Unresolved High Risks
              </h3>
              {data.attentionRequired.overdueTasks.length === 0 &&
              data.attentionRequired.unresolvedHighRisks.length === 0 ? (
                <p className="text-slate-400 py-4 text-center">No overdue tasks or high-severity risks detected.</p>
              ) : (
                <div className="space-y-2">
                  {data.attentionRequired.overdueTasks.map((t) => (
                    <div key={t.id} className="rounded-xl border border-rose-100 bg-rose-50/40 dark:border-rose-900/40 dark:bg-rose-950/20 p-3">
                      <p className="font-bold text-rose-800 dark:text-rose-300">[OVERDUE TASK] {t.title}</p>
                      <p className="text-[11px] text-slate-500">
                        Due {new Date(t.dueDate).toLocaleDateString()} • {t.assignee?.name || 'Unassigned'}
                      </p>
                    </div>
                  ))}
                  {data.attentionRequired.unresolvedHighRisks.map((r) => (
                    <div key={r.id} className="rounded-xl border border-amber-100 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20 p-3">
                      <p className="font-bold text-amber-900 dark:text-amber-300">[{r.severity} RISK] {r.title}</p>
                      <p className="text-[11px] text-slate-500">Status: {r.status}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
