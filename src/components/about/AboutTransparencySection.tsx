import React from 'react';
import { ShieldCheck, FileText, ArrowRight, Eye, CheckCircle2 } from 'lucide-react';

interface AboutTransparencySectionProps {
  onNavigate: (view: string, id?: string) => void;
}

export const AboutTransparencySection: React.FC<AboutTransparencySectionProps> = ({ onNavigate }) => {
  return (
    <section id="about-transparency" className="bg-slate-900 text-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-8 space-y-4 text-left">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
              Accountability
            </span>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-snug">
              We Believe in Transparency
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Every donor, volunteer, and community supporter deserves to know exactly how resources are used. We publish complete annual financial statements, independent audit opinions, and project field logs openly on our website.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-semibold text-slate-200">
              <div className="flex items-center gap-2 rounded-xl bg-slate-800/80 p-3 border border-slate-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Independently Audited Every Year</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-slate-800/80 p-3 border border-slate-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Public Balance Sheets & Returns</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-slate-800/80 p-3 border border-slate-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Zero Middlemen Commission</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex justify-start lg:justify-end">
            <button
              onClick={() => onNavigate('transparency')}
              className="rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white px-7 py-4 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xl shadow-emerald-600/30"
            >
              <FileText className="h-4 w-4" />
              <span>View Audits & Reports</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};
