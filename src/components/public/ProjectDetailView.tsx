import React from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  MapPin,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  ArrowLeft,
  DollarSign,
  Heart,
  ShieldCheck,
  Building,
  UserCheck
} from 'lucide-react';

interface ProjectDetailViewProps {
  projectId: string;
  onBack: () => void;
  onOpenDonate: (campaignId?: string) => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  projectId,
  onBack,
  onOpenDonate
}) => {
  const { projects } = useDatabase();
  const project = projects.find((p) => p.id === projectId) || projects[0];

  if (!project) {
    return (
      <div className="mx-auto max-w-4xl p-12 text-center">
        <p className="text-slate-500">Project not found.</p>
        <button onClick={onBack} className="mt-4 text-emerald-600 font-bold">
          ← Return to Projects
        </button>
      </div>
    );
  }

  const completedMilestones = project.milestones.filter((m) => m.completed).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 space-y-10">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 transition"
      >
        <ArrowLeft className="h-4 w-4" /> Back to All Projects
      </button>

      {/* Main Hero Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 uppercase tracking-wider">
              {project.category}
            </span>
            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
              {project.status.replace('_', ' ')}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
              <MapPin className="h-4 w-4 text-emerald-600" /> {project.location}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
            {project.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {project.description}
          </p>

          {/* Image Gallery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {project.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`${project.title} ${i}`}
                className="h-64 w-full rounded-3xl object-cover shadow-md"
              />
            ))}
          </div>

          {/* Milestone Timeline */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Verified Milestone Roadmap</h3>
                <p className="text-xs text-slate-500">Field progress audited and signed off by project managers.</p>
              </div>
              <span className="rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                {completedMilestones} of {project.milestones.length} Completed
              </span>
            </div>

            <div className="space-y-4">
              {project.milestones.map((m, idx) => (
                <div
                  key={m.id}
                  className={`rounded-2xl border p-4 flex items-start gap-4 transition ${
                    m.completed ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className="mt-0.5">
                    {m.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">{m.title}</h4>
                      <span className="text-xs font-mono text-slate-500">
                        Target: {m.targetDate}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{m.description}</p>
                    {m.completedAt && (
                      <span className="inline-block mt-2 text-[10px] font-bold text-emerald-700">
                        ✓ Verified Complete on {m.completedAt}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Funding & Leads */}
        <div className="lg:col-span-4 space-y-6">
          {/* Funding Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Project Financials</h3>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 font-medium">Raised to Date</span>
                <span className="font-bold text-emerald-700 text-lg">
                  ${project.amountRaised.toLocaleString()}
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                  style={{
                    width: `${Math.min(100, (project.amountRaised / project.fundingGoal) * 100)}%`
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Budget Goal: ${project.fundingGoal.toLocaleString()}</span>
                <span>{((project.amountRaised / project.fundingGoal) * 100).toFixed(0)}% Funded</span>
              </div>
            </div>

            <button
              onClick={() => onOpenDonate()}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-xs font-bold text-white shadow-lg hover:bg-emerald-700 transition"
            >
              <Heart className="h-4 w-4 fill-white" />
              Direct Contribution to This Project
            </button>

            <div className="rounded-2xl bg-slate-50 p-4 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Beneficiaries Reached:</span>
                <span className="font-bold text-slate-900">{project.beneficiariesCount.toLocaleString()} souls</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Start Date:</span>
                <span className="font-medium text-slate-800">{project.startDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Completion:</span>
                <span className="font-medium text-slate-800">{project.endDate || 'Ongoing'}</span>
              </div>
            </div>
          </div>

          {/* Project Manager Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Designated Field Lead</h4>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 font-bold text-lg">
                {project.managerName.split(' ')[0][0]}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{project.managerName}</p>
                <p className="text-xs text-emerald-700 font-medium">Grassroots Field Director</p>
                <p className="text-[11px] text-slate-400">HopeHorizon Operations</p>
              </div>
            </div>
          </div>

          {/* Tax Exemption Badge */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 text-xs space-y-1.5">
            <span className="flex items-center gap-1.5 font-bold text-emerald-900">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              100% 80G Tax Deductible
            </span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Direct project contributions receive official instant Form 10BE tax receipts issued with statutory registration seals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
