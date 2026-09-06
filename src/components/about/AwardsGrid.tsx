import React from 'react';
import { Award, ShieldCheck, CheckCircle2, FileText, ArrowRight } from 'lucide-react';

interface AwardsGridProps {
  onNavigate?: (view: string, id?: string) => void;
  showAll?: boolean;
}

export const AwardsGrid: React.FC<AwardsGridProps> = ({ onNavigate, showAll = false }) => {
  const verifiedRecognitions = [
    {
      title: 'Statutory 80G Tax Exemption Certificate',
      issuer: 'Department of Income Tax (Charities Directorate)',
      year: 'Permanent Status',
      category: 'Statutory Certification',
      desc: 'Formally recognized as a compliant charitable trust entitled to issue 100% tax exemption receipts to individual and corporate donors.'
    },
    {
      title: 'National NGO Darpan Empanelment',
      issuer: 'NITI Aayog, Government of India',
      year: 'Verified Registration',
      category: 'Government Empanelment',
      desc: 'Officially empanelled with verified transparent governance documentation and certified tracking credentials.'
    },
    {
      title: 'Unqualified Independent Financial Audit',
      issuer: 'Certified Independent Chartered Accountants',
      year: 'Annual FY 2025-26',
      category: 'Financial Accountability',
      desc: 'Received a clean audit opinion confirming full statutory transparency, zero leakage, and 88% direct program allocation.'
    },
    {
      title: 'Community Leadership Citation',
      issuer: 'District Rural Development Council',
      year: '2024',
      category: 'Ground Recognition',
      desc: 'Commended for successfully installing 18 community solar clean drinking water facilities managed sustainably by village councils.'
    }
  ];

  const displayList = showAll ? verifiedRecognitions : verifiedRecognitions.slice(0, 3);

  return (
    <section id="awards-recognition" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            Integrity & Credentials
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-2 tracking-tight">
            Awards & Recognition
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official government registrations, independent audits, and community citations.
          </p>
        </div>

        {!showAll && onNavigate && (
          <button
            onClick={() => onNavigate('about-awards')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
          >
            <span>View All Recognitions</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayList.map((item) => (
          <div
            key={item.title}
            className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-3.5 shadow-xs hover:border-emerald-300 hover:shadow-lg transition duration-200 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Award className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                  {item.category}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">{item.title}</h3>
                <p className="text-xs font-semibold text-emerald-700 mt-0.5">{item.issuer}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Period: {item.year}</p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {item.desc}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Verified Statutory Credential</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
