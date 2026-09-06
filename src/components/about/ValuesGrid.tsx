import React from 'react';
import {
  Heart,
  Scale,
  ShieldCheck,
  Award,
  CheckCircle2,
  Users2,
  ArrowRight
} from 'lucide-react';

interface ValuesGridProps {
  onNavigate?: (view: string, id?: string) => void;
  showDetails?: boolean;
}

export const ValuesGrid: React.FC<ValuesGridProps> = ({ onNavigate, showDetails = false }) => {
  const values = [
    {
      title: 'Compassion',
      description: 'We care about people and their needs.',
      howItAffectsWork: 'We listen carefully to individuals before planning any project. Empathy guides every decision we make in the field.',
      icon: Heart,
      color: 'text-rose-600 bg-rose-50'
    },
    {
      title: 'Equality',
      description: 'Everyone deserves respect and opportunity.',
      howItAffectsWork: 'We ensure girls and boys receive identical educational support, and all marginalized groups have equal voice in community councils.',
      icon: Scale,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      title: 'Honesty',
      description: 'We believe in being open and honest.',
      howItAffectsWork: 'We publish full balance sheets, receipt logs, and open audits so donors and community members know the truth at all times.',
      icon: ShieldCheck,
      color: 'text-emerald-600 bg-emerald-50'
    },
    {
      title: 'Respect',
      description: 'We respect every person and every community.',
      howItAffectsWork: 'We honor local traditions, village customs, and human autonomy. We never impose solutions from the outside.',
      icon: Award,
      color: 'text-amber-600 bg-amber-50'
    },
    {
      title: 'Responsibility',
      description: 'We take responsibility for our work.',
      howItAffectsWork: 'When we build a water facility or school room, we ensure long-term maintenance rather than walking away after completion.',
      icon: CheckCircle2,
      color: 'text-teal-600 bg-teal-50'
    },
    {
      title: 'Community',
      description: 'We believe lasting change comes through people working together.',
      howItAffectsWork: 'We build local committees and train village youth so communities manage their own facilities forever.',
      icon: Users2,
      color: 'text-purple-600 bg-purple-50'
    }
  ];

  return (
    <section id="our-values" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
          Guiding Principles
        </span>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Our Values
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          The timeless human commitments that shape how we serve communities every single day.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {values.map((val) => {
          const Icon = val.icon;
          return (
            <div
              key={val.title}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 space-y-3.5 shadow-xs hover:border-emerald-300 hover:shadow-xl transition duration-300 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`h-11 w-11 rounded-2xl flex items-center justify-center ${val.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Core Principle
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">
                  {val.title}
                </h3>

                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {val.description}
                </p>

                {showDetails && (
                  <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 leading-relaxed">
                    <span className="font-bold text-slate-700 block mb-1">In Our Daily Work:</span>
                    {val.howItAffectsWork}
                  </div>
                )}
              </div>

              {!showDetails && (
                <div className="pt-2 border-t border-slate-100 flex items-center text-xs text-emerald-700 font-semibold">
                  <span>Practiced in every project</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {onNavigate && !showDetails && (
        <div className="text-center pt-2">
          <button
            onClick={() => onNavigate('about-values')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>Learn how each value shapes our frontline actions</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </section>
  );
};
