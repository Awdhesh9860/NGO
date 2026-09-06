import React from 'react';
import { ArrowRight, CheckCircle2, TrendingUp, Users, Heart, Droplets, GraduationCap } from 'lucide-react';

interface ImpactMetricsSectionProps {
  onNavigate: (view: string, id?: string) => void;
}

export const ImpactMetricsSection: React.FC<ImpactMetricsSectionProps> = ({ onNavigate }) => {
  return (
    <section id="impact-metrics" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-14 space-y-10 shadow-xl relative overflow-hidden">
        
        {/* Glow Accents */}
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-3.5 py-1 rounded-full">
            Verified Outcomes
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Our Measurable Ground Impact
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Real human lives improved across education, clean water, maternal health, and livelihood clusters.
          </p>
        </div>

        {/* 5 Impact Metrics */}
        <div className="relative grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
          <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0">
            <span className="text-3xl sm:text-4xl font-black text-emerald-400">10,000+</span>
            <p className="text-xs font-bold text-slate-100">People Reached</p>
            <p className="text-[11px] text-slate-400">Directly supported</p>
          </div>

          <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0">
            <span className="text-3xl sm:text-4xl font-black text-blue-400">50+</span>
            <p className="text-xs font-bold text-slate-100">Communities Served</p>
            <p className="text-[11px] text-slate-400">Villages & settlements</p>
          </div>

          <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0">
            <span className="text-3xl sm:text-4xl font-black text-purple-400">100+</span>
            <p className="text-xs font-bold text-slate-100">Active Volunteers</p>
            <p className="text-[11px] text-slate-400">On the frontlines</p>
          </div>

          <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0">
            <span className="text-3xl sm:text-4xl font-black text-amber-400">25+</span>
            <p className="text-xs font-bold text-slate-100">Projects Completed</p>
            <p className="text-[11px] text-slate-400">Audited & verified</p>
          </div>

          <div className="space-y-1.5 col-span-2 md:col-span-1">
            <span className="text-3xl sm:text-4xl font-black text-teal-400">15+</span>
            <p className="text-xs font-bold text-slate-100">Years of Service</p>
            <p className="text-[11px] text-slate-400">Since foundation</p>
          </div>
        </div>

        {/* Sector Quick Badges */}
        <div className="relative pt-6 border-t border-slate-800 flex flex-wrap justify-center gap-3 text-xs">
          <div className="flex items-center gap-2 rounded-xl bg-slate-800/80 px-4 py-2 border border-slate-700">
            <GraduationCap className="h-4 w-4 text-emerald-400" />
            <span className="text-slate-200">3,200+ Students in Regular Schooling</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-slate-800/80 px-4 py-2 border border-slate-700">
            <Droplets className="h-4 w-4 text-blue-400" />
            <span className="text-slate-200">18 Solar Clean Water Stations Active</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-slate-800/80 px-4 py-2 border border-slate-700">
            <Users className="h-4 w-4 text-purple-400" />
            <span className="text-slate-200">450+ Women Earning Steady Incomes</span>
          </div>
        </div>

        <div className="relative text-center pt-2">
          <button
            onClick={() => onNavigate('impact')}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-2 transition cursor-pointer"
          >
            <span>Explore Full Audited Impact Dashboard & Sector Breakdown</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>
    </section>
  );
};
