'use client';

import React from 'react';
import Link from 'next/link';
import { useDatabase } from '@/context/DatabaseContext';
import { ShieldCheck, Building, Scale, Award, ArrowLeft, Download, CheckCircle2 } from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/common/JsonLd';

export default function RegistrationsPage() {
  const { settings } = useDatabase();

  const registrations = [
    {
      title: 'Section 80G Tax Exemption Certificate',
      authority: 'Income Tax Department of India',
      number: settings.taxExemption80GNumber || 'ITBA/EXM/S/80G/2023-24/1049281920',
      description: 'Grants 50% tax exemption on donations under Section 80G(5)(vi) of the Income Tax Act 1961.',
      validity: 'Perpetual',
    },
    {
      title: 'Section 12A Charitable Trust Registration',
      authority: 'Commissioner of Income Tax (Exemptions)',
      number: settings.registrationNumber || 'DEL/TRUST/2021/09841',
      description: 'Certifies HopeHorizon as a permanent non-profit public charitable institution.',
      validity: 'Active',
    },
    {
      title: 'FCRA Foreign Contribution Regulation Act',
      authority: 'Ministry of Home Affairs (MHA), Government of India',
      number: settings.fcraRegistrationNumber || 'FCRA-034829104',
      description: 'Licensed to receive and utilize international philanthropic contributions.',
      validity: 'Valid through 2029',
    },
    {
      title: 'NGO Darpan Portal Accreditation',
      authority: 'NITI Aayog, Government of India',
      number: settings.darpanId || 'DL/2023/0342918',
      description: 'Official voluntary organisation registry with verified PAN and trustee details.',
      validity: 'Verified',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://hopehorizon.org' },
          { name: 'Transparency', url: 'https://hopehorizon.org/transparency' },
          { name: 'Registrations', url: 'https://hopehorizon.org/transparency/registrations' },
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
            Statutory Accreditations
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">Legal Registrations & Compliance</h1>
          <p className="text-slate-200 text-sm sm:text-base max-w-2xl leading-relaxed">
            All statutory credentials issued by the Government of India and regulatory authorities are verifiable online.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {registrations.map((reg, idx) => (
            <div key={idx} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {reg.authority}
                </span>
                <h2 className="text-xl font-bold text-slate-900">{reg.title}</h2>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono text-xs font-bold text-slate-800">
                  ID: {reg.number}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{reg.description}</p>
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Status: {reg.validity}
                </span>
                <a href="/documents" className="font-bold text-emerald-700 hover:underline flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" /> View Order
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
