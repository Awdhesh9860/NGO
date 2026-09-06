import React from 'react';
import {
  Compass,
  BookOpen,
  Eye,
  ShieldCheck,
  HeartHandshake,
  Users,
  Award,
  Layers,
  ChevronRight
} from 'lucide-react';

interface AboutSubNavProps {
  currentSubPage?: string;
  onNavigate: (view: string, id?: string) => void;
}

export const AboutSubNav: React.FC<AboutSubNavProps> = ({ currentSubPage = 'overview', onNavigate }) => {
  const navItems = [
    { id: 'overview', view: 'about', label: 'About Overview', icon: Layers },
    { id: 'story', view: 'about-story', label: 'Our Story', icon: BookOpen },
    { id: 'mission-vision', view: 'about-mission-vision', label: 'Mission & Vision', icon: Eye },
    { id: 'values', view: 'about-values', label: 'Our Values', icon: ShieldCheck },
    { id: 'founder', view: 'about-founder', label: 'Founder Message', icon: HeartHandshake },
    { id: 'leadership', view: 'about-leadership', label: 'Leadership', icon: Users },
    { id: 'board', view: 'about-board', label: 'Board Members', icon: Users },
    { id: 'team', view: 'about-team', label: 'Our Team', icon: Users },
    { id: 'awards', view: 'about-awards', label: 'Awards & Recognition', icon: Award }
  ];

  return (
    <nav aria-label="About section subnavigation" className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-16 z-30 shadow-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1.5 overflow-x-auto py-3 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSubPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.view)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
