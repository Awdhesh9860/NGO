'use client';

import React, { useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  PublicPrimaryNavItem,
  isPublicNavItemActive,
} from '../config/public-navigation';
import { NAV_TOKENS } from '../config/tokens';
import { NavigationDropdown } from './NavigationDropdown';
import { MoreNavigationDropdown } from './MoreNavigationDropdown';

export interface PrimaryNavigationProps {
  visibleItems: PublicPrimaryNavItem[];
  overflowItems: PublicPrimaryNavItem[];
  showOverflowDropdown: boolean;
  currentView: string;
  pathname?: string | null;
  activeDropdownId: string | null;
  setActiveDropdownId: (id: string | null) => void;
  onNavigate: (view: string, subId?: string) => void;
}

export const PrimaryNavigation: React.FC<PrimaryNavigationProps> = ({
  visibleItems,
  overflowItems,
  showOverflowDropdown,
  currentView,
  pathname,
  activeDropdownId,
  setActiveDropdownId,
  onNavigate,
}) => {
  const navRef = useRef<HTMLElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdownId(null);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, [setActiveDropdownId]);

  if (visibleItems.length === 0 && (!showOverflowDropdown || overflowItems.length === 0)) {
    return null;
  }

  const handleSelect = (view: string, subId?: string) => {
    onNavigate(view, subId);
    setActiveDropdownId(null);
  };

  return (
    <nav
      ref={navRef}
      aria-label="Primary Navigation"
      className="hidden md:flex items-center justify-center gap-0.5 xl:gap-1 min-w-0"
    >
      {visibleItems.map((item) => {
        const isActive = isPublicNavItemActive(item, currentView, pathname);
        const isOpen = activeDropdownId === item.id;

        if (item.type === 'link' && item.view) {
          return (
            <button
              key={item.id}
              type="button"
              id={`nav-item-${item.id}`}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => handleSelect(item.view!)}
              className={`${NAV_TOKENS.primaryItemClass} relative cursor-pointer ${
                isActive
                  ? 'bg-emerald-50 text-[#087F5B] font-bold dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-[#172b22] dark:hover:text-white'
              }`}
            >
              <span>{item.label}</span>
              {isActive && (
                <span className="absolute bottom-1 left-3 right-3 h-0.5 rounded-full bg-[#087F5B] dark:bg-emerald-400" />
              )}
            </button>
          );
        }

        return (
          <div
            key={item.id}
            className="relative"
            onMouseEnter={() => {
              if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
              setActiveDropdownId(item.id);
            }}
            onMouseLeave={() => {
              closeTimerRef.current = setTimeout(() => {
                setActiveDropdownId(null);
              }, 140);
            }}
          >
            <button
              type="button"
              id={`nav-item-${item.id}`}
              aria-haspopup="menu"
              aria-expanded={isOpen}
              onClick={() => setActiveDropdownId(isOpen ? null : item.id)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setActiveDropdownId(item.id);
                }
              }}
              className={`${NAV_TOKENS.primaryItemClass} relative cursor-pointer ${
                isActive || isOpen
                  ? 'bg-emerald-50 text-[#087F5B] font-bold dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-[#172b22] dark:hover:text-white'
              }`}
            >
              <span>{item.label}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 shrink-0 opacity-70 transition-transform duration-150 motion-reduce:transition-none ${
                  isOpen ? 'rotate-180 text-[#087F5B] dark:text-emerald-400' : ''
                }`}
              />
              {isActive && (
                <span className="absolute bottom-1 left-3 right-3 h-0.5 rounded-full bg-[#087F5B] dark:bg-emerald-400" />
              )}
            </button>

            <NavigationDropdown
              id={item.id}
              groups={item.groups || []}
              isOpen={isOpen}
              currentView={currentView}
              pathname={pathname}
              align={item.align || 'left'}
              featuredAction={item.featuredAction}
              onSelect={handleSelect}
            />
          </div>
        );
      })}

      {showOverflowDropdown && overflowItems.length > 0 && (
        <MoreNavigationDropdown
          items={overflowItems}
          isOpen={activeDropdownId === '__more__'}
          onToggle={() =>
            setActiveDropdownId(activeDropdownId === '__more__' ? null : '__more__')
          }
          onOpen={() => {
            if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
            setActiveDropdownId('__more__');
          }}
          onClose={() => setActiveDropdownId(null)}
          currentView={currentView}
          pathname={pathname}
          onSelect={handleSelect}
        />
      )}
    </nav>
  );
};
