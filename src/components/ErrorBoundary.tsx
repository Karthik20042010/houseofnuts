import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, ShoppingBag } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorId: "",
  };

  public static getDerivedStateFromError(error: Error): State {
    const errorId = "ERR_" + Date.now().toString(36).toUpperCase();
    return { hasError: true, error, errorId };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an unhandled error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorId: "" });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6 bg-background">
          <div className="max-w-md w-full text-center space-y-6 bg-card border border-border p-8 rounded-lg shadow-sm">
            <div className="size-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <AlertTriangle size={28} />
            </div>

            <div className="space-y-2">
              <h2 className="font-display text-2xl text-foreground">
                {this.props.fallbackTitle || "Something went wrong"}
              </h2>
              <p className="text-sm text-muted-foreground font-body">
                We encountered an unexpected error while loading this page. Your cart and session are safe.
              </p>
            </div>

            {this.state.errorId && (
              <p className="text-[11px] font-mono text-muted-foreground/80 bg-muted/50 py-1.5 px-3 rounded-md inline-block">
                Reference: {this.state.errorId}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-primary text-primary-foreground py-3 px-4 uppercase tracking-[0.15em] text-xs font-medium font-body flex items-center justify-center gap-2 hover:bg-accent transition-colors"
              >
                <RefreshCw size={14} /> Try Again
              </button>
              <a
                href="/"
                className="flex-1 border border-border py-3 px-4 uppercase tracking-[0.15em] text-xs font-medium font-body flex items-center justify-center gap-2 hover:bg-accent/10 transition-colors text-foreground"
              >
                <Home size={14} /> Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
