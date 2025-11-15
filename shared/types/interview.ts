/**
 * Shared types for AI Interview System
 * Used across frontend, backend, and Cloud Functions
 */

export type InterviewType = "ai_screening" | "ai_technical" | "face_to_face" | "panel";

export type InterviewStage =
  | "PRE_START"
  | "GREETING"
  | "QUESTIONS"
  | "WARNING_20_MIN"
  | "WARNING_25_MIN"
  | "WRAPPING_UP"
  | "SIGN_OFF"
  | "COMPLETED"
  | "TIMEOUT";

export type InterviewStatus = "scheduled" | "in_progress" | "completed" | "cancelled" | "expired";

export type SignOffType = "standard" | "time_expired" | "early_completion";

export interface InterviewSession {
  sessionId: string;
  interviewId: string;
  applicationId: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  companyName: string;
  type: InterviewType;
  status: InterviewStatus;
  currentStage: InterviewStage;

  // Timing - CONFIGURABLE per interview (0-30 min max)
  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  scheduledDuration: number; // in seconds - SET WHEN SCHEDULING (e.g., 900 = 15 min)
  maxDuration: number; // in seconds - HARD LIMIT: 1800 (30 min)
  elapsedTime: number; // in seconds - current elapsed time

  // Gemini Live Session
  geminiSessionId?: string;
  geminiConnected: boolean;

  // Recording
  videoRecordingUrl?: string;
  audioRecordingUrl?: string;
  transcriptUrl?: string;

  // Configuration
  config: InterviewAgentConfig;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface InterviewAgentConfig {
  companyId: string;
  enabled: boolean;

  // Time Management - GLOBAL LIMITS (can be overridden per interview)
  defaultDuration: number; // Default interview duration (e.g., 1800 = 30 min)
  maxDuration: number; // Absolute maximum allowed: 1800 seconds (30 min)
  minDuration: number; // Minimum allowed: 300 seconds (5 min)

  // Warning Thresholds - PERCENTAGE-BASED (dynamic based on scheduled duration)
  warningThresholds: {
    firstWarningPercent: number; // Default: 66% (e.g., at 20 min for 30 min interview, at 10 min for 15 min interview)
    finalWarningPercent: number; // Default: 83% (e.g., at 25 min for 30 min interview, at 12.5 min for 15 min interview)
  };

  // Greeting Configuration
  greeting: {
    useCompanyName: boolean;
    companyName: string;
    introduction: string;
    tone: "professional" | "friendly" | "casual";
  };

  // Sign-off Configuration
  signOff: {
    standardClosing: string;
    timeExpiredClosing: string;
    earlyCompletionClosing: string;
    tone: "professional" | "friendly" | "casual";
  };

  // Gemini Model Configuration
  model: {
    name: string; // "gemini-2.0-flash-exp"
    temperature: number;
    maxOutputTokens: number;
    topP: number;
    topK: number;
  };

  // Question Configuration
  questions: {
    totalQuestions: number;
    screeningQuestions: string[];
    technicalQuestions: string[];
    behavioralQuestions: string[];
  };

  // Voice Configuration
  voice: {
    enabled: boolean;
    language: string; // "en-US"
    speed: number; // 1.0
  };
}

export interface InterviewTranscript {
  sessionId: string;
  entries: TranscriptEntry[];
  fullText: string;
  duration: number;
  wordCount: number;
  createdAt: Date;
}

export interface TranscriptEntry {
  id: string;
  timestamp: number; // seconds from start
  speaker: "ai" | "candidate";
  text: string;
  confidence?: number;
}

export interface InterviewFeedback {
  feedbackId: string;
  sessionId: string;
  interviewId: string;
  applicationId: string;
  candidateId: string;

  // AI-Generated Analysis
  aiAnalysis: {
    overallScore: number; // 0-100
    communicationScore: number; // 0-100
    technicalScore: number; // 0-100
    cultureFitScore: number; // 0-100

    strengths: string[];
    weaknesses: string[];
    redFlags: string[];

    summary: string;
    recommendation: "strong_hire" | "hire" | "maybe" | "no_hire";
  };

  // Interviewer Feedback (if human interviewer)
  interviewerFeedback?: {
    interviewerId: string;
    interviewerName: string;
    rating: number; // 1-5
    recommendation: "strong_hire" | "hire" | "consider" | "no_hire";
    strengths: string;
    concerns: string;
    notes: string;
    submittedAt: Date;
  };

  // Metrics
  metrics: {
    questionCount: number;
    avgResponseTime: number; // seconds
    longPauses: number; // count of pauses > 5 sec
    interruptionCount: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

export interface TimeUpdate {
  elapsed: number; // seconds
  remaining: number; // seconds
  percentage: number; // 0-100
  warningType?: "20_minute_warning" | "final_warning" | "time_expired";
}

export interface InterviewMessage {
  type: "greeting" | "question" | "response" | "warning" | "sign_off" | "error";
  content: string;
  timestamp: number;
  speaker: "ai" | "candidate";
  metadata?: {
    questionNumber?: number;
    totalQuestions?: number;
    warningType?: string;
    signOffType?: SignOffType;
  };
}
