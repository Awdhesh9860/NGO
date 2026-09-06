import React from 'react';
import { Users, Heart, ArrowRight, Clock, Award } from 'lucide-react';

interface VolunteerCtaSectionProps {
  onOpenDonate: () => void;
  onNavigate: (view: string, id?: string) => void;
}

export const VolunteerCtaSection: React.FC<VolunteerCtaSectionProps> = ({
  onOpenDonate,
  onNavigate
}) => {
  return (
    <section id="get-involved-cta" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        
        {/* Volunteer Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 space-y-4 shadow-xs hover:border-purple-200 transition duration-200 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 block">
              Give Your Time & Skills
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              Your Time Can Change a Life
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Join our frontline community of volunteers. Whether you can give 2 hours on a weekend to teach children, assist at a rural medical checkup, or help with digital documentation, your hands and heart are welcome.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('volunteers')}
              className="rounded-2xl bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Users className="h-4 w-4" />
              <span>Apply to Become a Volunteer</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Financial Support Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 space-y-4 shadow-xs hover:border-emerald-200 transition duration-200 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Heart className="h-6 w-6 fill-emerald-600 text-emerald-700" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
              Direct Community Help
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              Every Small Help Saves a Life
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Even a small contribution of ₹500 or ₹1,000 provides school books, bags, and clean drinking water to a child. You receive an instant 80G tax-saving receipt on WhatsApp and Email right away.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              onClick={() => onOpenDonate()}
              className="rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3.5 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20"
            >
              <Heart className="h-4 w-4 fill-white" />
              <span>Make a Donation Now</span>
            </button>
            <button
              onClick={() => onNavigate('campaigns')}
              className="rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 px-5 py-3.5 text-xs font-bold transition cursor-pointer"
            >
              Explore Campaigns
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
