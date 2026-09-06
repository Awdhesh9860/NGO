import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: SelectOption[];
  helperText?: string;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options = [],
  helperText,
  error,
  children,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-bold text-slate-700">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <select
          id={selectId}
          className={`w-full appearance-none rounded-2xl border bg-white px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-slate-900 transition-all outline-none cursor-pointer ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
              : 'border-slate-300/90 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50'
          } ${className}`}
          {...props}
        >
          {options.length > 0
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <span className="pointer-events-none absolute right-3.5 text-slate-400">
          <ChevronDown className="h-4 w-4" />
        </span>
      </div>
      {error ? (
        <p className="text-[11px] font-medium text-rose-600 animate-fadeIn">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
};
