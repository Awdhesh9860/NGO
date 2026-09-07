import React from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { Project } from '../../types';
import { MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';

interface FeaturedProjectsSectionProps {
  onNavigate: (view: string, id?: string) => void;
}

export const FeaturedProjectsSection: React.FC<FeaturedProjectsSectionProps> = ({ onNavigate }) => {
  const { projects, settings } = useDatabase();

  return (
    <section id="featured-projects" className="bg-slate-50/70 py-16 border-y border-slate-200/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              Ground Projects
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
              Featured Grassroots Projects
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track real-time progress, budgets, and beneficiary milestones directly from the field.
            </p>
          </div>

          <button
            onClick={() => onNavigate('projects')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
          >
            <span>View All Projects</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.slice(0, 3).map((project: Project) => {
            const progressPercent = Math.min(100, Math.round((project.amountRaised / project.fundingGoal) * 100));
            return (
              <div
                key={project.id}
                className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs hover:shadow-xl hover:border-emerald-200 transition duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={project.images[0]}
                      alt={project.title}
                      className="h-full w-full object-cover transition duration-500 hover:scale-105"
                      loading="lazy"
                    />
                    <span className="absolute top-3 left-3 rounded-full bg-slate-900/80 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>{project.location}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {project.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>

                    <div className="rounded-2xl bg-slate-50 p-3.5 space-y-2 text-xs">
                      <div className="flex justify-between font-medium text-slate-600">
                        <span>Funding Progress ({progressPercent}%)</span>
                        <span className="font-bold text-emerald-700">
                          {settings.currencySymbol}{project.amountRaised.toLocaleString('en-US')} / {settings.currencySymbol}{project.fundingGoal.toLocaleString('en-US')}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 p-4 bg-slate-50/50 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Lead: <span className="font-semibold text-slate-800">{project.managerName}</span>
                  </span>
                  <button
                    onClick={() => onNavigate('project-detail', project.id)}
                    className="font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Project</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
