"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Global Error Boundary Component
 *
 * Catches React errors anywhere in the component tree and displays a fallback UI
 * instead of crashing the whole application.
 *
 * Features:
 * - Catches errors in child components
 * - Displays user-friendly error message
 * - Provides "Try Again" and "Go Home" actions
 * - Logs errors to console (can be extended to send to error tracking service)
 * - Customizable fallback UI
 *
 * Usage:
 *
 * // Wrap your entire app (in layout.tsx)
 * <ErrorBoundary>
 *   <YourApp />
 * </ErrorBoundary>
 *
 * // Wrap specific sections with custom fallback
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <CriticalComponent />
 * </ErrorBoundary>
 *
 * // With custom reset handler
 * <ErrorBoundary onReset={() => router.push('/dashboard')}>
 *   <DashboardContent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details to console
    console.error("Error Boundary caught an error:", error, errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // TODO: Send error to error tracking service (e.g., Sentry, LogRocket)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Call custom reset handler if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleGoHome = () => {
    // Reset error state and navigate to home
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Navigate to home page
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      // Render custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Render default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-lg bg-red-50">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Something went wrong</CardTitle>
                  <CardDescription className="mt-1">
                    We encountered an unexpected error. Don't worry, your data is safe.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Error Details (for development) */}
              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="space-y-3">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-900 mb-2">Error Message:</p>
                    <p className="text-sm text-red-700 font-mono break-all">
                      {this.state.error.toString()}
                    </p>
                  </div>

                  {this.state.errorInfo && (
                    <details className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <summary className="text-sm font-medium text-gray-900 cursor-pointer">
                        Component Stack
                      </summary>
                      <pre className="mt-2 text-xs text-gray-700 overflow-auto max-h-64">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* User-friendly message */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  This error has been logged and we'll look into it. You can try the following:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                  <li>Click "Try Again" to reload this section</li>
                  <li>Go back to the home page and try again</li>
                  <li>If the problem persists, contact support</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button onClick={this.handleReset} className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={this.handleGoHome} variant="outline" className="flex-1">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>

              {/* Contact Support */}
              <div className="pt-4 border-t">
                <p className="text-xs text-center text-muted-foreground">
                  Need help?{" "}
                  <a href="mailto:support@personarecruit.ai" className="text-primary hover:underline">
                    Contact Support
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

/**
 * Route-specific Error Boundary
 *
 * Use this for specific routes that need custom error handling.
 * Shows a smaller error UI suitable for page sections.
 */
export function RouteErrorBoundary({
  children,
  title = "Something went wrong",
  description = "We encountered an error loading this section.",
}: {
  children: ReactNode;
  title?: string;
  description?: string;
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-full bg-red-50">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                <Button onClick={() => window.location.reload()} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Async Error Boundary
 *
 * Specialized error boundary for async operations.
 * Automatically retries failed operations after a delay.
 */
interface AsyncErrorBoundaryProps {
  children: ReactNode;
  onRetry?: () => void;
  maxRetries?: number;
}

interface AsyncErrorBoundaryState extends State {
  retryCount: number;
}

export class AsyncErrorBoundary extends Component<
  AsyncErrorBoundaryProps,
  AsyncErrorBoundaryState
> {
  private retryTimeout?: NodeJS.Timeout;

  constructor(props: AsyncErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<AsyncErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Async Error Boundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Auto-retry after 3 seconds if retries remaining
    const maxRetries = this.props.maxRetries || 3;
    if (this.state.retryCount < maxRetries) {
      this.retryTimeout = setTimeout(() => {
        this.handleRetry();
      }, 3000);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  handleRetry = () => {
    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));

    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      const maxRetries = this.props.maxRetries || 3;
      const retriesLeft = maxRetries - this.state.retryCount;

      return (
        <div className="p-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-full bg-yellow-50">
                  <AlertTriangle className="w-8 h-8 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Loading Failed</h3>
                  <p className="text-sm text-muted-foreground">
                    {retriesLeft > 0
                      ? `Retrying automatically... (${retriesLeft} attempts left)`
                      : "Maximum retry attempts reached."}
                  </p>
                </div>
                <Button onClick={this.handleRetry} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
