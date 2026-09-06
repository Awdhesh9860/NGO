import React from 'react';
import { ArrowRight, CheckCircle2, Shield } from 'lucide-react';

interface AboutPreviewSectionProps {
  onNavigate: (view: string, id?: string) => void;
}

export const AboutPreviewSection: React.FC<AboutPreviewSectionProps> = ({ onNavigate }) => {
  return (
    <section id="about-preview" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-xs">
        
        {/* Left Column: Narrative */}
        <div className="lg:col-span-7 space-y-5 text-left">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            Who We Are
          </span>

          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-snug">
            Helping Poor Families Stand On Their Own Feet
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            We are a registered, honest group of social workers and volunteers. We believe every child should go to school, every home should have clean drinking water, and no family should sleep hungry or suffer without doctor care.
          </p>

          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            We never sit in distant offices guessing what people need. Our volunteers go directly into villages and poor neighborhoods, sit with mothers and elders, and deliver real help with love and complete transparency.
          </p>

          {/* Core Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-xs font-semibold text-slate-700">We Listen to Families First</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-xs font-semibold text-slate-700">Zero Middlemen — Direct Ground Help</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-xs font-semibold text-slate-700">Yearly Audited Accounts (Public)</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-xs font-semibold text-slate-700">Safe & Caring Space for Children</span>
            </div>
          </div>

          <div className="pt-3">
            <button
              onClick={() => onNavigate('about')}
              className="rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white px-7 py-3.5 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20"
            >
              <span>Read Our Complete Story</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Visual Imagery */}
        <div className="lg:col-span-5 space-y-4">
          <div className="h-72 sm:h-96 rounded-3xl overflow-hidden shadow-inner bg-slate-100 relative group">
            <img
              src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=80"
              alt="Community meeting with volunteers listening to village elders and mothers"
              className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <p className="text-xs font-bold">Community Planning Council</p>
              <p className="text-[11px] text-slate-200">Listening before planning, acting with respect</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
