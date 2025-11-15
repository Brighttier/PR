/**
 * Interview Scoring Service using Google Gemini
 *
 * Scores interviews based on technical skills, soft skills,
 * and overall performance. Generates hiring recommendations.
 */

import { getModelForUseCase, generateJSON, trackUsage } from "./client";
import type { TranscriptEntry, TranscriptAnalysis } from "./transcript-analyzer";
import type { ParsedResume } from "./resume-parser";
import type { JobRequirements } from "./job-matcher";

// Skill score
export interface SkillScore {
  skill: string;
  score: number; // 0-10
  evidence: string[]; // Quotes from transcript demonstrating skill
  assessment: string; // Brief assessment of proficiency
}

// Soft skill score
export interface SoftSkillScore {
  skill: string;
  score: number; // 0-10
  description: string;
}

// Technical assessment
export interface TechnicalAssessment {
  overallScore: number; // 0-10
  skillScores: SkillScore[];
  technicalKnowledge: number; // 0-10
  problemSolvingAbility: number; // 0-10
  technicalCommunication: number; // 0-10
  summary: string;
}

// Soft skills assessment
export interface SoftSkillsAssessment {
  overallScore: number; // 0-10
  communication: SoftSkillScore;
  cultureFit: SoftSkillScore;
  enthusiasm: SoftSkillScore;
  professionalism: SoftSkillScore;
  adaptability: SoftSkillScore;
  summary: string;
}

// Overall interview score
export interface InterviewScore {
  // Component scores
  technicalAssessment: TechnicalAssessment;
  softSkillsAssessment: SoftSkillsAssessment;

  // Overall scores
  overallScore: number; // 0-10
  technicalScore: number; // 0-10 (weighted from technical assessment)
  softSkillsScore: number; // 0-10 (weighted from soft skills assessment)

  // Confidence level
  confidenceLevel: number; // 0-1 (how confident we are in this assessment)

  // Recommendation
  recommendation: "Strong Hire" | "Hire" | "Consider" | "Do Not Hire";
  recommendationRationale: string;

  // Comparison
  percentile?: number; // Where this candidate ranks compared to others (0-100)

  // Summary
  summary: string; // 2-3 paragraphs
}

// Comparison data for percentile calculation
export interface ComparisonData {
  jobId: string;
  candidateScores: number[]; // Scores of other candidates for this job
}

/**
 * Score complete interview
 */
export async function scoreInterview(
  transcript: TranscriptEntry[],
  transcriptAnalysis: TranscriptAnalysis,
  jobRequirements: JobRequirements,
  candidateResume?: ParsedResume,
  comparisonData?: ComparisonData
): Promise<InterviewScore> {
  console.log("Scoring interview based on transcript and analysis");

  try {
    const model = getModelForUseCase("interviewScoring");

    // Score technical skills
    const technicalAssessment = await scoreTechnicalSkills(
      transcript,
      jobRequirements,
      transcriptAnalysis
    );

    // Score soft skills
    const softSkillsAssessment = await scoreSoftSkills(transcript, transcriptAnalysis);

    // Calculate overall score (weighted average)
    const technicalScore = technicalAssessment.overallScore;
    const softSkillsScore = softSkillsAssessment.overallScore;

    // Weight: 60% technical, 40% soft skills
    const overallScore = technicalScore * 0.6 + softSkillsScore * 0.4;

    // Calculate confidence level
    const confidenceLevel = calculateConfidenceLevel(transcriptAnalysis);

    // Generate recommendation
    const recommendation = generateRecommendation(overallScore);
    const recommendationRationale = await generateRecommendationRationale(
      overallScore,
      technicalAssessment,
      softSkillsAssessment,
      transcriptAnalysis
    );

    // Calculate percentile if comparison data available
    const percentile = comparisonData
      ? calculatePercentile(overallScore, comparisonData.candidateScores)
      : undefined;

    // Generate overall summary
    const summary = await generateInterviewSummary(
      transcript,
      technicalAssessment,
      softSkillsAssessment,
      transcriptAnalysis
    );

    const score: InterviewScore = {
      technicalAssessment,
      softSkillsAssessment,
      overallScore,
      technicalScore,
      softSkillsScore,
      confidenceLevel,
      recommendation,
      recommendationRationale,
      percentile,
      summary,
    };

    console.log(`Interview scored: ${overallScore.toFixed(1)}/10 - ${recommendation}`);
    return score;
  } catch (error) {
    console.error("Error scoring interview:", error);
    trackUsage(0, true);
    throw new Error(`Failed to score interview: ${error}`);
  }
}

