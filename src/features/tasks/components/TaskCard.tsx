'use client';

import React from 'react';
import { TaskItem } from '../services/task-api.service';
import { Calendar, User, AlertCircle } from 'lucide-react';

const PRIORITY_BADGE: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  MEDIUM: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
  HIGH: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
  URGENT: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
};

export interface TaskCardProps {
  task: TaskItem;
  onStatusChange?: (taskId: string, nextStatus: TaskItem['status']) => void;
  onSelect?: (task: TaskItem) => void;
}

export function TaskCard({ task, onStatusChange, onSelect }: TaskCardProps) {
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== 'COMPLETED' &&
    task.status !== 'CANCELLED';

  return (
    <div
      onClick={() => onSelect?.(task)}
      className={`rounded-xl border p-3.5 text-xs transition ${
        isOverdue
          ? 'border-rose-200 bg-rose-50/30 dark:border-rose-900/60 dark:bg-rose-950/20'
          : 'border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b]'
      } ${onSelect ? 'cursor-pointer hover:border-emerald-400' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${PRIORITY_BADGE[task.priority]}`}>
          {task.priority}
        </span>
        {isOverdue && (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-600">
            <AlertCircle className="h-3 w-3" /> Overdue
          </span>
        )}
      </div>

      <h4 className="mt-2 font-bold text-slate-900 dark:text-white leading-snug">{task.title}</h4>
      {task.project?.name && (
        <p className="mt-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400 truncate">
          {task.project.code} • {task.project.name}
        </p>
      )}

      <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-500">
        <span className="inline-flex items-center gap-1 truncate">
          <User className="h-3 w-3 shrink-0" />
          {task.assignedUser?.name || 'Unassigned'}
        </span>
        {task.dueDate && (
          <span className="inline-flex items-center gap-1 shrink-0">
            <Calendar className="h-3 w-3" />
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-[#087F5B]"
          style={{ width: `${Math.min(100, Math.max(0, task.completionPercentage || 0))}%` }}
        />
      </div>

      {onStatusChange && (
        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-[#1d332b]" onClick={(e) => e.stopPropagation()}>
          <select
            aria-label="Update task status"
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value as TaskItem['status'])}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-2 py-1 text-[10px] font-semibold"
          >
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="REVIEW">REVIEW</option>
            <option value="BLOCKED">BLOCKED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      )}
    </div>
  );
}
