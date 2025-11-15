/**
 * Candidate Summarizer using Google Gemini
 *
 * Generates concise and detailed summaries of candidate profiles
 * Identifies key strengths, red flags, and provides recommendations
 */

import { getModelForUseCase, generateJSON, generateContent, countTokens, trackUsage } from "./client";
import type { ParsedResume } from "./resume-parser";
import type { JobRequirements, MatchResult } from "./job-matcher";

// Candidate summary structure
export interface CandidateSummary {
  // Quick overview
  oneLiner: string; // Max 100 chars, e.g., "5 years React dev with strong TS and leadership exp"

  // Executive summary
  executiveSummary: string; // 2-3 sentences, high-level overview

  // Detailed summary
  detailedSummary: string; // 2-3 paragraphs

  // Key strengths (3-5 points)
  strengths: string[];

  // Areas of concern or improvement (0-3 points)
  concerns?: string[];

  // Red flags (if any)
  redFlags?: string[];

  // Career highlights
  highlights: Array<{
    type: "achievement" | "skill" | "experience" | "education" | "certification";
    description: string;
    impact?: string;
  }>;

  // Fit assessment (if job context provided)
  fitAssessment?: {
    idealFor: string[]; // Types of roles this candidate is perfect for
    notSuitableFor: string[]; // Types of roles to avoid
    growthPotential: "High" | "Medium" | "Low";
    cultureFit: string; // Description of work culture they'd thrive in
  };

  // AI confidence
  confidence: number; // 0-100, how confident the AI is in this assessment
}

/**
 * System prompt for candidate summarization
 */
const SUMMARIZATION_PROMPT = `You are an expert recruiter creating compelling and accurate candidate summaries.

GUIDELINES:
1. One-Liner: Ultra-concise (max 100 chars), highlight top skill + years + standout quality
   Example: "8yr frontend eng, React/TS expert, built 3 prod apps, team lead"

2. Executive Summary: 2-3 sentences covering:
   - Current role and experience level
   - Key technical strengths
   - Notable achievements or unique value

3. Detailed Summary: 2-3 paragraphs covering:
   - Career progression and growth
   - Technical expertise and specializations
   - Soft skills and working style
   - Notable projects or achievements

4. Strengths: 3-5 bullet points of top strengths with specific evidence

5. Concerns: 0-3 bullet points of legitimate concerns (gaps, frequent job changes, etc.)

6. Red Flags: ONLY include serious issues (fabrication suspicion, unethical behavior, major gaps)

7. Highlights: 4-6 standout achievements/skills/experiences

8. Fit Assessment: Be specific about ideal roles and growth potential

IMPORTANT:
- Be objective and evidence-based
- Highlight unique differentiators
- Focus on impact and outcomes
- Be honest about concerns
- Only flag TRUE red flags, not minor issues
- Assess cultural fit based on work history patterns

OUTPUT FORMAT:
Return ONLY valid JSON matching the CandidateSummary interface structure.

CANDIDATE PROFILE:
`;

/**
 * Generate comprehensive candidate summary
 */
export async function generateCandidateSummary(
  candidate: ParsedResume,
  jobContext?: JobRequirements
): Promise<CandidateSummary> {
  console.log(`Generating summary for ${candidate.personalInfo.fullName}`);

  try {
    // Get the summarization model
    const model = getModelForUseCase("candidateSummarization");

    // Build candidate profile text
    const profileText = buildCandidateProfile(candidate);

    // Add job context if provided
    const contextText = jobContext
      ? `\n\nJOB CONTEXT (for fit assessment):\nTitle: ${jobContext.title}\nRequired Skills: ${jobContext.requiredSkills.join(", ")}\nExperience Level: ${jobContext.experienceLevel}`
      : "";

    const fullPrompt = SUMMARIZATION_PROMPT + profileText + contextText;

    // Count tokens
    const tokenCount = await countTokens(model, fullPrompt);
    console.log(`Candidate summarization token count: ${tokenCount}`);

    // Generate summary
    const summary = await generateJSON<CandidateSummary>(model, fullPrompt);

    // Track usage
    trackUsage(tokenCount);

    // Validate and clean
    const cleanedSummary = validateAndCleanSummary(summary, candidate);

    console.log("Candidate summary generated successfully");
    return cleanedSummary;
  } catch (error) {
    console.error("Error generating candidate summary:", error);
    trackUsage(0, true);
    throw new Error(`Failed to generate candidate summary: ${error}`);
  }
}

