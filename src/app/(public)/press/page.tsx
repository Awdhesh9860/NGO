'use client';

import React from 'react';
import Link from 'next/link';
import { Newspaper, Download, Mail, ArrowRight, ExternalLink, ShieldCheck } from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/common/JsonLd';

export default function PressPage() {
  const pressReleases = [
    {
      date: 'January 18, 2026',
      title: 'HopeHorizon Completes 96th Solar Water Purification Plant in Arid Thar Region',
      outlet: 'Official Press Release',
      summary: 'Providing clean fluorosis-free drinking water to over 25,000 rural residents, the initiative achieves full community council operational handover.',
    },
    {
      date: 'November 12, 2025',
      title: 'Annual Audited Financial Statements Published for Public Scrutiny',
      outlet: 'Statutory Transparency Announcement',
      summary: 'Full compliance with Section 80G, 12A, and Darpan statutory disclosures confirms 92.4% direct ground program deployment.',
    },
    {
      date: 'August 05, 2025',
      title: 'Launch of 40 Solar Digital STEM Labs for Secondary Girl Students',
      outlet: 'Education Pillar Dispatch',
      summary: 'Equipping rural classrooms with offline-capable tablet learning stations and female science mentorship.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://hopehorizon.org' },
          { name: 'Press & Media', url: 'https://hopehorizon.org/press' },
        ]}
      />

      <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-950 text-white py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Media Relations & Press Room
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">Press & Media Center</h1>
          <p className="text-slate-200 text-sm sm:text-base max-w-2xl leading-relaxed">
            Official press dispatches, media assets, verified statistical briefings, and direct contact for journalists and documentary researchers.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* Media Kit Banner */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Official Media Kit
            </span>
            <h2 className="text-xl font-bold text-slate-900">Download HopeHorizon Brand & Fact Sheet</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Includes high-resolution vector logos, executive spokesperson headshots, statutory registration certificates, and verified operational chronology.
            </p>
          </div>
          <a
            href="/documents"
            className="inline-flex items-center gap-2 py-3 px-6 rounded-xl font-bold text-xs text-white bg-emerald-700 hover:bg-emerald-800 shadow-md transition"
          >
            <Download className="w-4 h-4" /> Download Press Kit (.ZIP)
          </a>
        </div>

        {/* Press Releases */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Newspaper className="w-6 h-6 text-emerald-600" />
              Official Press Releases
            </h2>
            <Link
              href="/press/media-coverage"
              className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
            >
              External Media Coverage <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {pressReleases.map((pr, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-emerald-500 transition space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-emerald-700">{pr.outlet}</span>
                  <span>{pr.date}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">{pr.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{pr.summary}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Media Contact Box */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-md grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-2">
            <h3 className="text-lg font-bold">Media & Interview Inquiries</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              For on-the-record statements, field interview permissions, or background data requests, please contact our Communications Office.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 md:justify-end">
            <a
              href="mailto:press@hopehorizon.org"
              className="inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition"
            >
              <Mail className="w-4 h-4" /> press@hopehorizon.org
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
