import React from 'react';
import { cn } from '../../lib/utils';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'default' | 'soft' | 'muted' | 'dark' | 'brand';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Section: React.FC<SectionProps> = ({
  children,
  variant = 'default',
  padding = 'lg',
  className,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white text-slate-900 dark:bg-[#0c1813] dark:text-slate-100',
    soft: 'bg-[#f7faf8] text-slate-900 dark:bg-[#12211b] dark:text-slate-100',
    muted: 'bg-slate-100 text-slate-800 dark:bg-[#152721] dark:text-slate-200',
    dark: 'bg-[#13231d] text-white',
    brand: 'bg-gradient-to-br from-emerald-800 to-emerald-950 text-white',
  };

  const paddingStyles = {
    none: 'py-0',
    sm: 'py-6 sm:py-8',
    md: 'py-10 sm:py-12',
    lg: 'py-16 sm:py-20',
    xl: 'py-20 sm:py-28',
  };

  return (
    <section
      className={cn('w-full relative transition-colors duration-200', variantStyles[variant], paddingStyles[padding], className)}
      {...props}
    >
      {children}
    </section>
  );
};

export default Section;
