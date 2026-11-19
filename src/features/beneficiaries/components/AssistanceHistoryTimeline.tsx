'use client';

import React, { useState } from 'react';
import {
  BeneficiaryDetailResponse,
  beneficiaryApiService,
} from '../services/beneficiary-api.service';
import { DEFAULT_ASSISTANCE_CATEGORIES } from '../schemas/beneficiary.schema';
import { PackageCheck } from 'lucide-react';

export function AssistanceHistoryTimeline({
  beneficiaryId,
  assistance,
  canRecord = false,
  onRecorded,
}: {
  beneficiaryId: string;
  assistance: BeneficiaryDetailResponse['assistance'];
  canRecord?: boolean;
  onRecorded?: () => void;
}) {
  const [category, setCategory] = useState<string>(DEFAULT_ASSISTANCE_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [quantityOrUnit, setQuantityOrUnit] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState<
    'APPROVED' | 'SCHEDULED' | 'DELIVERED' | 'FOLLOW_UP_DUE' | 'COMPLETED'
  >('DELIVERED');
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setSubmitting(true);
      const res = await beneficiaryApiService.recordAssistance(beneficiaryId, {
        assistanceCategory: category,
        description: description.trim(),
        quantityOrUnit: quantityOrUnit.trim() || undefined,
        deliveryStatus,
        deliveryDate: deliveryStatus === 'DELIVERED' || deliveryStatus === 'COMPLETED' ? deliveryDate : undefined,
      });
      if (!res.success) {
        setError(res.error?.message || 'Failed to record assistance');
        return;
      }
      setDescription('');
      setQuantityOrUnit('');
      onRecorded?.();
    } catch {
      setError('Network error recording assistance');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs space-y-4">
      <div>
        <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
          <PackageCheck className="h-4 w-4 text-emerald-600" /> Actual Assistance Delivery History
        </h3>
        <p className="text-[11px] text-slate-500">
          Recorded separately from fundraising donations and project budgets.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          {error}
        </div>
      )}

      {canRecord && (
        <form onSubmit={handleSubmit} className="space-y-2.5 pb-4 border-b border-slate-100 dark:border-[#1d332b]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs"
            >
              {DEFAULT_ASSISTANCE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={deliveryStatus}
              onChange={(e) => setDeliveryStatus(e.target.value as typeof deliveryStatus)}
              className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs"
            >
              <option value="APPROVED">Approved</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="DELIVERED">Delivered</option>
              <option value="FOLLOW_UP_DUE">Follow-up Due</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              required
              placeholder="Actual service / assistance delivered *"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="sm:col-span-2 rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs"
            />
            <input
              type="text"
              placeholder="Quantity / Unit (e.g. 1 Kit)"
              value={quantityOrUnit}
              onChange={(e) => setQuantityOrUnit(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3 py-2 text-xs"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-[#087F5B] px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {submitting ? 'Recording...' : 'Record Assistance Delivery'}
          </button>
        </form>
      )}

      {assistance.length === 0 ? (
        <p className="text-xs text-slate-500">No assistance delivery records logged yet.</p>
      ) : (
        <ol className="relative border-l-2 border-emerald-200 dark:border-emerald-900/60 ml-2.5 space-y-3">
          {assistance.map((a) => (
            <li key={a._id} className="ml-4 text-xs">
              <span className="absolute -left-[7px] h-3 w-3 rounded-full bg-emerald-600 ring-4 ring-white dark:ring-[#12221b]" />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-slate-900 dark:text-white">
                  {a.assistanceCategory} {a.quantityOrUnit ? `(${a.quantityOrUnit})` : ''}
                </span>
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                  {a.deliveryStatus}
                </span>
              </div>
              <p className="mt-0.5 text-slate-600 dark:text-slate-300">{a.description}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {a.deliveryDate
                  ? `Delivered: ${new Date(a.deliveryDate).toLocaleDateString('en-IN')}`
                  : `Logged: ${new Date(a.createdAt).toLocaleDateString('en-IN')}`}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
