"use client";

import React from "react";
import { Briefcase, Search } from "lucide-react";
import { EmptyState } from "./empty-state";
import { useRouter } from "next/navigation";

interface NoJobsProps {
  variant?: "public" | "recruiter";
  filtered?: boolean;
  onClearFilters?: () => void;
  onCreateJob?: () => void;
  className?: string;
}

/**
 * No Jobs Empty State
 *
 * Shows different messages for public career page vs recruiter dashboard.
 *
 * Usage:
 * ```tsx
 * // Public career page
 * <NoJobs variant="public" />
 *
 * // Recruiter dashboard
 * <NoJobs variant="recruiter" onCreateJob={() => openCreateDialog()} />
 *
 * // With filters
 * <NoJobs filtered onClearFilters={() => clearFilters()} />
 * ```
 */
export function NoJobs({
  variant = "public",
  filtered = false,
  onClearFilters,
  onCreateJob,
  className,
}: NoJobsProps) {
  const router = useRouter();

  // If filters are applied, show filter-specific empty state
  if (filtered) {
    return (
      <EmptyState
        icon={Search}
        title="No jobs match your criteria"
        description="Try adjusting your filters to see more job opportunities"
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

  // Public career page view
  if (variant === "public") {
    return (
      <EmptyState
        icon={Briefcase}
        title="No open positions at the moment"
        description="We don't have any job openings right now, but check back soon! We're always looking for talented people to join our team."
        action={{
          label: "Get Notified",
          onClick: () => {
            // TODO: Implement job alerts signup
            console.log("Job alerts signup");
          },
          variant: "outline",
        }}
        className={className}
      />
    );
  }

  // Recruiter dashboard view
  return (
    <EmptyState
      icon={Briefcase}
      title="No jobs posted yet"
      description="Create your first job posting to start attracting qualified candidates to your organization."
      action={{
        label: "Create Job Posting",
        onClick: onCreateJob || (() => router.push("/dashboard/jobs/new")),
      }}
      className={className}
    />
  );
}

/**
 * No Active Jobs Empty State
 *
 * Shown when all jobs are closed/archived.
 */
export function NoActiveJobs({ onCreateJob, className }: { onCreateJob?: () => void; className?: string }) {
  return (
    <EmptyState
      icon={Briefcase}
      title="No active jobs"
      description="All your job postings are currently closed or archived. Create a new job posting to start receiving applications."
      action={
        onCreateJob
          ? {
              label: "Create Job",
              onClick: onCreateJob,
            }
          : undefined
      }
      className={className}
    />
  );
}

/**
 * No Saved Jobs Empty State (for candidates)
 *
 * Shown when candidate hasn't saved any jobs.
 */
export function NoSavedJobs({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <EmptyState
      icon={Briefcase}
      title="No saved jobs"
      description="You haven't saved any jobs yet. Browse available positions and save ones you're interested in."
      action={{
        label: "Browse Jobs",
        onClick: () => router.push("/careers"),
      }}
      className={className}
    />
  );
}
