import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  MapPin,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  DollarSign,
  Heart
} from 'lucide-react';

interface ProjectsViewProps {
  onNavigate: (view: string, id?: string) => void;
  onOpenDonate: (campaignId?: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ onNavigate, onOpenDonate }) => {
  const { projects } = useDatabase();
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredProjects = projects.filter((p) => {
    const matchStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
    const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchStatus && matchCat;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 space-y-10">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 p-8 sm:p-12 text-white shadow-xl">
        <span className="inline-block rounded-full bg-emerald-500/30 px-3.5 py-1 text-xs font-bold text-emerald-300 uppercase tracking-wider">
          Transparent Project Registry
        </span>
        <h1 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight">
          Field Projects & Grassroots Implementations
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
          Every project is backed by verified geospatial logs, milestone tracking, and detailed procurement accounts for public review.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-500 mr-2 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Filter Status:
          </span>
          {['ALL', 'IN_PROGRESS', 'COMPLETED', 'PLANNED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`rounded-xl px-3 py-1.5 font-bold transition ${
                selectedStatus === st
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'All Projects' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="text-xs font-medium text-slate-500">
          Showing <span className="font-bold text-slate-900">{filteredProjects.length}</span> verified deployments
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs hover:shadow-xl transition flex flex-col justify-between"
          >
            <div>
              <div className="relative h-52 overflow-hidden">
                <img
                  src={project.images[0]}
                  alt={project.title}
                  className="h-full w-full object-cover transition duration-300 hover:scale-105"
                />
                <span className="absolute top-3 left-3 rounded-full bg-slate-900/80 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                  {project.status.replace('_', ' ')}
                </span>
                <span className="absolute top-3 right-3 rounded-full bg-emerald-600/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                  {project.category}
                </span>
              </div>

              <div className="p-6 space-y-3">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{project.location}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 leading-snug">{project.title}</h3>

                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                  {project.description}
                </p>

                {/* Progress & Budget */}
                <div className="rounded-2xl bg-slate-50 p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-600">Funding Progress</span>
                    <span className="font-bold text-emerald-700">
                      ${project.amountRaised.toLocaleString()} / ${project.fundingGoal.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-emerald-600"
                      style={{
                        width: `${Math.min(100, (project.amountRaised / project.fundingGoal) * 100)}%`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                    <span>Beneficiaries: <strong className="text-slate-800">{project.beneficiariesCount.toLocaleString()}</strong></span>
                    <span>Milestones: <strong className="text-slate-800">{project.milestones.filter(m => m.completed).length}/{project.milestones.length}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 p-4 bg-slate-50/70 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Lead: <span className="font-semibold text-slate-800">{project.managerName}</span>
              </div>
              <button
                onClick={() => onNavigate('project-detail', project.id)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition flex items-center gap-1.5"
              >
                <span>View Full Audit</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
