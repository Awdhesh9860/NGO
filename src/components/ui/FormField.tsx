import React from 'react';
import { cn } from '../../lib/utils';
import { Label } from './Label';

export interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  description?: string;
  id?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  error,
  description,
  id,
  children,
  className,
}) => {
  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      )}
      {children}
      {description && !error && (
        <p className="text-[11px] text-slate-500 leading-normal">{description}</p>
      )}
      {error && (
        <p className="text-[11px] font-medium text-red-600 leading-normal animate-in fade-in-50 duration-150">
          {error}
        </p>
      )}
    </div>
  );
};
