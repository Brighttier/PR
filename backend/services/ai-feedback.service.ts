/**
 * AI Interview Feedback Service
 * Generates comprehensive feedback from interview transcripts using Gemini 2.0 Flash
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { InterviewFeedback, TranscriptEntry } from "../../shared/types/interview";

/**
 * Calculate interview metrics from transcript
 */
export function calculateMetrics(transcriptEntries: TranscriptEntry[]): {
  questionCount: number;
  avgResponseTime: number;
  longPauses: number;
  interruptionCount: number;
} {
  let questionCount = 0;
  let totalResponseTime = 0;
  let responseCount = 0;
  let longPauses = 0;
  let interruptionCount = 0;

  for (let i = 0; i < transcriptEntries.length; i++) {
    const entry = transcriptEntries[i];

    // Count AI questions
    if (entry.speaker === "ai" && entry.text.includes("?")) {
      questionCount++;
    }

    // Calculate response time (AI question → candidate response)
    if (i > 0 && entry.speaker === "candidate" && transcriptEntries[i - 1].speaker === "ai") {
      const aiTimestamp = transcriptEntries[i - 1].timestamp;
      const candidateTimestamp = entry.timestamp;
      const responseTime = candidateTimestamp - aiTimestamp;

      totalResponseTime += responseTime;
      responseCount++;

      // Count long pauses (>5 seconds before responding)
      if (responseTime > 5) {
        longPauses++;
      }
    }

    // Count interruptions (candidate speaks before AI finishes)
    if (
      i > 0 &&
      entry.speaker === "candidate" &&
      transcriptEntries[i - 1].speaker === "candidate"
    ) {
      // Two consecutive candidate entries = possible interruption
      const timeDiff = entry.timestamp - transcriptEntries[i - 1].timestamp;
      if (timeDiff < 2) {
        // Less than 2 seconds apart
        interruptionCount++;
      }
    }
  }

  const avgResponseTime = responseCount > 0 ? totalResponseTime / responseCount : 0;

  return {
    questionCount,
    avgResponseTime: Math.round(avgResponseTime * 10) / 10, // Round to 1 decimal
    longPauses,
    interruptionCount,
  };
}

/**
 * Build Gemini analysis prompt
 */
function buildAnalysisPrompt(
  transcriptEntries: TranscriptEntry[],
  jobDescription: string
): string {
  // Format transcript for Gemini
  const formattedTranscript = transcriptEntries
    .map((entry) => {
      const speaker = entry.speaker === "ai" ? "AI INTERVIEWER" : "CANDIDATE";
      return `[${speaker}]: ${entry.text}`;
    })
    .join("\n");

  return `You are an expert interview analyst. Analyze this AI-conducted interview transcript and provide detailed feedback.

JOB DESCRIPTION:
${jobDescription}

INTERVIEW TRANSCRIPT:
${formattedTranscript}

Analyze the candidate's responses and provide a JSON response with the following structure:
{
  "communicationScore": <number 0-100>,
  "technicalScore": <number 0-100>,
  "cultureFitScore": <number 0-100>,
  "strengths": ["strength1", "strength2", "strength3", "strength4", "strength5"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "redFlags": ["flag1", "flag2"],
  "summary": "<2-3 sentence executive summary>"
}

SCORING CRITERIA:

**Communication Score (0-100):**
- Clarity and articulation
- Professional language use
- Ability to explain complex concepts
- Active listening and appropriate responses
- Minimal filler words ("um", "uh", "like")
- Confidence in delivery

**Technical Score (0-100):**
- Depth of knowledge relevant to job requirements
- Problem-solving ability
- Experience with required technologies/skills
- Practical examples and past projects
- Understanding of industry best practices
- Ability to discuss technical concepts

**Culture Fit Score (0-100):**
- Alignment with company values
- Team collaboration indicators
- Growth mindset and learning attitude
- Passion for the role/industry
- Communication style match
- Work ethic and professionalism

**Strengths (5 items):**
- Identify the candidate's TOP 5 strengths
- Be specific (e.g., "Strong React expertise with 5 years production experience")
- Reference specific answers from the transcript

**Weaknesses (3 items):**
- Identify the TOP 3 areas for improvement
- Be constructive and specific
- Focus on skills gaps or areas needing development

**Red Flags (0-3 items):**
- Only include CRITICAL concerns that would impact hiring decision
- Examples: Lack of required experience, poor communication, negative attitude, dishonesty
- Leave empty array if no red flags

**Summary:**
- 2-3 concise sentences
- Overall impression of the candidate
- Key takeaway for hiring manager

Return ONLY valid JSON. Do not include any text before or after the JSON object.`;
}

/**
 * Analyze transcript with Gemini
 */
