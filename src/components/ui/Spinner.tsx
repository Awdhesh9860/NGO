import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'white' | 'muted';
  className?: string;
  label?: string;
}

const sizeClasses = {
  xs: 'h-3.5 w-3.5',
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

const variantClasses = {
  primary: 'text-emerald-600',
  white: 'text-white',
  muted: 'text-slate-400',
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  className,
  label,
}) => {
  return (
    <div className="inline-flex items-center gap-2 select-none" role="status">
      <Loader2
        className={cn('animate-spin', sizeClasses[size], variantClasses[variant], className)}
      />
      {label && <span className="text-xs font-medium text-slate-600">{label}</span>}
      <span className="sr-only">Loading...</span>
    </div>
  );
};
