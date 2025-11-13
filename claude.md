# PERSONA RECRUIT AI - FRONTEND ARCHITECTURE DOCUMENTATION

**Version:** 1.0  
**Last Updated:** 2025-11-10  
**Purpose:** Complete UI/UX reference for recreating the frontend in a new codebase

---

## TABLE OF CONTENTS

1. [User Roles & Permissions](#1-user-roles--permissions)
2. [Page Structure & Routes](#2-page-structure--routes)
3. [Navigation Menus](#3-navigation-menus)
4. [Dashboard Layouts](#4-dashboard-layouts)
5. [Dialogs & Modals](#5-dialogs--modals)
6. [Forms & Input Components](#6-forms--input-components)
7. [Data Tables & Lists](#7-data-tables--lists)
8. [Tabs & Tabbed Interfaces](#8-tabs--tabbed-interfaces)
9. [Reusable UI Components](#9-reusable-ui-components)
10. [Key User Flows](#10-key-user-flows)
11. [Component File Reference](#11-component-file-reference)

---

## 1. USER ROLES & PERMISSIONS

### Role Hierarchy

The platform implements **5 distinct user roles** with strict permission boundaries:

#### 1.1 **Candidate** (`role: 'candidate'`)

**Access Rights:**
- ✅ **READ**: Own profile, job listings (public), own applications, own interviews
- ✅ **CREATE**: Applications, profile updates
- ✅ **UPDATE**: Own profile, own application status (withdraw only)
- ❌ **DELETE**: Limited to own account via GDPR

**Accessible Routes:**
- `/candidate` - Dashboard
- `/candidate/applications` - My Applications
- `/candidate/interviews` - Scheduled Interviews
- `/candidate/interview/[id]` - AI Interview Session
- `/candidate/profile` - Profile Management
- `/candidate/settings` - Account Settings
- `/careers` - Public job board (no auth required)
- `/careers/[id]` - Job details
- `/careers/[id]/apply` - Application submission

**Navigation Menu Items:**
- Dashboard (Home icon)
- My Applications (Briefcase icon) - Shows count badge
- Interviews (Calendar icon) - Shows count badge for upcoming
- My Profile (User icon)
- Settings (Settings icon)

**Key Restrictions:**
- Cannot access company dashboard or recruiter features
- Cannot see other candidates' data
- Cannot modify job postings
- Cannot access team management

---

#### 1.2 **Recruiter** (`role: 'recruiter'`)

**Access Rights:**
- ✅ **READ**: All company jobs, applications, candidates (who applied to their jobs), team members, templates
- ✅ **CREATE**: Jobs, applications (manual entry), email communications, interviews
- ✅ **UPDATE**: Job postings, application status/stage, interview schedules
- ❌ **DELETE**: Limited (cannot delete company, billing, or team members)

**Accessible Routes:**
- `/dashboard` - Main Dashboard
- `/dashboard/jobs` - Job Management
- `/dashboard/applications` - Applications Review
- `/dashboard/applications/[id]` - Application Details
- `/dashboard/candidates/[id]` - Candidate Profile View
- `/dashboard/meetings` - Meeting Notes
- `/dashboard/talent-pool` - Talent Pool
- `/dashboard/my-folders` - Personal Folders
- `/dashboard/templates` - Email/Interview Templates
- `/dashboard/settings` - Limited Settings

**Navigation Menu Items (via MainNav):**
- Dashboard (LayoutDashboard icon)
- Jobs (Briefcase icon)
- Applications (FileText icon)
- Meeting Notes (Video icon)
- Talent Pool (Users icon)
- My Folders (Folder icon)
- Templates (FileText icon)
- Settings (Settings icon)

**Key Restrictions:**
- Cannot manage team members (no access to `/dashboard/team`)
- Cannot access AI configuration (`/dashboard/ai-agents`)
- Cannot access billing (`/dashboard/billing`)
- Cannot delete company data
- Limited to their own `companyId` data

---

#### 1.3 **Interviewer** (`role: 'interviewer'`)

**Access Rights:**
- ✅ **READ**: Applications assigned to them, candidate profiles (for assigned interviews only), job descriptions (for assigned roles), own interview feedback
- ✅ **CREATE**: Interview feedback, meeting notes
- ✅ **UPDATE**: Own interview feedback (before submission)
- ❌ **DELETE**: None

**Accessible Routes:**
- `/interviewer/dashboard` - Interviewer Dashboard
- `/dashboard/applications` - Assigned Applications Only (filtered)
- `/dashboard/candidates/[id]` - Read-only Candidate View (only for assigned interviews)
- `/interviewer/interviews/[id]` - Interview Details
- `/interviewer/feedback/[interviewId]` - Feedback Submission
- `/interviewer/session/[sessionId]` - Live Interview Session
- `/dashboard/meetings` - Meeting Notes (for assigned interviews)
- `/dashboard/my-folders` - Personal Folders
- `/dashboard/settings` - Limited Settings

**Navigation Menu Items (via MainNav):**
- Dashboard (LayoutDashboard icon)
- Applications (FileText icon) - Only shows assigned
- Meeting Notes (Video icon) - Only assigned meetings
- My Folders (Folder icon)
- Settings (Settings icon)

**Key Restrictions:**
- **Cannot** create or edit jobs
- **Cannot** manage team members
- **Cannot** access company settings, billing, or AI configuration
- **Cannot** update application status or stage
- **Cannot** access candidate pool (only assigned candidates)
- Read-only access to job descriptions and candidate profiles
- Can only submit feedback for interviews they are assigned to

---

#### 1.4 **HR Admin** (`role: 'hr_admin'`)

**Access Rights:**
- ✅ **READ**: Everything within their `companyId` (all jobs, applications, candidates, team, billing, settings)
- ✅ **CREATE**: All (jobs, applications, team members, templates, AI agent configs)
- ✅ **UPDATE**: All company data
- ✅ **DELETE**: Jobs, applications, team members (except themselves)

**Accessible Routes:**
- All `/dashboard/*` routes
- `/dashboard/team` - Team Management (invite, manage roles)
- `/dashboard/ai-agents` - AI Configuration
- `/dashboard/billing` - Stripe Integration
- `/dashboard/settings/*` - Full Settings Access
  - `/dashboard/settings/pipeline` - Auto-reject threshold
  - `/dashboard/settings/company-profile` - Company branding
  - `/dashboard/settings/career-page` - Career page customization
  - `/dashboard/settings/meeting-bots` - Meeting bot integrations
  - `/dashboard/settings/ai-agents/*` - AI agent configuration
  - `/dashboard/settings/email` - Email templates
  - `/dashboard/settings/integrations` - HRIS integrations

**Navigation Menu Items (via MainNav):**
- Dashboard (LayoutDashboard icon)
- Jobs (Briefcase icon)
- Applications (FileText icon)
- Meeting Notes (Video icon)
- **Team** (Users icon) - ⚠️ HR Admin Only
- Talent Pool (Users icon)
- My Folders (Folder icon)
- Templates (FileText icon)
- **AI Agents** (Sparkles icon) - ⚠️ HR Admin Only
- **Billing** (CreditCard icon) - ⚠️ HR Admin Only
- Settings (Settings icon) - Full access

**Key Restrictions:**
- Limited to their own `companyId` (cannot access other companies)
- Cannot access platform-level admin features
- Cannot modify global AI settings (platform admin only)

---

#### 1.5 **Platform Admin** (`role: 'platform_admin'`)

**Access Rights:**
- ✅ **READ**: All companies, all users, platform analytics, system health, bug reports
- ✅ **CREATE**: Companies, platform-level configurations
- ✅ **UPDATE**: Company status, subscription status, global AI settings
- ✅ **DELETE**: Companies (with data retention policies)

**Accessible Routes:**
- All `/platform-admin/*` routes
- `/platform-admin/dashboard` - Platform Overview
- `/platform-admin/companies` - Company Management
- `/platform-admin/companies/[id]` - Company Details
- `/platform-admin/analytics` - Platform-wide Analytics
- `/platform-admin/system-health` - System Health Monitoring
- `/platform-admin/bug-reports` - User-submitted Bug Reports
- `/platform-admin/qa-orchestrator` - QA Testing Tools
- `/platform-admin/configuration` - Global Platform Settings

**Navigation Menu Items (via MainNav):**

**Platform Admin Section:**
- Platform Dashboard (LayoutDashboard icon)
- Companies (Building2 icon)
- Bug Reports (AlertTriangle icon)
- Platform Analytics (BarChart3 icon)
- System Health (Activity icon)
- QA Orchestrator (Shield icon)
- Configuration (Sliders icon)

**Company View Section** (when viewing a specific company):
- All standard dashboard items (same as HR Admin)

**Key Restrictions:**
- Full access to all platform features
- Can impersonate company view but typically read-only for operational data
- Cannot directly modify candidate applications (view-only for support)

---

### Permission Enforcement Patterns

**Frontend Protection:**
```tsx
// Layout-level protection
<ProtectedRoute allowedRoles={['recruiter', 'hr_admin']}>
  {children}
</ProtectedRoute>

// Component-level checks
{userProfile?.role === 'hr_admin' && (
  <TeamManagementButton />
)}
```

**Backend Protection (Firestore Rules):**
- All queries filter by `companyId`
- Role-based read/write rules enforced at database level
- Interviewer access limited via `assignedInterviewers` array

**Key Files:**
- `/src/components/auth/protected-route.tsx` - Route guards
- `/src/components/auth/hr-admin-route.tsx` - HR admin permission hooks
- `/src/components/auth/recruiter-route.tsx` - Recruiter permission hooks
- `/src/components/dashboard/main-nav.tsx` - Role-based navigation rendering

---

## 2. PAGE STRUCTURE & ROUTES

### 2.1 Public Routes (No Authentication Required)

| Route | Page Component | Purpose | Layout |
|-------|---------------|---------|--------|
| `/` | `/src/app/(marketing)/page.tsx` | Marketing landing page | Marketing layout |
| `/careers` | `/src/app/careers/page.tsx` | Public job board | Minimal header |
| `/careers/[id]` | `/src/app/careers/[id]/page.tsx` | Job details | Minimal header |
| `/careers/[id]/apply` | `/src/app/careers/[id]/apply/page.tsx` | Application form (requires auth) | Minimal header |
| `/careers/company/[slug]` | `/src/app/careers/company/[slug]/page.tsx` | Company-specific career page | Branded company layout |
| `/auth/login` | `/src/app/auth/login/page.tsx` | Login form | Centered auth layout |
| `/auth/signup/candidate` | `/src/app/auth/signup/candidate/page.tsx` | Candidate signup | Centered auth layout |
| `/auth/signup/candidate/wizard` | `/src/app/auth/signup/candidate/wizard/page.tsx` | Multi-step candidate onboarding | Wizard layout |
| `/auth/signup/company` | `/src/app/auth/signup/company/page.tsx` | Company/recruiter signup | Centered auth layout |
| `/auth/signup/company/wizard` | `/src/app/auth/signup/company/wizard/page.tsx` | Multi-step company onboarding | Wizard layout |
| `/auth/reset-password` | `/src/app/auth/reset-password/page.tsx` | Password reset | Centered auth layout |
| `/auth/accept-invite` | `/src/app/auth/accept-invite/page.tsx` | Team member invite acceptance | Centered auth layout |
| `/privacy` | `/src/app/privacy/page.tsx` | Privacy policy | Legal doc layout |
| `/privacy/rights` | `/src/app/privacy/rights/page.tsx` | GDPR data rights | Legal doc layout |
| `/cookies` | `/src/app/cookies/page.tsx` | Cookie policy | Legal doc layout |
| `/terms` | `/src/app/terms/page.tsx` | Terms of service | Legal doc layout |
| `/unauthorized` | `/src/app/unauthorized/page.tsx` | Access denied page | Error layout |
| `/docs/*` | `/src/app/docs/` | User documentation | Docs layout |

---

### 2.2 Candidate Routes (`role: 'candidate'`)

All routes protected by `<ProtectedRoute allowedRoles={['candidate']}>` in `/src/app/candidate/layout.tsx`

| Route | Page Component | Purpose | Data Fetched |
|-------|---------------|---------|--------------|
| `/candidate` | `/src/app/candidate/page.tsx` | Dashboard with stats, recent applications, upcoming interviews | Applications (candidateId), Interviews (candidateId), Jobs (public), Profile Views |
| `/candidate/applications` | `/src/app/candidate/applications/page.tsx` | List of all applications submitted | Applications (candidateId) |
| `/candidate/interviews` | `/src/app/candidate/interviews/page.tsx` | Upcoming and past interviews | Interviews collection (candidateId) |
| `/candidate/interview/[id]` | `/src/app/candidate/interview/[id]/page.tsx` | AI interview session (voice/text) | Interview doc (id), Application (applicationId) |
| `/candidate/profile` | `/src/app/candidate/profile/page.tsx` | Edit profile, resume, skills | Users doc (uid), Candidate profile |
| `/candidate/settings` | `/src/app/candidate/settings/page.tsx` | Account settings, notifications, GDPR | Users doc (uid), Preferences |

**Layout Structure:**
- **Sidebar**: Left-aligned, fixed, 72px width (`/src/components/layouts/candidate-sidebar.tsx`)
- **Topbar**: Sticky, search, notifications, user dropdown (`/src/components/layouts/candidate-topbar.tsx`)
- **Main Content**: Responsive container with padding

---

### 2.3 Recruiter Routes (`role: 'recruiter'`)

Protected by `<ProtectedRoute allowedRoles={['recruiter', 'hr_admin', 'interviewer']}>` in `/src/app/dashboard/layout.tsx`

| Route | Page Component | Purpose | Data Fetched |
|-------|---------------|---------|--------------|
| `/dashboard` | `/src/app/dashboard/page.tsx` | Main dashboard with analytics | Jobs (companyId), Applications (companyId), Analytics metrics |
| `/dashboard/jobs` | `/src/app/dashboard/jobs/page.tsx` | Job management | Jobs (companyId) |
| `/dashboard/jobs/[id]` | `/src/app/dashboard/jobs/[id]/page.tsx` | Job details and applicants | Job doc (id), Applications (jobId) |
| `/dashboard/applications` | `/src/app/dashboard/applications/page.tsx` | Applications table with filters | Applications (companyId), Jobs (companyId) |
| `/dashboard/applications/[id]` | `/src/app/dashboard/applications/[id]/page.tsx` | Application details with AI analysis | Application doc (id), Candidate profile, AI analysis, Interviews |
| `/dashboard/candidates/[id]` | `/src/app/dashboard/candidates/[id]/page.tsx` | Candidate profile view | Candidate doc (id), Applications (candidateId, companyId) |
| `/dashboard/meetings` | `/src/app/dashboard/meetings/page.tsx` | Meeting notes list | Meetings collection (companyId) |
| `/dashboard/meetings/[id]` | `/src/app/dashboard/meetings/[id]/page.tsx` | Meeting details and AI summary | Meeting doc (id), AI transcript |
| `/dashboard/talent-pool` | `/src/app/dashboard/talent-pool/page.tsx` | Saved candidates | Talent pool collection (companyId) |
| `/dashboard/my-folders` | `/src/app/dashboard/my-folders/page.tsx` | Personal candidate folders | Folders collection (userId) |
| `/dashboard/templates` | `/src/app/dashboard/templates/page.tsx` | Email/interview templates | Templates collection (companyId) |
| `/dashboard/templates/new` | `/src/app/dashboard/templates/new/page.tsx` | Template editor | N/A (creation) |
| `/dashboard/settings` | `/src/app/dashboard/settings/page.tsx` | Limited settings access | User preferences |

**Layout Structure:**
- **Sidebar**: Collapsible, Shadcn Sidebar component (`/src/components/ui/sidebar.tsx`)
- **Header**: Sticky, search, company logo, user nav (`UserNav` component)
- **Main Content**: Responsive with padding (`p-4 sm:px-6 sm:py-4`)

---

### 2.4 Interviewer Routes (`role: 'interviewer'`)

Protected by `<ProtectedRoute allowedRoles={['interviewer']}>` in `/src/app/interviewer/layout.tsx`

| Route | Page Component | Purpose | Data Fetched |
|-------|---------------|---------|--------------|
| `/interviewer/dashboard` | `/src/app/interviewer/dashboard/page.tsx` | Upcoming interviews, pending feedback | Interviews (assignedInterviewers contains uid) |
| `/interviewer/interviews/[id]` | `/src/app/interviewer/interviews/[id]/page.tsx` | Interview details (read-only candidate view) | Interview doc (id), Application (applicationId), Candidate (candidateId) |
| `/interviewer/feedback/[interviewId]` | `/src/app/interviewer/feedback/[interviewId]/page.tsx` | Feedback submission form | Interview doc (interviewId) |
| `/interviewer/session/[sessionId]` | `/src/app/interviewer/session/[sessionId]/page.tsx` | Live interview session (face-to-face) | Interview session doc (sessionId) |

**Layout Structure:**
- Same as Recruiter dashboard layout
- Sidebar shows "Interviewer Portal" branding
- Limited navigation menu items

---

### 2.5 HR Admin Routes (`role: 'hr_admin'`)

Inherits all Recruiter routes PLUS additional routes:

| Route | Page Component | Purpose | Data Fetched |
|-------|---------------|---------|--------------|
| `/dashboard/team` | `/src/app/dashboard/team/page.tsx` | Team member management, invites | Users (companyId) |
| `/dashboard/ai-agents` | `/src/app/dashboard/ai-agents/page.tsx` | AI agent configuration hub | AI settings doc (companyId) |
| `/dashboard/ai-agents/*` | Various test/config pages | Individual agent configuration | Agent-specific settings |
| `/dashboard/billing` | `/src/app/dashboard/billing/page.tsx` | Stripe subscription management | Stripe subscription (companyId) |
| `/dashboard/settings/pipeline` | `/src/app/dashboard/settings/pipeline/page.tsx` | Auto-reject threshold configuration | Pipeline settings (companyId) |
| `/dashboard/settings/company-profile` | `/src/app/dashboard/settings/company-profile/page.tsx` | Company branding, logo | Company doc (companyId) |
| `/dashboard/settings/career-page` | `/src/app/dashboard/settings/career-page/page.tsx` | Career page customization | Career page settings (companyId) |
| `/dashboard/settings/meeting-bots` | `/src/app/dashboard/settings/meeting-bots/page.tsx` | Teams/Zoom bot integration | Meeting bot settings (companyId) |
| `/dashboard/settings/ai-agents/*` | AI agent configuration pages | Configure AI model parameters | AI agent settings (companyId) |
| `/dashboard/settings/email` | `/src/app/dashboard/settings/email/page.tsx` | Email template management | Email templates (companyId) |
| `/dashboard/settings/integrations` | `/src/app/dashboard/settings/integrations/page.tsx` | HRIS integrations (SAP, Workday, GreytHR) | Integration settings (companyId) |
| `/dashboard/settings/user-management` | `/src/app/dashboard/settings/user-management/page.tsx` | User role management | Users (companyId) |

---

### 2.6 Platform Admin Routes (`role: 'platform_admin'`)

Protected by `<ProtectedRoute allowedRoles={['platform_admin']}>` in `/src/app/platform-admin/layout.tsx`

| Route | Page Component | Purpose | Data Fetched |
|-------|---------------|---------|--------------|
| `/platform-admin/dashboard` | `/src/app/platform-admin/dashboard/page.tsx` | Platform overview | All companies, platform metrics |
| `/platform-admin/companies` | `/src/app/platform-admin/companies/page.tsx` | Company list and management | Companies collection |
| `/platform-admin/companies/[id]` | `/src/app/platform-admin/companies/[id]/page.tsx` | Company details and impersonation | Company doc (id), Users (companyId) |
| `/platform-admin/analytics` | `/src/app/platform-admin/analytics/page.tsx` | Platform-wide analytics | Aggregated metrics |
| `/platform-admin/system-health` | `/src/app/platform-admin/system-health/page.tsx` | Firebase performance, errors | Firebase monitoring APIs |
| `/platform-admin/bug-reports` | `/src/app/platform-admin/bug-reports/page.tsx` | User-submitted bug reports | Bug reports collection |
| `/platform-admin/qa-orchestrator` | `/src/app/platform-admin/qa-orchestrator/page.tsx` | Automated QA testing | QA test results |
| `/platform-admin/configuration` | `/src/app/platform-admin/configuration/page.tsx` | Global platform settings | Platform config doc |

**Layout Structure:**
- Same sidebar/header layout as Recruiter
- Shows "Platform Admin" branding
- Has TWO navigation sections:
  1. **Platform Admin** - Platform-level features
  2. **Company View** - Can view any company's dashboard

---

### 2.7 Special Routes

| Route | Page Component | Purpose |
|-------|---------------|---------|
| `/interview/[sessionId]` | `/src/app/interview/[sessionId]/page.tsx` | AI interview session (public link) |
| `/interview/[sessionId]/complete` | `/src/app/interview/[sessionId]/complete/page.tsx` | Interview completion screen |
| `/billing/success` | `/src/app/billing/success/page.tsx` | Stripe payment success redirect |

---

## 3. NAVIGATION MENUS

### 3.1 Main Navigation Component

**File:** `/src/components/dashboard/main-nav.tsx`

**Functionality:**
- Renders role-based navigation links
- Highlights active route
- Tooltip on hover for each link
- Filters links based on `userProfile.role`

**Navigation Link Structure:**
```typescript
interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: string[]; // Which roles can see this link
}
```

---

### 3.2 Recruiter Navigation (Standard Dashboard)

**Visible to:** `recruiter`, `hr_admin`

| Label | Icon | Route | Description |
|-------|------|-------|-------------|
| Dashboard | LayoutDashboard | `/dashboard` | Overview stats |
| Jobs | Briefcase | `/dashboard/jobs` | Job management |
| Applications | FileText | `/dashboard/applications` | Application review |
| Meeting Notes | Video | `/dashboard/meetings` | AI meeting summaries |
| Talent Pool | Users | `/dashboard/talent-pool` | Saved candidates |
| My Folders | Folder | `/dashboard/my-folders` | Personal folders |
| Templates | FileText | `/dashboard/templates` | Email/interview templates |
| Settings | Settings | `/dashboard/settings` | Account settings |

---

### 3.3 HR Admin Navigation (Extended)

**Visible to:** `hr_admin` only

Includes all Recruiter links PLUS:

| Label | Icon | Route | Description |
|-------|------|-------|-------------|
| **Team** | Users | `/dashboard/team` | ⚠️ HR Admin Only |
| **AI Agents** | Sparkles | `/dashboard/ai-agents` | ⚠️ HR Admin Only |
| **Billing** | CreditCard | `/dashboard/billing` | ⚠️ HR Admin Only |

---

### 3.4 Interviewer Navigation (Restricted)

**Visible to:** `interviewer` only

| Label | Icon | Route | Description |
|-------|------|-------|-------------|
| Dashboard | LayoutDashboard | `/dashboard` | Assigned interviews overview |
| Applications | FileText | `/dashboard/applications` | Assigned applications only |
| Meeting Notes | Video | `/dashboard/meetings` | Assigned meetings only |
| My Folders | Folder | `/dashboard/my-folders` | Personal folders |
| Settings | Settings | `/dashboard/settings` | Limited settings |

---

### 3.5 Platform Admin Navigation

**File:** `/src/components/dashboard/main-nav.tsx` (lines 104-140)

**Two-Section Navigation:**

**Section 1: Platform Admin**

| Label | Icon | Route |
|-------|------|-------|
| Platform Dashboard | LayoutDashboard | `/platform-admin/dashboard` |
| Companies | Building2 | `/platform-admin/companies` |
| Bug Reports | AlertTriangle | `/platform-admin/bug-reports` |
| Platform Analytics | BarChart3 | `/platform-admin/analytics` |
| System Health | Activity | `/platform-admin/system-health` |
| QA Orchestrator | Shield | `/platform-admin/qa-orchestrator` |
| Configuration | Sliders | `/platform-admin/configuration` |

**Section 2: Company View**
- Separator line
- Same links as HR Admin (for viewing any company)

---

### 3.6 Candidate Navigation (Sidebar)

**File:** `/src/components/layouts/candidate-sidebar.tsx`

**Structure:**
- Fixed left sidebar (72px width)
- Logo and branding at top
- Three navigation sections with separators

**Section 1: Main Navigation**

| Label | Icon | Route | Badge |
|-------|------|-------|-------|
| Dashboard | LayoutDashboard | `/candidate` | None |
| My Applications | Briefcase | `/candidate/applications` | Application count (secondary badge) |
| Interviews | Calendar | `/candidate/interviews` | Upcoming count (destructive badge) |

**Section 2: Profile & Documents**

| Label | Icon | Route |
|-------|------|-------|
| My Profile | User | `/candidate/profile` |

**Section 3: Support**

| Label | Icon | Route |
|-------|------|-------|
| Settings | Settings | `/candidate/settings` |

**Bottom Action:**
- Sign Out button (LogOut icon)

---

### 3.7 User Dropdown Menu

**File:** `/src/components/dashboard/user-nav.tsx`

**Trigger:** Avatar with user photo/initials

**Dropdown Items:**

**Header:**
- User's display name
- User's email

**Menu Items:**
1. Profile → `/dashboard/settings`
2. Billing → `/dashboard/settings/billing`
3. Settings → `/dashboard/settings`

**Bottom:**
- Log out (onClick: signOut)

---

### 3.8 Candidate Topbar Navigation

**File:** `/src/components/layouts/candidate-topbar.tsx`

**Layout:** Sticky top bar with search, notifications, and user menu

**Components:**
1. **Search Bar:** Cmd/Ctrl+K shortcut
2. **Notifications Popover:**
   - Bell icon with unread count badge
   - Scrollable list of notifications
   - Mark as read/Mark all as read
3. **User Dropdown:**
   - Avatar
   - Display name and email
   - Availability status (green dot)
   - Menu items: My Profile, Settings, Sign Out

---

### 3.9 Navigation State Management

**Active Route Highlighting:**
```tsx
const pathname = usePathname();
const isActive = pathname.startsWith(link.href);
```

**Role-Based Filtering:**
```tsx
const filteredLinks = links.filter(link => 
  link.roles.includes(userProfile?.role || '')
);
```

**Keyboard Shortcuts:**
- **Cmd/Ctrl+K**: Focus search (all layouts)
- **Cmd/Ctrl+N**: Create new job (recruiter/HR admin only)

---

## 4. DASHBOARD LAYOUTS

### 4.1 Candidate Dashboard

**File:** `/src/app/candidate/page.tsx`

**Layout Structure:**

**Welcome Header:**
- Greeting: "Welcome back, {firstName}!"
- Subtitle: "Track your applications and discover new opportunities"

**Stats Cards (4 columns):**
1. **Total Applications**
   - Icon: Briefcase (green)
   - Value: Application count
   - Subtitle: "All time"

2. **Active Applications**
   - Icon: Clock (green)
   - Value: Applications not in terminal status
   - Subtitle: "In progress"

3. **Avg Match Score**
   - Icon: TrendingUp (green)
   - Value: Percentage
   - Subtitle: "AI assessment"

4. **Profile Views**
   - Icon: Eye (green)
   - Value: Number of recruiter views
   - Subtitle: "recruiters viewed your profile"

**Upcoming Interviews Section** (if any):
- Card with header "Upcoming Interviews"
- Badge showing count
- List of interview cards:
  - Job title + Type badge
  - Company name
  - Date/time + Duration
  - Location (if applicable)
  - "Join" button (if meeting link)
  - "Start Interview" button (if AI interview)

**Recent Applications & Latest Opportunities (2 columns):**

**Left Column: Recent Applications**
- Card header with "View All" button
- List of application cards:
  - Job title + Company name
  - Status badge with icon
  - Match score badge
- Empty state: "Browse Jobs" CTA button

**Right Column: Latest Opportunities**
- Card header with "Browse All" button
- List of job cards:
  - Job title
  - Company + Location
  - Job type badge
  - External link icon

**Quick Actions Section:**
- Buttons: Browse Jobs, View Applications, Update Profile

**Color Scheme:**
- Primary green (#16a34a)
- Status badges: Blue (Applied), Purple (Under Review), Yellow (Interview), Green (Hired), Red (Rejected)

---

### 4.2 Recruiter Dashboard

**File:** `/src/app/dashboard/page.tsx`

**Layout Structure:**

**Header with Actions:**
- Title: "Dashboard"
- Subtitle: "Overview of your recruitment pipeline"
- **Right Actions:**
  - Date Range Picker (last 30 days default)
  - Export CSV button

**Stats Cards (4 columns):**
1. **Active Jobs**
   - Icon: Briefcase (green)
   - Value: Count of open jobs
   - Subtitle: "Active job postings"

2. **Total Applications**
   - Icon: Users (green)
   - Value: Total count
   - Subtitle: "{count} pending review"

3. **Avg Match Score**
   - Icon: Brain (green)
   - Value: Percentage
   - Subtitle: "AI-powered candidate matching"

4. **Top Matches**
   - Icon: TrendingUp (green)
   - Value: Count of 70%+ matches
   - Subtitle: "Candidates with 70%+ match"

**Analytics Charts (2 columns + 1):**

**Left (2/3 width): Hiring Funnel (Bar Chart)**
- X-axis: Pipeline stages (Applied, Under Review, Screening, Interview, Offer, Hired)
- Y-axis: Number of applicants
- Recharts BarChart component
- Tooltip with stage and count

**Right (1/3 width): AI Recommendations (Progress Bars)**
- Breakdown of AI recommendations:
  - Fast Track (green)
  - Strong Candidate (light green)
  - Worth Reviewing (yellow)
  - Marginal Fit (gray)
  - Not Recommended (red)
- Each item shows: Name, Count, Percentage, Progress bar

**Top Matches Table:**
- Columns: Candidate, Job, Match Score, Recommendation, Applied, Action
- Match Score badges: Color-coded by score range (90%+ dark green, 70-89% green, 50-69% yellow, <50% gray)
- Recommendation badges with colors
- "View" badge link to application details

**Performance Optimizations:**
- Memoized components (DashboardStatsCard, HiringFunnelChart, AIRecommendationsChart)
- useMemo for expensive calculations
- Skeleton loading states

---

### 4.3 Interviewer Dashboard

**File:** `/src/app/interviewer/dashboard/page.tsx`

**Layout Structure:**

**Header:**
- Title: "My Interview Schedule"
- Subtitle: "Upcoming and completed interviews"

**Tabbed Interface (3 tabs):**

**Tab 1: Upcoming Interviews**
- List of scheduled interviews
- Each card shows:
  - Candidate name + Job title
  - Company name
  - Interview type badge
  - Date/time
  - Duration
  - "View Details" button
  - "Submit Feedback" button (if completed)

**Tab 2: Pending Feedback**
- Interviews that need feedback submission
- Highlighted with yellow background
- "Submit Feedback" CTA button

**Tab 3: Completed**
- Past interviews with submitted feedback
- Read-only view
- "View Feedback" link

**Stats Cards (3 columns):**
1. **Upcoming Interviews**
   - Icon: Calendar
   - Value: Count

2. **Pending Feedback**
   - Icon: FileText
   - Value: Count
   - Highlighted if > 0

3. **Completed This Month**
   - Icon: CheckCircle2
   - Value: Count

---

### 4.4 HR Admin Dashboard

**Inherits:** Same as Recruiter Dashboard

**Additional Widgets:**
- Team member count card
- Subscription status card
- AI usage metrics

**Extended Actions:**
- Access to all settings
- Team management shortcuts
- Billing overview

---

### 4.5 Platform Admin Dashboard

**File:** `/src/app/platform-admin/dashboard/page.tsx`

**Layout Structure:**

**Header:**
- Title: "Platform Administration"
- Subtitle: "Monitor and manage the entire platform"

**Metrics Cards (5 columns):**
1. Total Companies
2. Active Subscriptions
3. Total Users
4. Platform Revenue (MRR)
5. System Health Score

**Company Activity Table:**
- Columns: Company Name, Plan, Users, Applications, Last Active, Status
- Actions: View, Impersonate, Suspend

**System Health Monitoring:**
- Firebase performance metrics
- Error rate graphs
- API response times

**Recent Bug Reports:**
- Table of user-submitted bugs
- Priority badges
- Assigned to / Status

---

## 5. DIALOGS & MODALS

### 5.1 Create Job Dialog

**File:** `/src/components/dashboard/create-job-dialog.tsx`

**Trigger:** "Create Job" button in `/dashboard/jobs`

**Form Fields:**
1. **Job Title** (required)
   - Input: Text
   - Placeholder: "e.g., Senior Frontend Developer"

2. **Department**
   - Input: Text
   - Placeholder: "e.g., Engineering"

3. **Location**
   - Input: Text with location icon
   - Placeholder: "e.g., Remote, San Francisco, CA"

4. **Job Type** (required)
   - Select: Full-time, Part-time, Contract, Internship

5. **Experience Level** (required)
   - Select: Entry Level, Mid Level, Senior, Lead, Executive

6. **Salary Range**
   - Two inputs: Min and Max
   - Format: Currency with commas

7. **Job Description** (required)
   - Textarea: 5 rows
   - Placeholder: "Provide a detailed description of the role, responsibilities, and requirements"

8. **Required Skills**
   - Multi-input tags
   - Example: "React, TypeScript, Node.js"

9. **Benefits**
   - Textarea
   - Placeholder: "Health insurance, 401k, Flexible hours, etc."

**Actions:**
- Cancel (secondary button)
- Create Job (primary button, green)

**Validation:**
- Required fields enforced
- Salary min < max validation

**Success:**
- Toast notification: "Job created successfully!"
- Redirects to job details page

---

### 5.2 Edit Job Dialog

**File:** `/src/components/dashboard/edit-job-dialog.tsx`

**Trigger:** "Edit" button in job table

**Same form fields as Create Job Dialog**, pre-populated with existing data

**Actions:**
- Cancel
- Save Changes (primary button)

**Additional:**
- "Archive Job" button (destructive, bottom left)
- "Delete Job" button (destructive, confirmation required)

---

### 5.3 Schedule Interview Dialog

**File:** `/src/components/interviews/schedule-interview-dialog.tsx`

**Trigger:** "Schedule Interview" button in application details page

**Form Fields:**

**Step 1: Interview Type**
- Radio buttons:
  - AI Screening
  - AI Technical Interview
  - Face-to-Face Interview
  - Panel Interview

**Step 2: Interview Details**

1. **Interview Title**
   - Input: Text
   - Placeholder: "Initial Screening"

2. **Scheduled Date**
   - Date picker
   - Default: Tomorrow

3. **Scheduled Time**
   - Time picker (15-minute intervals)
   - Default: 9:00 AM

4. **Duration** (minutes)
   - Select: 15, 30, 45, 60, 90, 120
   - Default: 60

5. **Assign Interviewers** (for Face-to-Face/Panel)
   - Multi-select dropdown
   - Fetches team members with `interviewer` or `hr_admin` role
   - Shows avatar, name, email

6. **Meeting Link** (optional, for remote interviews)
   - Input: URL
   - Placeholder: "https://meet.google.com/..."
   - Validation: URL format

7. **Location** (optional, for in-person interviews)
   - Input: Text
   - Placeholder: "Conference Room A, Building 2"

8. **Interview Notes** (internal)
   - Textarea
   - Placeholder: "Any special instructions for the interviewers"

**Actions:**
- Back (if multi-step)
- Cancel
- Schedule Interview (primary button)

**Functionality:**
- Creates `Interview` document in Firestore
- Sends calendar invite (.ics file) to candidate and interviewers
- Sends email notifications
- Triggers Cloud Function: `onInterviewCreate_NotifyInterviewers`

**Success:**
- Toast notification: "Interview scheduled successfully!"
- Calendar invite generated
- Email sent to candidate

---

### 5.4 Send Email Dialog

**File:** `/src/components/emails/send-email-dialog.tsx`

**Trigger:** "Email Candidate" button in application details

**Form Fields:**

1. **Email Template** (optional)
   - Select dropdown
   - Options:
     - Blank (no template)
     - Application Received
     - Interview Invitation
     - Interview Reminder
     - Offer Extended
     - Rejection
     - Application Update
   - Selecting template auto-fills subject and body

2. **To** (read-only)
   - Pre-filled with candidate email

3. **CC** (optional)
   - Input: Email addresses (comma-separated)

4. **BCC** (optional)
   - Input: Email addresses (comma-separated)

5. **Subject** (required)
   - Input: Text
   - Variable replacement: {{candidateName}}, {{jobTitle}}, etc.

6. **Email Body** (required)
   - Rich text editor or textarea
   - Variable replacement support:
     - {{candidateName}}
     - {{jobTitle}}
     - {{companyName}}
     - {{interviewDate}}
     - {{interviewTime}}
     - {{meetingLink}}

7. **Attachments** (optional)
   - File upload
   - Max 5 files, 10MB each

**Actions:**
- Cancel
- Send Email (primary button)

**Variable Replacement:**
- Real-time preview shows replaced variables
- Tooltip shows available variables

**Success:**
- Toast notification: "Email sent successfully!"
- Logs email in audit trail

---

### 5.5 Add Candidate Dialog

**File:** `/src/components/dashboard/add-candidate-dialog.tsx`

**Trigger:** "Add Candidate" button in talent pool

**Form Fields:**

1. **Full Name** (required)
2. **Email** (required)
3. **Phone**
4. **Resume Upload** (required)
   - File input (PDF, DOC, DOCX)
   - Max 5MB
5. **LinkedIn URL**
6. **Skills** (tags)
7. **Notes**

**Actions:**
- Cancel
- Add to Talent Pool

**Functionality:**
- Uploads resume to Firebase Storage
- Triggers AI resume parsing
- Adds to `candidates` collection
- Shows in talent pool

---

### 5.6 Delete Confirmation Dialog

**File:** Uses `AlertDialog` component from `/src/components/ui/alert-dialog.tsx`

**Triggers:** Delete job, Delete application, Delete team member

**Structure:**
- Title: "Are you sure?"
- Description: "This action cannot be undone. This will permanently delete the {item}."
- Actions:
  - Cancel (secondary)
  - Delete (destructive, red)

**Variants:**
- Delete Job: "This will also delete all associated applications."
- Delete Team Member: "This user will lose access to the platform."

---

### 5.7 Invite Team Member Dialog

**File:** `/src/app/dashboard/team/page.tsx` (inline component)

**Trigger:** "Invite Team Member" button in `/dashboard/team`

**Form Fields:**

1. **Email Address** (required)
   - Input: Email
   - Validation: Email format

2. **Role** (required)
   - Select:
     - Recruiter
     - Interviewer
     - HR Admin

3. **Display Name** (required)
   - Input: Text

4. **Send Welcome Email**
   - Checkbox (checked by default)

**Actions:**
- Cancel
- Send Invite

**Functionality:**
- Creates invite document with token
- Sends email with invite link: `/auth/accept-invite?token={token}`
- Invite expires in 7 days

**Success:**
- Toast notification: "Invite sent to {email}"
- Shows in pending invites list

---

### 5.8 Submit Feedback Dialog

**File:** `/src/app/interviewer/feedback/[interviewId]/page.tsx`

**Context:** Dedicated page (not a dialog), but acts as modal-style form

**Form Structure:**

1. **Overall Rating** (required)
   - 5-star rating component
   - 1 = Poor, 5 = Excellent

2. **Recommendation** (required)
   - Radio buttons:
     - Strong Hire
     - Hire
     - Consider
     - Do Not Hire

3. **Strengths**
   - Textarea
   - Placeholder: "What did the candidate do well?"

4. **Concerns/Weaknesses**
   - Textarea
   - Placeholder: "What are areas of improvement?"

5. **Technical Skills Rating** (if technical interview)
   - 5-star rating for each skill tested

6. **Culture Fit Rating**
   - 5-star rating

7. **Communication Skills Rating**
   - 5-star rating

8. **Additional Notes**
   - Textarea (optional)

**Actions:**
- Save as Draft (secondary)
- Submit Feedback (primary)

**Functionality:**
- Saves to `feedback` sub-collection under application
- Triggers Cloud Function: `onFeedbackCreate_notifyRecruiter`
- Marks interview as "Completed"

**Validation:**
- Overall rating required
- Recommendation required
- At least one of Strengths or Concerns required

---

## 6. FORMS & INPUT COMPONENTS

### 6.1 Job Application Form

**File:** `/src/app/careers/[id]/apply/page.tsx`

**Layout:** Multi-step wizard (3 steps)

**Step 1: Personal Information**

1. **Full Name** (required)
   - Input: Text
   - Pre-filled if authenticated

2. **Email Address** (required)
   - Input: Email
   - Pre-filled if authenticated

3. **Phone Number** (required)
   - Input: Tel
   - Format: (XXX) XXX-XXXX

4. **LinkedIn Profile** (optional)
   - Input: URL

5. **Portfolio/Website** (optional)
   - Input: URL

**Step 2: Resume & Documents**

1. **Resume Upload** (required)
   - File input: PDF, DOC, DOCX
   - Max 5MB
   - Drag-and-drop supported
   - Shows file name and size after upload

2. **Cover Letter** (optional)
   - Textarea: 500 char max
   - Or file upload (PDF, DOC)

**Step 3: Additional Information**

1. **Current Salary** (optional)
   - Input: Number (currency)

2. **Expected Salary** (optional)
   - Input: Number (currency)

3. **Notice Period** (optional)
   - Select: Immediate, 2 weeks, 1 month, 2 months, 3 months

4. **How did you hear about us?**
   - Select: Job board, LinkedIn, Referral, Company website, Other

5. **AI Processing Consent** (required)
   - Checkbox: "I consent to my application being processed by AI for initial screening and matching"
   - Required to submit

6. **Interview Recording Consent** (required)
   - Checkbox: "I consent to my interviews being recorded and transcribed for evaluation purposes"

**Actions:**
- Back (Steps 2-3)
- Next (Steps 1-2)
- Submit Application (Step 3, primary button)

**Functionality:**
- Validates each step before proceeding
- Uploads resume to Firebase Storage: `/resumes/{companyId}/{candidateId}/`
- Creates application document in Firestore
- Triggers AI pipeline:
  1. Resume parsing
  2. Profile generation
  3. Vector embedding
  4. Job matching & scoring
  5. Candidate summarization
- Redirects to success page

**Success Page:**
- Thank you message
- Application ID
- Next steps information
- "View My Applications" button

---

### 6.2 Candidate Signup Wizard

**File:** `/src/app/auth/signup/candidate/wizard/page.tsx`

**Layout:** Multi-step wizard (4 steps)

**Step 1: Account Creation**
- Full Name
- Email
- Password (with strength meter)
- Confirm Password

**Step 2: Profile Information**
- Phone Number
- Location (City, State/Country)
- LinkedIn URL
- Years of Experience (slider: 0-20+)

**Step 3: Resume Upload**
- Resume file upload
- AI parsing preview (shows extracted data)
- Edit extracted information

**Step 4: Preferences**
- Job preferences:
  - Desired job titles (tags)
  - Preferred locations (tags)
  - Remote/On-site/Hybrid
  - Salary expectations
- Consents:
  - AI processing
  - Email notifications
  - Terms & conditions

**Actions:**
- Back, Next, Complete Signup

**Functionality:**
- Creates Firebase Auth user
- Creates user document in Firestore
- Uploads resume
- Triggers AI profile generation
- Redirects to candidate dashboard

---

### 6.3 Company Signup Wizard

**File:** `/src/app/auth/signup/company/wizard/page.tsx`

**Layout:** Multi-step wizard (4 steps)

**Step 1: Company Information**
- Company Name (required)
- Industry (select)
- Company Size (select: 1-10, 11-50, 51-200, 201-500, 500+)
- Website URL
- Company Logo Upload

**Step 2: Primary Contact**
- Your Full Name
- Your Email
- Your Phone
- Your Role/Title

**Step 3: Account Creation**
- Password
- Confirm Password
- Role Selection:
  - Recruiter
  - HR Admin

**Step 4: Billing & Plan**
- Plan selection:
  - Growth ($249/mo)
  - Professional ($599/mo)
  - Enterprise (Contact Sales)
- Stripe checkout integration
- 14-day free trial (no credit card for trial)

**Actions:**
- Back, Next, Complete Setup & Start Trial

**Functionality:**
- Creates company document
- Creates user document with companyId
- Creates Stripe customer
- Sets up trial subscription (if applicable)
- Redirects to dashboard

---

### 6.4 Template Editor Form

**File:** `/src/app/dashboard/templates/new/page.tsx`

**Form Fields:**

1. **Template Name** (required)
   - Input: Text
   - Placeholder: "e.g., Interview Invitation Template"

2. **Template Type** (required)
   - Select:
     - Email Template
     - Interview Questions Template
     - Job Description Template

3. **Category** (for email templates)
   - Select: Application Response, Interview, Offer, Rejection, General

4. **Subject Line** (for email templates, required)
   - Input: Text
   - Variable support: {{candidateName}}, {{jobTitle}}, etc.

5. **Template Content** (required)
   - **Rich Text Editor** with toolbar:
     - Bold, Italic, Underline
     - Heading levels (H1-H3)
     - Bullet/Numbered lists
     - Links
     - Variable insertion button

6. **AI Assistant** (purple button)
   - Opens AI sidebar
   - Prompts:
     - "Improve this template"
     - "Make it more professional"
     - "Make it more friendly"
     - "Add personalization"
   - Real-time preview of AI suggestions

7. **Variable Placeholders** (reference panel)
   - Shows available variables:
     - {{candidateName}}
     - {{jobTitle}}
     - {{companyName}}
     - {{interviewDate}}
     - {{interviewTime}}
     - {{meetingLink}}
   - Click to insert

**Actions:**
- Cancel
- Save as Draft
- Publish Template

**Functionality:**
- Saves to `templates` collection with companyId
- Validates variable syntax
- Preview mode shows variable replacement

---

### 6.5 AI Agent Configuration Form

**File:** `/src/app/dashboard/settings/ai-agents/[agent-name]/page.tsx`

**Example:** Resume Parser configuration

**Form Structure:**

**Tab Navigation:**
- Basic Settings
- System Prompt
- Model Parameters
- Testing

**Tab 1: Basic Settings**
1. **Agent Name** (read-only)
2. **Status**
   - Toggle: Enabled/Disabled
3. **Description**
   - Textarea (read-only, describes agent purpose)

**Tab 2: System Prompt**
1. **Use Custom Prompt**
   - Toggle (off = use platform default)
2. **Custom System Prompt**
   - Textarea: 1000 char max
   - Markdown supported
   - Preview panel

**Tab 3: Model Parameters**
1. **Model Selection**
   - Select:
     - Gemini 2.0 Flash (default)
     - Gemini 1.5 Pro
     - Gemini 1.5 Flash
2. **Temperature** (0.0 - 2.0)
   - Slider with numeric input
   - Default: 0.7
   - Description: "Controls randomness. Higher = more creative, Lower = more deterministic"
3. **Max Output Tokens**
   - Input: Number
   - Default: 2048
   - Range: 256 - 8192
4. **Top P** (0.0 - 1.0)
   - Slider
   - Default: 0.9
5. **Top K**
   - Input: Number
   - Default: 40

**Tab 4: Testing**
- Test input textarea
- "Run Test" button
- Output preview panel
- Shows:
  - Execution time
  - Token usage
  - Parsed JSON output
  - Validation errors (if any)

**Actions:**
- Reset to Defaults
- Save Configuration

**Functionality:**
- Saves to `aiAgentSettings` collection with companyId
- Validates JSON schemas (Zod)
- Live testing against Genkit flows

---

### 6.6 Pipeline Settings Form

**File:** `/src/app/dashboard/settings/pipeline/page.tsx`

**Form Fields:**

1. **Auto-Reject Threshold**
   - Slider: 0-100%
   - Default: 30%
   - Description: "Applications with match scores below this threshold will be automatically rejected"
   - Label shows current value: "30% - Rejecting lowest 30%"

2. **Minimum Applications Threshold**
   - Input: Number
   - Default: 5
   - Description: "Auto-reject will only activate if at least this many applications exist for a job"
   - Safety feature to prevent premature filtering

3. **Enable Auto-Reject**
   - Toggle switch
   - Description: "Automatically reject applications below the threshold"

4. **Send Rejection Notification**
   - Toggle switch
   - Description: "Send email to rejected candidates"
   - Only shown if auto-reject is enabled

**Actions:**
- Save Changes (primary button)

**Functionality:**
- Saves to `pipelineSettings` document under company
- Triggers Cloud Function: `onApplicationUpdate_CheckAutoReject`

---

### 6.7 Company Profile Form

**File:** `/src/app/dashboard/settings/company-profile/page.tsx`

**Form Fields:**

1. **Company Name** (required)
2. **Industry**
   - Select: Technology, Healthcare, Finance, etc.
3. **Company Size**
   - Select: 1-10, 11-50, 51-200, 201-500, 500+
4. **Website URL**
5. **Company Logo**
   - Image upload (PNG, JPG, SVG)
   - Max 2MB
   - Recommended: 500x500px
   - Shows preview
6. **Company Description**
   - Textarea: 500 char max
   - Shown on career page
7. **Headquarters Location**
8. **Founded Year**
9. **Social Media Links**
   - LinkedIn URL
   - Twitter URL
   - Facebook URL

**Actions:**
- Save Changes

**Functionality:**
- Updates company document
- Uploads logo to Firebase Storage: `/companies/{companyId}/logo`
- Real-time preview on career page

---

## 7. DATA TABLES & LISTS

### 7.1 Applications Table

**File:** `/src/app/dashboard/applications/page.tsx`

**Table Columns:**

| Column | Width | Content | Sortable |
|--------|-------|---------|----------|
| **Candidate** | 200px | Name (link) + Email (muted) | Yes |
| **Job** | 180px | Job title | Yes |
| **Applied** | 120px | Date formatted (e.g., "Oct 15, 2025") | Yes |
| **Match Score** | 100px | Badge (90%+ green, 70-89% light green, 50-69% yellow, <50% gray) | Yes |
| **AI Recommendation** | 150px | Badge (Fast Track, Strong Candidate, etc.) | No |
| **Status** | 200px | Dropdown select (for recruiters), Badge (for interviewers) | No |
| **Stage** | 180px | Dropdown select (for recruiters), Badge (for interviewers) | No |
| **Actions** | 80px | Dropdown menu (3 dots) | No |

**Actions Dropdown:**
- View Details → `/dashboard/applications/{id}`
- View Resume (opens in new tab)
- Email Candidate (mailto link)

**Filters (Above Table):**
- **Search**: Candidate name or email (text input)
- **Job**: Dropdown (all jobs + "All jobs" option)
- **Status**: Dropdown (9 status options + "All statuses")
- **Stage**: Dropdown (7 stage options + "All stages")
- **Clear Filters** button

**Status Options:**
1. Applied
2. Under Review
3. Screening Scheduled
4. Technical Interview Scheduled
5. Interview Scheduled
6. Offer Extended
7. Hired
8. Rejected
9. Withdrawn

**Stage Options:**
1. Application Review
2. Initial Screening
3. Technical Interview
4. Face-to-Face Interview
5. Final Review
6. Offer
7. Closed

**Inline Editing:**
- Recruiters/HR Admins can click status/stage dropdowns to update immediately
- Shows loading spinner during update
- Toast notification on success/error

**Role-Based Filtering:**
- **Interviewers**: Only see applications where they are in `assignedInterviewers` array
- **Recruiters/HR Admins**: See all company applications

**Sorting:**
- Default sort: Match score (highest first), then Applied date (newest first)

**Empty State:**
- Icon: Briefcase
- Title: "No applications found"
- Description: "Try adjusting your filters" or "Start by posting a job"
- CTA: "Post a Job" button

---

### 7.2 Jobs Table

**File:** `/src/components/dashboard/jobs-table.tsx`

**Table Columns:**

| Column | Content | Sortable |
|--------|---------|----------|
| **Job Title** | Title (bold) | Yes |
| **Department** | Department name | Yes |
| **Location** | City/Remote | No |
| **Type** | Badge (Full-time, Part-time, Contract, Internship) | No |
| **Status** | Badge (Open = green, Closed = gray, Archived = yellow) | Yes |
| **Applications** | Count with icon | Yes |
| **Created** | Date | Yes |
| **Actions** | Dropdown menu | No |

**Actions Dropdown:**
- View Details → `/dashboard/jobs/{id}`
- Edit Job (opens EditJobDialog)
- View Applications → `/dashboard/applications?jobId={id}`
- Archive Job (confirmation required)
- Delete Job (confirmation required)

**Row Click:**
- Clicking anywhere on row (except actions) navigates to job details

**Empty State:**
- Icon: Briefcase
- Title: "No jobs found"
- CTA: "Create your first job posting!"

---

### 7.3 Team Members Table

**File:** `/src/app/dashboard/team/page.tsx`

**Table Columns:**

| Column | Content | Sortable |
|--------|---------|----------|
| **Name** | Avatar + Display name | Yes |
| **Email** | Email address | Yes |
| **Role** | Badge (Recruiter, Interviewer, HR Admin) | Yes |
| **Status** | Badge (Active, Invited, Suspended) | Yes |
| **Last Active** | Timestamp (e.g., "2 hours ago") | Yes |
| **Actions** | Dropdown menu | No |

**Actions Dropdown:**
- Edit Role
- Resend Invite (if status = Invited)
- Suspend User
- Remove from Team (confirmation required)

**Pending Invites Section:**
- Separate table below main team table
- Columns: Email, Role, Invited By, Sent At, Expires At, Actions
- Actions: Resend Invite, Cancel Invite

---

### 7.4 Templates List

**File:** `/src/app/dashboard/templates/page.tsx`

**Layout:** Grid of template cards (3 columns)

**Card Content:**
- Template name (bold)
- Template type badge
- Category badge
- Preview text (first 100 chars)
- Updated date
- Actions: Edit, Duplicate, Delete

**Filters:**
- Search by name
- Filter by type (Email, Interview Questions, Job Description)
- Filter by category (for email templates)

**Empty State:**
- Icon: FileText
- Title: "No templates found"
- CTA: "Create your first template"

---

### 7.5 Meetings List

**File:** `/src/app/dashboard/meetings/page.tsx`

**Layout:** List of meeting cards

**Card Content:**
- Meeting title
- Date and time
- Duration
- Participants (avatars)
- AI summary badge (if processed)
- "View Notes" button

**Functionality:**
- Click card → Navigate to meeting details
- Shows transcript, AI summary, action items

---

### 7.6 Candidate Applications List (Candidate View)

**File:** `/src/app/candidate/applications/page.tsx`

**Layout:** List of application cards (1 column)

**Card Content:**
- Job title (bold)
- Company name
- Status badge (color-coded)
- Applied date
- Match score (if available)
- "View Details" button

**Filters:**
- Search by job title or company
- Filter by status

**Empty State:**
- Icon: Briefcase
- Title: "No applications yet"
- Description: "Start your job search today!"
- CTA: "Browse Jobs" button

---

### 7.7 Interviews List (Candidate View)

**File:** `/src/app/candidate/interviews/page.tsx`

**Layout:** Tabbed interface

**Tab 1: Upcoming**
- Cards for scheduled interviews
- Card content:
  - Job title + Company
  - Interview type badge
  - Date/time
  - Duration
  - Location or meeting link
  - "Join" or "Start Interview" button

**Tab 2: Past**
- Completed interviews
- Shows outcome (if feedback shared)
- Read-only

---

## 8. TABS & TABBED INTERFACES

### 8.1 Application Details Tabs

**File:** `/src/app/dashboard/applications/[id]/page.tsx`

**Layout:** Horizontal tabs below header

**Tabs:**

**Tab 1: Overview**
- Candidate information card
  - Name, email, phone, LinkedIn
  - Match score (large, color-coded badge)
  - AI recommendation badge
- AI Analysis section
  - Executive summary
  - One-liner
  - Key strengths (bullet list)
  - Red flags (if any, highlighted in red)
- Resume preview (embedded PDF viewer)
- Application timeline
  - Applied → Reviewed → Interviewed → Offered/Rejected
  - Each step with timestamp

**Tab 2: AI Analysis (Full)**
- Detailed AI analysis JSON
- Structured display:
  - Skills match (table)
  - Experience alignment (scored)
  - Education requirements (met/unmet)
  - Culture fit indicators
- Match score breakdown (visual chart)

**Tab 3: Interviews**
- List of scheduled interviews
- Past interviews with feedback
- "Schedule Interview" button

**Tab 4: Communication**
- Email history (thread view)
- Send email button
- Calendar invites sent

**Tab 5: Notes**
- Internal notes (recruiter only)
- Add note textarea
- Notes list (with author, timestamp)

---

### 8.2 Interviewer Dashboard Tabs

**File:** `/src/app/interviewer/dashboard/page.tsx`

**Tabs:**

**Tab 1: Upcoming**
- Interviews scheduled in future
- Sorted by date (soonest first)

**Tab 2: Pending Feedback**
- Completed interviews without feedback
- Yellow highlight
- "Submit Feedback" CTA

**Tab 3: Completed**
- Interviews with submitted feedback
- Read-only

---

### 8.3 AI Agent Configuration Tabs

**File:** `/src/app/dashboard/settings/ai-agents/[agent-name]/page.tsx`

**Tabs:**

**Tab 1: Basic Settings**
- Agent status toggle
- Description

**Tab 2: System Prompt**
- Custom prompt editor

**Tab 3: Model Parameters**
- Temperature, Max Tokens, Top P, Top K

**Tab 4: Testing**
- Test interface

---

### 8.4 Settings Page Tabs

**File:** `/src/app/dashboard/settings/page.tsx`

**Layout:** Vertical sidebar navigation (settings pages)

**Tabs (Left Sidebar):**
- Profile
- Email Preferences
- Notifications
- Integrations (HR Admin only)
- AI Agents (HR Admin only)
- Pipeline Settings (HR Admin only)
- Company Profile (HR Admin only)
- Career Page (HR Admin only)
- Meeting Bots (HR Admin only)
- Billing (HR Admin only)

**Each tab loads a different settings page**

---

## 9. REUSABLE UI COMPONENTS

### 9.1 Badges

**File:** `/src/components/ui/badge.tsx`

**Variants:**
- `default` - Green background
- `secondary` - Gray background
- `destructive` - Red background
- `outline` - Transparent with border

**Common Badge Types in App:**

**Status Badges:**
- Applied: `bg-green-50 text-green-700 border-green-200`
- Under Review: `bg-yellow-50 text-yellow-700 border-yellow-200`
- Interview Scheduled: `bg-green-100 text-green-800 border-green-300`
- Hired: `bg-green-500 text-white border-green-600`
- Rejected: `bg-red-50 text-red-700 border-red-200`

**Match Score Badges:**
- 90-100%: `bg-green-50 text-green-700 border-green-200` (dark green)
- 70-89%: `bg-green-50 text-green-600 border-green-100` (green)
- 50-69%: `bg-yellow-50 text-yellow-700 border-yellow-200` (yellow)
- <50%: `bg-gray-50 text-gray-600 border-gray-200` (gray)

**AI Recommendation Badges:**
- Fast Track: `bg-green-100 text-green-800 border-green-300`
- Strong Candidate: `bg-green-50 text-green-700 border-green-200`
- Worth Reviewing: `bg-yellow-50 text-yellow-700 border-yellow-200`
- Marginal Fit: `bg-gray-50 text-gray-600 border-gray-200`
- Not Recommended: `bg-red-50 text-red-700 border-red-200`

**Job Type Badges:**
- Full-time, Part-time, Contract, Internship (all outline variant)

---

### 9.2 Cards

**File:** `/src/components/ui/card.tsx`

**Structure:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

**Common Card Types:**

**Stats Card:**
- Icon in top-right corner (green color)
- Large number value (2xl font, black)
- Small description text (xs font, gray)

**Application Card:**
- Candidate name + job title
- Status badge
- Match score
- Applied date
- Actions

**Interview Card:**
- Job title + company
- Interview type badge
- Date/time + duration
- Location or meeting link
- Action buttons

---

### 9.3 Empty States

**File:** `/src/components/ui/empty-state.tsx`

**Structure:**
- Icon (large, centered, muted color)
- Title (bold)
- Description (muted text)
- Optional CTA button

**Examples:**

**No Applications:**
- Icon: Briefcase
- Title: "No applications found"
- Description: "Try adjusting your filters"

**No Jobs:**
- Icon: Briefcase
- Title: "No jobs found"
- Description: "Create your first job posting!"
- CTA: "Create Job" button

---

### 9.4 Loading Skeletons

**File:** `/src/components/ui/loading-skeletons.tsx`

**Skeleton Types:**

**DashboardGridSkeleton:**
- 4-column grid of stat card skeletons
- Table skeleton below

**ApplicationCardSkeleton:**
- Card with animated pulse
- 3 rows of different widths

**StatsCardSkeleton:**
- Rectangular card with pulse animation

**JobCardSkeleton:**
- Card shape with placeholder content

---

### 9.5 Page Transitions

**File:** `/src/components/ui/page-transition.tsx`

**Components:**

**PageTransition:**
- Wraps page content
- Fade-in animation on mount
- Duration: 300ms

**StaggerContainer & StaggerItem:**
- For list animations
- Each item fades in with delay

**Usage:**
```tsx
<PageTransition>
  <StaggerContainer>
    {items.map((item, i) => (
      <StaggerItem index={i} key={item.id}>
        {/* Card or item */}
      </StaggerItem>
    ))}
  </StaggerContainer>
</PageTransition>
```

---

### 9.6 Tooltips

**File:** `/src/components/ui/tooltip.tsx`

**Usage:**
```tsx
<Tooltip>
  <TooltipTrigger>Hover me</TooltipTrigger>
  <TooltipContent>Tooltip text</TooltipContent>
</Tooltip>
```

**Common Uses:**
- Action button labels
- Icon explanations
- Keyboard shortcuts (e.g., "⌘K" in search)

---

### 9.7 Dropdowns

**File:** `/src/components/ui/dropdown-menu.tsx`

**Structure:**
```tsx
<DropdownMenu>
  <DropdownMenuTrigger>
    <Button>Open</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Item 1</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Item 2</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

**Common Dropdown Types:**

**Actions Dropdown (3 dots):**
- Trigger: MoreVertical icon
- Items: View Details, Edit, Delete

**User Dropdown:**
- Trigger: Avatar
- Header: Name + email
- Items: Profile, Settings, Logout

---

### 9.8 Select Components

**File:** `/src/components/ui/select.tsx`

**Usage:**
```tsx
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

**Common Select Fields:**
- Job Type (Full-time, Part-time, Contract, Internship)
- Experience Level (Entry, Mid, Senior, Lead, Executive)
- Application Status (9 options)
- Application Stage (7 options)

---

### 9.9 Date Pickers

**File:** `/src/components/ui/date-range-picker.tsx`

**Component:** DateRangePicker

**Usage:**
```tsx
<DateRangePicker 
  value={dateRange} 
  onChange={setDateRange} 
/>
```

**Functionality:**
- Opens calendar popover
- Select start and end date
- Shows selected range in trigger button

---

### 9.10 Buttons

**File:** `/src/components/ui/button.tsx`

**Variants:**
- `default` - Green background, white text
- `secondary` - Gray background
- `outline` - Transparent with border
- `ghost` - Transparent, hover background
- `destructive` - Red background
- `link` - No background, underline on hover

**Sizes:**
- `sm` - Small (h-8 px-3)
- `default` - Medium (h-10 px-4)
- `lg` - Large (h-11 px-8)
- `icon` - Square (h-10 w-10)

**Common Button Patterns:**

**Primary Action:**
- Variant: default (green)
- Icon + text (icon on left)
- Example: "Create Job"

**Secondary Action:**
- Variant: outline
- Example: "Cancel"

**Destructive Action:**
- Variant: destructive (red)
- Example: "Delete Job"

**Icon Button:**
- Variant: ghost
- Size: icon
- Example: More actions (3 dots)

---

## 10. KEY USER FLOWS

### 10.1 Candidate Application Flow

**Starting Point:** Public job board (`/careers`)

**Steps:**

1. **Browse Jobs**
   - Navigate to `/careers`
   - See list of all open jobs across all companies
   - Filter by: Location, Job Type, Department
   - Search by keywords

2. **View Job Details**
   - Click job card → Navigate to `/careers/[id]`
   - See: Job title, Company info, Description, Requirements, Benefits, Salary range
   - "Apply Now" button (prominent, green)

3. **Authentication Check**
   - If not logged in → Redirect to `/auth/login` with return URL
   - Can choose "Sign in" or "Create candidate account"
   - If creating account → Navigate to `/auth/signup/candidate/wizard`

4. **Candidate Signup Wizard** (if new user)
   - **Step 1:** Account creation (name, email, password)
   - **Step 2:** Profile information (phone, location, experience years)
   - **Step 3:** Resume upload + AI parsing preview
   - **Step 4:** Preferences and consents
   - Submit → Creates account → Redirect to application form

5. **Application Submission**
   - Navigate to `/careers/[id]/apply`
   - **Step 1:** Personal information (pre-filled from profile)
   - **Step 2:** Resume upload (or use uploaded resume)
   - **Step 3:** Additional info (salary expectations, notice period)
   - Consents (AI processing, interview recording) - **REQUIRED**
   - Submit Application button

6. **Backend Processing** (automatic)
   - Upload resume to Firebase Storage: `/resumes/{companyId}/{candidateId}/{filename}`
   - Create application document in Firestore:
     ```javascript
     {
       id: "APP-2025-0001",
       candidateId: "user123",
       candidateName: "John Doe",
       candidateEmail: "john@example.com",
       jobId: "job456",
       companyId: "company789",
       status: "Applied",
       stage: "Application Review",
       appliedAt: Timestamp.now(),
       resumeUrl: "https://storage.googleapis.com/...",
       consents: {
         aiProcessing: true,
         interviewRecording: true
       }
     }
     ```
   - Trigger AI pipeline (Cloud Function: `onResumeUpload_StartProcessingPipeline`):
     1. **Resume Parsing:** Extract structured data (name, email, skills, experience, education)
     2. **Profile Generation:** Enrich candidate profile with parsed data
     3. **Vector Embedding:** Generate embeddings for semantic search
     4. **Job Matching & Scoring:** Compare candidate to job requirements → Generate match score (0-100%)
     5. **Candidate Summarization:** Generate AI summary:
        ```javascript
        {
          matchScore: 85,
          aiSummary: {
            oneLiner: "5 years React dev with strong TS",
            executiveSummary: "Experienced frontend developer...",
            recommendation: "Strong Candidate",
            strengths: ["React", "TypeScript", "Leadership"],
            redFlags: ["Frequent job changes"]
          }
        }
        ```

7. **Success Page**
   - Confirmation message
   - Application ID displayed
   - "View My Applications" button → Navigate to `/candidate/applications`

8. **Email Notifications**
   - Candidate receives "Application Received" email
   - Recruiter receives notification of new application

**Decision Points:**
- **AI Match Score < Auto-Reject Threshold:** Application automatically rejected (if auto-reject enabled)
- **AI Match Score >= 70%:** Application highlighted as "Top Match" in recruiter dashboard

**Expected Outcome:**
- Application visible in candidate's `/candidate/applications` page
- Application visible in recruiter's `/dashboard/applications` page
- Candidate can track status in real-time

---

### 10.2 Recruiter Job Posting Flow

**Starting Point:** Dashboard or Jobs page

**Steps:**

1. **Navigate to Jobs**
   - Dashboard → Click "Jobs" in sidebar
   - Or: `/dashboard/jobs`

2. **Create New Job**
   - Click "Create Job" button (or press Cmd/Ctrl+N)
   - Opens `CreateJobDialog`

3. **Fill Job Details**
   - **Job Title:** e.g., "Senior Frontend Developer"
   - **Department:** e.g., "Engineering"
   - **Location:** e.g., "Remote" or "San Francisco, CA"
   - **Job Type:** Select from Full-time, Part-time, Contract, Internship
   - **Experience Level:** Select from Entry, Mid, Senior, Lead, Executive
   - **Salary Range:** Min and Max (e.g., $120,000 - $150,000)
   - **Job Description:** Rich text editor (or use AI assistant for generation)
   - **Required Skills:** Tags (e.g., "React, TypeScript, Node.js")
   - **Benefits:** e.g., "Health insurance, 401k, Flexible hours"

4. **Optional: AI Job Description Generator**
   - Click "AI Assistant" button
   - Provide brief prompt (e.g., "Senior React developer role")
   - AI generates full job description
   - Review and edit AI-generated content

5. **Submit**
   - Click "Create Job"
   - Validation checks (required fields)
   - Backend processing:
     ```javascript
     {
       id: "JOB-2025-0001",
       companyId: "company789",
       title: "Senior Frontend Developer",
       department: "Engineering",
       location: "Remote",
       type: "Full-time",
       experienceLevel: "Senior",
       salaryMin: 120000,
       salaryMax: 150000,
       description: "...",
       requiredSkills: ["React", "TypeScript", "Node.js"],
       benefits: "...",
       status: "Open",
       applicants: 0,
       createdAt: Timestamp.now(),
       createdBy: "recruiter123"
     }
     ```
   - Trigger Cloud Function: `onJobWrite_VectorizeDescription`
     - Generates vector embedding for job description
     - Stores in Firestore for semantic search

6. **Success**
   - Toast notification: "Job created successfully!"
   - Dialog closes
   - New job appears in jobs table
   - Job is live on public career page (`/careers`)

7. **Post-Creation Actions**
   - Edit job (click "Edit" in actions dropdown)
   - View applications (click "View Applications")
   - Archive job (click "Archive")
   - Share job link (copy URL to `/careers/[id]`)

**Expected Outcome:**
- Job visible in `/dashboard/jobs`
- Job visible on public career page `/careers`
- Candidates can apply immediately

---

### 10.3 Interview Scheduling Flow

**Starting Point:** Application details page

**Steps:**

1. **Review Application**
   - Recruiter navigates to `/dashboard/applications/[id]`
   - Reviews: Candidate profile, Match score, AI analysis, Resume

2. **Decision to Interview**
   - Click "Schedule Interview" button
   - Opens `ScheduleInterviewDialog`

3. **Select Interview Type**
   - **AI Screening:** Automated Q&A with AI (voice or text)
   - **AI Technical:** Automated coding/technical assessment
   - **Face-to-Face:** Human interviewer (1-on-1)
   - **Panel Interview:** Multiple interviewers

4. **Fill Interview Details**
   - **Interview Title:** e.g., "Initial Screening"
   - **Scheduled Date:** Date picker (default: tomorrow)
   - **Scheduled Time:** Time picker (15-min intervals)
   - **Duration:** Select (15, 30, 45, 60, 90, 120 minutes)
   - **Assign Interviewers:** (If Face-to-Face or Panel)
     - Multi-select dropdown
     - Shows team members with `interviewer` or `hr_admin` role
     - Displays: Avatar, Name, Email
   - **Meeting Link:** (Optional, for remote interviews)
     - Zoom, Google Meet, Teams link
   - **Location:** (Optional, for in-person interviews)
     - e.g., "Conference Room A, Building 2"
   - **Interview Notes:** (Internal, visible to interviewers)

5. **Submit**
   - Click "Schedule Interview"
   - Backend processing:
     ```javascript
     {
       id: "INT-2025-0001",
       applicationId: "APP-2025-0001",
       candidateId: "user123",
       candidateName: "John Doe",
       jobId: "job456",
       companyId: "company789",
       type: "face_to_face",
       status: "scheduled",
       scheduledAt: Timestamp.fromDate(new Date("2025-11-15T10:00:00")),
       duration: 60,
       assignedInterviewers: ["interviewer456", "interviewer789"],
       meetingLink: "https://meet.google.com/abc-defg-hij",
       location: null,
       notes: "Focus on React and TypeScript experience"
     }
     ```
   - Trigger Cloud Function: `onInterviewCreate_NotifyInterviewers`
     - Sends email notifications to:
       - Candidate (with meeting link and details)
       - Assigned interviewers
     - Generates calendar invite (.ics file):
       - Includes all participants (candidate + interviewers)
       - Meeting link in description
       - Reminder set for 1 day and 1 hour before

6. **Success**
   - Toast notification: "Interview scheduled successfully!"
   - Dialog closes
   - Interview appears in "Interviews" tab of application details
   - Application status updated to "Interview Scheduled"
   - Application stage updated to "Face-to-Face Interview"

7. **Notifications Sent**
   - **Candidate Email:**
     - Subject: "Interview Invitation - {Job Title} at {Company}"
     - Body: Interview details, date/time, meeting link, interviewer names
     - Attachment: .ics calendar invite
   - **Interviewer Email (for each assigned interviewer):**
     - Subject: "Interview Assignment - {Candidate Name} for {Job Title}"
     - Body: Candidate name, resume link, interview notes
     - Attachment: .ics calendar invite

8. **Interviewer View**
   - Interviewers see interview in `/interviewer/dashboard` (Upcoming tab)
   - Can click "View Details" to see candidate profile (read-only)
   - Can click "View Resume" to open resume

9. **Candidate View**
   - Candidate sees interview in `/candidate/interviews` page
   - Shows: Job title, Company, Type, Date/time, Duration, Location/Link
   - Actions:
     - "Join" button (if meeting link provided)
     - "Start Interview" button (if AI interview)

**Expected Outcome:**
- Interview scheduled and visible to all parties
- Calendar invites sent
- Interviewers notified and assigned
- Candidate prepared for interview

---

### 10.4 Interviewer Feedback Submission Flow

**Starting Point:** Interviewer dashboard after interview completion

**Steps:**

1. **View Completed Interview**
   - Interviewer navigates to `/interviewer/dashboard`
   - Clicks "Pending Feedback" tab
   - Sees list of completed interviews without feedback

2. **Open Feedback Form**
   - Click "Submit Feedback" button on interview card
   - Navigate to `/interviewer/feedback/[interviewId]`

3. **Fill Feedback Form**
   - **Overall Rating:** 5-star rating (required)
     - 1 star = Poor, 5 stars = Excellent
   - **Recommendation:** Radio buttons (required)
     - Strong Hire
     - Hire
     - Consider
     - Do Not Hire
   - **Strengths:** Textarea (required)
     - Placeholder: "What did the candidate do well?"
   - **Concerns/Weaknesses:** Textarea (required)
     - Placeholder: "What are areas of improvement?"
   - **Technical Skills Rating:** (if technical interview)
     - For each skill tested (e.g., React, TypeScript)
     - 5-star rating
   - **Culture Fit Rating:** 5-star rating
   - **Communication Skills Rating:** 5-star rating
   - **Additional Notes:** Textarea (optional)

4. **Submit Feedback**
   - Click "Submit Feedback" button
   - Validation checks (required fields)
   - Backend processing:
     ```javascript
     // Saves to feedback sub-collection under application
     {
       feedbackId: "FEEDBACK-2025-0001",
       interviewId: "INT-2025-0001",
       interviewerId: "interviewer456",
       interviewerName: "Jane Smith",
       applicationId: "APP-2025-0001",
       submittedAt: Timestamp.now(),
       rating: 4,
       recommendation: "Hire",
       strengths: "Strong React skills, good communication...",
       concerns: "Limited experience with testing frameworks",
       technicalSkills: {
         React: 5,
         TypeScript: 4,
         Testing: 3
       },
       cultureFit: 4,
       communicationSkills: 5,
       notes: "Candidate would be a good fit for mid-level role"
     }
     ```
   - Update interview document:
     ```javascript
     {
       status: "completed",
       completedAt: Timestamp.now(),
       feedbackSubmitted: true
     }
     ```
   - Trigger Cloud Function: `onFeedbackCreate_notifyRecruiter`
     - Sends email to recruiter: "Feedback submitted for {Candidate Name}"

5. **Success**
   - Toast notification: "Feedback submitted successfully!"
   - Redirect to `/interviewer/dashboard`
   - Interview moves from "Pending Feedback" to "Completed" tab

6. **Recruiter View**
   - Recruiter sees feedback in application details page
   - "Interviews" tab shows interview with feedback badge
   - Click interview → See full feedback details
   - Can see all interviewer feedback (if panel interview)

**Expected Outcome:**
- Feedback recorded and associated with application
- Recruiter notified
- Interview marked as completed
- Feedback influences hiring decision

---

### 10.5 Team Member Invitation Flow

**Starting Point:** HR Admin in Team page

**Steps:**

1. **Navigate to Team Management**
   - HR Admin clicks "Team" in sidebar
   - Navigate to `/dashboard/team`
   - See list of current team members

2. **Invite New Member**
   - Click "Invite Team Member" button
   - Opens invite dialog

3. **Fill Invite Form**
   - **Email Address:** Input (required)
     - Validation: Must be valid email format
   - **Display Name:** Input (required)
   - **Role:** Select (required)
     - Recruiter
     - Interviewer
     - HR Admin
   - **Send Welcome Email:** Checkbox (checked by default)

4. **Submit Invitation**
   - Click "Send Invite"
   - Backend processing:
     ```javascript
     {
       inviteId: "INVITE-2025-0001",
       email: "newuser@example.com",
       displayName: "New User",
       role: "interviewer",
       companyId: "company789",
       invitedBy: "hradmin123",
       invitedByName: "Admin User",
       inviteToken: "random-secure-token-abc123",
       status: "pending",
       sentAt: Timestamp.now(),
       expiresAt: Timestamp.fromDate(new Date(Date.now() + 7*24*60*60*1000)) // 7 days
     }
     ```
   - Send invitation email to invitee:
     - Subject: "You've been invited to join {Company Name} on Persona Recruit AI"
     - Body:
       - Greeting
       - "{Inviter Name} has invited you to join {Company Name} as a {Role}"
       - "Click the link below to accept your invitation:"
       - Button: "Accept Invitation" → `/auth/accept-invite?token={inviteToken}`
       - "This invitation expires in 7 days"

5. **Success**
   - Toast notification: "Invite sent to {email}"
   - Dialog closes
   - Invite appears in "Pending Invites" section of team page

6. **Invitee Receives Email**
   - Click "Accept Invitation" link
   - Navigate to `/auth/accept-invite?token={inviteToken}`

7. **Invitee Accepts Invitation**
   - Form displayed:
     - Email (pre-filled, read-only)
     - Display Name (pre-filled, editable)
     - Role (read-only, shows assigned role)
     - Password (required)
     - Confirm Password (required)
   - Submit "Create Account"
   - Backend processing:
     - Create Firebase Auth user
     - Create user document:
       ```javascript
       {
         uid: "newuser123",
         email: "newuser@example.com",
         displayName: "New User",
         role: "interviewer",
         companyId: "company789",
         createdAt: Timestamp.now()
       }
       ```
     - Update invite document: `status: "accepted"`
     - Send welcome email to user

8. **Success**
   - Toast notification: "Account created successfully!"
   - Redirect to role-specific dashboard:
     - Interviewer → `/interviewer/dashboard`
     - Recruiter → `/dashboard`
     - HR Admin → `/dashboard`

9. **HR Admin View**
   - Invite moves from "Pending" to team members list
   - New user appears with status "Active"

**Alternate Flows:**

**Resend Invite:**
- HR Admin clicks "Resend Invite" in pending invites list
- New email sent with same token
- Toast notification: "Invite resent"

**Cancel Invite:**
- HR Admin clicks "Cancel Invite"
- Confirmation dialog
- Invite document deleted
- Toast notification: "Invite canceled"

**Invite Expired:**
- If invitee clicks link after 7 days
- Show error page: "This invitation has expired. Please contact your administrator."

**Expected Outcome:**
- New team member added to company
- Role-based access granted
- Can log in and access appropriate features

---

## 11. COMPONENT FILE REFERENCE

### 11.1 Core Layout Components

| Component | File Path | Purpose |
|-----------|-----------|---------|
| Root Layout | `/src/app/layout.tsx` | Global layout, AuthProvider, fonts, Toaster |
| Dashboard Layout | `/src/app/dashboard/layout.tsx` | Sidebar, header, search, company logo |
| Candidate Layout | `/src/app/candidate/layout.tsx` | Candidate sidebar, topbar |
| Interviewer Layout | `/src/app/interviewer/layout.tsx` | Same as dashboard layout, "Interviewer Portal" branding |
| Platform Admin Layout | `/src/app/platform-admin/layout.tsx` | Same as dashboard layout, "Platform Admin" branding |
| Marketing Layout | `/src/app/(marketing)/layout.tsx` | Public marketing pages |
| Docs Layout | `/src/app/docs/layout.tsx` | Documentation pages |

---

### 11.2 Navigation Components

| Component | File Path | Purpose |
|-----------|-----------|---------|
| MainNav | `/src/components/dashboard/main-nav.tsx` | Role-based sidebar navigation links |
| UserNav | `/src/components/dashboard/user-nav.tsx` | User dropdown menu (avatar, profile, logout) |
| CandidateSidebar | `/src/components/layouts/candidate-sidebar.tsx` | Candidate-specific sidebar with badges |
| CandidateTopbar | `/src/components/layouts/candidate-topbar.tsx` | Search, notifications, user dropdown |

---

### 11.3 Dashboard Components

| Component | File Path | Purpose |
|-----------|-----------|---------|
| Dashboard Page (Recruiter) | `/src/app/dashboard/page.tsx` | Main dashboard with stats, charts, top matches |
| Candidate Dashboard | `/src/app/candidate/page.tsx` | Candidate stats, applications, interviews |
| Interviewer Dashboard | `/src/app/interviewer/dashboard/page.tsx` | Upcoming interviews, pending feedback |
| Platform Admin Dashboard | `/src/app/platform-admin/dashboard/page.tsx` | Platform-wide metrics |

---

### 11.4 Dialogs & Modals

| Component | File Path | Purpose |
|-----------|-----------|---------|
| CreateJobDialog | `/src/components/dashboard/create-job-dialog.tsx` | Job creation form |
| EditJobDialog | `/src/components/dashboard/edit-job-dialog.tsx` | Job editing form |
| ScheduleInterviewDialog | `/src/components/interviews/schedule-interview-dialog.tsx` | Interview scheduling form |
| SendEmailDialog | `/src/components/emails/send-email-dialog.tsx` | Email composition with templates |
| AddCandidateDialog | `/src/components/dashboard/add-candidate-dialog.tsx` | Manually add candidate to talent pool |

---

### 11.5 Table Components

| Component | File Path | Purpose |
|-----------|-----------|---------|
| Applications Table | `/src/app/dashboard/applications/page.tsx` | Inline table with filters, sorting |
| JobsTable | `/src/components/dashboard/jobs-table.tsx` | Reusable jobs table |

---

### 11.6 Form Components

| Component | File Path | Purpose |
|-----------|-----------|---------|
| Application Form | `/src/app/careers/[id]/apply/page.tsx` | Multi-step application form |
| Candidate Signup Wizard | `/src/app/auth/signup/candidate/wizard/page.tsx` | 4-step candidate onboarding |
| Company Signup Wizard | `/src/app/auth/signup/company/wizard/page.tsx` | 4-step company onboarding |
| Template Editor | `/src/app/dashboard/templates/new/page.tsx` | Rich text template editor with AI |
| Feedback Form | `/src/app/interviewer/feedback/[interviewId]/page.tsx` | Interviewer feedback submission |
| Pipeline Settings | `/src/app/dashboard/settings/pipeline/page.tsx` | Auto-reject threshold slider |
| Company Profile Form | `/src/app/dashboard/settings/company-profile/page.tsx` | Company branding form |

---

### 11.7 UI Primitives (Shadcn)

| Component | File Path | Purpose |
|-----------|-----------|---------|
| Badge | `/src/components/ui/badge.tsx` | Status, score, recommendation badges |
| Button | `/src/components/ui/button.tsx` | All button variants |
| Card | `/src/components/ui/card.tsx` | Container for content sections |
| Dialog | `/src/components/ui/dialog.tsx` | Modal dialogs |
| AlertDialog | `/src/components/ui/alert-dialog.tsx` | Confirmation dialogs |
| Select | `/src/components/ui/select.tsx` | Dropdown selects |
| Input | `/src/components/ui/input.tsx` | Text inputs |
| Textarea | `/src/components/ui/textarea.tsx` | Multi-line text inputs |
| Table | `/src/components/ui/table.tsx` | Data tables |
| Skeleton | `/src/components/ui/skeleton.tsx` | Loading placeholders |
| Tooltip | `/src/components/ui/tooltip.tsx` | Tooltips |
| DropdownMenu | `/src/components/ui/dropdown-menu.tsx` | Dropdown menus |
| Sidebar | `/src/components/ui/sidebar.tsx` | Collapsible sidebar |

---

### 11.8 AI Components

| Component | File Path | Purpose |
|-----------|-----------|---------|
| AI Components (Lazy) | `/src/components/ai/ai-components-lazy.tsx` | Lazy-loaded AI components (resume parser, interview, etc.) |
| Chart Components (Lazy) | `/src/components/ui/chart-lazy.tsx` | Lazy-loaded Recharts components |

---

### 11.9 Authentication Components

| Component | File Path | Purpose |
|-----------|-----------|---------|
| ProtectedRoute | `/src/components/auth/protected-route.tsx` | Role-based route protection |
| HR Admin Route | `/src/components/auth/hr-admin-route.tsx` | HR admin permission hooks |
| Recruiter Route | `/src/components/auth/recruiter-route.tsx` | Recruiter permission hooks |

---

### 11.10 Privacy & GDPR Components

| Component | File Path | Purpose |
|-----------|-----------|---------|
| SimpleCookieBanner | `/src/components/privacy/simple-cookie-banner.tsx` | Cookie consent banner |
| CookiePreferencesManager | `/src/components/privacy/cookie-consent-banner.tsx` | Granular cookie preferences |

---

### 11.11 Feedback & Error Components

| Component | File Path | Purpose |
|-----------|-----------|---------|
| BugReportButton | `/src/components/feedback/bug-report-button.tsx` | Floating bug report button |
| GlobalErrorHandler | `/src/components/error-boundary/index.tsx` | Global error boundary |
| RouteErrorBoundary | `/src/components/error-boundary/index.tsx` | Per-route error boundaries |

---

### 11.12 Performance Components

| Component | File Path | Purpose |
|-----------|-----------|---------|
| ChunkPreloader | `/src/components/performance/chunk-preloader.tsx` | Progressive chunk loading after initial render |

---

## APPENDIX A: COLOR SCHEME

**Primary Colors:**
- Primary Green: `#16a34a` (green-600)
- Primary Hover: `#15803d` (green-700)

**Status Colors:**
- Success: Green (`#16a34a`)
- Warning: Yellow (`#eab308`)
- Error: Red (`#dc2626`)
- Info: Blue (`#3b82f6`)

**Match Score Colors:**
- 90-100%: Dark Green (`#15803d`)
- 70-89%: Green (`#16a34a`)
- 50-69%: Yellow (`#eab308`)
- <50%: Gray (`#6b7280`)

**AI Recommendation Colors:**
- Fast Track: Light Green (`#bbf7d0`)
- Strong Candidate: Green (`#dcfce7`)
- Worth Reviewing: Yellow (`#fef3c7`)
- Marginal Fit: Gray (`#f3f4f6`)
- Not Recommended: Light Red (`#fee2e2`)

---

## APPENDIX B: TYPOGRAPHY

**Fonts:**
- **Headings:** Space Grotesk (variable font: `--font-heading`)
- **Body:** Inter (variable font: `--font-sans`)

**Font Sizes:**
- `text-3xl`: Dashboard page titles (30px)
- `text-2xl`: Stats card values (24px)
- `text-lg`: Section titles (18px)
- `text-base`: Body text (16px)
- `text-sm`: Labels, secondary text (14px)
- `text-xs`: Muted text, badges (12px)

---

## APPENDIX C: KEYBOARD SHORTCUTS

| Shortcut | Action | Context |
|----------|--------|---------|
| `Cmd/Ctrl+K` | Focus search | All dashboard layouts |
| `Cmd/Ctrl+N` | Create new job | Jobs page (recruiters/HR admins only) |

---

## APPENDIX D: RESPONSIVE BREAKPOINTS

**Tailwind Breakpoints:**
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

**Layout Behavior:**
- **Mobile (<768px):**
  - Sidebar hidden, hamburger menu
  - Stats cards stack (1 column)
  - Tables scroll horizontally
- **Tablet (768px-1023px):**
  - Sidebar visible
  - Stats cards 2 columns
  - Tables scroll if needed
- **Desktop (1024px+):**
  - Full sidebar
  - Stats cards 4 columns
  - Tables full width

---

## APPENDIX E: FIRESTORE DATA STRUCTURE

### Collections:

**users**
- `uid` (string, document ID)
- `email` (string)
- `displayName` (string)
- `role` (string: candidate, recruiter, interviewer, hr_admin, platform_admin)
- `companyId` (string, null for candidates)
- `photoURL` (string, optional)
- `createdAt` (Timestamp)

**companies**
- `companyId` (string, document ID)
- `name` (string)
- `industry` (string)
- `size` (string)
- `logoURL` (string, optional)
- `website` (string)
- `createdAt` (Timestamp)

**jobs**
- `id` (string, document ID, format: JOB-2025-0001)
- `companyId` (string, indexed)
- `title` (string)
- `department` (string)
- `location` (string)
- `type` (string: Full-time, Part-time, Contract, Internship)
- `experienceLevel` (string)
- `salaryMin` (number)
- `salaryMax` (number)
- `description` (string)
- `requiredSkills` (array of strings)
- `benefits` (string)
- `status` (string: Open, Closed, Archived)
- `applicants` (number)
- `createdAt` (Timestamp)
- `createdBy` (string, userId)

**applications**
- `id` (string, document ID, format: APP-2025-0001)
- `candidateId` (string, indexed)
- `candidateName` (string)
- `candidateEmail` (string)
- `jobId` (string, indexed)
- `jobTitle` (string)
- `companyId` (string, indexed)
- `resumeUrl` (string)
- `status` (string)
- `stage` (string)
- `appliedAt` (Timestamp)
- `matchScore` (number, 0-100)
- `aiSummary` (object):
  - `oneLiner` (string)
  - `executiveSummary` (string)
  - `recommendation` (string)
  - `strengths` (array of strings)
  - `redFlags` (array of strings)
- `consents` (object):
  - `aiProcessing` (boolean)
  - `interviewRecording` (boolean)

**Sub-collection: applications/{id}/feedback**
- `feedbackId` (string)
- `interviewerId` (string)
- `interviewerName` (string)
- `applicationId` (string)
- `rating` (number, 1-5)
- `recommendation` (string)
- `strengths` (string)
- `concerns` (string)
- `submittedAt` (Timestamp)

**Sub-collection: applications/{id}/interviews**
- `interviewId` (string)
- `applicationId` (string)
- `type` (string)
- `status` (string)
- `assignedInterviewers` (array of userIds)
- `scheduledAt` (Timestamp)
- `completedAt` (Timestamp, optional)
- `meetingLink` (string, optional)
- `recordingUrl` (string, optional)
- `aiTranscript` (string, optional)
- `aiSummary` (string, optional)

**interviews** (root-level collection)
- Same fields as applications/{id}/interviews sub-collection
- Used for easier querying by candidateId and interviewer assignments

**templates**
- `id` (string)
- `companyId` (string)
- `name` (string)
- `type` (string: email, interview_questions, job_description)
- `category` (string, optional)
- `subject` (string, for email templates)
- `content` (string, HTML or markdown)
- `createdAt` (Timestamp)
- `createdBy` (string, userId)

**invites**
- `inviteId` (string)
- `email` (string)
- `displayName` (string)
- `role` (string)
- `companyId` (string)
- `invitedBy` (string, userId)
- `inviteToken` (string)
- `status` (string: pending, accepted, expired)
- `sentAt` (Timestamp)
- `expiresAt` (Timestamp)

---

## APPENDIX F: API ROUTES

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/interview/end` | POST | End AI interview session |
| `/api/gdpr/export-data` | POST | Export user data (GDPR) |
| `/api/gdpr/delete-account` | DELETE | Delete user account |

---

**END OF DOCUMENTATION**

Total Pages: ~50 (estimated)  
Total Words: ~15,000 (estimated)

This documentation covers the complete frontend architecture of Persona Recruit AI as of November 2025. Use this as a reference for recreating the UI in a new codebase while maintaining feature parity and user experience consistency.
