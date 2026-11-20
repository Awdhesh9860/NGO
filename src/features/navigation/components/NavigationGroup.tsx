'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface NavigationGroupProps {
  id: string;
  title: string;
  badgeCount?: number;
  collapsible?: boolean;
  isOpen?: boolean;
  isActive?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
}

/**
 * Reusable NavigationGroup used inside desktop dropdown columns,
 * mobile navigation drawer accordions, and role-based dashboard sidebars.
 */
export const NavigationGroup: React.FC<NavigationGroupProps> = ({
  id,
  title,
  badgeCount,
  collapsible = false,
  isOpen = true,
  isActive = false,
  onToggle,
  children,
}) => {
  if (!collapsible) {
    return (
      <div className="space-y-1.5" role="group" aria-labelledby={`nav-group-${id}`}>
        <div
          id={`nav-group-${id}`}
          className="px-2.5 pb-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
        >
          {title}
        </div>
        <div className="space-y-0.5">{children}</div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border transition-colors ${
        isActive
          ? 'border-emerald-200 bg-emerald-50/30 dark:border-emerald-900/60 dark:bg-emerald-950/20'
          : 'border-slate-200/80 bg-white dark:border-[#1d332b] dark:bg-[#12221b]'
      }`}
    >
      <button
        type="button"
        id={`nav-group-trigger-${id}`}
        aria-expanded={isOpen}
        aria-controls={`nav-group-panel-${id}`}
        onClick={onToggle}
        className="flex w-full min-h-[44px] items-center justify-between gap-2 px-3.5 py-2.5 text-left text-xs font-bold tracking-tight text-slate-800 dark:text-slate-100 hover:text-[#087F5B] dark:hover:text-emerald-300 transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#087F5B] rounded-xl"
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="truncate">{title}</span>
          {badgeCount !== undefined && badgeCount > 0 && (
            <span className="rounded-full bg-slate-100 dark:bg-[#1b3129] px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
              {badgeCount}
            </span>
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-150 motion-reduce:transition-none ${
            isOpen ? 'rotate-180 text-[#087F5B] dark:text-emerald-400' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          id={`nav-group-panel-${id}`}
          role="region"
          aria-labelledby={`nav-group-trigger-${id}`}
          className="border-t border-slate-100 dark:border-[#1d332b] px-2 py-2 space-y-1"
        >
          {children}
        </div>
      )}
    </div>
  );
};
