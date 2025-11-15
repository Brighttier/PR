"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  showFilters?: boolean;
  showPagination?: boolean;
  className?: string;
}

/**
 * Table Skeleton Component
 *
 * Comprehensive loading skeleton for data tables.
 * Supports filters, pagination, and custom row/column counts.
 *
 * Usage:
 * ```tsx
 * <TableSkeleton
 *   rows={10}
 *   columns={6}
 *   showFilters
 *   showPagination
 * />
 * ```
 */
export function TableSkeleton({
  rows = 10,
  columns = 5,
  showHeader = true,
  showFilters = true,
  showPagination = true,
  className,
}: TableSkeletonProps) {
  return (
    <div className={`space-y-4 ${className || ""}`}>
      {/* Filters Section */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Skeleton className="h-10 w-full sm:w-64" />
          <Skeleton className="h-10 w-full sm:w-48" />
          <Skeleton className="h-10 w-full sm:w-48" />
          <div className="sm:ml-auto">
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      )}

      {/* Table Card */}
      <Card>
        {showHeader && (
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-72" />
            </div>
            <Skeleton className="h-10 w-32" />
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-3">
            {/* Table Header */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>

            {/* Table Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <div
                key={rowIndex}
                className="grid gap-4 items-center"
                style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
              >
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <Skeleton
                    key={colIndex}
                    className="h-12 w-full"
                    style={{ animationDelay: `${(rowIndex * columns + colIndex) * 50}ms` }}
                  />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Simple Table Skeleton
 *
 * Minimal table skeleton without card wrapper.
 */
export function SimpleTableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-10 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}
