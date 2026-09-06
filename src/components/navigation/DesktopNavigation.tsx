import React, { useState, useEffect, useRef } from 'react';
import { NAVIGATION_CONFIG } from './navConfig';
import { NavItem } from './NavItem';

interface DesktopNavigationProps {
  currentView: string;
  onNavigate: (view: string, id?: string) => void;
  isScrolled: boolean;
}

export const DesktopNavigation: React.FC<DesktopNavigationProps> = ({
  currentView,
  onNavigate,
  isScrolled
}) => {
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdownId(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <nav
      ref={navRef}
      aria-label="Primary Navigation"
      className="hidden lg:flex items-center gap-1 xl:gap-1.5"
    >
      {NAVIGATION_CONFIG.map((item) => (
        <NavItem
          key={item.id}
          item={item}
          currentView={currentView}
          onNavigate={onNavigate}
          isScrolled={isScrolled}
          activeDropdownId={activeDropdownId}
          setActiveDropdownId={setActiveDropdownId}
        />
      ))}
    </nav>
  );
};
