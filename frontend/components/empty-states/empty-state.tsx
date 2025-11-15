"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary" | "ghost";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  variant?: "card" | "inline";
}

/**
 * Generic Empty State Component
 *
 * Reusable empty state component with icon, title, description, and optional CTA button.
 *
 * Usage:
 * ```tsx
 * <EmptyState
 *   icon={Briefcase}
 *   title="No jobs found"
 *   description="Get started by creating your first job posting"
 *   action={{
 *     label: "Create Job",
 *     onClick: () => router.push('/dashboard/jobs/new')
 *   }}
 * />
 * ```
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  variant = "card",
}: EmptyStateProps) {
  const content = (
    <div className="flex flex-col items-center justify-center text-center space-y-4">
      {/* Icon */}
      {Icon && (
        <div className="p-4 rounded-full bg-muted">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}

      {/* Text Content */}
      <div className="space-y-2 max-w-sm">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {action && (
            <Button onClick={action.onClick} variant={action.variant || "default"}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button onClick={secondaryAction.onClick} variant="outline">
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );

  if (variant === "inline") {
    return <div className={`py-12 px-4 ${className || ""}`}>{content}</div>;
  }

  return (
    <Card className={className}>
      <CardContent className="py-12">{content}</CardContent>
    </Card>
  );
}

/**
 * Compact Empty State
 *
 * Smaller empty state for sidebars or constrained spaces.
 */
export function CompactEmptyState({
  icon: Icon,
  message,
  className,
}: {
  icon?: LucideIcon;
  message: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className || ""}`}>
      {Icon && <Icon className="h-6 w-6 text-muted-foreground mb-2" />}
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

/**
 * Empty State with Image
 *
 * Empty state with a custom image/illustration.
 */
export function ImageEmptyState({
  imageSrc,
  imageAlt = "Empty state illustration",
  title,
  description,
  action,
  className,
}: {
  imageSrc: string;
  imageAlt?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center space-y-6 py-12 ${className || ""}`}>
      <img src={imageSrc} alt={imageAlt} className="w-64 h-64 object-contain opacity-75" />
      <div className="space-y-2 max-w-sm">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && (
        <Button onClick={action.onClick} size="lg">
          {action.label}
        </Button>
      )}
    </div>
  );
}
