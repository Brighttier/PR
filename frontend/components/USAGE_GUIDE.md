# Component Usage Guide

Complete guide for using error handling, loading states, and empty states in Persona Recruit AI.

---

## Quick Start

### Installation

All components are already installed and ready to use. Simply import them:

```tsx
// Error states
import { PageError, FormError, NetworkError } from "@/components/error-states";

// Loading states
import {
  DashboardGridSkeleton,
  TableSkeleton,
  PageLoading
} from "@/components/loading-states";

// Empty states
import {
  NoApplications,
  NoJobs,
  EmptyState
} from "@/components/empty-states";
```

---

## Error Handling

### 1. Global Error Boundary (Already Exists)

Wrap your entire app in the error boundary (already implemented in layout):

```tsx
import { ErrorBoundary } from "@/components/error-boundary";

<ErrorBoundary>
  <YourApp />
</ErrorBoundary>
```

### 2. Page-Level Errors

Use `PageError` when an entire page fails to load:

```tsx
"use client";

import { PageError } from "@/components/error-states";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData()
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, []);

  if (error) {
    return (
      <PageError
        title="Failed to load dashboard"
        description="We couldn't load your dashboard data"
        error={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (isLoading) return <DashboardGridSkeleton />;

  return <DashboardContent data={data} />;
}
```

### 3. Network Errors

Use `NetworkError` for API failures:

```tsx
import { NetworkError } from "@/components/error-states";
import { useState } from "react";

function ApplicationsList() {
  const [error, setError] = useState(null);
  const { data, isLoading, refetch } = useApplications();

  if (error) {
    return (
      <NetworkError
        variant="alert"
        title="Failed to load applications"
        onRetry={refetch}
      />
    );
  }

  // ... rest of component
}
```

### 4. Form Validation Errors

Use `FormError` for form validation:

```tsx
import { FormError, FieldError } from "@/components/error-states";
import { useState } from "react";

function JobForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Submit form...
  };

  return (
    <form onSubmit={handleSubmit}>
      {Object.keys(errors).length > 0 && (
        <FormError errors={errors} title="Please fix the following errors:" />
      )}

      <div>
        <label>Job Title</label>
        <input name="title" />
        <FieldError message={errors.title} />
      </div>

      <button type="submit">Create Job</button>
    </form>
  );
}
```

---

## Loading States

### 1. Page Loading

Use `PageLoading` for full page loads:

```tsx
import { PageLoading } from "@/components/loading-states";

function App() {
  const { isInitializing } = useAuth();

  if (isInitializing) {
    return <PageLoading message="Loading your workspace..." />;
  }

  return <AppContent />;
}
```

### 2. Dashboard Skeleton

Use `DashboardGridSkeleton` for dashboard pages:

```tsx
import { DashboardGridSkeleton } from "@/components/loading-states";

function RecruiterDashboard() {
  const { data, isLoading } = useDashboardData();

  if (isLoading) {
    return <DashboardGridSkeleton />;
  }

  return (
    <div className="space-y-6">
      <StatsCards data={data.stats} />
      <Charts data={data.charts} />
      <RecentApplications data={data.applications} />
    </div>
  );
}
```

### 3. Table Skeleton

Use `TableSkeleton` for data tables:

```tsx
import { TableSkeleton } from "@/components/loading-states";

function ApplicationsTable() {
  const { applications, isLoading } = useApplications();

  if (isLoading) {
    return (
      <TableSkeleton
        rows={10}
        columns={6}
        showFilters
        showPagination
      />
    );
  }

  return <DataTable data={applications} />;
}
```

### 4. Card Skeletons

Use `CardSkeleton` for card grids:

```tsx
import { CardGridSkeleton } from "@/components/loading-states";

function JobsList() {
  const { jobs, isLoading } = useJobs();

  if (isLoading) {
    return <CardGridSkeleton count={6} columns={3} />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {jobs.map(job => <JobCard key={job.id} job={job} />)}
    </div>
  );
}
```

### 5. Form Skeleton

Use `FormSkeleton` for loading forms:

