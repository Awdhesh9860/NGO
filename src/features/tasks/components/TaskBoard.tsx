'use client';

import React from 'react';
import { TaskItem } from '../services/task-api.service';
import { TaskCard } from './TaskCard';
import { EmptyState } from '@/features/admin';

const BOARD_COLUMNS: Array<{ status: TaskItem['status']; label: string }> = [
  { status: 'TODO', label: 'To Do' },
  { status: 'IN_PROGRESS', label: 'In Progress' },
  { status: 'REVIEW', label: 'Review' },
  { status: 'BLOCKED', label: 'Blocked' },
  { status: 'COMPLETED', label: 'Completed' },
];

export interface TaskBoardProps {
  tasks: TaskItem[];
  onStatusChange?: (taskId: string, nextStatus: TaskItem['status']) => void;
  onSelectTask?: (task: TaskItem) => void;
}

export function TaskBoard({ tasks, onStatusChange, onSelectTask }: TaskBoardProps) {
  if (!tasks || tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks on this board yet"
        description="Create tasks with priorities, assignees, and due dates to coordinate delivery."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-5">
      {BOARD_COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.status);
        return (
          <div
            key={col.status}
            className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-slate-50/70 dark:bg-[#0f1d17]/70 p-3 flex flex-col gap-2.5 min-h-[220px]"
          >
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                {col.label}
              </span>
              <span className="rounded-full bg-white dark:bg-[#12221b] border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-200">
                {colTasks.length}
              </span>
            </div>

            <div className="space-y-2.5 flex-1">
              {colTasks.length === 0 ? (
                <p className="py-8 text-center text-[11px] text-slate-400">Empty</p>
              ) : (
                colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={onStatusChange}
                    onSelect={onSelectTask}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
