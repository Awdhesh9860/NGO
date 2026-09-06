import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import { Donation } from '../../types';
import { ReceiptModal } from '../common/ReceiptModal';
import {
  Heart,
  DollarSign,
  Download,
  Printer,
  FileCheck2,
  Calendar,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

interface DonorPortalProps {
  onOpenDonate: (campaignId?: string) => void;
}

export const DonorPortal: React.FC<DonorPortalProps> = ({ onOpenDonate }) => {
  const { donations, settings, campaigns } = useDatabase();
  const { currentUser } = useAuth();
  const [selectedReceipt, setSelectedReceipt] = useState<Donation | null>(null);
  const [showTaxStatement, setShowTaxStatement] = useState(false);

  // Filter donations belonging to this donor or sample donor contributions
  const myDonations = donations.filter(
    (d) =>
      d.donorEmail.toLowerCase() === currentUser?.email.toLowerCase() ||
      d.donorName.toLowerCase().includes('robert') ||
      d.donorName.toLowerCase().includes('ananya') ||
      d.amount >= 250
  );

  const totalGiven = myDonations.reduce((acc, d) => acc + d.amount, 0);
  const estimatedTaxSavings = Math.round(totalGiven * 0.5 * 0.3); // 50% deduction at ~30% bracket

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="rounded-3xl bg-slate-900 p-6 sm:p-10 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-[10px] font-bold text-emerald-300 uppercase border border-emerald-500/30">
                Verified Philanthropic Patron
              </span>
              <span className="text-xs text-slate-400">Donor ID: HH-DNR-4921</span>
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black">{currentUser?.name || 'Robert Sterling'}</h1>
            <p className="text-xs text-slate-300">{currentUser?.email || 'robert.sterling@impact.org'}</p>
          </div>

          <button
            onClick={() => onOpenDonate()}
            className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-lg shrink-0"
          >
            <Heart className="h-4 w-4 fill-white" />
            Make a New Tax-Exempt Gift
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Cumulative Giving
          </span>
          <p className="mt-2 text-3xl font-black text-slate-900">
            ${totalGiven.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-emerald-700 font-semibold flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" /> {myDonations.length} Contributions Recorded
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Estimated 80G Tax Benefit
          </span>
          <p className="mt-2 text-3xl font-black text-emerald-700">
            ~${estimatedTaxSavings.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            50% Deduction under Sec 80G(5)(vi)
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Form 10BE Tax Statement
            </span>
            <p className="mt-1 text-xs text-slate-600">
              Consolidated official annual statement for income tax filing.
            </p>
          </div>
          <button
            onClick={() => setShowTaxStatement(true)}
            className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
          >
            <Download className="h-3.5 w-3.5" /> Download FY 2024-25 Statement
          </button>
        </div>
      </div>

      {/* Donation History Table */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">My Giving History & 80G Receipts</h3>
            <p className="text-xs text-slate-500">
              Download or print statutory tax exemption receipts with verified signature seals.
            </p>
          </div>
          <ShieldCheck className="h-6 w-6 text-emerald-600" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-y border-slate-200 bg-slate-50 font-bold uppercase tracking-wider text-[10px] text-slate-500">
              <tr>
                <th className="py-3 px-4">Receipt Number</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Program / Appeal</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-right">Tax Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myDonations.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{d.receiptNumber}</td>
                  <td className="py-3 px-4 text-slate-500">{new Date(d.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{d.campaignTitle || 'General Welfare Fund'}</td>
                  <td className="py-3 px-4 font-black text-emerald-700">${d.amount.toLocaleString()}</td>
                  <td className="py-3 px-4 capitalize font-medium">{d.paymentGateway}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedReceipt(d)}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      View 80G Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Projects Benefiting From Your Support */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Your Impact on the Ground</h3>
        <p className="text-xs text-slate-500">
          Direct field updates from the communities and solar facilities supported by your gifts.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {campaigns.slice(0, 2).map((c) => (
            <div key={c.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                Active Deployment
              </span>
              <h4 className="font-bold text-slate-900">{c.title}</h4>
              <p className="text-slate-600 line-clamp-2">{c.description}</p>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-semibold text-emerald-700">
                <span>Raised: ${c.raisedAmount.toLocaleString()}</span>
                <span>{c.donorCount} Supporters</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal donation={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
      )}

      {/* Form 10BE Annual Statement Modal */}
      {showTaxStatement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Income Tax Rules, 1962
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Form 10BE — Annual Certificate of Donation
                </h3>
              </div>
              <button
                onClick={() => setShowTaxStatement(false)}
                className="rounded-lg bg-slate-100 p-1.5 text-slate-500 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 space-y-3 text-xs border border-slate-200">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500">Institution:</span>
                  <p className="font-bold text-slate-900">{settings.ngoName}</p>
                </div>
                <div>
                  <span className="text-slate-500">PAN of NGO:</span>
                  <p className="font-mono font-bold text-slate-900">{settings.panNumber}</p>
                </div>
                <div>
                  <span className="text-slate-500">Donor Name:</span>
                  <p className="font-bold text-slate-900">{currentUser?.name || 'Robert Sterling'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Financial Year:</span>
                  <p className="font-bold text-slate-900">2024 - 2025 (AY 2025-26)</p>
                </div>
                <div>
                  <span className="text-slate-500">Total Eligible Sum:</span>
                  <p className="text-sm font-black text-emerald-700">${totalGiven.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-slate-500">Form 10BE Filing Ack:</span>
                  <p className="font-mono text-slate-700 font-bold">ACK-10BE-99210-2025</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
              >
                <Printer className="h-4 w-4" /> Print Form 10BE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
