import React, { useState, useEffect } from 'react';
import { NAVIGATION_CONFIG } from './navConfig';
import { NavIcon } from './NavIcon';
import { LanguageSelector } from './LanguageSelector';
import { DonateButton } from './DonateButton';
import {
  X,
  ChevronDown,
  ChevronRight,
  Search,
  Phone,
  Mail,
  ShieldCheck,
  Heart,
  ArrowRight
} from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onNavigate: (view: string, id?: string) => void;
  onOpenDonate: () => void;
  onOpenSearch?: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  currentView,
  onNavigate,
  onOpenDonate,
  onOpenSearch
}) => {
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  // Background scroll lock when mobile menu is active
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  const handleNavClick = (view: string, subId?: string) => {
    onNavigate(view, subId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
        className="fixed inset-y-0 right-0 w-full max-w-sm sm:max-w-md bg-slate-950 text-slate-100 shadow-2xl border-l border-slate-800 flex flex-col z-50 animate-in slide-in-from-right duration-300"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80">
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-900/40">
              <Heart className="h-4 w-4 fill-white" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-white block">
                HopeHorizon
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold block">
                80G Verified Non-Profit
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSelector isScrolled={true} />

            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation menu"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Search Bar in Mobile Menu */}
        {onOpenSearch && (
          <div className="px-5 pt-3 pb-1">
            <button
              onClick={() => {
                onClose();
                onOpenSearch();
              }}
              className="w-full flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs text-slate-400 hover:border-slate-700 hover:text-slate-200 transition cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-slate-400" />
                <span>Search programs, reports, projects...</span>
              </span>
              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
                ⌘K
              </span>
            </button>
          </div>
        )}

        {/* Scrollable Nav Accordion Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
          {NAVIGATION_CONFIG.map((item) => {
            const hasChildren =
              (item.children && item.children.length > 0) ||
              (item.megaColumns && item.megaColumns.length > 0);

            const isItemOpen = openAccordion === item.id;
            const isItemActive = currentView === item.view;

            if (!hasChildren) {
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.view || 'home')}
                  className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-colors cursor-pointer ${
                    isItemActive
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-200 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronRight className="h-4 w-4 opacity-40" />
                </button>
              );
            }

            // Accordion group
            const subItems =
              item.children ||
              (item.megaColumns
                ? item.megaColumns.flatMap((c) => c.items)
                : []);

            return (
              <div key={item.id} className="rounded-xl overflow-hidden border border-slate-900 bg-slate-900/40">
                <button
                  type="button"
                  onClick={() => toggleAccordion(item.id)}
                  aria-expanded={isItemOpen}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm font-bold transition-colors cursor-pointer ${
                    isItemOpen
                      ? 'text-emerald-400 bg-slate-900'
                      : 'text-slate-200 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isItemOpen ? 'rotate-180 text-emerald-400' : 'opacity-40'
                    }`}
                  />
                </button>

                {isItemOpen && (
                  <div className="bg-slate-950/70 px-2 py-2 space-y-1 border-t border-slate-900 animate-in fade-in slide-in-from-top-1 duration-150">
                    {subItems.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => handleNavClick(sub.view, sub.subId)}
                        className="w-full flex items-start gap-2.5 rounded-lg p-2 text-left hover:bg-slate-900 transition-colors cursor-pointer group"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-slate-400 group-hover:text-emerald-400 group-hover:bg-slate-800 transition-colors">
                          <NavIcon name={sub.iconName} className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300">
                              {sub.label}
                            </span>
                            {sub.badge && (
                              <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 text-[8px] font-bold">
                                {sub.badge}
                              </span>
                            )}
                          </div>
                          {sub.description && (
                            <p className="text-[10px] text-slate-400 line-clamp-1">
                              {sub.description}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}

                    {item.featuredAction && (
                      <button
                        onClick={() => handleNavClick(item.featuredAction!.view)}
                        className="w-full mt-1.5 flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:bg-slate-900 transition cursor-pointer"
                      >
                        <span>{item.featuredAction.label}</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile Drawer Footer: Prominent Donate CTA & Helpline */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/90 space-y-3">
          <DonateButton
            size="md"
            onClick={() => {
              onClose();
              onOpenDonate();
            }}
            className="w-full py-3 text-sm shadow-xl"
          />

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" /> 80G Tax-Deductible
            </span>
            <button
              onClick={() => handleNavClick('contact')}
              className="hover:text-white transition font-medium underline"
            >
              Need Help? Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