/**
 * Generate one-liner only (quick summary)
 */
export async function generateOneLiner(candidate: ParsedResume): Promise<string> {
  const prompt = `Create a compelling one-liner summary (max 100 characters) for this candidate:

Name: ${candidate.personalInfo.fullName}
Experience: ${candidate.totalExperienceYears} years
Career Level: ${candidate.careerLevel}
Top Skills: ${candidate.skills.technical.slice(0, 5).join(", ")}
Current Role: ${candidate.experience[0]?.title || "N/A"}

One-liner format: [years]yr [primary skill], [specialization], [standout achievement/quality]
Example: "8yr frontend eng, React/TS expert, built 3 prod apps, team lead"

Return ONLY the one-liner text, no JSON.`;

  try {
    const model = getModelForUseCase("candidateSummarization");
    const oneLiner = await generateContent(model, prompt);
    return oneLiner.trim();
  } catch (error) {
    console.error("Error generating one-liner:", error);
    return `${candidate.totalExperienceYears}yr ${candidate.careerLevel} - ${candidate.skills.technical[0] || "professional"}`;
  }
}

/**
 * Generate executive summary only
 */
export async function generateExecutiveSummary(
  candidate: ParsedResume
): Promise<string> {
  const prompt = `Create a 2-3 sentence executive summary for this candidate:

${buildCandidateProfile(candidate)}

Focus on: current role, years of experience, key strengths, notable achievements.
Return ONLY the executive summary text, no JSON.`;

  try {
    const model = getModelForUseCase("candidateSummarization");
    const summary = await generateContent(model, prompt);
    return summary.trim();
  } catch (error) {
    console.error("Error generating executive summary:", error);
    return `${candidate.personalInfo.fullName} is a ${candidate.careerLevel} professional with ${candidate.totalExperienceYears} years of experience.`;
  }
}

/**
 * Identify key strengths from resume
 */
export async function identifyStrengths(
  candidate: ParsedResume
): Promise<string[]> {
  const prompt = `Identify the top 5 key strengths of this candidate based on their resume.
Be specific and evidence-based.

${buildCandidateProfile(candidate)}

Return a JSON array of 5 strength statements.`;

  try {
    const model = getModelForUseCase("candidateSummarization");
    const strengths = await generateJSON<string[]>(model, prompt);
    return strengths;
  } catch (error) {
    console.error("Error identifying strengths:", error);
    return [
      `${candidate.totalExperienceYears} years of professional experience`,
      `Expertise in ${candidate.skills.technical.slice(0, 3).join(", ")}`,
      `${candidate.careerLevel} level professional`,
    ];
  }
}

/**
 * Detect potential red flags
 */
export async function detectRedFlags(candidate: ParsedResume): Promise<string[]> {
  const prompt = `Analyze this candidate's resume for potential red flags or concerns.

ONLY flag SERIOUS issues such as:
- Frequent job changes (>3 jobs in 2 years)
- Large unexplained gaps (>1 year)
- Inconsistent or suspicious information
- Lack of progression in career
- Skill misalignment with claimed roles

Do NOT flag minor issues. Be conservative.

${buildCandidateProfile(candidate)}

Return a JSON array of red flag descriptions. Return empty array if no red flags.`;

  try {
    const model = getModelForUseCase("candidateSummarization");
    const redFlags = await generateJSON<string[]>(model, prompt);
    return redFlags;
  } catch (error) {
    console.error("Error detecting red flags:", error);
    return [];
  }
}

/**
 * Assess culture fit based on work history
 */
export async function assessCultureFit(candidate: ParsedResume): Promise<string> {
  const prompt = `Based on this candidate's work history, describe the type of company culture and work environment where they would thrive.

Consider:
- Company sizes they've worked at
- Types of roles and responsibilities
- Industry experience
- Career progression patterns

${buildCandidateProfile(candidate)}

Return a 1-2 sentence description of ideal culture fit.`;

  try {
    const model = getModelForUseCase("candidateSummarization");
    const cultureFit = await generateContent(model, prompt);
    return cultureFit.trim();
  } catch (error) {
    console.error("Error assessing culture fit:", error);
    return "Suitable for various company cultures";
  }
}

/**
 * Generate comparison summary between multiple candidates
 */
