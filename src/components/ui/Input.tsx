import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  icon,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}) => {
  const effectiveLeftIcon = leftIcon || icon;
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-bold text-slate-700">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {effectiveLeftIcon && (
          <span className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
            {effectiveLeftIcon}
          </span>
        )}
        <input
          id={inputId}
          className={`w-full rounded-2xl border bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 transition-all outline-none placeholder:text-slate-400 ${
            effectiveLeftIcon ? 'pl-10' : ''
          } ${rightIcon ? 'pr-10' : ''} ${

            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
              : 'border-slate-300/90 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50'
          } ${className}`}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3.5 text-slate-400 flex items-center">
            {rightIcon}
          </span>
        )}
      </div>
      {error ? (
        <p className="text-[11px] font-medium text-rose-600 animate-fadeIn">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
};
