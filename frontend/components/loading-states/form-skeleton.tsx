"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

interface FormSkeletonProps {
  fields?: number;
  showTitle?: boolean;
  showDescription?: boolean;
  showFooter?: boolean;
  className?: string;
}

/**
 * Form Skeleton Component
 *
 * Loading skeleton for forms with multiple fields.
 *
 * Usage:
 * ```tsx
 * <FormSkeleton fields={5} showTitle showFooter />
 * ```
 */
export function FormSkeleton({
  fields = 4,
  showTitle = true,
  showDescription = true,
  showFooter = true,
  className,
}: FormSkeletonProps) {
  return (
    <Card className={className}>
      {showTitle && (
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-48" />
          {showDescription && <Skeleton className="h-4 w-72" />}
        </CardHeader>
      )}
      <CardContent className="space-y-6">
        {Array.from({ length: fields }).map((_, i) => (
          <FormFieldSkeleton key={i} />
        ))}
      </CardContent>
      {showFooter && (
        <CardFooter className="flex gap-3">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </CardFooter>
      )}
    </Card>
  );
}

/**
 * Form Field Skeleton
 *
 * Single form field loading skeleton.
 */
export function FormFieldSkeleton({ hasHelper = false }: { hasHelper?: boolean }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full" />
      {hasHelper && <Skeleton className="h-3 w-48" />}
    </div>
  );
}

/**
 * Multi-Step Form Skeleton
 *
 * Loading skeleton for multi-step forms/wizards.
 */
export function MultiStepFormSkeleton({
  steps = 3,
  fieldsPerStep = 4,
}: {
  steps?: number;
  fieldsPerStep?: number;
}) {
  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: steps }).map((_, i) => (
          <React.Fragment key={i}>
            <Skeleton className="h-10 w-10 rounded-full" />
            {i < steps - 1 && <Skeleton className="h-0.5 w-16" />}
          </React.Fragment>
        ))}
      </div>

      {/* Form Content */}
      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          {Array.from({ length: fieldsPerStep }).map((_, i) => (
            <FormFieldSkeleton key={i} />
          ))}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </CardFooter>
      </Card>
    </div>
  );
}

/**
 * Dialog Form Skeleton
 *
 * Loading skeleton for forms inside dialogs.
 */
export function DialogFormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-6 p-6">
      {/* Dialog Title */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {Array.from({ length: fields }).map((_, i) => (
          <FormFieldSkeleton key={i} />
        ))}
      </div>

      {/* Dialog Footer */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
