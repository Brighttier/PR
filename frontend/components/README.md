# Frontend Components Documentation

This directory contains all reusable UI components for the Persona Recruit AI application.

## Directory Structure

```
components/
├── error-states/       # Error handling components
├── loading-states/     # Skeleton loaders and loading spinners
├── empty-states/       # Empty state components
├── ui/                 # Base UI components (shadcn/ui)
├── candidate/          # Candidate-specific components
├── recruiter/          # Recruiter-specific components
├── interviewer/        # Interviewer-specific components
├── platform-admin/     # Platform admin components
├── company-admin/      # Company admin components
├── dialogs/            # Dialog and modal components
├── forms/              # Form components
├── jobs/               # Job-related components
├── interviews/         # Interview-related components
└── layout/             # Layout components
```

---

## Error States

Error handling components for displaying various error scenarios.

### Components

**PageError** - Full page error display
```tsx
import { PageError } from "@/components/error-states";

<PageError
  title="Failed to load page"
  description="We couldn't load the requested page"
  error={error}
  onRetry={() => window.location.reload()}
/>
```

**FormError** - Form validation errors
```tsx
import { FormError, FieldError } from "@/components/error-states";

// Multiple errors
<FormError errors={["Email is required", "Password is too short"]} />

// Single field error
<FieldError message="Invalid email address" />
```

**NetworkError** - Network and API errors
```tsx
import { NetworkError, APIError } from "@/components/error-states";

// Network error with card variant
<NetworkError onRetry={() => refetch()} />

// API error with status code
<APIError statusCode={500} message="Server error occurred" />
```

---

## Loading States

Skeleton loaders and loading spinners for various UI components.

### Dashboard Skeletons

**DashboardGridSkeleton** - Complete dashboard loading state
```tsx
import { DashboardGridSkeleton } from "@/components/loading-states";

{isLoading ? <DashboardGridSkeleton /> : <DashboardContent />}
```

**StatsCardSkeleton** - Individual stats card loader
```tsx
import { StatsCardSkeleton } from "@/components/loading-states";

{isLoading ? <StatsCardSkeleton /> : <StatsCard data={data} />}
```

### Table Skeletons

**TableSkeleton** - Full-featured table loader
```tsx
import { TableSkeleton } from "@/components/loading-states";

<TableSkeleton
  rows={10}
  columns={6}
  showFilters
  showPagination
/>
```

**SimpleTableSkeleton** - Minimal table loader
```tsx
import { SimpleTableSkeleton } from "@/components/loading-states";

<SimpleTableSkeleton rows={5} columns={5} />
```

### Card Skeletons

**CardSkeleton** - Generic card loader
```tsx
import { CardSkeleton, CardGridSkeleton } from "@/components/loading-states";

// Single card
<CardSkeleton showHeader showFooter contentLines={4} />

// Grid of cards
<CardGridSkeleton count={6} columns={3} />
```

### Form Skeletons

**FormSkeleton** - Form loading state
```tsx
import { FormSkeleton, MultiStepFormSkeleton } from "@/components/loading-states";

// Standard form
<FormSkeleton fields={5} showTitle showFooter />

// Multi-step form/wizard
<MultiStepFormSkeleton steps={3} fieldsPerStep={4} />
```

### Application & Job Skeletons

**ApplicationCardSkeleton** - Application card loader
```tsx
import { ApplicationCardSkeletonList } from "@/components/loading-states";

<ApplicationCardSkeletonList count={5} />
```

**JobCardSkeleton** - Job card loader
```tsx
import { JobCardSkeletonGrid } from "@/components/loading-states";

<JobCardSkeletonGrid count={6} columns={3} />
```

### Page Loading Spinners

**PageLoading** - Full page loading spinner
```tsx
import { PageLoading } from "@/components/loading-states";

<PageLoading message="Loading dashboard..." />
```

**InlineLoading** - Inline loading spinner
```tsx
import { InlineLoading } from "@/components/loading-states";

<InlineLoading message="Saving..." />
```

**ButtonLoading** - Button loading state
```tsx
import { ButtonLoading } from "@/components/loading-states";

<Button disabled={isLoading}>
  {isLoading ? <ButtonLoading /> : "Submit"}
</Button>
```

**OverlayLoading** - Full screen overlay
```tsx
import { OverlayLoading } from "@/components/loading-states";

{isProcessing && <OverlayLoading message="Processing..." />}
```

---

## Empty States

Empty state components for displaying "no data" scenarios.

### Generic Empty State

**EmptyState** - Reusable base component
```tsx
import { EmptyState } from "@/components/empty-states";

<EmptyState
  icon={Briefcase}
  title="No jobs found"
  description="Get started by creating your first job posting"
  action={{
    label: "Create Job",
    onClick: () => router.push('/dashboard/jobs/new')
  }}
/>
```

### Application Empty States

**NoApplications** - No applications found
```tsx
import { NoApplications } from "@/components/empty-states";

// Candidate view
<NoApplications variant="candidate" />

// Recruiter view
<NoApplications variant="recruiter" />

// With filters
<NoApplications filtered onClearFilters={() => reset()} />
```