```tsx
import { FormSkeleton } from "@/components/loading-states";

function EditJobPage({ params }) {
  const { job, isLoading } = useJob(params.id);

  if (isLoading) {
    return <FormSkeleton fields={8} showTitle showFooter />;
  }

  return <JobEditForm job={job} />;
}
```

### 6. Button Loading

Use `ButtonLoading` in async buttons:

```tsx
import { ButtonLoading } from "@/components/loading-states";
import { Button } from "@/components/ui/button";
import { useState } from "react";

function SubmitButton() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button onClick={handleSubmit} disabled={isSubmitting}>
      {isSubmitting ? (
        <>
          <ButtonLoading className="mr-2" />
          Submitting...
        </>
      ) : (
        "Submit Application"
      )}
    </Button>
  );
}
```

### 7. Overlay Loading

Use `OverlayLoading` for blocking operations:

```tsx
import { OverlayLoading } from "@/components/loading-states";
import { useState } from "react";

function FileUploader() {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file) => {
    setIsUploading(true);
    try {
      await uploadResume(file);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <FileInput onUpload={handleUpload} />
      {isUploading && <OverlayLoading message="Uploading resume..." />}
    </>
  );
}
```

---

## Empty States

### 1. No Applications

Use `NoApplications` when there are no applications:

```tsx
import { NoApplications } from "@/components/empty-states";

function ApplicationsList({ variant = "candidate" }) {
  const { applications, isLoading } = useApplications();

  if (isLoading) return <ApplicationCardSkeletonList />;

  if (applications.length === 0) {
    return <NoApplications variant={variant} />;
  }

  return applications.map(app => <ApplicationCard key={app.id} app={app} />);
}
```

### 2. No Jobs

Use `NoJobs` for empty job lists:

```tsx
import { NoJobs } from "@/components/empty-states";

function JobsPage({ variant = "recruiter" }) {
  const { jobs, isLoading } = useJobs();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  if (isLoading) return <JobCardSkeletonGrid />;

  if (jobs.length === 0) {
    return (
      <>
        <NoJobs
          variant={variant}
          onCreateJob={() => setShowCreateDialog(true)}
        />
        <CreateJobDialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} />
      </>
    );
  }

  return <JobsGrid jobs={jobs} />;
}
```

### 3. No Interviews

Use `NoInterviews` for interview lists:

```tsx
import { NoInterviews } from "@/components/empty-states";

function InterviewsPage({ variant = "candidate" }) {
  const { interviews, isLoading } = useInterviews();

  if (isLoading) return <PageLoading />;

  if (interviews.length === 0) {
    return <NoInterviews variant={variant} status="upcoming" />;
  }

  return <InterviewsList interviews={interviews} />;
}
```

### 4. No Search Results

Use `NoSearchResults` when search returns no matches:

```tsx
import { NoSearchResults } from "@/components/empty-states";

function SearchableList() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({});
  const { results, isLoading } = useSearch(query, filters);

  if (isLoading) return <TableSkeleton />;

  if (results.length === 0) {
    return (
      <NoSearchResults
        query={query}
        hasFilters={Object.keys(filters).length > 0}
        onClearSearch={() => setQuery("")}
        onClearFilters={() => setFilters({})}
      />
    );
  }

  return <ResultsList results={results} />;
}
```

### 5. Custom Empty States

Use `EmptyState` for custom scenarios:

```tsx
import { EmptyState } from "@/components/empty-states";
import { Folder } from "lucide-react";

function CustomEmptyState() {
  return (
    <EmptyState
      icon={Folder}
      title="No files uploaded"
      description="Upload your first document to get started"
      action={{
        label: "Upload File",
        onClick: () => openUploadDialog(),
      }}
    />
  );
}
```

---

## Complete Page Example

Here's a complete example combining all three component types:

