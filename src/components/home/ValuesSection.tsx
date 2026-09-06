import React from 'react';
import { Heart, Scale, Eye, ShieldCheck, Award, Users } from 'lucide-react';

export const ValuesSection: React.FC = () => {
  const values = [
    {
      number: '1',
      title: 'Compassion',
      description: 'We care deeply for every person we meet and serve with genuine warmth, patience, and empathy.',
      icon: Heart,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50'
    },
    {
      number: '2',
      title: 'Equality',
      description: 'We treat all people fairly, without any discrimination based on gender, background, faith, or status.',
      icon: Scale,
      color: 'text-teal-700',
      bgColor: 'bg-teal-50'
    },
    {
      number: '3',
      title: 'Honesty',
      description: 'We are completely transparent about every dollar received, every expense, and every field result.',
      icon: Eye,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50'
    },
    {
      number: '4',
      title: 'Respect',
      description: 'We listen respectfully to community members, honoring their wisdom and preserving personal dignity.',
      icon: ShieldCheck,
      color: 'text-purple-700',
      bgColor: 'bg-purple-50'
    },
    {
      number: '5',
      title: 'Responsibility',
      description: 'We treat every donation with utmost care, eliminating waste and keeping administrative costs minimal.',
      icon: Award,
      color: 'text-amber-700',
      bgColor: 'bg-amber-50'
    },
    {
      number: '6',
      title: 'Community',
      description: 'We believe lasting change only happens when neighbors, volunteers, and local partners unite together.',
      icon: Users,
      color: 'text-rose-700',
      bgColor: 'bg-rose-50'
    }
  ];

  return (
    <section id="core-values" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
          What Guides Us
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Our Core Values
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          The non-negotiable principles that shape every decision, field visit, and project we build.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {values.map((val) => {
          const Icon = val.icon;
          return (
            <div
              key={val.number}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-3 shadow-xs hover:border-emerald-300 hover:shadow-md transition duration-200"
            >
              <div className="flex items-center justify-between">
                <div className={`h-10 w-10 rounded-2xl ${val.bgColor} ${val.color} flex items-center justify-center font-bold`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">0{val.number}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {val.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {val.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
