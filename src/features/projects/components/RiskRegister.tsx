'use client';

import React, { useState } from 'react';
import { ProjectRiskItem } from '../services/project-api.service';
import { EmptyState, PermissionGate } from '@/features/admin';
import { AlertTriangle, PlusCircle, Trash2 } from 'lucide-react';

export interface RiskRegisterProps {
  risks: ProjectRiskItem[];
  onCreate: (data: {
    title: string;
    description?: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    likelihood: 'LOW' | 'MEDIUM' | 'HIGH';
    mitigationPlan?: string;
    status: 'OPEN' | 'MITIGATING' | 'RESOLVED' | 'CLOSED';
  }) => Promise<void>;
  onUpdateStatus: (riskId: string, status: 'OPEN' | 'MITIGATING' | 'RESOLVED' | 'CLOSED') => Promise<void>;
  onDelete: (riskId: string) => Promise<void>;
}

const SEVERITY_COLORS: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-amber-50 text-amber-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-rose-100 text-rose-800',
};

export function RiskRegister({ risks, onCreate, onUpdateStatus, onDelete }: RiskRegisterProps) {
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [likelihood, setLikelihood] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [mitigationPlan, setMitigationPlan] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      setSaving(true);
      await onCreate({
        title,
        severity,
        likelihood,
        mitigationPlan: mitigationPlan || undefined,
        status: 'OPEN',
      });
      setTitle('');
      setMitigationPlan('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <PermissionGate anyPermissions={['projects.update', 'projects.manage']}>
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-4 space-y-3 text-xs"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <input
              required
              minLength={3}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Risk title (e.g. Monsoon supply chain delay)"
              className="sm:col-span-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
            />
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
            >
              <option value="LOW">Low Severity</option>
              <option value="MEDIUM">Medium Severity</option>
              <option value="HIGH">High Severity</option>
              <option value="CRITICAL">Critical Severity</option>
            </select>
            <select
              value={likelihood}
              onChange={(e) => setLikelihood(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
            >
              <option value="LOW">Low Likelihood</option>
              <option value="MEDIUM">Medium Likelihood</option>
              <option value="HIGH">High Likelihood</option>
            </select>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={mitigationPlan}
              onChange={(e) => setMitigationPlan(e.target.value)}
              placeholder="Mitigation plan & contingency actions"
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
            />
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#087F5B] px-4 py-2 font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Log Risk</span>
            </button>
          </div>
        </form>
      </PermissionGate>

      {risks.length === 0 ? (
        <EmptyState
          title="No project risks logged"
          description="Document operational, regulatory, or field risks and their mitigation plans here."
          icon={<AlertTriangle className="h-6 w-6" />}
        />
      ) : (
        <div className="space-y-2.5">
          {risks.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${SEVERITY_COLORS[r.severity]}`}>
                    {r.severity}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{r.title}</span>
                  <span className="text-[10px] text-slate-400">Likelihood: {r.likelihood}</span>
                </div>
                {r.mitigationPlan && (
                  <p className="text-slate-600 dark:text-slate-300">
                    <strong>Mitigation:</strong> {r.mitigationPlan}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={r.status}
                  onChange={(e) =>
                    onUpdateStatus(r.id, e.target.value as 'OPEN' | 'MITIGATING' | 'RESOLVED' | 'CLOSED')
                  }
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-2 py-1 text-[11px] font-semibold"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="MITIGATING">MITIGATING</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
                <button
                  type="button"
                  onClick={() => onDelete(r.id)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  title="Delete risk"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
