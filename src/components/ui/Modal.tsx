import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
  showCloseButton = true
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className={`relative w-full ${maxWidthStyles[maxWidth]} rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 z-10 max-h-[90vh] flex flex-col`}
          >
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 shrink-0">
                <div>
                  {title && <h3 className="text-lg sm:text-xl font-black text-slate-900">{title}</h3>}
                  {description && (
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{description}</p>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}

            <div className="mt-4 flex-1 overflow-y-auto pr-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
