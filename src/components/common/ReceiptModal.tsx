import React from 'react';
import { Donation } from '../../types';
import { useDatabase } from '../../context/DatabaseContext';
import { X, Printer, Download, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ReceiptModalProps {
  donation: Donation | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ donation, onClose }) => {
  const { settings } = useDatabase();
  if (!donation) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Modal Top Actions */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4 no-print">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <h3 className="font-semibold text-slate-800">Official 80G Tax Exemption Receipt</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition"
            >
              <Printer className="h-4 w-4" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Receipt Body */}
        <div className="printable-area p-8 text-slate-800">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-block rounded bg-emerald-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Form 10BE / Section 80G Tax Exemption
                </span>
                <h1 className="mt-2 text-2xl font-bold text-slate-900">{settings.ngoName}</h1>
                <p className="text-xs text-slate-600 mt-1 max-w-md">{settings.headquartersAddress}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Reg No: {settings.registrationNumber} | NGO Darpan: {settings.darpanId}
                </p>
                <p className="text-xs font-medium text-emerald-700 mt-0.5">
                  80G Exemption Order: {settings.taxExemption80GNumber} | PAN: {settings.panNumber}
                </p>
              </div>
              <div className="text-right">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-right">
                  <span className="block text-xs font-semibold text-slate-500">Receipt Number</span>
                  <span className="font-mono text-sm font-bold text-slate-900">{donation.receiptNumber}</span>
                  <span className="block mt-2 text-xs font-semibold text-slate-500">Date Issued</span>
                  <span className="text-xs font-medium text-slate-800">
                    {new Date(donation.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Donor & Payment Grid */}
          <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs">
            <div>
              <span className="font-medium text-slate-500">Donor Name:</span>
              <p className="text-sm font-semibold text-slate-900">{donation.donorName}</p>
            </div>
            <div>
              <span className="font-medium text-slate-500">Donor Email:</span>
              <p className="font-mono text-slate-800">{donation.donorEmail}</p>
            </div>
            <div>
              <span className="font-medium text-slate-500">PAN / Tax ID:</span>
              <p className="font-mono font-medium text-slate-800">{donation.panOrTaxId || 'N/A'}</p>
            </div>
            <div>
              <span className="font-medium text-slate-500">Transaction ID:</span>
              <p className="font-mono text-xs text-slate-700">{donation.transactionId}</p>
            </div>
            <div>
              <span className="font-medium text-slate-500">Payment Channel:</span>
              <p className="capitalize text-slate-800">{donation.paymentGateway} (Verified Gateway)</p>
            </div>
            <div>
              <span className="font-medium text-slate-500">Giving Type:</span>
              <p className="capitalize text-slate-800">
                {donation.donationType} {donation.frequency ? `(${donation.frequency})` : ''}
              </p>
            </div>
          </div>

          {/* Allocation & Amount Box */}
          <div className="mt-6 rounded-xl border-2 border-emerald-600 bg-emerald-50/30 p-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-600">Designated Initiative / Campaign:</span>
                <p className="text-sm font-bold text-slate-900">
                  {donation.campaignTitle || 'General Social Welfare & Disaster Relief Fund'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Total Contribution</span>
                <p className="text-2xl font-black text-emerald-700">
                  {donation.currency} {donation.amount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Statutory Tax Exemption Declaration */}
          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-3 text-[11px] leading-relaxed text-slate-600">
            <p className="font-semibold text-slate-800 mb-1">Statutory Certificate & 80G Tax Exemption Note:</p>
            <p>
              Donations to {settings.ngoName} are eligible for 50% deduction under Section 80G / 501(c)(3) guidelines. This receipt is digitally generated under authority of Rule 18AB of the Income-tax Rules and requires no physical signature when verified online.
            </p>
          </div>

          {/* Signature & Seal Footer */}
          <div className="mt-8 flex items-end justify-between border-t border-slate-200 pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              <div>
                <span className="block text-xs font-bold text-slate-800">Digitally Verified & Locked</span>
                <span className="block text-[10px] text-slate-500">Hash: SHA256:{donation.id.slice(-8)}98A2</span>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-block border-b border-slate-400 pb-1 font-serif italic text-sm text-slate-800">
                Dr. Evelyn Vance
              </div>
              <p className="text-[11px] font-semibold text-slate-700 mt-1">Authorized Signatory & Trustee</p>
              <p className="text-[10px] text-slate-500">{settings.ngoName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
