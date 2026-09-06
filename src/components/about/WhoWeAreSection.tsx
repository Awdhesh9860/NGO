import React from 'react';
import { ArrowRight, CheckCircle2, Heart, Users, ShieldCheck, Sparkles } from 'lucide-react';

interface WhoWeAreSectionProps {
  onNavigate: (view: string, id?: string) => void;
}

export const WhoWeAreSection: React.FC<WhoWeAreSectionProps> = ({ onNavigate }) => {
  return (
    <section id="who-we-are" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 items-center">
        
        {/* Left Column: NGO Image */}
        <div className="lg:col-span-5 relative">
          <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200/90 bg-slate-100">
            <img
              src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800&auto=format&fit=crop&q=80"
              alt="NGO volunteers and field teachers working with community members"
              className="w-full h-80 sm:h-[420px] object-cover"
              loading="lazy"
            />
          </div>
          {/* Subtle floating badge */}
          <div className="absolute -bottom-5 -right-3 sm:-bottom-6 sm:-right-4 rounded-2xl bg-white border border-slate-200 p-4 shadow-xl flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">Community Led</p>
              <p className="text-[11px] text-slate-500 font-normal">Working side-by-side</p>
            </div>
          </div>
        </div>

        {/* Right Column: Clear explanation */}
        <div className="lg:col-span-7 space-y-5 text-left">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              Our Identity
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-2 tracking-tight">
              Who We Are
            </h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <div className="rounded-2xl bg-slate-50/80 border border-slate-200/80 p-4 space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">Who are we?</h3>
              <p>
                We are a dedicated group of social workers, teachers, local community leaders, and volunteers who believe that every human being deserves care, kindness, and equal opportunity.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50/80 border border-slate-200/80 p-4 space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">Why do we exist?</h3>
              <p>
                We exist because many children, mothers, and young people still face hardship simply because of where they were born. We want to remove those barriers with honest, long-lasting support.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50/80 border border-slate-200/80 p-4 space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">Who do we help?</h3>
              <p>
                We support children who need schooling, rural families who lack safe drinking water, mothers seeking healthcare, and young people who want practical job skills.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50/80 border border-slate-200/80 p-4 space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">What work do we do?</h3>
              <p>
                We run after-school learning centers, install clean water stations, organize free medical camps, and provide vocational workshops so families can earn their own income with pride.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('programs')}
              className="rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3.5 text-xs font-bold transition flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <span>Learn More About Our Work</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
