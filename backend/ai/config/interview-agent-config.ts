/**
 * Interview Agent Configuration
 * Manages AI interview settings per company
 */

import { InterviewAgentConfig } from "../../../shared/types/interview";

/**
 * Default Interview Agent Configuration
 * Used when company hasn't customized settings
 */
export const DEFAULT_INTERVIEW_CONFIG: InterviewAgentConfig = {
  companyId: "default",
  enabled: true,

  // Time Management - Configurable per interview (0-30 min)
  defaultDuration: 1800, // Default: 30 minutes
  maxDuration: 1800, // Hard limit: 30 minutes (cannot exceed)
  minDuration: 300, // Minimum: 5 minutes

  // Warning Thresholds - Percentage-based (adapts to scheduled duration)
  warningThresholds: {
    firstWarningPercent: 66, // First warning at 66% (20 min for 30 min, 10 min for 15 min)
    finalWarningPercent: 83, // Final warning at 83% (25 min for 30 min, 12.5 min for 15 min)
  },

  // Greeting Configuration
  greeting: {
    useCompanyName: true,
    companyName: "{COMPANY_NAME}", // Will be replaced dynamically
    introduction:
      "Hello! I'm the AI interviewer for {COMPANY_NAME}. Thank you for taking the time to speak with me today. This interview will take approximately 20-30 minutes, and I'll be asking you a series of questions to better understand your background, skills, and fit for the role. Feel free to take your time with your responses, and let me know if you need any clarification. Are you ready to begin?",
    tone: "professional",
  },

  // Sign-off Configuration
  signOff: {
    standardClosing:
      "Thank you so much for your time today. You've provided excellent insights, and we really appreciate you taking the time to speak with us. Our team will review your responses and get back to you within the next few days regarding next steps. Do you have any questions for me before we wrap up?",
    timeExpiredClosing:
      "I notice we're at the 30-minute mark for this interview. Thank you so much for your thoughtful responses today. Our team will review everything we discussed and reach out to you soon with next steps. We appreciate your time and interest in joining {COMPANY_NAME}.",
    earlyCompletionClosing:
      "Great! We've covered all the questions I had prepared. Thank you for your comprehensive and thoughtful answers. Our hiring team will review your interview and be in touch soon. Is there anything else you'd like to add or any questions you have for us?",
    tone: "professional",
  },

  // Gemini Model Configuration
  model: {
    name: "gemini-2.0-flash-exp", // Latest Gemini 2.0 Flash
    temperature: 0.7,
    maxOutputTokens: 2048,
    topP: 0.9,
    topK: 40,
  },

  // Question Configuration
  questions: {
    totalQuestions: 8,
    screeningQuestions: [
      "Can you tell me about your background and what interests you about this role?",
      "What are your salary expectations for this position?",
      "What is your notice period, and when would you be able to start?",
      "Are you currently interviewing with other companies?",
    ],
    technicalQuestions: [
      "Can you walk me through a recent project you worked on and the technologies you used?",
      "How do you approach problem-solving when faced with a technical challenge?",
      "What's your experience with [relevant technology from job description]?",
      "Can you describe a time when you had to learn a new technology quickly?",
    ],
    behavioralQuestions: [
      "Tell me about a time when you had to work with a difficult team member. How did you handle it?",
      "Describe a situation where you had to meet a tight deadline. What was your approach?",
      "What's your greatest professional achievement, and why are you proud of it?",
      "How do you handle feedback and criticism?",
    ],
  },

  // Voice Configuration
  voice: {
    enabled: true,
    language: "en-US",
    speed: 1.0,
  },
};

/**
 * Get Interview Configuration for a Company
 * Fetches from Firestore or returns default
 */
export async function getInterviewConfig(
  companyId: string,
  companyName: string
): Promise<InterviewAgentConfig> {
  // TODO: Implement Firestore fetch
  // const configDoc = await db.collection('aiAgentSettings').doc(companyId).get();
  // if (configDoc.exists) {
  //   return configDoc.data().interviewAgent as InterviewAgentConfig;
  // }

  // Return default config with company name replaced
  const config = { ...DEFAULT_INTERVIEW_CONFIG };
  config.companyId = companyId;
  config.greeting.companyName = companyName;
  config.greeting.introduction = config.greeting.introduction.replace(
    "{COMPANY_NAME}",
    companyName
  );
  config.signOff.timeExpiredClosing = config.signOff.timeExpiredClosing.replace(
    "{COMPANY_NAME}",
    companyName
  );

  return config;
}

/**
 * Save Interview Configuration for a Company
 */
