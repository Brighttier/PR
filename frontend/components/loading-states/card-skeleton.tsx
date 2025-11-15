"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

interface CardSkeletonProps {
  showHeader?: boolean;
  showFooter?: boolean;
  contentLines?: number;
  className?: string;
}

/**
 * Card Skeleton Component
 *
 * Generic loading skeleton for card components.
 *
 * Usage:
 * ```tsx
 * <CardSkeleton showHeader showFooter contentLines={4} />
 * ```
 */
export function CardSkeleton({
  showHeader = true,
  showFooter = false,
  contentLines = 3,
  className,
}: CardSkeletonProps) {
  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {Array.from({ length: contentLines }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" style={{ width: `${100 - i * 10}%` }} />
        ))}
      </CardContent>
      {showFooter && (
        <CardFooter className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </CardFooter>
      )}
    </Card>
  );
}

/**
 * Grid of Card Skeletons
 */
export function CardGridSkeleton({
  count = 6,
  columns = 3,
  showHeader = true,
  showFooter = false,
  contentLines = 3,
}: {
  count?: number;
  columns?: 2 | 3 | 4;
  showHeader?: boolean;
  showFooter?: boolean;
  contentLines?: number;
}) {
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={`grid gap-4 ${gridCols[columns]}`}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton
          key={i}
          showHeader={showHeader}
          showFooter={showFooter}
          contentLines={contentLines}
        />
      ))}
    </div>
  );
}

/**
 * List of Card Skeletons
 */
export function CardListSkeleton({
  count = 5,
  showHeader = true,
  showFooter = false,
  contentLines = 3,
}: {
  count?: number;
  showHeader?: boolean;
  showFooter?: boolean;
  contentLines?: number;
}) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton
          key={i}
          showHeader={showHeader}
          showFooter={showFooter}
          contentLines={contentLines}
        />
      ))}
    </div>
  );
}
