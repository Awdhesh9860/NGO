import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface LanguageSelectorProps {
  isScrolled?: boolean;
}

const LANGUAGES = [
  { code: 'en' as const, label: 'English', native: 'English', flag: 'Global' },
  { code: 'hi' as const, label: 'Hindi', native: 'हिन्दी', flag: 'IN' },
  { code: 'bn' as const, label: 'Bengali', native: 'বাংলা', flag: 'BD/IN' }
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ isScrolled = false }) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const currentLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <div className="relative" ref={containerRef}>
      <button
        id="nav-language-selector-button"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select Language"
        className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer border ${
          isScrolled
            ? 'border-slate-200 dark:border-[#1d332b] bg-slate-50 dark:bg-[#152721] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1d352c]'
            : 'border-white/20 bg-black/25 text-white/90 hover:bg-black/40 hover:text-white backdrop-blur-md'
        } focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#087F5B]`}
      >
        <Globe className="h-3.5 w-3.5 opacity-80" />
        <span className="uppercase font-bold text-[11px]">{currentLangObj.code}</span>
        <ChevronDown
          className={`h-3 w-3 opacity-70 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-44 rounded-2xl border border-slate-200 dark:border-[#1d332b] bg-white dark:bg-[#10201a] p-1.5 text-slate-800 dark:text-slate-200 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-1 duration-150 motion-reduce:animate-none"
        >
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-[#1d332b] mb-1">
            Choose Language
          </div>
          {LANGUAGES.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#087F5B] dark:text-emerald-400 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#172b22]'
                }`}
              >
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold leading-tight">{lang.native}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{lang.label}</span>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-[#087F5B] dark:text-emerald-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
