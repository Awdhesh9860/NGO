'use client';

import React from 'react';
import { GatewayConfigStatus, PaymentGatewayName } from '@/integrations/payment/payment.adapter';
import { CreditCard, Smartphone, Landmark, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface PaymentMethodSelectorProps {
  selected: PaymentGatewayName;
  onSelect: (provider: PaymentGatewayName) => void;
  providers?: GatewayConfigStatus[];
}

const LABELS: Record<PaymentGatewayName, { title: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }> = {
  RAZORPAY: {
    title: 'Razorpay (Cards / UPI / NetBanking)',
    subtitle: 'Instant cryptographic checkout verification',
    icon: CreditCard,
  },
  STRIPE: {
    title: 'Stripe (International Cards)',
    subtitle: 'Secure global checkout in INR / USD / EUR / GBP',
    icon: CreditCard,
  },
  UPI: {
    title: 'Direct UPI Transfer',
    subtitle: 'Remains PENDING until finance verifies UTR reference',
    icon: Smartphone,
  },
  BANK_TRANSFER: {
    title: 'Bank Transfer (NEFT / RTGS / IMPS)',
    subtitle: 'Remains PENDING until bank settlement is verified',
    icon: Landmark,
  },
};

export function PaymentMethodSelector({
  selected,
  onSelect,
  providers,
}: PaymentMethodSelectorProps) {
  const providerList: PaymentGatewayName[] = ['RAZORPAY', 'STRIPE', 'UPI', 'BANK_TRANSFER'];

  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      {providerList.map((key) => {
        const info = LABELS[key];
        const Icon = info.icon;
        const status = providers?.find((p) => p.provider === key);
        const unconfigured = status ? !status.configured : false;
        const active = selected === key;

        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition ${
              active
                ? 'border-[#087F5B] bg-emerald-50/70 dark:bg-emerald-950/40'
                : 'border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] hover:border-emerald-300'
            }`}
          >
            <div className="rounded-lg bg-slate-100 dark:bg-[#172b22] p-2 text-emerald-700 dark:text-emerald-400 shrink-0">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                  {info.title}
                </span>
                {status && (
                  <span
                    className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold shrink-0 ${
                      unconfigured
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    }`}
                  >
                    {unconfigured ? (
                      <>
                        <AlertCircle className="h-2.5 w-2.5" /> Unconfigured
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-2.5 w-2.5" /> {status.mode}
                      </>
                    )}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                {info.subtitle}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
