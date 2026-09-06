import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export type AlertVariant = 'info' | 'success' | 'warning' | 'destructive';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const variantStyles: Record<AlertVariant, { container: string; title: string; icon: React.ReactNode }> = {
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-900',
    title: 'text-blue-950',
    icon: <Info className="h-4 w-4 text-blue-600 shrink-0" />,
  },
  success: {
    container: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    title: 'text-emerald-950',
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />,
  },
  warning: {
    container: 'bg-amber-50 border-amber-200 text-amber-900',
    title: 'text-amber-950',
    icon: <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />,
  },
  destructive: {
    container: 'bg-red-50 border-red-200 text-red-900',
    title: 'text-red-950',
    icon: <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />,
  },
};

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  icon,
  onClose,
  className,
}) => {
  const current = variantStyles[variant];

  return (
    <div
      role="alert"
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-xl border text-xs leading-relaxed transition-all shadow-xs',
        current.container,
        className
      )}
    >
      <div className="mt-0.5">{icon || current.icon}</div>
      <div className="flex-1">
        {title && <h5 className={cn('font-bold text-sm mb-1', current.title)}>{title}</h5>}
        <div className="opacity-90">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          aria-label="Dismiss alert"
          className="p-1 rounded-md hover:bg-black/5 transition -mr-1 -mt-1"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
