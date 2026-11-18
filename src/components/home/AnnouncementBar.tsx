import React, { useState } from 'react';
import { AlertCircle, ArrowRight, X, Sparkles } from 'lucide-react';

export interface AnnouncementBarProps {
  message?: string;
  ctaText?: string;
  ctaLink?: string;
  onCtaClick?: () => void;
  isDismissible?: boolean;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  message = 'Urgent Field Appeal: Clean Water Aquifer Project in Rajasthan needs support to reach 25,000 villagers.',
  ctaText = 'Support Campaign',
  onCtaClick,
  isDismissible = true,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div
      role="banner"
      aria-label="Important Announcement"
      className="relative bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white text-xs py-2 px-4 border-b border-emerald-700/40 shadow-sm"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0 flex-1 justify-center sm:justify-start">
          <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border border-amber-500/30 flex-shrink-0">
            <Sparkles className="w-3 h-3" />
            Priority
          </span>
          <p className="truncate text-slate-200 font-medium">
            {message}
          </p>
          {onCtaClick && (
            <button
              onClick={onCtaClick}
              className="inline-flex items-center gap-1 font-semibold text-emerald-300 hover:text-white underline underline-offset-2 flex-shrink-0 ml-1 transition-colors"
            >
              {ctaText}
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {isDismissible && (
          <button
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss announcement"
            className="p-1 rounded-md text-emerald-300/70 hover:text-white hover:bg-emerald-800/40 transition-colors flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AnnouncementBar;
