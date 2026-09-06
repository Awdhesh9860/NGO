import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DesktopNavigation } from './DesktopNavigation';
import { MobileMenu } from './MobileMenu';
import { LanguageSelector } from './LanguageSelector';
import { DonateButton } from './DonateButton';
import {
  Heart,
  Search,
  Menu,
  ShieldCheck,
  Award,
  User,
  LogOut,
  LayoutDashboard,
  Sparkles,
  ChevronDown
} from 'lucide-react';

export interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, id?: string) => void;
  onOpenDonate: (campaignId?: string) => void;
  onOpenSearch?: () => void;
  onSearchClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenDonate,
  onOpenSearch,
  onSearchClick
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { currentUser, openAuthModal, openProfileModal, logout } = useAuth();

  const triggerSearch = onOpenSearch || onSearchClick || (() => {});

  // Scroll listener with passive flag for high performance
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 20);
    };

    handleScroll(); // Initial check
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Global keyboard shortcut: Cmd+K / Ctrl+K opens Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        triggerSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerSearch]);

  const handleBrandClick = () => {
    onNavigate('home');
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <header
      id="main-app-header"
      className={`sticky top-0 z-40 w-full transition-all duration-300 ease-in-out ${
        isScrolled
          ? 'bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 shadow-lg shadow-black/20 text-slate-100'
          : 'bg-slate-950/25 backdrop-blur-md border-b border-white/10 text-white'
      }`}
    >
      {/* Top Utility & Trust Bar (visible when scrolled to top, collapses gently on scroll) */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isScrolled
            ? 'max-h-0 opacity-0 pointer-events-none py-0'
            : 'max-h-12 opacity-100 py-1.5 border-b border-white/10 bg-slate-950/40'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 text-xs">
          {/* Emergency Alert Headline */}
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping shrink-0" />
            <span className="font-extrabold text-amber-400 uppercase text-[10px] tracking-wider shrink-0">
              Emergency Appeal:
            </span>
            <button
              onClick={() => onNavigate('campaign-detail', 'camp-1')}
              className="hover:underline text-slate-200 hover:text-white font-medium cursor-pointer truncate text-[11px]"
            >
              Rebuilding 500 Submerged Village Homes — Direct Relief Ops Active
            </button>
          </div>

          {/* Trust badges and Quick Links */}
          <div className="hidden md:flex items-center gap-4 text-[11px] shrink-0 text-slate-300">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" /> 80G & 501(c)(3) Tax Exempt
            </span>
            <span className="text-white/20">|</span>
            <button
              onClick={() => onNavigate('verify-certificate')}
              className="flex items-center gap-1 hover:text-white transition cursor-pointer"
            >
              <Award className="h-3.5 w-3.5 text-amber-400" /> Verify Certificate
            </button>
            <span className="text-white/20">|</span>
            <span className="text-slate-400">Gov. Reg: #MH/2019/NGO/0842</span>
          </div>
        </div>
      </div>

      {/* Primary Navigation Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 h-[68px] sm:h-[72px] lg:h-[76px]">
        {/* Left: NGO Logo */}
        <div
          id="header-brand-logo"
          onClick={handleBrandClick}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none shrink-0"
        >
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 via-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-950/40 group-hover:scale-105 group-hover:shadow-emerald-600/30 transition-all duration-200 border border-emerald-400/30">
            <Heart className="h-5 w-5 sm:h-5.5 sm:w-5.5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg sm:text-xl font-black tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                HopeHorizon
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-extrabold text-emerald-300 uppercase tracking-wide border border-emerald-500/40">
                80G NGO
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] font-medium text-slate-300/80 tracking-tight leading-none mt-0.5">
              Empowering Communities &bull; Transparent Action
            </p>
          </div>
        </div>

        {/* Center: Primary Desktop Navigation */}
        <DesktopNavigation
          currentView={currentView}
          onNavigate={onNavigate}
          isScrolled={isScrolled}
        />

        {/* Right: Actions (Search, Language, User/Auth, Donate Now, Mobile Toggle) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Search Trigger */}
          <button
            type="button"
            onClick={triggerSearch}
            aria-label="Open Search (⌘K)"
            title="Search projects, programs, reports (⌘K)"
            className={`hidden sm:flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 cursor-pointer border ${
              isScrolled
                ? 'border-slate-700/60 bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-700/70'
                : 'border-white/20 bg-black/25 text-white/90 hover:text-white hover:bg-black/40 backdrop-blur-md'
            } focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-400`}
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Language Selector */}
          <div className="hidden sm:block">
            <LanguageSelector isScrolled={isScrolled} />
          </div>

          {/* User Profile or Portal Button */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold border transition cursor-pointer ${
                  isScrolled
                    ? 'border-slate-700 bg-slate-800 text-slate-200'
                    : 'border-white/20 bg-black/25 text-white'
                }`}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-[10px]">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="hidden md:inline max-w-[80px] truncate text-[11px]">
                  {currentUser.name.split(' ')[0]}
                </span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-700 bg-slate-900/95 p-1.5 text-slate-200 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-slate-800 text-xs">
                    <p className="font-bold text-white truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-emerald-400 uppercase font-semibold">
                      {currentUser.role}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onNavigate('dashboard');
                    }}
                    className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5 text-emerald-400" />
                    <span>My Portal Dashboard</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      openProfileModal();
                    }}
                    className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                  >
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span>Profile & Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs hover:bg-red-950/40 text-red-400 hover:text-red-300 transition cursor-pointer border-t border-slate-800/80 mt-1"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className={`hidden md:inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer border ${
                isScrolled
                  ? 'border-slate-700/60 bg-slate-800/60 text-slate-200 hover:bg-slate-700/70 hover:text-white'
                  : 'border-white/20 bg-black/25 text-white/90 hover:bg-black/40 hover:text-white backdrop-blur-md'
              }`}
            >
              <User className="h-3 w-3" />
              <span>Sign In</span>
            </button>
          )}

          {/* Strong Donate CTA Button */}
          <DonateButton
            isScrolled={isScrolled}
            onClick={() => onOpenDonate()}
            className="hidden sm:inline-flex"
          />

          {/* Mobile Hamburger Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-expanded={mobileMenuOpen}
            aria-label="Open mobile navigation drawer"
            className={`flex lg:hidden h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 cursor-pointer border ${
              isScrolled
                ? 'border-slate-700/80 bg-slate-800/80 text-white'
                : 'border-white/20 bg-black/30 text-white backdrop-blur-md'
            } focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-400`}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        currentView={currentView}
        onNavigate={onNavigate}
        onOpenDonate={() => onOpenDonate()}
        onOpenSearch={triggerSearch}
      />
    </header>
  );
};
