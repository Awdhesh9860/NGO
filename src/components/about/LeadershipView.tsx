import React from 'react';
import { AboutSubNav } from './AboutSubNav';
import { LeadershipGrid } from './LeadershipGrid';
import { AboutFinalCta } from './AboutFinalCta';
import { Users, ShieldCheck, CheckCircle2, ArrowRight, FileText } from 'lucide-react';

interface LeadershipViewProps {
  onNavigate: (view: string, id?: string) => void;
  onOpenDonate?: () => void;
}

export const LeadershipView: React.FC<LeadershipViewProps> = ({ onNavigate, onOpenDonate }) => {
  return (
    <div className="space-y-12">
      <AboutSubNav currentSubPage="leadership" onNavigate={onNavigate} />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-3.5 py-1 text-xs font-bold text-emerald-800 uppercase tracking-wider">
            <Users className="h-3.5 w-3.5 text-emerald-600" />
            <span>Executive Governance</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Our Leadership Team
          </h1>
          <p className="text-xs sm:text-base text-slate-600 leading-relaxed font-normal">
            The experienced directors and program coordinators guiding our daily field operations with clear accountability.
          </p>
        </div>
      </section>

      {/* Full Leadership Grid */}
      <LeadershipGrid onNavigate={onNavigate} showAll={true} />

      {/* Roles, Responsibilities & Governance Structure */}
      <section className="bg-slate-50/80 py-12 border-y border-slate-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Governance & Leadership Principles
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Clear boundaries, transparent checks and balances, and ethical guardianship.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-2.5 shadow-xs">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">Separation of Oversight</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Our board of independent trustees provides quarterly audit reviews, ensuring management decisions align strictly with our non-profit charitable bylaws.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-2.5 shadow-xs">
              <Users className="h-6 w-6 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">Field-First Decision Making</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Every executive spends scheduled weeks directly in the rural communities to observe water stations and classrooms firsthand, rather than remaining behind an office desk.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-2.5 shadow-xs">
              <FileText className="h-6 w-6 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">Radical Open Auditing</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                All executive remuneration and operational expenditures are reviewed annually by certified external auditors and made publicly available.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <AboutFinalCta onOpenDonate={onOpenDonate} onNavigate={onNavigate} />
    </div>
  );
};
