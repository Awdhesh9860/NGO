import React from 'react';
import { ShieldCheck, ArrowRight, Award } from 'lucide-react';

interface BoardMembersGridProps {
  onNavigate?: (view: string, id?: string) => void;
}

export const BoardMembersGrid: React.FC<BoardMembersGridProps> = ({ onNavigate }) => {
  const trustees = [
    {
      name: 'Dr. Evelyn Vance',
      position: 'Managing Trustee & Chair',
      expertise: 'Non-Profit Governance & Child Welfare',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      bio: 'Provides strategic oversight and ethical stewardship, ensuring all programs adhere to community-first mandates.'
    },
    {
      name: 'Kavita Menon, FCA',
      position: 'Independent Audit Trustee',
      expertise: 'Financial Governance & Statutory Audits',
      photo: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=400&auto=format&fit=crop&q=80',
      bio: 'Independent chartered accountant ensuring rigorous compliance with non-profit laws, 80G tax exemptions, and open audits.'
    },
    {
      name: 'Prof. Ramesh Narayan',
      position: 'Community Advisory Trustee',
      expertise: 'Rural Sociology & Sustainable Water Systems',
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
      bio: 'Former university faculty advisor evaluating grassroots community co-management and long-term facility sustainability.'
    },
    {
      name: 'Anita Desai, Advocate',
      position: 'Legal & Safeguarding Trustee',
      expertise: 'Child Protection & Non-Profit Law',
      photo: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&auto=format&fit=crop&q=80',
      bio: 'Ensures strict enforcement of human dignity policies, zero-exploitation guidelines, and legal compliance.'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {trustees.map((t) => (
          <div
            key={t.name}
            className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-3.5 shadow-xs hover:border-emerald-300 hover:shadow-lg transition duration-200 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="h-44 rounded-2xl overflow-hidden bg-slate-100">
                <img src={t.photo} alt={t.name} className="h-full w-full object-cover" loading="lazy" />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{t.name}</h3>
                <p className="text-xs font-bold text-emerald-700 mt-0.5">{t.position}</p>
                <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Focus: {t.expertise}</p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {t.bio}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Independent Trustee</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
