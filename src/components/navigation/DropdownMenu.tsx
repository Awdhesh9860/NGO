import React from 'react';
import { NavChildItem } from './navConfig';
import { NavIcon } from './NavIcon';
import { ArrowRight } from 'lucide-react';

interface DropdownMenuProps {
  items: NavChildItem[];
  isOpen: boolean;
  onSelect: (view: string, subId?: string) => void;
  featuredAction?: {
    label: string;
    view: string;
  };
  align?: 'left' | 'center' | 'right';
  isScrolled?: boolean;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  items,
  isOpen,
  onSelect,
  featuredAction,
  align = 'center',
  isScrolled = false
}) => {
  if (!isOpen) return null;

  const alignClass =
    align === 'left'
      ? 'left-0'
      : align === 'right'
      ? 'right-0'
      : 'left-1/2 -translate-x-1/2';

  return (
    <div
      role="menu"
      className={`absolute top-full mt-2.5 ${alignClass} w-80 rounded-2xl border border-slate-700/80 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200`}
    >
      {/* Decorative arrow/notch */}
      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-3 w-3 rotate-45 border-t border-l border-slate-700/80 bg-slate-900/95" />

      <div className="relative z-10 flex flex-col gap-1 max-h-[70vh] overflow-y-auto pr-1">
        {items.map((item) => (
          <button
            key={item.id}
            role="menuitem"
            onClick={() => onSelect(item.view, item.subId)}
            className={`group flex items-start gap-3 rounded-xl p-2.5 text-left transition-all duration-150 cursor-pointer ${
              item.highlight
                ? 'bg-emerald-950/40 border border-emerald-500/30 hover:bg-emerald-900/50 hover:border-emerald-500/50'
                : 'hover:bg-slate-800/80 hover:text-white text-slate-200'
            }`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                item.highlight
                  ? 'bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white'
                  : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700 group-hover:text-white'
              }`}
            >
              <NavIcon name={item.iconName} className="h-4 w-4" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                  {item.label}
                </span>
                {item.badge && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${
                      item.badge === 'Live' || item.badge === 'Urgent'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              {item.description && (
                <p className="text-[11px] text-slate-400 leading-snug line-clamp-2 mt-0.5 group-hover:text-slate-300">
                  {item.description}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>

      {featuredAction && (
        <div className="relative z-10 mt-1 pt-1.5 border-t border-slate-800/80">
          <button
            onClick={() => onSelect(featuredAction.view)}
            className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 transition cursor-pointer"
          >
            <span>{featuredAction.label}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
