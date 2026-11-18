'use client';

import React from 'react';
import Link from 'next/link';
import { useDatabase } from '@/context/DatabaseContext';
import { useUIStore } from '@/lib/ui-store';
import { useViewNavigation } from '@/hooks/useViewNavigation';
import { MapPin, Calendar, Users, ArrowRight, ArrowLeft, Clock } from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/common/JsonLd';

export default function OngoingProjectsPage() {
  const { projects } = useDatabase();
  const onNavigate = useViewNavigation();
  const openDonate = useUIStore((s) => s.openDonate);

  const ongoingProjects = projects.filter(
    (p) => p.status === 'active'
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://hopehorizon.org' },
          { name: 'Projects', url: 'https://hopehorizon.org/projects' },
          { name: 'Ongoing Projects', url: 'https://hopehorizon.org/projects/ongoing' },
        ]}
      />

      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-950 text-white py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All Field Projects
          </Link>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Live Implementations
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">Ongoing Ground Projects</h1>
          <p className="text-slate-200 text-sm sm:text-base max-w-2xl leading-relaxed">
            Active field operations currently deploying infrastructure, training community councils, and delivering direct humanitarian aid.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ongoingProjects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => onNavigate('project-detail', proj.id)}
              className="cursor-pointer bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-emerald-500 transition-all flex flex-col justify-between group"
            >
              <div>
                <img
                  src={proj.images?.[0] || 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800'}
                  alt={proj.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase text-[10px]">
                      {proj.category || 'Field Project'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                      <Clock className="w-3.5 h-3.5" /> In Progress
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
                <span>View Full Registry</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
