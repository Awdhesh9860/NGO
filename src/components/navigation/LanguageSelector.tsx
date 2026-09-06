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
        className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer border ${
          isScrolled
            ? 'border-slate-700/60 bg-slate-800/60 text-slate-200 hover:bg-slate-700/70 hover:text-white'
            : 'border-white/20 bg-black/25 text-white/90 hover:bg-black/40 hover:text-white backdrop-blur-md'
        } focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-400`}
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
          className="absolute right-0 mt-2 w-44 rounded-2xl border border-slate-700/80 bg-slate-900/95 p-1.5 text-slate-200 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 mb-1">
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
                    ? 'bg-emerald-600/20 text-emerald-400 font-bold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold leading-tight">{lang.native}</span>
                  <span className="text-[10px] text-slate-400">{lang.label}</span>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
