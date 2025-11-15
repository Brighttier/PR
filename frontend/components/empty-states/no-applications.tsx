"use client";

import React from "react";
import { Briefcase, FileText, Search } from "lucide-react";
import { EmptyState } from "./empty-state";
import { useRouter } from "next/navigation";

interface NoApplicationsProps {
  variant?: "candidate" | "recruiter";
  filtered?: boolean;
  onClearFilters?: () => void;
  className?: string;
}

/**
 * No Applications Empty State
 *
 * Shows different messages for candidates vs recruiters.
 *
 * Usage:
 * ```tsx
 * // Candidate view
 * <NoApplications variant="candidate" />
 *
 * // Recruiter view
 * <NoApplications variant="recruiter" />
 *
 * // With filters applied
 * <NoApplications filtered onClearFilters={() => clearFilters()} />
 * ```
 */
export function NoApplications({
  variant = "candidate",
  filtered = false,
  onClearFilters,
  className,
}: NoApplicationsProps) {
  const router = useRouter();

  // If filters are applied, show filter-specific empty state
  if (filtered) {
    return (
      <EmptyState
        icon={Search}
        title="No applications found"
        description="Try adjusting your filters to see more results"
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

  // Candidate view
  if (variant === "candidate") {
    return (
      <EmptyState
        icon={Briefcase}
        title="No applications yet"
        description="Start your job search today and apply to positions that match your skills and experience."
        action={{
          label: "Browse Jobs",
          onClick: () => router.push("/careers"),
        }}
        secondaryAction={{
          label: "Complete Your Profile",
          onClick: () => router.push("/candidate/profile"),
        }}
        className={className}
      />
    );
  }

  // Recruiter view
  return (
    <EmptyState
      icon={FileText}
      title="No applications received"
      description="You haven't received any applications yet. Make sure your job postings are active and visible to candidates."
      action={{
        label: "Create Job Posting",
        onClick: () => router.push("/dashboard/jobs"),
      }}
      secondaryAction={{
        label: "View Active Jobs",
        onClick: () => router.push("/dashboard/jobs"),
      }}
      className={className}
    />
  );
}

/**
 * No Applications for Job Empty State
 *
 * Shown on job details page when no one has applied yet.
 */
export function NoApplicationsForJob({ jobTitle, className }: { jobTitle: string; className?: string }) {
  return (
    <EmptyState
      icon={FileText}
      title="No applications yet"
      description={`No candidates have applied to ${jobTitle} yet. Share this job posting to attract more applicants.`}
      action={{
        label: "Share Job",
        onClick: () => {
          navigator.clipboard.writeText(window.location.href);
          // Show toast notification
        },
        variant: "outline",
      }}
      className={className}
    />
  );
}

/**
 * No Pending Applications Empty State
 *
 * Shown when all applications have been reviewed.
 */
export function NoPendingApplications({ className }: { className?: string }) {
  return (
    <EmptyState
      icon={FileText}
      title="All caught up!"
      description="You've reviewed all pending applications. Great work!"
      className={className}
      variant="inline"
    />
  );
}
