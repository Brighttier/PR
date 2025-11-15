"use client";

import React from "react";
import { Calendar, CheckCircle2, Clock } from "lucide-react";
import { EmptyState } from "./empty-state";
import { useRouter } from "next/navigation";

interface NoInterviewsProps {
  variant?: "candidate" | "interviewer";
  status?: "upcoming" | "pending" | "completed";
  className?: string;
}

/**
 * No Interviews Empty State
 *
 * Shows different messages based on user role and interview status.
 *
 * Usage:
 * ```tsx
 * // Candidate - upcoming interviews
 * <NoInterviews variant="candidate" status="upcoming" />
 *
 * // Interviewer - pending feedback
 * <NoInterviews variant="interviewer" status="pending" />
 * ```
 */
export function NoInterviews({ variant = "candidate", status = "upcoming", className }: NoInterviewsProps) {
  const router = useRouter();

  // Candidate view
  if (variant === "candidate") {
    if (status === "upcoming") {
      return (
        <EmptyState
          icon={Calendar}
          title="No upcoming interviews"
          description="You don't have any interviews scheduled at the moment. Keep applying to jobs to get interview invitations."
          action={{
            label: "Browse Jobs",
            onClick: () => router.push("/careers"),
          }}
          secondaryAction={{
            label: "View Applications",
            onClick: () => router.push("/candidate/applications"),
          }}
          className={className}
        />
      );
    }

    if (status === "completed") {
      return (
        <EmptyState
          icon={CheckCircle2}
          title="No completed interviews"
          description="You haven't completed any interviews yet."
          className={className}
          variant="inline"
        />
      );
    }
  }

  // Interviewer view
  if (variant === "interviewer") {
    if (status === "upcoming") {
      return (
        <EmptyState
          icon={Calendar}
          title="No upcoming interviews"
          description="You don't have any interviews scheduled. Check back later or contact your HR team."
          className={className}
          variant="inline"
        />
      );
    }

    if (status === "pending") {
      return (
        <EmptyState
          icon={Clock}
          title="No pending feedback"
          description="Great job! You've submitted feedback for all your completed interviews."
          className={className}
          variant="inline"
        />
      );
    }

    if (status === "completed") {
      return (
        <EmptyState
          icon={CheckCircle2}
          title="No completed interviews"
          description="You haven't completed any interviews yet."
          className={className}
          variant="inline"
        />
      );
    }
  }

  // Default
  return (
    <EmptyState
      icon={Calendar}
      title="No interviews"
      description="No interviews found."
      className={className}
      variant="inline"
    />
  );
}

/**
 * No Scheduled Interviews for Application
 *
 * Shown on application details page when no interviews are scheduled.
 */
export function NoScheduledInterviews({
  onScheduleInterview,
  canSchedule = true,
  className,
}: {
  onScheduleInterview?: () => void;
  canSchedule?: boolean;
  className?: string;
}) {
  return (
    <EmptyState
      icon={Calendar}
      title="No interviews scheduled"
      description={
        canSchedule
          ? "Schedule an interview with this candidate to move forward in the hiring process."
          : "No interviews have been scheduled for this application yet."
      }
      action={
        canSchedule && onScheduleInterview
          ? {
              label: "Schedule Interview",
              onClick: onScheduleInterview,
            }
          : undefined
      }
      className={className}
      variant="inline"
    />
  );
}
