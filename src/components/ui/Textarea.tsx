import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  helperText,
  error,
  className = '',
  id,
  rows = 4,
  ...props
}) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={textareaId} className="block text-xs font-bold text-slate-700">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        className={`w-full rounded-2xl border bg-white p-3.5 text-xs sm:text-sm text-slate-900 transition-all outline-none placeholder:text-slate-400 ${
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
            : 'border-slate-300/90 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50'
        } ${className}`}
        {...props}
      />
      {error ? (
        <p className="text-[11px] font-medium text-rose-600 animate-fadeIn">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
};
