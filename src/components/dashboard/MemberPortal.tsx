import React from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import {
  Award,
  Calendar,
  Vote,
  FileText,
  Sparkles,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Users
} from 'lucide-react';

export const MemberPortal: React.FC = () => {
  const { memberships, settings } = useDatabase();
  const { currentUser } = useAuth();

  const currentMembership = memberships[0] || {
    id: 'mbr-1',
    memberName: currentUser?.name || 'Dr. Evelyn Vance',
    tier: 'ANNUAL_PATRON',
    amount: 250,
    renewalDate: '2026-03-31',
    status: 'ACTIVE'
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-emerald-950 p-6 sm:p-10 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-400/20 px-3 py-0.5 text-[10px] font-bold text-emerald-300 uppercase tracking-wider border border-emerald-400/40">
                General Assembly Member
              </span>
              <span className="text-xs text-slate-400">Status: Active in Good Standing</span>
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black">{currentUser?.name || 'Dr. Evelyn Vance'}</h1>
            <p className="text-xs text-slate-300">HopeHorizon Stakeholder & Governance Council</p>
          </div>

          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-xs text-center min-w-32 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-emerald-300 block">Tier</span>
            <span className="text-base font-black text-white">{currentMembership.tier.replace('_', ' ')}</span>
            <span className="text-[10px] text-slate-300 block mt-0.5">Renews {currentMembership.renewalDate}</span>
          </div>
        </div>
      </div>

      {/* Digital Member Card & Voting Rights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Card display */}
        <div className="lg:col-span-6 space-y-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-800 to-emerald-900 p-8 text-white shadow-2xl border border-slate-700 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-400 block tracking-wider uppercase">
                  Official Membership Credential
                </span>
                <h3 className="text-lg font-black">{settings.ngoName}</h3>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/40">
                GOLD COUNCIL
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase">Member Name</span>
              <p className="text-2xl font-black text-white">{currentUser?.name || 'Dr. Evelyn Vance'}</p>
            </div>

            <div className="flex items-end justify-between border-t border-slate-700 pt-4 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Credential Hash</span>
                <span className="font-mono text-emerald-300 font-bold">HH-MBR-2025-GOLD</span>
              </div>
              <div className="rounded-xl bg-white p-1.5 text-slate-900">
                <QrCode className="h-8 w-8" />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 text-sm">Member Privileges & Entitlements</h4>
            <div className="space-y-2 text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Annual General Assembly voting on project priorities</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Quarterly unredacted financial audits & balance sheet preview</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Direct advisory channel to Board of Trustees</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Upcoming Assembly Votes & Briefings */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Upcoming Assembly Resolutions & Votes</h3>
              <Vote className="h-5 w-5 text-emerald-600" />
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3 text-xs">
              <div className="flex justify-between items-center font-bold">
                <span className="text-emerald-950">Resolution 2025-04: Expansion into Ladakh District</span>
                <span className="rounded bg-emerald-600 px-2 py-0.5 text-[10px] text-white">OPEN VOTE</span>
              </div>
              <p className="text-slate-600">
                Proposal to authorize a $120,000 capital expenditure for winter solar greening and water pipelines.
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => alert('Your vote in FAVOR has been cryptographically recorded on the member ledger.')}
                  className="rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700"
                >
                  Vote In Favor (Yes)
                </button>
                <button
                  onClick={() => alert('Your vote AGAINST has been cryptographically recorded on the member ledger.')}
                  className="rounded-xl bg-slate-200 px-4 py-2 font-bold text-slate-700 hover:bg-slate-300"
                >
                  Vote Against (No)
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900 p-6 text-white space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Executive Director's Confidential Briefing
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Read the Q1 confidential status memorandum detailing grassroots government permissions, FCRA regulatory renewal progress, and supply chain logistics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
