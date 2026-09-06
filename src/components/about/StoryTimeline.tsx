import React from 'react';
import { Calendar, ArrowRight, CheckCircle2, TrendingUp } from 'lucide-react';

interface StoryTimelineProps {
  onNavigate?: (view: string, id?: string) => void;
  showFullCta?: boolean;
}

export const StoryTimeline: React.FC<StoryTimelineProps> = ({ onNavigate, showFullCta = true }) => {
  const timelineMilestones = [
    {
      period: '[Year Started — 2014]',
      dateAttr: '2014-04',
      title: 'Started Our Journey',
      summary: 'A small group of volunteer teachers and village elders started free evening tutoring under a village tree with 25 secondhand textbooks.',
      tag: 'Humble Beginnings',
      growth: '[25 Children Supported]'
    },
    {
      period: '[Milestone Year — 2017]',
      dateAttr: '2017-08',
      title: 'First Major Program & Clean Water Station',
      summary: 'We opened our first permanent learning center and set up a solar clean drinking water station to eliminate waterborne illness.',
      tag: 'Learning & Safe Water',
      growth: '[250+ Students & 1,200 Water Users]'
    },
    {
      period: '[Expansion Year — 2020]',
      dateAttr: '2020-03',
      title: 'Expanded Community Health & Livelihoods',
      summary: 'Delivered emergency food supplies, launched mobile doctor visits, and helped 80 village mothers start home-based tailoring micro-enterprises.',
      tag: 'Health & Resilience',
      growth: '[12,000+ Relief Kits & 80 Mothers]'
    },
    {
      period: '[Growth Year — 2023]',
      dateAttr: '2023-11',
      title: 'Community Ownership & Youth Councils',
      summary: 'Decentralized operational management to local village committees and youth councils (60% female representation) for long-term sustainability.',
      tag: 'Self-Reliance',
      growth: '[140+ Trained Council Leaders]'
    },
    {
      period: '[Present — 2026 & Beyond]',
      dateAttr: '2026-09',
      title: 'Scaling Generational Impact',
      summary: 'Supporting over 10,000 people across 50+ communities with 100% open public financial audits and verified ground reporting.',
      tag: 'Present & Beyond',
      growth: '[10,000+ Beneficiaries Across 50+ Hamlets]'
    }
  ];

  return (
    <section id="our-story" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
          Our Journey
        </span>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Our Story & Historical Milestones
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          How small, consistent acts of kindness evolved into a verified grassroots institution.
        </p>
      </div>

      {/* Story Narrative intro */}
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed shadow-xs">
        <p>
          Our story began with a simple observation: children in nearby rural hamlets wanted to learn, but lacked books, quiet study spaces, and safe drinking water during the school day.
        </p>
        <p>
          Instead of waiting for distant solutions, a few friends and village elders sat together on a front porch and decided to act. We started with what we had: secondhand textbooks, a few solar lanterns, and an abundance of care.
        </p>
      </div>

      {/* Visual Timeline Track */}
      <div className="max-w-3xl mx-auto relative pt-4">
        {/* Central connecting line */}
        <div
          aria-hidden="true"
          className="absolute left-4 sm:left-1/2 top-4 bottom-4 w-1 bg-gradient-to-b from-emerald-300 via-teal-400 to-emerald-600 -translate-x-1/2 hidden sm:block opacity-40 rounded-full"
        />

        <ol role="list" className="space-y-8 relative">
          {timelineMilestones.map((item, index) => {
            const isEven = index % 2 === 0;
            return (
              <li
                key={item.period}
                className={`relative flex flex-col sm:flex-row items-center gap-6 ${
                  isEven ? 'sm:flex-row-reverse' : ''
                }`}
              >
                {/* Content Box */}
                <article className="w-full sm:w-1/2">
                  <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:border-emerald-300 hover:shadow-md transition duration-200 space-y-3">
                    <header className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                        {item.tag}
                      </span>
                      <time
                        dateTime={item.dateAttr}
                        className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg"
                      >
                        {item.period}
                      </time>
                    </header>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {item.summary}
                    </p>

                    <footer className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-700 font-bold">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Growth: {item.growth}</span>
                      </span>
                    </footer>
                  </div>
                </article>

                {/* Center node badge */}
                <div
                  aria-hidden="true"
                  className="z-10 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-xs shadow-md border-4 border-white shrink-0"
                >
                  {index + 1}
                </div>

                {/* Empty spacer for opposite column */}
                <div className="hidden sm:block sm:w-1/2" />
              </li>
            );
          })}
        </ol>
      </div>

      {showFullCta && onNavigate && (
        <div className="text-center pt-4">
          <button
            onClick={() => onNavigate('about-story')}
            className="rounded-2xl bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 text-xs font-bold transition inline-flex items-center gap-2 cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Read Full Vertical Timeline & Milestones</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  );
};
