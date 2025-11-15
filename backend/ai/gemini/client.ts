/**
 * Google Gemini Client Initialization
 *
 * This file handles the initialization and management of Gemini API clients
 * using the official @google/generative-ai SDK.
 */

import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import {
  GEMINI_MODELS,
  MODEL_USAGE,
  GENERATION_CONFIG,
  SAFETY_SETTINGS,
  API_CONFIG,
  RETRY_CONFIG,
  validateConfig,
  type GeminiModel,
  type GenerationConfigKey,
} from "./config";

// Initialize the Gemini API client
let genAI: GoogleGenerativeAI | null = null;

/**
 * Initialize the Google Generative AI client
 */
export function initializeGemini(): GoogleGenerativeAI {
  if (genAI) {
    return genAI;
  }

  // Validate configuration
  const validation = validateConfig();
  if (!validation.valid) {
    throw new Error(
      `Invalid Gemini configuration:\n${validation.errors.join("\n")}`
    );
  }

  if (!API_CONFIG.apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  genAI = new GoogleGenerativeAI(API_CONFIG.apiKey);
  return genAI;
}

/**
 * Get a Gemini model instance with configuration
 */
export function getModel(
  modelName: GeminiModel,
  configKey: GenerationConfigKey
): GenerativeModel {
  const client = initializeGemini();

  const model = client.getGenerativeModel({
    model: modelName,
    generationConfig: GENERATION_CONFIG[configKey],
    safetySettings: SAFETY_SETTINGS,
  });

  return model;
}

/**
 * Get a model configured for a specific use case
 */
export function getModelForUseCase(useCase: keyof typeof MODEL_USAGE): GenerativeModel {
  const modelName = MODEL_USAGE[useCase];
  return getModel(modelName, useCase);
}

/**
 * Retry wrapper for API calls with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  retries: number = RETRY_CONFIG.maxRetries
): Promise<T> {
  let lastError: Error | null = null;
  let delay = RETRY_CONFIG.initialDelayMs;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on the last attempt
      if (attempt === retries) {
        break;
      }

      // Check if error is retryable
      if (!isRetryableError(error)) {
        throw error;
      }

      // Wait before retrying with exponential backoff
      await sleep(delay);
      delay = Math.min(delay * RETRY_CONFIG.backoffMultiplier, RETRY_CONFIG.maxDelayMs);

      console.warn(`Retry attempt ${attempt + 1}/${retries} after error:`, error);
    }
  }

  throw lastError || new Error("Operation failed after retries");
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error: any): boolean {
  if (!error) return false;

  // Retry on network errors
  if (error.code === "ECONNRESET" || error.code === "ETIMEDOUT") {
    return true;
  }

  // Retry on rate limit errors
  if (error.status === 429 || error.status === 503) {
    return true;
  }

  // Retry on server errors
  if (error.status >= 500 && error.status < 600) {
    return true;
  }

  return false;
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate content with a model (basic wrapper)
 */
export async function generateContent(
  model: GenerativeModel,
  prompt: string
): Promise<string> {
  return withRetry(async () => {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  });
}

/**
 * Generate structured JSON content
 */
export async function generateJSON<T = any>(
  model: GenerativeModel,
  prompt: string
): Promise<T> {
  return withRetry(async () => {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      return JSON.parse(text) as T;
    } catch (error) {
      console.error("Failed to parse JSON response:", text);
      throw new Error(`Invalid JSON response from Gemini: ${error}`);
    }
  });
}

/**
 * Start a chat session (for multi-turn conversations)
 */
export function startChat(model: GenerativeModel, history: any[] = []) {
  return model.startChat({
    history,
    generationConfig: model.generationConfig,
    safetySettings: model.safetySettings,
  });
}

/**
 * Count tokens in a text
 */
export async function countTokens(
  model: GenerativeModel,
  text: string
): Promise<number> {
  try {
    const result = await model.countTokens(text);
    return result.totalTokens;
  } catch (error) {
    console.error("Error counting tokens:", error);
    // Rough estimate: 1 token ~= 4 characters
    return Math.ceil(text.length / 4);
  }
}

/**
 * Embed content using Gemini (if available)
 * Note: This might need Vertex AI embeddings API
 */
export async function embedText(text: string): Promise<number[]> {
  // TODO: Implement using Vertex AI Text Embeddings API
  // For now, throw error
  throw new Error("Text embeddings not yet implemented. Use Vertex AI Embeddings API.");
}

/**
 * Health check for Gemini API
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const model = getModelForUseCase("candidateSummarization");
    const result = await generateContent(model, "Respond with 'OK' if you can receive this.");
    return result.toLowerCase().includes("ok");
  } catch (error) {
    console.error("Gemini health check failed:", error);
    return false;
  }
}

/**
 * Get usage statistics (placeholder for future implementation)
 */
export interface UsageStats {
  totalRequests: number;
  totalTokens: number;
  errors: number;
  lastRequestTime: number;
}

let usageStats: UsageStats = {
  totalRequests: 0,
  totalTokens: 0,
  errors: 0,
  lastRequestTime: 0,
};

export function getUsageStats(): UsageStats {
  return { ...usageStats };
}

export function resetUsageStats(): void {
  usageStats = {
    totalRequests: 0,
    totalTokens: 0,
    errors: 0,
    lastRequestTime: 0,
  };
}

/**
 * Track usage (called internally)
 */
export function trackUsage(tokens: number, error: boolean = false): void {
  usageStats.totalRequests++;
  usageStats.totalTokens += tokens;
  if (error) usageStats.errors++;
  usageStats.lastRequestTime = Date.now();
}
