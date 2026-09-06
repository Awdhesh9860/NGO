import React from 'react';
import { cn } from '../../lib/utils';
import { Spinner } from './Spinner';

export interface ChartContainerProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  isLoading?: boolean;
  minHeight?: string;
  className?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  action,
  children,
  isLoading = false,
  minHeight = 'min-h-[280px]',
  className,
}) => {
  return (
    <div
      className={cn(
        'p-5 sm:p-6 rounded-2xl border border-slate-200/80 bg-white shadow-xs flex flex-col',
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      <div className={cn('relative flex-1 flex items-center justify-center', minHeight)}>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-xs z-10">
            <Spinner size="md" label="Loading analytics..." />
          </div>
        ) : (
          <div className="w-full h-full">{children}</div>
        )}
      </div>
    </div>
  );
};
