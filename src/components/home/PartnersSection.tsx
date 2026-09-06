import React from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { CSRPartner } from '../../types';
import { Building2, ArrowRight } from 'lucide-react';

interface PartnersSectionProps {
  onNavigate: (view: string, id?: string) => void;
}

export const PartnersSection: React.FC<PartnersSectionProps> = ({ onNavigate }) => {
  const { partners } = useDatabase();

  return (
    <section id="supportive-partners" className="bg-slate-50/80 py-14 border-y border-slate-200/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-white px-3 py-1 rounded-full border border-slate-200/60 inline-block">
          Institutional Alliances
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Our Supportive Partners & Collaborators
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
          Working alongside community councils, educational institutions, and responsible organizations to scale impact.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-2">
          {partners && partners.length > 0 ? (
            partners.slice(0, 4).map((p: CSRPartner) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col items-center justify-center space-y-2 shadow-xs hover:border-emerald-300 transition"
              >
                <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100">
                  {p.logo ? (
                    <img src={p.logo} alt={p.companyName} className="h-8 w-8 object-contain" />
                  ) : (
                    <Building2 className="h-6 w-6 text-slate-400" />
                  )}
                </div>
                <span className="text-xs font-bold text-slate-800 text-center line-clamp-1">{p.companyName}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">{p.tier} Partner</span>
              </div>
            ))
          ) : (
            [1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col items-center justify-center space-y-2 shadow-xs"
              >
                <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center font-mono text-xs font-bold text-slate-400">
                  [Partner]
                </div>
                <span className="text-xs font-bold text-slate-800">[Partner Organization {item}]</span>
              </div>
            ))
          )}
        </div>

        <div className="pt-2">
          <button
            onClick={() => onNavigate('partners')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 cursor-pointer"
          >
            <span>View All Partners & Collaborations</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
