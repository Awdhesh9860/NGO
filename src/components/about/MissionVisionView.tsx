import React from 'react';
import { AboutSubNav } from './AboutSubNav';
import { MissionSection } from './MissionSection';
import { VisionSection } from './VisionSection';
import { ValuesGrid } from './ValuesGrid';
import { ApproachSteps } from './ApproachSteps';
import { AboutFinalCta } from './AboutFinalCta';
import { Compass, CheckCircle2, ArrowRight } from 'lucide-react';

interface MissionVisionViewProps {
  onNavigate: (view: string, id?: string) => void;
  onOpenDonate?: () => void;
}

export const MissionVisionView: React.FC<MissionVisionViewProps> = ({ onNavigate, onOpenDonate }) => {
  return (
    <div className="space-y-12">
      <AboutSubNav currentSubPage="mission-vision" onNavigate={onNavigate} />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-3.5 py-1 text-xs font-bold text-emerald-800 uppercase tracking-wider">
            <Compass className="h-3.5 w-3.5 text-emerald-600" />
            <span>Direction & Purpose</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Our Mission & Vision
          </h1>
          <p className="text-xs sm:text-base text-slate-600 leading-relaxed font-normal">
            Clear commitments, measurable goals, and a shared vision of a kinder, more equitable society.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <MissionSection onNavigate={onNavigate} />

      {/* What Our Mission Means in Plain Words */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-8 sm:p-10 space-y-4 text-left">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            What Our Mission Means in Plain Words
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/70 space-y-2">
              <h3 className="font-bold text-slate-900">For a Child:</h3>
              <p>
                A clean desk, textbooks, a teacher who encourages them, and clean drinking water during recess so they stay healthy and stay in school.
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/70 space-y-2">
              <h3 className="font-bold text-slate-900">For a Mother:</h3>
              <p>
                Access to free health clinics, vitamins for her baby, and vocational sewing or craft skills to earn her own income with pride.
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/70 space-y-2">
              <h3 className="font-bold text-slate-900">For a Village:</h3>
              <p>
                A community-owned solar water tap that never runs dry, managed by local youth who take pride in keeping their neighborhood flourishing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <VisionSection />

      {/* Values Grid */}
      <ValuesGrid onNavigate={onNavigate} />

      {/* Approach Steps */}
      <ApproachSteps />

      {/* CTA */}
      <AboutFinalCta onOpenDonate={onOpenDonate} onNavigate={onNavigate} />
    </div>
  );
};