```tsx
"use client";

import { useState, useEffect } from "react";
import { PageError } from "@/components/error-states";
import { DashboardGridSkeleton } from "@/components/loading-states";
import { NoApplications } from "@/components/empty-states";
import { ApplicationsTable } from "@/components/applications/applications-table";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchApplications()
      .then(setApplications)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, []);

  // Error state
  if (error) {
    return (
      <PageError
        title="Failed to load applications"
        description="We couldn't load your applications"
        error={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Loading state
  if (isLoading) {
    return <DashboardGridSkeleton />;
  }

  // Empty state
  if (applications.length === 0) {
    return <NoApplications variant="recruiter" />;
  }

  // Success state
  return <ApplicationsTable applications={applications} />;
}
```

---

## Best Practices

### Error Handling

1. **Always catch errors at appropriate levels**
   - Use global error boundary for unexpected errors
   - Use PageError for page-level failures
   - Use NetworkError for API failures
   - Use FormError for validation errors

2. **Provide retry mechanisms**
   - Give users a way to recover
   - Show helpful error messages
   - Include contact support option

3. **Log errors appropriately**
   - Development: Show detailed errors
   - Production: Log to error tracking service
   - User: Show friendly messages

### Loading States

1. **Match skeleton to content**
   - Skeleton should mirror final UI structure
   - Use appropriate number of rows/columns
   - Include all major sections

2. **Only show for slow operations**
   - Don't flash loaders for < 300ms operations
   - Use `Suspense` for React 18+ features
   - Consider optimistic UI updates

3. **Provide context**
   - Show meaningful loading messages
   - Indicate progress when possible
   - Use appropriate spinner sizes

### Empty States

1. **Always provide next steps**
   - Include actionable CTA buttons
   - Explain why there's no data
   - Guide users to create content

2. **Differentiate between scenarios**
   - No data vs. filtered results
   - First-time user vs. returning user
   - Different roles (candidate vs. recruiter)

3. **Use appropriate tone**
   - Encouraging for first-time users
   - Helpful for filtered results
   - Informative for system states

---

## TypeScript Examples

### Typed Error States

```tsx
import { PageErrorProps } from "@/components/error-states/page-error";

const errorConfig: PageErrorProps = {
  title: "Custom Error",
  description: "Something went wrong",
  error: new Error("API Error"),
  onRetry: () => refetch(),
};

<PageError {...errorConfig} />
```

### Typed Loading States

```tsx
import { DashboardGridSkeleton } from "@/components/loading-states";

type LoadingState = "idle" | "loading" | "success" | "error";

function Dashboard() {
  const [state, setState] = useState<LoadingState>("loading");

  if (state === "loading") {
    return <DashboardGridSkeleton />;
  }

  // ... rest of component
}
```

---

## Testing

### Testing Error States

```tsx
import { render, screen } from "@testing-library/react";
import { PageError } from "@/components/error-states";

test("renders error message", () => {
  render(<PageError title="Error" description="Failed" />);
  expect(screen.getByText("Error")).toBeInTheDocument();
});
```

### Testing Empty States

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { NoApplications } from "@/components/empty-states";

test("calls action on button click", () => {
  const mockAction = jest.fn();
  render(<NoApplications variant="candidate" />);

  const button = screen.getByText("Browse Jobs");
  fireEvent.click(button);
  // Assert navigation occurred
});
```

---

## Troubleshooting

### Common Issues

**Issue: Skeleton doesn't match content**
- Solution: Adjust rows/columns/contentLines props
- Use browser DevTools to match structure

**Issue: Empty state shows when there's data**
- Solution: Check loading state logic
- Ensure data is properly set before checking length

**Issue: Error boundary not catching errors**
- Solution: Errors must be thrown during render
- Use error states for async errors

**Issue: TypeScript errors on imports**
- Solution: Check import paths
- Use `@/components/` alias
- Verify index.ts exports

---

## Additional Resources

- See `/frontend/components/README.md` for component directory structure
- See `CLAUDE.md` for complete UI/UX architecture
- See individual component files for detailed JSDoc comments

---

## Support

For questions or issues:
1. Check this guide and README.md
2. Review component source code (heavily commented)
3. Refer to CLAUDE.md for architecture details
4. Contact development team

---

**Last Updated:** 2025-11-14
