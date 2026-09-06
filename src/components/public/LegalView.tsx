import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { ShieldCheck, Scale, FileText, CheckCircle2 } from 'lucide-react';

interface LegalViewProps {
  initialTab?: string;
}

export const LegalView: React.FC<LegalViewProps> = ({ initialTab = '80g' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const { settings } = useDatabase();

  const tabs = [
    { id: '80g', label: '80G Tax Exemption & 10BE' },
    { id: 'refund', label: 'Donation & Refund Policy' },
    { id: 'privacy', label: 'Privacy & Data Protection' },
    { id: 'terms', label: 'Terms & Conditions' },
    { id: 'volunteer-code', label: 'Volunteer Code of Conduct' }
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 space-y-10">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 p-8 sm:p-12 text-white shadow-xl">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <Scale className="h-4 w-4" />
          <span>Statutory Compliance & Legal Governance</span>
        </div>
        <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight">
          Legal Policies & Regulatory Disclosures
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Full statutory governance details for {settings.ngoName} (Reg No: {settings.registrationNumber}).
        </p>

        {/* Tab Strip */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-800 pt-4 text-xs font-bold">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-xl px-3.5 py-2 transition ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xs text-xs sm:text-sm text-slate-700 space-y-6 leading-relaxed">
        {activeTab === '80g' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">
              Section 80G Tax Exemption & Digital Form 10BE
            </h2>
            <p>
              {settings.ngoName} is registered under Section 80G(5)(vi) of the Income Tax Act, 1961, pursuant to Order Number <strong>{settings.taxExemption80GNumber}</strong>.
            </p>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2">
              <h3 className="font-bold text-emerald-950 text-xs uppercase tracking-wider">
                Key Donor Tax Benefits:
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <strong>50% Deduction:</strong> 50% of the donated sum is deductible from taxable gross total income.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <strong>Direct Form 10BE Filing:</strong> Annual Statement of Donations is directly uploaded to the Income Tax Department's portal.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <strong>Instant Electronic Receipts:</strong> Digital receipts with embedded QR authentication codes are issued instantly upon contribution.
                </li>
              </ul>
            </div>
            <p>
              Donors must provide their Permanent Account Number (PAN) or National Tax ID during donation to enable automated generation of Form 10BE tax certificates.
            </p>
          </div>
        )}

        {activeTab === 'refund' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Donation & Refund Policy</h2>
            <p>
              {settings.ngoName} takes utmost care to ensure the seamless, transparent processing of charitable contributions made via our online payment gateways.
            </p>
            <h3 className="font-bold text-slate-900 text-sm">Accidental or Duplicate Transactions</h3>
            <p>
              If a donation was made erroneously (e.g. duplicate deduction or technical error), the donor may request a full refund within <strong>7 days</strong> of the transaction date by writing to <span className="font-mono font-bold text-slate-900">{settings.primaryEmail}</span> with proof of deduction.
            </p>
            <h3 className="font-bold text-slate-900 text-sm">Statutory Refund Processing</h3>
            <p>
              Refunds will be credited to the original payment method (bank account / card) within 5-7 business working days. Once an official 80G tax certificate has been registered with the tax authority, cancellations cannot be processed without statutory amendment.
            </p>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Privacy & Data Protection Policy</h2>
            <p>
              We respect your right to privacy. We do not sell, rent, trade, or publish personal donor contact information under any circumstances.
            </p>
            <h3 className="font-bold text-slate-900 text-sm">Data Security & Encryption</h3>
            <p>
              All online donation transactions are processed through 256-bit TLS encrypted payment gateways. We never store credit card numbers or banking passwords on our servers.
            </p>
            <h3 className="font-bold text-slate-900 text-sm">Anonymous Giving Option</h3>
            <p>
              Donors who select the "Make my donation anonymous" checkbox will be withheld from all public donor walls and impact acknowledgments.
            </p>
          </div>
        )}

        {activeTab === 'terms' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Terms of Website Use</h2>
            <p>
              Welcome to the official digital portal of {settings.ngoName}. By browsing or using this platform, you agree to comply with all applicable humanitarian governance laws and digital access terms.
            </p>
            <p>
              All published audit reports, field photojournalism, and technical whitepapers are published for public educational and transparency purposes under Creative Commons Attribution guidelines.
            </p>
          </div>
        )}

        {activeTab === 'volunteer-code' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">
              Volunteer Code of Conduct & Safeguarding
            </h2>
            <p>
              All volunteers, field coordinators, and interns represent the ethical trust of HopeHorizon. We uphold a strict Zero-Tolerance Safeguarding Policy regarding child protection, gender equity, and cultural sensitivity in every village deployment.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Respect the dignity, culture, and privacy of all community members and children.</li>
              <li>Strictly adhere to frontline safety protocols during disaster and relief operations.</li>
              <li>Uphold complete honesty and transparency in field expenditure reporting.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
