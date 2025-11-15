# Dialog Usage Examples

Practical examples of how to use each dialog component in your application.

---

## 1. Job Management Page

```tsx
"use client";

import { useState } from "react";
import { CreateJobDialog, EditJobDialog, DeleteConfirmationDialog } from "@/components/dialogs";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function JobsPage() {
  const [selectedJob, setSelectedJob] = useState(null);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Job Postings</h1>

        {/* Create Job Dialog */}
        <CreateJobDialog
          onSuccess={(jobId) => {
            console.log("Job created:", jobId);
            // Refresh jobs list
          }}
        />
      </div>

      {/* Jobs Table */}
      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-semibold">{job.title}</h3>
              <p className="text-sm text-muted-foreground">{job.location}</p>
            </div>

            <div className="flex gap-2">
              {/* Edit Job Dialog */}
              <EditJobDialog
                jobId={job.id}
                trigger={
                  <Button variant="outline" size="sm">
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                }
                onSuccess={() => {
                  console.log("Job updated");
                  // Refresh jobs list
                }}
              />

              {/* Delete Confirmation Dialog */}
              <DeleteConfirmationDialog
                title="Delete Job Posting?"
                description="This will permanently delete this job and all associated applications."
                confirmText="Delete Job"
                onConfirm={async () => {
                  await deleteDoc(doc(db, "jobs", job.id));
                  // Refresh jobs list
                }}
                trigger={
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                }
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 2. Application Details Page

```tsx
"use client";

import {
  ScheduleInterviewDialog,
  SendEmailDialog,
  ChangeStatusDialog,
  AddNoteDialog,
} from "@/components/dialogs";
import { Button } from "@/components/ui/button";
import { Calendar, Mail, RefreshCw, StickyNote } from "lucide-react";

export default function ApplicationDetailsPage({ application }) {
  return (
    <div className="p-6 space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{application.candidateName}</h1>
          <p className="text-muted-foreground">Applied for {application.jobTitle}</p>
        </div>

        <div className="flex gap-2">
          {/* Schedule Interview */}
          <ScheduleInterviewDialog
            applicationId={application.id}
            candidateId={application.candidateId}
            candidateName={application.candidateName}
            candidateEmail={application.candidateEmail}
            jobId={application.jobId}
            jobTitle={application.jobTitle}
            trigger={
              <Button>
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Interview
              </Button>
            }
            onSuccess={() => {
              // Refresh interviews list
            }}
          />

          {/* Send Email */}
          <SendEmailDialog
            recipientEmail={application.candidateEmail}
            recipientName={application.candidateName}
            jobTitle={application.jobTitle}
            companyName="Your Company"
            trigger={
              <Button variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
            }
            onSuccess={() => {
              // Log email sent
            }}
          />

          {/* Change Status */}
          <ChangeStatusDialog
            applicationId={application.id}
            currentStatus={application.status}
            currentStage={application.stage}
            candidateName={application.candidateName}
            trigger={
              <Button variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Change Status
              </Button>
            }
            onSuccess={() => {
              // Refresh application
            }}
          />

          {/* Add Note */}
          <AddNoteDialog
            applicationId={application.id}
            candidateName={application.candidateName}
            trigger={
              <Button variant="outline">
                <StickyNote className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            }
            onSuccess={() => {
              // Refresh notes list
            }}
          />
        </div>
      </div>

      {/* Application Content */}
      {/* ... rest of page ... */}
    </div>
  );
}
```

---

## 3. Team Management Page

```tsx
"use client";

import { InviteTeamMemberDialog, DeleteConfirmationDialog } from "@/components/dialogs";
import { Button } from "@/components/ui/button";
import { UserPlus, Trash2 } from "lucide-react";

