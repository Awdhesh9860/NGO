import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  position?: 'left' | 'right';
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  position = 'right',
  className,
}) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'fixed inset-y-0 flex max-w-full z-50 pointer-events-none',
          position === 'right' ? 'right-0' : 'left-0'
        )}
      >
        <div
          role="dialog"
          aria-modal="true"
          className={cn(
            'pointer-events-auto w-screen max-w-md bg-white shadow-2xl flex flex-col',
            className
          )}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
            <div>
              {title && <h3 className="text-base font-bold text-slate-900">{title}</h3>}
              {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
            </div>
            <button
              onClick={onClose}
              type="button"
              className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              aria-label="Close drawer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </div>
      </div>
    </div>
  );
};
