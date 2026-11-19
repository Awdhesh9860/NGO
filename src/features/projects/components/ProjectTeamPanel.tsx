'use client';

import React, { useState } from 'react';
import { ProjectTeamMemberView } from '../services/project-api.service';
import { EmptyState, PermissionGate } from '@/features/admin';
import { UserPlus, UserMinus, Users } from 'lucide-react';

export interface ProjectTeamPanelProps {
  team: ProjectTeamMemberView[];
  availableUsers: Array<{ id: string; name: string; email: string; role: string; status: string }>;
  onAssign: (payload: { userId: string; responsibility: string; accessLevel: 'LEAD' | 'CONTRIBUTOR' | 'VIEWER' }) => Promise<void>;
  onRemove: (userId: string) => Promise<void>;
}

export function ProjectTeamPanel({ team, availableUsers, onAssign, onRemove }: ProjectTeamPanelProps) {
  const [userId, setUserId] = useState('');
  const [responsibility, setResponsibility] = useState('Field Execution');
  const [accessLevel, setAccessLevel] = useState<'LEAD' | 'CONTRIBUTOR' | 'VIEWER'>('CONTRIBUTOR');
  const [busy, setBusy] = useState(false);

  const existingIds = new Set(team.map((m) => m.userId));
  const eligible = availableUsers.filter((u) => u.status === 'active' && !existingIds.has(u.id));

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    try {
      setBusy(true);
      await onAssign({ userId, responsibility, accessLevel });
      setUserId('');
      setResponsibility('Field Execution');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <PermissionGate anyPermissions={['projects.assign', 'projects.manage']}>
        <form
          onSubmit={handleAdd}
          className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-4 grid grid-cols-1 gap-3 sm:grid-cols-4 text-xs"
        >
          <select
            required
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
          >
            <option value="">Select active org member…</option>
            {eligible.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>

          <input
            type="text"
            required
            value={responsibility}
            onChange={(e) => setResponsibility(e.target.value)}
            placeholder="Responsibility (e.g. M&E Lead)"
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
          />

          <select
            value={accessLevel}
            onChange={(e) => setAccessLevel(e.target.value as 'LEAD' | 'CONTRIBUTOR' | 'VIEWER')}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
          >
            <option value="LEAD">Project Lead</option>
            <option value="CONTRIBUTOR">Contributor</option>
            <option value="VIEWER">Viewer</option>
          </select>

          <button
            type="submit"
            disabled={busy || !userId}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#087F5B] px-3.5 py-2 font-bold text-white hover:bg-emerald-700 disabled:opacity-40"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>{busy ? 'Assigning…' : 'Add Member'}</span>
          </button>
        </form>
      </PermissionGate>

      {team.length === 0 ? (
        <EmptyState
          title="No project team assigned yet"
          description="Assign active organization members and define their responsibilities and workload."
          icon={<Users className="h-6 w-6" />}
        />
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-[#1d332b] rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b]">
          {team.map((member) => (
            <div key={member.userId} className="flex flex-wrap items-center justify-between gap-3 p-4 text-xs">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-900 dark:text-white">{member.name}</p>
                  <span className="rounded bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                    {member.accessLevel}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {member.responsibility} • {member.email} ({member.role})
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right text-[11px] text-slate-500">
                  <p>
                    <strong className="text-slate-800 dark:text-slate-200">{member.workload.projectTasks}</strong> project task(s)
                  </p>
                  <p>{member.workload.openTasks} total open task(s)</p>
                </div>

                <PermissionGate anyPermissions={['projects.assign', 'projects.manage']}>
                  <button
                    type="button"
                    onClick={() => onRemove(member.userId)}
                    title="Remove team member"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                  >
                    <UserMinus className="h-4 w-4" />
                  </button>
                </PermissionGate>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
