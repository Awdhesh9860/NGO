import React from 'react';
import { ShieldCheck, HeartHandshake, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { APP_CONFIG } from '../../config/app';

export interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  onBackToHome?: () => void;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  onBackToHome,
  children,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-emerald-100 selection:text-emerald-900">
      {/* Subtle top decoration */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500" />

      {/* Back button */}
      {onBackToHome && (
        <div className="absolute top-6 left-6">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Public Website</span>
          </button>
        </div>
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-emerald-600 text-white font-black text-xl shadow-lg mb-3">
          V
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
        {subtitle && (
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl border border-slate-200/80 rounded-2xl sm:px-10 space-y-6">
          {children}

          {/* Statutory Trust & Encryption Footnote */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1 text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                80G Verified
              </span>
              <span className="flex items-center gap-1 text-blue-700">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                TLS 1.3 Security
              </span>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              Registration: {APP_CONFIG.statutory.darpanId} • Section 80G(5)(vi) Approved
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
