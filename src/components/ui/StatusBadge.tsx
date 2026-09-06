import React from 'react';
import { cn } from '../../lib/utils';

export type EntityStatus =
  | 'ACTIVE'
  | 'PENDING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED'
  | 'ON_HOLD'
  | 'ARCHIVED'
  | 'IN_PROGRESS'
  | 'TODO'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUCCESSFUL';

export interface StatusBadgeProps {
  status: EntityStatus | string;
  label?: string;
  className?: string;
}

const statusColorMap: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  SUCCESSFUL: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  COMPLETED: 'bg-blue-50 text-blue-700 border-blue-200',
  IN_PROGRESS: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  TODO: 'bg-slate-100 text-slate-700 border-slate-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  ON_HOLD: 'bg-amber-50 text-amber-700 border-amber-200',
  CANCELLED: 'bg-slate-100 text-slate-500 border-slate-200',
  ARCHIVED: 'bg-slate-100 text-slate-500 border-slate-200',
  FAILED: 'bg-red-50 text-red-700 border-red-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, className }) => {
  const normalizedKey = status.toUpperCase().replace(/\s+/g, '_');
  const style = statusColorMap[normalizedKey] || 'bg-slate-100 text-slate-700 border-slate-200';
  const displayLabel = label || status.replace(/_/g, ' ');

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize tracking-wide select-none',
        style,
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {displayLabel.toLowerCase()}
    </span>
  );
};
