'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { PageHeader, PermissionGate } from '@/features/admin';
import {
  complianceApiService,
  ComplianceDeadlinesSummary,
  ComplianceDeadlineTimeline,
  ComplianceRecordItem,
  ComplianceStatusBadge,
} from '@/features/compliance';
import { CheckCircle2, Info, Plus, RefreshCw } from 'lucide-react';

const COMPLIANCE_TYPES = [
  '12A',
  '80G',
  'PAN',
  'TAN',
  'NGO_DARPAN',
  'CSR_1',
  'FCRA',
  'ANNUAL_AUDIT',
  'FINANCIAL_STATEMENTS',
  'BOARD_RESOLUTION',
  'ANNUAL_RETURN',
  'STATUTORY_FILING',
  'CUSTOM',
];

export default function AdminCompliancePage() {
  const [records, setRecords] = useState<ComplianceRecordItem[]>([]);
  const [deadlines, setDeadlines] = useState<ComplianceDeadlinesSummary | null>(null);

  const [complianceType, setComplianceType] = useState('12A');
  const [title, setTitle] = useState('');
  const [jurisdiction, setJurisdiction] = useState('India');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [rRes, dRes] = await Promise.all([
      complianceApiService.listRecords(),
      complianceApiService.getDeadlines(),
    ]);
    if (rRes.success && rRes.data) setRecords(rRes.data);
    if (dRes.success && dRes.data) setDeadlines(dRes.data);
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) void loadData();
    });
    return () => {
      active = false;
    };
  }, [loadData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await complianceApiService.createRecord({
      complianceType,
      title,
      jurisdiction,
      registrationNumber: registrationNumber || undefined,
      expiryDate: expiryDate || undefined,
    });
    if (!res.success) setError(res.error?.message || 'Unable to save compliance record');
    else {
      setNotice('Compliance record saved as DOCUMENT_RECORDED (requires privileged compliance.verify for verified status).');
      setTitle('');
      setRegistrationNumber('');
      setExpiryDate('');
      await loadData();
    }
  };

  const handleVerify = async (id: string) => {
    const notes = window.prompt('Enter independent CA/legal verification notes:');
    if (!notes?.trim()) return;
    setError(null);
    const res = await complianceApiService.updateRecord(id, {
      action: 'VERIFY',
      verificationNotes: notes.trim(),
    });
    if (!res.success) setError(res.error?.message || 'Verification failed');
    else {
      setNotice('Record marked INDEPENDENTLY_VERIFIED.');
      await loadData();
    }
  };

  const handleRenew = async (id: string) => {
    const nextExpiry = window.prompt('Enter renewed expiry date (YYYY-MM-DD):');
    if (!nextExpiry?.trim()) return;
    setError(null);
    const res = await complianceApiService.updateRecord(id, {
      action: 'RENEW',
      expiryDate: nextExpiry.trim(),
    });
    if (!res.success) setError(res.error?.message || 'Renewal update failed');
    else {
      setNotice('Renewal recorded; status reset to DOCUMENT_RECORDED pending independent re-verification.');
      await loadData();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="NGO Statutory Compliance & Filing Deadlines"
        description="Configurable registry for 12A, 80G, PAN, TAN, NGO Darpan, CSR-1, FCRA, audits, and board resolutions. Strictly separates internally recorded documents from independently verified compliance."
      />

      {deadlines?.legalDisclaimer && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/20 px-4 py-3 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{deadlines.legalDisclaimer}</span>
        </div>
      )}

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</div>}
      {notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">{notice}</div>}

      <PermissionGate permission="compliance.manage">
        <form
          onSubmit={handleCreate}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3"
        >
          <select
            value={complianceType}
            onChange={(e) => setComplianceType(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs"
          >
            {COMPLIANCE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <input
            type="text"
            required
            placeholder="Record Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs"
          />
          <input
            type="text"
            required
            placeholder="Jurisdiction (e.g. India)"
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs"
          />
          <input
            type="text"
            placeholder="Reg / Filing # (Optional)"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs font-mono"
          />
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1a14] px-3 py-2 text-xs"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1 rounded-xl bg-[#087F5B] px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
          >
            <Plus className="h-3.5 w-3.5" /> Add Record
          </button>
        </form>
      </PermissionGate>

      {deadlines && (
        <ComplianceDeadlineTimeline
          overdue={deadlines.overdue}
          dueSoon={deadlines.dueSoon}
          upcoming={deadlines.upcoming}
        />
      )}

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-xs">
          <thead className="bg-slate-50 dark:bg-[#0d1a14] text-slate-500 uppercase text-[11px]">
            <tr>
              <th className="px-4 py-3">Type & Title</th>
              <th className="px-4 py-3">Jurisdiction</th>
              <th className="px-4 py-3">Reg / Ref #</th>
              <th className="px-4 py-3">Expiry / Deadline</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {records.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  No statutory compliance records entered yet. Add only registrations applicable to your NGO.
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-[#087F5B] dark:text-emerald-400 mr-1.5">
                      [{r.complianceType}]
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">{r.title}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{r.jurisdiction}</td>
                  <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-200">
                    {r.registrationNumber || 'Not Recorded'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {r.expiryDate
                      ? new Date(r.expiryDate).toLocaleDateString('en-IN')
                      : r.filingDeadline
                      ? new Date(r.filingDeadline).toLocaleDateString('en-IN')
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <ComplianceStatusBadge status={r.validityStatus} />
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap space-x-1.5">
                    {r.validityStatus !== 'INDEPENDENTLY_VERIFIED' && r.validityStatus !== 'NOT_APPLICABLE' && (
                      <PermissionGate permission="compliance.verify">
                        <button
                          type="button"
                          onClick={() => handleVerify(r.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#087F5B] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700"
                        >
                          <CheckCircle2 className="h-3 w-3" /> Verify
                        </button>
                      </PermissionGate>
                    )}
                    <PermissionGate permission="compliance.manage">
                      <button
                        type="button"
                        onClick={() => handleRenew(r.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-[11px] font-semibold"
                      >
                        <RefreshCw className="h-3 w-3" /> Renew
                      </button>
                    </PermissionGate>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
