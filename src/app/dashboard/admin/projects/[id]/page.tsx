'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  projectApiService,
  ProjectDetailItem,
  ProjectMilestoneItem,
  ProjectBudgetSummaryView,
  ProjectBudgetEntryItem,
  ProjectDocumentItem,
  ProjectApprovalItem,
  ProjectRiskItem,
  ProjectStatusBadge,
  ProjectProgress,
  ProjectTimeline,
  ProjectTeamPanel,
  RiskRegister,
  ProjectActivityTimeline,
} from '@/features/projects';
import { taskApiService, TaskItem, TaskBoard } from '@/features/tasks';
import { MilestoneTimeline } from '@/features/milestones';
import { ApprovalPanel } from '@/features/project-approvals';
import { BudgetSummary, BudgetUtilizationChart, BUDGET_CATEGORIES } from '@/features/project-budget';
import { ProjectDocumentsPanel } from '@/features/project-documents';
import {
  adminApiService,
  PageHeader,
  LoadingSkeleton,
  PermissionGate,
} from '@/features/admin';
import {
  ArrowLeft,
  Globe,
  Archive,
  AlertCircle,
  CheckCircle2,
  PlusCircle,
  ShieldAlert,
  Trash2,
} from 'lucide-react';

type WorkspaceTab =
  | 'overview'
  | 'milestones'
  | 'tasks'
  | 'team'
  | 'budget'
  | 'documents'
  | 'approvals'
  | 'risks'
  | 'beneficiaries';

