import React from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { MapPin, CheckCircle2, ArrowRight } from 'lucide-react';

interface WhereWeWorkSectionProps {
  onNavigate?: (view: string, id?: string) => void;
}

export const WhereWeWorkSection: React.FC<WhereWeWorkSectionProps> = ({ onNavigate }) => {
  const { projects } = useDatabase();

  // Extract real locations from existing projects or clean operational hubs
  const locations = [
    {
      region: 'Eastern District Hamlets',
      focus: 'Primary Schooling & After-School Centers',
      villages: ['Sundarpur', 'Rampur Kalan', 'Bhimtal Valley Hamlets'],
      status: 'Active Centers'
    },
    {
      region: 'Semi-Arid Rural Clusters',
      focus: 'Solar Clean Water Aquifers & Testing Labs',
      villages: ['Dharampur', 'Kalyanpur Settlement', 'Gopalganj Outskirts'],
      status: 'Operational Taps'
    },
    {
      region: 'Urban Informal Settlements',
      focus: 'Women Tailoring & Digital Youth Classrooms',
      villages: ['Sector 12 Basti', 'Industrial Border Settlements'],
      status: 'Community Classrooms'
    }
  ];

  return (
    <section id="where-we-work" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
          Ground Footprint
        </span>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Where We Work
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Our field teams, volunteer coordinators, and study centers are rooted directly in these communities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {locations.map((loc) => (
          <div
            key={loc.region}
            className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs hover:border-emerald-300 hover:shadow-lg transition duration-200 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  <MapPin className="h-3 w-3" />
                  <span>{loc.status}</span>
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900">
                {loc.region}
              </h3>

              <p className="text-xs font-medium text-emerald-800">
                Focus: {loc.focus}
              </p>

              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <span className="font-semibold text-slate-700 block text-[11px] uppercase tracking-wider">
                  Communities & Settlements:
                </span>
                <ul className="space-y-1 pl-1">
                  {loc.villages.map((v) => (
                    <li key={v} className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                      <span>{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs text-slate-400 font-medium">
              Verified ground operations
            </div>
          </div>
        ))}
      </div>

      {onNavigate && (
        <div className="text-center pt-2">
          <button
            onClick={() => onNavigate('projects')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>Explore all projects on the ground</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </section>
  );
};
