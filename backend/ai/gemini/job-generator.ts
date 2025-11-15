/**
 * Job Description Generator using Google Gemini
 *
 * Generates compelling job descriptions, requirements, and benefits
 * based on basic job information and company context
 */

import { getModelForUseCase, generateContent, generateJSON, countTokens, trackUsage } from "./client";

// Job generation input
export interface JobGenerationInput {
  title: string;
  department?: string;
  location?: string;
  type: "Full-time" | "Part-time" | "Contract" | "Internship";
  experienceLevel: "Entry Level" | "Mid Level" | "Senior" | "Lead" | "Executive";

  // Optional context
  companyName?: string;
  companyIndustry?: string;
  companyDescription?: string;
  teamSize?: number;
  reportingTo?: string;

  // Optional specifics
  primaryResponsibilities?: string[];
  requiredSkills?: string[];
  niceToHaveSkills?: string[];
  benefits?: string[];

  // Tone preferences
  tone?: "professional" | "friendly" | "casual" | "innovative";
}

// Generated job description
export interface GeneratedJobDescription {
  // Main description
  description: string; // Full job description (2-3 paragraphs)

  // Responsibilities
  responsibilities: string[]; // 5-8 bullet points

  // Requirements
  requiredQualifications: {
    education?: string;
    experience?: string;
    skills: string[];
    other?: string[];
  };

  // Nice to have
  preferredQualifications?: {
    skills: string[];
    experience?: string[];
    certifications?: string[];
  };

  // Benefits
  benefits?: string[];

  // Compensation (if applicable)
  compensationInfo?: string;

  // Company pitch
  whyJoinUs?: string; // 2-3 sentences

  // Equal opportunity statement
  eoStatement: string;
}

/**
 * System prompt for job description generation
 */
const JOB_GENERATION_PROMPT = `You are an expert recruiter and job description writer. Create compelling, detailed, and inclusive job descriptions that attract top talent.

GUIDELINES:
1. Description (2-3 paragraphs):
   - Start with an engaging hook about the role's impact
   - Explain the role's purpose and how it fits in the team
   - Highlight growth opportunities and exciting challenges

2. Responsibilities (5-8 bullet points):
   - Start with action verbs (Lead, Build, Design, Collaborate, etc.)
   - Be specific about deliverables and impact
   - Include both day-to-day and strategic tasks
   - Show variety and growth potential

3. Required Qualifications:
   - Be realistic - don't create impossible wish lists
   - Separate must-haves from nice-to-haves
   - Include specific technical skills with context
   - Mention soft skills that matter

4. Benefits:
   - Highlight unique perks
   - Include professional development opportunities
   - Mention work-life balance initiatives
   - Be specific and compelling

5. Tone:
   - Professional but approachable
   - Inclusive and welcoming
   - Enthusiastic about the opportunity
   - Authentic to the company culture

6. Equal Opportunity Statement:
   - Always include a strong diversity and inclusion statement
   - Make it genuine and meaningful

IMPORTANT:
- Avoid gendered language or bias
- Don't use "rockstar", "ninja", "guru" - use professional titles
- Be honest about requirements - don't inflate
- Make it scannable with clear sections
- Focus on "you will" not "the candidate will"

OUTPUT FORMAT:
Return ONLY valid JSON matching the GeneratedJobDescription interface.

JOB INFORMATION:
`;

/**
 * Generate complete job description
 */
export async function generateJobDescription(
  input: JobGenerationInput
): Promise<GeneratedJobDescription> {
  console.log(`Generating job description for ${input.title}`);

  try {
    // Get the job generation model (using Pro for better quality)
    const model = getModelForUseCase("jobGeneration");

    // Build the input context
    const contextText = buildJobContext(input);

    const fullPrompt = JOB_GENERATION_PROMPT + contextText;

    // Count tokens
    const tokenCount = await countTokens(model, fullPrompt);
    console.log(`Job generation token count: ${tokenCount}`);

    // Generate job description
    const jobDescription = await generateJSON<GeneratedJobDescription>(model, fullPrompt);

    // Track usage
    trackUsage(tokenCount);

    // Validate and enrich
    const enrichedDescription = validateAndEnrichJobDescription(jobDescription, input);

    console.log("Job description generated successfully");
    return enrichedDescription;
  } catch (error) {
    console.error("Error generating job description:", error);
    trackUsage(0, true);
    throw new Error(`Failed to generate job description: ${error}`);
  }
}

/**
 * Generate job description only (no requirements/benefits)
 */
export async function generateDescriptionOnly(
  input: JobGenerationInput
): Promise<string> {
  const prompt = `Write a compelling 2-3 paragraph job description for this role:

Title: ${input.title}
Department: ${input.department || "N/A"}
Experience Level: ${input.experienceLevel}
Company: ${input.companyName || "Our Company"}
Industry: ${input.companyIndustry || "N/A"}

${input.companyDescription ? `About the Company:\n${input.companyDescription}\n` : ""}

Focus on:
- The role's impact and importance
- What makes this opportunity exciting
- Growth and learning opportunities

Tone: ${input.tone || "professional"}

Return ONLY the description text, no JSON.`;

  try {
    const model = getModelForUseCase("jobGeneration");
    const description = await generateContent(model, prompt);
    return description.trim();
  } catch (error) {
    console.error("Error generating description:", error);
    return `We are looking for a talented ${input.title} to join our ${input.department || ""} team.`;
  }
}

/**
 * Suggest requirements based on job title
 */
