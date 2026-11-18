'use client';

import React from 'react';
import Link from 'next/link';
import { Award, CheckCircle2, TrendingUp, Users, Droplets, GraduationCap, ArrowRight, ArrowLeft } from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/common/JsonLd';

export default function AnnualHighlightsPage() {
  const highlights = [
    {
      year: '2025-2026',
      title: 'Decentralized Clean Water & Solar STEM Expansion',
      description: 'Commissioned 96 solar water purification plants delivering 1.2M liters of safe water daily across 88 villages. Expanded digital STEM laboratories to 142 rural schools.',
      metrics: [
        { label: 'Beneficiaries Reached', value: '115,000+' },
        { label: '80G Tax-Exempt Funds Deployed', value: '92.4%' },
        { label: 'Women in Village Councils', value: '62%' },
      ],
    },
    {
      year: '2024-2025',
      title: 'Disaster Relief & Tribal Livelihoods Launch',
      description: 'Distributed 180 tons of emergency relief rations across climate disaster zones within 18 hours of alerts. Established 12 women-led handloom artisan hubs.',
      metrics: [
        { label: 'Families Supported', value: '35,000+' },
        { label: 'Micro-Enterprises Seeded', value: '840' },
        { label: 'Active Ground Volunteers', value: '1,420' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://hopehorizon.org' },
          { name: 'Impact', url: 'https://hopehorizon.org/impact' },
          { name: 'Annual Highlights', url: 'https://hopehorizon.org/impact/annual-highlights' },
        ]}
      />

      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-950 text-white py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <Link
            href="/impact"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Impact Overview
          </Link>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Year-On-Year Outcomes
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">Annual Impact Highlights</h1>
          <p className="text-slate-200 text-sm sm:text-base max-w-2xl leading-relaxed">
            Consolidated review of verified community outcomes, independent third-party evaluations, and statutory fund deployment milestones.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        <div className="space-y-8">
          {highlights.map((h, i) => (
            <div key={i} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200 inline-block w-fit">
                  Fiscal Year {h.year}
                </span>
                <span className="text-xs text-slate-400 font-medium">Verified by Chartered Audit Committee</span>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900">{h.title}</h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{h.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {h.metrics.map((m, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                    <span className="text-2xl font-black text-emerald-700">{m.value}</span>
                    <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mt-1">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
          <h3 className="font-bold text-emerald-950 text-base">Looking for audited financial statements?</h3>
          <p className="text-xs text-emerald-800 max-w-xl mx-auto">
            Our full statutory audit reports, Form 10BD records, and 80G ledgers are published transparently for public inspection.
          </p>
          <div className="pt-2">
            <Link
              href="/transparency/financial-reports"
              className="inline-flex items-center gap-2 text-xs font-bold text-white bg-emerald-700 px-5 py-2.5 rounded-xl hover:bg-emerald-800 shadow-md transition"
            >
              Access Audited Financial Reports <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
