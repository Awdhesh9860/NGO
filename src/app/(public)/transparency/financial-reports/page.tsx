'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Download, ArrowLeft, ShieldCheck, PieChart } from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/common/JsonLd';

export default function FinancialReportsPage() {
  const financialDocs = [
    { title: 'Audited Financial Statements & Balance Sheet FY 2025-26', auditor: 'Deloitte Haskins & Sells', date: 'Published Sept 2025' },
    { title: 'Statutory Form 10BD Statement of Donations', auditor: 'Income Tax Department Submission', date: 'Filed May 2025' },
    { title: 'Quarterly FCRA Foreign Contribution Ledger', auditor: 'Ministry of Home Affairs MHA', date: 'Quarter Ending Dec 2025' },
    { title: 'Audited Financial Statements FY 2024-25', auditor: 'Deloitte Haskins & Sells', date: 'Published Sept 2024' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://hopehorizon.org' },
          { name: 'Transparency', url: 'https://hopehorizon.org/transparency' },
          { name: 'Financial Reports', url: 'https://hopehorizon.org/transparency/financial-reports' },
        ]}
      />

      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <Link
            href="/transparency"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Transparency Portal
          </Link>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Fiscal Accountability
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">Audited Financial Reports</h1>
          <p className="text-slate-200 text-sm sm:text-base max-w-2xl leading-relaxed">
            Every rupee received is audited by independent chartered accountants. Download verified receipts, Form 10BD filings, and expenditure accounts.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="space-y-4">
          {financialDocs.map((doc, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-500 transition">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {doc.auditor}
                </span>
                <h2 className="font-bold text-slate-900 text-base">{doc.title}</h2>
                <p className="text-xs text-slate-400">{doc.date}</p>
              </div>

              <a
                href="/documents"
                className="inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-bold text-xs text-white bg-emerald-700 hover:bg-emerald-800 transition shadow-sm flex-shrink-0"
              >
                <Download className="w-4 h-4" /> Download Filing
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
