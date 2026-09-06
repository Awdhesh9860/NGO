import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, ArrowRight } from 'lucide-react';

interface FaqSectionProps {
  onNavigate: (view: string, id?: string) => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ onNavigate }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const homeFaqs = [
    {
      q: 'How does the NGO choose which communities to help?',
      a: 'We conduct rigorous ground baseline surveys evaluating access to clean water, school dropout rates, and local family income levels. We only initiate programs where local village leaders and mothers’ committees invite us and actively agree to co-manage the initiatives.'
    },
    {
      q: 'How can I make a donation, and will I receive a tax receipt?',
      a: 'You can securely donate online using UPI, Credit/Debit cards, Net Banking, or Direct Bank Transfer. Immediately upon donation, an official tax exemption certificate (80G / 501(c)(3) compliant) is automatically generated and sent to your email.'
    },
    {
      q: 'How much of my donation directly reaches the field?',
      a: '88% of every dollar goes directly into field programs and community resources. 7% is allocated for essential on-ground quality inspections and logistics, and 5% covers mandatory statutory filings and administration. We publish certified annual audit sheets proving this.'
    },
    {
      q: 'Can I volunteer if I only have a few hours on weekends?',
      a: 'Yes, absolutely! We have dedicated weekend teaching circles, rural medical camp logistics, community tree planting days, and remote digital mentorship options for busy students and working professionals.'
    },
    {
      q: 'Can our company partner with your NGO for Corporate Social Responsibility (CSR)?',
      a: 'Yes, we are fully certified for statutory CSR execution. We provide customized MoUs, dedicated project managers, monthly video milestones, and quarterly third-party audited financial utilization certificates.'
    }
  ];

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq-section" className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
          Got Questions?
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Straightforward answers to the questions our donors, volunteers, and partners ask most often.
        </p>
      </div>

      <div className="space-y-3">
        {homeFaqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs transition"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/60 transition"
              >
                <span className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                  {faq.q}
                </span>
                <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs text-slate-600 border-t border-slate-100 leading-relaxed bg-slate-50/40 font-normal">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center pt-2">
        <button
          onClick={() => onNavigate('faq')}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1.5 cursor-pointer"
        >
          <span>Have more specific questions? Visit our complete FAQ Knowledge Center</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
};
