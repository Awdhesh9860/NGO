import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
    label?: string;
  };
  variant?: 'default' | 'emerald' | 'dark';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  className = ''
}) => {
  const variantStyles = {
    default: 'bg-white border-slate-200/80 text-slate-900',
    emerald: 'bg-emerald-950 border-emerald-900 text-white',
    dark: 'bg-slate-900 border-slate-800 text-white'
  };

  const iconBgStyles = {
    default: 'bg-slate-100 text-slate-700',
    emerald: 'bg-emerald-500/20 text-emerald-300',
    dark: 'bg-white/10 text-white'
  };

  return (
    <div
      className={`rounded-3xl border p-6 shadow-xs flex flex-col justify-between space-y-4 ${variantStyles[variant]} ${className}`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-bold uppercase tracking-wider ${
            variant === 'default' ? 'text-slate-500' : 'text-slate-400'
          }`}
        >
          {title}
        </span>
        {icon && (
          <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${iconBgStyles[variant]}`}>
            {icon}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-2xl sm:text-3xl font-black tracking-tight">{value}</h3>
        {subtitle && (
          <p
            className={`mt-1 text-xs ${
              variant === 'default' ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>

      {trend && (
        <div className="flex items-center gap-1.5 pt-1 text-xs font-semibold">
          {trend.isPositive ? (
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-rose-500" />
          )}
          <span className={trend.isPositive ? 'text-emerald-500' : 'text-rose-500'}>
            {trend.value}
          </span>
          {trend.label && (
            <span className={variant === 'default' ? 'text-slate-400' : 'text-slate-500'}>
              {trend.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
