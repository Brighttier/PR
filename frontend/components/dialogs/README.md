# Dialog Components

This directory contains all modal/dialog components for the Persona Recruit AI application. Each dialog is implemented using Shadcn's Dialog component and follows consistent patterns for form handling, validation, and user feedback.

## Available Dialogs

### 1. **CreateJobDialog** (`create-job-dialog.tsx`)
Creates a new job posting with comprehensive form fields.

**Props:**
- `trigger?: React.ReactNode` - Custom trigger button (optional)
- `onSuccess?: (jobId: string) => void` - Callback on successful creation

**Features:**
- AI-powered job description generation
- Skills tags input
- Salary range validation
- Rich form with all job details
- Automatic Firestore document creation

**Usage:**
```tsx
import { CreateJobDialog } from '@/components/dialogs';

<CreateJobDialog
  onSuccess={(jobId) => router.push(`/dashboard/jobs/${jobId}`)}
/>
```

---

### 2. **EditJobDialog** (`edit-job-dialog.tsx`)
Edits an existing job posting with pre-filled data.

**Props:**
- `trigger?: React.ReactNode` - Custom trigger button
- `jobId: string` - Job document ID to edit
- `onSuccess?: () => void` - Callback on successful update

**Features:**
- Pre-populated form fields from existing job data
- Archive job option
- Delete job option (with confirmation)
- Same validation as create dialog

**Usage:**
```tsx
import { EditJobDialog } from '@/components/dialogs';

<EditJobDialog
  jobId={job.id}
  onSuccess={() => refresh()}
/>
```

---

### 3. **ScheduleInterviewDialog** (`schedule-interview-dialog.tsx`)
Schedules interviews (AI or face-to-face) with candidates.

**Props:**
- `trigger?: React.ReactNode` - Custom trigger button
- `applicationId: string` - Application ID
- `candidateId: string` - Candidate ID
- `candidateName: string` - Candidate's name
- `candidateEmail: string` - Candidate's email
- `jobId: string` - Job ID
- `jobTitle: string` - Job title for context
- `onSuccess?: () => void` - Callback on successful scheduling

**Features:**
- Multi-step interview type selection:
  - AI Screening
  - AI Technical Interview
  - Face-to-Face Interview
  - Panel Interview
- Date/time pickers with duration selection
- Interviewer multi-select (for face-to-face/panel)
- Meeting link input (Zoom, Google Meet, Teams)
- Location input for in-person interviews
- Internal notes field
- Automatic calendar invite generation
- Email notifications to all participants

**Usage:**
```tsx
import { ScheduleInterviewDialog } from '@/components/dialogs';

<ScheduleInterviewDialog
  applicationId={application.id}
  candidateId={application.candidateId}
  candidateName={application.candidateName}
  candidateEmail={application.candidateEmail}
  jobId={application.jobId}
  jobTitle={application.jobTitle}
  onSuccess={() => refreshInterviews()}
/>
```

---

### 4. **SendEmailDialog** (`send-email-dialog.tsx`)
Composes and sends emails to candidates with template support.

**Props:**
- `trigger?: React.ReactNode` - Custom trigger button
- `recipientEmail: string` - Recipient's email (read-only)
- `recipientName: string` - Recipient's name
- `candidateId?: string` - Candidate ID for context
- `jobTitle?: string` - Job title for variable replacement
- `companyName?: string` - Company name for variable replacement
- `interviewDate?: string` - Interview date for variable replacement
- `interviewTime?: string` - Interview time for variable replacement
- `meetingLink?: string` - Meeting link for variable replacement
- `onSuccess?: () => void` - Callback on successful send

**Features:**
- Template selector with categories
- Variable replacement system:
  - `{{candidateName}}`
  - `{{jobTitle}}`
  - `{{companyName}}`
  - `{{interviewDate}}`
  - `{{interviewTime}}`
  - `{{meetingLink}}`
- CC/BCC fields
- File attachments (max 5 files, 10MB each)
- Real-time variable preview
- Email audit logging

**Usage:**
```tsx
import { SendEmailDialog } from '@/components/dialogs';

<SendEmailDialog
  recipientEmail={candidate.email}
  recipientName={candidate.name}
  jobTitle={job.title}
  companyName={company.name}
  onSuccess={() => toast({ title: "Email sent!" })}
/>
```

---

### 5. **AddCandidateDialog** (`add-candidate-dialog.tsx`)
Manually adds a candidate to the talent pool.

**Props:**
- `trigger?: React.ReactNode` - Custom trigger button
- `onSuccess?: () => void` - Callback on successful addition

