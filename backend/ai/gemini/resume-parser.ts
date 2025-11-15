/**
 * Resume Parser using Google Gemini
 *
 * Extracts structured data from resume text/PDF using Gemini AI
 */

import { getModelForUseCase, generateJSON, countTokens, trackUsage } from "./client";

// Resume data structure
export interface ParsedResume {
  // Personal Information
  personalInfo: {
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    linkedIn?: string;
    github?: string;
    portfolio?: string;
  };

  // Professional Summary
  summary?: string;

  // Work Experience
  experience: Array<{
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string; // null if current
    current: boolean;
    description: string;
    responsibilities: string[];
    achievements?: string[];
  }>;

  // Education
  education: Array<{
    degree: string;
    field: string;
    institution: string;
    location?: string;
    graduationDate?: string;
    gpa?: string;
    honors?: string[];
  }>;

  // Skills
  skills: {
    technical: string[];
    soft: string[];
    languages?: Array<{
      language: string;
      proficiency: string;
    }>;
    tools?: string[];
    frameworks?: string[];
  };

  // Certifications
  certifications?: Array<{
    name: string;
    issuer: string;
    date?: string;
    expiryDate?: string;
    credentialId?: string;
  }>;

  // Projects (if any)
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    startDate?: string;
    endDate?: string;
  }>;

  // Additional Information
  totalExperienceYears: number;
  industryFocus?: string[];
  careerLevel?: "entry" | "mid" | "senior" | "lead" | "executive";
}

/**
 * System prompt for resume parsing
 */
const RESUME_PARSING_PROMPT = `You are an expert resume parser. Extract all relevant information from the provided resume text into a structured JSON format.

INSTRUCTIONS:
1. Extract ALL personal information (name, email, phone, LinkedIn, GitHub, etc.)
2. Parse work experience with exact dates, company names, and detailed responsibilities
3. Extract education history with degrees, institutions, and dates
4. Identify ALL technical skills, soft skills, tools, and frameworks mentioned
5. Extract certifications with issuing organizations and dates
6. Identify personal or academic projects if mentioned
7. Calculate total years of professional experience
8. Infer career level based on experience and roles

IMPORTANT:
- Use ISO date format (YYYY-MM-DD) for all dates
- If a date is approximate or only year/month, use "YYYY-MM" or "YYYY"
- Mark current positions with "current: true" and no endDate
- Categorize skills into technical vs soft skills appropriately
- Be thorough - don't skip any information
- If information is not present, omit the field rather than guessing

OUTPUT FORMAT:
Return ONLY valid JSON matching the ParsedResume interface structure.
Do not include any explanations or additional text.

RESUME TEXT:
`;

/**
 * Parse resume text and extract structured data
 */
export async function parseResume(resumeText: string): Promise<ParsedResume> {
  console.log("Starting resume parsing...");

  try {
    // Get the resume parsing model
    const model = getModelForUseCase("resumeParsing");

    // Count tokens for tracking
    const tokenCount = await countTokens(model, RESUME_PARSING_PROMPT + resumeText);
    console.log(`Resume parsing token count: ${tokenCount}`);

    // Build the full prompt
    const fullPrompt = RESUME_PARSING_PROMPT + resumeText;

    // Generate structured output
    const parsedData = await generateJSON<ParsedResume>(model, fullPrompt);

    // Track usage
    trackUsage(tokenCount);

    // Validate and clean the data
    const cleanedData = validateAndCleanResumeData(parsedData);

    console.log("Resume parsing completed successfully");
    return cleanedData;
  } catch (error) {
    console.error("Error parsing resume:", error);
    trackUsage(0, true);
    throw new Error(`Failed to parse resume: ${error}`);
  }
}

/**
 * Extract skills from resume (quick extraction without full parsing)
 */
export async function extractSkills(resumeText: string): Promise<string[]> {
  const prompt = `Extract ALL technical skills, programming languages, frameworks, and tools mentioned in this resume.

Return a JSON array of skill names (strings only).

RESUME TEXT:
${resumeText}`;

  try {
    const model = getModelForUseCase("resumeParsing");
    const skills = await generateJSON<string[]>(model, prompt);
    return skills;
  } catch (error) {
    console.error("Error extracting skills:", error);
    return [];
  }
}

/**
 * Extract work experience only
 */
