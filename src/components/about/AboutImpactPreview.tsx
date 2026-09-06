import React from 'react';
import { ArrowRight, CheckCircle2, TrendingUp, Users, Heart, Award } from 'lucide-react';

interface AboutImpactPreviewProps {
  onNavigate: (view: string, id?: string) => void;
}

export const AboutImpactPreview: React.FC<AboutImpactPreviewProps> = ({ onNavigate }) => {
  const metrics = [
    { label: 'People Reached', value: '10,000+', note: 'Direct community beneficiaries' },
    { label: 'Communities', value: '50+', note: 'Villages & rural settlements' },
    { label: 'Completed Projects', value: '25+', note: 'Audited & verified on ground' },
    { label: 'Active Volunteers', value: '100+', note: 'Working on the frontline' },
    { label: 'Core Programs', value: '4 Major', note: 'Education, Water, Health, Skills' }
  ];

  return (
    <section id="our-impact-preview" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 space-y-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
              Verified Progress
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">
              Our Measurable Impact
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Every number represents a real person who received learning support, clean water, or healthcare.
            </p>
          </div>

          <button
            onClick={() => onNavigate('impact')}
            className="rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0 shadow-md"
          >
            <span>See Our Full Impact</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-2">
          {metrics.map((m, idx) => (
            <div
              key={m.label}
              className={`p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1 ${
                idx === 4 ? 'col-span-2 md:col-span-1' : ''
              }`}
            >
              <span className="text-2xl sm:text-3xl font-black text-emerald-400">{m.value}</span>
              <p className="text-xs font-bold text-slate-100">{m.label}</p>
              <p className="text-[11px] text-slate-400">{m.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