export async function saveInterviewConfig(
  companyId: string,
  config: InterviewAgentConfig
): Promise<void> {
  // TODO: Implement Firestore save
  // await db.collection('aiAgentSettings').doc(companyId).set({
  //   interviewAgent: config,
  //   updatedAt: new Date(),
  // }, { merge: true });
}

/**
 * Calculate dynamic warning times based on scheduled duration
 * @param scheduledDuration - Interview duration in seconds
 * @param config - Interview agent config with percentage thresholds
 * @returns Object with firstWarning and finalWarning times in seconds
 */
export function calculateWarningTimes(
  scheduledDuration: number,
  config: InterviewAgentConfig
): {
  firstWarning: number;
  finalWarning: number;
} {
  return {
    firstWarning: Math.floor(
      (scheduledDuration * config.warningThresholds.firstWarningPercent) / 100
    ),
    finalWarning: Math.floor(
      (scheduledDuration * config.warningThresholds.finalWarningPercent) / 100
    ),
  };
}

/**
 * Validate Interview Configuration
 * Ensures all required fields are present and valid
 */
export function validateInterviewConfig(config: InterviewAgentConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check duration limits
  if (config.maxDuration < 300 || config.maxDuration > 1800) {
    errors.push("Max duration must be between 5 and 30 minutes (300-1800 seconds)");
  }

  if (config.minDuration < 60) {
    errors.push("Min duration must be at least 1 minute (60 seconds)");
  }

  if (config.defaultDuration < config.minDuration || config.defaultDuration > config.maxDuration) {
    errors.push("Default duration must be between min and max duration");
  }

  // Check warning threshold percentages
  if (
    config.warningThresholds.firstWarningPercent >= 100 ||
    config.warningThresholds.firstWarningPercent <= 0
  ) {
    errors.push("First warning percentage must be between 0 and 100");
  }

  if (
    config.warningThresholds.finalWarningPercent >= 100 ||
    config.warningThresholds.finalWarningPercent <= 0
  ) {
    errors.push("Final warning percentage must be between 0 and 100");
  }

  if (
    config.warningThresholds.firstWarningPercent >= config.warningThresholds.finalWarningPercent
  ) {
    errors.push("First warning must be before final warning");
  }

  // Check greeting
  if (!config.greeting.introduction || config.greeting.introduction.length < 10) {
    errors.push("Greeting introduction must be at least 10 characters");
  }

  // Check sign-off messages
  if (!config.signOff.standardClosing || config.signOff.standardClosing.length < 10) {
    errors.push("Standard closing must be at least 10 characters");
  }

  if (
    !config.signOff.timeExpiredClosing ||
    config.signOff.timeExpiredClosing.length < 10
  ) {
    errors.push("Time expired closing must be at least 10 characters");
  }

  // Check questions
  if (config.questions.totalQuestions < 1 || config.questions.totalQuestions > 20) {
    errors.push("Total questions must be between 1 and 20");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate System Prompt for Interview Agent
 */
export function generateInterviewSystemPrompt(
  config: InterviewAgentConfig,
  jobTitle: string,
  jobDescription: string
): string {
  return `You are an AI interviewer conducting a ${config.greeting.tone} interview for the position of ${jobTitle}.

ROLE AND RESPONSIBILITIES:
- Conduct a thorough but friendly interview
- Ask relevant questions to assess the candidate's qualifications
- Listen carefully to responses and ask thoughtful follow-up questions
- Be encouraging and professional throughout
- Maintain a ${config.greeting.tone} tone

JOB DESCRIPTION:
${jobDescription}

INTERVIEW STRUCTURE:
- Total time: ${config.maxDuration / 60} minutes maximum
- Number of questions: approximately ${config.questions.totalQuestions}
- You will receive time warnings at ${config.warningThresholds.firstWarning / 60} and ${config.warningThresholds.finalWarning / 60} minutes

GUIDELINES:
1. Start with the greeting: "${config.greeting.introduction}"
2. Ask questions from the provided list, but feel free to ask natural follow-ups
3. Keep your questions concise and clear
4. Allow the candidate time to think and respond
5. If the candidate asks for clarification, provide it
6. Be respectful of cultural differences and varied backgrounds
7. Focus on skills, experience, and cultural fit
8. Avoid discriminatory questions (age, religion, marital status, etc.)

AVAILABLE QUESTIONS:
Screening: ${config.questions.screeningQuestions.join(", ")}
Technical: ${config.questions.technicalQuestions.join(", ")}
Behavioral: ${config.questions.behavioralQuestions.join(", ")}

When you receive a time warning, acknowledge it gracefully and begin wrapping up.
When time expires or all questions are answered, use the appropriate closing message.

Remember: Your goal is to assess the candidate fairly while providing a positive interview experience.`;
}
