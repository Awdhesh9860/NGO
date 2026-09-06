import React from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { Heart, ArrowRight, Clock, Users, ShieldAlert } from 'lucide-react';

interface UrgentCampaignSectionProps {
  onOpenDonate: (campaignId?: string) => void;
  onNavigate: (view: string, id?: string) => void;
}

export const UrgentCampaignSection: React.FC<UrgentCampaignSectionProps> = ({
  onOpenDonate,
  onNavigate
}) => {
  const { campaigns, settings } = useDatabase();
  const activeCampaign = campaigns[0];

  if (!activeCampaign) return null;

  const percentRaised = Math.min(
    100,
    Math.round((activeCampaign.raisedAmount / activeCampaign.targetAmount) * 100)
  );

  return (
    <section id="urgent-campaign" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200/90 bg-white overflow-hidden shadow-lg grid grid-cols-1 lg:grid-cols-12 items-center">
        
        {/* Campaign Photo */}
        <div className="lg:col-span-6 h-72 sm:h-96 lg:h-full overflow-hidden bg-slate-100 relative">
          <img
            src={activeCampaign.image}
            alt={activeCampaign.title}
            className="h-full w-full object-cover transition hover:scale-105 duration-500"
            loading="lazy"
          />
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600/90 backdrop-blur-md text-white px-3.5 py-1 text-xs font-bold uppercase tracking-wider shadow-sm">
              <span className="h-2 w-2 rounded-full bg-white animate-ping" />
              Priority Urgent Appeal
            </span>
          </div>
        </div>

        {/* Campaign Pitch & Action */}
        <div className="lg:col-span-6 p-8 sm:p-12 space-y-5 text-left">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              Category: {activeCampaign.category}
            </span>
            <span className="font-mono flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              {activeCampaign.donorCount.toLocaleString()} Kind Donors
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug tracking-tight">
            {activeCampaign.title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {activeCampaign.description}
          </p>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-emerald-700">
                {settings.currencySymbol}{activeCampaign.raisedAmount.toLocaleString()} Raised ({percentRaised}%)
              </span>
              <span className="text-slate-500">
                Target: {settings.currencySymbol}{activeCampaign.targetAmount.toLocaleString()}
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                style={{ width: `${percentRaised}%` }}
              />
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onOpenDonate(activeCampaign.id)}
              className="rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white px-7 py-3.5 text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              <Heart className="h-4 w-4 fill-white" />
              <span>Support This Appeal</span>
            </button>
            <button
              onClick={() => onNavigate('campaign-detail', activeCampaign.id)}
              className="rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 px-5 py-3.5 text-xs font-bold transition cursor-pointer"
            >
              Read Full Appeal
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
