import React from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  GraduationCap,
  Droplets,
  HeartHandshake,
  ShieldAlert,
  Heart,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  FolderKanban
} from 'lucide-react';

interface ProgramsViewProps {
  onOpenDonate: (campaignId?: string) => void;
  onNavigate: (view: string, id?: string) => void;
}

export const ProgramsView: React.FC<ProgramsViewProps> = ({ onOpenDonate, onNavigate }) => {
  const { programs, projects } = useDatabase();

  const getProgramIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap className="h-8 w-8 text-emerald-600" />;
      case 'Droplets':
        return <Droplets className="h-8 w-8 text-blue-600" />;
      case 'HeartHandshake':
        return <HeartHandshake className="h-8 w-8 text-rose-600" />;
      case 'ShieldAlert':
        return <ShieldAlert className="h-8 w-8 text-amber-600" />;
      default:
        return <Heart className="h-8 w-8 text-emerald-600" />;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 space-y-12">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-900 p-8 sm:p-12 text-white shadow-xl">
        <span className="inline-block rounded-full bg-emerald-500/30 px-3.5 py-1 text-xs font-bold text-emerald-200 uppercase tracking-wider">
          Core Pillars of Sustainable Transformation
        </span>
        <h1 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight">
          Comprehensive Humanitarian Programs
        </h1>
        <p className="mt-3 text-sm sm:text-base text-emerald-100 max-w-2xl leading-relaxed">
          From solar aquifers to STEM literacy and disaster rescue, our structured programs are engineered for multi-decade self-reliance.
        </p>
      </div>

      {/* Program Catalog */}
      <div className="space-y-12">
        {programs.map((program, idx) => {
          const linkedProjects = projects.filter((p) => p.programId === program.id);

          return (
            <div
              key={program.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-md grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              <div className="lg:col-span-4 space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 border border-slate-100 shadow-inner">
                  {getProgramIcon(program.iconName)}
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                    {program.category}
                  </span>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">{program.title}</h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {program.description}
                </p>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => onOpenDonate()}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
                  >
                    <Heart className="h-4 w-4 fill-white" />
                    Sponsor This Program
                  </button>
                  <button
                    onClick={() => onNavigate('volunteer')}
                    className="rounded-xl border border-slate-300 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition text-center"
                  >
                    Volunteer for {program.title.split(' ')[0]}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-6">
                {/* Objectives */}
                <div className="rounded-2xl bg-slate-50 p-5">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                    Strategic Program Objectives
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                    {program.objectives.map((obj, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Metrics Stats */}
                <div className="grid grid-cols-3 gap-4">
                  {program.stats.map((st, i) => (
                    <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
                      <span className="text-xl sm:text-2xl font-black text-emerald-700">{st.value}</span>
                      <p className="text-[11px] font-semibold text-slate-600 mt-1 uppercase tracking-wider">{st.label}</p>
                    </div>
                  ))}
                </div>

                {/* Linked Grassroots Projects */}
                {linkedProjects.length > 0 && (
                  <div className="border-t border-slate-200 pt-4">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <FolderKanban className="h-4 w-4 text-emerald-600" />
                      Active Grassroots Projects in This Program ({linkedProjects.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {linkedProjects.map((proj) => (
                        <div
                          key={proj.id}
                          onClick={() => onNavigate('project-detail', proj.id)}
                          className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-3.5 hover:border-emerald-500 hover:shadow-md transition flex items-center justify-between group"
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                              {proj.title}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {proj.location} • Status: {proj.status.replace('_', ' ')}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
