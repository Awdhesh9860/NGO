import React from 'react';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';

export interface NotFoundViewProps {
  onNavigateHome?: () => void;
  onGoBack?: () => void;
  resourceName?: string;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({
  onNavigateHome,
  onGoBack,
  resourceName = 'page',
}) => {
  return (
    <div className="min-h-[500px] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mx-auto shadow-xs">
          <FileQuestion className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">404 Error</span>
          <h2 className="text-xl font-black text-slate-900">Requested {resourceName} not found</h2>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
          The requested resource may have been relocated, archived, or requires elevated authorization clearances.
        </p>
        <div className="flex items-center justify-center gap-3 pt-3">
          {onGoBack && (
            <Button
              variant="outline"
              size="sm"
              icon={<ArrowLeft className="h-3.5 w-3.5" />}
              onClick={onGoBack}
            >
              Go Back
            </Button>
          )}
          {onNavigateHome && (
            <Button
              size="sm"
              icon={<Home className="h-3.5 w-3.5" />}
              onClick={onNavigateHome}
            >
              Return Home
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
