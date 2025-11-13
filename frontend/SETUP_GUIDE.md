# PERSONA RECRUIT AI - Setup Guide

A comprehensive AI-powered Applicant Tracking System built with Next.js, Firebase, Google Gemini, and Coss UI.

## What's Been Built

### ✅ Core Infrastructure
- **Next.js 16** with TypeScript and App Router
- **Coss UI** - Premium UI component library (48 components)
- **Firebase SDK** - Authentication, Firestore, Storage
- **Google Gemini AI** - Resume parsing, job matching, AI interviews
- **Tailwind CSS v4** - Modern styling
- **Authentication System** - Multi-role support with protected routes

### ✅ AI Features Integrated
- **Resume Parser** - Extract structured data from resumes
- **Job Matching Engine** - Calculate 0-100% match scores
- **Candidate Summarization** - AI-generated insights and recommendations
- **AI Interview System** - Ready for Gemini Live API integration

### ✅ Project Structure
```
frontend/
├── app/
│   ├── dashboard/          # Recruiter dashboard (YOUR EXISTING PREMIUM UI - UNCHANGED)
│   ├── layout.tsx          # Root layout with AuthProvider
│   └── page.tsx            # Home page
├── components/
│   ├── auth/               # Authentication components
│   │   └── ProtectedRoute.tsx
│   └── ui/                 # 48 Coss UI components
├── contexts/
│   └── AuthContext.tsx     # Firebase auth context
├── lib/
│   ├── firebase.ts         # Firebase configuration
│   ├── gemini.ts           # Google Gemini AI functions
│   └── types.ts            # TypeScript definitions
└── .env.local.example      # Environment variables template
```

---

## Setup Instructions

### Step 1: Firebase Setup

1. **Create a Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add Project"
   - Enter project name: "persona-recruit-ai"
   - Disable Google Analytics (optional)
   - Click "Create Project"

2. **Enable Authentication:**
   - In Firebase Console → Authentication → Get Started
   - Enable "Email/Password" sign-in method

3. **Create Firestore Database:**
   - In Firebase Console → Firestore Database → Create Database
   - Start in **production mode**
   - Choose a location (e.g., us-central1)

4. **Set up Firestore Security Rules:**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users collection
       match /users/{userId} {
         allow read: if request.auth != null;
         allow create: if request.auth != null;
         allow update: if request.auth.uid == userId;
       }

       // Jobs collection
       match /jobs/{jobId} {
         allow read: if true; // Public read for job board
         allow create, update, delete: if request.auth != null &&
           (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['recruiter', 'hr_admin']);
       }

       // Applications collection
       match /applications/{applicationId} {
         allow read: if request.auth != null;
         allow create: if request.auth != null;
         allow update: if request.auth != null &&
           (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['recruiter', 'hr_admin', 'interviewer'] ||
            resource.data.candidateId == request.auth.uid);
       }

       // Interviews collection
       match /interviews/{interviewId} {
         allow read: if request.auth != null;
         allow create, update: if request.auth != null &&
           (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['recruiter', 'hr_admin']);
       }

       // Companies collection
       match /companies/{companyId} {
         allow read: if request.auth != null;
         allow create, update: if request.auth != null &&
           (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['hr_admin']);
       }
     }
   }
   ```

5. **Enable Firebase Storage:**
   - In Firebase Console → Storage → Get Started
   - Start in production mode
   - Set up Storage rules:
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /resumes/{userId}/{fileName} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && request.auth.uid == userId;
       }
       match /company-logos/{companyId}/{fileName} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

6. **Get Firebase Config:**
   - In Firebase Console → Project Settings → General
   - Scroll to "Your apps" → Web app
   - Click "Add app" if you haven't already
   - Copy the firebaseConfig object

### Step 2: Google Gemini API Setup

1. **Get Gemini API Key:**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Click "Get API Key"
   - Create a new API key or use existing one
   - Copy the API key

2. **Enable Required APIs:**
   - The Gemini API should be automatically enabled
   - Verify at [Google Cloud Console](https://console.cloud.google.com/)

### Step 3: Environment Variables

1. **Create `.env.local` file** in the `frontend/` directory:

```bash
cd /Users/khare/Documents/GitHub/PR/frontend
cp .env.local.example .env.local
```

2. **Edit `.env.local`** with your credentials:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Gemini API
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

### Step 4: Run the Application

```bash
cd /Users/khare/Documents/GitHub/PR/frontend
export PATH="$HOME/.nvm/versions/node/v20.19.5/bin:$PATH"
PORT=3002 npm run dev
```

Open [http://localhost:3002](http://localhost:3002)

---

## Application Features

### 🎯 User Roles

1. **Candidate** (`role: 'candidate'`)
   - Apply to jobs
   - Track applications
   - Take AI interviews
   - View match scores

2. **Recruiter** (`role: 'recruiter'`)
   - Post and manage jobs
   - Review applications with AI insights
   - Schedule interviews
   - Access your PREMIUM DASHBOARD at `/dashboard`

3. **Interviewer** (`role: 'interviewer'`)
   - View assigned interviews
   - Submit feedback
   - Access candidate profiles (read-only)

4. **HR Admin** (`role: 'hr_admin'`)
   - All recruiter features
   - Manage team members
   - Configure AI settings
   - Manage billing

5. **Platform Admin** (`role: 'platform_admin'`)
   - System-wide monitoring
   - Company management
   - Platform analytics

### 🤖 AI Features Powered by Google Gemini

#### 1. Resume Parsing
- **Function:** `parseResume(resumeText)`
- **Location:** `lib/gemini.ts`
- **Features:**
  - Extracts name, email, phone, location
  - Identifies skills and technologies
  - Parses work experience with achievements
  - Captures education and certifications
  - Returns structured JSON

#### 2. Job Matching & Scoring
- **Function:** `calculateMatchScore(candidateData, jobRequirements)`
- **Location:** `lib/gemini.ts`
- **Features:**
  - 0-100% match score
  - Skills match analysis (matched vs. missing)
  - Experience alignment scoring
  - Education requirements check
  - AI recommendation (Fast Track, Strong Candidate, etc.)

#### 3. Candidate Summarization
- **Function:** `summarizeCandidate(candidateData, jobContext)`
- **Location:** `lib/gemini.ts`
- **Features:**
  - One-liner summary
  - Executive summary (2-3 sentences)
  - AI recommendation
  - Key strengths identification
  - Red flags detection

#### 4. AI Live Interviews (Coming Soon)
- **Function:** `initializeGeminiLive()`
- **Location:** `lib/gemini.ts`
- **Features:**
  - Real-time voice/text conversation
  - AI screening questions
  - Technical assessment
  - Automatic transcript generation
  - Performance evaluation

### 📊 Your Premium Dashboard

**Location:** [/dashboard](http://localhost:3002/dashboard)

**Features:**
- ✅ Professional sidebar navigation
- ✅ Real-time statistics (candidates, jobs, interviews, hires)
- ✅ Recent candidates table with AI insights
- ✅ Activity feed
- ✅ Quick action cards
- ✅ Fully responsive design
- ✅ **UNCHANGED - Your existing premium UI**

---

## Next Steps for Full Application

### Phase 1: Authentication Pages (Recommended Next)
- [ ] Login page (`/auth/login`)
- [ ] Signup pages with role selection
- [ ] Password reset flow
- [ ] Email verification

### Phase 2: Public Job Board
- [ ] `/careers` - Public job listings
- [ ] `/careers/[id]` - Job details page
- [ ] `/careers/[id]/apply` - Application form with resume upload

### Phase 3: Enhanced Dashboard Pages
- [ ] `/dashboard/jobs` - Job management with create/edit
- [ ] `/dashboard/applications` - Applications with AI insights
- [ ] `/dashboard/applications/[id]` - Detailed application view
- [ ] `/dashboard/candidates/[id]` - Candidate profile with AI summary

### Phase 4: AI Interview System
- [ ] `/candidate/interview/[id]` - AI interview interface
- [ ] Gemini Live API integration
- [ ] Voice recording and transcription
- [ ] Real-time AI responses

### Phase 5: Advanced Features
- [ ] Email templates system
- [ ] Meeting notes with AI summaries
- [ ] Talent pool management
- [ ] Team management
- [ ] Analytics and reporting

---

## Testing the AI Features

### Test Resume Parsing

```typescript
import { parseResume } from '@/lib/gemini';

