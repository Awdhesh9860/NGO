import React from 'react';
import { Handshake, ArrowRight, ShieldCheck, FileCheck, CheckCircle2 } from 'lucide-react';

interface CsrSectionProps {
  onNavigate: (view: string, id?: string) => void;
}

export const CsrSection: React.FC<CsrSectionProps> = ({ onNavigate }) => {
  return (
    <section id="csr-partnerships" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="bg-emerald-950 text-white rounded-3xl p-8 sm:p-12 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-xl border border-emerald-900/60 relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="lg:col-span-8 space-y-4 text-left">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-900/80 px-3 py-1 rounded-full border border-emerald-700/60">
            Corporate Social Responsibility
          </span>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-snug">
            Partner With Us to Create High-Scale Sustainable Impact
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Companies and corporate foundations can partner with our NGO to sponsor entire solar safe water plants, equip high school science & computer labs, or organize structured employee volunteering weekends. We deliver complete statutory CSR compliance, transparent budget tracking sheets, and verified quarterly impact audits.
          </p>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-emerald-200 font-medium pt-1">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Full Statutory CSR Compliance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Quarterly Audited Utilization Reports</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Direct Employee Engagement Drives</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex justify-start lg:justify-end">
          <button
            onClick={() => onNavigate('csr')}
            className="rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 text-xs sm:text-sm font-bold transition shadow-xl shadow-emerald-600/30 flex items-center gap-2.5 cursor-pointer"
          >
            <Handshake className="h-4 w-4" />
            <span>Become a CSR Partner</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
