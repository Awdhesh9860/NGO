import React from 'react';
import { cn } from '../../lib/utils';

export interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  label?: string;
}

export const Separator: React.FC<SeparatorProps> = ({
  orientation = 'horizontal',
  className,
  label,
}) => {
  if (orientation === 'vertical') {
    return <div className={cn('h-full w-px bg-slate-200 shrink-0', className)} role="separator" />;
  }

  if (label) {
    return (
      <div className={cn('relative flex items-center justify-center my-4', className)} role="separator">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative bg-white px-3 text-[11px] font-medium uppercase tracking-wider text-slate-400">
          {label}
        </div>
      </div>
    );
  }

  return <div className={cn('w-full border-t border-slate-200 my-4', className)} role="separator" />;
};
