import React from 'react';
import { Spinner } from '../ui/Spinner';
import { cn } from '../../lib/utils';

export interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
  fullScreen?: boolean;
  className?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading Vikas Ecosystem...',
  subMessage = 'Fetching verified records from secure cloud storage',
  fullScreen = false,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center select-none',
        fullScreen ? 'fixed inset-0 z-50 bg-white/90 backdrop-blur-xs' : 'min-h-[320px] w-full',
        className
      )}
    >
      <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4 shadow-xs">
        <Spinner size="lg" />
      </div>
      <h4 className="text-sm font-bold text-slate-800 tracking-tight">{message}</h4>
      {subMessage && (
        <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">{subMessage}</p>
      )}
    </div>
  );
};
