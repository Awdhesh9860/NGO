import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  showToast: (title: string, type?: ToastType, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const duration = toast.duration ?? 4000;
      const newToast: ToastItem = { ...toast, id, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((title: string, message?: string) => {
    addToast({ type: 'success', title, message });
  }, [addToast]);

  const error = useCallback((title: string, message?: string) => {
    addToast({ type: 'error', title, message });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string) => {
    addToast({ type: 'warning', title, message });
  }, [addToast]);

  const info = useCallback((title: string, message?: string) => {
    addToast({ type: 'info', title, message });
  }, [addToast]);

  const showToast = useCallback((title: string, type: ToastType = 'info', message?: string) => {
    addToast({ type, title, message });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info, showToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none p-2 sm:p-0">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
              className={`pointer-events-auto flex items-start gap-3 rounded-2xl p-4 shadow-xl border backdrop-blur-md text-xs sm:text-sm ${
                toast.type === 'success'
                  ? 'bg-slate-900/95 text-white border-emerald-500/30'
                  : toast.type === 'error'
                  ? 'bg-rose-950/95 text-rose-100 border-rose-500/40'
                  : toast.type === 'warning'
                  ? 'bg-amber-950/95 text-amber-100 border-amber-500/40'
                  : 'bg-slate-900/95 text-white border-blue-500/30'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-400" />}
                {toast.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-400" />}
                {toast.type === 'info' && <Info className="h-5 w-5 text-blue-400" />}
              </div>
              <div className="flex-1 space-y-0.5">
                <p className="font-bold">{toast.title}</p>
                {toast.message && <p className="text-xs opacity-80 leading-relaxed">{toast.message}</p>}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
