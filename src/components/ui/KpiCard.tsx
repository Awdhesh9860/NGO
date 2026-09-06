import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface KpiCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    timeframe?: string;
    isPositive?: boolean;
  };
  icon?: React.ReactNode;
  subtitle?: string;
  badge?: string;
  className?: string;
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  change,
  icon,
  subtitle,
  badge,
  className,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-md hover:border-slate-300',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
          {title}
        </span>
        {icon && (
          <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
        {badge && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {badge}
          </span>
        )}
      </div>

      {(change || subtitle) && (
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-xs">
          {change && (
            <div
              className={cn(
                'flex items-center gap-1 font-bold text-[11px]',
                change.value > 0 && (change.isPositive ?? true)
                  ? 'text-emerald-600'
                  : change.value < 0
                  ? 'text-red-600'
                  : 'text-slate-500'
              )}
            >
              {change.value > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : change.value < 0 ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
              <span>{Math.abs(change.value)}%</span>
            </div>
          )}
          {subtitle && (
            <span className="text-slate-400 text-[11px] truncate">
              {subtitle || (change?.timeframe ? `vs ${change.timeframe}` : '')}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
