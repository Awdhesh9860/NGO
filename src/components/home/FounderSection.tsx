import React from 'react';
import { Quote, ArrowRight, Heart } from 'lucide-react';

interface FounderSectionProps {
  onNavigate: (view: string, id?: string) => void;
}

export const FounderSection: React.FC<FounderSectionProps> = ({ onNavigate }) => {
  return (
    <section id="founder-message" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-8 sm:p-12 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center shadow-xl border border-slate-800">
        
        {/* Founder Avatar & Credentials */}
        <div className="lg:col-span-4 flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="h-36 w-36 sm:h-44 sm:w-44 rounded-full overflow-hidden border-4 border-emerald-500/40 shadow-2xl bg-slate-700">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80"
                alt="Founder & Managing Trustee"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
              <Heart className="h-5 w-5 fill-white" />
            </div>
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-black text-white">Dr. Evelyn Vance</h3>
            <p className="text-xs text-emerald-400 font-semibold tracking-wide mt-0.5">
              Founder & Managing Trustee
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              15+ Years Grassroots Development
            </p>
          </div>
        </div>

        {/* Founder Quotation & Philosophy */}
        <div className="lg:col-span-8 space-y-5 text-left">
          <Quote className="h-10 w-10 text-emerald-400/30" />

          <p className="text-base sm:text-lg text-slate-200 leading-relaxed italic font-normal">
            "True social transformation begins with quiet listening. When we sit with a mother who worries about her child's schooling, or an elder who needs safe water for their hamlet, our foremost duty is humility. We are not saviors; we are partners. Every single donation entrusted to us is a sacred responsibility to make that child's life genuinely better."
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onNavigate('about')}
              className="rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md"
            >
              <span>Read Full Founder Message & Vision</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <span className="text-xs text-slate-400">
              Dedicated to transparency & dignity
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};
