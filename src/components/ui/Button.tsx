import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'brand';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const effectiveLeftIcon = leftIcon || icon;

  const baseStyles = 'inline-flex items-center justify-center font-bold transition-all focus:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-xl gap-1.5',
    md: 'text-xs sm:text-sm px-4 py-2.5 rounded-2xl gap-2',
    lg: 'text-sm sm:text-base px-6 py-3.5 rounded-2xl gap-2.5 shadow-md'
  };

  const variantStyles = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs hover:shadow-emerald-600/20 active:bg-emerald-800',
    brand: 'bg-slate-900 text-white hover:bg-slate-800 shadow-xs hover:shadow-slate-900/20 active:bg-black',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 border border-slate-200/80',
    outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-xs active:bg-rose-800',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200'
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-current" />
      ) : (
        effectiveLeftIcon && <span className="shrink-0">{effectiveLeftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