/**
 * Score technical skills
 */
export async function scoreTechnicalSkills(
  transcript: TranscriptEntry[],
  jobRequirements: JobRequirements,
  transcriptAnalysis: TranscriptAnalysis
): Promise<TechnicalAssessment> {
  console.log("Scoring technical skills");

  try {
    const model = getModelForUseCase("interviewScoring");

    const transcriptText = formatTranscript(transcript);
    const requiredSkills = jobRequirements.requiredSkills || [];

    const prompt = `Score the candidate's TECHNICAL SKILLS based on this interview transcript.

JOB REQUIREMENTS:
Required Skills: ${requiredSkills.join(", ")}
Experience Level: ${jobRequirements.experienceLevel}
Job Title: ${jobRequirements.title}

For each required skill, provide:
- skill name
- score (0-10, where 0 = no knowledge, 10 = expert)
- evidence (quotes from transcript demonstrating this skill)
- assessment (brief evaluation of proficiency)

Also evaluate:
- technicalKnowledge (0-10): Overall depth of technical knowledge
- problemSolvingAbility (0-10): Ability to solve technical problems
- technicalCommunication (0-10): Ability to explain technical concepts

Calculate overallScore (0-10) as weighted average.

Provide a summary (2-3 sentences) of technical assessment.

Return as JSON with this structure:
{
  "overallScore": 7.5,
  "skillScores": [
    {
      "skill": "React",
      "score": 8,
      "evidence": ["quote 1", "quote 2"],
      "assessment": "Strong understanding of React..."
    }
  ],
  "technicalKnowledge": 7,
  "problemSolvingAbility": 8,
  "technicalCommunication": 7,
  "summary": "Candidate demonstrated..."
}

TRANSCRIPT:
${transcriptText}

TRANSCRIPT ANALYSIS SUMMARY:
Topics discussed: ${transcriptAnalysis.topicAnalysis.topics.join(", ")}
Technical terms mentioned: ${transcriptAnalysis.topicAnalysis.technicalTerms.join(", ")}
Strengths: ${transcriptAnalysis.strengths.map((s) => s.type).join(", ")}`;

    const assessment = await generateJSON<TechnicalAssessment>(model, prompt);

    // Validate scores
    assessment.overallScore = clampScore(assessment.overallScore);
    assessment.technicalKnowledge = clampScore(assessment.technicalKnowledge);
    assessment.problemSolvingAbility = clampScore(assessment.problemSolvingAbility);
    assessment.technicalCommunication = clampScore(assessment.technicalCommunication);

    assessment.skillScores.forEach((skill) => {
      skill.score = clampScore(skill.score);
    });

    console.log(`Technical score: ${assessment.overallScore.toFixed(1)}/10`);
    return assessment;
  } catch (error) {
    console.error("Error scoring technical skills:", error);
    // Return default assessment
    return {
      overallScore: 5,
      skillScores: [],
      technicalKnowledge: 5,
      problemSolvingAbility: 5,
      technicalCommunication: 5,
      summary: "Unable to assess technical skills.",
    };
  }
}

/**
 * Score soft skills
 */
