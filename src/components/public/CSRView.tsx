import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  Building,
  ShieldCheck,
  TrendingUp,
  FileText,
  CheckCircle2,
  Send,
  Download,
  Award,
  Globe
} from 'lucide-react';

export const CSRView: React.FC = () => {
  const { partners } = useDatabase();
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [budgetRange, setBudgetRange] = useState('$25,000 - $50,000');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (companyName && workEmail) {
      setSubmitted(true);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 space-y-12">
      {/* Banner */}
      <div className="rounded-3xl bg-slate-900 p-8 sm:p-14 text-white shadow-xl text-center space-y-4">
        <span className="inline-block rounded-full bg-emerald-500/30 px-3.5 py-1 text-xs font-bold text-emerald-300 uppercase tracking-wider">
          Institutional Philanthropy & ESG
        </span>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
          Corporate Social Responsibility (CSR) Partnerships
        </h1>
        <p className="mx-auto max-w-2xl text-xs sm:text-sm text-slate-300 leading-relaxed">
          Co-create high-impact, audited social development programs aligned with UN Sustainable Development Goals (SDGs) and Section 135 CSR mandates.
        </p>
      </div>

      {/* 3 Value Props */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-3 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">100% Statutory Compliance</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Full compliance with Section 80G tax deductions, MCA CSR-1 registration, and audited impact assessment reports.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-3 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <TrendingUp className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Live Milestone & ESG Metrics</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Dedicated enterprise dashboard with quarterly beneficiary telemetry, water volume logs, and student metrics.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-3 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
            <Globe className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Employee Engagement Days</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Structured volunteer immersion camps for your corporate teams to plant trees, install solar lamps, and mentor students.
          </p>
        </div>
      </div>

      {/* Main Grid: Form + Existing Partners */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Form */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-md">
          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Partnership Proposal Dispatched!</h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Thank you. Our Institutional Giving Director will contact <strong className="text-slate-900">{workEmail}</strong> within 24 hours with custom project dossiers and MOU drafts.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
              >
                Submit Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Corporate Partnership Inquiry</h3>
                <p className="text-xs text-slate-500">Request project dossiers and tax structuring guides.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Company / Foundation Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Global Technologies"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rachel Adams (CSR Head)"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Corporate Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="csr@apexcorp.com"
                    value={workEmail}
                    onChange={(e) => setWorkEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Annual CSR Budget Allocation
                  </label>
                  <select
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 outline-none bg-white"
                  >
                    <option value="$10,000 - $25,000">$10,000 - $25,000</option>
                    <option value="$25,000 - $50,000">$25,000 - $50,000</option>
                    <option value="$50,000 - $150,000">$50,000 - $150,000</option>
                    <option value="$150,000+">$150,000+ (Multi-Village Adoption)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Target Impact Sector
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {['Clean Water Plants', 'Digital Smart Schools', 'Women Handlooms', 'Disaster Relief'].map(
                    (sec) => (
                      <label key={sec} className="flex items-center gap-1.5 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                        <span className="text-[11px] font-medium text-slate-700">{sec}</span>
                      </label>
                    )
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-xs font-bold text-white shadow-lg hover:bg-emerald-700 transition"
              >
                <Send className="h-4 w-4" />
                Request CSR Partnership Dossier & Tax Proposal
              </button>
            </form>
          )}
        </div>

        {/* Right: Partner Roster & Documents */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Trusted Corporate Partners
            </h4>
            <div className="space-y-3">
              {partners.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Building className="h-6 w-6 text-emerald-700" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{p.companyName}</p>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Since {p.startDate} • {p.tier} Partner
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700">
                    ${p.totalContributed.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900 p-6 text-white space-y-3">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Statutory CSR Tax Benefits
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Donations qualify for 50% tax deductions under Section 80G and fulfill mandatory 2% CSR obligations under Section 135 of the Companies Act with certified utilization certificates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
