'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Download, ArrowLeft, ShieldCheck } from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/common/JsonLd';

export default function AnnualReportsPage() {
  const reports = [
    { year: '2025-2026', title: 'Comprehensive Annual Impact & Community Report', pages: 48, size: '4.2 MB' },
    { year: '2024-2025', title: 'Annual Field Delivery & Transformation Review', pages: 42, size: '3.8 MB' },
    { year: '2023-2024', title: 'Annual Sustainable Development Program Audit', pages: 36, size: '3.1 MB' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://hopehorizon.org' },
          { name: 'Transparency', url: 'https://hopehorizon.org/transparency' },
          { name: 'Annual Reports', url: 'https://hopehorizon.org/transparency/annual-reports' },
        ]}
      />

      <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-950 text-white py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <Link
            href="/transparency"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Transparency Portal
          </Link>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Open Disclosures
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">Annual Activity & Impact Reports</h1>
          <p className="text-slate-200 text-sm sm:text-base max-w-2xl leading-relaxed">
            Comprehensive annual publications detailing program achievements, strategic milestones, beneficiary feedback, and audited outcomes.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((rep, idx) => (
            <div key={idx} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:border-emerald-500 transition space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Fiscal {rep.year}
                </span>
                <h2 className="font-bold text-slate-900 text-base">{rep.title}</h2>
                <p className="text-xs text-slate-500">{rep.pages} Pages • Full Color Verified PDF • {rep.size}</p>
              </div>

              <a
                href="/documents"
                className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition border border-emerald-200"
              >
                <Download className="w-4 h-4" /> Download PDF Report
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
