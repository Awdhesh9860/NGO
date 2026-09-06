import React from 'react';
import { AboutSubNav } from './AboutSubNav';
import { ValuesGrid } from './ValuesGrid';
import { AboutFinalCta } from './AboutFinalCta';
import { ShieldCheck, Heart, Scale, Award, CheckCircle2, Users2 } from 'lucide-react';

interface OurValuesViewProps {
  onNavigate: (view: string, id?: string) => void;
  onOpenDonate?: () => void;
}

export const OurValuesView: React.FC<OurValuesViewProps> = ({ onNavigate, onOpenDonate }) => {
  return (
    <div className="space-y-12">
      <AboutSubNav currentSubPage="values" onNavigate={onNavigate} />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-3.5 py-1 text-xs font-bold text-emerald-800 uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Ethical Foundation</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Our Core Values
          </h1>
          <p className="text-xs sm:text-base text-slate-600 leading-relaxed font-normal">
            These six principles guide how we speak, how we spend donor funds, and how we treat every single person in the communities we serve.
          </p>
        </div>
      </section>

      {/* Deep Dive Values Grid */}
      <ValuesGrid showDetails={true} />

      {/* Ethics Pledge Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-950 text-white rounded-3xl p-8 sm:p-12 space-y-4 shadow-xl border border-emerald-900">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Our Everyday Commitment
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">
            Values are Not Words on a Wall — They Are How We Act
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            We hold regular team reviews where every field coordinator evaluates projects against our values. If an action does not honor equality, honesty, and community respect, we course-correct immediately. Our doors and accounting books remain open to all.
          </p>
        </div>
      </section>

      {/* CTA */}
      <AboutFinalCta onOpenDonate={onOpenDonate} onNavigate={onNavigate} />
    </div>
  );
};
