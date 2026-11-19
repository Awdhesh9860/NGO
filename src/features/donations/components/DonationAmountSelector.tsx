'use client';

import React from 'react';
import { formatMinorCurrency, fromMinorUnits, toMinorUnits } from '@/lib/money';

export interface DonationAmountSelectorProps {
  presetsMinor?: number[];
  valueMinor: number;
  currency?: string;
  minimumMinor?: number;
  onChangeMinor: (amountMinor: number) => void;
}

export function DonationAmountSelector({
  presetsMinor = [50000, 150000, 300000, 500000],
  valueMinor,
  currency = 'INR',
  minimumMinor = 10000,
  onChangeMinor,
}: DonationAmountSelectorProps) {
  const majorValue = valueMinor > 0 ? fromMinorUnits(valueMinor, currency) : '';

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {presetsMinor.map((preset) => {
          const active = valueMinor === preset;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => onChangeMinor(preset)}
              className={`rounded-xl border px-3 py-2.5 text-sm font-black transition ${
                active
                  ? 'border-[#087F5B] bg-emerald-50 text-[#087F5B] dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] text-slate-800 dark:text-slate-200 hover:border-emerald-400'
              }`}
            >
              {formatMinorCurrency(preset, currency)}
            </button>
          );
        })}
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
          Custom Amount ({currency}) — Min {formatMinorCurrency(minimumMinor, currency)}
        </label>
        <input
          type="number"
          min={fromMinorUnits(minimumMinor, currency)}
          step="1"
          value={majorValue}
          onChange={(e) => {
            const num = Number(e.target.value);
            if (Number.isFinite(num) && num >= 0) {
              onChangeMinor(toMinorUnits(num, currency));
            }
          }}
          className="w-full rounded-xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#0f1f19] px-3.5 py-2.5 text-sm font-bold text-slate-900 dark:text-white"
        />
      </div>
    </div>
  );
}
