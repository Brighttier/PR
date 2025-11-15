# Persona Recruit AI Services

Google Gemini-powered AI services for recruitment automation and candidate analysis.

## Overview

This module contains all AI-powered services for Persona Recruit, including:

- **Resume Parsing**: Extract structured data from resumes
- **Job Matching**: Calculate match scores between candidates and jobs
- **Candidate Summarization**: Generate compelling candidate summaries
- **Job Description Generation**: Create professional job postings
- **Email Generation**: Generate personalized candidate communications

## Technology Stack

- **Google Gemini 2.0 Flash**: Fast resume parsing, job matching, email generation
- **Google Gemini 1.5 Pro**: Complex analysis, job description generation
- **Google Gemini Live API**: Real-time AI interviews (planned)
- **Vertex AI**: Vector embeddings and semantic search (planned)

## Installation

```bash
cd backend/ai
npm install
```

## Environment Variables

Create a `.env` file in the `backend/ai` directory:

```env
# Gemini API Key (required)
GEMINI_API_KEY=your_gemini_api_key_here

# OR use Vertex AI (alternative)
GOOGLE_CLOUD_PROJECT=your_project_id
GOOGLE_CLOUD_LOCATION=us-central1
VERTEX_AI_ENDPOINT=us-central1-aiplatform.googleapis.com

# Environment
NODE_ENV=development
```

## Quick Start

```typescript
import {
  parseResume,
  calculateMatchScore,
  generateCandidateSummary,
  generateJobDescription,
  generateEmail,
} from "@persona-recruit/ai-services";

// Parse a resume
const resumeText = "John Doe\nSoftware Engineer...";
const parsedResume = await parseResume(resumeText);

// Calculate job match
const jobRequirements = {
  title: "Senior Frontend Developer",
  requiredSkills: ["React", "TypeScript", "Node.js"],
  experienceLevel: "Senior",
  // ... other requirements
};

const matchResult = await calculateMatchScore(parsedResume, jobRequirements);
console.log(`Match score: ${matchResult.overallScore}%`);

// Generate candidate summary
const summary = await generateCandidateSummary(parsedResume);
console.log(summary.oneLiner);

// Generate job description
const jobInput = {
  title: "Senior Frontend Developer",
  department: "Engineering",
  type: "Full-time",
  experienceLevel: "Senior",
  companyName: "Acme Inc",
};

const jobDescription = await generateJobDescription(jobInput);

// Generate email
const email = await generateEmail({
  type: "interview_invitation",
  candidateName: "John Doe",
  jobTitle: "Senior Frontend Developer",
  companyName: "Acme Inc",
  interviewDate: "2025-12-01",
  interviewTime: "10:00 AM",
  meetingLink: "https://meet.google.com/abc-defg-hij",
});

console.log(email.subject);
console.log(email.body);
```

## Core Services

### 1. Resume Parser

Extract structured data from resume text.

```typescript
import { parseResume, extractSkills, extractExperience } from "./gemini/resume-parser";

// Full resume parsing
const parsed = await parseResume(resumeText);
// Returns: ParsedResume with personalInfo, experience, education, skills, etc.

// Extract skills only (faster)
const skills = await extractSkills(resumeText);
// Returns: string[]

// Extract experience only
const experience = await extractExperience(resumeText);
// Returns: Array<WorkExperience>
```

**Output Structure:**
```typescript
interface ParsedResume {
  personalInfo: {
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    linkedIn?: string;
    github?: string;
  };
  experience: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    responsibilities: string[];
  }>;
  education: Array<{...}>;
  skills: {
    technical: string[];
    soft: string[];
    tools?: string[];
    frameworks?: string[];
  };
  totalExperienceYears: number;
  careerLevel: "entry" | "mid" | "senior" | "lead" | "executive";
}
```

### 2. Job Matcher

Calculate match scores and analyze candidate-job fit.

```typescript
import { calculateMatchScore, analyzeSkillsGap } from "./gemini/job-matcher";

const matchResult = await calculateMatchScore(candidateResume, jobRequirements);

console.log(matchResult.overallScore); // 0-100
console.log(matchResult.recommendation); // "Fast Track", "Strong Candidate", etc.
console.log(matchResult.skillsAnalysis.matchedSkills);
console.log(matchResult.skillsAnalysis.missingRequiredSkills);
console.log(matchResult.strengths);
console.log(matchResult.concerns);
```

**Scoring Breakdown:**
- Skills Match: 40% weight
- Experience Match: 30% weight
- Education Match: 15% weight
- Career Level Match: 10% weight
- Industry Match: 5% weight

**Recommendations:**
- **Fast Track (90-100)**: Exceptional match, hire immediately
- **Strong Candidate (70-89)**: Very good match, priority interview
- **Worth Reviewing (50-69)**: Decent match, consider for interview
- **Marginal Fit (30-49)**: Weak match, low priority
- **Not Recommended (0-29)**: Poor match, likely reject

### 3. Candidate Summarizer

Generate compelling summaries and insights.

```typescript
import {
  generateCandidateSummary,
  generateOneLiner,
  identifyStrengths,
  detectRedFlags,
} from "./gemini/candidate-summarizer";

// Full summary
const summary = await generateCandidateSummary(parsedResume, jobContext);

console.log(summary.oneLiner); // "8yr React dev, built 3 prod apps, team lead"
console.log(summary.executiveSummary); // 2-3 sentences
console.log(summary.detailedSummary); // 2-3 paragraphs
console.log(summary.strengths); // Array of 3-5 strengths
console.log(summary.redFlags); // Array of concerns (if any)
console.log(summary.fitAssessment); // Ideal roles, growth potential

// Quick one-liner only
const oneLiner = await generateOneLiner(parsedResume);
```

