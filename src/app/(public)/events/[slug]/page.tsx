'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useDatabase } from '@/context/DatabaseContext';
import { Calendar, MapPin, Clock, Users, ArrowLeft, CheckCircle2, Ticket } from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/common/JsonLd';

export default function EventDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { events, registerForEvent } = useDatabase();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');

  const event = events.find((e) => e.id === slug || e.title.toLowerCase().replace(/\s+/g, '-') === slug) || events[0];

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-800">Event Not Found</h1>
        <Link href="/events" className="inline-block mt-4 text-emerald-600 font-semibold hover:underline">
          &larr; Back to all events
        </Link>
      </div>
    );
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    registerForEvent(event.id, name, email);
    setTicketNumber(`TKT-${Math.floor(100000 + Math.random() * 900000)}`);
    setIsRegistered(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://hopehorizon.org' },
          { name: 'Events', url: 'https://hopehorizon.org/events' },
          { name: event.title, url: `https://hopehorizon.org/events/${slug}` },
        ]}
      />

      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-950 text-white py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All Community Events
          </Link>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {event.category || 'Humanitarian Assembly'}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">{event.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-200 pt-1">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-400" /> {event.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" /> {event.startTime} - {event.endTime}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" /> {event.location}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Event Overview & Agenda</h2>
            <p className="text-slate-700 text-sm leading-relaxed">{event.description}</p>

            <div className="border-t border-slate-100 pt-6 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">What to Expect</h3>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Direct briefing from ground project leads & beneficiaries
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Hands-on volunteer workshop and relief dispatch kit assembly
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Networking with philanthropic partners, CSR directors & changemakers
                </li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
            {!isRegistered ? (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-base">Reserve Your Pass</h3>
                  <p className="text-xs text-slate-500">Free admission with prior registration</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition"
                >
                  Confirm Free Pass
                </button>
              </form>
            ) : (
              <div className="text-center space-y-4 py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Ticket className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Pass Confirmed!</h3>
                <p className="text-xs text-slate-600">Your registration code is:</p>
                <div className="font-mono text-xl font-black text-emerald-700 bg-emerald-50 py-2 rounded-xl border border-emerald-200">
                  {ticketNumber}
                </div>
                <p className="text-[11px] text-slate-400">
                  A confirmation email with venue directions has been recorded.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
