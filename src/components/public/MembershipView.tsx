import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  Award,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Heart,
  QrCode,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MembershipViewProps {
  onOpenDonate: (campaignId?: string) => void;
}

export const MembershipView: React.FC<MembershipViewProps> = ({ onOpenDonate }) => {
  const { memberships, addMembership } = useDatabase();
  const [selectedTier, setSelectedTier] = useState<string>('ANNUAL_PATRON');
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [enrolled, setEnrolled] = useState(false);

  const tiers = [
    {
      id: 'YOUTH_AMBASSADOR',
      name: 'Youth Ambassador',
      fee: 50,
      period: 'per year',
      tag: 'Under 26 & Students',
      color: 'border-blue-200 bg-blue-50/40 text-blue-900',
      benefits: [
        'Digital NGO Member ID Card',
        'Quarterly Virtual Townhalls with Directors',
        'Priority Volunteer Field Placement',
        'Annual Impact Magazine Dispatch'
      ]
    },
    {
      id: 'ANNUAL_PATRON',
      name: 'Annual Impact Patron',
      fee: 250,
      period: 'per year',
      tag: 'Most Popular',
      color: 'border-emerald-500 bg-emerald-50/60 text-emerald-950 shadow-md',
      benefits: [
        'Official Gold Member Seal & Card',
        'Voting Rights at Annual General Council',
        'VIP Access to Global Humanitarian Summit',
        'Direct Monthly Video Briefings from Ground Zero',
        'Full 80G / 501(c)(3) Tax Exemption Receipt'
      ]
    },
    {
      id: 'LIFETIME_BENEFACTOR',
      name: 'Lifetime Benefactor',
      fee: 1500,
      period: 'one-time endowment',
      tag: 'Permanent Honor',
      color: 'border-amber-400 bg-amber-50/50 text-amber-950',
      benefits: [
        'Permanent Engraving on Headquarters Donor Wall',
        'Permanent Lifetime Member Card & Crest',
        'Annual Private Dinner with Board of Trustees',
        'Dedicated Project Milestone Naming Rights',
        'Statutory Tax Exemption Form 10BE'
      ]
    }
  ];

  const handleEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName || !memberEmail) return;

    const chosenTierObj = tiers.find((t) => t.id === selectedTier) || tiers[1];

    addMembership({
      userId: 'user-new-member',
      memberName,
      email: memberEmail,
      tier: selectedTier as any,
      amount: chosenTierObj.fee,
      renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

    setEnrolled(true);

    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 space-y-12">
      {/* Header Banner */}
      <div className="rounded-3xl bg-slate-900 p-8 sm:p-14 text-white shadow-xl text-center space-y-4">
        <span className="inline-block rounded-full bg-emerald-500/30 px-3.5 py-1 text-xs font-bold text-emerald-300 uppercase tracking-wider">
          Patronage & Governance
        </span>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
          Join the HopeHorizon Assembly of Members
        </h1>
        <p className="mx-auto max-w-2xl text-xs sm:text-sm text-slate-300 leading-relaxed">
          Become a stakeholder in global humanitarian action. Members hold governance advisory rights, receive verified credentials, and fund frontline resilience.
        </p>
      </div>

      {/* Digital Membership Card Preview & Enrollment Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Form */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-md">
          {enrolled ? (
            <div className="text-center py-10 space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Welcome to the Membership Council!</h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-slate-900">{memberName}</strong>. Your digital membership card and tax receipt have been issued.
              </p>
              <button
                onClick={() => setEnrolled(false)}
                className="mt-4 rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
              >
                Enroll Another Member
              </button>
            </div>
          ) : (
            <form onSubmit={handleEnroll} className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Select Membership Tier</h3>
                <p className="text-xs text-slate-500">Choose your level of involvement and impact.</p>
              </div>

              {/* Tiers radio selection */}
              <div className="space-y-3">
                {tiers.map((t) => (
                  <label
                    key={t.id}
                    className={`block cursor-pointer rounded-2xl border-2 p-4 transition ${
                      selectedTier === t.id ? t.color : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="membershipTier"
                          checked={selectedTier === t.id}
                          onChange={() => setSelectedTier(t.id)}
                          className="h-4 w-4 text-emerald-600"
                        />
                        <div>
                          <span className="font-bold text-sm block text-slate-900">{t.name}</span>
                          <span className="text-[11px] text-slate-500">{t.tag}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-lg text-slate-900">${t.fee}</span>
                        <span className="text-[10px] text-slate-500 block">{t.period}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="space-y-4 border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Member Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Full Legal Name"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 outline-none"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 outline-none"
                  />
                </div>
                <input
                  type="tel"
                  placeholder="Phone Number (for SMS council notices)"
                  value={memberPhone}
                  onChange={(e) => setMemberPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-xs font-bold text-white shadow-lg hover:bg-emerald-700 transition"
              >
                <Award className="h-4 w-4" />
                Activate Membership & Generate Pass
              </button>
            </form>
          )}
        </div>

        {/* Digital Membership Card Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Live Digital Card Preview
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-800 to-emerald-950 p-6 text-white shadow-2xl border border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-emerald-400 fill-emerald-400" />
                <span className="font-black text-sm tracking-wide">HopeHorizon NGO</span>
              </div>
              <span className="rounded-full bg-emerald-400/20 border border-emerald-400/40 px-2.5 py-0.5 text-[9px] font-bold text-emerald-300 uppercase">
                {selectedTier.replace('_', ' ')}
              </span>
            </div>

            <div className="my-8">
              <span className="text-[10px] text-slate-400 font-medium">Cardholder Name</span>
              <p className="text-xl font-bold tracking-tight text-white">
                {memberName || 'Your Full Name'}
              </p>
            </div>

            <div className="flex items-end justify-between border-t border-slate-700 pt-4 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[9px]">Member ID</span>
                <span className="font-mono font-bold text-emerald-300">
                  HH-MBR-{Math.floor(1000 + Math.random() * 9000)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px]">Valid Thru</span>
                <span className="font-mono text-slate-200">12 / 2026</span>
              </div>
              <div className="rounded-lg bg-white p-1 text-slate-900">
                <QrCode className="h-7 w-7" />
              </div>
            </div>
          </div>

          {/* Benefits List for Selected Tier */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-3 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Included Membership Privileges
            </h4>
            <div className="space-y-2 text-xs text-slate-600">
              {tiers
                .find((t) => t.id === selectedTier)
                ?.benefits.map((b, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