**Features:**
- Full name, email, phone inputs
- Resume upload (PDF, DOC, DOCX, max 5MB)
- LinkedIn URL field
- Skills tags input
- Notes field
- Automatic AI resume parsing
- Adds to talent pool collection

**Usage:**
```tsx
import { AddCandidateDialog } from '@/components/dialogs';

<AddCandidateDialog
  onSuccess={() => refreshTalentPool()}
/>
```

---

### 6. **DeleteConfirmationDialog** (`delete-confirmation-dialog.tsx`)
Reusable confirmation dialog for destructive actions.

**Props:**
- `trigger?: React.ReactNode` - Custom trigger button
- `title?: string` - Dialog title (default: "Are you sure?")
- `description?: string` - Warning message
- `confirmText?: string` - Confirm button text (default: "Delete")
- `onConfirm: () => void | Promise<void>` - Action to perform on confirm

**Features:**
- Red destructive styling
- Async action support with loading state
- Customizable messages
- Standard cancel/confirm pattern

**Usage:**
```tsx
import { DeleteConfirmationDialog } from '@/components/dialogs';

<DeleteConfirmationDialog
  title="Delete Job Posting?"
  description="This will permanently delete this job and all associated applications."
  confirmText="Delete Job"
  onConfirm={async () => {
    await deleteDoc(doc(db, 'jobs', jobId));
    toast({ title: "Job deleted" });
  }}
  trigger={<Button variant="destructive">Delete</Button>}
/>
```

---

### 7. **InviteTeamMemberDialog** (`invite-team-member-dialog.tsx`)
Invites new team members to join the company.

**Props:**
- `trigger?: React.ReactNode` - Custom trigger button
- `onSuccess?: () => void` - Callback on successful invite

**Features:**
- Email validation
- Display name input
- Role selection (Recruiter, Interviewer, HR Admin)
- Role descriptions shown based on selection
- Optional welcome email checkbox (checked by default)
- Secure token generation (32 characters)
- 7-day expiry on invites
- Creates invite document in Firestore
- Triggers email with accept link: `/auth/accept-invite?token={token}`

**Usage:**
```tsx
import { InviteTeamMemberDialog } from '@/components/dialogs';

<InviteTeamMemberDialog
  onSuccess={() => refreshTeamMembers()}
/>
```

---

### 8. **ChangeStatusDialog** (`change-status-dialog.tsx`)
Updates application status and stage.

**Props:**
- `trigger?: React.ReactNode` - Custom trigger button
- `applicationId: string` - Application document ID
- `currentStatus: string` - Current status
- `currentStage: string` - Current stage
- `candidateName: string` - Candidate's name for context
- `onSuccess?: () => void` - Callback on successful update

**Features:**
- Status dropdown with 9 options:
  - Applied
  - Under Review
  - Screening Scheduled
  - Technical Interview Scheduled
  - Interview Scheduled
  - Offer Extended
  - Hired
  - Rejected
  - Withdrawn
- Stage dropdown with 7 options:
  - Application Review
  - Initial Screening
  - Technical Interview
  - Face-to-Face Interview
  - Final Review
  - Offer
  - Closed
- Color-coded status badges
- Optional notes field
- Warning for terminal statuses (Hired, Rejected)
- Automatic candidate email notification
- Activity logging

**Usage:**
```tsx
import { ChangeStatusDialog } from '@/components/dialogs';

<ChangeStatusDialog
  applicationId={application.id}
  currentStatus={application.status}
  currentStage={application.stage}
  candidateName={application.candidateName}
  onSuccess={() => refreshApplication()}
/>
```

---

### 9. **AddNoteDialog** (`add-note-dialog.tsx`)
Adds internal notes to applications.

**Props:**
- `trigger?: React.ReactNode` - Custom trigger button
- `applicationId: string` - Application document ID
- `candidateName: string` - Candidate's name for context
- `onSuccess?: () => void` - Callback on successful note addition

**Features:**
- Multi-line note textarea
- Character counter
- Private note checkbox
  - Private notes visible only to HR Admins and note author
  - Regular notes visible to all team members
- Automatic metadata capture:
  - Note author (name, role)
  - Timestamp
  - Unique note ID
- Updates `lastNoteAt` timestamp on application
- Stored in `notes` array field

**Usage:**
```tsx
import { AddNoteDialog } from '@/components/dialogs';

<AddNoteDialog
  applicationId={application.id}
  candidateName={application.candidateName}
  onSuccess={() => refreshNotes()}
/>
```

---

### 10. **CreateTemplateDialog** (`create-template-dialog.tsx`)
Creates reusable templates for emails, interviews, or job descriptions.

**Props:**
- `trigger?: React.ReactNode` - Custom trigger button
- `onSuccess?: (templateId: string) => void` - Callback with created template ID

