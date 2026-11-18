import React from 'react';
import { cn } from '../../lib/utils';
import { Breadcrumb } from './Breadcrumb';

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badge,
  breadcrumbs,
  actions,
  className,
}) => {
  return (
    <div className={cn('space-y-4 pb-6 pt-2 border-b border-slate-200/80 dark:border-slate-800', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb items={breadcrumbs} className="mb-2" />
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {badge && (
            <span className="inline-block rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-2">
              {badge}
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
