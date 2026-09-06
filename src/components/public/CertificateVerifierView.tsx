import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { CertificateViewModal } from '../common/CertificateViewModal';
import { Certificate } from '../../types';
import {
  Award,
  Search,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Lock,
  QrCode,
  FileCheck
} from 'lucide-react';

export const CertificateVerifierView: React.FC = () => {
  const { certificates } = useDatabase();
  const [certInput, setCertInput] = useState('');
  const [searched, setSearched] = useState(false);
  const [matchedCert, setMatchedCert] = useState<Certificate | null>(null);
  const [modalCert, setModalCert] = useState<Certificate | null>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const query = certInput.trim().toUpperCase();
    if (!query) return;

    const found = certificates.find(
      (c) =>
        c.certificateNumber.toUpperCase() === query ||
        c.verificationCode.toUpperCase() === query
    );

    setMatchedCert(found || null);
    setSearched(true);
  };

  const sampleCerts = certificates.slice(0, 2);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 space-y-10">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-700 to-amber-900 p-8 sm:p-12 text-white shadow-xl text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-md">
          <Award className="h-8 w-8 text-amber-200" />
        </div>
        <span className="inline-block rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold text-amber-200 uppercase tracking-wider">
          Public Verification Ledger
        </span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
          Verify Official HopeHorizon Certificates
        </h1>
        <p className="mx-auto max-w-xl text-xs sm:text-sm text-amber-100 leading-relaxed">
          Authenticate volunteer credentials, donor recognition awards, and internship completion certificates directly from our cryptographic registry.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md">
        <form onSubmit={handleVerify} className="space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Enter Certificate Number or Verification Code
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. CERT-2025-0891 or VRF-88910-SEC"
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 py-3 pl-10 pr-4 text-sm font-mono text-slate-900 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-2xl bg-amber-700 px-7 py-3 text-xs font-bold text-white shadow-md hover:bg-amber-800 transition shrink-0"
            >
              <ShieldCheck className="h-4 w-4" />
              Verify Certificate
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
            <span>Quick test codes:</span>
            {sampleCerts.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCertInput(c.certificateNumber)}
                className="font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded hover:underline"
              >
                {c.certificateNumber}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Verification Result */}
      {searched && (
        <div className="space-y-6">
          {matchedCert ? (
            <div className="rounded-3xl border-2 border-emerald-500 bg-emerald-50/40 p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 text-emerald-800">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-emerald-950">
                    Certificate Successfully Authenticated
                  </h3>
                  <p className="text-xs text-emerald-700">
                    This document was officially issued by HopeHorizon Foundation and is in good standing.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-white p-5 border border-emerald-200 text-xs">
                <div>
                  <span className="text-slate-500">Recipient:</span>
                  <p className="font-bold text-sm text-slate-900">{matchedCert.recipientName}</p>
                </div>
                <div>
                  <span className="text-slate-500">Certificate Title:</span>
                  <p className="font-bold text-slate-900">{matchedCert.title}</p>
                </div>
                <div>
                  <span className="text-slate-500">Certificate Number:</span>
                  <p className="font-mono font-bold text-slate-800">{matchedCert.certificateNumber}</p>
                </div>
                <div>
                  <span className="text-slate-500">Issued On:</span>
                  <p className="font-medium text-slate-800">{matchedCert.issueDate}</p>
                </div>
                <div>
                  <span className="text-slate-500">Authorized Issuer:</span>
                  <p className="font-medium text-slate-800">
                    {matchedCert.issuedBy} ({matchedCert.issuerRole})
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Verification Hash:</span>
                  <p className="font-mono text-emerald-800 font-semibold">{matchedCert.verificationCode}</p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setModalCert(matchedCert)}
                  className="flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition"
                >
                  <FileCheck className="h-4 w-4" />
                  View & Print Full Certificate
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border-2 border-red-200 bg-red-50/50 p-6 sm:p-8 text-center space-y-2">
              <XCircle className="mx-auto h-10 w-10 text-red-500" />
              <h3 className="text-lg font-bold text-red-950">Certificate Not Found</h3>
              <p className="text-xs text-red-700 max-w-md mx-auto">
                No verified certificate matches "{certInput}". Please check the spelling or contact compliance@hopehorizon-ngo.org.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal View */}
      {modalCert && (
        <CertificateViewModal certificate={modalCert} onClose={() => setModalCert(null)} />
      )}
    </div>
  );
};
