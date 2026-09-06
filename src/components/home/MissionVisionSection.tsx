import React from 'react';
import { Heart, Sparkles, CheckCircle2 } from 'lucide-react';

export const MissionVisionSection: React.FC = () => {
  return (
    <section id="mission-vision" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Mission Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 space-y-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Heart className="h-6 w-6 fill-emerald-600/20 text-emerald-700" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
              Our Purpose
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              Our Mission
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              "We work side by side with local families to bring quality schooling, safe drinking water, healthcare camps, and practical job skills to communities in need, ensuring human dignity, self-reliance, and generational opportunity."
            </p>
          </div>

          <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Keeping children in classrooms with learning tools, not in child labor</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Delivering solar clean drinking water to remote rural settlements</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Equipping mothers and youth with accredited vocational livelihoods</span>
            </div>
          </div>
        </div>

        {/* Vision Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 space-y-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-blue-700" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 block">
              The Future We Seek
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              Our Vision
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              "A world where every child can learn in a safe classroom, every family has access to clean water and healthcare, and every community has the tools, confidence, and resources to thrive independently."
            </p>
          </div>

          <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
              <span>Equal educational and livelihood opportunities regardless of origin</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
              <span>Community self-sufficiency and local civic leadership</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
              <span>Long-term, resilient infrastructure protected for generations</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
