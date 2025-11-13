# ATS Recruiter Dashboard

A professional Applicant Tracking System (ATS) dashboard built with Next.js, Coss UI, and Tailwind CSS v4.

## Features

### Dashboard Overview
- **Statistics Cards**: Real-time metrics for total candidates, active jobs, interviews, and hires
- **Trend Indicators**: Visual feedback on performance changes
- **Professional Sidebar Navigation**: Easy access to all major sections

### Key Components

#### Sidebar Navigation
- **Brand Section**: Company logo and name
- **Navigation Menu**:
  - Dashboard (Home)
  - Candidates
  - Jobs
  - Calendar
  - Reports
- **Quick Actions**: Add Candidate button
- **User Profile**: Shows current user with settings and logout options

#### Main Dashboard Content

**Statistics Overview**
- Total Candidates: 1,284 (+12%)
- Active Jobs: 43 (+3)
- Interviews Today: 18 (6 pending)
- Hired This Month: 24 (+8%)

**Recent Candidates Table**
- Displays latest 5 candidate applications
- Shows candidate name, avatar, position applied for
- Status badges (Interview Scheduled, Under Review, Offer Sent, etc.)
- Current stage in recruitment pipeline
- Application date
- Quick actions menu

**Recent Activity Feed**
- Live updates of recruitment activities
- Interview schedules
- New applications
- Offer acceptances
- Interview completions
- Timestamps for each activity

**Quick Action Cards**
- Add New Candidate
- Post New Job
- Schedule Interview

### Design Features

**Color-Coded Status System**
- Info (Blue): Interview Scheduled
- Warning (Orange): Under Review
- Success (Green): Offer Sent
- Secondary (Gray): New Application
- Destructive (Red): Rejected

**Responsive Design**
- Mobile-first approach
- Adapts to tablet and desktop screens
- Collapsible navigation for smaller screens

**Professional Aesthetics**
- Clean, modern interface
- Consistent spacing and typography
- Intuitive information hierarchy
- Accessible color contrasts

## File Structure

```
frontend/
├── app/
│   ├── dashboard/
│   │   └── page.tsx          # Main dashboard page
│   └── page.tsx               # Home page with link to dashboard
├── components/
│   └── ui/                    # All Coss UI components
└── DASHBOARD_README.md        # This file
```

## Component Usage

The dashboard uses the following Coss UI components:

- **Button**: Primary actions and navigation
- **Card**: Content containers for stats and sections
- **Badge**: Status indicators with semantic colors
- **Avatar**: User profile pictures with initials
- **Input**: Search functionality
- **Table**: Candidate list display
- **Icons**: Lucide React icons for visual elements

## Running the Dashboard

1. Start the development server:
```bash
cd frontend
npm run dev
```

2. Navigate to the dashboard:
```
http://localhost:3000/dashboard
```

Or click "View ATS Dashboard Demo" from the home page.

## Customization

### Changing Colors
Edit [app/globals.css](app/globals.css) to customize the color scheme:
- `--primary`: Main brand color
- `--secondary`: Secondary actions
- `--success`, `--warning`, `--info`, `--destructive`: Status colors

### Adding Navigation Items
Edit the `navigationItems` array in [app/dashboard/page.tsx](app/dashboard/page.tsx):

```tsx
const navigationItems = [
  { name: "Dashboard", icon: Home, active: true },
  { name: "Your New Section", icon: YourIcon, active: false },
  // ... more items
];
```

### Modifying Statistics
Update the `stats` array with your actual data source:

```tsx
const stats = [
  {
    title: "Your Metric",
    value: "123",
    change: "+10%",
    trend: "up",
    icon: YourIcon,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
];
```

### Connecting to Backend
Replace mock data with API calls:

```tsx
// Example
const [candidates, setCandidates] = useState([]);

useEffect(() => {
  fetch('/api/candidates')
    .then(res => res.json())
    .then(data => setCandidates(data));
}, []);
```

## Features to Implement

**Current State**: Static demo with mock data

**Next Steps**:
1. Connect to real backend API
2. Add authentication and authorization
3. Implement filtering and sorting for candidates table
4. Add pagination for large datasets
5. Create detail views for candidates
6. Build interview scheduling functionality
7. Add real-time notifications
8. Implement search functionality
9. Create candidate profile pages
10. Add email integration
11. Build reporting and analytics
12. Export data to CSV/PDF

## Tech Stack

- **Framework**: Next.js 16.0.1
- **UI Library**: Coss UI (48 components)
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Language**: TypeScript
- **React**: 19.2.0

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

The dashboard is optimized for:
- Fast initial page load
- Smooth animations and transitions
- Responsive interactions
- Efficient rendering with React 19

## Accessibility

- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation support
- Screen reader friendly
- High contrast color ratios
