import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

// Available models
export const GEMINI_MODELS = {
  FLASH_2_0: 'gemini-2.0-flash-exp',
  PRO_1_5: 'gemini-1.5-pro',
  FLASH_1_5: 'gemini-1.5-flash',
} as const;

/**
 * Get a Gemini model instance
 */
export function getGeminiModel(modelName: string = GEMINI_MODELS.FLASH_2_0) {
  return genAI.getGenerativeModel({ model: modelName });
}

/**
 * Resume Parser Agent
 * Extracts structured data from resume text
 */
export async function parseResume(resumeText: string) {
  const model = getGeminiModel(GEMINI_MODELS.FLASH_2_0);

  const prompt = `You are a resume parser. Extract the following information from the resume and return it as a JSON object:

{
  "name": "Full name",
  "email": "Email address",
  "phone": "Phone number",
  "location": "City, State/Country",
  "summary": "Professional summary",
  "skills": ["skill1", "skill2", ...],
  "experience": [
    {
      "company": "Company name",
      "title": "Job title",
      "startDate": "MM/YYYY",
      "endDate": "MM/YYYY or Present",
      "description": "Job description",
      "achievements": ["achievement1", ...]
    }
  ],
  "education": [
    {
      "institution": "School name",
      "degree": "Degree",
      "field": "Field of study",
      "graduationDate": "MM/YYYY",
      "gpa": "GPA (if available)"
    }
  ],
  "certifications": ["cert1", "cert2", ...],
  "languages": ["language1", "language2", ...]
}

Resume text:
${resumeText}

Return ONLY the JSON object, no other text.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  try {
    // Try to parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No valid JSON found in response');
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw new Error('Failed to parse resume');
  }
}

/**
 * Job Matching & Scoring Agent
 * Calculates match score between candidate and job
 */
export async function calculateMatchScore(
  candidateData: any,
  jobRequirements: any
) {
  const model = getGeminiModel(GEMINI_MODELS.FLASH_2_0);

  const prompt = `You are a job matching expert. Analyze the candidate's profile against the job requirements and provide a match score.

Candidate Profile:
${JSON.stringify(candidateData, null, 2)}

Job Requirements:
${JSON.stringify(jobRequirements, null, 2)}

Provide your analysis as a JSON object:
{
  "matchScore": 0-100,
  "skillsMatch": {
    "matched": ["skill1", "skill2"],
    "missing": ["skill3"],
    "score": 0-100
  },
  "experienceMatch": {
    "yearsRequired": number,
    "yearsCandidate": number,
    "score": 0-100
  },
  "educationMatch": {
    "required": "string",
    "candidate": "string",
    "met": boolean
  },
  "recommendation": "Fast Track" | "Strong Candidate" | "Worth Reviewing" | "Marginal Fit" | "Not Recommended"
}

Return ONLY the JSON object.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No valid JSON found in response');
  } catch (error) {
    console.error('Error calculating match score:', error);
    throw new Error('Failed to calculate match score');
  }
}

/**
 * Candidate Summarization Agent
 * Generates executive summary of candidate
 */
export async function summarizeCandidate(candidateData: any, jobContext?: any) {
  const model = getGeminiModel(GEMINI_MODELS.FLASH_2_0);

  const contextString = jobContext
    ? `\n\nJob Context:\n${JSON.stringify(jobContext, null, 2)}`
    : '';

  const prompt = `You are a recruitment analyst. Create a concise summary of this candidate.

Candidate Profile:
${JSON.stringify(candidateData, null, 2)}${contextString}

Provide your summary as a JSON object:
{
  "oneLiner": "One sentence summary (e.g., '5 years React dev with strong TS')",
  "executiveSummary": "2-3 sentence detailed paragraph",
  "recommendation": "Fast Track" | "Strong Candidate" | "Worth Reviewing" | "Marginal Fit" | "Not Recommended",
  "strengths": ["strength1", "strength2", "strength3"],
  "redFlags": ["concern1", "concern2"] or []
}

Return ONLY the JSON object.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No valid JSON found in response');
  } catch (error) {
    console.error('Error summarizing candidate:', error);
    throw new Error('Failed to summarize candidate');
  }
}

/**
 * Initialize Gemini Live API for AI interviews
 * Returns a session for real-time conversation
 */
export async function initializeGeminiLive() {
  // Note: Gemini Live API requires special setup
  // This is a placeholder for the live session initialization
  const model = getGeminiModel(GEMINI_MODELS.FLASH_2_0);

  return {
    model,
    startSession: async (config: {
      systemInstruction: string;
      onResponse: (text: string) => void;
    }) => {
      // Live session logic will be implemented here
      // This would use Gemini's streaming API for real-time conversation
      console.log('Gemini Live session initialized', config);
    },
  };
}

export default genAI;
