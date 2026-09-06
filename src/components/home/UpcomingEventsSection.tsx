import React from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { Event } from '../../types';
import { Calendar, MapPin, ArrowRight, Clock } from 'lucide-react';

interface UpcomingEventsSectionProps {
  onNavigate: (view: string, id?: string) => void;
}

export const UpcomingEventsSection: React.FC<UpcomingEventsSectionProps> = ({ onNavigate }) => {
  const { events } = useDatabase();

  return (
    <section id="upcoming-events" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            Get Involved Locally
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
            Upcoming Community Events
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Workshops, medical camps, volunteer orientations, and tree planting drives open to all.
          </p>
        </div>

        <button
          onClick={() => onNavigate('events')}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
        >
          <span>View All Events</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {events.slice(0, 3).map((evt: Event) => (
          <div
            key={evt.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs hover:shadow-xl hover:border-emerald-300 transition duration-300 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full">
                {evt.category}
              </span>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {evt.title}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {evt.description}
              </p>

              <div className="text-xs text-slate-600 space-y-1.5 pt-3 border-t border-slate-100 font-medium">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>{evt.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{evt.location}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Open Admission</span>
              <button
                onClick={() => onNavigate('events', evt.id)}
                className="rounded-xl bg-slate-900 hover:bg-emerald-600 text-white px-4 py-2 text-xs font-bold transition cursor-pointer"
              >
                Details / Register
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