const resumeText = `
John Doe
john@example.com | (555) 123-4567
San Francisco, CA

EXPERIENCE
Senior Software Engineer at TechCorp (2020-Present)
- Led development of React applications
- Managed team of 5 engineers

SKILLS
JavaScript, TypeScript, React, Node.js, Python

EDUCATION
BS Computer Science, MIT (2018)
`;

const parsed = await parseResume(resumeText);
console.log(parsed);
```

### Test Job Matching

```typescript
import { calculateMatchScore } from '@/lib/gemini';

const candidateData = {
  name: "John Doe",
  skills: ["JavaScript", "React", "Node.js"],
  experience: [{ years: 5, title: "Senior Engineer" }]
};

const jobRequirements = {
  title: "Senior Frontend Developer",
  requiredSkills: ["JavaScript", "React", "TypeScript"],
  experienceLevel: "5+ years"
};

const matchScore = await calculateMatchScore(candidateData, jobRequirements);
console.log(matchScore);
// Output: { matchScore: 85, skillsMatch: {...}, recommendation: "Strong Candidate" }
```

---

## Firestore Data Structure

### Collections to Create

1. **users** - User profiles
2. **companies** - Company information
3. **jobs** - Job postings
4. **applications** - Candidate applications
5. **interviews** - Interview schedules
6. **templates** - Email/interview templates

All TypeScript interfaces are defined in `lib/types.ts`.

---

## Support & Resources

- **Firebase Docs:** https://firebase.google.com/docs
- **Google Gemini API:** https://ai.google.dev/docs
- **Coss UI Docs:** https://coss.com/ui/docs
- **Next.js Docs:** https://nextjs.org/docs

---

## Current Status

✅ **Completed:**
- Core infrastructure setup
- Firebase & Gemini integration
- Authentication system
- AI parsing, matching, and summarization
- Premium dashboard UI (unchanged)
- TypeScript types and interfaces

🚧 **In Progress:**
- You can now add authentication pages
- Then build public job board
- Then add AI interview interface

📝 **Notes:**
- Your existing `/dashboard` page is untouched and fully functional
- All new features will integrate seamlessly with your premium UI
- The AI features are ready to use once you connect Firebase and Gemini

---

## Quick Start Checklist

- [ ] Create Firebase project
- [ ] Enable Authentication (Email/Password)
- [ ] Create Firestore database
- [ ] Set Firestore security rules
- [ ] Enable Storage
- [ ] Get Gemini API key
- [ ] Create `.env.local` with credentials
- [ ] Start development server
- [ ] Test your existing dashboard at `/dashboard`
- [ ] Begin building authentication pages

---

**Ready to build?** Start with authentication pages next, then move to the public job board!
