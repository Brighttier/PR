"use client";

import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PageErrorProps {
  title?: string;
  description?: string;
  error?: Error | string;
  onRetry?: () => void;
  onGoHome?: () => void;
  showErrorDetails?: boolean;
}

/**
 * Page Error Component
 *
 * Displays page-level errors with options to retry or go home.
 * Can show detailed error information in development mode.
 *
 * Usage:
 * ```tsx
 * <PageError
 *   title="Failed to load page"
 *   description="We couldn't load the requested page"
 *   error={error}
 *   onRetry={() => window.location.reload()}
 *   onGoHome={() => router.push('/')}
 * />
 * ```
 */
export function PageError({
  title = "Something went wrong",
  description = "We encountered an error loading this page.",
  error,
  onRetry,
  onGoHome,
  showErrorDetails = process.env.NODE_ENV === "development",
}: PageErrorProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = "/";
    }
  };

  const errorMessage =
    error instanceof Error ? error.message : typeof error === "string" ? error : undefined;

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-red-50">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">{title}</CardTitle>
              <CardDescription className="mt-1">{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error Details (for development) */}
          {showErrorDetails && errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-900 mb-2">Error Details:</p>
              <p className="text-sm text-red-700 font-mono break-all">{errorMessage}</p>
            </div>
          )}

          {/* User-friendly message */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">You can try the following:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li>Click "Try Again" to reload this page</li>
              <li>Go back to the home page</li>
              <li>If the problem persists, contact support</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button onClick={handleRetry} className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={handleGoHome} variant="outline" className="flex-1">
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
