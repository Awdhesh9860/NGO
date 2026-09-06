import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useDatabase } from '../../context/DatabaseContext';
import {
  Heart,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Droplets,
  BookOpen,
  Calendar
} from 'lucide-react';

interface HeroSectionProps {
  onOpenDonate: (campaignId?: string, presetAmount?: number) => void;
  onNavigate: (view: string, id?: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenDonate, onNavigate }) => {
  const { t } = useLanguage();
  const { campaigns, settings } = useDatabase();
  const activeCampaign = campaigns[0];

  const [donationFrequency, setDonationFrequency] = useState<'monthly' | 'one-time'>('monthly');
  const [selectedAmount, setSelectedAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);

  const presetOptions = [
    { amount: 500, impact: 'Provides books, school bag & supplies for 1 child' },
    { amount: 1000, impact: 'Gives clean drinking water to 2 village families' },
    { amount: 2500, impact: 'Sponsors full doctor checkup & medicines for 5 kids' },
    { amount: 5000, impact: 'Funds sewing machine & tailoring training for a mother' }
  ];

  const handlePresetSelect = (amount: number) => {
    setSelectedAmount(amount);
    setIsCustom(false);
    setCustomAmount('');
  };

  const handleCustomChange = (val: string) => {
    setCustomAmount(val);
    setIsCustom(true);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setSelectedAmount(num);
    }
  };

  const handleDonateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = isCustom ? (parseFloat(customAmount) || 500) : selectedAmount;
    onOpenDonate(activeCampaign?.id, finalAmount);
  };

  return (
    <section id="homepage-hero" className="relative overflow-hidden bg-slate-900 text-white pt-8 pb-20 sm:pt-14 sm:pb-28 lg:pt-18 lg:pb-32">
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -left-28 h-80 w-80 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Human Pitch & Mission */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/70 px-4 py-1.5 text-xs font-semibold text-emerald-300 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>{t('hero.badge', 'Verified NGO • 100% Honest • Instant 80G Tax Exemption')}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
              Helping Children. <br className="hidden sm:block" />
              <span className="text-emerald-400">Feeding Families.</span> <br className="hidden sm:block" />
              Bringing Real Hope.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-2xl">
              We work directly on the ground to provide school books, daily nutritious meals, clean drinking water, and doctor care to families in need — 100% honest and with zero middlemen.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
              <button
                id="hero-primary-donate-btn"
                onClick={() => onOpenDonate()}
                className="flex items-center justify-center gap-2.5 rounded-2xl bg-emerald-500 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-emerald-600/30 hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
              >
                <Heart className="h-4 w-4 fill-white" />
                <span>{t('hero.ctaDonate', 'Donate Now (Save Tax)')}</span>
              </button>

              <button
                id="hero-secondary-explore-btn"
                onClick={() => onNavigate('programs')}
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/80 px-7 py-4 text-sm font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition cursor-pointer"
              >
                <span>{t('hero.ctaExplore', 'See How We Help')}</span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </button>
            </div>

            {/* Trust Badges Bar */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="font-medium">88% Spent Directly on Families</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="font-medium">100% Verified Work</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="font-medium">Instant 80G Tax Exemption Receipt</span>
              </div>
            </div>
          </div>

          {/* Right Column: Quick Giving & Live Impact Widget */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl border border-slate-700/80 bg-slate-800/90 p-6 sm:p-7 shadow-2xl backdrop-blur-xl">
              
              {/* Header with Monthly/One-time switch */}
              <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Help a Child Today</h3>
                  <p className="text-xs text-slate-400">Save 50% tax under 80G with instant receipt</p>
                </div>

                <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-700/80">
                  <button
                    type="button"
                    onClick={() => setDonationFrequency('monthly')}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                      donationFrequency === 'monthly'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setDonationFrequency('one-time')}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                      donationFrequency === 'one-time'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Give Once
                  </button>
                </div>
              </div>

              {/* Giving Amount Selector */}
              <form onSubmit={handleDonateSubmit} className="mt-5 space-y-4">
                <div className="grid grid-cols-2 gap-2.5">
                  {presetOptions.map((opt) => (
                    <button
                      key={opt.amount}
                      type="button"
                      onClick={() => handlePresetSelect(opt.amount)}
                      className={`rounded-2xl border p-3 text-left transition relative cursor-pointer ${
                        !isCustom && selectedAmount === opt.amount
                          ? 'border-emerald-500 bg-emerald-950/40 text-white shadow-sm'
                          : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <div className="text-base font-black text-white">
                        {settings.currencySymbol}{opt.amount}
                        {donationFrequency === 'monthly' && <span className="text-[10px] font-normal text-slate-400">/mo</span>}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight mt-1 line-clamp-2">
                        {opt.impact}
                      </p>
                    </button>
                  ))}
                </div>

                {/* Custom Amount Input */}
                <div className="flex items-center rounded-2xl border border-slate-700 bg-slate-900/60 px-3.5 py-2.5 focus-within:border-emerald-500">
                  <span className="text-xs font-bold text-slate-400 mr-2">{settings.currencySymbol}</span>
                  <input
                    type="number"
                    min="5"
                    step="1"
                    placeholder="Custom donation amount"
                    value={customAmount}
                    onChange={(e) => handleCustomChange(e.target.value)}
                    className="w-full bg-transparent text-xs text-white placeholder-slate-500 outline-none font-semibold"
                  />
                  <span className="text-[11px] text-slate-400 uppercase font-mono">{settings.currencyCode}</span>
                </div>

                {/* Dynamic Impact Statement */}
                <div className="rounded-xl bg-emerald-950/40 border border-emerald-900/60 p-3 text-xs text-emerald-200 flex items-center gap-2">
                  <Heart className="h-4 w-4 text-emerald-400 shrink-0 fill-emerald-500/20" />
                  <span>
                    Your {donationFrequency} gift of <strong className="text-white font-bold">{settings.currencySymbol}{isCustom ? (customAmount || '0') : selectedAmount}</strong> directly empowers families on the ground.
                  </span>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  id="hero-quick-donate-submit"
                  className="w-full rounded-2xl bg-emerald-500 py-3.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-400 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Heart className="h-4 w-4 fill-white" />
                  <span>Donate {settings.currencySymbol}{isCustom ? (customAmount || '0') : selectedAmount} {donationFrequency === 'monthly' ? 'Monthly' : 'Now'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>

              {/* Active Emergency Campaign Mini Banner if present */}
              {activeCampaign && (
                <div className="mt-4 pt-4 border-t border-slate-700/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                    <span className="text-slate-300 truncate">
                      Urgent Appeal: <strong className="text-white font-medium">{activeCampaign.title}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('campaign-detail', activeCampaign.id)}
                    className="text-emerald-400 hover:text-emerald-300 font-bold shrink-0 text-[11px]"
                  >
                    View &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
