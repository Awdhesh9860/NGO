import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useDatabase } from '../../context/DatabaseContext';
import {
  Heart,
  ShieldCheck,
  ArrowRight,
  Droplets,
  GraduationCap,
  Users,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface HeroSectionProps {
  onOpenDonate: () => void;
  onNavigate: (view: string, id?: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenDonate, onNavigate }) => {
  const { t } = useLanguage();
  const { campaigns } = useDatabase();

  const activeCampaign = campaigns[0];

  return (
    <section className="relative overflow-hidden bg-slate-900 text-white pt-12 pb-20 lg:pt-20 lg:pb-28">
      {/* Background Graphic Accents */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Pitch */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/60 px-3.5 py-1.5 text-xs font-semibold text-emerald-300">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span>{t('hero.badge', 'Together for a Better Tomorrow')}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              {t(
                'hero.title',
                'Helping People. Changing Lives. Building a Better Future.'
              )}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
              {t(
                'hero.subtitle',
                'We work with communities to create better opportunities through education, skills, health, and social support.'
              )}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={onOpenDonate}
                className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-7 py-4 text-sm font-bold text-white shadow-xl shadow-emerald-600/30 hover:bg-emerald-400 transition cursor-pointer"
              >
                <Heart className="h-4 w-4 fill-white" />
                <span>{t('hero.ctaDonate', 'Donate Now')}</span>
              </button>
              <button
                onClick={() => onNavigate('volunteers')}
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/80 px-7 py-4 text-sm font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition cursor-pointer"
              >
                <Users className="h-4 w-4" />
                <span>{t('hero.ctaJoin', 'Join Us')}</span>
              </button>
            </div>

            {/* Trust Checklist */}
            <div className="pt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 88% Direct Field Program Spend
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Instant Digital Receipts
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Independent Annual Audit
              </span>
            </div>
          </div>

          {/* Right Live Campaign Feature Card */}
          <div className="lg:col-span-5">
            {activeCampaign && (
              <div className="relative rounded-3xl border border-slate-700/80 bg-slate-800/90 p-6 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 px-3 py-1 text-[11px] font-bold text-red-400 border border-red-500/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-ping" />
                    Priority Emergency Appeal
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {activeCampaign.donorCount.toLocaleString()} Donors
                  </span>
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl">
                  <img
                    src={activeCampaign.image}
                    alt={activeCampaign.title}
                    className="h-48 w-full object-cover transition hover:scale-105 duration-300"
                  />
                </div>

                <h3 className="mt-4 text-lg font-bold text-white leading-snug">
                  {activeCampaign.title}
                </h3>

                <p className="mt-1 text-xs text-slate-300 line-clamp-2">
                  {activeCampaign.description}
                </p>

                {/* Progress Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-emerald-400">
                      ${activeCampaign.raisedAmount.toLocaleString()} Raised
                    </span>
                    <span className="text-slate-400">
                      Goal: ${activeCampaign.targetAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                      style={{
                        width: `${Math.min(
                          100,
                          (activeCampaign.raisedAmount / activeCampaign.targetAmount) * 100
                        )}%`
                      }}
                    />
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  <button
                    onClick={onOpenDonate}
                    className="flex-1 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-white hover:bg-emerald-400 transition flex items-center justify-center gap-1.5"
                  >
                    <Heart className="h-3.5 w-3.5 fill-white" />
                    Support This Appeal
                  </button>
                  <button
                    onClick={() => onNavigate('campaign-detail', activeCampaign.id)}
                    className="rounded-xl border border-slate-600 bg-slate-700/60 px-4 py-3 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
                  >
                    Details
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
