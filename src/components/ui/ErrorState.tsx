import React from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an error while loading this data. Please try again or contact support if the issue persists.',
  onRetry,
  className,
}) => {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-red-200 bg-red-50/50',
        className
      )}
    >
      <div className="h-12 w-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 mb-4 shadow-xs">
        <AlertOctagon className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-600 mt-1.5 max-w-md leading-relaxed">{message}</p>
      {onRetry && (
        <div className="mt-5">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            icon={<RotateCcw className="h-3.5 w-3.5" />}
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};
