"use client";

import React from "react";
import { FileText, Search } from "lucide-react";
import { EmptyState } from "./empty-state";
import { useRouter } from "next/navigation";

interface NoTemplatesProps {
  templateType?: "email" | "interview" | "job" | "all";
  filtered?: boolean;
  onClearFilters?: () => void;
  onCreateTemplate?: () => void;
  className?: string;
}

/**
 * No Templates Empty State
 *
 * Shows different messages based on template type.
 *
 * Usage:
 * ```tsx
 * <NoTemplates
 *   templateType="email"
 *   onCreateTemplate={() => router.push('/dashboard/templates/new')}
 * />
 * ```
 */
export function NoTemplates({
  templateType = "all",
  filtered = false,
  onClearFilters,
  onCreateTemplate,
  className,
}: NoTemplatesProps) {
  const router = useRouter();

  // If filters are applied, show filter-specific empty state
  if (filtered) {
    return (
      <EmptyState
        icon={Search}
        title="No templates found"
        description="Try adjusting your filters to see more templates"
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

  const getContent = () => {
    switch (templateType) {
      case "email":
        return {
          title: "No email templates",
          description:
            "Create email templates to streamline your communication with candidates and save time on repetitive messages.",
        };
      case "interview":
        return {
          title: "No interview templates",
          description:
            "Create interview question templates to standardize your interview process and ensure consistent candidate evaluation.",
        };
      case "job":
        return {
          title: "No job description templates",
          description:
            "Create job description templates to quickly post new positions with consistent formatting and requirements.",
        };
      default:
        return {
          title: "No templates yet",
          description:
            "Create templates for emails, interviews, and job descriptions to streamline your hiring process.",
        };
    }
  };

  const content = getContent();

  return (
    <EmptyState
      icon={FileText}
      title={content.title}
      description={content.description}
      action={{
        label: "Create Template",
        onClick: onCreateTemplate || (() => router.push("/dashboard/templates/new")),
      }}
      className={className}
    />
  );
}

/**
 * No Email Templates (specific variant)
 */
export function NoEmailTemplates({
  onCreateTemplate,
  className,
}: {
  onCreateTemplate?: () => void;
  className?: string;
}) {
  return (
    <NoTemplates
      templateType="email"
      onCreateTemplate={onCreateTemplate}
      className={className}
    />
  );
}

/**
 * No Interview Question Templates (specific variant)
 */
export function NoInterviewTemplates({
  onCreateTemplate,
  className,
}: {
  onCreateTemplate?: () => void;
  className?: string;
}) {
  return (
    <NoTemplates
      templateType="interview"
      onCreateTemplate={onCreateTemplate}
      className={className}
    />
  );
}
