import React from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { ShieldCheck, Users, Heart, Sparkles } from 'lucide-react';

export const AboutHero: React.FC = () => {
  const { settings } = useDatabase();

  return (
    <section aria-labelledby="about-hero-title" className="relative pt-6 sm:pt-10 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-3.5 py-1 text-xs font-bold text-emerald-800 uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Non-Profit & Community-Driven</span>
          </span>

          <h1 id="about-hero-title" className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            About Us
          </h1>

          <p className="text-lg sm:text-2xl font-bold text-emerald-700">
            Working Together for a Better Future
          </p>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
            We are {settings.ngoName || 'an independent non-profit foundation'}. We work with people and families in rural communities to provide good schools for children, safe drinking water, basic health services, and real opportunities for youth and women to build a better life.
          </p>
        </div>

        {/* Large Meaningful Hero Image */}
        <div className="mt-10 sm:mt-12 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 relative bg-slate-100 max-w-5xl mx-auto">
          <img
            src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1600&auto=format&fit=crop&q=80"
            alt="Children and community members smiling together in a village classroom"
            className="w-full h-64 sm:h-96 lg:h-[460px] object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 text-white text-xs sm:text-sm font-medium flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Field activities with children and local youth councils</span>
          </div>
        </div>
      </div>
    </section>
  );
};
