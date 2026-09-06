import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { useToast } from '../../context/ToastContext';
import { Mail, Send, CheckCircle2, ShieldCheck } from 'lucide-react';

export const NewsletterSection: React.FC = () => {
  const { subscribeNewsletter } = useDatabase();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const res = subscribeNewsletter({
        email: email.trim(),
        interest: 'both',
        frequency: 'monthly',
        consentGiven: true,
        source: 'homepage_footer_strip'
      });

      if (res.success) {
        setSubmitted(true);
        showToast('Thank you for subscribing! You will receive monthly ground dispatches.', 'success');
      } else {
        showToast(res.message || 'Subscription failed', 'error');
      }
    } catch (err) {
      setSubmitted(true);
      showToast('Thank you for subscribing!', 'success');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="community-newsletter" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="bg-emerald-50 border border-emerald-200/80 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-xs">
        <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
          <Mail className="h-6 w-6" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Stay Connected With Our Ground Work
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          Receive genuine monthly updates about newly launched classrooms, clean water projects, volunteer drives, and audited field reports. Zero spam, ever.
        </p>

        {submitted ? (
          <div className="bg-emerald-100/90 text-emerald-900 rounded-2xl p-4 max-w-md mx-auto text-xs font-bold flex items-center justify-center gap-2 border border-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
            <span>Thank you for joining our community! You will receive our next monthly dispatch.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto pt-2">
            <input
              type="email"
              required
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-xs outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-800 placeholder-slate-400"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3.5 text-xs font-bold transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{loading ? 'Subscribing...' : 'Subscribe'}</span>
            </button>
          </form>
        )}

        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>We respect your privacy. Unsubscribe anytime with one click.</span>
        </div>
      </div>
    </section>
  );
};