export async function extractExperience(
  resumeText: string
): Promise<ParsedResume["experience"]> {
  const prompt = `Extract ONLY the work experience section from this resume.

Return a JSON array of work experience objects with: title, company, location, startDate, endDate, current, description, responsibilities.

RESUME TEXT:
${resumeText}`;

  try {
    const model = getModelForUseCase("resumeParsing");
    const experience = await generateJSON<ParsedResume["experience"]>(model, prompt);
    return experience;
  } catch (error) {
    console.error("Error extracting experience:", error);
    return [];
  }
}

/**
 * Extract education only
 */
export async function extractEducation(
  resumeText: string
): Promise<ParsedResume["education"]> {
  const prompt = `Extract ONLY the education section from this resume.

Return a JSON array of education objects with: degree, field, institution, location, graduationDate, gpa, honors.

RESUME TEXT:
${resumeText}`;

  try {
    const model = getModelForUseCase("resumeParsing");
    const education = await generateJSON<ParsedResume["education"]>(model, prompt);
    return education;
  } catch (error) {
    console.error("Error extracting education:", error);
    return [];
  }
}

/**
 * Calculate total years of experience from parsed resume
 */
export function calculateTotalExperience(
  experience: ParsedResume["experience"]
): number {
  let totalMonths = 0;

  experience.forEach((job) => {
    const start = new Date(job.startDate);
    const end = job.current ? new Date() : new Date(job.endDate || Date.now());

    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());

    totalMonths += months;
  });

  return Math.round((totalMonths / 12) * 10) / 10; // Round to 1 decimal
}

/**
 * Infer career level from experience
 */
export function inferCareerLevel(
  totalYears: number,
  experience: ParsedResume["experience"]
): ParsedResume["careerLevel"] {
  // Check for executive/leadership titles
  const hasExecutiveTitle = experience.some((job) =>
    /\b(CEO|CTO|VP|Director|Head of|Chief)\b/i.test(job.title)
  );

  if (hasExecutiveTitle || totalYears >= 15) {
    return "executive";
  } else if (totalYears >= 8) {
    return "lead";
  } else if (totalYears >= 4) {
    return "senior";
  } else if (totalYears >= 1) {
    return "mid";
  } else {
    return "entry";
  }
}

/**
 * Validate and clean parsed resume data
 */
function validateAndCleanResumeData(data: any): ParsedResume {
  // Ensure required fields exist
  const cleaned: ParsedResume = {
    personalInfo: {
      fullName: data.personalInfo?.fullName || "Unknown",
      email: data.personalInfo?.email || "",
      phone: data.personalInfo?.phone,
      location: data.personalInfo?.location,
      linkedIn: data.personalInfo?.linkedIn,
      github: data.personalInfo?.github,
      portfolio: data.personalInfo?.portfolio,
    },
    summary: data.summary,
    experience: Array.isArray(data.experience) ? data.experience : [],
    education: Array.isArray(data.education) ? data.education : [],
    skills: {
      technical: Array.isArray(data.skills?.technical) ? data.skills.technical : [],
      soft: Array.isArray(data.skills?.soft) ? data.skills.soft : [],
      languages: data.skills?.languages,
      tools: data.skills?.tools,
      frameworks: data.skills?.frameworks,
    },
    certifications: data.certifications,
    projects: data.projects,
    totalExperienceYears:
      data.totalExperienceYears || calculateTotalExperience(data.experience || []),
    industryFocus: data.industryFocus,
    careerLevel:
      data.careerLevel ||
      inferCareerLevel(
        data.totalExperienceYears || 0,
        data.experience || []
      ),
  };

  return cleaned;
}

/**
 * Parse resume from PDF buffer (requires PDF parsing library)
 * This is a placeholder - actual implementation would use pdf-parse or similar
 */
export async function parseResumePDF(pdfBuffer: Buffer): Promise<ParsedResume> {
  // TODO: Implement PDF text extraction
  // For now, throw error
  throw new Error(
    "PDF parsing not yet implemented. Please extract text first and use parseResume()."
  );

  // Future implementation:
  // 1. Use pdf-parse to extract text from PDF
  // 2. Call parseResume() with extracted text
  // 3. Return result
}

/**
 * Batch parse multiple resumes
 */
export async function batchParseResumes(
  resumeTexts: string[]
): Promise<ParsedResume[]> {
  const results: ParsedResume[] = [];

  // Process sequentially to avoid rate limits
  for (const resumeText of resumeTexts) {
    try {
      const parsed = await parseResume(resumeText);
      results.push(parsed);

      // Small delay between requests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Error in batch parsing:", error);
      // Continue with other resumes even if one fails
    }
  }

  return results;
}
