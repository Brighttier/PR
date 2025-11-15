"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface PageLoadingProps {
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

/**
 * Page Loading Component
 *
 * Full page loading spinner with optional message.
 *
 * Usage:
 * ```tsx
 * // Full screen
 * <PageLoading message="Loading dashboard..." />
 *
 * // Inline
 * <PageLoading message="Loading..." fullScreen={false} />
 * ```
 */
export function PageLoading({
  message = "Loading...",
  fullScreen = true,
  className,
}: PageLoadingProps) {
  const containerClass = fullScreen
    ? "min-h-screen flex items-center justify-center bg-background"
    : "flex items-center justify-center p-12";

  return (
    <div className={`${containerClass} ${className || ""}`}>
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </div>
    </div>
  );
}

/**
 * Inline Loading Spinner
 *
 * Small inline loading spinner for buttons or small components.
 */
export function InlineLoading({ message, className }: { message?: string; className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <Loader2 className="h-4 w-4 animate-spin text-primary" />
      {message && <span className="text-sm text-muted-foreground">{message}</span>}
    </div>
  );
}

/**
 * Button Loading Spinner
 *
 * Loading spinner for buttons (same size as button icons).
 */
export function ButtonLoading({ className }: { className?: string }) {
  return <Loader2 className={`h-4 w-4 animate-spin ${className || ""}`} />;
}

/**
 * Card Loading Component
 *
 * Loading state shown inside a card.
 */
export function CardLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

/**
 * Overlay Loading Component
 *
 * Loading overlay that covers the entire screen or a specific container.
 */
export function OverlayLoading({
  message = "Loading...",
  blur = true,
}: {
  message?: string;
  blur?: boolean;
}) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background/80 ${
        blur ? "backdrop-blur-sm" : ""
      }`}
    >
      <div className="flex flex-col items-center gap-4 rounded-lg bg-card p-6 shadow-lg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </div>
    </div>
  );
}

/**
 * Progress Loading Component
 *
 * Loading spinner with progress text (e.g., "Step 2 of 5").
 */
export function ProgressLoading({
  currentStep,
  totalSteps,
  message,
}: {
  currentStep: number;
  totalSteps: number;
  message?: string;
}) {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <div className="text-center space-y-1">
        <p className="text-sm font-medium">
          Step {currentStep} of {totalSteps}
        </p>
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
        <p className="text-xs text-muted-foreground">{percentage}% complete</p>
      </div>
    </div>
  );
}
