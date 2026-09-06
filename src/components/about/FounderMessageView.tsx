import React from 'react';
import { AboutSubNav } from './AboutSubNav';
import { AboutFinalCta } from './AboutFinalCta';
import { Quote, Heart, ArrowRight, ShieldCheck, Mail, Users } from 'lucide-react';

interface FounderMessageViewProps {
  onNavigate: (view: string, id?: string) => void;
  onOpenDonate?: () => void;
}

export const FounderMessageView: React.FC<FounderMessageViewProps> = ({ onNavigate, onOpenDonate }) => {
  return (
    <div className="space-y-12">
      <AboutSubNav currentSubPage="founder" onNavigate={onNavigate} />

      {/* 1. Founder Hero */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-3.5 py-1 text-xs font-bold text-emerald-800 uppercase tracking-wider">
            <Heart className="h-3.5 w-3.5 text-emerald-600" />
            <span>Leadership Reflection</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            A Message From Our Founder
          </h1>
          <p className="text-xs sm:text-base text-slate-600 leading-relaxed font-normal">
            Reflections on service, human dignity, and what it truly means to build sustainable community support.
          </p>
        </div>
      </section>

      {/* 2 & 3. Founder Portrait & Core Message */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 items-start">
          
          {/* Portrait & Credentials */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-4 shadow-sm text-center">
            <div className="relative mx-auto w-44 h-44 rounded-full overflow-hidden border-4 border-emerald-100 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80"
                alt="Dr. Evelyn Vance - Founder & Managing Trustee"
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900">Dr. Evelyn Vance</h2>
              <p className="text-xs font-bold text-emerald-700 mt-0.5">Founder & Managing Trustee</p>
              <p className="text-xs text-slate-500 mt-1">15+ Years Grassroots Development</p>
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-2 text-left">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Non-Profit Governance Specialist</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Advocate for Village Self-Reliance</span>
              </div>
            </div>
          </div>

          {/* Detailed Message Blocks */}
          <div className="lg:col-span-8 space-y-6 text-left text-xs sm:text-sm text-slate-700 leading-relaxed">
            
            <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-3">
              <Quote className="h-8 w-8 text-emerald-600/30" />
              <p className="text-base sm:text-lg font-bold text-slate-900 italic leading-snug">
                "When you sit on the mud veranda of a village family and listen without rushing, you quickly discover that people do not want pity. They want a fair chance."
              </p>
            </div>

            {/* Why The NGO Was Started */}
            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Why We Started This Foundation
              </h3>
              <p>
                Over a decade ago, I met a 9-year-old girl named Sunita who walked four kilometers every morning carrying two heavy containers of water before school even began. By the time classes started, she was too exhausted to focus. Soon after, she stopped attending school altogether.
              </p>
              <p>
                Seeing that broken promise of potential broke my heart. The solution wasn't complicated — a solar-powered water filtration plant in her village hamlet solved the water problem for 400 families, and Sunita returned to the front row of her classroom.
              </p>
            </div>

            {/* Journey & Lessons */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                What Our Journey Has Taught Us
              </h3>
              <p>
                We have learned that lasting change is slow, deliberate, and respectful. We do not arrive in a village as saviors with pre-packaged answers. We form local mothers' committees and train young people to manage their own facilities. That way, when our teams step back, the clean water keeps flowing and the school stays full.
              </p>
            </div>

            {/* Message to Volunteers */}
            <div className="rounded-2xl bg-purple-50 border border-purple-100 p-5 space-y-1.5 text-purple-900">
              <h4 className="font-bold text-sm">A Note to Our Frontline Volunteers:</h4>
              <p className="text-xs">
                Your quiet hours spent helping a child read, organizing medical records, or packing emergency kits are the heartbeat of this organization. You give this foundation its warmth and humanity. Thank you.
              </p>
            </div>

            {/* Message to Donors */}
            <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-5 space-y-1.5 text-emerald-900">
              <h4 className="font-bold text-sm">A Note to Our Supporters & Donors:</h4>
              <p className="text-xs">
                Whether you donate $25 a month or sponsor an entire rural water station, we treat your support as a sacred trust. Every dollar is audited, and we will never hide our balance sheets from you. Thank you for making this work possible.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* CTA */}
      <AboutFinalCta onOpenDonate={onOpenDonate} onNavigate={onNavigate} />
    </div>
  );
};
