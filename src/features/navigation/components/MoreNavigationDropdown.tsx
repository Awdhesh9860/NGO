'use client';

import React, { useRef } from 'react';
import { ChevronDown, MoreHorizontal } from 'lucide-react';
import { PublicPrimaryNavItem, isPublicNavItemActive } from '../config/public-navigation';
import { NAV_TOKENS } from '../config/tokens';
import { NavigationGroup } from './NavigationGroup';
import { NavigationItem } from './NavigationItem';

export interface MoreNavigationDropdownProps {
  items: PublicPrimaryNavItem[];
  isOpen: boolean;
  onToggle: () => void;
  onOpen: () => void;
  onClose: () => void;
  currentView: string;
  pathname?: string | null;
  onSelect: (view: string, subId?: string) => void;
}

/**
 * Intelligent `More` overflow menu for Small Laptop / Tablet widths where
 * secondary top-level items automatically collapse to keep the navbar single-row & clutter-free.
 */
export const MoreNavigationDropdown: React.FC<MoreNavigationDropdownProps> = ({
  items,
  isOpen,
  onToggle,
  onOpen,
  onClose,
  currentView,
  pathname,
  onSelect,
}) => {
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (items.length === 0) return null;

  const hasActiveChild = items.some((item) => isPublicNavItemActive(item, currentView, pathname));

  const handleMouseEnter = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    onOpen();
  };

  const handleMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      onClose();
    }, 140);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        id="nav-item-more"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={onToggle}
        className={`${NAV_TOKENS.primaryItemClass} cursor-pointer ${
          hasActiveChild || isOpen
            ? 'bg-emerald-50 text-[#087F5B] font-bold dark:bg-emerald-950/60 dark:text-emerald-300'
            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-[#172b22] dark:hover:text-white'
        }`}
      >
        <MoreHorizontal className="h-4 w-4 shrink-0" />
        <span>More</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 opacity-70 transition-transform duration-150 motion-reduce:transition-none ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          id="nav-dropdown-more"
          role="menu"
          aria-label="More navigation destinations"
          className="absolute right-0 top-full mt-2 w-[540px] max-w-[calc(100vw-2rem)] z-50 rounded-2xl border border-slate-200/90 dark:border-[#1d332b] bg-white/98 dark:bg-[#10201a]/98 p-3.5 shadow-2xl shadow-slate-900/10 dark:shadow-black/50 backdrop-blur-xl animate-in fade-in slide-in-from-top-1 duration-150 motion-reduce:animate-none"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-0.5">
            {items.map((item) => {
              if (item.type === 'link' && item.view) {
                return (
                  <NavigationGroup key={item.id} id={`more-${item.id}`} title={item.label}>
                    <NavigationItem
                      label={item.label}
                      description={`Go directly to ${item.label}`}
                      iconName="Compass"
                      isActive={isPublicNavItemActive(item, currentView, pathname)}
                      onClick={() => {
                        onSelect(item.view!);
                        onClose();
                      }}
                    />
                  </NavigationGroup>
                );
              }

              return (
                <div key={item.id} className="space-y-3">
                  {(item.groups || []).map((group) => (
                    <NavigationGroup key={group.id} id={`more-${group.id}`} title={group.title}>
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
                            onClick={() => {
                              onSelect(leaf.view, leaf.subId);
                              onClose();
                            }}
                          />
                        );
                      })}
                    </NavigationGroup>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
