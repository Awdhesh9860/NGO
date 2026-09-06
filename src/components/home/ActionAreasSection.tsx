import React from 'react';
import {
  GraduationCap,
  Briefcase,
  Users,
  Heart,
  Droplets,
  Building,
  Trees,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ActionAreasSectionProps {
  onNavigate: (view: string, id?: string) => void;
}

export const ActionAreasSection: React.FC<ActionAreasSectionProps> = ({ onNavigate }) => {
  const areas = [
    {
      title: 'Education & Literacy',
      desc: 'School kits, daily tuition support, digital tablets, and girl-child school retention programs.',
      icon: GraduationCap,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'hover:border-emerald-300'
    },
    {
      title: 'Skill Development',
      desc: 'Practical vocational courses in electrical repair, computer literacy, and hospitality skills.',
      icon: Briefcase,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'hover:border-teal-300'
    },
    {
      title: 'Women Empowerment',
      desc: 'Self-help savings groups, certified tailoring centers, and micro-enterprise loans.',
      icon: Users,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'hover:border-rose-300'
    },
    {
      title: 'Child Welfare & Nutrition',
      desc: 'Nutritious midday meals, warm winter kits, and community child safeguarding networks.',
      icon: Heart,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'hover:border-amber-300'
    },
    {
      title: 'Health & Safe Water',
      desc: 'Solar deep-well water filtration plants, mobile medical health clinics, and medicine drives.',
      icon: Droplets,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'hover:border-blue-300'
    },
    {
      title: 'Community Infrastructure',
      desc: 'Village libraries, study halls, solar street illumination, and sanitation facilities.',
      icon: Building,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'hover:border-indigo-300'
    },
    {
      title: 'Environmental Care',
      desc: 'Community tree planting, plastic recovery drives, rainwater harvesting, and clean energy.',
      icon: Trees,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'hover:border-emerald-400'
    },
    {
      title: 'Livelihoods & Micro-Grants',
      desc: 'Seed tools for smallholder farmers, local artisan crafts marketing, and fair co-ops.',
      icon: Sparkles,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'hover:border-purple-300'
    }
  ];

  return (
    <section id="action-areas" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            Areas of Action
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
            What We Do
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Eight comprehensive intervention pillars designed to sustainably break the cycle of poverty.
          </p>
        </div>

        <button
          onClick={() => onNavigate('programs')}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
        >
          <span>Explore All Focus Areas</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {areas.map((area) => {
          const Icon = area.icon;
          return (
            <div
              key={area.title}
              onClick={() => onNavigate('programs')}
              className={`bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-3 cursor-pointer shadow-xs ${area.borderColor} hover:shadow-md transition duration-200 flex flex-col justify-between`}
            >
              <div className="space-y-3">
                <div className={`h-11 w-11 rounded-2xl ${area.bgColor} ${area.color} flex items-center justify-center`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  {area.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {area.desc}
                </p>
              </div>

              <div className="pt-2 flex items-center text-xs font-bold text-emerald-700 gap-1 group">
                <span>View initiatives</span>
                <ArrowRight className="h-3 w-3 transition transform group-hover:translate-x-1" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
