import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Heart, ArrowLeft } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to HopeHorizon
        </Link>

        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck className="w-4 h-4" />
          <span>256-Bit SSL Encrypted &bull; 80G Certified</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md">
          {/* Logo & Brand Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20 group-hover:scale-105 transition-transform">
                <Heart className="w-6 h-6 fill-white/20" />
              </div>
              <div className="text-left">
                <span className="block text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  HopeHorizon
                </span>
                <span className="block text-[11px] font-medium text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">
                  NGO Digital Platform
                </span>
              </div>
            </Link>
          </div>

          {/* Render Page Card */}
          {children}
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>
          &copy; {new Date().getFullYear()} HopeHorizon Foundation. All rights reserved. Registered under Section 80G & 12A of the Income Tax Act.
        </p>
      </footer>
    </div>
  );
}