**NoApplicationsForJob** - No applications for specific job
```tsx
import { NoApplicationsForJob } from "@/components/empty-states";

<NoApplicationsForJob jobTitle="Senior Developer" />
```

### Job Empty States

**NoJobs** - No jobs found
```tsx
import { NoJobs } from "@/components/empty-states";

// Public career page
<NoJobs variant="public" />

// Recruiter dashboard
<NoJobs variant="recruiter" onCreateJob={() => openDialog()} />
```

**NoActiveJobs** - No active jobs
```tsx
import { NoActiveJobs } from "@/components/empty-states";

<NoActiveJobs onCreateJob={() => openDialog()} />
```

### Interview Empty States

**NoInterviews** - No interviews scheduled
```tsx
import { NoInterviews } from "@/components/empty-states";

// Candidate view - upcoming
<NoInterviews variant="candidate" status="upcoming" />

// Interviewer view - pending feedback
<NoInterviews variant="interviewer" status="pending" />
```

**NoScheduledInterviews** - No interviews for application
```tsx
import { NoScheduledInterviews } from "@/components/empty-states";

<NoScheduledInterviews
  onScheduleInterview={() => openDialog()}
  canSchedule={true}
/>
```

### Candidate Empty States

**NoCandidates** - No candidates found
```tsx
import { NoCandidates } from "@/components/empty-states";

// Talent pool
<NoCandidates variant="talent-pool" onAddCandidate={() => openDialog()} />

// Search results
<NoCandidates variant="search" filtered onClearFilters={() => reset()} />
```

**NoTopMatches** - No high-scoring matches
```tsx
import { NoTopMatches } from "@/components/empty-states";

<NoTopMatches threshold={70} />
```

### Template Empty States

**NoTemplates** - No templates found
```tsx
import { NoTemplates } from "@/components/empty-states";

<NoTemplates
  templateType="email"
  onCreateTemplate={() => router.push('/dashboard/templates/new')}
/>
```

### Team Member Empty States

**NoTeamMembers** - No team members
```tsx
import { NoTeamMembers } from "@/components/empty-states";

<NoTeamMembers onInviteMember={() => openInviteDialog()} />

// Pending invites
<NoTeamMembers variant="pending-invites" />
```

### Search Empty States

**NoSearchResults** - No search results
```tsx
import { NoSearchResults } from "@/components/empty-states";

<NoSearchResults
  query="senior developer"
  hasFilters
  onClearSearch={() => setQuery('')}
  onClearFilters={() => resetFilters()}
  suggestions={["Try different keywords", "Check your spelling"]}
/>
```

**NoFilterResults** - No filter matches
```tsx
import { NoFilterResults } from "@/components/empty-states";

<NoFilterResults
  onClearFilters={() => reset()}
  filterCount={3}
/>
```

---

## Best Practices

### Error Handling

1. **Use PageError for page-level errors** - When entire page fails to load
2. **Use NetworkError for API failures** - Network issues, timeouts, server errors
3. **Use FormError for validation** - Form submission errors, validation failures
4. **Always provide retry mechanisms** - Give users a way to recover from errors

### Loading States

1. **Match skeleton to content structure** - Skeleton should match the final UI
2. **Use appropriate animation delays** - Stagger animations for better UX
3. **Show loading for operations > 300ms** - Don't flash loaders for fast operations
4. **Use inline loaders for buttons** - Show loading state in buttons during async actions

### Empty States

1. **Always provide context** - Explain why there's no data
2. **Offer next steps** - Provide clear actions (Create, Browse, etc.)
3. **Match user role** - Show relevant messages for candidates vs recruiters
4. **Handle filtered states** - Different messages when filters are active

### Component Selection

**Use DashboardGridSkeleton when:**
- Loading complete dashboard page
- Multiple stats cards + charts

**Use TableSkeleton when:**
- Loading data tables with filters
- Need pagination skeleton

**Use CardSkeleton when:**
- Loading individual cards
- Grid or list of cards

**Use FormSkeleton when:**
- Loading forms
- Multi-step wizards

**Use PageLoading when:**
- Loading entire page
- Initial app load

---

## TypeScript Types

All components are fully typed with TypeScript. Import types when needed:

```tsx
import type { EmptyStateProps } from "@/components/empty-states/empty-state";
import type { PageErrorProps } from "@/components/error-states/page-error";
```

---

## Accessibility

All components follow accessibility best practices:

- ✅ Proper ARIA labels
- ✅ Keyboard navigation support
- ✅ Screen reader friendly
- ✅ Color contrast compliant
- ✅ Focus indicators

---

## Contributing

When adding new components:

1. Create component in appropriate directory
2. Add TypeScript types
3. Include JSDoc comments
4. Export from index.ts
5. Update this README
6. Add usage examples

---

## Questions?

For questions or issues, contact the development team or refer to CLAUDE.md for detailed architecture documentation.
