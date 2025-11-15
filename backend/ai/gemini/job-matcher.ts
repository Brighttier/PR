/**
 * Job Matcher using Google Gemini
 *
 * Calculates match scores between candidates and job requirements
 * Provides detailed analysis of skills gaps and recommendations
 */

import { getModelForUseCase, generateJSON, countTokens, trackUsage } from "./client";
import type { ParsedResume } from "./resume-parser";

// Job requirements structure
export interface JobRequirements {
  title: string;
  department?: string;
  location?: string;
  type: "Full-time" | "Part-time" | "Contract" | "Internship";
  experienceLevel: "Entry Level" | "Mid Level" | "Senior" | "Lead" | "Executive";
  description: string;

  // Required qualifications
  requiredSkills: string[];
  preferredSkills?: string[];
  requiredEducation?: string;
  requiredExperience?: number; // years

  // Job details
  responsibilities?: string[];
  benefits?: string[];
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
}

// Match result structure
export interface MatchResult {
  overallScore: number; // 0-100
  recommendation: "Fast Track" | "Strong Candidate" | "Worth Reviewing" | "Marginal Fit" | "Not Recommended";

  // Detailed scoring
  scores: {
    skillsMatch: number; // 0-100
    experienceMatch: number; // 0-100
    educationMatch: number; // 0-100
    careerLevelMatch: number; // 0-100
    industryMatch: number; // 0-100
  };

  // Skills analysis
  skillsAnalysis: {
    matchedSkills: string[];
    missingRequiredSkills: string[];
    missingPreferredSkills: string[];
    additionalSkills: string[];
    skillsMatchPercentage: number;
  };

  // Experience analysis
  experienceAnalysis: {
    candidateYears: number;
    requiredYears: number;
    meetsRequirement: boolean;
    relevantExperience: string[];
  };

  // Education analysis
  educationAnalysis: {
    meetsRequirement: boolean;
    candidateDegrees: string[];
    requiredDegree?: string;
  };

  // Strengths and concerns
  strengths: string[];
  concerns: string[];
  redFlags?: string[];

  // One-liner summary
  oneLiner: string;

  // Detailed reasoning
  reasoning: string;
}

/**
 * System prompt for job matching
 */
const JOB_MATCHING_PROMPT = `You are an expert recruiter and talent matcher. Analyze the candidate's resume against the job requirements and provide a detailed match assessment.

SCORING CRITERIA:
1. Skills Match (40% weight)
   - Required skills: Missing any = major penalty
   - Preferred skills: Bonus points
   - Additional relevant skills: Minor bonus

2. Experience Match (30% weight)
   - Years of experience vs required
   - Relevance of previous roles
   - Industry experience

3. Education Match (15% weight)
   - Degree level and field
   - Relevant certifications

4. Career Level Match (10% weight)
   - Entry/Mid/Senior/Lead/Executive alignment

5. Industry Match (5% weight)
   - Relevant industry experience

RECOMMENDATION GUIDELINES:
- Fast Track (90-100): Exceptional match, hire immediately
- Strong Candidate (70-89): Very good match, priority interview
- Worth Reviewing (50-69): Decent match, consider for interview
- Marginal Fit (30-49): Weak match, low priority
- Not Recommended (0-29): Poor match, likely reject

IMPORTANT:
- Be objective and data-driven
- Identify specific strengths and concerns
- Flag any red flags (job hopping, skill gaps, etc.)
- Provide actionable reasoning
- Generate a compelling one-liner summary

OUTPUT FORMAT:
Return ONLY valid JSON matching the MatchResult interface structure.

JOB REQUIREMENTS:
`;

/**
 * Calculate match score between candidate and job
 */
