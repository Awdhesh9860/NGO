import React from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { TransparencyReport } from '../../types';
import { FileText, Download, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

interface TransparencySectionProps {
  onNavigate: (view: string, id?: string) => void;
}

export const TransparencySection: React.FC<TransparencySectionProps> = ({ onNavigate }) => {
  const { reports, settings } = useDatabase();

  return (
    <section id="financial-transparency" className="bg-slate-900 text-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-7 space-y-4 text-left">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
              Honest & Open Accounts
            </span>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-snug">
              Where Every Rupee Goes — 100% Honest & Clear
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              You deserve to know exactly how your donation is used. 88% of every rupee is spent directly on children's schooling, meals, and clean water. Our accounts are checked by independent Chartered Accountants every year and free for anyone to download.
            </p>

            {/* Badges / Document categories */}
            <div className="flex flex-wrap gap-2 text-xs text-slate-200 font-semibold pt-1">
              <span className="rounded-xl bg-slate-800 px-3.5 py-1.5 border border-slate-700">Yearly Balance Sheets</span>
              <span className="rounded-xl bg-slate-800 px-3.5 py-1.5 border border-slate-700">Audited Expense Reports</span>
              <span className="rounded-xl bg-slate-800 px-3.5 py-1.5 border border-slate-700">Government 80G Certificate</span>
              <span className="rounded-xl bg-slate-800 px-3.5 py-1.5 border border-slate-700">NGO Reg #{settings.registrationNumber}</span>
            </div>

            <div className="pt-3">
              <button
                onClick={() => onNavigate('transparency')}
                className="rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white px-7 py-3.5 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30"
              >
                <FileText className="h-4 w-4" />
                <span>See All Audit Papers & Reports</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Downloadable Reports Cards */}
          <div className="lg:col-span-5 space-y-3">
            {reports && reports.length > 0 ? (
              reports.slice(0, 3).map((rep: TransparencyReport) => (
                <div
                  key={rep.id}
                  className="rounded-2xl border border-slate-800 bg-slate-800/80 p-4.5 flex items-center justify-between hover:border-slate-700 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-emerald-400 shrink-0" />
                      <h4 className="text-xs font-bold text-white line-clamp-1">{rep.title}</h4>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Fiscal Year {rep.year} &bull; {rep.fileSize} &bull; Audited
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate('documents')}
                    className="rounded-xl bg-slate-700 hover:bg-emerald-600 text-white px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer flex items-center gap-1 shrink-0 ml-3"
                  >
                    <span>View</span>
                  </button>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-800/80 p-5 text-center text-xs text-slate-400">
                Annual Audit Reports available in Transparency Documents Center.
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};
