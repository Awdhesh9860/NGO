/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GoogleSheetsHub } from '../sheets/GoogleSheetsHub';
import { FileSpreadsheet, Home, ArrowLeft } from 'lucide-react';

interface GoogleSheetsViewProps {
  onNavigate: (view: string, id?: string) => void;
}

export const GoogleSheetsView: React.FC<GoogleSheetsViewProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center justify-between">
          <ol className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <li>
              <button
                onClick={() => onNavigate('home')}
                className="hover:text-emerald-700 transition cursor-pointer flex items-center gap-1"
              >
                <Home className="h-3.5 w-3.5" />
                <span>Home</span>
              </button>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <button
                onClick={() => onNavigate('transparency')}
                className="hover:text-emerald-700 transition cursor-pointer"
              >
                Transparency & Audits
              </button>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-emerald-700 font-bold" aria-current="page">
              Google Sheets Live Sync
            </li>
          </ol>

          <button
            onClick={() => onNavigate('dashboard')}
            className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Dashboard</span>
          </button>
        </nav>

        {/* Main Google Sheets Hub Component */}
        <GoogleSheetsHub onNavigate={onNavigate} />
      </div>
    </div>
  );
};