async function analyzeWithGemini(
  transcriptEntries: TranscriptEntry[],
  jobDescription: string
): Promise<{
  communicationScore: number;
  technicalScore: number;
  cultureFitScore: number;
  strengths: string[];
  weaknesses: string[];
  redFlags: string[];
  summary: string;
}> {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY environment variable not set");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.3, // Lower temperature for consistent scoring
        maxOutputTokens: 2048,
        topP: 0.9,
        topK: 40,
      },
    });

    const prompt = buildAnalysisPrompt(transcriptEntries, jobDescription);
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Extract JSON from response (Gemini sometimes adds markdown code blocks)
    let jsonText = responseText.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/, "").replace(/\n?```$/, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/, "").replace(/\n?```$/, "");
    }

    const analysis = JSON.parse(jsonText);

    // Validate scores are in range
    analysis.communicationScore = Math.min(100, Math.max(0, analysis.communicationScore));
    analysis.technicalScore = Math.min(100, Math.max(0, analysis.technicalScore));
    analysis.cultureFitScore = Math.min(100, Math.max(0, analysis.cultureFitScore));

    return analysis;
  } catch (error) {
    console.error("[AI Feedback] Error analyzing with Gemini:", error);
    throw new Error("Failed to analyze interview transcript with AI");
  }
}

/**
 * Calculate scores and recommendation
 */
function calculateScores(aiAnalysis: {
  communicationScore: number;
  technicalScore: number;
  cultureFitScore: number;
}): {
  overall: number;
  recommendation: "strong_hire" | "hire" | "maybe" | "no_hire";
} {
  // Weighted average: Communication 40%, Technical 40%, Culture Fit 20%
  const overall = Math.round(
    aiAnalysis.communicationScore * 0.4 +
      aiAnalysis.technicalScore * 0.4 +
      aiAnalysis.cultureFitScore * 0.2
  );

  // Map score to recommendation
  let recommendation: "strong_hire" | "hire" | "maybe" | "no_hire";
  if (overall >= 85) {
    recommendation = "strong_hire";
  } else if (overall >= 70) {
    recommendation = "hire";
  } else if (overall >= 50) {
    recommendation = "maybe";
  } else {
    recommendation = "no_hire";
  }

  return { overall, recommendation };
}

/**
 * Generate comprehensive interview feedback
 */
export async function generateInterviewFeedback(
  interviewId: string,
  applicationId: string,
  candidateId: string,
  transcriptEntries: TranscriptEntry[],
  jobDescription: string
): Promise<InterviewFeedback> {
  try {
    console.log(`[AI Feedback] Generating feedback for interview: ${interviewId}`);

    // Step 1: Calculate basic metrics
    const metrics = calculateMetrics(transcriptEntries);
    console.log(`[AI Feedback] Metrics calculated:`, metrics);

    // Step 2: Analyze with Gemini
    const aiAnalysis = await analyzeWithGemini(transcriptEntries, jobDescription);
    console.log(`[AI Feedback] Gemini analysis complete`);

    // Step 3: Calculate overall score and recommendation
    const scores = calculateScores(aiAnalysis);
    console.log(
      `[AI Feedback] Scores calculated: Overall ${scores.overall}, Recommendation: ${scores.recommendation}`
    );

    // Step 4: Build feedback document
    const feedbackId = `FEEDBACK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const feedback: InterviewFeedback = {
      feedbackId,
      sessionId: interviewId,
      interviewId,
      applicationId,
      candidateId,
      aiAnalysis: {
        overallScore: scores.overall,
        communicationScore: aiAnalysis.communicationScore,
        technicalScore: aiAnalysis.technicalScore,
        cultureFitScore: aiAnalysis.cultureFitScore,
        strengths: aiAnalysis.strengths,
        weaknesses: aiAnalysis.weaknesses,
        redFlags: aiAnalysis.redFlags,
        summary: aiAnalysis.summary,
        recommendation: scores.recommendation,
      },
      metrics,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log(`[AI Feedback] Feedback generated successfully: ${feedbackId}`);

    return feedback;
  } catch (error) {
    console.error(`[AI Feedback] Error generating feedback:`, error);
    throw error;
  }
}

/**
 * Generate fallback feedback (if AI fails)
 */
export function generateFallbackFeedback(
  interviewId: string,
  applicationId: string,
  candidateId: string,
  transcriptEntries: TranscriptEntry[]
): InterviewFeedback {
  const metrics = calculateMetrics(transcriptEntries);

  const feedbackId = `FEEDBACK-FALLBACK-${Date.now()}`;

  return {
    feedbackId,
    sessionId: interviewId,
    interviewId,
    applicationId,
    candidateId,
    aiAnalysis: {
      overallScore: 50,
      communicationScore: 50,
      technicalScore: 50,
      cultureFitScore: 50,
      strengths: ["Interview completed"],
      weaknesses: ["AI analysis unavailable - manual review required"],
      redFlags: [],
      summary:
        "Automated AI analysis failed. Please review the interview recording and transcript manually.",
      recommendation: "maybe",
    },
    metrics,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
