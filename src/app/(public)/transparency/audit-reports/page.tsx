'use client';

import React from 'react';
import Link from 'next/link';
import { Download, ArrowLeft, ShieldCheck, Scale } from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/common/JsonLd';

export default function AuditReportsPage() {
  const auditReports = [
    { title: 'Independent Auditor Statutory Opinion FY 2025-26', firm: 'Deloitte Haskins & Sells', conclusion: 'Clean Unqualified Audit Opinion' },
    { title: 'Internal Social Impact & Beneficiary Validation Audit', firm: 'Third-Party Impact Evaluation Bureau', conclusion: 'Exemplary Fund Deployment (>92%)' },
    { title: 'Information Security & Data Protection Audit (ISO 27001 / GDPR)', firm: 'CyberSafe Compliance Labs', conclusion: 'Certified Compliant' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://hopehorizon.org' },
          { name: 'Transparency', url: 'https://hopehorizon.org/transparency' },
          { name: 'Audit Reports', url: 'https://hopehorizon.org/transparency/audit-reports' },
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
            Independent Verification
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">Statutory Audit Opinions</h1>
          <p className="text-slate-200 text-sm sm:text-base max-w-2xl leading-relaxed">
            Independent external evaluations of our internal financial controls, donor fund allocation, and programmatic delivery integrity.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        {auditReports.map((r, i) => (
          <div key={i} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Audited By: {r.firm}
              </span>
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> {r.conclusion}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{r.title}</h2>
            <div className="pt-2">
              <a
                href="/documents"
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:underline"
              >
                <Download className="w-3.5 h-3.5" /> View Certified PDF Audit Letter
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
