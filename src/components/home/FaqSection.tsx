import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, ArrowRight } from 'lucide-react';

interface FaqSectionProps {
  onNavigate: (view: string, id?: string) => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ onNavigate }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const homeFaqs = [
    {
      q: 'How do you choose which villages and children to help?',
      a: 'Our volunteers visit areas in person, check where children cannot afford school or where drinking water is dirty, and talk with mothers and elders before starting any work.'
    },
    {
      q: 'How can I donate, and will I get an 80G tax receipt?',
      a: 'You can donate safely using UPI (GPay, PhonePe, Paytm), QR Code, Debit/Credit Card, or Net Banking. You instantly receive your official 80G tax exemption receipt on WhatsApp and Email right after donating.'
    },
    {
      q: 'How much of my donation actually reaches children and families?',
      a: '88% of every rupee goes directly into school books, meals, medicines, and clean water. 7% supports our ground team coordination, and 5% covers essential office work. You can check our public audit papers anytime.'
    },
    {
      q: 'Can I volunteer if I only have 2 hours on weekends?',
      a: 'Yes, of course! You can join our weekend teaching classes, help in health camps, plant trees, or even mentor students online from home.'
    },
    {
      q: 'Can our company partner with your NGO under CSR?',
      a: 'Yes! We are officially registered for CSR. We provide 80G tax exemption certificates, monthly video progress updates, and audited utilization reports.'
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
