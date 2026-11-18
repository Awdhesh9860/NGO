'use client';

import React from 'react';
import Link from 'next/link';
import { useDatabase } from '@/context/DatabaseContext';
import { useViewNavigation } from '@/hooks/useViewNavigation';
import { MapPin, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/common/JsonLd';

export default function CompletedProjectsPage() {
  const { projects } = useDatabase();
  const onNavigate = useViewNavigation();

  const completedProjects = projects.filter(
    (p) => p.status === 'completed'
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://hopehorizon.org' },
          { name: 'Projects', url: 'https://hopehorizon.org/projects' },
          { name: 'Completed Projects', url: 'https://hopehorizon.org/projects/completed' },
        ]}
      />

      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All Field Projects
          </Link>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Delivered Milestones
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">Completed Projects & Impact</h1>
          <p className="text-slate-200 text-sm sm:text-base max-w-2xl leading-relaxed">
            Successfully delivered ground infrastructure and verified handover reports to local community councils.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {completedProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedProjects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => onNavigate('project-detail', proj.id)}
                className="cursor-pointer bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-emerald-500 transition-all flex flex-col justify-between group"
              >
                <div>
                  <img
                    src={proj.images?.[0] || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800'}
                    alt={proj.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase text-[10px]">
                        {proj.category || 'Field Project'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2">{proj.description}</p>
                    <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {proj.location}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-600 group-hover:text-emerald-700">
                  <span>View Project Registry</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">Delivered Projects</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Active projects are currently in operational delivery phase. Check ongoing projects for live deployment milestones.
            </p>
            <Link
              href="/projects/ongoing"
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl hover:bg-emerald-100"
            >
              Explore Ongoing Projects <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
