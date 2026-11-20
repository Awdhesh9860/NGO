'use client';

import React from 'react';
import { NavIcon } from '@/components/navigation/NavIcon';
import { NAV_TOKENS } from '../config/tokens';

export interface NavigationItemProps {
  label: string;
  description?: string;
  iconName?: string;
  badge?: string;
  highlight?: boolean;
  isActive?: boolean;
  onClick: () => void;
  variant?: 'dropdown' | 'drawer';
  role?: 'menuitem' | 'button';
}

export const NavigationItem: React.FC<NavigationItemProps> = ({
  label,
  description,
  iconName,
  badge,
  highlight = false,
  isActive = false,
  onClick,
  variant = 'dropdown',
  role = 'menuitem',
}) => {
  const isDrawer = variant === 'drawer';

  return (
    <button
      type="button"
      role={role === 'menuitem' ? 'menuitem' : undefined}
      aria-current={isActive ? 'page' : undefined}
      onClick={onClick}
      className={`group flex w-full items-start gap-2.5 rounded-xl text-left transition-colors duration-150 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#087F5B] dark:focus-visible:ring-emerald-400 ${
        isDrawer ? 'px-3 py-2.5 min-h-[44px]' : 'p-2.5'
      } ${
        isActive
          ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200'
          : highlight
          ? 'bg-emerald-50/60 border border-emerald-200/80 hover:bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800/60 dark:hover:bg-emerald-950/50 text-slate-900 dark:text-white'
          : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-[#172b22] dark:hover:text-white'
      }`}
    >
      {iconName && (
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
            isActive || highlight
              ? 'bg-[#087F5B]/15 text-[#087F5B] dark:bg-emerald-500/20 dark:text-emerald-300'
              : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-[#087F5B] dark:bg-[#162922] dark:text-slate-400 dark:group-hover:bg-[#1d352c] dark:group-hover:text-emerald-300'
          }`}
        >
          <NavIcon name={iconName} className={NAV_TOKENS.iconSizeClass} />
        </span>
      )}

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span
            className={`text-[13px] leading-snug tracking-tight truncate ${
              isActive
                ? 'font-bold text-[#087F5B] dark:text-emerald-300'
                : 'font-semibold text-slate-900 dark:text-slate-100 group-hover:text-[#087F5B] dark:group-hover:text-emerald-300'
            }`}
          >
            {label}
          </span>
          {badge && (
            <span className="shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
              {badge}
            </span>
          )}
        </span>
        {description && (
          <span className="mt-0.5 block text-[11px] leading-snug text-slate-500 dark:text-slate-400 line-clamp-1">
            {description}
          </span>
        )}
      </span>
    </button>
  );
};
