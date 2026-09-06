import React from 'react';
import { Quote, ArrowRight, Heart } from 'lucide-react';

interface FounderCardProps {
  onNavigate: (view: string, id?: string) => void;
}

export const FounderCard: React.FC<FounderCardProps> = ({ onNavigate }) => {
  return (
    <section id="founder-preview" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-12 shadow-md grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
        
        {/* Founder Portrait */}
        <div className="lg:col-span-4 flex flex-col items-center text-center space-y-3">
          <div className="relative">
            <div className="h-40 w-40 sm:h-48 sm:w-48 rounded-full overflow-hidden border-4 border-emerald-100 shadow-xl bg-slate-100">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80"
                alt="Dr. Evelyn Vance - Founder & Managing Trustee"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 h-10 w-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <Heart className="h-5 w-5 fill-white" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-black text-slate-900">Dr. Evelyn Vance</h3>
            <p className="text-xs font-bold text-emerald-700 mt-0.5">
              Founder & Managing Trustee
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Over 15 years working in grassroots education
            </p>
          </div>
        </div>

        {/* Message preview */}
        <div className="lg:col-span-8 space-y-4 text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            A Message From Our Founder
          </span>

          <Quote className="h-8 w-8 text-emerald-600/30" />

          <p className="text-sm sm:text-base text-slate-700 leading-relaxed italic font-normal">
            "We started this work with one simple conviction: every child and family deserves a fair chance in life. When we give a child a book, install a safe water tap, or help a mother earn her own income, we are not performing charity — we are upholding human dignity. I am deeply thankful to every volunteer, teacher, and donor who walks this path with us."
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onNavigate('about-founder')}
              className="rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20"
            >
              <span>Read Full Founder Message</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <span className="text-xs text-slate-500 font-medium">
              Personal note on purpose & our journey
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};