export default function TeamPage({ teamMembers }) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Team Members</h1>

        {/* Invite Team Member */}
        <InviteTeamMemberDialog
          onSuccess={() => {
            // Refresh team members list
          }}
        />
      </div>

      {/* Team Members Table */}
      <div className="space-y-4">
        {teamMembers.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <img
                src={member.photoURL || "/default-avatar.png"}
                alt={member.displayName}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-semibold">{member.displayName}</p>
                <p className="text-sm text-muted-foreground">{member.email}</p>
              </div>
              <Badge>{member.role}</Badge>
            </div>

            {member.uid !== currentUser.uid && (
              <DeleteConfirmationDialog
                title="Remove Team Member?"
                description={`${member.displayName} will lose access to the platform.`}
                confirmText="Remove"
                onConfirm={async () => {
                  await deleteDoc(doc(db, "users", member.uid));
                  // Refresh team members
                }}
                trigger={
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                }
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 4. Templates Page

```tsx
"use client";

import { CreateTemplateDialog, DeleteConfirmationDialog } from "@/components/dialogs";
import { Button } from "@/components/ui/button";
import { FileText, Trash2 } from "lucide-react";

export default function TemplatesPage({ templates }) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Email Templates</h1>

        {/* Create Template */}
        <CreateTemplateDialog
          onSuccess={(templateId) => {
            console.log("Template created:", templateId);
            // Refresh templates list
          }}
        />
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div key={template.id} className="p-4 border rounded-lg space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold">{template.name}</h3>
              </div>

              <DeleteConfirmationDialog
                title="Delete Template?"
                description="This template will be permanently deleted."
                confirmText="Delete"
                onConfirm={async () => {
                  await deleteDoc(doc(db, "templates", template.id));
                  // Refresh templates
                }}
                trigger={
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                }
              />
            </div>

            <Badge variant="outline">{template.type}</Badge>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {template.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 5. Talent Pool Page

```tsx
"use client";

import { AddCandidateDialog, SendEmailDialog } from "@/components/dialogs";
import { Button } from "@/components/ui/button";
import { UserPlus, Mail } from "lucide-react";

export default function TalentPoolPage({ candidates }) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Talent Pool</h1>

        {/* Add Candidate Manually */}
        <AddCandidateDialog
          onSuccess={() => {
            // Refresh candidates list
          }}
        />
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {candidates.map((candidate) => (
          <div key={candidate.id} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <img
                src={candidate.photoURL || "/default-avatar.png"}
                alt={candidate.name}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{candidate.name}</h3>
                <p className="text-sm text-muted-foreground">{candidate.email}</p>
              </div>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-1">
              {candidate.skills?.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <SendEmailDialog
                recipientEmail={candidate.email}
                recipientName={candidate.name}
                trigger={
                  <Button variant="outline" size="sm" className="flex-1">
                    <Mail className="w-3 h-3 mr-1" />
                    Email
                  </Button>
                }
              />
              <Button variant="outline" size="sm" className="flex-1">
                View Profile
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 6. Inline Status Update (Applications Table)

```tsx
"use client";

import { ChangeStatusDialog } from "@/components/dialogs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ApplicationRow({ application }) {
  return (
    <tr>
      <td>{application.candidateName}</td>
      <td>{application.jobTitle}</td>
      <td>
        {/* Inline Status Change */}
        <ChangeStatusDialog
          applicationId={application.id}
          currentStatus={application.status}
          currentStage={application.stage}
          candidateName={application.candidateName}
          trigger={
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-accent"
            >
              {application.status}
            </Badge>
          }
          onSuccess={() => {
            // Refresh application row
          }}
        />
      </td>
      <td>
        <Button variant="ghost" size="sm">
          View Details
        </Button>
      </td>
    </tr>
  );
}
```

---

## 7. Quick Actions Dropdown

```tsx
"use client";

import {
  ScheduleInterviewDialog,
  SendEmailDialog,
  ChangeStatusDialog,
  AddNoteDialog,
} from "@/components/dialogs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Calendar, Mail, RefreshCw, StickyNote } from "lucide-react";

export function ApplicationActions({ application }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <ScheduleInterviewDialog
          applicationId={application.id}
          candidateId={application.candidateId}
          candidateName={application.candidateName}
          candidateEmail={application.candidateEmail}
          jobId={application.jobId}
          jobTitle={application.jobTitle}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Interview
            </DropdownMenuItem>
          }
        />

        <SendEmailDialog
          recipientEmail={application.candidateEmail}
          recipientName={application.candidateName}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </DropdownMenuItem>
          }
        />

        <DropdownMenuSeparator />

        <ChangeStatusDialog
          applicationId={application.id}
          currentStatus={application.status}
          currentStage={application.stage}
          candidateName={application.candidateName}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Change Status
            </DropdownMenuItem>
          }
        />

        <AddNoteDialog
          applicationId={application.id}
          candidateName={application.candidateName}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <StickyNote className="w-4 h-4 mr-2" />
              Add Note
            </DropdownMenuItem>
          }
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## 8. Keyboard Shortcuts Integration

```tsx
"use client";

import { useEffect, useState } from "react";
import { CreateJobDialog, InviteTeamMemberDialog } from "@/components/dialogs";

export default function DashboardLayout({ children }) {
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [showInviteTeam, setShowInviteTeam] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd/Ctrl + N = New Job
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        setShowCreateJob(true);
      }

      // Cmd/Ctrl + I = Invite Team
      if ((e.metaKey || e.ctrlKey) && e.key === "i") {
        e.preventDefault();
        setShowInviteTeam(true);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  return (
    <>
      {/* Programmatically controlled dialogs */}
      <CreateJobDialog
        key={showCreateJob ? "open" : "closed"}
        trigger={null}
        onSuccess={() => setShowCreateJob(false)}
      />

      <InviteTeamMemberDialog
        key={showInviteTeam ? "open" : "closed"}
        trigger={null}
        onSuccess={() => setShowInviteTeam(false)}
      />

      {children}
    </>
  );
}
```

---

## Tips & Best Practices

### 1. Custom Triggers
Always provide semantic, accessible triggers:
```tsx
<CreateJobDialog
  trigger={
    <Button className="gap-2">
      <Plus className="w-4 h-4" />
      <span className="hidden sm:inline">Create Job</span>
      <kbd className="hidden sm:inline text-xs opacity-70">⌘N</kbd>
    </Button>
  }
/>
```

### 2. Error Handling
Wrap dialog actions in try-catch blocks:
```tsx
onConfirm={async () => {
  try {
    await deleteDoc(doc(db, "jobs", jobId));
    toast({ title: "Job deleted" });
  } catch (error) {
    console.error(error);
    toast({
      title: "Error",
      description: "Failed to delete job",
      variant: "destructive",
    });
  }
}}
```

### 3. Loading States
Show loading indicators for better UX:
```tsx
const [isDeleting, setIsDeleting] = useState(false);

<DeleteConfirmationDialog
  onConfirm={async () => {
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "jobs", jobId));
    } finally {
      setIsDeleting(false);
    }
  }}
/>
```

### 4. Confirmation for Destructive Actions
Always use DeleteConfirmationDialog for destructive actions:
```tsx
// Good
<DeleteConfirmationDialog
  title="Delete Application?"
  description="This action cannot be undone."
  onConfirm={handleDelete}
/>

// Bad - Don't do this
<Button onClick={handleDelete}>Delete</Button>
```

---

**Last Updated:** 2025-11-14
