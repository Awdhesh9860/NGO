import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import { CertificateViewModal } from '../common/CertificateViewModal';
import { Certificate } from '../../types';
import {
  Users,
  Clock,
  Award,
  Calendar,
  CheckCircle2,
  MapPin,
  FileCheck,
  Send,
  Sparkles,
  BookOpen,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const VolunteerPortal: React.FC = () => {
  const { certificates, events, addAuditLog } = useDatabase();
  const { currentUser } = useAuth();

  const [loggedHours, setLoggedHours] = useState(142);
  const [sessionHours, setSessionHours] = useState('4');
  const [activityDescription, setActivityDescription] = useState('');
  const [selectedActivityDate, setSelectedActivityDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [hoursSubmitted, setHoursSubmitted] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  // Filter certs belonging to this volunteer or sample volunteer certs
  const myCertificates = certificates.filter(
    (c) =>
      c.recipientEmail.toLowerCase() === currentUser?.email.toLowerCase() ||
      c.recipientName.toLowerCase().includes('maya') ||
      c.recipientName.toLowerCase().includes('priya') ||
      c.type === 'VOLUNTEER'
  );

  const handleLogHours = (e: React.FormEvent) => {
    e.preventDefault();
    const hrs = parseFloat(sessionHours) || 0;
    if (hrs <= 0) return;

    setLoggedHours((prev) => prev + hrs);
    setHoursSubmitted(true);

    addAuditLog({
      userId: currentUser?.id || 'vol-1',
      userName: currentUser?.name || 'Volunteer Member',
      action: 'VOLUNTEER_HOURS_LOGGED',
      entityType: 'VolunteerRecord',
      entityId: `vol_hr_${Date.now()}`,
      details: `Logged ${hrs} volunteer service hours: "${activityDescription || 'Field support'}" on ${selectedActivityDate}`
    });

    try {
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
    } catch (err) {
      // ignore
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Profile Card */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-900 p-6 sm:p-10 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-white text-2xl font-bold backdrop-blur-xs">
              {currentUser?.name?.charAt(0) || 'V'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-400/20 px-3 py-0.5 text-[10px] font-bold text-emerald-200 uppercase tracking-wider border border-emerald-400/40">
                  Verified Grassroots Volunteer
                </span>
                <span className="text-xs text-emerald-200">ID: HH-VOL-8821</span>
              </div>
              <h1 className="mt-1 text-2xl sm:text-3xl font-black">{currentUser?.name || 'Maya Lin'}</h1>
              <p className="text-xs text-emerald-100">{currentUser?.email || 'maya.lin@volunteer.org'}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-xs text-center min-w-28">
              <span className="text-[10px] uppercase font-bold text-emerald-200 block">Total Hours</span>
              <span className="text-2xl font-black text-white">{loggedHours} hrs</span>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-xs text-center min-w-28">
              <span className="text-[10px] uppercase font-bold text-emerald-200 block">Deployments</span>
              <span className="text-2xl font-black text-white">8 Camps</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Log Hours + Upcoming Camps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Log Hours Form */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Log Field Service Hours</h3>
              <p className="text-xs text-slate-500">
                Submitted hours are authenticated and tallied for official certificate issuance.
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Clock className="h-5 w-5" />
            </div>
          </div>

          {hoursSubmitted ? (
            <div className="rounded-2xl bg-emerald-50 p-6 text-center space-y-3">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
              <h4 className="font-bold text-emerald-950 text-base">Hours Successfully Recorded!</h4>
              <p className="text-xs text-emerald-800">
                Your total has updated to <strong>{loggedHours} hours</strong>. Our volunteer supervisor will verify this entry on the next field audit cycle.
              </p>
              <button
                onClick={() => {
                  setHoursSubmitted(false);
                  setActivityDescription('');
                }}
                className="rounded-xl bg-emerald-700 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-800"
              >
                Log Another Session
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogHours} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hours Served *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="24"
                    required
                    value={sessionHours}
                    onChange={(e) => setSessionHours(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date of Activity *</label>
                  <input
                    type="date"
                    required
                    value={selectedActivityDate}
                    onChange={(e) => setSelectedActivityDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Activity Details & Village / Initiative
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Conducted STEM robotics session with 40 girls at Model Secondary School, Jodhpur."
                  value={activityDescription}
                  onChange={(e) => setActivityDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-700 shadow-md"
              >
                <Send className="h-4 w-4" />
                Submit Service Entry for Audit
              </button>
            </form>
          )}
        </div>

        {/* Right: Upcoming Field Deployments */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">Upcoming Field Deployments</h4>
            <div className="space-y-3">
              {events.slice(0, 2).map((ev) => (
                <div key={ev.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{ev.title}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Enrolled
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>{ev.date} • {ev.startTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{ev.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900 p-6 text-white space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <BookOpen className="h-4 w-4" /> Volunteer Field Manual
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Review standard child safeguarding rules, solar pump maintenance checklists, and emergency medical protocols before arriving at the deployment site.
            </p>
          </div>
        </div>
      </div>

      {/* My Verified Certificates Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">My Verifiable Credentials & Awards</h3>
            <p className="text-xs text-slate-500">
              Each certificate is authenticated on our public ledger with an immutable verification code.
            </p>
          </div>
          <Award className="h-6 w-6 text-amber-600" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myCertificates.map((cert) => (
            <div
              key={cert.id}
              className="rounded-2xl border-2 border-amber-200 bg-amber-50/40 p-5 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px] font-bold text-amber-900 bg-white px-2 py-0.5 rounded border border-amber-200">
                    {cert.certificateNumber}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                    <ShieldCheck className="h-3.5 w-3.5" /> Authenticated
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{cert.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{cert.description}</p>
              </div>

              <div className="pt-2 border-t border-amber-200 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">Issued: {cert.issueDate}</span>
                <button
                  onClick={() => setSelectedCert(cert)}
                  className="flex items-center gap-1 rounded-lg bg-amber-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-800 transition"
                >
                  <FileCheck className="h-3.5 w-3.5" /> View & Print Certificate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View Certificate Modal */}
      {selectedCert && (
        <CertificateViewModal certificate={selectedCert} onClose={() => setSelectedCert(null)} />
      )}
    </div>
  );
};
