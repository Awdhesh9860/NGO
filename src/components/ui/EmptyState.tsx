import React from 'react';
import { FolderOpen } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-white/50',
        className
      )}
    >
      <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4 shadow-xs">
        {icon || <FolderOpen className="h-6 w-6" />}
      </div>
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      {description && (
        <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">{description}</p>
      )}
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
