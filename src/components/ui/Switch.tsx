import React from 'react';
import { cn } from '../../lib/utils';

export interface SwitchProps {
  id?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  id,
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  label,
  description,
  className,
}) => {
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
  const isChecked = checked !== undefined ? checked : internalChecked;
  const switchId = id || React.useId();

  const handleToggle = () => {
    if (disabled) return;
    const next = !isChecked;
    if (checked === undefined) setInternalChecked(next);
    onChange?.(next);
  };

  return (
    <div className={cn('flex items-center justify-between gap-3', className)}>
      {(label || description) && (
        <div className="text-xs select-none">
          {label && (
            <label
              htmlFor={switchId}
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
        </div>
      )}
      <button
        type="button"
        id={switchId}
        role="switch"
        aria-checked={isChecked}
        disabled={disabled}
        onClick={handleToggle}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
          'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
          isChecked ? 'bg-emerald-600' : 'bg-slate-300',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out',
            isChecked ? 'translate-x-4' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  );
};
