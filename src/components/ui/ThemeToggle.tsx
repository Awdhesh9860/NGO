'use client';

import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Laptop } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ThemeToggleProps {
  className?: string;
  variant?: 'icon' | 'dropdown' | 'pill';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className, variant = 'icon' }) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  if (variant === 'pill') {
    return (
      <div className={cn('inline-flex items-center rounded-full border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-1 shadow-xs', className)}>
        <button
          onClick={() => setTheme('light')}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition',
            theme === 'light'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          )}
          title="Light theme"
        >
          <Sun className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Light</span>
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition',
            theme === 'dark'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          )}
          title="Dark theme"
        >
          <Moon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Dark</span>
        </button>
        <button
          onClick={() => setTheme('system')}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition',
            theme === 'system'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          )}
          title="Match system preference"
        >
          <Laptop className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Auto</span>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} theme`}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500',
        className
      )}
    >
      {resolvedTheme === 'light' ? (
        <Moon className="h-4 w-4 text-slate-700" />
      ) : (
        <Sun className="h-4 w-4 text-amber-400" />
      )}
    </button>
  );
};

export default ThemeToggle;