### 4. Job Description Generator

Create professional, inclusive job postings.

```typescript
import {
  generateJobDescription,
  generateDescriptionOnly,
  suggestRequirements,
  generateBenefits,
} from "./gemini/job-generator";

const jobDescription = await generateJobDescription({
  title: "Senior Frontend Developer",
  department: "Engineering",
  type: "Full-time",
  experienceLevel: "Senior",
  companyName: "Acme Inc",
  companyIndustry: "Technology",
  requiredSkills: ["React", "TypeScript"],
  tone: "friendly",
});

console.log(jobDescription.description); // 2-3 paragraphs
console.log(jobDescription.responsibilities); // 5-8 bullet points
console.log(jobDescription.requiredQualifications);
console.log(jobDescription.benefits);
console.log(jobDescription.whyJoinUs);
```

### 5. Email Generator

Generate personalized candidate communications.

```typescript
import {
  generateEmail,
  generateRejectionEmail,
  generateInterviewInvite,
  personalizeTemplate,
} from "./gemini/email-generator";

// Interview invitation
const inviteEmail = await generateInterviewInvite(
  "John Doe",
  "Senior Frontend Developer",
  "Acme Inc",
  {
    date: "2025-12-01",
    time: "10:00 AM",
    duration: 60,
    type: "Face-to-Face",
    meetingLink: "https://meet.google.com/abc",
    interviewerName: "Jane Smith",
  }
);

// Rejection email
const rejectionEmail = await generateRejectionEmail(
  "John Doe",
  "Senior Frontend Developer",
  "Acme Inc"
);

// Personalize template
const personalized = await personalizeTemplate(
  emailTemplate,
  {
    candidateName: "John Doe",
    jobTitle: "Senior Frontend Developer",
    companyName: "Acme Inc",
    customMessage: "We were particularly impressed by your React portfolio.",
  }
);
```

**Email Types:**
- `application_received`: Confirmation email
- `rejection`: Rejection with empathy
- `interview_invitation`: Interview invitation with details
- `interview_reminder`: Reminder before interview
- `offer`: Job offer notification
- `application_update`: Status update
- `follow_up`: General follow-up

## Configuration

Customize AI behavior by editing `gemini/config.ts`:

```typescript
// Model selection
export const MODEL_USAGE = {
  resumeParsing: GEMINI_MODELS.FLASH_2_0,
  jobMatching: GEMINI_MODELS.FLASH_2_0,
  candidateSummarization: GEMINI_MODELS.FLASH_2_0,
  jobGeneration: GEMINI_MODELS.PRO_1_5, // Pro for better quality
  emailGeneration: GEMINI_MODELS.FLASH_2_0,
};

// Generation parameters
export const GENERATION_CONFIG = {
  resumeParsing: {
    temperature: 0.1, // Deterministic for parsing
    topK: 1,
    maxOutputTokens: 2048,
    responseMimeType: "application/json",
  },
  // ... other configurations
};
```

## Error Handling

All services use automatic retry with exponential backoff:

```typescript
try {
  const result = await parseResume(resumeText);
} catch (error) {
  // Handles:
  // - Network errors (ECONNRESET, ETIMEDOUT)
  // - Rate limiting (429, 503)
  // - Server errors (500-599)
  // - Invalid JSON responses
  console.error("Resume parsing failed:", error);
}
```

## Usage Tracking

Track API usage and costs:

```typescript
import { getUsageStats, resetUsageStats } from "./gemini/client";

const stats = getUsageStats();
console.log(`Total requests: ${stats.totalRequests}`);
console.log(`Total tokens: ${stats.totalTokens}`);
console.log(`Errors: ${stats.errors}`);

// Reset stats
resetUsageStats();
```

## Performance Tips

1. **Use specific functions**: Use `extractSkills()` instead of full `parseResume()` when you only need skills
2. **Batch operations**: Use `batchParseResumes()` or `batchCalculateMatches()` for multiple items
3. **Cache results**: Store AI-generated content to avoid re-generating
4. **Choose appropriate models**: Use Flash 2.0 for speed, Pro 1.5 for quality

## Testing

```bash
# Run health check
npm run test:health

# Test individual services
npm run test:parse-resume
npm run test:match-job
npm run test:generate-email
```

## Integration with Firebase Functions

Example Cloud Function using AI services:

```typescript
import * as functions from "firebase-functions";
import { parseResume, calculateMatchScore } from "@persona-recruit/ai-services";

export const onResumeUpload = functions.storage
  .object()
  .onFinalize(async (object) => {
    // Download resume file
    const resumeText = await extractTextFromFile(object);

    // Parse resume
    const parsedResume = await parseResume(resumeText);

    // Get active jobs
    const jobs = await getActiveJobs();

    // Calculate matches
    for (const job of jobs) {
      const match = await calculateMatchScore(parsedResume, job);

      // Save match result
      await saveMatchResult(match);
    }
  });
```

## Roadmap

- [ ] Vertex AI Vector Search integration
- [ ] Gemini Live API for real-time interviews
- [ ] Transcript analysis and sentiment detection
- [ ] Interview scoring and feedback generation
- [ ] Multi-language support
- [ ] Custom model fine-tuning

## License

UNLICENSED - Proprietary software for Persona Recruit

## Support

For questions or issues, contact the development team.