export async function compareCandidates(
  candidates: ParsedResume[]
): Promise<string> {
  if (candidates.length < 2) {
    throw new Error("Need at least 2 candidates to compare");
  }

  const candidateSummaries = candidates
    .map((c, i) => {
      const allSkills = [...c.skills.technical, ...(c.skills.tools || [])];
      return `
Candidate ${i + 1}: ${c.personalInfo.fullName}
- Experience: ${c.totalExperienceYears} years
- Career Level: ${c.careerLevel}
- Top Skills: ${allSkills.slice(0, 5).join(", ")}
- Current Role: ${c.experience[0]?.title || "N/A"}
`;
    })
    .join("\n");

  const prompt = `Compare these ${candidates.length} candidates and provide a brief comparison highlighting:
1. Key differentiators
2. Relative strengths
3. Which candidate might be best for which scenarios

${candidateSummaries}

Provide a 3-4 sentence comparison.`;

  try {
    const model = getModelForUseCase("candidateSummarization");
    const comparison = await generateContent(model, prompt);
    return comparison.trim();
  } catch (error) {
    console.error("Error comparing candidates:", error);
    return "Unable to generate comparison";
  }
}

/**
 * Helper: Build candidate profile text for prompts
 */
function buildCandidateProfile(candidate: ParsedResume): string {
  const allSkills = [
    ...candidate.skills.technical,
    ...(candidate.skills.tools || []),
    ...(candidate.skills.frameworks || []),
  ];

  const experienceSummary = candidate.experience
    .map(
      (exp) =>
        `
- ${exp.title} at ${exp.company} (${exp.startDate} - ${exp.current ? "Present" : exp.endDate})
  ${exp.description}
  Key responsibilities: ${exp.responsibilities.slice(0, 3).join("; ")}
  ${exp.achievements ? `Achievements: ${exp.achievements.join("; ")}` : ""}`
    )
    .join("\n");

  const educationSummary = candidate.education
    .map(
      (edu) =>
        `- ${edu.degree} in ${edu.field} from ${edu.institution} ${edu.graduationDate ? `(${edu.graduationDate})` : ""}`
    )
    .join("\n");

  const certificationsSummary = candidate.certifications
    ? candidate.certifications
        .map((cert) => `- ${cert.name} from ${cert.issuer} ${cert.date ? `(${cert.date})` : ""}`)
        .join("\n")
    : "None";

  return `
Name: ${candidate.personalInfo.fullName}
Email: ${candidate.personalInfo.email}
Location: ${candidate.personalInfo.location || "N/A"}
LinkedIn: ${candidate.personalInfo.linkedIn || "N/A"}

Total Experience: ${candidate.totalExperienceYears} years
Career Level: ${candidate.careerLevel}
Industry Focus: ${candidate.industryFocus?.join(", ") || "N/A"}

Skills: ${allSkills.join(", ")}
Soft Skills: ${candidate.skills.soft.join(", ")}

Professional Summary:
${candidate.summary || "N/A"}

Work Experience:
${experienceSummary}

Education:
${educationSummary}

Certifications:
${certificationsSummary}

Projects:
${candidate.projects
      ?.map((p) => `- ${p.name}: ${p.description} (${p.technologies.join(", ")})`)
      .join("\n") || "None"}
`.trim();
}

/**
 * Validate and clean summary data
 */
function validateAndCleanSummary(
  summary: any,
  candidate: ParsedResume
): CandidateSummary {
  return {
    oneLiner:
      summary.oneLiner ||
      `${candidate.totalExperienceYears}yr ${candidate.skills.technical[0] || "professional"}`,
    executiveSummary:
      summary.executiveSummary ||
      `${candidate.personalInfo.fullName} is a ${candidate.careerLevel} professional with ${candidate.totalExperienceYears} years of experience.`,
    detailedSummary: summary.detailedSummary || summary.executiveSummary || "",
    strengths: Array.isArray(summary.strengths) ? summary.strengths : [],
    concerns: Array.isArray(summary.concerns) ? summary.concerns : undefined,
    redFlags: Array.isArray(summary.redFlags) && summary.redFlags.length > 0
      ? summary.redFlags
      : undefined,
    highlights: Array.isArray(summary.highlights) ? summary.highlights : [],
    fitAssessment: summary.fitAssessment,
    confidence: Math.max(0, Math.min(100, summary.confidence || 75)),
  };
}
