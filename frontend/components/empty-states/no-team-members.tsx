"use client";

import React from "react";
import { Users, UserPlus, Mail } from "lucide-react";
import { EmptyState } from "./empty-state";

interface NoTeamMembersProps {
  variant?: "all" | "pending-invites" | "active";
  onInviteMember?: () => void;
  className?: string;
}

/**
 * No Team Members Empty State
 *
 * Shows different messages for team member list, pending invites, etc.
 *
 * Usage:
 * ```tsx
 * <NoTeamMembers onInviteMember={() => openInviteDialog()} />
 *
 * <NoTeamMembers variant="pending-invites" />
 * ```
 */
export function NoTeamMembers({
  variant = "all",
  onInviteMember,
  className,
}: NoTeamMembersProps) {
  // Pending invites view
  if (variant === "pending-invites") {
    return (
      <EmptyState
        icon={Mail}
        title="No pending invites"
        description="You don't have any pending team member invitations."
        className={className}
        variant="inline"
      />
    );
  }

  // Active members view
  if (variant === "active") {
    return (
      <EmptyState
        icon={Users}
        title="No active team members"
        description="Invite team members to collaborate on recruitment and interviews."
        action={
          onInviteMember
            ? {
                label: "Invite Team Member",
                onClick: onInviteMember,
              }
            : undefined
        }
        className={className}
      />
    );
  }

  // All members view (default)
  return (
    <EmptyState
      icon={UserPlus}
      title="Build your team"
      description="Start by inviting team members to help manage recruitment. You can assign roles like Recruiter, Interviewer, or HR Admin."
      action={
        onInviteMember
          ? {
              label: "Invite Team Member",
              onClick: onInviteMember,
            }
          : undefined
      }
      className={className}
    />
  );
}

/**
 * No Interviewers Available
 *
 * Shown when trying to assign interviewers but none exist.
 */
export function NoInterviewersAvailable({
  onInviteMember,
  className,
}: {
  onInviteMember?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      icon={Users}
      title="No interviewers available"
      description="You need to invite team members with Interviewer or HR Admin roles before you can assign interviews."
      action={
        onInviteMember
          ? {
              label: "Invite Team Member",
              onClick: onInviteMember,
            }
          : undefined
      }
      className={className}
      variant="inline"
    />
  );
}
