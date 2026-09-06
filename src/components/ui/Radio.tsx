import React from 'react';
import { cn } from '../../lib/utils';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  value,
  defaultValue,
  onChange,
  label,
  error,
  className,
  disabled = false,
}) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || options[0]?.value);
  const activeValue = value !== undefined ? value : internalValue;

  const handleChange = (val: string) => {
    if (value === undefined) setInternalValue(val);
    onChange?.(val);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && <span className="block text-xs font-semibold text-slate-800">{label}</span>}
      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = activeValue === option.value;
          const isDisabled = disabled || option.disabled;
          const optionId = `${name}-${option.value}`;

          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={cn(
                'flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none',
                isSelected
                  ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300',
                isDisabled && 'opacity-50 cursor-not-allowed bg-slate-50'
              )}
            >
              <div className="relative flex items-center h-5">
                <input
                  type="radio"
                  id={optionId}
                  name={name}
                  value={option.value}
                  checked={isSelected}
                  disabled={isDisabled}
                  onChange={() => handleChange(option.value)}
                  className="sr-only"
                />
                <div
                  className={cn(
                    'h-4.5 w-4.5 rounded-full border flex items-center justify-center transition-colors',
                    isSelected ? 'border-emerald-600' : 'border-slate-300',
                    isDisabled && 'border-slate-200'
                  )}
                >
                  {isSelected && <div className="h-2 w-2 rounded-full bg-emerald-600" />}
                </div>
              </div>
              <div className="text-xs">
                <span className="font-semibold text-slate-800 block">{option.label}</span>
                {option.description && (
                  <span className="text-slate-500 text-[11px] leading-relaxed block mt-0.5">
                    {option.description}
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>
      {error && <p className="text-red-600 text-[11px]">{error}</p>}
    </div>
  );
};
