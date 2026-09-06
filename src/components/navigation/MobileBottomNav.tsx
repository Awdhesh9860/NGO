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
  const isVolunteer = currentView === 'volunteers';

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 shadow-[0_-4px_25px_rgba(0,0,0,0.4)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="grid grid-cols-5 items-center h-16 px-1 max-w-md mx-auto">
        
        {/* 1. Home */}
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center h-full w-full py-1 min-h-[48px] cursor-pointer transition active:scale-95 ${
            isHome ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Go to Home"
        >
          <Home className={`h-5 w-5 ${isHome ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-1 tracking-tight">Home</span>
          {isHome && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-0.5" />}
        </button>

        {/* 2. Causes / Programs */}
        <button
          type="button"
          onClick={() => onNavigate('programs')}
          className={`flex flex-col items-center justify-center h-full w-full py-1 min-h-[48px] cursor-pointer transition active:scale-95 ${
            isCauses ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Explore Causes"
        >
          <GraduationCap className={`h-5 w-5 ${isCauses ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-1 tracking-tight">Causes</span>
          {isCauses && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-0.5" />}
        </button>

        {/* 3. Primary Center Donate Action (Raised Heart Button) */}
        <div className="flex flex-col items-center justify-center -mt-5">
          <button
            type="button"
            onClick={onOpenDonate}
            className="flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/40 border-2 border-slate-900 active:scale-90 transition cursor-pointer hover:shadow-emerald-500/60"
            aria-label="Donate Now"
          >
            <Heart className="h-6 w-6 fill-white" />
          </button>
          <span className="text-[10px] font-extrabold text-emerald-400 mt-1 tracking-wide uppercase">
            Donate
          </span>
        </div>

        {/* 4. Volunteer */}
        <button
          type="button"
          onClick={() => onNavigate('volunteers')}
          className={`flex flex-col items-center justify-center h-full w-full py-1 min-h-[48px] cursor-pointer transition active:scale-95 ${
            isVolunteer ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Volunteer"
        >
          <HandHeart className={`h-5 w-5 ${isVolunteer ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-1 tracking-tight">Volunteer</span>
          {isVolunteer && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-0.5" />}
        </button>

        {/* 5. Menu / Drawer Trigger */}
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center h-full w-full py-1 min-h-[48px] text-slate-400 hover:text-slate-200 cursor-pointer transition active:scale-95"
          aria-label="Open full menu"
        >
          <Menu className="h-5 w-5 stroke-2" />
          <span className="text-[10px] mt-1 tracking-tight">Menu</span>
        </button>

      </div>
    </nav>
  );
};