export async function scoreSoftSkills(
  transcript: TranscriptEntry[],
  transcriptAnalysis: TranscriptAnalysis
): Promise<SoftSkillsAssessment> {
  console.log("Scoring soft skills");

  try {
    const model = getModelForUseCase("interviewScoring");
    const transcriptText = formatTranscript(transcript);

    const prompt = `Evaluate the candidate's SOFT SKILLS based on this interview transcript.

Score each soft skill (0-10):

1. **Communication**: Clarity, articulation, listening
2. **Culture Fit**: Alignment with professional culture, values
3. **Enthusiasm**: Passion for role, motivation, energy
4. **Professionalism**: Appropriate demeanor, respect, preparedness
5. **Adaptability**: Flexibility, learning ability, open-mindedness

For each skill, provide:
- score (0-10)
- description (2-3 sentences explaining the score)

Calculate overallScore (0-10) as average of all soft skills.

Provide a summary (2-3 sentences) of soft skills assessment.

Return as JSON:
{
  "overallScore": 7.5,
  "communication": {
    "skill": "Communication",
    "score": 8,
    "description": "Candidate communicated clearly..."
  },
  "cultureFit": { ... },
  "enthusiasm": { ... },
  "professionalism": { ... },
  "adaptability": { ... },
  "summary": "Candidate demonstrated..."
}

TRANSCRIPT:
${transcriptText}

ANALYSIS INSIGHTS:
Overall sentiment: ${transcriptAnalysis.overallSentiment}
Hesitations: ${transcriptAnalysis.hesitationAnalysis.hesitationCount}
Strengths: ${transcriptAnalysis.strengths.map((s) => s.description).join("; ")}
Red flags: ${transcriptAnalysis.redFlags.map((r) => r.description).join("; ")}`;

    const assessment = await generateJSON<SoftSkillsAssessment>(model, prompt);

    // Validate scores
    assessment.overallScore = clampScore(assessment.overallScore);
    assessment.communication.score = clampScore(assessment.communication.score);
    assessment.cultureFit.score = clampScore(assessment.cultureFit.score);
    assessment.enthusiasm.score = clampScore(assessment.enthusiasm.score);
    assessment.professionalism.score = clampScore(assessment.professionalism.score);
    assessment.adaptability.score = clampScore(assessment.adaptability.score);

    console.log(`Soft skills score: ${assessment.overallScore.toFixed(1)}/10`);
    return assessment;
  } catch (error) {
    console.error("Error scoring soft skills:", error);
    // Return default assessment
    return {
      overallScore: 5,
      communication: { skill: "Communication", score: 5, description: "Unable to assess." },
      cultureFit: { skill: "Culture Fit", score: 5, description: "Unable to assess." },
      enthusiasm: { skill: "Enthusiasm", score: 5, description: "Unable to assess." },
      professionalism: { skill: "Professionalism", score: 5, description: "Unable to assess." },
      adaptability: { skill: "Adaptability", score: 5, description: "Unable to assess." },
      summary: "Unable to assess soft skills.",
    };
  }
}

/**
 * Generate overall recommendation
 */
export function generateRecommendation(
  overallScore: number
): "Strong Hire" | "Hire" | "Consider" | "Do Not Hire" {
  if (overallScore >= 8.5) {
    return "Strong Hire";
  } else if (overallScore >= 7.0) {
    return "Hire";
  } else if (overallScore >= 5.5) {
    return "Consider";
  } else {
    return "Do Not Hire";
  }
}

/**
 * Generate recommendation rationale
 */
async function generateRecommendationRationale(
  overallScore: number,
  technicalAssessment: TechnicalAssessment,
  softSkillsAssessment: SoftSkillsAssessment,
  transcriptAnalysis: TranscriptAnalysis
): Promise<string> {
  const recommendation = generateRecommendation(overallScore);

  const strengths = transcriptAnalysis.strengths.map((s) => s.description).join("; ");
  const concerns = transcriptAnalysis.redFlags.map((r) => r.description).join("; ");

  const rationale = `Recommendation: ${recommendation} (Score: ${overallScore.toFixed(1)}/10)

Technical Performance: ${technicalAssessment.overallScore.toFixed(1)}/10 - ${technicalAssessment.summary}

Soft Skills: ${softSkillsAssessment.overallScore.toFixed(1)}/10 - ${softSkillsAssessment.summary}

Key Strengths: ${strengths || "None identified"}

Concerns: ${concerns || "None identified"}`;

  return rationale.trim();
}

