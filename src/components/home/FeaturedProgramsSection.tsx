import React from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { Program } from '../../types';
import {
  GraduationCap,
  Droplets,
  HeartHandshake,
  ShieldAlert,
  Heart,
  ArrowRight,
  CheckCircle2,
  Users
} from 'lucide-react';

interface FeaturedProgramsSectionProps {
  onNavigate: (view: string, id?: string) => void;
}

export const FeaturedProgramsSection: React.FC<FeaturedProgramsSectionProps> = ({ onNavigate }) => {
  const { programs } = useDatabase();

  const getProgramIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap className="h-6 w-6 text-emerald-600" />;
      case 'Droplets':
        return <Droplets className="h-6 w-6 text-blue-600" />;
      case 'HeartHandshake':
        return <HeartHandshake className="h-6 w-6 text-rose-600" />;
      case 'ShieldAlert':
        return <ShieldAlert className="h-6 w-6 text-amber-600" />;
      default:
        return <Heart className="h-6 w-6 text-emerald-600" />;
    }
  };

  return (
    <section id="featured-programs" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            Featured Initiatives
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
            Our Active Programs
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Proven field initiatives delivering measurable community results year after year.
          </p>
        </div>

        <button
          onClick={() => onNavigate('programs')}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
        >
          <span>View All Programs</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {programs.map((program: Program) => (
          <div
            key={program.id}
            onClick={() => onNavigate('programs', program.id)}
            className="group cursor-pointer rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs hover:shadow-xl hover:border-emerald-300 transition duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 group-hover:scale-105 group-hover:bg-emerald-50 transition">
                {getProgramIcon(program.iconName)}
              </div>
              <span className="mt-4 inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                {program.category}
              </span>
              <h3 className="mt-2 text-base font-bold text-slate-900 group-hover:text-emerald-700 transition leading-snug">
                {program.title}
              </h3>
              <p className="mt-2 text-xs text-slate-500 line-clamp-3 leading-relaxed">
                {program.description}
              </p>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500 flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                <span>Community Lead</span>
              </span>
              <span className="text-emerald-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition">
                <span>Details</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
