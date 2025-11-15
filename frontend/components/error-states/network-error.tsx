"use client";

import React from "react";
import { WifiOff, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface NetworkErrorProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  variant?: "card" | "alert" | "inline";
  showRetryButton?: boolean;
  retryButtonText?: string;
  className?: string;
}

/**
 * Network Error Component
 *
 * Displays network-related errors (connection issues, API failures, timeout errors).
 * Supports multiple display variants.
 *
 * Usage:
 * ```tsx
 * // Card variant (default)
 * <NetworkError onRetry={() => refetch()} />
 *
 * // Alert variant
 * <NetworkError variant="alert" title="Connection Failed" />
 *
 * // Inline variant
 * <NetworkError variant="inline" showRetryButton={false} />
 * ```
 */
export function NetworkError({
  title = "Connection Error",
  description = "We couldn't connect to the server. Please check your internet connection and try again.",
  onRetry,
  variant = "card",
  showRetryButton = true,
  retryButtonText = "Retry",
  className,
}: NetworkErrorProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  // Alert variant
  if (variant === "alert") {
    return (
      <Alert variant="destructive" className={className}>
        <WifiOff className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="flex flex-col gap-3">
          <p>{description}</p>
          {showRetryButton && (
            <Button onClick={handleRetry} variant="outline" size="sm" className="w-fit">
              <RefreshCw className="w-4 h-4 mr-2" />
              {retryButtonText}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Inline variant
  if (variant === "inline") {
    return (
      <div className={`flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg ${className || ""}`}>
        <WifiOff className="h-5 w-5 text-red-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-900">{title}</p>
          <p className="text-sm text-red-700 mt-0.5">{description}</p>
        </div>
        {showRetryButton && (
          <Button onClick={handleRetry} variant="outline" size="sm" className="flex-shrink-0">
            <RefreshCw className="w-4 h-4 mr-2" />
            {retryButtonText}
          </Button>
        )}
      </div>
    );
  }

  // Card variant (default)
  return (
    <div className={`flex items-center justify-center p-6 ${className || ""}`}>
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-red-50">
              <WifiOff className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription className="mt-1">{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Please try the following:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li>Check your internet connection</li>
              <li>Refresh the page</li>
              <li>Try again in a few moments</li>
            </ul>
          </div>

          {showRetryButton && (
            <Button onClick={handleRetry} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              {retryButtonText}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * API Error Component
 *
 * Displays API-specific errors with status codes.
 */
export function APIError({
  statusCode,
  message = "An error occurred while processing your request.",
  onRetry,
  className,
}: {
  statusCode?: number;
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  const getErrorTitle = () => {
    if (!statusCode) return "API Error";
    if (statusCode >= 500) return "Server Error";
    if (statusCode === 404) return "Not Found";
    if (statusCode === 403) return "Access Denied";
    if (statusCode === 401) return "Unauthorized";
    return "Request Failed";
  };

  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        {getErrorTitle()}
        {statusCode && <span className="text-xs font-mono">({statusCode})</span>}
      </AlertTitle>
      <AlertDescription className="flex flex-col gap-3">
        <p>{message}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm" className="w-fit">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