/**
 * Calculate confidence level
 */
function calculateConfidenceLevel(transcriptAnalysis: TranscriptAnalysis): number {
  // Confidence based on:
  // - Average STT confidence
  // - Number of transcript entries (more data = more confident)
  // - Clarity of responses

  const avgConfidence = transcriptAnalysis.averageConfidence || 0.9;
  const hesitationPenalty = Math.min(transcriptAnalysis.hesitationAnalysis.hesitationCount * 0.01, 0.2);

  let confidence = avgConfidence - hesitationPenalty;
  confidence = Math.max(0.5, Math.min(1.0, confidence)); // Clamp between 0.5 and 1.0

  return confidence;
}

/**
 * Calculate percentile ranking
 */
function calculatePercentile(candidateScore: number, otherScores: number[]): number {
  if (otherScores.length === 0) {
    return 50; // No comparison data, return median
  }

  const lowerScores = otherScores.filter((score) => score < candidateScore).length;
  const percentile = (lowerScores / otherScores.length) * 100;

  return Math.round(percentile);
}

/**
 * Compare candidate to others
 */
export async function compareToOtherCandidates(
  candidateScore: InterviewScore,
  otherCandidates: InterviewScore[]
): Promise<{
  percentile: number;
  ranking: number;
  totalCandidates: number;
  comparison: string;
}> {
  const allScores = otherCandidates.map((c) => c.overallScore);
  const candidateOverallScore = candidateScore.overallScore;

  const percentile = calculatePercentile(candidateOverallScore, allScores);

  // Calculate ranking (1 = best)
  const betterCandidates = otherCandidates.filter(
    (c) => c.overallScore > candidateOverallScore
  ).length;
  const ranking = betterCandidates + 1;

  const totalCandidates = otherCandidates.length + 1;

  let comparison = "";
  if (percentile >= 90) {
    comparison = "Top 10% of candidates";
  } else if (percentile >= 75) {
    comparison = "Top 25% of candidates";
  } else if (percentile >= 50) {
    comparison = "Above average candidate";
  } else if (percentile >= 25) {
    comparison = "Below average candidate";
  } else {
    comparison = "Bottom 25% of candidates";
  }

  return {
    percentile,
    ranking,
    totalCandidates,
    comparison,
  };
}

/**
 * Generate overall interview summary
 */
async function generateInterviewSummary(
  transcript: TranscriptEntry[],
  technicalAssessment: TechnicalAssessment,
  softSkillsAssessment: SoftSkillsAssessment,
  transcriptAnalysis: TranscriptAnalysis
): Promise<string> {
  const model = getModelForUseCase("interviewScoring");

  const prompt = `Generate a comprehensive interview SUMMARY (2-3 paragraphs) based on this assessment.

Include:
- Overall performance
- Technical strengths and weaknesses
- Soft skills evaluation
- Key highlights from the interview
- Hiring recommendation context

Technical Score: ${technicalAssessment.overallScore}/10
${technicalAssessment.summary}

Soft Skills Score: ${softSkillsAssessment.overallScore}/10
${softSkillsAssessment.summary}

Key Moments: ${transcriptAnalysis.keyMoments.map((m) => m.description).join("; ")}
Strengths: ${transcriptAnalysis.strengths.map((s) => s.description).join("; ")}
Concerns: ${transcriptAnalysis.redFlags.map((r) => r.description).join("; ")}`;

  try {
    const summary = await model.generateContent(prompt);
    return summary.response.text().trim();
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Unable to generate interview summary.";
  }
}

/**
 * Format transcript for analysis
 */
function formatTranscript(transcript: TranscriptEntry[]): string {
  return transcript
    .map((entry) => {
      const speaker = entry.speaker === "ai" ? "INTERVIEWER" : "CANDIDATE";
      return `${speaker}: ${entry.text}`;
    })
    .join("\n\n");
}

/**
 * Clamp score between 0 and 10
 */
function clampScore(score: number): number {
  return Math.max(0, Math.min(10, score));
}
