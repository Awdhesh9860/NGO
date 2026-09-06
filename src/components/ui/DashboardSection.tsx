import React from 'react';
import { cn } from '../../lib/utils';

export interface DashboardSectionProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  title,
  description,
  action,
  children,
  className,
}) => {
  return (
    <section className={cn('space-y-4', className)}>
      {(title || description || action) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            {title && <h2 className="text-base font-bold text-slate-900 tracking-tight">{title}</h2>}
            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div>{children}</div>
    </section>
  );
};
