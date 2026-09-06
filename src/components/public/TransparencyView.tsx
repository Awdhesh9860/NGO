import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  ShieldCheck,
  FileText,
  Download,
  Award,
  CheckCircle2,
  Lock,
  Building,
  Scale,
  PieChart,
  ArrowRight
} from 'lucide-react';

interface TransparencyViewProps {
  onNavigate?: (view: string) => void;
}

export const TransparencyView: React.FC<TransparencyViewProps> = ({ onNavigate }) => {
  const { reports, settings } = useDatabase();
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const handleDownload = (title: string) => {
    setDownloadNotice(`Official PDF file: "${title}" is ready for review.`);
    setTimeout(() => setDownloadNotice(null), 4000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 space-y-12">
      {/* Header Banner */}
      <div className="rounded-3xl bg-slate-900 p-8 sm:p-14 text-white shadow-xl">
        <span className="inline-block rounded-full bg-emerald-500/30 px-3.5 py-1 text-xs font-bold text-emerald-300 uppercase tracking-wider">
          Radical Open Governance
        </span>
        <h1 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight">
          Transparency, Audits & Statutory Compliance
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
          We operate on an open-book policy. Download full statutory filings, independent auditor opinions, and quarterly FCRA returns without gatekeeping.
        </p>
      </div>

      {downloadNotice && (
        <div className="rounded-2xl border border-emerald-500 bg-emerald-950 p-4 text-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* Statutory Registrations Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase">
            <ShieldCheck className="h-4 w-4" /> 80G Tax Exemption
          </div>
          <p className="font-mono text-xs font-bold text-slate-900">{settings.taxExemption80GNumber}</p>
          <p className="text-[11px] text-slate-500">Issued under Section 80G(5)(vi) of Income Tax Act 1961.</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase">
            <Building className="h-4 w-4" /> FCRA Approved
          </div>
          <p className="font-mono text-xs font-bold text-slate-900">{settings.fcraRegistrationNumber}</p>
          <p className="text-[11px] text-slate-500">Ministry of Home Affairs certified for foreign donations.</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase">
            <Scale className="h-4 w-4" /> NGO Darpan ID
          </div>
          <p className="font-mono text-xs font-bold text-slate-900">{settings.darpanId}</p>
          <p className="text-[11px] text-slate-500">NITI Aayog Portal registered voluntary organisation.</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase">
            <Award className="h-4 w-4" /> 12A Trust Order
          </div>
          <p className="font-mono text-xs font-bold text-slate-900">{settings.registrationNumber}</p>
          <p className="text-[11px] text-slate-500">Permanent non-profit entity registration.</p>
        </div>
      </div>

      {/* Fund Utilization Ratios */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-md grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-5 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
            Audited Utilization Matrix
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            88.4 Cents of Every Dollar Goes Directly into the Field
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Independent statutory auditor Deloitte Haskins & Sells certifies our operational overhead remains under 12%, ensuring maximal capital deployment towards direct beneficiary impact.
          </p>
          <button
            onClick={() => onNavigate('verify-certificate')}
            className="flex items-center gap-2 text-xs font-bold text-emerald-700 hover:underline"
          >
            Verify Issued Volunteer & Donor Certificates →
          </button>
        </div>

        <div className="lg:col-span-7 space-y-5 rounded-2xl bg-slate-50 p-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-900">Direct Program Expenditure (Field Projects & Supplies)</span>
              <span className="text-emerald-700">88.4%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-emerald-600" style={{ width: '88.4%' }} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-900">Statutory Governance, Audits & Operations</span>
              <span className="text-blue-700">7.2%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-blue-600" style={{ width: '7.2%' }} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-900">Community Outreach & Donor Communications</span>
              <span className="text-amber-700">4.4%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-amber-600" style={{ width: '4.4%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Published Reports Repository */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Published Statutory Disclosures & Audits</h2>
          <p className="text-xs text-slate-500 mt-1">Download complete audited PDFs with balance sheets and schedules.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs hover:border-emerald-300 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                    {rep.category.replace('_', ' ')}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-500">FY {rep.year}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{rep.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{rep.summary}</p>

                <div className="pt-2 text-[11px] text-slate-400 space-y-1">
                  <p>Auditor: <strong className="text-slate-700">{rep.auditedBy || 'Statutory Panel'}</strong></p>
                  <p>File Size: {rep.fileSize} • Published: {rep.publishedDate}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleDownload(rep.title)}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download Official PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
