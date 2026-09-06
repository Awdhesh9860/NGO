import React from 'react';
import { cn, formatDate } from '../../lib/utils';

export interface ActivityItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string | Date;
  icon?: React.ReactNode;
  badge?: string;
  badgeVariant?: 'emerald' | 'amber' | 'blue' | 'slate';
}

export interface ActivityListProps {
  items: ActivityItem[];
  emptyMessage?: string;
  className?: string;
}

export const ActivityList: React.FC<ActivityListProps> = ({
  items,
  emptyMessage = 'No recent activities found',
  className,
}) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-slate-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn('flow-root', className)}>
      <ul className="-mb-6">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.id}>
              <div className="relative pb-6">
                {!isLast && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-100"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start space-x-3">
                  <div className="relative">
                    <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 shadow-2xs">
                      {item.icon || <div className="h-2 w-2 rounded-full bg-emerald-500" />}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{item.title}</p>
                      {item.description && (
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 whitespace-nowrap text-[10px] text-slate-400 shrink-0">
                      {item.badge && (
                        <span className="font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {item.badge}
                        </span>
                      )}
                      <time>{formatDate(item.timestamp, 'relative')}</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
