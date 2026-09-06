import React from 'react';
import { Eye, Sparkles, CheckCircle2 } from 'lucide-react';

export const VisionSection: React.FC = () => {
  return (
    <section id="our-vision" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 sm:p-14 lg:p-16 text-center space-y-6 shadow-2xl relative overflow-hidden border border-slate-800">
        
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative inline-flex items-center gap-2 rounded-full bg-slate-800/90 border border-slate-700 px-3.5 py-1 text-xs font-bold text-emerald-400 uppercase tracking-widest">
          <Eye className="h-3.5 w-3.5" />
          <span>Long-Term Horizon</span>
        </div>

        <h2 className="relative text-xs font-bold uppercase tracking-wider text-slate-400">
          Our Vision
        </h2>

        <blockquote className="relative text-2xl sm:text-4xl lg:text-5xl font-black max-w-4xl mx-auto leading-tight text-white tracking-tight">
          "A future where every person has the opportunity to live with dignity, learn, grow and build a better life."
        </blockquote>

        <p className="relative text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
          We envision vibrant villages and neighborhoods where no child drops out of school due to poverty, where clean water flows freely, and where community members guide their own development with confidence and pride.
        </p>

        <div className="relative pt-4 flex flex-wrap justify-center gap-6 text-xs text-slate-300 font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Equal Human Dignity</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Generational Education</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Community Self-Reliance</span>
          </div>
        </div>

      </div>
    </section>
  );
};
