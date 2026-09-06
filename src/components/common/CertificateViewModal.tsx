import React from 'react';
import { Certificate } from '../../types';
import { X, Printer, ShieldCheck, Award, QrCode } from 'lucide-react';

interface CertificateViewModalProps {
  certificate: Certificate | null;
  onClose: () => void;
}

export const CertificateViewModal: React.FC<CertificateViewModalProps> = ({ certificate, onClose }) => {
  if (!certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4 no-print">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-600" />
            <span className="font-semibold text-slate-800">Verified Certificate of Recognition</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition"
            >
              <Printer className="h-4 w-4" />
              Print / Save Certificate
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Certificate Display Area */}
        <div className="printable-area p-8 bg-amber-50/30">
          <div className="relative rounded-2xl border-8 border-double border-amber-700/60 bg-white p-10 text-center shadow-lg">
            {/* Watermark Logo Backing */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-5">
              <Award className="h-96 w-96 text-amber-900" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-center gap-2 text-amber-800">
              <Award className="h-8 w-8 text-amber-600" />
              <span className="text-xs font-black uppercase tracking-widest text-amber-800">
                {certificate.organizationName}
              </span>
              <Award className="h-8 w-8 text-amber-600" />
            </div>

            <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {certificate.title}
            </h1>

            <p className="mt-4 text-xs uppercase tracking-widest text-slate-500 font-semibold">
              This is proudly presented to
            </p>

            <div className="my-4 inline-block border-b-2 border-amber-600 px-8 pb-2">
              <h2 className="font-serif text-3xl font-bold text-amber-950 sm:text-4xl">
                {certificate.recipientName}
              </h2>
            </div>

            <p className="mx-auto max-w-xl text-sm leading-relaxed text-slate-700">
              {certificate.description}
            </p>

            {/* Verification Metadata Box */}
            <div className="mt-8 grid grid-cols-3 items-end gap-4 border-t border-slate-200 pt-6 text-left">
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Issue Date
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {new Date(certificate.issueDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <span className="block mt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Certificate ID
                </span>
                <span className="font-mono text-xs font-bold text-slate-700">
                  {certificate.certificateNumber}
                </span>
              </div>

              {/* QR Verification badge */}
              <div className="text-center">
                <div className="inline-flex flex-col items-center rounded-xl border border-amber-200 bg-amber-50/80 p-2.5 shadow-xs">
                  <QrCode className="h-10 w-10 text-slate-800" />
                  <span className="mt-1 font-mono text-[9px] font-bold text-slate-700">
                    {certificate.verificationCode}
                  </span>
                  <span className="flex items-center gap-1 text-[9px] font-semibold text-emerald-700">
                    <ShieldCheck className="h-3 w-3" /> Online Verified
                  </span>
                </div>
              </div>

              {/* Authorized Signatory */}
              <div className="text-right">
                <div className="inline-block border-b border-slate-400 pb-1 font-serif italic text-base text-slate-900">
                  {certificate.issuedBy}
                </div>
                <p className="text-xs font-bold text-slate-800 mt-1">{certificate.issuerRole}</p>
                <p className="text-[10px] text-slate-500">{certificate.organizationName}</p>
              </div>
            </div>

            {/* Verification URL Footer Note */}
            <p className="mt-6 text-[10px] text-slate-400 font-mono">
              Verify live authenticity at: https://hopehorizon-ngo.org/verify-certificate/{certificate.certificateNumber}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
