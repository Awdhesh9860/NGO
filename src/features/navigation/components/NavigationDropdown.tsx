'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { PublicNavGroupSection } from '../config/public-navigation';
import { NavigationGroup } from './NavigationGroup';
import { NavigationItem } from './NavigationItem';

export interface NavigationDropdownProps {
  id: string;
  groups: PublicNavGroupSection[];
  isOpen: boolean;
  currentView: string;
  pathname?: string | null;
  align?: 'left' | 'center' | 'right';
  featuredAction?: {
    label: string;
    view: string;
    href: string;
  };
  onSelect: (view: string, subId?: string) => void;
}

/**
 * Viewport-safe accessible dropdown menu supporting single-column and 2-column categorized layouts.
 */
export const NavigationDropdown: React.FC<NavigationDropdownProps> = ({
  id,
  groups,
  isOpen,
  currentView,
  pathname,
  align = 'left',
  featuredAction,
  onSelect,
}) => {
  if (!isOpen) return null;

  const isMultiColumn = groups.length > 1;
  const alignClass =
    align === 'right'
      ? 'right-0'
      : align === 'center'
      ? 'left-1/2 -translate-x-1/2'
      : 'left-0';

  const widthClass = isMultiColumn
    ? 'w-[580px] max-w-[calc(100vw-2rem)]'
    : 'w-[320px] max-w-[calc(100vw-2rem)]';

  return (
    <div
      id={`nav-dropdown-${id}`}
      role="menu"
      aria-label={`${id} navigation menu`}
      className={`absolute top-full mt-2 ${alignClass} ${widthClass} z-50 rounded-2xl border border-slate-200/90 dark:border-[#1d332b] bg-white/98 dark:bg-[#10201a]/98 p-3 shadow-2xl shadow-slate-900/10 dark:shadow-black/50 backdrop-blur-xl animate-in fade-in slide-in-from-top-1 duration-150 motion-reduce:animate-none`}
    >
      <div
        className={`grid gap-4 max-h-[70vh] overflow-y-auto pr-0.5 ${
          isMultiColumn ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {groups.map((group) => (
          <NavigationGroup key={group.id} id={group.id} title={group.title}>
            {group.items.map((leaf) => {
              const active =
                currentView === leaf.view ||
                Boolean(
                  pathname &&
                    leaf.href !== '/' &&
                    (pathname === leaf.href || pathname.startsWith(`${leaf.href}/`))
                );
              return (
                <NavigationItem
                  key={leaf.id}
                  label={leaf.label}
                  description={leaf.description}
                  iconName={leaf.iconName}
                  badge={leaf.badge}
                  highlight={leaf.highlight}
                  isActive={active}
                  onClick={() => onSelect(leaf.view, leaf.subId)}
                />
              );
            })}
          </NavigationGroup>
        ))}
      </div>

      {featuredAction && (
        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-[#1d332b]">
          <button
            type="button"
            role="menuitem"
            onClick={() => onSelect(featuredAction.view)}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-[#087F5B] dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
          >
            <span>{featuredAction.label}</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0" />
          </button>
        </div>
      )}
    </div>
  );
};
