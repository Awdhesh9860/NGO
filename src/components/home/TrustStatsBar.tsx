import React from 'react';
import { Calendar, Users, CheckCircle2, HeartHandshake, MapPin } from 'lucide-react';

export const TrustStatsBar: React.FC = () => {
  const stats = [
    {
      id: 'stat-years',
      number: '15+',
      label: 'Years Helping People',
      subtext: 'Serving since 2011',
      icon: Calendar,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      id: 'stat-reached',
      number: '10,000+',
      label: 'Lives Changed',
      subtext: 'Children fed & educated',
      icon: Users,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      id: 'stat-projects',
      number: '25+',
      label: 'Completed Projects',
      subtext: 'Schools & water filters built',
      icon: CheckCircle2,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    },
    {
      id: 'stat-volunteers',
      number: '100+',
      label: 'Ground Volunteers',
      subtext: 'Caring youth & teachers',
      icon: HeartHandshake,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'stat-communities',
      number: '50+',
      label: 'Villages Supported',
      subtext: 'Safe water & schooling',
      icon: MapPin,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    }
  ];

  return (
    <section id="trust-stats-bar" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-14 relative z-10">
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xl shadow-slate-900/5 grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          const isLastCol = idx === stats.length - 1;
          return (
            <div
              key={item.id}
              className={`space-y-1.5 ${
                idx < stats.length - 1 ? 'border-b sm:border-b-0 sm:border-r border-slate-100 pb-4 sm:pb-0 sm:pr-4' : ''
              } ${isLastCol ? 'col-span-2 md:col-span-1' : ''}`}
            >
              <div className="flex justify-center mb-1">
                <div className={`h-8 w-8 rounded-xl ${item.bgColor} flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${item.color}`} />
                </div>
              </div>
              <span className={`text-2xl sm:text-3xl font-black ${item.color} tracking-tight block`}>
                {item.number}
              </span>
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {item.label}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                {item.subtext}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
