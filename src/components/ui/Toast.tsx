import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = React.useCallback(
    (type: ToastType, title: string, message?: string, duration: number = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastMessage = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <div
        aria-live="assertive"
        className="fixed bottom-0 right-0 z-50 p-4 sm:p-6 space-y-3 pointer-events-none max-w-sm w-full"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="alert"
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border bg-white text-xs transition-all animate-in slide-in-from-bottom-5 duration-200',
              toast.type === 'success' && 'border-emerald-200 text-slate-800',
              toast.type === 'error' && 'border-red-200 text-slate-800',
              toast.type === 'warning' && 'border-amber-200 text-slate-800',
              toast.type === 'info' && 'border-blue-200 text-slate-800'
            )}
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
              {toast.type === 'error' && <AlertCircle className="h-4 w-4 text-red-600" />}
              {toast.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-600" />}
              {toast.type === 'info' && <Info className="h-4 w-4 text-blue-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="font-bold text-slate-900 leading-tight">{toast.title}</h5>
              {toast.message && <p className="text-slate-500 mt-1 leading-relaxed">{toast.message}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-md hover:bg-slate-100 transition"
              aria-label="Close notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
