'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useDatabase } from '@/context/DatabaseContext';
import { PublicProgramRecord } from '@/features/programs/hooks/usePublicPrograms';
import { useUIStore } from '@/lib/ui-store';
import { useViewNavigation } from '@/hooks/useViewNavigation';
import {
  GraduationCap,
  Droplets,
  HeartHandshake,
  ShieldAlert,
  Heart,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  FolderKanban,
  Target,
  Users,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/common/JsonLd';

export default function ProgramDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { programs, projects } = useDatabase();
  const openDonate = useUIStore((s) => s.openDonate);
  const onNavigate = useViewNavigation();

  const [apiProgram, setApiProgram] = useState<PublicProgramRecord | null>(null);
  const [apiLinkedProjects, setApiLinkedProjects] = useState<
    Array<{
      id: string;
      name: string;
      slug: string;
      category?: string;
      shortDescription?: string;
      location: string;
      status: string;
      actualBeneficiaries?: number;
      images?: string[];
    }>
  >([]);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/v1/public/programs/${encodeURIComponent(slug)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (payload?.success && payload.data?.program) {
          setApiProgram(payload.data.program);
          setApiLinkedProjects(payload.data.projects || []);
        }
      })
      .catch(() => {});
  }, [slug]);

  const fallbackProgram = programs.find((p) => p.slug === slug || p.id === slug) || programs[0];
  const program = apiProgram
    ? {
        id: apiProgram.id,
        title: apiProgram.title,
        slug: apiProgram.slug,
        category: apiProgram.category,
        description: apiProgram.detailedDescription || apiProgram.shortDescription,
        objectives: apiProgram.objectives,
        targetBeneficiaries: `${apiProgram.targetBeneficiaries.toLocaleString('en-IN')}+`,
        iconName: 'Heart',
        image: apiProgram.coverImage || '',
        stats: [
          { label: 'Target Beneficiaries', value: apiProgram.targetBeneficiaries.toLocaleString('en-IN') },
          { label: 'Reached To Date', value: apiProgram.actualBeneficiaries.toLocaleString('en-IN') },
          { label: 'Regions Covered', value: String(apiProgram.geographicCoverage?.length || 1) },
        ],
        budget: 0,
        status: apiProgram.status.toLowerCase() as 'active' | 'planned' | 'completed',
      }
    : fallbackProgram;

  if (!program) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-800">Program Not Found</h1>
        <p className="text-slate-600 mt-2">The requested program could not be located.</p>
        <Link href="/programs" className="inline-block mt-4 text-emerald-600 font-semibold hover:underline">
          &larr; Back to all programs
        </Link>
      </div>
    );
  }

  const linkedProjects = apiProgram
    ? apiLinkedProjects.map((p) => ({
        id: p.slug || p.id,
        title: p.name,
        category: p.category || apiProgram.category,
        description: p.shortDescription || '',
        location: p.location || 'India',
        status: p.status.toLowerCase(),
        beneficiariesCount: p.actualBeneficiaries || 0,
        images: p.images && p.images.length > 0
          ? p.images
          : ['https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1000'],
      }))
    : projects.filter((p) => p.programId === program.id || p.programTitle === program.title);

  const getProgramIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap className="h-10 w-10 text-emerald-600" />;
      case 'Droplets':
        return <Droplets className="h-10 w-10 text-sky-600" />;
      case 'HeartHandshake':
        return <HeartHandshake className="h-10 w-10 text-rose-600" />;
      case 'ShieldAlert':
        return <ShieldAlert className="h-10 w-10 text-amber-600" />;
      default:
        return <Heart className="h-10 w-10 text-emerald-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://hopehorizon.org' },
          { name: 'Programs', url: 'https://hopehorizon.org/programs' },
          { name: program.title, url: `https://hopehorizon.org/programs/${program.slug}` },
        ]}
      />

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-950 text-white py-14 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/programs"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All Sustainable Programs
          </Link>

          <div className="flex flex-col lg:flex-row gap-8 items-start justify-between">
            <div className="max-w-3xl space-y-4">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {program.category}
              </span>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                {program.title}
              </h1>
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                {program.description}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 w-full lg:w-80 flex-shrink-0 space-y-4">
              <div className="flex items-center justify-between text-xs text-emerald-200">
                <span className="font-semibold uppercase tracking-wider">Target Community Reach</span>
                <span className="font-bold text-white text-base">{program.targetBeneficiaries}</span>
              </div>
              <button
                onClick={() => openDonate()}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
              >
                <Heart className="w-4 h-4 fill-slate-950" />
                Support This Program
              </button>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-200/80">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>50% Tax Exemption Under Section 80G</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* Verified Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {program.stats.map((st, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm hover:shadow-md transition">
              <span className="text-3xl sm:text-4xl font-black text-emerald-700">{st.value}</span>
              <p className="text-xs font-bold text-slate-600 mt-2 uppercase tracking-wider">{st.label}</p>
            </div>
          ))}
        </div>

        {/* Objectives & Beneficiaries */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              {getProgramIcon(program.iconName)}
              <div>
                <h2 className="text-xl font-bold text-slate-900">Program Strategic Objectives</h2>
                <p className="text-xs text-slate-500">Measurable ground benchmarks & delivery targets</p>
              </div>
            </div>

            <div className="space-y-4">
              {program.objectives.map((obj, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-800 font-medium">{obj}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm uppercase tracking-wider">
                <Users className="w-4 h-4" />
                <span>Target Beneficiary Community</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/60">
                {program.targetBeneficiaries}
              </p>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <img
                src={program.image}
                alt={program.title}
                className="w-full h-56 object-cover"
              />
              <div className="p-6 space-y-3">
                <h3 className="font-bold text-slate-900 text-sm">Ground Execution Methodology</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every intervention under this program is co-designed with local village councils to ensure zero dependency and lasting post-intervention maintenance.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Linked Projects */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <FolderKanban className="w-6 h-6 text-emerald-600" />
                Active Grassroots Projects ({linkedProjects.length})
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Specific ground implementations executing under the {program.title} pillar
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {linkedProjects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => onNavigate('project-detail', proj.id)}
                className="cursor-pointer bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-emerald-500 transition-all group flex flex-col justify-between"
              >
                <div>
                  <img
                    src={proj.images?.[0] || 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800'}
                    alt={proj.title}
                    className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="p-5 space-y-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      {proj.category || 'Field Project'}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {proj.description}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Location: {proj.location}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-600 group-hover:text-emerald-700">
                  <span>View Project Details</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