export async function calculateMatchScore(
  candidate: ParsedResume,
  job: JobRequirements
): Promise<MatchResult> {
  console.log(`Calculating match score for ${candidate.personalInfo.fullName} - ${job.title}`);

  try {
    // Get the job matching model
    const model = getModelForUseCase("jobMatching");

    // Build the prompt
    const candidateSummary = summarizeCandidate(candidate);
    const jobSummary = summarizeJob(job);

    const fullPrompt = `${JOB_MATCHING_PROMPT}
${jobSummary}

CANDIDATE PROFILE:
${candidateSummary}

Analyze this match and provide a detailed assessment.`;

    // Count tokens
    const tokenCount = await countTokens(model, fullPrompt);
    console.log(`Job matching token count: ${tokenCount}`);

    // Generate match result
    const matchResult = await generateJSON<MatchResult>(model, fullPrompt);

    // Track usage
    trackUsage(tokenCount);

    // Validate and enrich the result
    const enrichedResult = validateAndEnrichMatch(matchResult, candidate, job);

    console.log(`Match score calculated: ${enrichedResult.overallScore}%`);
    return enrichedResult;
  } catch (error) {
    console.error("Error calculating match score:", error);
    trackUsage(0, true);
    throw new Error(`Failed to calculate match score: ${error}`);
  }
}

/**
 * Generate AI recommendation based on match score
 */
export function generateRecommendation(score: number): MatchResult["recommendation"] {
  if (score >= 90) return "Fast Track";
  if (score >= 70) return "Strong Candidate";
  if (score >= 50) return "Worth Reviewing";
  if (score >= 30) return "Marginal Fit";
  return "Not Recommended";
}

/**
 * Analyze skills gap between candidate and job
 */
export function analyzeSkillsGap(
  candidateSkills: string[],
  requiredSkills: string[],
  preferredSkills: string[] = []
): MatchResult["skillsAnalysis"] {
  // Normalize skills for comparison (lowercase, trim)
  const normalizeCandidateSkills = candidateSkills.map((s) => s.toLowerCase().trim());
  const normalizeRequiredSkills = requiredSkills.map((s) => s.toLowerCase().trim());
  const normalizePreferredSkills = preferredSkills.map((s) => s.toLowerCase().trim());

  // Find matched required skills
  const matchedSkills = normalizeRequiredSkills.filter((skill) =>
    normalizeCandidateSkills.some((cs) => cs.includes(skill) || skill.includes(cs))
  );

  // Find missing required skills
  const missingRequiredSkills = normalizeRequiredSkills.filter(
    (skill) => !matchedSkills.includes(skill)
  );

  // Find missing preferred skills
  const missingPreferredSkills = normalizePreferredSkills.filter(
    (skill) =>
      !normalizeCandidateSkills.some((cs) => cs.includes(skill) || skill.includes(cs))
  );

  // Find additional skills candidate has
  const additionalSkills = normalizeCandidateSkills.filter(
    (skill) =>
      !normalizeRequiredSkills.includes(skill) &&
      !normalizePreferredSkills.includes(skill)
  );

  // Calculate match percentage
  const skillsMatchPercentage =
    normalizeRequiredSkills.length > 0
      ? Math.round((matchedSkills.length / normalizeRequiredSkills.length) * 100)
      : 100;

  return {
    matchedSkills,
    missingRequiredSkills,
    missingPreferredSkills,
    additionalSkills: additionalSkills.slice(0, 10), // Limit to top 10
    skillsMatchPercentage,
  };
}

/**
 * Batch calculate match scores for multiple jobs
 */
