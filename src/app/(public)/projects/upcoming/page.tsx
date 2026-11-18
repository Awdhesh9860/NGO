'use client';

import React from 'react';
import Link from 'next/link';
import { useDatabase } from '@/context/DatabaseContext';
import { useViewNavigation } from '@/hooks/useViewNavigation';
import { Calendar, MapPin, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/common/JsonLd';

export default function UpcomingProjectsPage() {
  const { projects } = useDatabase();
  const onNavigate = useViewNavigation();

  const upcomingProjects = projects.filter(
    (p) => p.status === 'planned'
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://hopehorizon.org' },
          { name: 'Projects', url: 'https://hopehorizon.org/projects' },
          { name: 'Upcoming Projects', url: 'https://hopehorizon.org/projects/upcoming' },
        ]}
      />

      <div className="bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 text-white py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All Field Projects
          </Link>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Pipeline Initiatives
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">Upcoming Pipeline Projects</h1>
          <p className="text-slate-200 text-sm sm:text-base max-w-2xl leading-relaxed">
            Approved community initiatives currently undergoing feasibility surveys, government clearances, and seed fundraising.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-2xl mx-auto space-y-4">
          <Sparkles className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="text-xl font-bold text-slate-900">Pipeline Ground Expansion (2026-2027)</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            We are actively vetting 6 new solar borehole sites in Bundelkhand and 20 tribal digital learning centers in Odisha. Once geological permits and community councils are finalized, verified project cards will appear here.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/projects/ongoing"
              className="inline-flex items-center gap-2 text-xs font-bold text-white bg-emerald-600 px-4 py-2.5 rounded-xl hover:bg-emerald-700 shadow-md"
            >
              View Active Projects <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/donate"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 px-4 py-2.5 rounded-xl hover:bg-slate-200"
            >
              Seed Fund New Initiatives
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
