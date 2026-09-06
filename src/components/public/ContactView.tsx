import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { useToast } from '../../context/ToastContext';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Heart,
  MessageCircle,
  Building,
  AlertCircle
} from 'lucide-react';

interface ContactViewProps {
  onNavigate: (view: string, id?: string) => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ onNavigate }) => {
  const { settings } = useDatabase();
  const { showToast } = useToast();

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [department, setDepartment] = useState<string>('General Inquiries');
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSent, setIsSent] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast('Please fill in your name, email, and message.', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
      showToast('Your message has been received. We will reply within 24–48 hours.', 'success');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. Hero */}
      <section className="bg-slate-900 text-white py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1 text-xs font-bold text-emerald-300">
            <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
            We Listen & Respond
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            We Are Here to Listen & Help
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Whether you want to support a project, join as a volunteer, discuss a CSR partnership, or visit our field center, our team is always ready to assist.
          </p>
        </div>
      </section>

      {/* 2. Key Contact Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-2 shadow-lg">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <MapPin className="h-5 w-5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Head Office</h3>
            <p className="text-xs font-semibold text-slate-800 leading-snug">
              {settings.headquartersAddress || '[Office Address, City, Country]'}
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-2 shadow-lg">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Phone className="h-5 w-5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Helpline / Phone</h3>
            <p className="text-xs font-semibold text-slate-800 leading-snug">
              {settings.primaryPhone || '[Phone Number]'}
            </p>
            <p className="text-[11px] text-slate-400">Mon &ndash; Sat, 9am &ndash; 6pm</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-2 shadow-lg">
            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Mail className="h-5 w-5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</h3>
            <p className="text-xs font-semibold text-slate-800 leading-snug">
              {settings.primaryEmail || '[Email Address]'}
            </p>
            <p className="text-[11px] text-slate-400">Fast replies within 24h</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-2 shadow-lg">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Working Hours</h3>
            <p className="text-xs font-semibold text-slate-800 leading-snug">
              Monday &ndash; Friday: 9:00 AM &ndash; 6:00 PM
            </p>
            <p className="text-[11px] text-slate-400">Saturday: 9:00 AM &ndash; 1:00 PM</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 3. Contact Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs">
            <div className="space-y-2 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Send a Note
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                Get in Touch With Our Team
              </h2>
              <p className="text-xs text-slate-500">
                Leave us a message, and a team member will reach back directly.
              </p>
            </div>

            {isSent ? (
              <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <div className="h-12 w-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Message Received!</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Thank you for writing to us. One of our community coordinators will respond to your email shortly.
                </p>
                <button
                  onClick={() => setIsSent(false)}
                  className="mt-2 text-xs font-bold text-emerald-800 underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 / Phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Which Department?
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-emerald-500 bg-white"
                    >
                      <option value="General Inquiries">General Inquiries</option>
                      <option value="Donation Desk">Donation Support & Tax Receipts</option>
                      <option value="Volunteer Coordinator">Volunteer Opportunities</option>
                      <option value="CSR & Partnerships">CSR & Company Partnerships</option>
                      <option value="Project Visits">Field Project Visits</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Subject (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="E.g., Volunteering for upcoming health camp"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Your Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="How can we assist you? Please write in simple English..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 text-xs font-bold transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>{isSubmitting ? 'Sending...' : 'Send Your Message'}</span>
                </button>
              </form>
            )}
          </div>

          {/* 4 & 7. Office Map, Direct Department Emails & Emergency Contact (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* 7. Direct Email Contacts */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
              <h3 className="text-base font-bold text-slate-900">
                Direct Department Contacts
              </h3>
              <div className="space-y-3 text-xs">
                <div className="border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-800 block">Donations & 80G Receipts:</span>
                  <span className="text-emerald-700 font-mono">donations@hopehorizon.org</span>
                </div>
                <div className="border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-800 block">Volunteer Desk:</span>
                  <span className="text-emerald-700 font-mono">volunteer@hopehorizon.org</span>
                </div>
                <div className="border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-800 block">CSR & Institutional Grants:</span>
                  <span className="text-emerald-700 font-mono">csr@hopehorizon.org</span>
                </div>
                <div>
                  <span className="font-bold text-slate-800 block">Field Project Coordination:</span>
                  <span className="text-emerald-700 font-mono">field@hopehorizon.org</span>
                </div>
              </div>
            </div>

            {/* 4. Office Map Placeholder */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-xs">
              <h3 className="text-base font-bold text-slate-900">
                Office & Visitor Center
              </h3>
              <div className="h-44 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-center p-4 space-y-2">
                <MapPin className="h-8 w-8 text-emerald-600 animate-bounce" />
                <span className="text-xs font-bold text-slate-800">
                  {settings.headquartersAddress || '[Office Address, City, Country]'}
                </span>
                <span className="text-[11px] text-slate-400">
                  Public visitors welcome Monday to Friday with prior notice.
                </span>
              </div>
            </div>

            {/* 6. Emergency Helpline */}
            <div className="bg-amber-50 rounded-3xl border border-amber-200 p-6 space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                <AlertCircle className="h-4 w-4" />
                <span>Disaster / Emergency Relief Helpline</span>
              </div>
              <p className="text-xs text-amber-900/80 leading-relaxed">
                For urgent humanitarian relief, flood relief kit coordination, or emergency community assistance, call our priority field coordinator helpline at <strong>{settings.primaryPhone || '[Phone Number]'}</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* 8. FAQ Snippet & CTA */}
        <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">
              Have a Quick Question?
            </h3>
            <p className="text-xs text-slate-500">
              Check our Frequently Asked Questions for fast answers regarding tax receipts, volunteering, and visiting our projects.
            </p>
          </div>
          <button
            onClick={() => onNavigate('faq')}
            className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 text-xs font-bold transition flex items-center gap-1.5 shrink-0"
          >
            <span>Visit FAQ Center</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </section>
      </div>
    </div>
  );
};
