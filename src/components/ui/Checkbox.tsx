import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, id, disabled, checked, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className="flex items-start gap-2.5">
        <div className="relative flex items-center h-5">
          <input
            type="checkbox"
            id={inputId}
            ref={ref}
            disabled={disabled}
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <label
            htmlFor={inputId}
            className={cn(
              'h-4.5 w-4.5 rounded border border-slate-300 bg-white flex items-center justify-center transition-colors cursor-pointer',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500 peer-focus-visible:ring-offset-2',
              'peer-checked:bg-emerald-600 peer-checked:border-emerald-600 peer-checked:text-white',
              'peer-disabled:cursor-not-allowed peer-disabled:opacity-50 peer-disabled:bg-slate-100',
              error && 'border-red-500',
              className
            )}
          >
            <Check className="h-3.5 w-3.5 stroke-[3] opacity-0 peer-checked:opacity-100 transition-opacity" />
          </label>
        </div>
        {(label || description) && (
          <div className="text-xs select-none">
            {label && (
              <label
                htmlFor={inputId}
                className={cn(
                  'font-medium text-slate-800 cursor-pointer block',
                  disabled && 'cursor-not-allowed opacity-50'
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-slate-500 text-[11px] leading-relaxed mt-0.5">{description}</p>
            )}
            {error && <p className="text-red-600 text-[11px] mt-0.5">{error}</p>}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
