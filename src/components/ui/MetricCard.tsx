import React from 'react';
import { cn } from '../../lib/utils';
import { ProgressBar } from './ProgressBar';

export interface MetricCardProps {
  label: string;
  currentValue: number;
  targetValue: number;
  unit?: string;
  formatAsCurrency?: boolean;
  color?: 'emerald' | 'blue' | 'amber' | 'indigo';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  currentValue,
  targetValue,
  unit = '',
  formatAsCurrency = false,
  className,
}) => {
  const percentage = Math.min(Math.round((currentValue / (targetValue || 1)) * 100), 100);

  const formatValue = (val: number) => {
    if (formatAsCurrency) {
      return `₹${val.toLocaleString('en-IN')}`;
    }
    return `${val.toLocaleString('en-US')} ${unit}`.trim();
  };

  return (
    <div className={cn('p-4 rounded-xl border border-slate-200/80 bg-white space-y-2.5', className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700 truncate">{label}</span>
        <span className="font-bold text-slate-900">{percentage}%</span>
      </div>

      <ProgressBar progress={percentage} />

      <div className="flex items-center justify-between text-[11px] text-slate-500">
        <span>Raised: <strong className="text-slate-800">{formatValue(currentValue)}</strong></span>
        <span>Goal: <strong className="text-slate-800">{formatValue(targetValue)}</strong></span>
      </div>
    </div>
  );
};
