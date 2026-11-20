import React from 'react';
import {
  Home,
  GraduationCap,
  Heart,
  HandHeart,
  Menu
} from 'lucide-react';

interface MobileBottomNavProps {
  currentView: string;
  onNavigate: (view: string, id?: string) => void;
  onOpenDonate: () => void;
  onOpenMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onNavigate,
  onOpenDonate,
  onOpenMenu
}) => {
  const isHome = currentView === 'home';
  const isCauses = currentView === 'programs';
  const isVolunteer = currentView === 'volunteers' || currentView === 'volunteer';

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 dark:bg-[#0e1b16]/95 backdrop-blur-xl border-t border-slate-200 dark:border-[#1d332b] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.4)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="grid grid-cols-5 items-center h-16 px-1 max-w-md mx-auto">
        
        {/* 1. Home */}
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center h-full w-full py-1 min-h-[48px] cursor-pointer transition active:scale-95 ${
            isHome
              ? 'text-[#087F5B] dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          aria-label="Go to Home"
          aria-current={isHome ? 'page' : undefined}
        >
          <Home className={`h-5 w-5 ${isHome ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-1 tracking-tight">Home</span>
          {isHome && <span className="w-1.5 h-1.5 rounded-full bg-[#087F5B] dark:bg-emerald-400 mt-0.5" />}
        </button>

        {/* 2. Programs */}
        <button
          type="button"
          onClick={() => onNavigate('programs')}
          className={`flex flex-col items-center justify-center h-full w-full py-1 min-h-[48px] cursor-pointer transition active:scale-95 ${
            isCauses
              ? 'text-[#087F5B] dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          aria-label="Explore Programs"
          aria-current={isCauses ? 'page' : undefined}
        >
          <GraduationCap className={`h-5 w-5 ${isCauses ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-1 tracking-tight">Programs</span>
          {isCauses && <span className="w-1.5 h-1.5 rounded-full bg-[#087F5B] dark:bg-emerald-400 mt-0.5" />}
        </button>

        {/* 3. Primary Center Donate Action (Raised Heart Button) */}
        <div className="flex flex-col items-center justify-center -mt-5">
          <button
            type="button"
            onClick={onOpenDonate}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-[#087F5B] via-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-600/30 border-2 border-white dark:border-[#0e1b16] active:scale-90 transition cursor-pointer"
            aria-label="Donate Now"
          >
            <Heart className="h-5 w-5 fill-white" />
          </button>
          <span className="text-[10px] font-extrabold text-[#087F5B] dark:text-emerald-400 mt-1 tracking-wide uppercase">
            Donate
          </span>
        </div>

        {/* 4. Volunteer */}
        <button
          type="button"
          onClick={() => onNavigate('volunteer')}
          className={`flex flex-col items-center justify-center h-full w-full py-1 min-h-[48px] cursor-pointer transition active:scale-95 ${
            isVolunteer
              ? 'text-[#087F5B] dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          aria-label="Volunteer"
          aria-current={isVolunteer ? 'page' : undefined}
        >
          <HandHeart className={`h-5 w-5 ${isVolunteer ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-1 tracking-tight">Volunteer</span>
          {isVolunteer && <span className="w-1.5 h-1.5 rounded-full bg-[#087F5B] dark:bg-emerald-400 mt-0.5" />}
        </button>

        {/* 5. Menu / Drawer Trigger */}
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center h-full w-full py-1 min-h-[48px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer transition active:scale-95"
          aria-label="Open full menu"
        >
          <Menu className="h-5 w-5 stroke-2" />
          <span className="text-[10px] mt-1 tracking-tight">Menu</span>
        </button>

      </div>
    </nav>
  );
};