export async function suggestRequirements(
  jobTitle: string,
  experienceLevel: string
): Promise<{
  skills: string[];
  education: string;
  experience: string;
}> {
  const prompt = `Suggest realistic job requirements for this role:

Title: ${jobTitle}
Experience Level: ${experienceLevel}

Provide:
1. Top 5-7 required technical skills
2. Education requirement
3. Years of experience requirement

Return as JSON with keys: skills (array), education (string), experience (string)`;

  try {
    const model = getModelForUseCase("jobGeneration");
    const requirements = await generateJSON<{
      skills: string[];
      education: string;
      experience: string;
    }>(model, prompt);
    return requirements;
  } catch (error) {
    console.error("Error suggesting requirements:", error);
    return {
      skills: [],
      education: "Bachelor's degree or equivalent experience",
      experience: "2-5 years of relevant experience",
    };
  }
}

/**
 * Generate benefits list
 */
export async function generateBenefits(
  companySize?: string,
  industry?: string
): Promise<string[]> {
  const prompt = `Generate a list of 8-10 compelling employee benefits for a company.

Company Size: ${companySize || "Medium"}
Industry: ${industry || "Technology"}

Include a mix of:
- Health and wellness benefits
- Professional development opportunities
- Work-life balance perks
- Financial benefits
- Unique perks that stand out

Return as JSON array of benefit descriptions.`;

  try {
    const model = getModelForUseCase("jobGeneration");
    const benefits = await generateJSON<string[]>(model, prompt);
    return benefits;
  } catch (error) {
    console.error("Error generating benefits:", error);
    return [
      "Competitive salary and equity",
      "Comprehensive health insurance",
      "401(k) matching",
      "Flexible work hours",
      "Professional development budget",
      "Remote work options",
    ];
  }
}

/**
 * Improve existing job description
 */
export async function improveJobDescription(
  existingDescription: string
): Promise<string> {
  const prompt = `Improve this job description to make it more compelling and inclusive:

CURRENT DESCRIPTION:
${existingDescription}

Improvements to make:
- Remove any biased or gendered language
- Make it more engaging and specific
- Add impact-focused language
- Improve clarity and scannability
- Ensure inclusive tone

Return ONLY the improved description text, no JSON.`;

  try {
    const model = getModelForUseCase("jobGeneration");
    const improved = await generateContent(model, prompt);
    return improved.trim();
  } catch (error) {
    console.error("Error improving job description:", error);
    return existingDescription;
  }
}

/**
 * Generate "Why Join Us" section
 */
export async function generateWhyJoinUs(
  companyName: string,
  companyDescription?: string,
  benefits?: string[]
): Promise<string> {
  const prompt = `Write a compelling "Why Join Us" section (2-3 sentences) for this company:

Company: ${companyName}
${companyDescription ? `Description: ${companyDescription}` : ""}
${benefits ? `Benefits: ${benefits.join(", ")}` : ""}

Make it enthusiastic but authentic. Focus on culture, growth, and unique aspects.

Return ONLY the text, no JSON.`;

  try {
    const model = getModelForUseCase("jobGeneration");
    const whyJoinUs = await generateContent(model, prompt);
    return whyJoinUs.trim();
  } catch (error) {
    console.error("Error generating why join us:", error);
    return `Join our team and be part of an innovative company where your work makes a real impact.`;
  }
}

/**
 * Helper: Build job context for prompt
 */
function buildJobContext(input: JobGenerationInput): string {
  return `
Title: ${input.title}
Department: ${input.department || "N/A"}
Location: ${input.location || "N/A"}
Type: ${input.type}
Experience Level: ${input.experienceLevel}
Tone: ${input.tone || "professional"}

${input.companyName ? `Company: ${input.companyName}` : ""}
${input.companyIndustry ? `Industry: ${input.companyIndustry}` : ""}
${input.companyDescription ? `\nCompany Description:\n${input.companyDescription}\n` : ""}

${input.teamSize ? `Team Size: ${input.teamSize}` : ""}
${input.reportingTo ? `Reports To: ${input.reportingTo}` : ""}

${input.primaryResponsibilities?.length ? `\nKey Responsibilities:\n${input.primaryResponsibilities.join("\n- ")}` : ""}

${input.requiredSkills?.length ? `\nRequired Skills:\n${input.requiredSkills.join(", ")}` : ""}
${input.niceToHaveSkills?.length ? `\nNice to Have:\n${input.niceToHaveSkills.join(", ")}` : ""}

${input.benefits?.length ? `\nBenefits to Highlight:\n${input.benefits.join("\n- ")}` : ""}
`.trim();
}

/**
 * Validate and enrich job description
 */
function validateAndEnrichJobDescription(
  description: any,
  input: JobGenerationInput
): GeneratedJobDescription {
  // Ensure EO statement exists
  const defaultEOStatement =
    "We are an equal opportunity employer and value diversity. We do not discriminate on the basis of race, religion, color, national origin, gender, sexual orientation, age, marital status, veteran status, or disability status.";

  return {
    description: description.description || `We are seeking a talented ${input.title} to join our team.`,
    responsibilities: Array.isArray(description.responsibilities)
      ? description.responsibilities
      : [],
    requiredQualifications: {
      education: description.requiredQualifications?.education,
      experience: description.requiredQualifications?.experience,
      skills: Array.isArray(description.requiredQualifications?.skills)
        ? description.requiredQualifications.skills
        : input.requiredSkills || [],
      other: description.requiredQualifications?.other,
    },
    preferredQualifications: description.preferredQualifications,
    benefits: Array.isArray(description.benefits)
      ? description.benefits
      : input.benefits,
    compensationInfo: description.compensationInfo,
    whyJoinUs: description.whyJoinUs,
    eoStatement: description.eoStatement || defaultEOStatement,
  };
}
