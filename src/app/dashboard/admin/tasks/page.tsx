//////////////////////////////////////////////////////////////////'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  taskApiService,
  TaskItem,
  TaskBoard,
  TASK_STATUSES,
  TASK_PRIORITIES,
} from '@/features/tasks';
import { projectApiService } from '@/features/projects';
import {
  adminApiService,
  PageHeader,
  SearchFilterBar,
  LoadingSkeleton,
  PermissionGate,
} from '@/features/admin';
import { PlusCircle, AlertCircle, X, MessageSquare, Clock } from 'lucide-react';

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [projects, setProjects] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [users, setUsers] = useState<Array<{ id: string; name: string; status: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(false);

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    projectId: '',
    assignedUserId: '',
    priority: 'MEDIUM' as (typeof TASK_PRIORITIES)[number],
    dueDate: '',
    estimatedEffortHours: 4,
  });

  // Drawer for task details & comments
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [commentBody, setCommentBody] = useState('');

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await taskApiService.list({
        limit: 100,
        search: search || undefined,
        projectId: projectFilter || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        overdueOnly,
      });
      if (res.success && res.data) setTasks(res.data);
      else setError(res.error?.message || 'Failed to load tasks');
    } catch {
      setError('Unable to reach task management API');
    } finally {
      setLoading(false);
    }
  }, [search, projectFilter, statusFilter, priorityFilter, overdueOnly]);

  useEffect(() => {
    const id = setTimeout(() => {
      void loadTasks();
    }, 0);
    return () => clearTimeout(id);
  }, [loadTasks]);

  useEffect(() => {
    Promise.all([
      projectApiService.list({ limit: 100 }).catch(() => ({ success: false, data: [] })),
      adminApiService.getUsers({ limit: 100 }).catch(() => ({ success: false, data: [] })),
    ]).then(([pRes, uRes]) => {
      if (pRes.success && pRes.data) setProjects(pRes.data.map((p) => ({ id: p.id, name: p.name, code: p.code })));
      if (uRes.success && uRes.data)
        setUsers(uRes.data.filter((u) => u.status === 'active').map((u) => ({ id: u.id, name: u.name, status: u.status })));
    });
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await taskApiService.create({
      title: form.title,
      description: form.description || undefined,
      projectId: form.projectId,
      assignedUserId: form.assignedUserId || null,
      priority: form.priority,
      dueDate: form.dueDate || null,
      estimatedEffortHours: Number(form.estimatedEffortHours) || undefined,
      status: 'TODO',
      completionPercentage: 0,
      attachments: [],
    });
    if (!res.success) {
      setError(res.error?.message || 'Could not create task');
      return;
    }
    setCreateOpen(false);
    setForm({ title: '', description: '', projectId: '', assignedUserId: '', priority: 'MEDIUM', dueDate: '', estimatedEffortHours: 4 });
    loadTasks();
  };

  const handleStatusChange = async (taskId: string, nextStatus: TaskItem['status']) => {
    setError(null);
    const res = await taskApiService.update(taskId, { status: nextStatus });
    if (!res.success) setError(res.error?.message || 'Task update denied');
    else loadTasks();
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !commentBody.trim()) return;
    const res = await taskApiService.update(selectedTask.id, { commentBody: commentBody.trim() });
    if (res.success && res.data) {
      setSelectedTask({ ...selectedTask, comments: res.data.comments });
      setCommentBody('');
      loadTasks();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Task Management"
        description="Track field tasks, assign ownership, monitor overdue items, and update delivery progress across projects."
        actions={
          <PermissionGate anyPermissions={['tasks.create', 'tasks.assign_manage']}>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#087F5B] px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Create Task</span>
            </button>
          </PermissionGate>
        }
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search tasks by title or description…"
        filters={[
          {
            id: 'project',
            label: 'All Projects',
            value: projectFilter,
            onChange: setProjectFilter,
            options: projects.map((p) => ({ label: `${p.code} • ${p.name}`, value: p.id })),
          },
          {
            id: 'status',
            label: 'All Statuses',
            value: statusFilter,
            onChange: setStatusFilter,
            options: TASK_STATUSES.map((s) => ({ label: s.replace(/_/g, ' '), value: s })),
          },
          {
            id: 'priority',
            label: 'All Priorities',
            value: priorityFilter,
            onChange: setPriorityFilter,
            options: TASK_PRIORITIES.map((p) => ({ label: p, value: p })),
          },
        ]}
        rightSlot={
          <label className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs font-semibold text-rose-600 cursor-pointer">
            <input
              type="checkbox"
              checked={overdueOnly}
              onChange={(e) => setOverdueOnly(e.target.checked)}
              className="rounded border-slate-300 text-rose-600"
            />
            <span>Overdue Only</span>
          </label>
        }
        onReset={() => {
          setSearch('');
          setProjectFilter('');
          setStatusFilter('');
          setPriorityFilter('');
          setOverdueOnly(false);
        }}
      />

      {loading ? (
        <LoadingSkeleton variant="cards" rows={4} />
      ) : (
        <TaskBoard
          tasks={tasks}
          onStatusChange={handleStatusChange}
          onSelectTask={(t) => setSelectedTask(t)}
        />
      )}

      {/* Create Task Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1d332b] pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create Project Task</h3>
              <button type="button" onClick={() => setCreateOpen(false)} className="rounded-lg p-1 text-slate-400">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Project *</label>
                <select
                  required
                  value={form.projectId}
                  onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
                >
                  <option value="">Select project…</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.code} • {p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Task Title *</label>
                <input
                  required
                  minLength={3}
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Assignee</label>
                  <select
                    value={form.assignedUserId}
                    onChange={(e) => setForm({ ...form, assignedUserId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as (typeof TASK_PRIORITIES)[number] })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
                  >
                    {TASK_PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Due Date</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Est. Effort (Hrs)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.estimatedEffortHours}
                    onChange={(e) => setForm({ ...form, estimatedEffortHours: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setCreateOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2 font-semibold">
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-[#087F5B] px-4 py-2 font-bold text-white hover:bg-emerald-700">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Details Drawer */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs">
          <div className="h-full w-full max-w-md overflow-y-auto border-l border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-6 shadow-2xl space-y-5 text-xs">
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-[#1d332b] pb-3">
              <div>
                <p className="text-[10px] font-bold uppercase text-emerald-700">
                  {selectedTask.project?.code} • {selectedTask.priority}
                </p>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedTask.title}</h3>
              </div>
              <button type="button" onClick={() => setSelectedTask(null)} className="rounded-lg p-1 text-slate-400">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-slate-600 dark:text-slate-300">{selectedTask.description || 'No description provided.'}</p>

            <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 dark:bg-[#162920] p-3">
              <div>
                <p className="text-[10px] uppercase text-slate-400 font-bold">Assignee</p>
                <p className="font-semibold">{selectedTask.assignedUser?.name || 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-slate-400 font-bold">Due Date</p>
                <p className="font-semibold inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : 'None'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white inline-flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                Activity & Comments ({selectedTask.comments?.length || 0})
              </h4>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {(selectedTask.comments || []).map((c, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-100 dark:border-[#1d332b] p-2.5">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <strong className="text-slate-700 dark:text-slate-200">{c.authorName}</strong>
                      <span>{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="mt-1 text-slate-600 dark:text-slate-300">{c.body}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  placeholder="Add a field update or comment…"
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
                />
                <button type="submit" className="rounded-xl bg-[#087F5B] px-3 py-2 font-bold text-white">
                  Post
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
