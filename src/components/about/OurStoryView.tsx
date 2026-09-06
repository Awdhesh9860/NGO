import React, { useState } from 'react';
import { AboutSubNav } from './AboutSubNav';
import { AboutFinalCta } from './AboutFinalCta';
import {
  BookOpen,
  Calendar,
  Clock,
  MapPin,
  Users,
  Heart,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Flag,
  Droplets,
  GraduationCap,
  Building2,
  Quote,
  Compass,
  Layers
} from 'lucide-react';

interface OurStoryViewProps {
  onNavigate: (view: string, id?: string) => void;
  onOpenDonate?: () => void;
}

interface TimelineMilestone {
  id: string;
  period: string; // e.g. [Year Started - 2014]
  dateAttr: string; // for semantic <time dateTime="...">
  title: string;
  tag: string;
  category: 'Foundation' | 'Program' | 'Expansion' | 'Milestone' | 'Present';
  narrative: string;
  image?: string;
  imageCaption?: string;
  growthMetrics: {
    label: string;
    value: string; // placeholder format supported: e.g. "[25 Children]", "[140+ Villages]"
  }[];
  keyLearnings: string;
}

export const OurStoryView: React.FC<OurStoryViewProps> = ({ onNavigate, onOpenDonate }) => {
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);

  // Historical milestones with structured growth data placeholders
  const milestones: TimelineMilestone[] = [
    {
      id: 'milestone-start',
      period: '[Year Started — 2014]',
      dateAttr: '2014-04',
      title: 'Humble Beginnings Under a Village Tree',
      tag: 'The Spark',
      category: 'Foundation',
      narrative:
        'A small group of volunteer teachers, college students, and local elders gathered with 25 secondhand textbooks to provide free evening tutoring for children who had dropped out of school due to lack of supplies.',
      image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=80',
      imageCaption: 'First evening tutoring circle with local children and youth volunteers.',
      growthMetrics: [
        { label: 'Children Enrolled', value: '[25 Children]' },
        { label: 'Volunteer Tutors', value: '[4 Volunteers]' },
        { label: 'Initial Communities', value: '[1 Village Hamlet]' }
      ],
      keyLearnings: 'We discovered that real commitment begins simply by showing up every weekend without pretense.'
    },
    {
      id: 'milestone-first-center',
      period: '[Milestone Year — 2017]',
      dateAttr: '2017-08',
      title: 'Our First Permanent Learning Center & Clean Water Station',
      tag: 'Safe Water & Study',
      category: 'Program',
      narrative:
        'Frequent waterborne illness was causing rampant school absenteeism among our students. In response, we built our first solar-powered clean water filtration station and transformed a donated mud-brick cottage into a permanent learning center.',
      image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
      imageCaption: 'Opening our first safe drinking water tap and community classroom.',
      growthMetrics: [
        { label: 'Active Learners', value: '[250+ Students]' },
        { label: 'Safe Water Users', value: '[1,200 People]' },
        { label: 'Villages Reached', value: '[5 Hamlets]' }
      ],
      keyLearnings: 'Healthcare, clean water, and education cannot be separated — they must move forward together.'
    },
    {
      id: 'milestone-expansion',
      period: '[Expansion Year — 2020]',
      dateAttr: '2020-03',
      title: 'Emergency Relief & Women’s Livelihood Cooperatives',
      tag: 'Crisis Response',
      category: 'Expansion',
      narrative:
        'When unprecedented economic shutdowns left migrant families and daily-wage laborers without food, our field team mobilized emergency ration kits and trained 80 mothers in hygienic cloth tailoring to generate household income.',
      image: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800&auto=format&fit=crop&q=80',
      imageCaption: 'Women-led tailoring workshop and community supply distribution.',
      growthMetrics: [
        { label: 'Ration Kits Distributed', value: '[12,000+ Kits]' },
        { label: 'Women Micro-Earners', value: '[80+ Mothers]' },
        { label: 'Mobile Health Clinics', value: '[35 Camps]' }
      ],
      keyLearnings: 'Empowering mothers directly protects the entire family’s nutrition, education, and resilience.'
    },
    {
      id: 'milestone-ownership',
      period: '[Growth Year — 2023]',
      dateAttr: '2023-11',
      title: 'Decentralized Community Water & Youth Councils',
      tag: 'Self-Reliance',
      category: 'Milestone',
      narrative:
        'We transitioned daily management of all community water stations and study halls to democratically elected Village Councils (with 60% female representation), ensuring local autonomy and long-term facility maintenance.',
      image: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=800&auto=format&fit=crop&q=80',
      imageCaption: 'Village youth committee inspecting community solar water systems.',
      growthMetrics: [
        { label: 'Trained Local Leaders', value: '[140+ Council Members]' },
        { label: 'Active Water Plants', value: '[18 Solar Units]' },
        { label: 'Annual School Retention', value: '[94% Retention]' }
      ],
      keyLearnings: 'True sustainability happens when communities no longer need our daily presence to thrive.'
    },
    {
      id: 'milestone-present',
      period: '[Present — 2026 & Beyond]',
      dateAttr: '2026-09',
      title: 'Scaling Transparency & Generational Impact',
      tag: 'Current Horizon',
      category: 'Present',
      narrative:
        'Today, our foundation supports over 10,000 children and families across 50+ communities. We operate with 100% open public financial audits, digital receipts, and verified field metrics, setting the standard for transparent non-profit service.',
      image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80',
      imageCaption: 'Digital learning and science lab session in a model rural school.',
      growthMetrics: [
        { label: 'Lives Reached to Date', value: '[10,000+ People]' },
        { label: 'Supported Communities', value: '[50+ Villages]' },
        { label: 'Registered Volunteers', value: '[100+ Frontline]' }
      ],
      keyLearnings: 'Our future lies in deepening open governance, digital education, and clean water self-reliance.'
    }
  ];

  return (
    <article className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white pb-16">
      {/* Top Subnavigation */}
      <AboutSubNav currentSubPage="story" onNavigate={onNavigate} />

      {/* 1. Header / Hero Section */}
      <header className="relative pt-8 sm:pt-14 pb-12 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-emerald-700 transition cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-emerald-700 transition cursor-pointer"
                >
                  About Us
                </button>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-emerald-700 font-bold" aria-current="page">
                Our Story
              </li>
            </ol>
          </nav>

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100/70 border border-emerald-200 px-3.5 py-1 text-xs font-bold text-emerald-800 uppercase tracking-wider">
              <BookOpen className="h-3.5 w-3.5 text-emerald-700" />
              <span>Grassroots Heritage & Evolution</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Our Story: From Small Steps to Lasting Change
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              How a shared cup of tea under a village tree, secondhand textbooks, and honest field commitments grew into a transparent, community-led non-profit movement.
            </p>
          </div>
        </div>
      </header>

      {/* 2 & 3. Narrative Context: How It Started & The Need We Saw */}
      <section aria-labelledby="origin-heading" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 items-center">
          
          <div className="lg:col-span-5 relative">
            <figure className="rounded-3xl overflow-hidden border border-slate-200/90 shadow-xl bg-slate-100">
              <img
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1000&auto=format&fit=crop&q=80"
                alt="Volunteers and young children gathering with notebooks"
                className="w-full h-80 sm:h-[420px] object-cover"
                loading="eager"
              />
              <figcaption className="p-3 bg-white text-[11px] text-slate-500 border-t border-slate-100 text-center font-medium">
                [Field Photograph] — Early educational tutoring sessions in village settlements.
              </figcaption>
            </figure>
          </div>

          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                The Origin
              </span>
              <h2 id="origin-heading" className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                The Need We Saw on the Ground
              </h2>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <p>
                In <time dateTime="2014">[Year Started — 2014]</time>, our founders visited several rural hamlets in eastern agricultural districts. What struck us was not a lack of enthusiasm, but the absence of basic tools: children sat under straw awnings with shared pencil stubs, and recurrent stomach infections from contaminated village ponds forced girls to miss weeks of schooling.
              </p>
              <p>
                The diagnosis was clear. People did not need distant speeches or complicated whitepapers. They needed clean, reliable water taps within their hamlets, after-school learning support, and patient teachers who showed up every single weekend.
              </p>
            </div>

            <blockquote className="rounded-2xl bg-emerald-50/80 border-l-4 border-emerald-600 p-4 sm:p-5 text-xs sm:text-sm text-emerald-950 font-medium italic">
              "We realized early on that charity creates dependency, but community respect creates self-reliance. From our very first meeting, we pledged to walk with families as partners, not benefactors."
            </blockquote>
          </div>

        </div>
      </section>

      {/* 4. Centerpiece: Premium Vertical Timeline Visual */}
      <section aria-labelledby="timeline-heading" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
            Chronological Journey
          </span>
          <h2 id="timeline-heading" className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Our Historical Milestones & Growth
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            A step-by-step record of humble origins, lessons learned, and measurable community expansion.
          </p>
        </div>

        {/* The Vertical Timeline Track */}
        <div className="relative max-w-5xl mx-auto">
          {/* Continuous vertical center guide line */}
          <div
            aria-hidden="true"
            className="absolute left-6 md:left-1/2 top-4 bottom-8 w-1 -translate-x-1/2 bg-gradient-to-b from-emerald-400 via-teal-500 to-emerald-600 rounded-full opacity-30 md:opacity-40"
          />

          <ol role="list" className="space-y-12 sm:space-y-16 relative">
            {milestones.map((item, index) => {
              const isEven = index % 2 === 0;
              const isSelected = selectedMilestone === item.id;

              return (
                <li
                  key={item.id}
                  className={`relative flex flex-col md:flex-row items-start ${
                    isEven ? 'md:flex-row-reverse' : ''
                  } gap-6 md:gap-12`}
                >
                  {/* Content Card (Desktop Left or Right alternating, Mobile aligned with indent) */}
                  <article className="w-full md:w-1/2 pl-12 md:pl-0">
                    <div
                      className={`bg-white rounded-3xl border ${
                        isSelected ? 'border-emerald-500 shadow-xl ring-2 ring-emerald-500/20' : 'border-slate-200/90 shadow-xs'
                      } p-6 sm:p-8 space-y-5 hover:border-emerald-400 hover:shadow-lg transition duration-300`}
                    >
                      {/* Milestone Header */}
                      <header className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200/80">
                            {item.tag}
                          </span>
                          <time
                            dateTime={item.dateAttr}
                            className="font-mono text-xs font-black text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg"
                          >
                            {item.period}
                          </time>
                        </div>

                        <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                          {item.title}
                        </h3>
                      </header>

                      {/* Optional Photo Attachment */}
                      {item.image && (
                        <figure className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-44 sm:h-52 object-cover hover:scale-105 transition duration-500"
                            loading="lazy"
                          />
                          {item.imageCaption && (
                            <figcaption className="p-2 text-[10px] text-slate-500 bg-slate-50 text-center italic">
                              {item.imageCaption}
                            </figcaption>
                          )}
                        </figure>
                      )}

                      {/* Narrative Text */}
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                        {item.narrative}
                      </p>

                      {/* Structured Growth Data Placeholders */}
                      <div className="pt-3 border-t border-slate-100">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                          Verified Growth & Metrics
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          {item.growthMetrics.map((gm) => (
                            <div
                              key={gm.label}
                              className="rounded-xl bg-slate-50 p-2.5 text-center border border-slate-100"
                            >
                              <span className="block text-xs sm:text-sm font-black text-emerald-700">
                                {gm.value}
                              </span>
                              <span className="block text-[10px] font-medium text-slate-500 mt-0.5 leading-tight">
                                {gm.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Field Takeaway */}
                      <footer className="rounded-xl bg-slate-50/70 p-3 border border-slate-100 flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-[11px] text-slate-600 italic">
                          <strong className="text-slate-800 not-italic font-bold">Key Insight: </strong>
                          {item.keyLearnings}
                        </span>
                      </footer>
                    </div>
                  </article>

                  {/* Central Node Badge */}
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 top-6 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white border-4 border-emerald-500 text-emerald-800 font-black text-xs sm:text-sm shadow-md z-10">
                    <Calendar className="h-4 w-4 text-emerald-600" />
                  </div>

                  {/* Empty balance spacer for Desktop alternating columns */}
                  <div className="hidden md:block md:w-1/2" />
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* 5. Challenges Faced & How We Overcame Them */}
      <section aria-labelledby="challenges-heading" className="bg-white py-14 border-y border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-3.5 py-1 rounded-full border border-rose-200">
              Honest Reflection
            </span>
            <h2 id="challenges-heading" className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Early Obstacles & Field Lessons
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Grassroots work is full of real-world friction. Here is how we adjusted our methods.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50/90 rounded-3xl border border-slate-200/80 p-6 space-y-3 shadow-xs">
              <span className="h-9 w-9 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-black text-xs">
                01
              </span>
              <h3 className="font-bold text-slate-900 text-base">Overcoming Community Skepticism</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Villagers had seen prior groups promise grandiose schemes and disappear after taking photographs. We countered skepticism with radical consistency: tutoring every Saturday and Sunday without fail, regardless of rain or heat.
              </p>
            </div>

            <div className="bg-slate-50/90 rounded-3xl border border-slate-200/80 p-6 space-y-3 shadow-xs">
              <span className="h-9 w-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-xs">
                02
              </span>
              <h3 className="font-bold text-slate-900 text-base">The Maintenance Trap</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Early water filtration pumps broke down when spare parts were needed. We restructured our protocol: no tap is installed until three local village youth complete certified plumbing training and maintain an emergency maintenance kitty.
              </p>
            </div>

            <div className="bg-slate-50/90 rounded-3xl border border-slate-200/80 p-6 space-y-3 shadow-xs">
              <span className="h-9 w-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">
                03
              </span>
              <h3 className="font-bold text-slate-900 text-base">Total Fiscal Transparency</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                To eliminate doubt and protect donor trust, we published itemized receipts online from our first year. Every dollar donated can be traced directly to educational materials or hardware installed on the ground.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Communities We Reached & Summary Stats */}
      <section aria-labelledby="communities-heading" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-14 space-y-8 shadow-2xl relative overflow-hidden border border-slate-800">
          
          <div className="relative max-w-3xl space-y-3 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
              Ground Footprint
            </span>
            <h2 id="communities-heading" className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Where We Stand Today
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              What started as four volunteers on a village veranda has grown into an enduring community institution. Today, our self-sustaining model is actively replicated across dozens of partner settlements.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="rounded-2xl bg-slate-800/80 border border-slate-700/80 p-5 space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400">[10,000+]</span>
              <p className="text-xs font-bold text-slate-200">People Directly Reached</p>
              <p className="text-[11px] text-slate-400">Education, water, and clinic beneficiaries</p>
            </div>

            <div className="rounded-2xl bg-slate-800/80 border border-slate-700/80 p-5 space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400">[50+]</span>
              <p className="text-xs font-bold text-slate-200">Villages & Hamlets</p>
              <p className="text-[11px] text-slate-400">Co-managed community spaces</p>
            </div>

            <div className="rounded-2xl bg-slate-800/80 border border-slate-700/80 p-5 space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400">[100+]</span>
              <p className="text-xs font-bold text-slate-200">Active Volunteers</p>
              <p className="text-[11px] text-slate-400">Educators, youth fellows, and medics</p>
            </div>

            <div className="rounded-2xl bg-slate-800/80 border border-slate-700/80 p-5 space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400">[100%]</span>
              <p className="text-xs font-bold text-slate-200">Open Public Audits</p>
              <p className="text-[11px] text-slate-400">Statutory compliance & 80G status</p>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap gap-4 items-center">
            <button
              onClick={() => onNavigate('projects')}
              className="rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3.5 text-xs font-bold transition inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <span>Explore All Ground Projects</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => onNavigate('transparency')}
              className="rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-6 py-3.5 text-xs font-bold transition cursor-pointer"
            >
              <span>View Certified Audits & Reports</span>
            </button>
          </div>

        </div>
      </section>

      {/* 7. Final Call to Action */}
      <AboutFinalCta onOpenDonate={onOpenDonate} onNavigate={onNavigate} />
    </article>
  );
};
