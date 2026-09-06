import React, { ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RotateCcw, Home } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  public override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-slate-50">
          <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-xl text-center space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 mx-auto">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h2 className="text-base font-bold text-slate-900">An unexpected error occurred</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              We encountered an issue rendering this section. Your data is safe and our systems have logged this event.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                icon={<RotateCcw className="h-3.5 w-3.5" />}
                onClick={() => this.setState({ hasError: false })}
              >
                Retry
              </Button>
              <Button
                size="sm"
                icon={<Home className="h-3.5 w-3.5" />}
                onClick={() => (window.location.href = '/')}
              >
                Return Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
