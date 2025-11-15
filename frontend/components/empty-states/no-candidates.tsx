"use client";

import React from "react";
import { Users, Search, UserPlus } from "lucide-react";
import { EmptyState } from "./empty-state";

interface NoCandidatesProps {
  variant?: "talent-pool" | "search" | "folder";
  filtered?: boolean;
  onClearFilters?: () => void;
  onAddCandidate?: () => void;
  className?: string;
}

/**
 * No Candidates Empty State
 *
 * Shows different messages based on context (talent pool, search, folders).
 *
 * Usage:
 * ```tsx
 * // Talent pool
 * <NoCandidates variant="talent-pool" onAddCandidate={() => openDialog()} />
 *
 * // Search results
 * <NoCandidates variant="search" filtered onClearFilters={() => reset()} />
 *
 * // Empty folder
 * <NoCandidates variant="folder" />
 * ```
 */
export function NoCandidates({
  variant = "talent-pool",
  filtered = false,
  onClearFilters,
  onAddCandidate,
  className,
}: NoCandidatesProps) {
  // If filters are applied, show filter-specific empty state
  if (filtered) {
    return (
      <EmptyState
        icon={Search}
        title="No candidates found"
        description="Try adjusting your search criteria or filters to find more candidates"
        action={
          onClearFilters
            ? {
                label: "Clear Filters",
                onClick: onClearFilters,
                variant: "outline",
              }
            : undefined
        }
        className={className}
      />
    );
  }

  // Talent pool view
  if (variant === "talent-pool") {
    return (
      <EmptyState
        icon={Users}
        title="No candidates in talent pool"
        description="Start building your talent pipeline by adding candidates from applications or manually adding profiles."
        action={
          onAddCandidate
            ? {
                label: "Add Candidate",
                onClick: onAddCandidate,
              }
            : undefined
        }
        className={className}
      />
    );
  }

  // Search results view
  if (variant === "search") {
    return (
      <EmptyState
        icon={Search}
        title="No matching candidates"
        description="We couldn't find any candidates matching your search. Try different keywords or broaden your criteria."
        className={className}
        variant="inline"
      />
    );
  }

  // Folder view
  if (variant === "folder") {
    return (
      <EmptyState
        icon={Users}
        title="This folder is empty"
        description="Add candidates to this folder to keep track of promising talent for future opportunities."
        action={
          onAddCandidate
            ? {
                label: "Add Candidates",
                onClick: onAddCandidate,
                variant: "outline",
              }
            : undefined
        }
        className={className}
      />
    );
  }

  // Default
  return (
    <EmptyState
      icon={Users}
      title="No candidates"
      description="No candidates found."
      className={className}
      variant="inline"
    />
  );
}

/**
 * No Top Matches Empty State
 *
 * Shown when there are no high-scoring candidate matches.
 */
export function NoTopMatches({ threshold = 70, className }: { threshold?: number; className?: string }) {
  return (
    <EmptyState
      icon={Users}
      title="No top matches"
      description={`No candidates have a match score above ${threshold}% yet. Keep reviewing applications or adjust your job requirements.`}
      className={className}
      variant="inline"
    />
  );
}

/**
 * No Assigned Candidates (for interviewers)
 */
export function NoAssignedCandidates({ className }: { className?: string }) {
  return (
    <EmptyState
      icon={UserPlus}
      title="No assigned candidates"
      description="You haven't been assigned to interview any candidates yet. Contact your HR team if you'd like to participate in interviews."
      className={className}
      variant="inline"
    />
  );
}
