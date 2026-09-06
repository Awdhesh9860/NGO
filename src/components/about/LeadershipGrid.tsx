import React from 'react';
import { ArrowRight, ShieldCheck, Mail } from 'lucide-react';

interface LeadershipGridProps {
  onNavigate: (view: string, id?: string) => void;
  showAll?: boolean;
}

export const LeadershipGrid: React.FC<LeadershipGridProps> = ({ onNavigate, showAll = false }) => {
  const leaders = [
    {
      name: 'Dr. Evelyn Vance',
      role: 'Founder & Executive Director',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      intro: 'Guides overall organization vision, community relations, and ethical safeguarding standards across all projects.'
    },
    {
      name: 'Aarav Sharma',
      role: 'Chief Operations Officer',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      intro: 'Oversees day-to-day field logistics, volunteer coordination, emergency response drives, and program monitoring.'
    },
    {
      name: 'Sarah Jenkins',
      role: 'Senior Program Director',
      photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
      intro: 'Leads our primary school interventions, teacher training modules, and free medical checkup camps.'
    },
    {
      name: 'David Chen',
      role: 'Field Operations Lead',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      intro: 'Directs clean water infrastructure, solar filtration installations, and technical village committee training.'
    }
  ];

  const displayedLeaders = showAll ? leaders : leaders.slice(0, 3);

  return (
    <section id="leadership-preview" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            Trusted Governance
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-2 tracking-tight">
            Our Leadership
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Experienced professionals leading with integrity, responsibility, and deep field empathy.
          </p>
        </div>

        {!showAll && (
          <button
            onClick={() => onNavigate('about-leadership')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
          >
            <span>Meet Our Leadership Team</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayedLeaders.map((leader) => (
          <div
            key={leader.name}
            className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs hover:border-emerald-300 hover:shadow-lg transition duration-200 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="h-44 rounded-2xl overflow-hidden bg-slate-100 relative">
                <img
                  src={leader.photo}
                  alt={leader.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{leader.name}</h3>
                <p className="text-xs font-bold text-emerald-700 mt-0.5">{leader.role}</p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {leader.intro}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Full statutory governance compliance</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
