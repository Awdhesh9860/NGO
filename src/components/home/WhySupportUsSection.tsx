import React from 'react';
import {
  ShieldCheck,
  Eye,
  Award,
  CheckCircle2,
  FileCheck,
  HeartHandshake,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

interface WhySupportUsSectionProps {
  onNavigate: (view: string, id?: string) => void;
}

export const WhySupportUsSection: React.FC<WhySupportUsSectionProps> = ({ onNavigate }) => {
  const pillars = [
    {
      title: '100% Honest Accounts',
      description: 'Every single rupee is accounted for. Anyone can download our yearly balance sheet and audit papers directly from our website.',
      icon: Eye,
      tag: 'Open Accounts'
    },
    {
      title: 'Direct Help — No Middlemen',
      description: 'We do not pay commission agents or fancy agencies. Our own volunteers deliver food, books, and medical care straight to families.',
      icon: HeartHandshake,
      tag: 'Zero Middlemen'
    },
    {
      title: 'Helping Families Stand Proudly',
      description: 'We do not just give one-day help. We teach mothers sewing and youth computer skills so they can earn their own living with dignity.',
      icon: TrendingUp,
      tag: 'Lifelong Support'
    },
    {
      title: 'Save Tax with 80G Receipts',
      description: 'Get an instant 50% tax exemption receipt on WhatsApp and Email right after you donate. Completely valid under Section 80G.',
      icon: FileCheck,
      tag: '80G Tax Save'
    },
    {
      title: 'Loving Care for Every Child',
      description: 'Every boy and girl is treated with genuine love and safety. All our teachers and ground staff follow strict child protection rules.',
      icon: ShieldCheck,
      tag: 'Child Safety'
    },
    {
      title: 'Real Photos & Video Proof',
      description: 'We share genuine photos and clear updates from the ground showing the exact school or water pump your donation helped build.',
      icon: Award,
      tag: 'Real Proof'
    }
  ];

  return (
    <section id="why-support-us" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
          Why You Can Trust Us
        </span>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Why Support HopeHorizon?
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          When you donate, you can be 100% sure that your hard-earned money goes directly to children and families in need.
        </p>
      </div>

      {/* Trust Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pillars.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 space-y-3 shadow-xs hover:border-emerald-300 hover:shadow-lg transition duration-200 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
                    {item.tag}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Verified by Annual Audit</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Financial Allocation Transparency Banner */}
      <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-5 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Fund Allocation Commitment
          </span>
          <h3 className="text-xl sm:text-2xl font-black">
            Where Every Dollar Goes
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            We operate with ultra-lean administrative costs so that maximum resources reach the children and families who need them.
          </p>
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-slate-800/80 border border-slate-700 p-4 space-y-1 text-center sm:text-left">
            <span className="text-3xl font-black text-emerald-400">88%</span>
            <p className="text-xs font-bold text-white">Direct Field Programs</p>
            <p className="text-[11px] text-slate-400">Classrooms, clean water, medical aid</p>
          </div>

          <div className="rounded-2xl bg-slate-800/80 border border-slate-700 p-4 space-y-1 text-center sm:text-left">
            <span className="text-3xl font-black text-teal-400">7%</span>
            <p className="text-xs font-bold text-white">Quality & Monitoring</p>
            <p className="text-[11px] text-slate-400">Field logistics, inspections, safety</p>
          </div>

          <div className="rounded-2xl bg-slate-800/80 border border-slate-700 p-4 space-y-1 text-center sm:text-left">
            <span className="text-3xl font-black text-blue-400">5%</span>
            <p className="text-xs font-bold text-white">Administration</p>
            <p className="text-[11px] text-slate-400">Audits, legal compliance, receipts</p>
          </div>
        </div>
      </div>

    </section>
  );
};
