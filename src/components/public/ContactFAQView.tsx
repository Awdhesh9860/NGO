import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  Clock,
  ShieldCheck
} from 'lucide-react';

export const ContactFAQView: React.FC = () => {
  const { settings } = useDatabase();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('DONATIONS');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Are donations to HopeHorizon eligible for 80G tax deductions?',
      a: 'Yes. All donations made by Indian taxpayers are eligible for a 50% deduction under Section 80G of the Income Tax Act. US donors receive 501(c)(3) tax deductions. Instant digital Form 10BE receipts with statutory QR codes are issued upon payment.'
    },
    {
      q: 'How can I verify the authenticity of a volunteer or donor certificate?',
      a: 'You can visit our public Certificate Verification Portal (accessible in the navigation bar) and enter the Certificate Number or verification hash. Our cryptographic database instantly confirms the recipient, issue date, and authorized signatory.'
    },
    {
      q: 'What percentage of my donation directly reaches field beneficiaries?',
      a: 'In FY 2024-25, 88.4% of all disbursed funds went directly into frontline program execution, equipment, and medical supplies. Operational overhead, audits, and compliance account for only 11.6%, independently audited by Deloitte.'
    },
    {
      q: 'How does corporate CSR partnership work?',
      a: 'We work with companies to design customized CSR programs compliant with Section 135 of the Companies Act and MCA CSR-1 guidelines. We provide quarterly milestone audit reports, employee volunteering days, and board-level ESG dashboards.'
    },
    {
      q: 'Can I volunteer remotely if I cannot travel to field locations?',
      a: 'Absolutely. We have over 1,200 active virtual volunteers contributing in translation, digital pedagogy curriculum development, grant writing, web engineering, and social impact storytelling.'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && message) {
      setSent(true);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 space-y-16">
      {/* Banner */}
      <div className="rounded-3xl bg-slate-900 p-8 sm:p-14 text-white shadow-xl text-center space-y-4">
        <span className="inline-block rounded-full bg-emerald-500/30 px-3.5 py-1 text-xs font-bold text-emerald-300 uppercase tracking-wider">
          Connect & Inquire
        </span>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
          We Are Here to Help & Collaborate
        </h1>
        <p className="mx-auto max-w-2xl text-xs sm:text-sm text-slate-300 leading-relaxed">
          Reach our donor care team, compliance office, or grassroots field directorates.
        </p>
      </div>

      {/* Contact Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Form */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-md">
          {sent ? (
            <div className="text-center py-10 space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Message Dispatched!</h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-slate-900">{name}</strong>. Our designated {department.toLowerCase()} desk will respond within 24 business hours.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-4 rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Send an Official Message</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="email@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Designated Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 outline-none bg-white"
                >
                  <option value="DONATIONS">Donor Care & 80G Tax Receipts</option>
                  <option value="VOLUNTEERS">Volunteer Coordination Desk</option>
                  <option value="CSR">Corporate CSR & Institutional Grants</option>
                  <option value="MEDIA">Press, Media & Communications</option>
                  <option value="LEGAL">Audit, FCRA & Legal Compliance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Message Details *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can we assist you?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-xs font-bold text-white shadow-lg hover:bg-emerald-700 transition"
              >
                <Send className="h-4 w-4" />
                Dispatch Message
              </button>
            </form>
          )}
        </div>

        {/* Coordinates */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Headquarters Office
            </h4>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{settings.headquartersAddress}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-emerald-600 shrink-0" />
                <span>{settings.primaryPhone} (Mon-Sat, 9AM - 6PM IST)</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-emerald-600 shrink-0" />
                <span className="font-mono">{settings.primaryEmail}</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900 p-6 text-white space-y-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <Clock className="h-4 w-4" /> Emergency Relief Hotline (24/7)
            </span>
            <p className="text-sm font-mono font-bold text-white">+1 (800) 467-3467</p>
            <p className="text-[11px] text-slate-400">
              Strictly for active flood rescue, cyclone alert, and disaster ground deployments.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-6 pt-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Clear Answers
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left font-bold text-xs sm:text-sm text-slate-900 hover:bg-slate-50 transition"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform ${
                    expandedFaq === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedFaq === idx && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-4 text-xs text-slate-600 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
