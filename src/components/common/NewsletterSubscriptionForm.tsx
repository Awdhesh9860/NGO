import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  NewsletterInterest,
  NewsletterFrequency,
  NewsletterSubscriber
} from '../../types';
import {
  validateNewsletterForm,
  NewsletterSubscriptionFormValues
} from '../../validations/newsletter';
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Heart,
  Users,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Clock,
  User as UserIcon,
  Phone
} from 'lucide-react';

interface NewsletterSubscriptionFormProps {
  variant?: 'footer' | 'card' | 'compact';
  defaultInterest?: NewsletterInterest;
  onSuccess?: (subscriber: NewsletterSubscriber, isUpdate?: boolean) => void;
  onNavigate?: (view: string, id?: string) => void;
  className?: string;
}

export const NewsletterSubscriptionForm: React.FC<NewsletterSubscriptionFormProps> = ({
  variant = 'footer',
  defaultInterest = 'both',
  onSuccess,
  onNavigate,
  className = ''
}) => {
  const { subscribeNewsletter } = useDatabase();

  // Form states
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [interest, setInterest] = useState<NewsletterInterest>(defaultInterest);
  const [frequency, setFrequency] = useState<NewsletterFrequency>('monthly');
  const [consent, setConsent] = useState(true);

  // UI interaction states
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof NewsletterSubscriptionFormValues, string>>>({});
  const [successResult, setSuccessResult] = useState<{
    subscriber: NewsletterSubscriber;
    message: string;
    isUpdate?: boolean;
  } | null>(null);

  // Clear specific field error when user interacts
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value);
    if (errors.fullName) {
      setErrors((prev) => ({ ...prev, fullName: undefined }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: undefined }));
    }
  };

  const handleConsentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConsent(e.target.checked);
    if (errors.consent) {
      setErrors((prev) => ({ ...prev, consent: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formValues: NewsletterSubscriptionFormValues = {
      email,
      fullName: fullName.trim() || undefined,
      phone: phone.trim() || undefined,
      interest,
      frequency,
      consent,
      source: variant === 'footer' ? 'footer_lead_form' : `${variant}_form`
    };

    // Client-side validation using Zod schema
    const validation = validateNewsletterForm(formValues);

    if (!validation.success || !validation.data) {
      setErrors(validation.errors || {});
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Simulate realistic network latency for smooth UI feedback
      await new Promise((resolve) => setTimeout(resolve, 350));

      const result = subscribeNewsletter({
        email: validation.data.email,
        fullName: validation.data.fullName,
        phone: validation.data.phone,
        interest: validation.data.interest,
        frequency: validation.data.frequency,
        source: validation.data.source || 'footer',
        consentGiven: true,
        leadTags: [
          validation.data.interest === 'donor'
            ? 'Donor Prospect'
            : validation.data.interest === 'volunteer'
            ? 'Volunteer Prospect'
            : 'General Supporter Lead',
          `${validation.data.frequency.toUpperCase()}_DISPATCH`
        ]
      });

      if (result.success && result.subscriber) {
        setSuccessResult({
          subscriber: result.subscriber,
          message: result.message,
          isUpdate: result.isUpdate
        });
        if (onSuccess) {
          onSuccess(result.subscriber, result.isUpdate);
        }
      }
    } catch (err) {
      setErrors({
        email: 'An error occurred while saving your subscription. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccessResult(null);
    setEmail('');
    setFullName('');
    setPhone('');
    setErrors({});
    setShowAdvanced(false);
  };

  // SUCCESS STATE VIEW
  if (successResult) {
    const isDonor = successResult.subscriber.interest === 'donor' || successResult.subscriber.interest === 'both';
    const isVolunteer = successResult.subscriber.interest === 'volunteer' || successResult.subscriber.interest === 'both';

    return (
      <div
        id="newsletter-success-container"
        className={`rounded-2xl border border-emerald-500/40 bg-slate-900/90 p-5 sm:p-6 text-slate-200 shadow-xl backdrop-blur-sm ${className}`}
      >
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-base font-bold text-white">
                {successResult.isUpdate ? 'Subscription Updated!' : 'Welcome to the Movement!'}
              </h4>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                {successResult.subscriber.interest === 'donor'
                  ? 'Donor & Impact Lead'
                  : successResult.subscriber.interest === 'volunteer'
                  ? 'Volunteer Field Lead'
                  : 'All Dispatches'}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {successResult.message}
            </p>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-[11px] text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Dispatch Target:</span>
                <span className="font-mono text-emerald-300 font-semibold">{successResult.subscriber.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cadence:</span>
                <span className="capitalize text-slate-300">{successResult.subscriber.frequency} curated briefing</span>
              </div>
              {successResult.subscriber.fullName && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Subscriber Name:</span>
                  <span className="text-slate-300">{successResult.subscriber.fullName}</span>
                </div>
              )}
            </div>

            {/* Quick conversion CTA based on interest */}
            {onNavigate && (
              <div className="pt-2 flex flex-wrap gap-2">
                {isDonor && (
                  <button
                    type="button"
                    id="newsletter-success-donate-btn"
                    onClick={() => onNavigate('donor-register')}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition shadow-sm"
                  >
                    <Heart className="h-3.5 w-3.5 fill-white/30" />
                    Register as 80G Donor
                  </button>
                )}
                {isVolunteer && (
                  <button
                    type="button"
                    id="newsletter-success-volunteer-btn"
                    onClick={() => onNavigate('volunteer')}
                    className="flex items-center gap-1.5 rounded-lg border border-amber-500/50 bg-amber-950/30 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-900/40 transition"
                  >
                    <Users className="h-3.5 w-3.5" />
                    Complete Volunteer Profile
                  </button>
                )}
                <button
                  type="button"
                  id="newsletter-reset-btn"
                  onClick={handleReset}
                  className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-700 transition ml-auto"
                >
                  <RefreshCw className="h-3 w-3" />
                  Subscribe Another
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE FORM VIEW
  return (
    <div id="newsletter-form-wrapper" className={`w-full ${className}`}>
      <form
        id="newsletter-subscription-form"
        onSubmit={handleSubmit}
        noValidate
        className="space-y-3.5"
      >
        {/* Lead Interest Selector Tabs */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Select Your Focus Area <span className="text-emerald-400">*</span>
          </label>
          <div
            id="newsletter-interest-selector"
            className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800"
          >
            <button
              type="button"
              id="newsletter-interest-donor-btn"
              onClick={() => {
                setInterest('donor');
                if (errors.interest) setErrors((prev) => ({ ...prev, interest: undefined }));
              }}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 px-2 text-xs font-semibold transition ${
                interest === 'donor'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Heart className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Donor & 80G</span>
            </button>

            <button
              type="button"
              id="newsletter-interest-volunteer-btn"
              onClick={() => {
                setInterest('volunteer');
                if (errors.interest) setErrors((prev) => ({ ...prev, interest: undefined }));
              }}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 px-2 text-xs font-semibold transition ${
                interest === 'volunteer'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Users className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Volunteer</span>
            </button>

            <button
              type="button"
              id="newsletter-interest-both-btn"
              onClick={() => {
                setInterest('both');
                if (errors.interest) setErrors((prev) => ({ ...prev, interest: undefined }));
              }}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 px-2 text-xs font-semibold transition ${
                interest === 'both'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">All Updates</span>
            </button>
          </div>
          {errors.interest && (
            <p className="mt-1 text-[11px] text-rose-400 flex items-center gap-1">
              <AlertCircle className="h-3 w-3 shrink-0" /> {errors.interest}
            </p>
          )}
        </div>

        {/* Primary Email & Action Row */}
        <div className="space-y-1.5">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="newsletter-email-input"
                name="email"
                type="email"
                required
                autoComplete="email"
                aria-label="Email Address for Newsletter"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'newsletter-email-error' : undefined}
                placeholder="Enter your email (e.g. name@example.com)"
                value={email}
                onChange={handleEmailChange}
                disabled={isSubmitting}
                className={`w-full rounded-xl border bg-slate-900/90 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 transition focus:outline-none ${
                  errors.email
                    ? 'border-rose-500 focus:border-rose-400 ring-1 ring-rose-500/30'
                    : 'border-slate-700 hover:border-slate-600 focus:border-emerald-500'
                }`}
              />
            </div>

            <button
              id="newsletter-subscribe-btn"
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold text-white transition shadow-lg shrink-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                interest === 'donor'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30'
                  : interest === 'volunteer'
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/30'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Subscribing...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>
                    {interest === 'donor'
                      ? 'Join Donors'
                      : interest === 'volunteer'
                      ? 'Join Volunteers'
                      : 'Subscribe Now'}
                  </span>
                </>
              )}
            </button>
          </div>

          {errors.email && (
            <p id="newsletter-email-error" className="text-xs text-rose-400 flex items-center gap-1 pl-1">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.email}
            </p>
          )}
        </div>

        {/* Expandable Personalized Lead Preferences */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-2.5">
          <button
            type="button"
            id="newsletter-advanced-toggle-btn"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex w-full items-center justify-between text-[11px] font-medium text-slate-400 hover:text-slate-200 transition"
          >
            <span className="flex items-center gap-1.5">
              <UserIcon className="h-3.5 w-3.5 text-slate-500" />
              <span>{showAdvanced ? 'Hide details' : 'Personalize your lead profile & frequency (optional)'}</span>
            </span>
            {showAdvanced ? (
              <ChevronUp className="h-3.5 w-3.5 text-slate-500" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
            )}
          </button>

          {showAdvanced && (
            <div id="newsletter-advanced-fields" className="mt-3 space-y-3 pt-2 border-t border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Full Name */}
                <div>
                  <label htmlFor="newsletter-name-input" className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
                    Your Name (Optional)
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-500">
                      <UserIcon className="h-3.5 w-3.5" />
                    </div>
                    <input
                      id="newsletter-name-input"
                      name="fullName"
                      type="text"
                      placeholder="e.g. Maya Lin"
                      value={fullName}
                      onChange={handleNameChange}
                      disabled={isSubmitting}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900/80 pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-0.5 text-[10px] text-rose-400">{errors.fullName}</p>
                  )}
                </div>

                {/* Mobile / WhatsApp (helpful for volunteer mobilization or donor receipts) */}
                <div>
                  <label htmlFor="newsletter-phone-input" className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
                    Mobile / WhatsApp (Optional)
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-500">
                      <Phone className="h-3.5 w-3.5" />
                    </div>
                    <input
                      id="newsletter-phone-input"
                      name="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={handlePhoneChange}
                      disabled={isSubmitting}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900/80 pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-0.5 text-[10px] text-rose-400">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Frequency selection */}
              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-slate-500" /> Dispatch Frequency
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['monthly', 'quarterly', 'weekly'] as NewsletterFrequency[]).map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      id={`newsletter-freq-${freq}-btn`}
                      onClick={() => setFrequency(freq)}
                      className={`rounded-lg py-1 px-2 text-[11px] font-medium capitalize border transition ${
                        frequency === freq
                          ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 font-semibold'
                          : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Consent and Privacy Guarantee */}
        <div className="space-y-1">
          <label className="flex items-start gap-2 cursor-pointer text-[11px] text-slate-400 select-none">
            <input
              id="newsletter-consent-checkbox"
              name="consent"
              type="checkbox"
              checked={consent}
              onChange={handleConsentChange}
              disabled={isSubmitting}
              className="mt-0.5 h-3.5 w-3.5 rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-slate-950"
            />
            <span>
              I agree to receive vetted dispatch briefings and statutory reports. You can unsubscribe in 1-click anytime.
            </span>
          </label>
          {errors.consent && (
            <p className="text-[11px] text-rose-400 flex items-center gap-1 pl-5">
              <AlertCircle className="h-3 w-3 shrink-0" /> {errors.consent}
            </p>
          )}
        </div>

        {/* Assurance Badges */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Strict Zero-Spam Promise</span>
          </span>
          <span>•</span>
          <span>Deloitte-Audited Transparency</span>
          <span>•</span>
          <span>Encrypted Lead Processing</span>
        </div>
      </form>
    </div>
  );
};
