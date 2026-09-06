import React from 'react';
import { AboutSubNav } from './AboutSubNav';
import { AwardsGrid } from './AwardsGrid';
import { AboutFinalCta } from './AboutFinalCta';
import { Award, ShieldCheck, FileCheck, CheckCircle2, ArrowRight } from 'lucide-react';

interface AwardsViewProps {
  onNavigate: (view: string, id?: string) => void;
  onOpenDonate?: () => void;
}

export const AwardsView: React.FC<AwardsViewProps> = ({ onNavigate, onOpenDonate }) => {
  return (
    <div className="space-y-12">
      <AboutSubNav currentSubPage="awards" onNavigate={onNavigate} />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-3.5 py-1 text-xs font-bold text-emerald-800 uppercase tracking-wider">
            <Award className="h-3.5 w-3.5 text-emerald-600" />
            <span>Integrity & Recognition</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Awards, Recognitions & Credentials
          </h1>
          <p className="text-xs sm:text-base text-slate-600 leading-relaxed font-normal">
            Verifiable statutory certifications, government empanelments, and community citations earned through honest field service.
          </p>
        </div>
      </section>

      {/* Full Awards Grid */}
      <AwardsGrid onNavigate={onNavigate} showAll={true} />

      {/* Verified Documentation Download Callout */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-left">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Need Copies of Our Statutory Documents?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              We provide digital copies of our 80G tax certificates, 12A registration, Darpan empanelment, and annual independent audit balance sheets in our Transparency & Documents Hub.
            </p>
          </div>

          <button
            onClick={() => onNavigate('documents')}
            className="rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3.5 text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 shadow-md"
          >
            <FileCheck className="h-4 w-4" />
            <span>Open Documents Hub</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* CTA */}
      <AboutFinalCta onOpenDonate={onOpenDonate} onNavigate={onNavigate} />
    </div>
  );
};
