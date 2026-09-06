import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  X,
  QrCode,
  Sparkles,
  Ticket
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const EventsView: React.FC = () => {
  const { events, registerForEvent } = useDatabase();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [ticketIssued, setTicketIssued] = useState<{
    eventName: string;
    ticketId: string;
    date: string;
  } | null>(null);

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !attendeeName || !attendeeEmail) return;

    registerForEvent(selectedEventId, attendeeName, attendeeEmail);

    setTicketIssued({
      eventName: selectedEvent?.title || 'Global Humanitarian Summit',
      ticketId: `TKT-${Math.floor(100000 + Math.random() * 900000)}`,
      date: selectedEvent?.date || 'Upcoming'
    });

    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (err) {
      // ignore
    }
  };

  const closeRegistration = () => {
    setSelectedEventId(null);
    setTicketIssued(null);
    setAttendeeName('');
    setAttendeeEmail('');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 space-y-12">
      {/* Banner */}
      <div className="rounded-3xl bg-slate-900 p-8 sm:p-14 text-white shadow-xl text-center space-y-4">
        <span className="inline-block rounded-full bg-emerald-500/30 px-3.5 py-1 text-xs font-bold text-emerald-300 uppercase tracking-wider">
          Gatherings & Training
        </span>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
          Humanitarian Summits, Workshops & Webinars
        </h1>
        <p className="mx-auto max-w-2xl text-xs sm:text-sm text-slate-300 leading-relaxed">
          Join field experts, community leaders, and changemakers across interactive masterclasses and global assemblies.
        </p>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((evt) => (
          <div
            key={evt.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-xl transition flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
                  {evt.category}
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  {evt.isVirtual ? '🌐 Virtual Stream' : '📍 In-Person'}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 leading-snug">{evt.title}</h3>

              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                {evt.description}
              </p>

              <div className="space-y-2 rounded-2xl bg-slate-50 p-3.5 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{evt.date} • {evt.startTime} - {evt.endTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="truncate">{evt.location}</span>
                </div>
              </div>

              {evt.speakers && evt.speakers.length > 0 && (
                <div className="border-t border-slate-100 pt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Keynote Speakers
                  </span>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs">
                    {evt.speakers.map((sp, i) => (
                      <span key={i} className="font-medium text-slate-800">
                        {sp.name} <span className="text-slate-400 text-[10px]">({sp.role})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                <strong>{evt.registeredCount}</strong> of {evt.capacity} registered
              </span>
              <button
                onClick={() => setSelectedEventId(evt.id)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition flex items-center gap-1.5"
              >
                <Ticket className="h-3.5 w-3.5" />
                Register Free Pass
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Registration Modal with Digital Ticket */}
      {selectedEventId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <h3 className="font-bold text-slate-900 text-sm">Event Pass Registration</h3>
              <button onClick={closeRegistration} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            {ticketIssued ? (
              <div className="p-8 text-center space-y-6">
                <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-emerald-950 p-6 text-white text-left shadow-lg relative border border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                      Official Event Admission Pass
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 font-bold">
                      {ticketIssued.ticketId}
                    </span>
                  </div>
                  <h4 className="mt-3 text-lg font-black text-white">{ticketIssued.eventName}</h4>
                  <p className="text-xs text-emerald-200 mt-1">Attendee: {attendeeName}</p>
                  <p className="text-[11px] text-slate-400">Date: {ticketIssued.date}</p>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-700 pt-3">
                    <span className="text-[10px] text-slate-400">Scan at entrance scanner</span>
                    <div className="rounded-lg bg-white p-1 text-slate-900">
                      <QrCode className="h-8 w-8" />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-500">
                  A copy of your pass and calendar invite has been dispatched to <strong>{attendeeEmail}</strong>.
                </p>

                <button
                  onClick={closeRegistration}
                  className="rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    Selected Event
                  </span>
                  <h4 className="text-base font-bold text-slate-900">{selectedEvent?.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedEvent?.date} • {selectedEvent?.location}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. David Chen"
                    value={attendeeName}
                    onChange={(e) => setAttendeeName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Email Address (for instant pass) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. david@example.com"
                    value={attendeeEmail}
                    onChange={(e) => setAttendeeEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-xs font-bold text-white shadow-lg hover:bg-emerald-700 transition"
                >
                  <Ticket className="h-4 w-4" />
                  Confirm Registration & Get Digital Pass
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
