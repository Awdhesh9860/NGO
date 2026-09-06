import React from 'react';
import { cn } from '../../lib/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label: React.FC<LabelProps> = ({ className, children, required, ...props }) => {
  return (
    <label
      className={cn('block text-xs font-semibold text-slate-800 select-none mb-1.5', className)}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1 font-bold">*</span>}
    </label>
  );
};