export async function batchCalculateMatches(
  candidate: ParsedResume,
  jobs: JobRequirements[]
): Promise<MatchResult[]> {
  const results: MatchResult[] = [];

  for (const job of jobs) {
    try {
      const match = await calculateMatchScore(candidate, job);
      results.push(match);

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Error matching with job ${job.title}:`, error);
      // Continue with other jobs
    }
  }

  // Sort by score descending
  return results.sort((a, b) => b.overallScore - a.overallScore);
}

/**
 * Find best matching jobs for a candidate
 */
export async function findBestMatchingJobs(
  candidate: ParsedResume,
  jobs: JobRequirements[],
  topN: number = 5
): Promise<Array<{ job: JobRequirements; match: MatchResult }>> {
  const matches = await batchCalculateMatches(candidate, jobs);

  return matches
    .slice(0, topN)
    .map((match, index) => ({
      job: jobs[index],
      match,
    }));
}

/**
 * Helper: Summarize candidate for prompt
 */
function summarizeCandidate(candidate: ParsedResume): string {
  const allSkills = [
    ...candidate.skills.technical,
    ...(candidate.skills.tools || []),
    ...(candidate.skills.frameworks || []),
  ];

  const experienceSummary = candidate.experience
    .map(
      (exp) =>
        `- ${exp.title} at ${exp.company} (${exp.startDate} - ${exp.current ? "Present" : exp.endDate})`
    )
    .join("\n");

  const educationSummary = candidate.education
    .map((edu) => `- ${edu.degree} in ${edu.field} from ${edu.institution}`)
    .join("\n");

  return `
Name: ${candidate.personalInfo.fullName}
Total Experience: ${candidate.totalExperienceYears} years
Career Level: ${candidate.careerLevel}

Skills: ${allSkills.join(", ")}

Experience:
${experienceSummary}

Education:
${educationSummary}

Summary: ${candidate.summary || "N/A"}
`.trim();
}

/**
 * Helper: Summarize job for prompt
 */
function summarizeJob(job: JobRequirements): string {
  return `
Title: ${job.title}
Department: ${job.department || "N/A"}
Type: ${job.type}
Experience Level: ${job.experienceLevel}
Required Experience: ${job.requiredExperience || "N/A"} years

Required Skills: ${job.requiredSkills.join(", ")}
Preferred Skills: ${job.preferredSkills?.join(", ") || "N/A"}
Required Education: ${job.requiredEducation || "N/A"}

Description:
${job.description}

Responsibilities:
${job.responsibilities?.join("\n- ") || "N/A"}
`.trim();
}

/**
 * Validate and enrich match result
 */
function validateAndEnrichMatch(
  result: any,
  candidate: ParsedResume,
  job: JobRequirements
): MatchResult {
  // Ensure scores are within 0-100
  const clampScore = (score: number) => Math.max(0, Math.min(100, score || 0));

  const enriched: MatchResult = {
    overallScore: clampScore(result.overallScore),
    recommendation:
      result.recommendation || generateRecommendation(result.overallScore),
    scores: {
      skillsMatch: clampScore(result.scores?.skillsMatch),
      experienceMatch: clampScore(result.scores?.experienceMatch),
      educationMatch: clampScore(result.scores?.educationMatch),
      careerLevelMatch: clampScore(result.scores?.careerLevelMatch),
      industryMatch: clampScore(result.scores?.industryMatch),
    },
    skillsAnalysis:
      result.skillsAnalysis ||
      analyzeSkillsGap(
        [...candidate.skills.technical, ...(candidate.skills.tools || [])],
        job.requiredSkills,
        job.preferredSkills
      ),
    experienceAnalysis: result.experienceAnalysis || {
      candidateYears: candidate.totalExperienceYears,
      requiredYears: job.requiredExperience || 0,
      meetsRequirement:
        candidate.totalExperienceYears >= (job.requiredExperience || 0),
      relevantExperience: candidate.experience.map((exp) => exp.title),
    },
    educationAnalysis: result.educationAnalysis || {
      meetsRequirement: true, // Default to true if not specified
      candidateDegrees: candidate.education.map((edu) => edu.degree),
      requiredDegree: job.requiredEducation,
    },
    strengths: result.strengths || [],
    concerns: result.concerns || [],
    redFlags: result.redFlags,
    oneLiner:
      result.oneLiner ||
      `${candidate.personalInfo.fullName} - ${candidate.totalExperienceYears} years experience`,
    reasoning: result.reasoning || "Match assessment completed.",
  };

  return enriched;
}
