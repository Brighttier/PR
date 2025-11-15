/**
 * Google Gemini AI Configuration
 *
 * This file contains all configuration for Google Gemini API integration
 * including model settings, API keys, and service initialization.
 */

// Gemini Model Configuration
export const GEMINI_MODELS = {
  // Fast model for resume parsing, job matching, quick analysis
  FLASH_2_0: "gemini-2.0-flash-exp",

  // Advanced model for complex analysis and interview scoring
  PRO_1_5: "gemini-1.5-pro-latest",

  // Real-time interview model
  LIVE: "gemini-live",
} as const;

// Model Usage Mapping
export const MODEL_USAGE = {
  resumeParsing: GEMINI_MODELS.FLASH_2_0,
  jobMatching: GEMINI_MODELS.FLASH_2_0,
  candidateSummarization: GEMINI_MODELS.FLASH_2_0,
  jobGeneration: GEMINI_MODELS.PRO_1_5,
  transcriptAnalysis: GEMINI_MODELS.PRO_1_5,
  interviewScoring: GEMINI_MODELS.PRO_1_5,
  liveInterview: GEMINI_MODELS.LIVE,
  emailGeneration: GEMINI_MODELS.FLASH_2_0,
} as const;

// Generation Configuration
export const GENERATION_CONFIG = {
  // Resume parsing - structured output needed
  resumeParsing: {
    temperature: 0.1,
    topK: 1,
    topP: 0.8,
    maxOutputTokens: 2048,
    responseMimeType: "application/json",
  },

  // Job matching - deterministic scoring
  jobMatching: {
    temperature: 0.2,
    topK: 10,
    topP: 0.9,
    maxOutputTokens: 1024,
    responseMimeType: "application/json",
  },

  // Candidate summarization - creative but accurate
  candidateSummarization: {
    temperature: 0.4,
    topK: 20,
    topP: 0.9,
    maxOutputTokens: 1024,
    responseMimeType: "application/json",
  },

  // Job description generation - creative
  jobGeneration: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048,
  },

  // Transcript analysis - thorough
  transcriptAnalysis: {
    temperature: 0.3,
    topK: 20,
    topP: 0.9,
    maxOutputTokens: 4096,
    responseMimeType: "application/json",
  },

  // Interview scoring - consistent
  interviewScoring: {
    temperature: 0.2,
    topK: 10,
    topP: 0.85,
    maxOutputTokens: 2048,
    responseMimeType: "application/json",
  },

  // Email generation - professional
  emailGeneration: {
    temperature: 0.5,
    topK: 30,
    topP: 0.9,
    maxOutputTokens: 1024,
  },
} as const;

// Safety Settings (consistent across all models)
export const SAFETY_SETTINGS = [
  {
    category: "HARM_CATEGORY_HARASSMENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_HATE_SPEECH",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
];

// API Configuration
export const API_CONFIG = {
  // Base endpoint for Vertex AI (if using Vertex AI)
  vertexAIEndpoint: process.env.VERTEX_AI_ENDPOINT || "us-central1-aiplatform.googleapis.com",

  // Project ID (required for Vertex AI)
  projectId: process.env.GOOGLE_CLOUD_PROJECT || "",

  // Location/Region
  location: process.env.GOOGLE_CLOUD_LOCATION || "us-central1",

  // API Key (if using Gemini API directly instead of Vertex AI)
  apiKey: process.env.GEMINI_API_KEY || "",

  // Timeout settings
  timeout: 60000, // 60 seconds default
  longTimeout: 300000, // 5 minutes for complex operations
};

// Rate Limiting Configuration
export const RATE_LIMITS = {
  requestsPerMinute: 60,
  requestsPerDay: 10000,
  tokensPerMinute: 100000,
};

// Retry Configuration
export const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

// Feature Flags
export const FEATURES = {
  enableCaching: true,
  enableBatching: false, // Batch multiple requests when possible
  enableLogging: process.env.NODE_ENV !== "production",
  enableMetrics: true,
};

// Validate configuration
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check if API key or project ID is set
  if (!API_CONFIG.apiKey && !API_CONFIG.projectId) {
    errors.push("Either GEMINI_API_KEY or GOOGLE_CLOUD_PROJECT must be set");
  }

  // Validate model names
  Object.values(GEMINI_MODELS).forEach((model) => {
    if (!model || typeof model !== "string") {
      errors.push(`Invalid model configuration: ${model}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Export types
export type GeminiModel = typeof GEMINI_MODELS[keyof typeof GEMINI_MODELS];
export type GenerationConfigKey = keyof typeof GENERATION_CONFIG;
