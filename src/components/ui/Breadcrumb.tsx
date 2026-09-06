import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  showHomeIcon?: boolean;
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  showHomeIcon = true,
  className,
}) => {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center text-xs text-slate-500', className)}>
      <ol className="flex items-center space-x-1.5 sm:space-x-2">
        {showHomeIcon && (
          <li>
            <div className="flex items-center text-slate-400">
              <Home className="h-3.5 w-3.5" />
            </div>
          </li>
        )}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center space-x-1.5 sm:space-x-2">
              {(showHomeIcon || index > 0) && (
                <ChevronRight className="h-3 w-3 text-slate-300 shrink-0" />
              )}
              {isLast ? (
                <span className="font-semibold text-slate-800 truncate max-w-[200px]" aria-current="page">
                  {item.label}
                </span>
              ) : item.onClick ? (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="hover:text-emerald-600 transition truncate max-w-[150px]"
                >
                  {item.label}
                </button>
              ) : item.href ? (
                <a href={item.href} className="hover:text-emerald-600 transition truncate max-w-[150px]">
                  {item.label}
                </a>
              ) : (
                <span className="truncate max-w-[150px]">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
