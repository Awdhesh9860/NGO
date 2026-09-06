import React, { useState, useRef, useEffect } from 'react';
import { NavItemConfig } from './navConfig';
import { DropdownMenu } from './DropdownMenu';
import { MegaMenu } from './MegaMenu';
import { ChevronDown } from 'lucide-react';

interface NavItemProps {
  item: NavItemConfig;
  currentView: string;
  onNavigate: (view: string, subId?: string) => void;
  isScrolled: boolean;
  activeDropdownId: string | null;
  setActiveDropdownId: (id: string | null) => void;
}

export const NavItem: React.FC<NavItemProps> = ({
  item,
  currentView,
  onNavigate,
  isScrolled,
  activeDropdownId,
  setActiveDropdownId
}) => {
  const isDropdownOpen = activeDropdownId === item.id;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isActive =
    currentView === item.view ||
    (item.children && item.children.some((c) => c.view === currentView)) ||
    (item.megaColumns &&
      item.megaColumns.some((col) => col.items.some((sub) => sub.view === currentView)));

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (item.type !== 'link') {
      setActiveDropdownId(item.id);
    }
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      if (activeDropdownId === item.id) {
        setActiveDropdownId(null);
      }
    }, 150);
  };

  const handleClick = () => {
    if (item.type === 'link' && item.view) {
      onNavigate(item.view);
      setActiveDropdownId(null);
    } else {
      setActiveDropdownId(isDropdownOpen ? null : item.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    } else if (e.key === 'Escape') {
      setActiveDropdownId(null);
    }
  };

  const handleChildSelect = (view: string, subId?: string) => {
    onNavigate(view, subId);
    setActiveDropdownId(null);
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative"
    >
      <button
        type="button"
        id={`nav-item-${item.id}`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-haspopup={item.type !== 'link'}
        aria-expanded={isDropdownOpen}
        className={`group relative inline-flex items-center gap-1 px-3 py-2 text-xs md:text-sm font-semibold tracking-tight transition-all duration-200 cursor-pointer rounded-xl ${
          isActive
            ? isScrolled
              ? 'text-emerald-400 font-bold bg-slate-800/70'
              : 'text-white font-bold bg-white/15 backdrop-blur-md shadow-xs'
            : isScrolled
            ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            : 'text-white/90 hover:text-white hover:bg-white/10'
        } focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-400`}
      >
        <span>{item.label}</span>

        {item.type !== 'link' && (
          <ChevronDown
            className={`h-3 w-3 opacity-70 transition-transform duration-200 group-hover:opacity-100 ${
              isDropdownOpen ? 'rotate-180 text-emerald-400' : ''
            }`}
          />
        )}

        {/* Active underline indicator */}
        {isActive && (
          <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-emerald-400 animate-in fade-in duration-200" />
        )}
      </button>

      {/* Standard Dropdown */}
      {item.type === 'dropdown' && item.children && (
        <DropdownMenu
          items={item.children}
          isOpen={isDropdownOpen}
          onSelect={handleChildSelect}
          featuredAction={item.featuredAction}
          isScrolled={isScrolled}
        />
      )}

      {/* Mega Menu */}
      {item.type === 'megamenu' && item.megaColumns && (
        <MegaMenu
          columns={item.megaColumns}
          isOpen={isDropdownOpen}
          onSelect={handleChildSelect}
          featuredCard={item.featuredCard}
          featuredAction={item.featuredAction}
          isScrolled={isScrolled}
        />
      )}
    </div>
  );
};
