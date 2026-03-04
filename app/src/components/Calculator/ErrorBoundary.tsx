import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  name: string;
  fallbackClassName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class BaseErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(`[${this.props.name}] Error caught:`, error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          className={`flex flex-col items-center justify-center gap-3 p-6 ${this.props.fallbackClassName ?? ''}`}
          style={{ backgroundColor: 'var(--bg-surface)' }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'var(--severity-warning-bg)' }}
          >
            <AlertTriangle size={24} style={{ color: 'var(--accent-amber)' }} />
          </div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Something went wrong
          </h3>
          <p className="text-xs text-center max-w-xs" style={{ color: 'var(--text-muted)' }}>
            An unexpected error occurred in {this.props.name.toLowerCase()}.
          </p>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-default)',
            }}
          >
            <RotateCcw size={12} />
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export const AppErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <BaseErrorBoundary name="Application" fallbackClassName="min-h-screen">
    {children}
  </BaseErrorBoundary>
);

export const SidebarErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <BaseErrorBoundary name="Sidebar" fallbackClassName="min-h-full w-full">
    {children}
  </BaseErrorBoundary>
);

export const ContentErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <BaseErrorBoundary name="Content" fallbackClassName="min-h-[200px] w-full">
    {children}
  </BaseErrorBoundary>
);

export const WidgetErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <BaseErrorBoundary name="Widget" fallbackClassName="w-[220px]">
    {children}
  </BaseErrorBoundary>
);
