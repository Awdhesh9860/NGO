import React, { useState } from 'react';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Phone,
  Mail,
  ArrowRight,
  Sparkles,
  X
} from 'lucide-react';

interface FAQItem {
  id: string;
  category:
    | 'about'
    | 'donations'
    | 'volunteers'
    | 'projects'
    | 'programs'
    | 'events'
    | 'membership'
    | 'csr'
    | 'documents'
    | 'privacy';
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  // About
  {
    id: 'f-about-1',
    category: 'about',
    question: 'What does this NGO do?',
    answer:
      'We work directly with grassroots communities to provide quality primary education, clean drinking water, basic health services, and vocational skills training for young people and women.'
  },
  {
    id: 'f-about-2',
    category: 'about',
    question: 'How long has the NGO been working?',
    answer:
      'Our team has been actively working on the ground for over [15+ Years], partnering with village councils and local youth volunteers.'
  },
  {
    id: 'f-about-3',
    category: 'about',
    question: 'Where is the NGO located and where do you work?',
    answer:
      'Our main office is at [Office Address, City, Country]. Our field projects operate across [50+ Communities] in rural and underserved semi-urban areas.'
  },

  // Donations
  {
    id: 'f-don-1',
    category: 'donations',
    question: 'How can I make a donation?',
    answer:
      'You can donate directly through our website using debit/credit cards, UPI / QR, net banking, or direct bank transfer. All transactions are securely encrypted with 256-bit SSL.'
  },
  {
    id: 'f-don-2',
    category: 'donations',
    question: 'Where does my donated money go?',
    answer:
      '88% of every contribution goes directly to field programs (books, water filters, medicines, trainer stipends). 7% covers on-site monitoring and verification, and 5% supports basic administrative compliance.'
  },
  {
    id: 'f-don-3',
    category: 'donations',
    question: 'Will I receive a tax exemption receipt?',
    answer:
      'Yes. Digital receipts are issued immediately after donation completion, with eligible tax exemption details under [Tax Exemption / 80G / 501(c)(3) where applicable].'
  },
  {
    id: 'f-don-4',
    category: 'donations',
    question: 'Can I donate anonymously?',
    answer:
      'Yes. When donating, check the "Make this donation anonymous" box, and your name will never appear in any public reports or donor lists.'
  },

  // Volunteers
  {
    id: 'f-vol-1',
    category: 'volunteers',
    question: 'Who can become a volunteer?',
    answer:
      'Anyone who cares about helping others! Students, working professionals, homemakers, and retirees are all welcome. No prior experience is required.'
  },
  {
    id: 'f-vol-2',
    category: 'volunteers',
    question: 'How much time do I need to commit as a volunteer?',
    answer:
      'You can volunteer as little as 2 to 4 hours on weekends, join a one-day medical camp, or dedicate multiple days a week depending on your schedule.'
  },
  {
    id: 'f-vol-3',
    category: 'volunteers',
    question: 'Do volunteers receive a certificate?',
    answer:
      'Yes. After completing your volunteer commitment or event, we provide an official digital certificate of appreciation acknowledging your service hours.'
  },

  // Projects & Programs
  {
    id: 'f-proj-1',
    category: 'projects',
    question: 'Can I visit a project site in person?',
    answer:
      'Yes, supporters and donors are welcome to visit our ongoing field projects. Please contact our community team at least 7 days in advance so our field coordinator can guide you respectfully.'
  },
  {
    id: 'f-proj-2',
    category: 'projects',
    question: 'Can I fund a specific project directly?',
    answer:
      'Yes. You can choose a specific project (such as a school computer lab or clean water unit) on our Donate page or contact our team for dedicated project funding.'
  },
  {
    id: 'f-prog-1',
    category: 'programs',
    question: 'How are program beneficiaries selected?',
    answer:
      'We work closely with local village committees and teachers to identify families and children with the greatest financial or social need, without any discrimination.'
  },

  // Events
  {
    id: 'f-eve-1',
    category: 'events',
    question: 'Are community events free to attend?',
    answer:
      'Yes! All our health camps, awareness workshops, and community meetings are completely free and open to everyone in the neighborhood.'
  },

  // Membership
  {
    id: 'f-mem-1',
    category: 'membership',
    question: 'What is NGO membership?',
    answer:
      'Membership is for dedicated supporters who want to stay closely connected to our mission, attend annual general meetings, receive printed quarterly newsletters, and receive a digital member identity card.'
  },

  // CSR
  {
    id: 'f-csr-1',
    category: 'csr',
    question: 'Can companies partner with this NGO for CSR?',
    answer:
      'Yes. We work with corporate partners to execute eligible CSR programs with full statutory compliance, audited budget utilization, and detailed impact metrics.'
  },

  // Documents & Transparency
  {
    id: 'f-doc-1',
    category: 'documents',
    question: 'Where can I see your financial audit reports?',
    answer:
      'All our annual reports, independent audit statements, and official registration certificates are publicly accessible on our Transparency and Documents page.'
  },

  // Privacy
  {
    id: 'f-priv-1',
    category: 'privacy',
    question: 'Do you sell or share my donor or volunteer contact information?',
    answer:
      'Never. We do not sell, rent, or trade personal donor or volunteer information to any third party under any circumstances.'
  }
];

interface FAQViewProps {
  onNavigate: (view: string, id?: string) => void;
}

export const FAQView: React.FC<FAQViewProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openItems, setOpenItems] = useState<{ [id: string]: boolean }>({
    'f-about-1': true,
    'f-don-1': true
  });

  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'about', label: 'About NGO' },
    { id: 'donations', label: 'Donations & Receipts' },
    { id: 'volunteers', label: 'Volunteers' },
    { id: 'projects', label: 'Projects & Programs' },
    { id: 'membership', label: 'Membership' },
    { id: 'csr', label: 'CSR Partnerships' },
    { id: 'documents', label: 'Documents & Audits' },
    { id: 'privacy', label: 'Privacy & Security' }
  ];

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. Hero */}
      <section className="bg-slate-900 text-white py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1 text-xs font-bold text-emerald-300">
            <HelpCircle className="h-3.5 w-3.5 text-emerald-400" />
            Clear & Honest Answers
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Frequently Asked Questions
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Find simple answers to common questions about our programs, donations, volunteer work, and financial transparency.
          </p>
        </div>
      </section>

      {/* 2. Search & Filter Bar */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xl space-y-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by keyword (e.g. tax receipt, volunteer hours, visit project)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 pl-11 pr-4 py-3 text-xs sm:text-sm outline-none focus:border-emerald-500 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Accordion List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3">
            <HelpCircle className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No Questions Found</h3>
            <p className="text-xs text-slate-500">
              We couldn't find any questions matching "{searchQuery}". Please try another word or contact our team directly.
            </p>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = !!openItems[faq.id];
            return (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-emerald-300 transition"
              >
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-bold text-sm text-slate-900 leading-snug">
                    {faq.question}
                  </span>
                  <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 13. Still Have Questions CTA */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 text-center space-y-4">
          <h2 className="text-2xl font-black">Still Have Questions?</h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            We are always happy to talk to supporters, volunteers, and community members. Feel free to call or write to us.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => onNavigate('contact')}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 text-xs font-bold transition flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              <span>Contact Our Team</span>
            </button>
            <button
              onClick={() => onNavigate('transparency')}
              className="rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-6 py-3 text-xs font-bold transition flex items-center gap-2"
            >
              <span>View Audit Documents</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