export default function AdminProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectDetailItem | null>(null);
  const [milestones, setMilestones] = useState<ProjectMilestoneItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [budgetSummary, setBudgetSummary] = useState<ProjectBudgetSummaryView | null>(null);
  const [budgetEntries, setBudgetEntries] = useState<ProjectBudgetEntryItem[]>([]);
  const [documents, setDocuments] = useState<ProjectDocumentItem[]>([]);
  const [approvals, setApprovals] = useState<ProjectApprovalItem[]>([]);
  const [risks, setRisks] = useState<ProjectRiskItem[]>([]);
  const [orgUsers, setOrgUsers] = useState<Array<{ id: string; name: string; email: string; role: string; status: string }>>([]);

  const [tab, setTab] = useState<WorkspaceTab>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Quick Add Forms
  const [msTitle, setMsTitle] = useState('');
  const [msDate, setMsDate] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskPriority, setTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [taskDue, setTaskDue] = useState('');

  const [budgetCat, setBudgetCat] = useState<(typeof BUDGET_CATEGORIES)[number]>('PERSONNEL');
  const [budgetDesc, setBudgetDesc] = useState('');
  const [budgetPlanned, setBudgetPlanned] = useState(0);
  const [budgetActual, setBudgetActual] = useState(0);

  const loadWorkspace = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [pRes, mRes, tRes, bRes, dRes, aRes, rRes] = await Promise.all([
        projectApiService.getById(projectId),
        projectApiService.listMilestones(projectId).catch(() => ({ success: false, data: [] })),
        taskApiService.list({ projectId, limit: 100 }).catch(() => ({ success: false, data: [] })),
        projectApiService.getBudget(projectId).catch(() => ({ success: false, data: undefined })),
        projectApiService.listDocuments(projectId).catch(() => ({ success: false, data: [] })),
        projectApiService.listApprovals(projectId).catch(() => ({ success: false, data: [] })),
        projectApiService.listRisks(projectId).catch(() => ({ success: false, data: [] })),
      ]);

      if (!pRes.success || !pRes.data) {
        setError(pRes.error?.message || 'Project not found');
        return;
      }

      setProject(pRes.data);
      if (mRes.success && mRes.data) setMilestones(mRes.data);
      if (tRes.success && tRes.data) setTasks(tRes.data);
      if (bRes.success && bRes.data) {
        setBudgetSummary(bRes.data.summary);
        setBudgetEntries(bRes.data.entries);
      }
      if (dRes.success && dRes.data) setDocuments(dRes.data);
      if (aRes.success && aRes.data) setApprovals(aRes.data);
      if (rRes.success && rRes.data) setRisks(rRes.data);
    } catch {
      setError('Failed to load project workspace');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    const id = setTimeout(() => {
      void loadWorkspace();
    }, 0);
    adminApiService
      .getUsers({ limit: 100 })
      .then((res) => {
        if (res.success && res.data) {
          setOrgUsers(
            res.data.map((u) => ({
              id: u.id,
              name: u.name,
              email: u.email,
              role: u.role,
              status: u.status,
            }))
          );
        }
      })
      .catch(() => {});
  }, [loadWorkspace]);

  const handleStatusTransition = async (nextStatus: string) => {
    setError(null);
    setNotice(null);
    const res = await projectApiService.update(projectId, { status: nextStatus as never });
    if (!res.success) setError(res.error?.message || 'Status transition denied');
    else {
      setNotice(`Project transitioned to ${nextStatus}.`);
      loadWorkspace();
    }
  };

  const handleTogglePublic = async () => {
    if (!project) return;
    setError(null);
    const res = await projectApiService.update(projectId, { isPublicVisible: !project.isPublicVisible });
    if (!res.success) setError(res.error?.message || 'Could not toggle public visibility');
    else {
      setNotice(
        !project.isPublicVisible
          ? 'Project published publicly (internal budgets, private docs, risks & beneficiary PII stay strictly hidden).'
          : 'Project unpublished from public site.'
      );
      loadWorkspace();
    }
  };

  if (loading) return <LoadingSkeleton variant="form" rows={6} />;

  if (!project) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-xs text-rose-700">
        {error || 'Project not found'}
      </div>
    );
  }

  const approverUsers = orgUsers.filter((u) =>
    ['SUPER_ADMIN', 'ADMIN', 'EXECUTIVE_DIRECTOR', 'MANAGER'].includes(u.role)
  );

  const tabs: Array<{ id: WorkspaceTab; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'milestones', label: `Milestones (${milestones.length})` },
    { id: 'tasks', label: `Tasks (${tasks.length})` },
    { id: 'team', label: `Team (${project.team.length})` },
    { id: 'budget', label: `Budget (${budgetEntries.length})` },
    { id: 'documents', label: `Documents (${documents.length})` },
    { id: 'approvals', label: `Approvals (${approvals.length})` },
    { id: 'risks', label: `Risks (${risks.length})` },
    { id: 'beneficiaries', label: 'Beneficiaries & Activity' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={project.name}
        description={`${project.code} • ${project.category} • PM: ${project.projectManager?.name || 'Unassigned'}`}
        badge={<ProjectStatusBadge status={project.status} />}
        actions={
          <>
            <button
              type="button"
              onClick={() => router.push('/dashboard/admin/projects')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Projects</span>
            </button>

            {['APPROVED', 'PLANNED', 'ACTIVE', 'COMPLETED'].includes(project.status) && (
              <PermissionGate anyPermissions={['content.publish', 'projects.approve']}>
                <button
                  type="button"
                  onClick={handleTogglePublic}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 dark:border-sky-800 dark:bg-sky-950/50 px-3 py-2 text-xs font-bold text-sky-800 dark:text-sky-300"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>{project.isPublicVisible ? 'Publicly Visible' : 'Publish Publicly'}</span>
                </button>
              </PermissionGate>
            )}

            {(project.status === 'APPROVED' || project.status === 'PLANNED') && (
              <button
                type="button"
                onClick={() => handleStatusTransition('ACTIVE')}
                className="rounded-xl bg-[#087F5B] px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
              >
                Activate Project
              </button>
            )}
            {project.status === 'ACTIVE' && (
              <>
                <button
                  type="button"
                  onClick={() => handleStatusTransition('ON_HOLD')}
                  className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800"
                >
                  Hold
                </button>
                <PermissionGate permission="projects.approve">
                  <button
                    type="button"
                    onClick={() => handleStatusTransition('COMPLETED')}
                    className="rounded-xl bg-teal-600 px-3 py-2 text-xs font-bold text-white"
                  >
                    Complete
                  </button>
                </PermissionGate>
              </>
            )}
            {project.status === 'ON_HOLD' && (
              <button
                type="button"
                onClick={() => handleStatusTransition('ACTIVE')}
                className="rounded-xl bg-[#087F5B] px-3.5 py-2 text-xs font-bold text-white"
              >
                Resume Active
              </button>
            )}
            {project.status !== 'ARCHIVED' && (
              <PermissionGate anyPermissions={['projects.archive', 'projects.manage']}>
                <button
                  type="button"
                  onClick={() => handleStatusTransition('ARCHIVED')}
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

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-[#e2ece6] dark:border-[#1d332b] pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              tab === t.id
                ? 'bg-[#087F5B] text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#172b22]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 text-xs">
            <div className="lg:col-span-2 rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6 space-y-4">
              <ProjectProgress percentage={project.progressPercentage} label="Milestone-Derived Project Progress" />
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{project.shortDescription}</p>
              {project.detailedDescription && (
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {project.detailedDescription}
                </p>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-3 border-t border-slate-100 dark:border-[#1d332b]">
                <div>
                  <p className="text-[11px] font-bold uppercase text-emerald-700 dark:text-emerald-400 mb-1.5">
                    Key Deliverables
                  </p>
                  {project.keyDeliverables?.length > 0 ? (
                    <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-300">
                      {project.keyDeliverables.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  ) : (
                    <p className="text-slate-400">None listed</p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase text-sky-700 dark:text-sky-400 mb-1.5">
                    Expected Outcomes
                  </p>
                  {project.expectedOutcomes?.length > 0 ? (
                    <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-300">
                      {project.expectedOutcomes.map((o, i) => <li key={i}>{o}</li>)}
                    </ul>
                  ) : (
                    <p className="text-slate-400">None listed</p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Operational Metadata</h3>
              <dl className="space-y-2.5">
                <div>
                  <dt className="text-[10px] font-bold uppercase text-slate-400">Parent Program</dt>
                  <dd className="font-semibold text-slate-900 dark:text-white">
                    {project.program ? `${project.program.code} • ${project.program.title}` : 'Independent Project'}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase text-slate-400">Department</dt>
                  <dd className="font-semibold text-slate-900 dark:text-white">
                    {project.department?.name || 'Unassigned'}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase text-slate-400">Geolocation</dt>
                  <dd className="font-semibold text-slate-900 dark:text-white">
                    {[project.village, project.block, project.district, project.state].filter(Boolean).join(', ') ||
                      project.location ||
                      '—'}
                  </dd>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <dt className="text-[10px] font-bold uppercase text-slate-400">Priority</dt>
                    <dd className="font-bold text-slate-900 dark:text-white">{project.priority}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-bold uppercase text-slate-400">Risk Level</dt>
                    <dd className="font-bold text-slate-900 dark:text-white">{project.riskLevel}</dd>
                  </div>
                </div>
              </dl>
            </div>
          </div>

          <ProjectTimeline startDate={project.startDate} endDate={project.endDate} milestones={milestones} />
        </div>
      )}

      {/* TAB 2: MILESTONES */}
      {tab === 'milestones' && (
        <div className="space-y-4">
          <PermissionGate anyPermissions={['milestones.manage', 'projects.manage']}>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!msTitle || !msDate) return;
                const res = await projectApiService.createMilestone(projectId, {
                  title: msTitle,
                  targetDate: msDate,
                  status: 'PENDING',
                  deliverables: [],
                  completionPercentage: 0,
                });
                if (!res.success) setError(res.error?.message || 'Failed to add milestone');
                else {
                  setMsTitle('');
                  setMsDate('');
                  setNotice('Milestone added.');
                  loadWorkspace();
                }
              }}
              className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-4 grid grid-cols-1 gap-3 sm:grid-cols-4 text-xs"
            >
              <input
                required
                type="text"
                value={msTitle}
                onChange={(e) => setMsTitle(e.target.value)}
                placeholder="Milestone Title *"
                className="sm:col-span-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
              />
              <input
                required
                type="date"
                value={msDate}
                onChange={(e) => setMsDate(e.target.value)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1 rounded-xl bg-[#087F5B] px-4 py-2 font-bold text-white hover:bg-emerald-700"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Add Milestone</span>
              </button>
            </form>
          </PermissionGate>

          <MilestoneTimeline
            milestones={milestones}
            onComplete={async (milestoneId) => {
              const res = await projectApiService.updateMilestone(projectId, milestoneId, {
                status: 'COMPLETED',
                completionPercentage: 100,
              });
              if (!res.success) setError(res.error?.message || 'Update failed');
              else loadWorkspace();
            }}
            onDelete={async (milestoneId) => {
              await projectApiService.deleteMilestone(projectId, milestoneId);
              loadWorkspace();
            }}
          />
        </div>
      )}

      {/* TAB 3: TASKS */}
      {tab === 'tasks' && (
        <div className="space-y-4">
          <PermissionGate anyPermissions={['tasks.create', 'tasks.assign_manage']}>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!taskTitle.trim()) return;
                const res = await taskApiService.create({
                  title: taskTitle,
                  projectId,
                  assignedUserId: taskAssignee || null,
                  priority: taskPriority,
                  dueDate: taskDue || null,
                  status: 'TODO',
                  completionPercentage: 0,
                  attachments: [],
                });
                if (!res.success) setError(res.error?.message || 'Could not create task');
                else {
                  setTaskTitle('');
                  setTaskDue('');
                  setNotice('Task created.');
                  loadWorkspace();
                }
              }}
              className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-4 grid grid-cols-1 gap-3 sm:grid-cols-5 text-xs"
            >
              <input
                required
                minLength={3}
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="New Task Title *"
                className="sm:col-span-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
              />
              <select
                value={taskAssignee}
                onChange={(e) => setTaskAssignee(e.target.value)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
              >
                <option value="">Unassigned</option>
                {orgUsers
                  .filter((u) => u.status === 'active')
                  .map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
              </select>
              <input
                type="date"
                value={taskDue}
                onChange={(e) => setTaskDue(e.target.value)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1 rounded-xl bg-[#087F5B] px-3 py-2 font-bold text-white hover:bg-emerald-700"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Add Task</span>
              </button>
            </form>
          </PermissionGate>

          <TaskBoard
            tasks={tasks}
            onStatusChange={async (taskId, nextStatus) => {
              const res = await taskApiService.update(taskId, { status: nextStatus });
              if (!res.success) setError(res.error?.message || 'Task update denied');
              else loadWorkspace();
            }}
          />
        </div>
      )}

      {/* TAB 4: TEAM */}
      {tab === 'team' && (
        <ProjectTeamPanel
          team={project.team}
          availableUsers={orgUsers}
          onAssign={async (payload) => {
            const res = await projectApiService.assignTeamMember(projectId, payload);
            if (!res.success) setError(res.error?.message || 'Assignment failed');
            else {
              setNotice('Team member assigned and notified.');
              loadWorkspace();
            }
          }}
          onRemove={async (userId) => {
            const res = await projectApiService.removeTeamMember(projectId, userId);
            if (!res.success) setError(res.error?.message || 'Removal failed');
            else loadWorkspace();
          }}
        />
      )}

      {/* TAB 5: BUDGET */}
      {tab === 'budget' && (
        <div className="space-y-6">
          {budgetSummary ? (
            <>
              <BudgetSummary summary={budgetSummary} />
              <BudgetUtilizationChart byCategory={budgetSummary.byCategory} />
            </>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
              Budget details require the <code>project_budget.view</code> permission.
            </div>
          )}

          <PermissionGate permission="project_budget.manage">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!budgetDesc.trim()) return;
                const res = await projectApiService.createBudgetEntry(projectId, {
                  budgetPeriod: 'FY 2026-27',
                  category: budgetCat,
                  description: budgetDesc,
                  plannedAmount: Number(budgetPlanned) || 0,
                  actualAmount: Number(budgetActual) || 0,
                });
                if (!res.success) setError(res.error?.message || 'Could not add budget entry');
                else {
                  setBudgetDesc('');
                  setBudgetPlanned(0);
                  setBudgetActual(0);
                  setNotice('Budget entry recorded.');
                  loadWorkspace();
                }
              }}
              className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-4 grid grid-cols-1 gap-3 sm:grid-cols-5 text-xs"
            >
              <select
                value={budgetCat}
                onChange={(e) => setBudgetCat(e.target.value as (typeof BUDGET_CATEGORIES)[number])}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
              >
                {BUDGET_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                ))}
              </select>
              <input
                required
                minLength={3}
                type="text"
                value={budgetDesc}
                onChange={(e) => setBudgetDesc(e.target.value)}
                placeholder="Line item description *"
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
              />
              <input
                type="number"
                min={0}
                value={budgetPlanned}
                onChange={(e) => setBudgetPlanned(Number(e.target.value))}
                placeholder="Planned ₹"
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
              />
              <input
                type="number"
                min={0}
                value={budgetActual}
                onChange={(e) => setBudgetActual(Number(e.target.value))}
                placeholder="Actual ₹"
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1 rounded-xl bg-[#087F5B] px-3 py-2 font-bold text-white hover:bg-emerald-700"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Add Entry</span>
              </button>
            </form>
          </PermissionGate>

          {budgetEntries.length > 0 && (
            <div className="overflow-x-auto rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b]">
              <table className="w-full min-w-[600px] text-left text-xs">
                <thead className="border-b border-slate-100 dark:border-[#1d332b] bg-slate-50 dark:bg-[#162920] text-[11px] uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Period</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3 text-right">Planned</th>
                    <th className="px-4 py-3 text-right">Actual</th>
                    <th className="px-4 py-3 text-right">Variance</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1d332b]">
                  {budgetEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-4 py-3">{entry.budgetPeriod}</td>
                      <td className="px-4 py-3 font-semibold">{entry.category.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3">{entry.description}</td>
                      <td className="px-4 py-3 text-right">₹{entry.plannedAmount.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-right font-bold">₹{entry.actualAmount.toLocaleString('en-IN')}</td>
                      <td className={`px-4 py-3 text-right font-bold ${entry.variance < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                        ₹{entry.variance.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <PermissionGate permission="project_budget.manage">
                          <button
                            type="button"
                            onClick={async () => {
                              await projectApiService.deleteBudgetEntry(projectId, entry.id);
                              loadWorkspace();
                            }}
                            className="rounded p-1 text-slate-400 hover:text-rose-600"
                            title="Delete entry"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </PermissionGate>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: DOCUMENTS */}
      {tab === 'documents' && (
        <ProjectDocumentsPanel
          documents={documents}
          onUpload={async (payload) => {
            const res = await projectApiService.createDocument(projectId, payload);
            if (!res.success) setError(res.error?.message || 'Document upload failed');
            else {
              setNotice('Document metadata stored securely.');
              loadWorkspace();
            }
          }}
          onDelete={async (docId) => {
            await projectApiService.deleteDocument(projectId, docId);
            loadWorkspace();
          }}
        />
      )}

      {/* TAB 7: APPROVALS */}
      {tab === 'approvals' && (
        <ApprovalPanel
          entityType="PROJECT"
          entityStatus={project.status}
          approvals={approvals}
          approvers={approverUsers}
          onSubmitApproval={async (payload) => {
            const res = await projectApiService.submitApproval(projectId, payload);
            if (!res.success) setError(res.error?.message || 'Approval submission failed');
            else {
              setNotice('Project submitted for approval.');
              loadWorkspace();
            }
          }}
          onDecideApproval={async (payload) => {
            const res = await projectApiService.decideApproval(projectId, payload);
            if (!res.success) setError(res.error?.message || 'Approval decision failed');
            else {
              setNotice(`Project ${payload.decision.toLowerCase()}.`);
              loadWorkspace();
            }
          }}
        />
      )}

      {/* TAB 8: RISK REGISTER */}
      {tab === 'risks' && (
        <RiskRegister
          risks={risks}
          onCreate={async (payload) => {
            const res = await projectApiService.createRisk(projectId, payload);
            if (!res.success) setError(res.error?.message || 'Could not log risk');
            else loadWorkspace();
          }}
          onUpdateStatus={async (riskId, status) => {
            await projectApiService.updateRisk(projectId, riskId, { status });
            loadWorkspace();
          }}
          onDelete={async (riskId) => {
            await projectApiService.deleteRisk(projectId, riskId);
            loadWorkspace();
          }}
        />
      )}

      {/* TAB 9: BENEFICIARY SUMMARY & ACTIVITY */}
      {tab === 'beneficiaries' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6 space-y-4 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Safeguarding-Compliant Beneficiary Summary
                </h3>
                <p className="text-[11px] text-slate-500">
                  Aggregated reach & outcomes only — personal identifying information is prohibited and never exposed publicly.
                </p>
              </div>
              {project.beneficiarySummary?.includesMinorBeneficiaries && (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                  <ShieldAlert className="h-3 w-3" /> Child Safeguarding Applies
                </span>
              )}
            </div>

            {project.beneficiarySummary ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 dark:bg-[#162920] p-4">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Target vs Actual Reach</p>
                  <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                    {project.actualBeneficiaries.toLocaleString('en-IN')} /{' '}
                    {project.targetBeneficiaries.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-[#162920] p-4">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Beneficiary Categories</p>
                  <p className="mt-1 font-semibold text-slate-800 dark:text-slate-200">
                    {project.beneficiarySummary.categories?.join(', ') || 'None specified'}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-[#162920] p-4">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Outcome Summary</p>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    {project.beneficiarySummary.outcomeSummary || 'Not yet recorded'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-slate-500">
                Requires <code>beneficiaries.view_project_summary</code> permission to view detailed demographic rollups.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Project Audit Activity</h3>
            <ProjectActivityTimeline items={project.activity || []} />
          </div>
        </div>
      )}
    </div>
  );
}
