import React from 'react';
import { MegaMenuColumn } from './navConfig';
import { NavIcon } from './NavIcon';
import { ArrowRight, Sparkles, Heart } from 'lucide-react';

interface MegaMenuProps {
  columns: MegaMenuColumn[];
  isOpen: boolean;
  onSelect: (view: string, subId?: string) => void;
  featuredCard?: {
    tag: string;
    title: string;
    description: string;
    ctaLabel: string;
    view: string;
    subId?: string;
  };
  featuredAction?: {
    label: string;
    view: string;
  };
  align?: 'left' | 'center' | 'right';
  isScrolled?: boolean;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({
  columns,
  isOpen,
  onSelect,
  featuredCard,
  featuredAction,
  align = 'center',
  isScrolled = false
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="menu"
      className="absolute top-full mt-2.5 left-1/2 -translate-x-1/2 w-[720px] max-w-[92vw] rounded-2xl border border-slate-700/80 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* Decorative arrow/notch */}
      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-3 w-3 rotate-45 border-t border-l border-slate-700/80 bg-slate-900/95" />

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Columns */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${featuredCard ? 'md:col-span-8' : 'md:col-span-12'}`}>
          {columns.map((col, idx) => (
            <div key={idx} className="space-y-2">
              <div className="px-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  {col.title}
                </span>
                {col.description && (
                  <p className="text-[10px] text-slate-400 leading-none mt-0.5">
                    {col.description}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                {col.items.map((item) => (
                  <button
                    key={item.id}
                    role="menuitem"
                    onClick={() => onSelect(item.view, item.subId)}
                    className="group w-full flex items-start gap-2.5 rounded-xl p-2 text-left hover:bg-slate-800/80 transition-colors cursor-pointer"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-300 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <NavIcon name={item.iconName} className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-bold">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-1 group-hover:text-slate-300">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Featured Callout Card on right side */}
        {featuredCard && (
          <div className="md:col-span-4 flex flex-col justify-between rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/60 via-slate-900 to-teal-950/40 p-3.5 text-white">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/40">
                <Sparkles className="h-3 w-3" />
                <span>{featuredCard.tag}</span>
              </div>
              <h4 className="text-sm font-bold text-white leading-tight">
                {featuredCard.title}
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {featuredCard.description}
              </p>
            </div>

            <button
              onClick={() => onSelect(featuredCard.view, featuredCard.subId)}
              className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-sm cursor-pointer"
            >
              <span>{featuredCard.ctaLabel}</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {featuredAction && (
        <div className="relative z-10 mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs px-2">
          <span className="text-[11px] text-slate-400 font-medium">
            Need custom community program proposals?
          </span>
          <button
            onClick={() => onSelect(featuredAction.view)}
            className="inline-flex items-center gap-1.5 font-bold text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
          >
            <span>{featuredAction.label}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
