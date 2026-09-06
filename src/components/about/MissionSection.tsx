import React from 'react';
import {
  GraduationCap,
  Briefcase,
  HeartPulse,
  Heart,
  Users,
  Trees,
  Home,
  CheckCircle2
} from 'lucide-react';

interface MissionSectionProps {
  onNavigate?: (view: string, id?: string) => void;
}

export const MissionSection: React.FC<MissionSectionProps> = ({ onNavigate }) => {
  const focusAreas = [
    { name: 'Education', icon: GraduationCap, desc: 'School supplies, digital classrooms & tutoring' },
    { name: 'Skills & Jobs', icon: Briefcase, desc: 'Practical trade and computer skills for youth' },
    { name: 'Health & Care', icon: HeartPulse, desc: 'Mobile health camps, medicines & checkups' },
    { name: 'Women Dignity', icon: Heart, desc: 'Self-help groups and micro-enterprise grants' },
    { name: 'Children Well-being', icon: Users, desc: 'Nutrition, safe study halls and mental health' },
    { name: 'Livelihoods', icon: Home, desc: 'Sustainable income generation for rural families' },
    { name: 'Community Care', icon: Users, desc: 'Village councils and youth volunteer circles' },
    { name: 'Environment', icon: Trees, desc: 'Solar clean water plants and village tree drives' }
  ];

  return (
    <section id="our-mission" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      <div className="rounded-3xl bg-emerald-900 text-white p-8 sm:p-12 lg:p-14 space-y-6 shadow-xl relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="space-y-3 max-w-3xl">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
            Our Core Mission
          </span>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-snug">
            Empowering Every Person With Education, Care, and Opportunity
          </h2>

          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed font-normal">
            Our mission is to walk alongside children, mothers, and hardworking families in underserved areas. We remove roadblocks to education, build clean water facilities, provide accessible community healthcare, and equip people with skills to build sustainable independence.
          </p>
        </div>

        {/* Focus Areas Grid (CMS-Configurable) */}
        <div className="pt-4 border-t border-emerald-800/80">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-4">
            Key Program Focus Areas
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {focusAreas.map((area) => {
              const Icon = area.icon;
              return (
                <div
                  key={area.name}
                  className="rounded-2xl bg-emerald-950/70 border border-emerald-800/70 p-3.5 space-y-1.5 hover:bg-emerald-800/60 transition"
                >
                  <Icon className="h-5 w-5 text-emerald-400" />
                  <p className="text-xs font-bold text-white">{area.name}</p>
                  <p className="text-[11px] text-emerald-200 leading-tight line-clamp-2">
                    {area.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
