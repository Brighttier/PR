Complete Frontend + Backend Implementation Plan
Project Structure Organization
/Users/wolf/AI Projects 2025/PR/PR/
├── frontend/                    # Next.js 16 application (existing)
│   ├── app/                    # App Router pages
│   ├── components/             # React components
│   ├── lib/                    # Utilities, types, helpers
│   └── contexts/               # React contexts
│
├── backend/                     # NEW - Backend services
│   ├── functions/              # Cloud Functions (Firebase)
│   │   ├── src/
│   │   │   ├── auth/          # Authentication triggers
│   │   │   ├── applications/  # Application processing
│   │   │   ├── interviews/    # Interview management
│   │   │   ├── notifications/ # Email/notifications
│   │   │   └── analytics/     # Analytics processing
│   │   └── package.json
│   │
│   ├── ai/                     # NEW - AI Services
│   │   ├── gemini/            # Google Gemini integrations
│   │   │   ├── resume-parser.ts
│   │   │   ├── job-matcher.ts
│   │   │   ├── interview-bot.ts
│   │   │   ├── live-interview.ts
│   │   │   └── transcript-analyzer.ts
│   │   ├── vector/            # Vector search (Vertex AI)
│   │   └── utils/             # AI utilities
│   │
│   └── services/               # NEW - Backend services
│       ├── storage/           # Firebase Storage operations
│       ├── firestore/         # Firestore helpers
│       ├── email/             # Email service (SendGrid/Resend)
│       └── webhooks/          # External webhooks
│
└── shared/                     # NEW - Shared types/utils
    ├── types/                 # TypeScript types
    └── constants/             # Shared constants
