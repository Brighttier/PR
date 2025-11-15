"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Loading Skeleton Components
 *
 * Reusable loading state components for consistent UX across the application.
 * All skeletons use Tailwind's animate-pulse for smooth loading animations.
 */

/**
 * Stats Card Skeleton
 *
 * Used for dashboard stat cards (Total Applications, Active Jobs, etc.)
 */
export function StatsCardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-12 w-12 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Stats Grid Skeleton
 *
 * Grid of 4 stats cards (standard dashboard layout)
 */
export function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Table Row Skeleton
 *
 * Single table row with multiple columns
 */
export function TableRowSkeleton({ columns = 6 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 p-4 border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
  );
}

/**
 * Table Skeleton
 *
 * Full table with header and rows
 */
export function TableSkeleton({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <Card>
      <CardContent className="p-0">
        {/* Table Header */}
        <div className="flex items-center gap-4 p-4 border-b bg-muted/50">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>

        {/* Table Rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <TableRowSkeleton key={i} columns={columns} />
        ))}
      </CardContent>
    </Card>
  );
}

/**
 * Application Card Skeleton
 *
 * Used for application lists in candidate dashboard
 */
export function ApplicationCardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-9 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Application List Skeleton
 *
 * List of application cards
 */
export function ApplicationListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <ApplicationCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Job Card Skeleton
 *
 * Used for job listings
 */
export function JobCardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-8 w-16 rounded-full" />
          </div>
          <Skeleton className="h-20 w-full" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <div className="flex items-center justify-between pt-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Job List Skeleton
 *
 * Grid of job cards
 */
export function JobListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <JobCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Interview Card Skeleton
 *
 * Used for interview lists
 */
export function InterviewCardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-9 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Interview List Skeleton
 *
 * List of interview cards
 */
export function InterviewListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <InterviewCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Profile Header Skeleton
 *
 * Used for candidate/user profile pages
 */
export function ProfileHeaderSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-3 flex-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-32 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Form Skeleton
 *
 * Generic form with multiple fields
 */
export function FormSkeleton({ fields = 5 }: { fields?: number }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        <div className="flex justify-end gap-3 pt-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Chart Skeleton
 *
 * Used for dashboard charts and graphs
 */
export function ChartSkeleton({ height = "h-80" }: { height?: string }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-56 mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className={`w-full ${height}`} />
      </CardContent>
    </Card>
  );
}

/**
 * Dashboard Grid Skeleton
 *
 * Complete dashboard loading state with stats and charts
 */
export function DashboardGridSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <StatsGridSkeleton />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartSkeleton height="h-96" />
        </div>
        <ChartSkeleton height="h-96" />
      </div>

      {/* Table */}
      <TableSkeleton rows={5} columns={6} />
    </div>
  );
}

/**
 * List Item Skeleton
 *
 * Generic list item (for settings, notifications, etc.)
 */
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b last:border-b-0">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-64" />
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  );
}

/**
 * List Skeleton
 *
 * List of items (settings, notifications, etc.)
 */
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <Card>
      <CardContent className="p-0">
        {Array.from({ length: items }).map((_, i) => (
          <ListItemSkeleton key={i} />
        ))}
      </CardContent>
    </Card>
  );
}

/**
 * Page Header Skeleton
 *
 * Used for page headers with title, description, and actions
 */
export function PageHeaderSkeleton() {
  return (
    <div className="flex items-start justify-between mb-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-36" />
      </div>
    </div>
  );
}

/**
 * Sidebar Skeleton
 *
 * Used for sidebar navigation loading
 */
export function SidebarSkeleton() {
  return (
    <div className="w-64 border-r bg-background p-4 space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  );
}

/**
 * Full Page Loading Skeleton
 *
 * Complete page loading state with header and content
 */
export function FullPageSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <PageHeaderSkeleton />
      <DashboardGridSkeleton />
    </div>
  );
}

/**
 * Spinner
 *
 * Simple loading spinner for inline loading states
 */
export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-primary`}
      />
    </div>
  );
}

/**
 * Loading Overlay
 *
 * Full-screen loading overlay with spinner
 */
export function LoadingOverlay({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="p-6">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </Card>
    </div>
  );
}

/**
 * Button Loading State
 *
 * Inline spinner for buttons
 */
export function ButtonSpinner() {
  return (
    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );
}
