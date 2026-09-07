import React from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { Heart, Sparkles, Clock, Users, ArrowRight, ShieldCheck, Share2 } from 'lucide-react';

interface CampaignsViewProps {
  onOpenDonate: (campaignId?: string) => void;
  onNavigate: (view: string, id?: string) => void;
}

export const CampaignsView: React.FC<CampaignsViewProps> = ({ onOpenDonate, onNavigate }) => {
  const { campaigns } = useDatabase();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 space-y-10">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-900 p-8 sm:p-12 text-white shadow-xl">
        <span className="inline-block rounded-full bg-emerald-500/30 px-3.5 py-1 text-xs font-bold text-emerald-200 uppercase tracking-wider">
          Active Crowdfunding & Emergency Appeals
        </span>
        <h1 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight">
          Every Dollar Matched & 100% Tax Deductible
        </h1>
        <p className="mt-3 text-sm sm:text-base text-emerald-100 max-w-2xl leading-relaxed">
          Support targeted campaigns for immediate crisis relief, emergency medical camps, and educational scholarships with full 80G tax benefits.
        </p>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {campaigns.map((camp) => (
          <div
            key={camp.id}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs hover:shadow-xl transition flex flex-col justify-between"
          >
            <div>
              <div className="relative h-56 overflow-hidden">
                <img
                  src={camp.image}
                  alt={camp.title}
                  className="h-full w-full object-cover transition duration-300 hover:scale-105"
                />
                {camp.isUrgent && (
                  <span className="absolute top-3 left-3 rounded-full bg-red-600 px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider shadow-md">
                    Urgent Appeal
                  </span>
                )}
                <span className="absolute top-3 right-3 rounded-full bg-slate-900/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                  {camp.category}
                </span>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="text-lg font-bold text-slate-900 leading-snug">{camp.title}</h3>

                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                  {camp.description}
                </p>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-emerald-700">${camp.raisedAmount.toLocaleString('en-US')} Raised</span>
                    <span className="text-slate-500">${camp.targetAmount.toLocaleString('en-US')} Goal</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                      style={{
                        width: `${Math.min(100, (camp.raisedAmount / camp.targetAmount) * 100)}%`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                    <span>{camp.donorCount.toLocaleString('en-US')} Generous Donors</span>
                    <span>{((camp.raisedAmount / camp.targetAmount) * 100).toFixed(0)}% Funded</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 p-4 bg-slate-50/70 flex gap-2">
              <button
                onClick={() => onOpenDonate(camp.id)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
              >
                <Heart className="h-3.5 w-3.5 fill-white" />
                Donate Now
              </button>
              <button
                onClick={() => onNavigate('campaign-detail', camp.id)}
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                View Updates ({camp.updates?.length || 0})
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
