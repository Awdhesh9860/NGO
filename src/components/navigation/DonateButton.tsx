import React from 'react';
import { Heart } from 'lucide-react';

interface DonateButtonProps {
  onClick: () => void;
  className?: string;
  size?: 'sm' | 'md';
  isScrolled?: boolean;
}

export const DonateButton: React.FC<DonateButtonProps> = ({
  onClick,
  className = '',
  size = 'md',
  isScrolled = false
}) => {
  const sizeClasses =
    size === 'sm'
      ? 'px-3.5 py-2 text-xs font-bold gap-1.5'
      : 'px-5 py-2.5 text-xs sm:text-sm font-black gap-2';

  return (
    <button
      id="nav-donate-cta-button"
      onClick={onClick}
      aria-label="Donate Now - 80G Tax-Exempt Giving"
      className={`relative group inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white font-bold tracking-tight shadow-md shadow-emerald-950/20 hover:shadow-lg hover:shadow-emerald-600/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer overflow-hidden border border-emerald-400/40 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 ${sizeClasses} ${className}`}
    >
      {/* Subtle glass shimmer highlight */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      <Heart className="h-4 w-4 fill-white text-white shrink-0 transition-transform group-hover:scale-110 duration-200" />
      <span className="whitespace-nowrap font-black">Donate Now</span>
    </button>
  );
};
