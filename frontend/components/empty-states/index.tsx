"use client";

import React, { ReactNode } from "react";
import {
  Briefcase,
  FileText,
  Users,
  Calendar,
  Search,
  Inbox,
  FolderOpen,
  Mail,
  Building2,
  UserPlus,
  AlertCircle,
  Filter,
  Package,
  MessageSquare,
  Settings,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Empty State Components
 *
 * Reusable empty state components for consistent UX when there's no data to display.
 * Each component provides a clear call-to-action to help users get started.
 */

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Base Empty State Component
 *
 * Generic empty state with customizable icon, title, description, and actions
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="pt-12 pb-12">
        <div className="flex flex-col items-center text-center space-y-4 max-w-md mx-auto">
          {icon && <div className="p-4 rounded-full bg-muted">{icon}</div>}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {(action || secondaryAction) && (
            <div className="flex items-center gap-3 pt-2">
              {action && (
                <Button onClick={action.onClick} variant={action.variant || "default"}>
                  {action.label}
                </Button>
              )}
              {secondaryAction && (
                <Button onClick={secondaryAction.onClick} variant="outline">
                  {secondaryAction.label}
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * No Applications Empty State
 *
 * Used in candidate dashboard when no applications exist
 */
export function NoApplicationsEmptyState({ onBrowseJobs }: { onBrowseJobs: () => void }) {
  return (
    <EmptyState
      icon={<Briefcase className="w-8 h-8 text-muted-foreground" />}
      title="No applications yet"
      description="Start your job search today and apply to positions that match your skills and experience."
      action={{
        label: "Browse Jobs",
        onClick: onBrowseJobs,
      }}
    />
  );
}

/**
 * No Jobs Empty State
 *
 * Used in jobs page when no jobs exist
 */
export function NoJobsEmptyState({ onCreateJob }: { onCreateJob: () => void }) {
  return (
    <EmptyState
      icon={<Briefcase className="w-8 h-8 text-muted-foreground" />}
      title="No jobs posted yet"
      description="Create your first job posting to start attracting talented candidates to your company."
      action={{
        label: "Create Job",
        onClick: onCreateJob,
      }}
    />
  );
}

/**
 * No Candidates Empty State
 *
 * Used in talent pool when no candidates exist
 */
export function NoCandidatesEmptyState({ onAddCandidate }: { onAddCandidate: () => void }) {
  return (
    <EmptyState
      icon={<Users className="w-8 h-8 text-muted-foreground" />}
      title="No candidates in talent pool"
      description="Build your talent pool by adding candidates manually or importing from applications."
      action={{
        label: "Add Candidate",
        onClick: onAddCandidate,
      }}
    />
  );
}

/**
 * No Interviews Empty State
 *
 * Used in interviews page when no interviews are scheduled
 */
export function NoInterviewsEmptyState() {
  return (
    <EmptyState
      icon={<Calendar className="w-8 h-8 text-muted-foreground" />}
      title="No interviews scheduled"
      description="You don't have any upcoming interviews at the moment. Check back later for updates."
    />
  );
}

/**
 * No Search Results Empty State
 *
 * Used when search returns no results
 */
export function NoSearchResultsEmptyState({
  query,
  onClearSearch,
}: {
  query: string;
  onClearSearch: () => void;
}) {
  return (
    <EmptyState
      icon={<Search className="w-8 h-8 text-muted-foreground" />}
      title="No results found"
      description={`We couldn't find any results for "${query}". Try adjusting your search or clearing filters.`}
      action={{
        label: "Clear Search",
        onClick: onClearSearch,
        variant: "outline",
      }}
    />
  );
}

/**
 * No Filter Results Empty State
 *
 * Used when filters return no results
 */
export function NoFilterResultsEmptyState({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <EmptyState
      icon={<Filter className="w-8 h-8 text-muted-foreground" />}
      title="No matching results"
      description="No items match your current filters. Try adjusting or clearing your filters to see more results."
      action={{
        label: "Clear Filters",
        onClick: onClearFilters,
        variant: "outline",
      }}
    />
  );
}

/**
 * No Messages Empty State
 *
 * Used in messaging/communication pages
 */
export function NoMessagesEmptyState() {
  return (
    <EmptyState
      icon={<Mail className="w-8 h-8 text-muted-foreground" />}
      title="No messages"
      description="You don't have any messages yet. Messages from candidates and team members will appear here."
    />
  );
}

/**
 * No Notifications Empty State
 *
 * Used in notifications panel
 */
export function NoNotificationsEmptyState() {
  return (
    <EmptyState
      icon={<Inbox className="w-8 h-8 text-muted-foreground" />}
      title="You're all caught up!"
      description="No new notifications. We'll notify you when something important happens."
    />
  );
}

/**
 * No Folders Empty State
 *
 * Used in folders/collections pages
 */
export function NoFoldersEmptyState({ onCreateFolder }: { onCreateFolder: () => void }) {
  return (
    <EmptyState
      icon={<FolderOpen className="w-8 h-8 text-muted-foreground" />}
      title="No folders created"
      description="Create folders to organize your candidates and keep track of your talent pipeline."
      action={{
        label: "Create Folder",
        onClick: onCreateFolder,
      }}
    />
  );
}

/**
 * No Templates Empty State
 *
 * Used in email templates page
 */
export function NoTemplatesEmptyState({ onCreateTemplate }: { onCreateTemplate: () => void }) {
  return (
    <EmptyState
      icon={<FileText className="w-8 h-8 text-muted-foreground" />}
      title="No email templates"
      description="Create email templates to save time and maintain consistency in your candidate communications."
      action={{
        label: "Create Template",
        onClick: onCreateTemplate,
      }}
      secondaryAction={{
        label: "Load Defaults",
        onClick: () => {}, // This would trigger default template loading
      }}
    />
  );
}

/**
 * No Team Members Empty State
 *
 * Used in team management page
 */
export function NoTeamMembersEmptyState({ onInviteMember }: { onInviteMember: () => void }) {
  return (
    <EmptyState
      icon={<UserPlus className="w-8 h-8 text-muted-foreground" />}
      title="No team members"
      description="Invite your team members to collaborate on hiring and manage applications together."
      action={{
        label: "Invite Team Member",
        onClick: onInviteMember,
      }}
    />
  );
}

/**
 * No Companies Empty State
 *
 * Used in platform admin companies page
 */
export function NoCompaniesEmptyState() {
  return (
    <EmptyState
      icon={<Building2 className="w-8 h-8 text-muted-foreground" />}
      title="No companies registered"
      description="No companies have signed up yet. Companies will appear here once they create their accounts."
    />
  );
}

/**
 * Error State
 *
 * Used when data fails to load
 */
export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <EmptyState
      icon={<AlertCircle className="w-8 h-8 text-destructive" />}
      title="Failed to load data"
      description="We encountered an error loading this content. Please try again."
      action={{
        label: "Retry",
        onClick: onRetry,
      }}
    />
  );
}

/**
 * Permission Denied State
 *
 * Used when user doesn't have access to a resource
 */
export function PermissionDeniedState() {
  return (
    <EmptyState
      icon={<AlertCircle className="w-8 h-8 text-yellow-600" />}
      title="Access Denied"
      description="You don't have permission to access this resource. Contact your administrator if you believe this is an error."
    />
  );
}

/**
 * Maintenance State
 *
 * Used when feature is under maintenance
 */
export function MaintenanceState() {
  return (
    <EmptyState
      icon={<Settings className="w-8 h-8 text-muted-foreground" />}
      title="Under Maintenance"
      description="This feature is currently under maintenance. We'll be back shortly. Thank you for your patience."
    />
  );
}

/**
 * Coming Soon State
 *
 * Used for features that are planned but not yet implemented
 */
export function ComingSoonState({ featureName }: { featureName: string }) {
  return (
    <EmptyState
      icon={<Sparkles className="w-8 h-8 text-primary" />}
      title="Coming Soon"
      description={`${featureName} is currently in development. We'll notify you when it's ready.`}
    />
  );
}

/**
 * No Data Available State
 *
 * Generic state for when data is not available
 */
export function NoDataAvailableState({ resourceName }: { resourceName: string }) {
  return (
    <EmptyState
      icon={<Package className="w-8 h-8 text-muted-foreground" />}
      title="No data available"
      description={`There is no ${resourceName} data to display at this time.`}
    />
  );
}

/**
 * No Feedback Empty State
 *
 * Used in interviewer dashboard when no feedback is pending
 */
export function NoFeedbackEmptyState() {
  return (
    <EmptyState
      icon={<MessageSquare className="w-8 h-8 text-muted-foreground" />}
      title="No pending feedback"
      description="You don't have any interviews waiting for feedback. Great job staying on top of your reviews!"
    />
  );
}

/**
 * Compact Empty State
 *
 * Smaller empty state for inline use (e.g., empty tabs, empty sections)
 */
export function CompactEmptyState({
  icon,
  title,
  description,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center text-center space-y-3 py-8 px-4">
      {icon && <div className="p-3 rounded-full bg-muted">{icon}</div>}
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}

/**
 * Empty Table State
 *
 * Used for empty tables with filters
 */
export function EmptyTableState({
  title = "No data found",
  description = "No items match your current filters.",
  onClearFilters,
}: {
  title?: string;
  description?: string;
  onClearFilters?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="p-4 rounded-full bg-muted mb-4">
        <Search className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      {onClearFilters && (
        <Button onClick={onClearFilters} variant="outline" size="sm">
          Clear Filters
        </Button>
      )}
    </div>
  );
}

/**
 * Empty List State
 *
 * Used for empty lists (not in a card)
 */
export function EmptyListState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}) {
  return (
    <div className="flex flex-col items-center text-center space-y-4 py-12 px-4">
      {icon && <div className="p-4 rounded-full bg-muted">{icon}</div>}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && <p className="text-sm text-muted-foreground max-w-md">{description}</p>}
      </div>
      {action && (
        <Button onClick={action.onClick} className="mt-2">
          {action.label}
        </Button>
      )}
    </div>
  );
}
