import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  Users,
  CheckCircle2,
  Award,
  Heart,
  Globe,
  Clock,
  Sparkles,
  Send,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const VolunteerView: React.FC = () => {
  const { addVolunteerApplication, programs } = useDatabase();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [availability, setAvailability] = useState('Weekends');
  const [preferredProgram, setPreferredProgram] = useState(programs[0]?.title || '');
  const [motivation, setMotivation] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    addVolunteerApplication({
      name: fullName,
      email,
      phone,
      location,
      skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      interests: [preferredProgram].filter(Boolean),
      availability,
      experience: motivation
    });

    setSubmitted(true);

    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 space-y-12">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-900 p-8 sm:p-14 text-white shadow-xl">
        <span className="inline-block rounded-full bg-emerald-500/30 px-3.5 py-1 text-xs font-bold text-emerald-200 uppercase tracking-wider">
          Grassroots Changemakers
        </span>
        <h1 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight">
          Lend Your Skills, Transform Real Lives
        </h1>
        <p className="mt-3 text-sm sm:text-base text-emerald-100 max-w-2xl leading-relaxed">
          Join a dedicated community of over 4,200 active volunteers deploying frontline education, solar water logistics, medical relief, and community organizing across 140+ villages.
        </p>
      </div>

      {/* Main Grid: Application Form + Benefits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Form */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-md">
          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Application Received!</h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-slate-900">{fullName}</strong>. Our Volunteer Coordination Team will review your profile and reach out within 48 hours for your orientation briefing.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
              >
                Submit Another Application
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900">Volunteer Registration Application</h3>
                <p className="text-xs text-slate-500">
                  Open to students, professionals, retirees, and passionate advocates.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maya Lin"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. maya@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    City & Country
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. San Francisco, USA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Preferred Program Focus
                  </label>
                  <select
                    value={preferredProgram}
                    onChange={(e) => setPreferredProgram(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none bg-white"
                  >
                    {programs.map((p) => (
                      <option key={p.id} value={p.title}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Availability
                  </label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="Weekends">Weekends (4-8 hrs/week)</option>
                    <option value="Full-time">Full-time (Field Deployments)</option>
                    <option value="Remote / Virtual">Remote / Virtual (Evenings)</option>
                    <option value="Emergency Relief">Emergency Rapid On-Call</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Skills & Expertise (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Teaching, Water Engineering, Medical/First Aid, Social Media, Coding"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Why do you want to volunteer with HopeHorizon?
                </label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe your motivation and any prior grassroots experience..."
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-xs font-bold text-white shadow-lg hover:bg-emerald-700 transition"
              >
                <Send className="h-4 w-4" />
                Submit Volunteer Application
              </button>
            </form>
          )}
        </div>

        {/* Right: Volunteer Benefits & Verification Note */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-slate-900">Why Volunteer With Us?</h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800 shrink-0">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Official Cryptographic Certificate</h4>
                  <p className="mt-0.5">
                    Receive verified service hour credentials with unique QR verification codes for LinkedIn and resumes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Structured Humanitarian Training</h4>
                  <p className="mt-0.5">
                    Access expert modules in community water governance, disaster protocols, and child protection standards.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-800 shrink-0">
                  <Globe className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Global Peer Network</h4>
                  <p className="mt-0.5">
                    Connect with fellow organizers, doctors, engineers, and educators across 22 countries.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900 p-6 text-white space-y-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Volunteer Spotlight
            </span>
            <p className="italic text-xs text-slate-300 leading-relaxed font-serif">
              "Deploying with HopeHorizon's clean water team in Rajasthan opened my eyes. We trained 45 women on solar maintenance. Seeing clean water flow into households for the first time was unforgettable."
            </p>
            <div className="flex items-center gap-3 pt-2">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Priya Patel"
                className="h-10 w-10 rounded-full object-cover border-2 border-emerald-400"
              />
              <div>
                <p className="text-xs font-bold text-white">Priya Patel</p>
                <p className="text-[10px] text-emerald-300">Volunteer Lead, 420+ Hours</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