PHASE 1: Authentication & Public Routes (Week 1-2)
Frontend Pages to Create
Authentication:
/frontend/app/auth/login/page.tsx - Login with Firebase Auth
/frontend/app/auth/signup/candidate/page.tsx - Candidate signup entry
/frontend/app/auth/signup/candidate/wizard/page.tsx - 4-step wizard
/frontend/app/auth/signup/company/page.tsx - Company signup entry
/frontend/app/auth/signup/company/wizard/page.tsx - 4-step wizard
/frontend/app/auth/reset-password/page.tsx - Password reset
/frontend/app/auth/accept-invite/page.tsx - Team invite acceptance
Public Career Pages:
/frontend/app/careers/page.tsx - Public job board
/frontend/app/careers/[id]/page.tsx - Job details
/frontend/app/careers/[id]/apply/page.tsx - Application form
/frontend/app/careers/company/[slug]/page.tsx - Company career page
/frontend/app/page.tsx - Marketing landing page (update existing)
Backend Services to Create
Cloud Functions:
/backend/functions/src/auth/onUserCreate.ts - Create user profile on signup
/backend/functions/src/auth/onInviteAccept.ts - Handle team invite acceptance
/backend/functions/src/applications/onApplicationCreate.ts - Trigger AI pipeline
AI Services:
/backend/ai/gemini/resume-parser.ts - Parse resume with Gemini
/backend/ai/gemini/job-matcher.ts - Calculate match scores
/backend/ai/vector/embeddings.ts - Generate vector embeddings (Vertex AI)
PHASE 2: Interview System with Comprehensive Feedback (Week 3-5)
🎯 Interview Feedback Pages (NEW DETAILED SPEC)
1. Candidate Interview Session /frontend/app/candidate/interview/[id]/page.tsx Features:
Real-time video recording (MediaRecorder API)
Google Gemini Live integration for AI questions
Audio stream capture
Real-time transcription
Progress indicator (questions answered)
Timer display
"End Interview" button
Layout:
- Top: Progress bar + Timer
- Center: Video preview (candidate's camera)
- Bottom: Current question display
- Right sidebar: 
  - Transcription (live)
  - Questions list
2. Interview Feedback Dashboard (NEW - CRITICAL) /frontend/app/interviewer/feedback/[interviewId]/page.tsx Main Sections: A. Video Playback Panel
Full video player with controls
Timestamp markers for key moments
Jump to question functionality
Playback speed control (0.5x, 1x, 1.5x, 2x)
Picture-in-picture mode
B. Transcript Panel
Full interview transcript with timestamps
Speaker identification (AI vs Candidate)
Searchable/filterable
Click timestamp to jump in video
Export transcript option
Highlight key phrases
C. Audio Analysis Panel
Waveform visualization
Volume levels over time
Speaking pace analysis
Pause/hesitation markers
Confidence indicators
D. Feedback Form
Overall Rating (5-star with half-stars)
Recommendation (Strong Hire, Hire, Consider, Do Not Hire)
Technical Skills Ratings (per skill, 5-star)
Dynamically generated based on job requirements
With evidence links to transcript moments
Soft Skills Ratings:
Communication (5-star)
Problem Solving (5-star)
Culture Fit (5-star)
Confidence (5-star)
Strengths (rich text editor with AI suggestions)
Concerns/Areas for Improvement (rich text editor)
Key Moments (timestamp + note)
Overall Notes (rich text)
E. AI Insights Panel (RIGHT SIDEBAR)
AI-generated summary
Sentiment analysis graph over time
Key topics discussed (word cloud)
Speaking time ratio (AI vs Candidate pie chart)
Confidence score over time (line graph)
Red flags detected
Strengths identified
Comparison to other candidates (percentile)
F. Question-by-Question Breakdown
Each question as expandable section:
Question text
Time asked
Candidate's response (transcript)
Response duration
AI evaluation score
Video timestamp link
Add notes specific to this question
3. Interview Feedback Review (NEW) /frontend/app/recruiter/interviews/[id]/feedback/page.tsx Features:
View all interviewer feedback side-by-side
Aggregate ratings visualization (radar chart)
Common themes across feedback
Disagreements highlighted
Decision recommendation based on all feedback
Timeline of interview process
Frontend Components to Create
Video Components:
/frontend/components/interview/video-player.tsx - Custom video player with timestamps
/frontend/components/interview/video-timeline.tsx - Visual timeline with markers
/frontend/components/interview/waveform-visualizer.tsx - Audio waveform
Transcript Components:
/frontend/components/interview/transcript-viewer.tsx - Transcript with highlighting
/frontend/components/interview/transcript-search.tsx - Search within transcript
/frontend/components/interview/speaker-label.tsx - Speaker identification badges
Feedback Components:
/frontend/components/interview/rating-input.tsx - Custom rating component
/frontend/components/interview/skills-matrix.tsx - Skills rating grid
/frontend/components/interview/key-moment-marker.tsx - Add timestamp markers
/frontend/components/interview/rich-text-editor.tsx - Rich text for notes
Analytics Components:
/frontend/components/interview/sentiment-graph.tsx - Line chart for sentiment
/frontend/components/interview/speaking-time-chart.tsx - Pie chart
/frontend/components/interview/confidence-graph.tsx - Line chart over time
/frontend/components/interview/skills-radar.tsx - Radar chart for skills
/frontend/components/interview/word-cloud.tsx - Topics discussed
Backend Services for Interview System
Cloud Functions:
/backend/functions/src/interviews/
├── onInterviewCreate.ts          # Schedule interview
├── onInterviewStart.ts            # Initialize Gemini Live session
├── onInterviewEnd.ts              # Process recording, generate transcript
├── processInterviewVideo.ts       # Extract frames, analyze
├── generateTranscript.ts          # Gemini transcription
├── analyzeInterview.ts            # AI analysis of performance
└── notifyFeedbackRequired.ts     # Notify interviewers
AI Services:
/backend/ai/gemini/
├── live-interview.ts              # Gemini Live API integration
│   - initializeLiveSession()
│   - generateQuestion()
│   - processResponse()
│   - endSession()
│
├── transcript-analyzer.ts         # Analyze transcript
│   - extractKeyMoments()
│   - sentimentAnalysis()
│   - detectRedFlags()
│   - identifyStrengths()
│
├── interview-scorer.ts            # Score interview
│   - calculateTechnicalScore()
│   - calculateSoftSkillsScore()
│   - generateRecommendation()
│
└── video-analyzer.ts              # Analyze video (optional)
    - detectEmotions()
    - analyzeSpeakingPace()
    - detectHesitations()
Storage Structure:
Firebase Storage:
/interviews/
├── {interviewId}/
│   ├── video.webm              # Full interview video
│   ├── audio.webm              # Audio stream
│   ├── transcript.json         # Timestamped transcript
│   ├── analysis.json           # AI analysis results
│   └── thumbnails/             # Video thumbnails
│       ├── 00-00-00.jpg
│       ├── 00-01-00.jpg
│       └── ...
Firestore Structure:
// interviews/{interviewId}
{
  id: "INT-2025-0001",
  applicationId: "APP-2025-0001",
  candidateId: "user123",
  jobId: "job456",
  type: "ai_interview",
  status: "completed",
  
  scheduledAt: Timestamp,
  startedAt: Timestamp,
  completedAt: Timestamp,
  duration: 3600, // seconds
  
  videoUrl: "gs://bucket/interviews/INT-2025-0001/video.webm",
  audioUrl: "gs://bucket/interviews/INT-2025-0001/audio.webm",
  transcriptUrl: "gs://bucket/interviews/INT-2025-0001/transcript.json",
  
  questionsAsked: [
    {
      question: "Tell me about your experience with React",
      timestamp: 120, // seconds from start
      response: "I have 3 years...",
      duration: 180,
      score: 8.5
    }
  ],
  
  aiAnalysis: {
    overallScore: 8.2,
    technicalScore: 8.5,
    softSkillsScore: 7.8,
    confidenceLevel: 0.82,
    sentimentTimeline: [{time: 0, sentiment: 0.7}, ...],
    keyTopics: ["React", "TypeScript", "Testing"],
    redFlags: ["Limited testing experience"],
    strengths: ["Strong React knowledge", "Good communication"],
    recommendation: "Strong Candidate"
  },
  
  timestamps: [
    {time: 120, type: "question", label: "React question"},
    {time: 450, type: "highlight", label: "Great answer"},
    {time: 890, type: "concern", label: "Hesitation noted"}
  ]
}

// interviews/{interviewId}/feedback/{feedbackId}
{
  feedbackId: "FEEDBACK-2025-0001",
  interviewId: "INT-2025-0001",
  interviewerId: "interviewer123",
  submittedAt: Timestamp,
  
  overallRating: 4.5,
  recommendation: "Hire",
  
  technicalSkills: {
    "React": 5,
    "TypeScript": 4,
    "Testing": 3
  },
  
  softSkills: {
    communication: 5,
    problemSolving: 4,
    cultureFit: 4,
    confidence: 4
  },
  
  strengths: "Excellent React knowledge...",
  concerns: "Could improve testing practices...",
  
  keyMoments: [
    {timestamp: 450, note: "Excellent explanation of hooks"},
    {timestamp: 890, note: "Struggled with testing question"}
  ],
  
  notes: "Overall strong candidate..."
}
PHASE 3: Recruiter Core Workflows (Week 6-7)
Frontend Pages
Job Management:
/frontend/app/recruiter/jobs/new/page.tsx - Create job (copy from company-admin)
/frontend/app/recruiter/jobs/[id]/page.tsx - Job details
/frontend/app/recruiter/jobs/[id]/edit/page.tsx - Edit job
/frontend/app/recruiter/applications/[id]/page.tsx - Full application page
/frontend/app/recruiter/candidates/[id]/page.tsx - Candidate profile
Complete Placeholder Pages:
/frontend/app/recruiter/candidates/page.tsx - Candidates table
/frontend/app/recruiter/talent-pool/page.tsx - Saved candidates
/frontend/app/recruiter/calendar/page.tsx - Calendar view
/frontend/app/recruiter/settings/page.tsx - Settings
Frontend Dialogs
/frontend/components/dialogs/create-job-dialog.tsx
/frontend/components/dialogs/edit-job-dialog.tsx
/frontend/components/dialogs/schedule-interview-dialog.tsx
/frontend/components/dialogs/add-candidate-dialog.tsx
/frontend/components/dialogs/delete-confirmation-dialog.tsx
Backend Services
Cloud Functions:
/backend/functions/src/jobs/onJobCreate.ts - Vectorize job description
/backend/functions/src/jobs/onJobUpdate.ts - Update vector embeddings
/backend/functions/src/applications/onStatusChange.ts - Trigger notifications
PHASE 4: Company Admin Features (Week 8-9)
Frontend Settings Pages
/frontend/app/company-admin/settings/pipeline/page.tsx - Auto-reject threshold
/frontend/app/company-admin/settings/company-profile/page.tsx - Branding
/frontend/app/company-admin/settings/career-page/page.tsx - Career page customization
/frontend/app/company-admin/settings/ai-agents/page.tsx - AI configuration hub
/frontend/app/company-admin/settings/email/page.tsx - Email templates
/frontend/app/company-admin/settings/integrations/page.tsx - HRIS integrations
Frontend Complete Pages
/frontend/app/company-admin/dashboard/page.tsx - Analytics dashboard
/frontend/app/company-admin/jobs/page.tsx - Jobs management
/frontend/app/company-admin/applications/page.tsx - Applications review
/frontend/app/company-admin/templates/page.tsx - Templates list
/frontend/app/company-admin/templates/new/page.tsx - Template editor
Backend Services
Cloud Functions:
/backend/functions/src/settings/onPipelineUpdate.ts - Apply auto-reject rules
/backend/functions/src/email/sendFromTemplate.ts - Send templated emails
PHASE 5: AI Integration with Google Gemini Only (Week 10-11)
AI Services Structure
/backend/ai/gemini/
├── config.ts                      # Gemini API configuration
├── client.ts                      # Gemini client initialization
│
├── resume-parser.ts               # Resume parsing
│   - parseResume(resumeText)
│   - extractSkills()
│   - extractExperience()
│   - extractEducation()
│
├── job-matcher.ts                 # Job matching & scoring
│   - calculateMatchScore(candidate, job)
│   - generateRecommendation()
│   - analyzeSkillsGap()
│
├── candidate-summarizer.ts        # Candidate summaries
│   - generateOneLiner()
│   - generateExecutiveSummary()
│   - identifyStrengths()
│   - detectRedFlags()
│
├── job-generator.ts               # AI job descriptions
│   - generateJobDescription()
│   - suggestRequirements()
│   - generateBenefits()
│
├── live-interview.ts              # Gemini Live API
│   - initializeLiveSession()
│   - configureLiveSession(jobRequirements)
│   - streamAudioToGemini()
│   - receiveAudioFromGemini()
│   - handleTextResponse()
│   - endLiveSession()
│
├── transcript-generator.ts        # Generate transcripts
│   - transcribeAudio(audioUrl)
│   - addTimestamps()
│   - identifySpeakers()
│
├── transcript-analyzer.ts         # Analyze transcripts
│   - analyzeSentiment()
│   - extractKeyTopics()
│   - detectHesitations()
│   - calculateConfidenceScore()
│   - identifyRedFlags()
│   - generateInsights()
│
├── interview-scorer.ts            # Score interviews
│   - scoreTechnicalSkills()
│   - scoreSoftSkills()
│   - generateOverallScore()
│   - compareToOtherCandidates()
│
└── email-generator.ts             # Generate email content
    - generateRejectionEmail()
    - generateInterviewInvite()
    - personalizeTemplate()
Integration Points
Resume Upload Flow:
1. User uploads resume → Firebase Storage
2. Cloud Function triggered → onResumeUpload
3. Call /backend/ai/gemini/resume-parser.ts
4. Extract data → Store in Firestore
5. Call /backend/ai/gemini/job-matcher.ts
6. Calculate match scores for open jobs
7. Update application with scores
AI Interview Flow:
1. Candidate starts interview → Frontend
2. Initialize Gemini Live session → /backend/ai/gemini/live-interview.ts
3. Stream candidate audio → Gemini Live API
4. Receive AI questions (audio) → Stream to frontend
5. Candidate responds → Stream to Gemini
6. Gemini analyzes response → Generate next question
7. Repeat until interview complete
8. End session → Process recording
9. Generate transcript → /backend/ai/gemini/transcript-generator.ts
10. Analyze transcript → /backend/ai/gemini/transcript-analyzer.ts
11. Score interview → /backend/ai/gemini/interview-scorer.ts
12. Store results in Firestore
Vector Search Integration (Vertex AI)
/backend/ai/vector/
├── embeddings.ts                  # Generate embeddings
│   - generateJobEmbedding()
│   - generateCandidateEmbedding()
│
├── search.ts                      # Vector search
│   - findSimilarCandidates()
│   - findSimilarJobs()
│
└── index.ts                       # Index management
    - createIndex()
    - updateIndex()
    - deleteIndex()
PHASE 6: Platform Admin & Polish (Week 12)
Frontend Platform Admin Pages
/frontend/app/platform-admin/dashboard/page.tsx - System overview
/frontend/app/platform-admin/companies/page.tsx - Companies list
/frontend/app/platform-admin/companies/[id]/page.tsx - Company details
/frontend/app/platform-admin/users/page.tsx - User management
/frontend/app/platform-admin/system-health/page.tsx - Monitoring
Error Handling & Polish
/frontend/components/error-boundary.tsx - Global error boundary
/frontend/components/loading-states/ - Skeleton loaders for all pages
/frontend/components/empty-states/ - Empty state components
File Organization Summary
NEW DIRECTORIES TO CREATE:
backend/
├── functions/              # Cloud Functions (~25 functions)
│   ├── src/
│   │   ├── auth/          # 3 files
│   │   ├── applications/  # 5 files
│   │   ├── interviews/    # 7 files
│   │   ├── jobs/          # 3 files
│   │   ├── notifications/ # 4 files
│   │   └── settings/      # 3 files
│   ├── package.json
│   └── tsconfig.json
│
├── ai/                    # AI Services (~15 files)
│   ├── gemini/           # 12 files
│   └── vector/           # 3 files
│
└── services/             # Backend utilities (~10 files)
    ├── storage/          # 3 files
    ├── firestore/        # 3 files
    └── email/            # 4 files

shared/                   # Shared code (~5 files)
├── types/               # TypeScript interfaces
└── constants/           # Constants
TOTAL NEW FILES:
Frontend: ~60 files (pages, components, dialogs)
Backend Functions: ~25 files
AI Services: ~15 files
Backend Services: ~10 files
Shared: ~5 files
TOTAL: ~115 new files
Priority Focus: Interview Feedback System
Since you emphasized the interview feedback system, here's the immediate next steps:
Week 1-2: Interview Recording & Playback
Build candidate interview session with video recording
Integrate Gemini Live API for AI questions
Store video/audio in Firebase Storage
Generate transcripts using Gemini
Week 3: Feedback Dashboard
Build video player with timestamp markers
Build transcript viewer with search
Build audio waveform visualization
Build feedback form with ratings
Week 4: AI Analysis
Implement sentiment analysis
Build analytics graphs (confidence, speaking time, etc.)
Generate AI insights
Create comparison charts
Week 5: Polish & Integration
Add question-by-question breakdown
Implement key moment markers
Build aggregate feedback view for recruiters
Testing & bug fixes
Technology Stack Confirmation
Frontend:
Next.js 16 (App Router) ✅
React 19 ✅
TypeScript ✅
Tailwind CSS v4 ✅
Coss UI / Base UI ✅
Backend:
Firebase Functions (Node.js 20)
Firebase Firestore
Firebase Storage
Firebase Authentication
AI:
Google Gemini 2.0 Flash (resume parsing, job matching)
Google Gemini 1.5 Pro (complex analysis)
Google Gemini Live API (real-time interviews)
Vertex AI Vector Search (semantic search)
NO ElevenLabs ✅
Video/Audio:
MediaRecorder API (browser recording)
WebRTC (real-time communication)
FFmpeg (video processing in Cloud Functions)

🎯 Live Interview Session Implementation
1. Candidate Interview Session Page /frontend/app/candidate/interview/[id]/page.tsx Enhanced Features: A. Pre-Interview Screen:
Display interview details:
Company name and logo
Position title
Estimated duration (20-25 minutes, max 30)
Interview type (AI Screening)
System check:
Camera permission
Microphone permission
Internet connection speed test
Terms acceptance:
Recording consent
Privacy policy
"Start Interview" button
B. Interview Session Screen: Top Bar:
Company logo + name
Position title
Timer (countdown from 30:00)
Green: 0-20 min
Yellow: 20-25 min (with "⚠️ 10 minutes remaining" warning)
Red: 25-30 min (with "⚠️ 5 minutes remaining - Final questions" warning)
Progress indicator (questions answered / total)
Main Panel:
Video preview (candidate's camera)
Current question display
Question number (e.g., "Question 3 of 6")
Question text
Animated AI avatar (optional)
Recording indicator (red dot)
Connection status
Right Sidebar:
Live transcript
Questions timeline
Audio visualizer (candidate speaking)
Bottom Controls:
"End Interview" button (with confirmation)
Volume control
Mute toggle (candidate can mute if needed)
C. Automatic Time Management: At 20 minutes (First Warning): AI says: "We have about 10 minutes remaining. Let me ask you a couple more questions." At 25 minutes (Final Warning): AI says: "We're approaching our time limit. I have one final question for you." At 29:30 (30-second warning): AI says: "We're almost out of time. Let me wrap up..." At 30:00 (Hard Stop):
Interview automatically ends
AI plays time-expired closing message
Transition to completion screen
D. Interview Flow Stages:
enum InterviewStage {
  PRE_START = "pre_start",           // System check
  GREETING = "greeting",              // AI greeting with company name
  QUESTIONS = "questions",            // Main interview
  WARNING_20_MIN = "warning_20",      // 20-minute warning given
  WARNING_25_MIN = "warning_25",      // 25-minute warning given
  WRAPPING_UP = "wrapping_up",        // Final question
  SIGN_OFF = "sign_off",              // Thank you message
  COMPLETED = "completed"             // Interview ended
}
Backend AI Live Interview Service
File: /backend/ai/gemini/live-interview.ts
class LiveInterviewSession {
  private interviewId: string;
  private config: InterviewAgentConfig;
  private startTime: number;
  private currentStage: InterviewStage;
  private questionsAsked: number = 0;
  private geminiSession: any;
  
  async initialize(interviewId: string, jobId: string, companyId: string) {
    // Load company-specific config
    this.config = await this.loadConfig(companyId);
    
    // Initialize Gemini Live API session
    this.geminiSession = await initGeminiLive({
      model: this.config.geminiModel,
      systemPrompt: this.buildSystemPrompt(),
      audioConfig: {
        sampleRate: 24000,
        encoding: "LINEAR16"
      }
    });
    
    // Start timer
    this.startTime = Date.now();
    this.startTimeMonitoring();
    
    // Send greeting
    await this.sendGreeting();
  }
  
  private buildSystemPrompt(): string {
    return `You are a professional AI interviewer for ${this.config.greeting.companyName}.

CRITICAL RULES:
1. Maximum interview duration: ${this.config.maxDuration / 60} minutes (HARD LIMIT)
2. You will receive time updates from the system
3. When notified of time warnings, adjust your pacing
4. At 20 minutes, transition to wrap-up mode
5. At 25 minutes, ask your final question
6. At 30 minutes, the interview MUST end (system will force stop)

GREETING (Use exactly once at start):
${this.config.greeting.introduction.replace('{COMPANY_NAME}', this.config.greeting.companyName)}

INTERVIEW STRUCTURE:
- Ask ${this.config.numberOfQuestions} questions total
- Question types: ${this.config.questionTypes.join(', ')}
- Be conversational and professional
- Listen actively to responses
- Ask relevant follow-up questions if time permits

TIME MANAGEMENT RESPONSES:
- At 20 min mark, say: "We have about 10 minutes remaining. Let me ask you a couple more important questions."
- At 25 min mark, say: "We're approaching our time limit. I have one final question for you."
- At 29:30 mark, begin wrap-up immediately

SIGN-OFF (Use when interview complete):
${this.getSignOffMessage()}

TONE: ${this.config.greeting.tone}`;
  }
  
  private async sendGreeting() {
    this.currentStage = InterviewStage.GREETING;
    
    const greeting = this.config.greeting.introduction
      .replace('{COMPANY_NAME}', this.config.greeting.companyName);
    
    await this.geminiSession.sendText(greeting);
    
    // Log to Firestore
    await this.logInterviewEvent({
      stage: 'greeting',
      timestamp: Date.now() - this.startTime,
      content: greeting
    });
    
    this.currentStage = InterviewStage.QUESTIONS;
  }
  
  private startTimeMonitoring() {
    // Check time every 30 seconds
    this.timeMonitor = setInterval(() => {
      const elapsed = (Date.now() - this.startTime) / 1000;
      
      // First warning at 20 minutes
      if (elapsed >= this.config.warningThresholds.firstWarning && 
          this.currentStage === InterviewStage.QUESTIONS) {
        this.currentStage = InterviewStage.WARNING_20_MIN;
        this.sendTimeUpdate(elapsed, "20_minute_warning");
      }
      
      // Final warning at 25 minutes
      if (elapsed >= this.config.warningThresholds.finalWarning && 
          this.currentStage === InterviewStage.WARNING_20_MIN) {
        this.currentStage = InterviewStage.WARNING_25_MIN;
        this.sendTimeUpdate(elapsed, "final_warning");
      }
      
      // Hard stop at 30 minutes
      if (elapsed >= this.config.maxDuration) {
        this.forceEndInterview("time_limit_reached");
      }
    }, 30000); // Check every 30 seconds
  }
  
  private async sendTimeUpdate(elapsed: number, warningType: string) {
    // Inject time update into Gemini session
    await this.geminiSession.sendSystemMessage({
      type: "time_update",
      elapsed: elapsed,
      remaining: this.config.maxDuration - elapsed,
      warning: warningType
    });
    
    // Log to Firestore
    await this.logInterviewEvent({
      stage: warningType,
      timestamp: elapsed,
      content: `Time warning: ${warningType}`
    });
  }
  
  private async forceEndInterview(reason: string) {
    clearInterval(this.timeMonitor);
    
    this.currentStage = InterviewStage.SIGN_OFF;
    
    // Send appropriate sign-off based on reason
    const signOffMessage = reason === "time_limit_reached" 
      ? this.config.signOff.timeExpiredClosing
      : this.config.signOff.standardClosing;
    
    const finalMessage = signOffMessage
      .replace('{COMPANY_NAME}', this.config.greeting.companyName);
    
    await this.geminiSession.sendText(finalMessage);
    
    // Wait 5 seconds for sign-off to play
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // End session
    await this.endSession();
  }
  
  private getSignOffMessage(): string {
    // Determine which sign-off to use
    const elapsed = (Date.now() - this.startTime) / 1000;
    
    if (elapsed >= this.config.maxDuration) {
      return this.config.signOff.timeExpiredClosing;
    } else if (this.questionsAsked >= this.config.numberOfQuestions) {
      return this.config.signOff.earlyCompletionClosing;
    } else {
      return this.config.signOff.standardClosing;
    }
  }
  
  async processAudioStream(audioChunk: Buffer) {
    // Stream audio to Gemini Live
    await this.geminiSession.sendAudio(audioChunk);
  }
  
  async handleGeminiResponse(response: any) {
    if (response.type === "audio") {
      // Stream audio response back to frontend
      return {
        type: "audio",
        data: response.audioData,
        timestamp: Date.now() - this.startTime
      };
    } else if (response.type === "text") {
      // Text response (for transcript)
      this.questionsAsked++;
      
      await this.logInterviewEvent({
        stage: 'question',
        questionNumber: this.questionsAsked,
        timestamp: Date.now() - this.startTime,
        content: response.text
      });
      
      return {
        type: "text",
        data: response.text,
        questionNumber: this.questionsAsked,
        timestamp: Date.now() - this.startTime
      };
    }
  }
  
  async endSession() {
    this.currentStage = InterviewStage.COMPLETED;
    
    // Close Gemini Live session
    await this.geminiSession.close();
    
    // Update Firestore
    await firestore.collection('interviews').doc(this.interviewId).update({
      status: 'completed',
      completedAt: Timestamp.now(),
      duration: (Date.now() - this.startTime) / 1000,
      questionsAsked: this.questionsAsked,
      endReason: this.currentStage === InterviewStage.SIGN_OFF 
        ? 'natural_completion' 
        : 'time_limit'
    });
    
    // Trigger post-processing
    await this.triggerPostProcessing();
  }
  
  private async logInterviewEvent(event: any) {
    await firestore
      .collection('interviews')
      .doc(this.interviewId)
      .collection('events')
      .add({
        ...event,
        createdAt: Timestamp.now()
      });
  }
  
  private async triggerPostProcessing() {
    // Trigger Cloud Function to:
    // 1. Generate full transcript
    // 2. Analyze interview
    // 3. Score responses
    // 4. Notify recruiters
  }
}
Frontend Real-Time Interview Component
File: /frontend/components/interview/live-interview-session.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Timer, Video, Mic, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface LiveInterviewSessionProps {
  interviewId: string;
  companyName: string;
  jobTitle: string;
  maxDuration: number; // 1800 seconds (30 min)
}

export default function LiveInterviewSession({
  interviewId,
  companyName,
  jobTitle,
  maxDuration = 1800
}: LiveInterviewSessionProps) {
  const [stage, setStage] = useState<"pre-start" | "active" | "completed">("pre-start");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(6);
  const [transcript, setTranscript] = useState<Array<{speaker: string, text: string, time: number}>>([]);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const webSocketRef = useRef<WebSocket | null>(null);
  
  useEffect(() => {
    if (stage === "active") {
      startInterview();
    }
    
    return () => {
      if (webSocketRef.current) {
        webSocketRef.current.close();
      }
    };
  }, [stage]);
  
  // Timer
  useEffect(() => {
    if (stage !== "active") return;
    
    const timer = setInterval(() => {
      setTimeElapsed(prev => {
        const newTime = prev + 1;
        
        // Show warnings at specific times
        if (newTime === 1200) { // 20 minutes
          setShowWarning(true);
          setWarningMessage("⚠️ 10 minutes remaining");
          setTimeout(() => setShowWarning(false), 5000);
        } else if (newTime === 1500) { // 25 minutes
          setShowWarning(true);
          setWarningMessage("⚠️ 5 minutes remaining - Final questions");
          setTimeout(() => setShowWarning(false), 5000);
        } else if (newTime >= maxDuration) { // 30 minutes
          endInterview("time_limit");
        }
        
        return newTime;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [stage, maxDuration]);
  
  const startInterview = async () => {
    try {
      // Request camera and microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 24000
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Initialize WebSocket connection to backend
      webSocketRef.current = new WebSocket(
        `wss://your-backend.com/interview/${interviewId}`
      );
      
      webSocketRef.current.onopen = () => {
        console.log("Connected to interview session");
        
        // Initialize MediaRecorder
        mediaRecorderRef.current = new MediaRecorder(stream, {
          mimeType: "video/webm;codecs=vp9,opus"
        });
        
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0 && webSocketRef.current) {
            // Stream video/audio chunks to backend
            webSocketRef.current.send(event.data);
          }
        };
        
        mediaRecorderRef.current.start(1000); // Send chunks every second
      };
      
      webSocketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === "question") {
          setCurrentQuestion(data.text);
          setQuestionsAnswered(data.questionNumber - 1);
          
          // Add to transcript
          setTranscript(prev => [...prev, {
            speaker: "AI",
            text: data.text,
            time: data.timestamp
          }]);
        } else if (data.type === "audio") {
          // Play AI audio response
          playAudioResponse(data.audioData);
        } else if (data.type === "transcript") {
          // Add candidate response to transcript
          setTranscript(prev => [...prev, {
            speaker: "Candidate",
            text: data.text,
            time: data.timestamp
          }]);
        } else if (data.type === "sign_off") {
          // AI is ending the interview
          setTimeout(() => {
            endInterview("natural_completion");
          }, 5000); // Wait for sign-off to finish
        }
      };
      
    } catch (error) {
      console.error("Failed to start interview:", error);
      alert("Could not access camera/microphone. Please check permissions.");
    }
  };
  
  const playAudioResponse = (audioData: string) => {
    const audio = new Audio(`data:audio/wav;base64,${audioData}`);
    audio.play();
  };
  
  const endInterview = (reason: string) => {
    setStage("completed");
    
    // Stop recording
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    
    // Close WebSocket
    if (webSocketRef.current) {
      webSocketRef.current.close();
    }
    
    // Stop video stream
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    
    // Navigate to completion page
    window.location.href = `/candidate/interview/${interviewId}/complete`;
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getTimerColor = () => {
    if (timeElapsed < 1200) return "text-green-600"; // 0-20 min
    if (timeElapsed < 1500) return "text-yellow-600"; // 20-25 min
    return "text-red-600"; // 25-30 min
  };
  
  if (stage === "pre-start") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/30">
        <div className="max-w-2xl p-8 bg-card rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-4">
            AI Interview - {jobTitle}
          </h1>
          <p className="text-xl mb-2">{companyName}</p>
          
          <div className="space-y-4 my-8">
            <div className="flex items-center gap-3">
              <Timer className="w-5 h-5" />
              <span>Duration: 20-25 minutes (maximum 30 minutes)</span>
            </div>
            <div className="flex items-center gap-3">
              <Video className="w-5 h-5" />
              <span>Video recording required</span>
            </div>
            <div className="flex items-center gap-3">
              <Mic className="w-5 h-5" />
              <span>Audio recording required</span>
            </div>
          </div>
          
          <Button 
            onClick={() => setStage("active")}
            size="lg"
            className="w-full"
          >
            Start Interview
          </Button>
        </div>
      </div>
    );
  }
  
  if (stage === "active") {
    return (
      <div className="flex flex-col h-screen">
        {/* Top Bar */}
        <div className="border-b bg-card p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="font-bold text-lg">{companyName}</div>
              <Badge variant="outline">{jobTitle}</Badge>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Progress:</span>
                <span className="font-medium">{questionsAnswered}/{totalQuestions}</span>
                <Progress value={(questionsAnswered / totalQuestions) * 100} className="w-24" />
              </div>
              
              <div className={`flex items-center gap-2 font-mono text-lg ${getTimerColor()}`}>
                <Timer className="w-5 h-5" />
                {formatTime(maxDuration - timeElapsed)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Warning Banner */}
        {showWarning && (
          <div className="bg-yellow-100 border-b border-yellow-300 px-4 py-2 text-center">
            <div className="flex items-center justify-center gap-2 text-yellow-900">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">{warningMessage}</span>
            </div>
          </div>
        )}
        
        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Video Panel */}
          <div className="flex-1 bg-black flex flex-col items-center justify-center p-8">
            <video 
              ref={videoRef}
              autoPlay 
              muted 
              className="max-w-2xl w-full rounded-lg shadow-2xl"
            />
            
            {/* Recording Indicator */}
            <div className="mt-4 flex items-center gap-2 text-white">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
              <span>Recording</span>
            </div>
            
            {/* Current Question */}
            {currentQuestion && (
              <div className="mt-8 max-w-2xl w-full bg-card p-6 rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">
                  Question {questionsAnswered + 1} of {totalQuestions}
                </div>
                <p className="text-lg">{currentQuestion}</p>
              </div>
            )}
          </div>
          
          {/* Transcript Sidebar */}
          <div className="w-80 bg-card border-l overflow-y-auto p-4">
            <h3 className="font-semibold mb-4">Live Transcript</h3>
            <div className="space-y-3">
              {transcript.map((item, index) => (
                <div key={index} className={`text-sm ${item.speaker === 'AI' ? 'text-blue-600' : 'text-green-600'}`}>
                  <div className="font-medium">{item.speaker}</div>
                  <div className="text-foreground mt-1">{item.text}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatTime(item.time)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Bottom Controls */}
        <div className="border-t bg-card p-4">
          <div className="max-w-7xl mx-auto flex justify-center">
            <Button 
              variant="destructive"
              onClick={() => {
                if (confirm("Are you sure you want to end the interview?")) {
                  endInterview("user_ended");
                }
              }}
            >
              End Interview
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return null;
}
AI Agent Configuration UI
File: /frontend/app/company-admin/settings/interview-agent/page.tsx Settings Panel:
Time limit slider (15-30 minutes, default 30)
Greeting customization:
Use company name toggle
Custom greeting text editor
Tone selector (Professional/Friendly/Casual)
Sign-off customization:
Standard closing text
Time-expired closing text
Early completion closing text
Number of questions (3-10, default 6)
Question types (checkboxes)
Test interview button (try with sample candidate)
Rest of the plan continues as before...
(Phases 3-6 remain the same as previous plan, with all the feedback dashboard features, recruiter workflows, company admin features, etc.)
Key Interview Flow Summary
Pre-Interview (0:00)
System checks
"Ready to begin?"
Greeting (0:00-1:00)
AI greets with company name
Explains interview structure
Sets expectations (20-25 min, max 30)
Questions (1:00-20:00)
6 questions planned
Adaptive follow-ups
Natural conversation
First Warning (20:00)
"We have 10 minutes remaining..."
Transition to final questions
Final Warning (25:00)
"One final question..."
Begin wrap-up
Sign-Off (29:00-30:00)
Thank you message with company name
Set expectations for follow-up
Professional closing
Hard Stop (30:00)
Automatic end if time reached
Time-expired closing message
Graceful session termination
Total New Files: ~120 files
Frontend: ~65 files
Backend Functions: ~25 files
AI Services: ~18 files (includes interview config)
Backend Services: ~10 files
Shared: ~5 files