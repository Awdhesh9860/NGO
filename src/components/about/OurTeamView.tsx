import React from 'react';
import { AboutSubNav } from './AboutSubNav';
import { TeamGrid } from './TeamGrid';
import { AboutFinalCta } from './AboutFinalCta';
import { Users, Heart, ArrowRight, Briefcase } from 'lucide-react';

interface OurTeamViewProps {
  onNavigate: (view: string, id?: string) => void;
  onOpenDonate?: () => void;
}

export const OurTeamView: React.FC<OurTeamViewProps> = ({ onNavigate, onOpenDonate }) => {
  return (
    <div className="space-y-12">
      <AboutSubNav currentSubPage="team" onNavigate={onNavigate} />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-3.5 py-1 text-xs font-bold text-emerald-800 uppercase tracking-wider">
            <Users className="h-3.5 w-3.5 text-emerald-600" />
            <span>Community & Staff</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Meet Our Team
          </h1>
          <p className="text-xs sm:text-base text-slate-600 leading-relaxed font-normal">
            The passionate coordinators, field teachers, health workers, and engineers who work directly with communities every day.
          </p>
        </div>
      </section>

      {/* Team Directory with Department Filters */}
      <TeamGrid onNavigate={onNavigate} showAll={true} />

      {/* Join Our Team Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-left max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Work With Purpose
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">
              Want to Join Our Mission?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              We are always looking for committed educators, field engineers, community coordinators, and youth fellows who want to create positive impact.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              onClick={() => onNavigate('careers')}
              className="rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3.5 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Briefcase className="h-4 w-4" />
              <span>Explore Openings & Fellowships</span>
            </button>
            <button
              onClick={() => onNavigate('volunteers')}
              className="rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-5 py-3.5 text-xs font-bold transition cursor-pointer"
            >
              <span>Volunteer With Us</span>
            </button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <AboutFinalCta onOpenDonate={onOpenDonate} onNavigate={onNavigate} />
    </div>
  );
};