**Features:**
- Template type selection:
  - Email Template
  - Interview Questions Template
  - Job Description Template
- Category selection (for email templates)
- Subject line field (for email templates)
- AI content generation based on template type
- Variable insertion system
- Preview tab for real-time content preview
- Rich textarea with character counter
- Saved to company's templates collection

**Usage:**
```tsx
import { CreateTemplateDialog } from '@/components/dialogs';

<CreateTemplateDialog
  onSuccess={(templateId) => router.push(`/dashboard/templates/${templateId}`)}
/>
```

---

## Common Patterns

### Form Validation
All dialogs implement client-side validation with clear error messages:
```tsx
if (!formData.email.trim()) {
  toast({
    title: "Validation error",
    description: "Email is required.",
    variant: "destructive",
  });
  return;
}
```

### Loading States
Every dialog shows loading states during async operations:
```tsx
<Button disabled={loading}>
  {loading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Saving...
    </>
  ) : (
    "Save Changes"
  )}
</Button>
```

### Toast Notifications
Success and error feedback using toast notifications:
```tsx
toast({
  title: "Success!",
  description: "Your changes have been saved.",
});

toast({
  title: "Error",
  description: "Failed to save. Please try again.",
  variant: "destructive",
});
```

### Dialog Close on Success
Dialogs automatically close and reset form after successful submission:
```tsx
setFormData(initialState);
setOpen(false);
if (onSuccess) onSuccess();
```

---

## Best Practices

### 1. Always Provide Trigger
```tsx
// Good
<CreateJobDialog
  trigger={<Button>Create Job</Button>}
/>

// Also Good (uses default trigger)
<CreateJobDialog />
```

### 2. Handle Success Callbacks
```tsx
<EditJobDialog
  jobId={job.id}
  onSuccess={() => {
    refreshJobs();
    router.refresh();
  }}
/>
```

### 3. Use TypeScript Types
All dialogs have strongly-typed props interfaces.

### 4. Implement Error Boundaries
Wrap dialogs in error boundaries for production:
```tsx
<ErrorBoundary fallback={<div>Error loading dialog</div>}>
  <CreateJobDialog />
</ErrorBoundary>
```

### 5. Accessibility
All dialogs use proper ARIA attributes via Shadcn's Dialog component:
- `role="dialog"`
- `aria-labelledby` for title
- `aria-describedby` for description
- Keyboard navigation support (ESC to close)

---

## Future Enhancements

- [ ] Add form validation with `react-hook-form` + `zod` schemas
- [ ] Implement rich text editor for email templates
- [ ] Add drag-and-drop file upload for attachments
- [ ] Implement real-time collaborative editing for templates
- [ ] Add dialog analytics tracking
- [ ] Implement undo/redo for form changes
- [ ] Add keyboard shortcuts (e.g., Cmd+Enter to submit)

---

## Dependencies

- `@/components/ui/dialog` - Base dialog component (Shadcn)
- `@/components/ui/button` - Button component
- `@/components/ui/input` - Input fields
- `@/components/ui/textarea` - Multi-line text inputs
- `@/components/ui/select` - Dropdown selects
- `@/components/ui/label` - Form labels
- `@/components/ui/checkbox` - Checkboxes
- `@/components/ui/badge` - Status/tag badges
- `@/components/ui/tooltip` - Tooltips
- `@/components/ui/tabs` - Tabbed interfaces
- `@/hooks/use-toast` - Toast notifications
- `@/lib/firebase` - Firestore database
- `@/components/auth/auth-provider` - Authentication context
- `lucide-react` - Icon library

---

## Testing

To test dialogs in development:

1. **Import the dialog:**
   ```tsx
   import { CreateJobDialog } from '@/components/dialogs';
   ```

2. **Add to your page:**
   ```tsx
   export default function TestPage() {
     return <CreateJobDialog />;
   }
   ```

3. **Test validation:**
   - Try submitting empty forms
   - Test edge cases (special characters, long text, etc.)
   - Verify error messages

4. **Test success flows:**
   - Verify data saved to Firestore
   - Check toast notifications
   - Confirm callbacks executed

5. **Test loading states:**
   - Simulate slow network
   - Verify buttons disabled during submission
   - Check loading spinners

---

## Maintenance

When updating dialogs:

1. Update this README if adding new props or features
2. Ensure TypeScript types are accurate
3. Test in multiple browsers (Chrome, Safari, Firefox)
4. Test on mobile devices
5. Update CLAUDE.md if changing UX patterns
6. Add console error handling for debugging

---

**Last Updated:** 2025-11-14
**Version:** 1.0
**Maintainer:** Persona Recruit AI Team
