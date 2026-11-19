'use client';

import React from 'react';
import { formatMinorCurrency } from '@/lib/money';
import { Download } from 'lucide-react';

export interface FinancialReportSection {
  heading: string;
  rows: Array<{ code?: string; label: string; amountMinor: number }>;
  subtotalMinor: number;
}

interface FinancialReportViewerProps {
  title: string;
  subtitle: string;
  sections: FinancialReportSection[];
  summaryLabel: string;
  summaryAmountMinor: number;
  currency?: string;
  exportCsvHref?: string;
}

export function FinancialReportViewer({
  title,
  subtitle,
  sections,
  summaryLabel,
  summaryAmountMinor,
  currency = 'INR',
  exportCsvHref,
}: FinancialReportViewerProps) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12221b] overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-4 bg-slate-50 dark:bg-[#0d1a14] border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        {exportCsvHref && (
          <a
            href={exportCsvHref}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12221b] px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </a>
        )}
      </div>

      <div className="p-4 sm:p-5 space-y-5">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#087F5B] dark:text-emerald-400">
              {section.heading}
            </h4>
            {section.rows.length === 0 ? (
              <p className="text-xs text-slate-500 pl-2">No posted entries in this section.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-100 dark:border-slate-800">
                {section.rows.map((r, rIdx) => (
                  <div key={rIdx} className="flex items-center justify-between gap-3 px-3 py-2 text-xs">
                    <span className="text-slate-700 dark:text-slate-200 truncate">
                      {r.code && <span className="font-mono font-bold mr-2 text-slate-500">{r.code}</span>}
                      {r.label}
                    </span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      {formatMinorCurrency(r.amountMinor, currency)}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between px-3 py-2 text-xs font-bold bg-slate-50/70 dark:bg-[#0d1a14]">
                  <span>Total {section.heading}</span>
                  <span className="font-mono">{formatMinorCurrency(section.subtotalMinor, currency)}</span>
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/50 px-4 py-3 flex items-center justify-between text-sm font-extrabold">
          <span className="text-emerald-900 dark:text-emerald-200">{summaryLabel}</span>
          <span className="font-mono text-emerald-900 dark:text-emerald-100">
            {formatMinorCurrency(summaryAmountMinor, currency)}
          </span>
        </div>
      </div>
    </div>
  );
}
