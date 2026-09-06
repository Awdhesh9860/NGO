import React from 'react';

export interface ProgressBarProps {
  progress: number; // 0 - 100
  label?: string;
  valueLabel?: string;
  variant?: 'emerald' | 'amber' | 'blue' | 'rose';
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  valueLabel,
  variant = 'emerald',
  size = 'md',
  showPercentage = false,
  className = ''
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  const colorStyles = {
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-500',
    blue: 'bg-blue-600',
    rose: 'bg-rose-600'
  };

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {(label || valueLabel || showPercentage) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="font-bold text-slate-700">{label}</span>}
          <div className="flex items-center gap-2">
            {valueLabel && <span className="text-slate-500">{valueLabel}</span>}
            {showPercentage && (
              <span className="font-mono font-bold text-slate-900">{Math.round(clampedProgress)}%</span>
            )}
          </div>
        </div>
      )}
      <div className={`w-full overflow-hidden rounded-full bg-slate-100 ${heightStyles[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorStyles[variant]}`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};
