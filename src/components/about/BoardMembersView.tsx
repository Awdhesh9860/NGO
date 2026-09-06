import React from 'react';
import { AboutSubNav } from './AboutSubNav';
import { BoardMembersGrid } from './BoardMembersGrid';
import { AboutFinalCta } from './AboutFinalCta';
import { ShieldCheck, CheckCircle2, ArrowRight, FileCheck, Scale } from 'lucide-react';

interface BoardMembersViewProps {
  onNavigate: (view: string, id?: string) => void;
  onOpenDonate?: () => void;
}

export const BoardMembersView: React.FC<BoardMembersViewProps> = ({ onNavigate, onOpenDonate }) => {
  return (
    <div className="space-y-12">
      <AboutSubNav currentSubPage="board" onNavigate={onNavigate} />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-3.5 py-1 text-xs font-bold text-emerald-800 uppercase tracking-wider">
            <Scale className="h-3.5 w-3.5 text-emerald-600" />
            <span>Fiduciary Trustees</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Board of Trustees & Governance
          </h1>
          <p className="text-xs sm:text-base text-slate-600 leading-relaxed font-normal">
            Independent trustees safeguarding our legal compliance, non-profit integrity, and statutory transparency.
          </p>
        </div>
      </section>

      {/* Board Members Cards */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <BoardMembersGrid onNavigate={onNavigate} />
      </section>

      {/* Board Responsibilities & Governance Structure */}
      <section className="bg-slate-50/80 py-12 border-y border-slate-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Board Responsibilities & Statutory Duties
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              How our trustees protect the public trust and oversee operations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-2 shadow-xs">
              <span className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                01
              </span>
              <h3 className="font-bold text-slate-900 text-sm">Quarterly Audit Review</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Review and approve all quarterly expenditure ledgers, bank reconciliations, and independent audit statements.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-2 shadow-xs">
              <span className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                02
              </span>
              <h3 className="font-bold text-slate-900 text-sm">Human Safeguarding</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Enforce strict child protection protocols and anti-exploitation safeguards across every educational and medical camp.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-2 shadow-xs">
              <span className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                03
              </span>
              <h3 className="font-bold text-slate-900 text-sm">Conflict of Interest</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Trustees serve in an honorary voluntary capacity and receive zero operational kickbacks or proprietary contracts.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-2 shadow-xs">
              <span className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                04
              </span>
              <h3 className="font-bold text-slate-900 text-sm">Legal & Tax Filings</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Verify annual submissions of Form 10B, 80G tax exemptions, and official regulatory filings with authorities.
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
