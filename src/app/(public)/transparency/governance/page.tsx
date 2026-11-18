'use client';

import React from 'react';
import Link from 'next/link';
import { Scale, ArrowLeft, ShieldCheck, CheckCircle2, Users } from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/common/JsonLd';

export default function GovernancePage() {
  const policies = [
    { title: 'Independent Board Oversight & Conflict of Interest Policy', code: 'POL-GOV-01', status: 'Enforced' },
    { title: 'Whistleblower Protection & Ethical Conduct Framework', code: 'POL-ETH-03', status: 'Enforced' },
    { title: 'Anti-Corruption, Bribery & Anti-Money Laundering Safeguard', code: 'POL-FIN-08', status: 'Enforced' },
    { title: 'Executive Compensation & Non-Profit Trustee Limitation', code: 'POL-HR-11', status: 'Enforced' },
    { title: 'Child Safeguarding & Protection of Vulnerable Communities', code: 'POL-SAF-02', status: 'Enforced' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://hopehorizon.org' },
          { name: 'Transparency', url: 'https://hopehorizon.org/transparency' },
          { name: 'Governance', url: 'https://hopehorizon.org/transparency/governance' },
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
            Fiduciary Duty
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">Governance & Institutional Integrity</h1>
          <p className="text-slate-200 text-sm sm:text-base max-w-2xl leading-relaxed">
            Our governing board meets quarterly to review internal controls, social ROI, whistleblower reports, and legal compliance.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Institutional Governance Policies</h2>
          <div className="space-y-3">
            {policies.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-slate-400">{p.code}</span>
                  <p className="font-bold text-slate-900 text-sm">{p.title}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
