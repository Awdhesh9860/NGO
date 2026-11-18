'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink, ArrowLeft, Newspaper, Award } from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/common/JsonLd';

export default function MediaCoveragePage() {
  const coverageItems = [
    {
      source: 'National Development Gazette',
      date: 'December 2025',
      title: 'How Solar Aquifers Are Changing Rural Livelihoods in Drought Belts',
      quote: 'HopeHorizon demonstrates a zero-loss community maintenance model where women-led councils govern water tariffs with complete transparency.',
      linkText: 'Read Full Coverage',
    },
    {
      source: 'Education & Social Equity Review',
      date: 'September 2025',
      title: 'Rural STEM Education Reaches Grassroots Milestone with Solar Tablet Labs',
      quote: 'Equipping schools with decentralized off-grid labs removes the persistent power-outage hurdle from rural science classrooms.',
      linkText: 'Read Feature Article',
    },
    {
      source: 'Nonprofit Governance Journal',
      date: 'June 2025',
      title: 'Real-time Fund Tracking: The Next Frontier in NGO Public Accountability',
      quote: 'Every rupee accounted for: HopeHorizon leads the digital shift with online 80G automated receipting and public audit statements.',
      linkText: 'Read Institutional Review',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://hopehorizon.org' },
          { name: 'Press', url: 'https://hopehorizon.org/press' },
          { name: 'Media Coverage', url: 'https://hopehorizon.org/press/media-coverage' },
        ]}
      />

      <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-950 text-white py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <Link
            href="/press"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Press Room
          </Link>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Independent Journalism
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">External Media Coverage</h1>
          <p className="text-slate-200 text-sm sm:text-base max-w-2xl leading-relaxed">
            Independent journalistic features, field investigations, and policy mentions highlighting our programs and transparent operations.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        {coverageItems.map((item, idx) => (
          <div key={idx} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:border-emerald-500 transition space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-emerald-700 bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200">
                {item.source}
              </span>
              <span>{item.date}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{item.title}</h2>
            <blockquote className="border-l-4 border-emerald-600 pl-4 py-1 text-xs text-slate-600 italic leading-relaxed">
              &ldquo;{item.quote}&rdquo;
            </blockquote>
          </div>
        ))}
      </div>
    </div>
  );
}
