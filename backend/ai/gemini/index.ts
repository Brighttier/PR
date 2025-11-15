/**
 * Google Gemini AI Services
 *
 * Central export point for all Gemini-powered AI services
 */

// Configuration and Client
export * from "./config";
export * from "./client";

// Core AI Services
export * from "./resume-parser";
export * from "./job-matcher";
export * from "./candidate-summarizer";
export * from "./job-generator";
export * from "./email-generator";

// Interview Services
export * from "./live-interview";
export * from "./transcript-analyzer";
export * from "./interview-scorer";

// Re-export types for convenience
export type {
  ParsedResume,
} from "./resume-parser";

export type {
  JobRequirements,
  MatchResult,
} from "./job-matcher";

export type {
  CandidateSummary,
} from "./candidate-summarizer";

export type {
  JobGenerationInput,
  GeneratedJobDescription,
} from "./job-generator";

export type {
  EmailType,
  EmailContext,
  GeneratedEmail,
} from "./email-generator";

export type {
  InterviewStage,
  InterviewAgentConfig,
  LiveInterviewSession,
} from "./live-interview";

export type {
  TranscriptEntry,
  TranscriptAnalysis,
  KeyMoment,
  SentimentDataPoint,
} from "./transcript-analyzer";

export type {
  InterviewScore,
  TechnicalAssessment,
  SoftSkillsAssessment,
  SkillScore,
} from "./interview-scorer";
