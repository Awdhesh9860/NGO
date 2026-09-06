import React from 'react';
import { ShieldAlert, BookOpen, Droplets, HeartHandshake, ArrowRight } from 'lucide-react';

interface WhyWeExistSectionProps {
  onNavigate?: (view: string, id?: string) => void;
}

export const WhyWeExistSection: React.FC<WhyWeExistSectionProps> = ({ onNavigate }) => {
  const needs = [
    {
      problem: 'Children dropping out of school',
      solution: 'We provide free school supplies, after-school study centers, and learning mentorship so no child is left behind.',
      icon: BookOpen
    },
    {
      problem: 'Unsafe water causing frequent illness',
      solution: 'We build solar-powered water filtration units and train local youth to keep water taps clean and running daily.',
      icon: Droplets
    },
    {
      problem: 'Families trapped without steady income',
      solution: 'We conduct practical tailoring, digital literacy, and vocational workshops so women and youth can earn with dignity.',
      icon: HeartHandshake
    }
  ];

  return (
    <section id="why-we-exist" className="bg-slate-50/70 border-y border-slate-200/60 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-3 py-1 rounded-full">
            Our Purpose
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Why We Exist
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
            Many people still do not have equal access to education, skills, healthcare and basic opportunities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {needs.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.problem}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 space-y-4 shadow-xs hover:shadow-lg hover:border-emerald-200 transition duration-300 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">The Challenge</span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5 leading-snug">
                      {item.problem}
                    </h3>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">How We Intervene</span>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1 font-normal">
                      {item.solution}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center text-xs font-semibold text-emerald-700">
                  <span>Community-tested approach</span>
                </div>
              </div>
            );
          })}
        </div>

        {onNavigate && (
          <div className="text-center pt-2">
            <button
              onClick={() => onNavigate('about-mission-vision')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>Explore our Mission, Vision and Focus Areas</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
