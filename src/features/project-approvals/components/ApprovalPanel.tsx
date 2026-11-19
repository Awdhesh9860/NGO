'use client';

import React, { useState } from 'react';
import { ProjectApprovalItem } from '@/features/projects/services/project-api.service';
import { EmptyState, StatusBadge, PermissionGate } from '@/features/admin';
import { Send, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

export interface ApprovalPanelProps {
  entityType: 'PROGRAM' | 'PROJECT';
  entityStatus: string;
  approvals: ProjectApprovalItem[];
  approvers: Array<{ id: string; name: string; role: string }>;
  onSubmitApproval: (data: {
    assignedApproverId?: string | null;
    stage: 'DEPARTMENT_HEAD_REVIEW' | 'MANAGER_EXECUTIVE_APPROVAL';
    submissionNotes?: string;
  }) => Promise<void>;
  onDecideApproval: (data: {
    approvalId: string;
    decision: 'APPROVED' | 'REJECTED';
    comments?: string;
    rejectionReason?: string;
  }) => Promise<void>;
}

export function ApprovalPanel({
  entityType,
  entityStatus,
  approvals,
  approvers,
  onSubmitApproval,
  onDecideApproval,
}: ApprovalPanelProps) {
  const [assignedApproverId, setAssignedApproverId] = useState('');
  const [stage, setStage] = useState<'DEPARTMENT_HEAD_REVIEW' | 'MANAGER_EXECUTIVE_APPROVAL'>('DEPARTMENT_HEAD_REVIEW');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [comments, setComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [busy, setBusy] = useState(false);

  const canSubmit = entityStatus === 'DRAFT' || entityStatus === 'REJECTED';
  const activePending = approvals.find((a) => a.status === 'PENDING' || a.status === 'UNDER_REVIEW');
  const approvePermission = entityType === 'PROGRAM' ? 'programs.approve' : 'projects.approve';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setBusy(true);
      await onSubmitApproval({
        assignedApproverId: assignedApproverId || null,
        stage,
        submissionNotes: submissionNotes || undefined,
      });
      setSubmissionNotes('');
    } finally {
      setBusy(false);
    }
  };

  const handleDecision = async (approvalId: string, decision: 'APPROVED' | 'REJECTED') => {
    try {
      setBusy(true);
      await onDecideApproval({
        approvalId,
        decision,
        comments: comments || undefined,
        rejectionReason: decision === 'REJECTED' ? rejectionReason : undefined,
      });
      setComments('');
      setRejectionReason('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4 text-xs">
      {canSubmit && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 space-y-3"
        >
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Submit {entityType === 'PROGRAM' ? 'Program' : 'Project'} for Approval
          </h4>
          <p className="text-[11px] text-slate-500">
            Flow: Submission → Department Head Review → Manager / Executive Director Approval. Self-approval is prohibited server-side.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Review Stage</label>
              <select
                value={stage}
                onChange={(e) =>
                  setStage(e.target.value as 'DEPARTMENT_HEAD_REVIEW' | 'MANAGER_EXECUTIVE_APPROVAL')
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
              >
                <option value="DEPARTMENT_HEAD_REVIEW">Department Head Review</option>
                <option value="MANAGER_EXECUTIVE_APPROVAL">Manager / Executive Director Approval</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assign Approver</label>
              <select
                value={assignedApproverId}
                onChange={(e) => setAssignedApproverId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
              >
                <option value="">Any Authorized Approver</option>
                {approvers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Submission Notes</label>
            <textarea
              rows={2}
              value={submissionNotes}
              onChange={(e) => setSubmissionNotes(e.target.value)}
              placeholder="Summary of scope, budget justification, and readiness"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#087F5B] px-4 py-2 font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{busy ? 'Submitting…' : 'Submit for Approval'}</span>
          </button>
        </form>
      )}

      {activePending && (
        <PermissionGate permission={approvePermission}>
          <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Pending Approval Decision (Revision #{activePending.revisionCount})
              </h4>
              <StatusBadge status={activePending.status} />
            </div>
            <p className="text-slate-700 dark:text-slate-300">
              Submitted by <strong>{activePending.submittedBy?.name || 'User'}</strong> • Stage:{' '}
              <strong>{activePending.stage.replace(/_/g, ' ')}</strong>
            </p>
            {activePending.submissionNotes && (
              <p className="rounded-xl bg-white dark:bg-[#12221b] p-3 text-slate-600 dark:text-slate-300">
                {activePending.submissionNotes}
              </p>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="text"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Approval comments (optional)"
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1d17] px-3 py-2"
              />
              <input
                type="text"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Rejection reason (required to reject)"
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1d17] px-3 py-2"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => handleDecision(activePending.id, 'APPROVED')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#087F5B] px-4 py-2 font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Approve</span>
              </button>
              <button
                type="button"
                disabled={busy || !rejectionReason.trim()}
                onClick={() => handleDecision(activePending.id, 'REJECTED')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 font-bold text-white hover:bg-rose-700 disabled:opacity-40"
              >
                <XCircle className="h-3.5 w-3.5" />
                <span>Reject</span>
              </button>
            </div>
          </div>
        </PermissionGate>
      )}

      {/* Approval History */}
      {approvals.length === 0 ? (
        <EmptyState
          title="No approval submissions yet"
          description="Submit this record for governance review once scope and budget details are ready."
          icon={<ShieldCheck className="h-6 w-6" />}
        />
      ) : (
        <div className="space-y-3">
          {approvals.map((app) => (
            <div
              key={app.id}
              className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-4 space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-slate-900 dark:text-white">
                  Revision #{app.revisionCount} • {app.stage.replace(/_/g, ' ')}
                </span>
                <StatusBadge status={app.status} />
              </div>
              {app.rejectionReason && (
                <p className="text-rose-600 font-semibold">Rejection Reason: {app.rejectionReason}</p>
              )}
              {app.decisionComments && (
                <p className="text-slate-600 dark:text-slate-300">Decision Comments: {app.decisionComments}</p>
              )}
              <ul className="space-y-1 pt-2 border-t border-slate-100 dark:border-[#1d332b] text-[11px] text-slate-500">
                {app.history.map((h, i) => (
                  <li key={i}>
                    <strong>{h.action}</strong> by {h.actorName} ({h.actorRole}) on{' '}
                    {new Date(h.timestamp).toLocaleString()}
                    {h.comments ? ` — "${h.comments}"` : ''}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
