import React from 'react';
import { Heart, Users, ArrowRight, PhoneCall } from 'lucide-react';

interface FinalCtaSectionProps {
  onOpenDonate: () => void;
  onNavigate: (view: string, id?: string) => void;
}

export const FinalCtaSection: React.FC<FinalCtaSectionProps> = ({ onOpenDonate, onNavigate }) => {
  return (
    <section id="final-cta" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
      <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-16 text-center space-y-6 shadow-2xl relative overflow-hidden border border-slate-800">
        
        {/* Glow ambient */}
        <div className="absolute top-0 right-1/4 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />

        <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-3.5 py-1 rounded-full border border-emerald-800">
          Make a Difference Today
        </span>

        <h2 className="text-3xl sm:text-5xl font-black max-w-2xl mx-auto tracking-tight leading-tight">
          Together, We Can Change Tomorrow.
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Every child kept in school, every clean drinking water tap opened, and every volunteer trained begins with a single step. Join us today in building an honest, kinder world.
        </p>

        <div className="pt-2 flex flex-wrap justify-center gap-3 text-xs font-bold">
          <button
            onClick={() => onOpenDonate()}
            className="rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 shadow-xl shadow-emerald-600/30 transition flex items-center gap-2.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Heart className="h-4 w-4 fill-white" />
            <span>Donate Now</span>
          </button>

          <button
            onClick={() => onNavigate('volunteers')}
            className="rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-7 py-4 transition flex items-center gap-2 cursor-pointer"
          >
            <Users className="h-4 w-4" />
            <span>Volunteer With Us</span>
          </button>

          <button
            onClick={() => onNavigate('contact')}
            className="rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-7 py-4 transition flex items-center gap-2 cursor-pointer"
          >
            <PhoneCall className="h-4 w-4" />
            <span>Contact Field Desk</span>
          </button>
        </div>

      </div>
    </section>
  );
};
