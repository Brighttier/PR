/**
 * Email Content Generator using Google Gemini
 *
 * Generates personalized email content for candidate communications
 * including rejection emails, interview invitations, and more
 */

import { getModelForUseCase, generateContent, countTokens, trackUsage } from "./client";

// Email types
export type EmailType =
  | "application_received"
  | "rejection"
  | "interview_invitation"
  | "interview_reminder"
  | "offer"
  | "application_update"
  | "follow_up";

// Email context
export interface EmailContext {
  type: EmailType;

  // Recipient information
  candidateName: string;
  candidateFirstName?: string;

  // Job information
  jobTitle: string;
  companyName: string;

  // Interview details (if applicable)
  interviewDate?: string;
  interviewTime?: string;
  interviewDuration?: number;
  interviewType?: "AI Screening" | "Technical" | "Face-to-Face" | "Panel";
  meetingLink?: string;
  interviewLocation?: string;
  interviewerName?: string;

  // Additional context
  applicationDate?: string;
  nextSteps?: string;
  feedback?: string;
  customMessage?: string;

  // Tone preferences
  tone?: "professional" | "friendly" | "warm";
}

// Generated email
export interface GeneratedEmail {
  subject: string;
  body: string;
  preview?: string; // First line for preview
}

/**
 * Generate personalized email content
 */
export async function generateEmail(context: EmailContext): Promise<GeneratedEmail> {
  console.log(`Generating ${context.type} email for ${context.candidateName}`);

  try {
    // Get the email generation model
    const model = getModelForUseCase("emailGeneration");

    // Build the prompt based on email type
    const prompt = buildEmailPrompt(context);

    // Count tokens
    const tokenCount = await countTokens(model, prompt);
    console.log(`Email generation token count: ${tokenCount}`);

    // Generate email content
    const emailContent = await generateContent(model, prompt);

    // Track usage
    trackUsage(tokenCount);

    // Parse and validate
    const parsedEmail = parseEmailContent(emailContent, context);

    console.log("Email generated successfully");
    return parsedEmail;
  } catch (error) {
    console.error("Error generating email:", error);
    trackUsage(0, true);
    throw new Error(`Failed to generate email: ${error}`);
  }
}

/**
 * Generate rejection email (with empathy)
 */
export async function generateRejectionEmail(
  candidateName: string,
  jobTitle: string,
  companyName: string,
  customFeedback?: string
): Promise<GeneratedEmail> {
  return generateEmail({
    type: "rejection",
    candidateName,
    jobTitle,
    companyName,
    feedback: customFeedback,
    tone: "warm",
  });
}

/**
 * Generate interview invitation email
 */
export async function generateInterviewInvite(
  candidateName: string,
  jobTitle: string,
  companyName: string,
  interviewDetails: {
    date: string;
    time: string;
    duration?: number;
    type: string;
    meetingLink?: string;
    location?: string;
    interviewerName?: string;
  }
): Promise<GeneratedEmail> {
  return generateEmail({
    type: "interview_invitation",
    candidateName,
    jobTitle,
    companyName,
    interviewDate: interviewDetails.date,
    interviewTime: interviewDetails.time,
    interviewDuration: interviewDetails.duration,
    interviewType: interviewDetails.type as any,
    meetingLink: interviewDetails.meetingLink,
    interviewLocation: interviewDetails.location,
    interviewerName: interviewDetails.interviewerName,
    tone: "friendly",
  });
}

/**
 * Personalize existing email template
 */
export async function personalizeTemplate(
  template: string,
  context: Partial<EmailContext>
): Promise<string> {
  // Replace variables first
  let personalized = template;

  const replacements: Record<string, string> = {
    "{{candidateName}}": context.candidateName || "",
    "{{candidateFirstName}}": context.candidateFirstName || context.candidateName?.split(" ")[0] || "",
    "{{jobTitle}}": context.jobTitle || "",
    "{{companyName}}": context.companyName || "",
    "{{interviewDate}}": context.interviewDate || "",
    "{{interviewTime}}": context.interviewTime || "",
    "{{meetingLink}}": context.meetingLink || "",
    "{{location}}": context.interviewLocation || "",
    "{{interviewerName}}": context.interviewerName || "",
    "{{applicationDate}}": context.applicationDate || "",
  };

  Object.entries(replacements).forEach(([key, value]) => {
    personalized = personalized.replace(new RegExp(key, "g"), value);
  });

  // Use AI to enhance personalization if custom message provided
  if (context.customMessage) {
    const prompt = `Enhance this email with the following personalized message while maintaining the original tone and structure:

EMAIL TEMPLATE:
${personalized}

PERSONALIZATION TO ADD:
${context.customMessage}

Return the enhanced email text.`;

    try {
      const model = getModelForUseCase("emailGeneration");
      personalized = await generateContent(model, prompt);
    } catch (error) {
      console.error("Error personalizing template:", error);
      // Return with variable replacements only
    }
  }

  return personalized.trim();
}

/**
 * Build email prompt based on type
 */
function buildEmailPrompt(context: EmailContext): string {
  const tone = context.tone || "professional";
  const firstName = context.candidateFirstName || context.candidateName.split(" ")[0];

  const baseInstructions = `Generate a ${tone} email for this scenario.

GUIDELINES:
- Use proper email structure (greeting, body, closing, signature)
- Be clear, concise, and respectful
- Use first name (${firstName}) for friendliness
- Include all relevant details
- End with next steps or clear call-to-action
- Sign off as "${context.companyName} Recruitment Team"

FORMAT:
Subject: [Email subject line]

Body:
[Email body content]

Return the email in this exact format.`;

  const typeSpecificPrompts: Record<EmailType, string> = {
    application_received: `
${baseInstructions}

EMAIL TYPE: Application Received Confirmation

Details:
- Candidate: ${context.candidateName}
- Job: ${context.jobTitle}
- Company: ${context.companyName}
${context.applicationDate ? `- Applied: ${context.applicationDate}` : ""}

Content should:
- Thank them for applying
- Confirm receipt of application
- Set expectations for next steps and timeline
- Express enthusiasm about their interest
`,

    rejection: `
${baseInstructions}

EMAIL TYPE: Application Rejection

Details:
- Candidate: ${context.candidateName}
- Job: ${context.jobTitle}
- Company: ${context.companyName}
${context.feedback ? `- Feedback: ${context.feedback}` : ""}

Content should:
- Be empathetic and respectful
- Thank them for their time and interest
- Explain (gently) that we're moving forward with other candidates
- Encourage them to apply for future positions
- Wish them well in their job search
${context.feedback ? "- Include the provided feedback tactfully" : "- DO NOT include specific reasons unless feedback is provided"}

IMPORTANT: Make this rejection email kind, respectful, and encouraging. Rejection is hard, so be compassionate.
`,

    interview_invitation: `
${baseInstructions}

EMAIL TYPE: Interview Invitation

Details:
- Candidate: ${context.candidateName}
- Job: ${context.jobTitle}
- Company: ${context.companyName}
- Date: ${context.interviewDate}
- Time: ${context.interviewTime}
${context.interviewDuration ? `- Duration: ${context.interviewDuration} minutes` : ""}
- Type: ${context.interviewType}
${context.meetingLink ? `- Meeting Link: ${context.meetingLink}` : ""}
${context.interviewLocation ? `- Location: ${context.interviewLocation}` : ""}
${context.interviewerName ? `- Interviewer: ${context.interviewerName}` : ""}

Content should:
- Congratulate them on moving to the interview stage
- Provide ALL interview details clearly
- Include preparation tips if helpful
- Ask them to confirm attendance
- Provide contact info for questions
- Express excitement about meeting them
`,

    interview_reminder: `
${baseInstructions}

EMAIL TYPE: Interview Reminder

Details:
- Candidate: ${context.candidateName}
- Job: ${context.jobTitle}
- Interview Date: ${context.interviewDate}
- Interview Time: ${context.interviewTime}
${context.meetingLink ? `- Meeting Link: ${context.meetingLink}` : ""}
${context.interviewLocation ? `- Location: ${context.interviewLocation}` : ""}

Content should:
- Friendly reminder about upcoming interview
- Reiterate key details (date, time, location/link)
- Mention any preparation needed
- Provide contact info for last-minute questions
- Keep it brief and helpful
`,

    offer: `
${baseInstructions}

EMAIL TYPE: Job Offer

Details:
- Candidate: ${context.candidateName}
- Job: ${context.jobTitle}
- Company: ${context.companyName}

Content should:
- Congratulate them enthusiastically
- Express excitement about them joining the team
- Mention formal offer letter is attached (or coming separately)
- Invite them to discuss any questions
- Provide next steps
- Welcome them to the team
`,

    application_update: `
${baseInstructions}

EMAIL TYPE: Application Status Update

Details:
- Candidate: ${context.candidateName}
- Job: ${context.jobTitle}
- Company: ${context.companyName}
${context.nextSteps ? `- Next Steps: ${context.nextSteps}` : ""}
${context.customMessage ? `- Message: ${context.customMessage}` : ""}

Content should:
- Update them on their application status
- Provide clear next steps
- Set realistic timeline expectations
- Thank them for their patience
`,

    follow_up: `
${baseInstructions}

EMAIL TYPE: Follow-up

Details:
- Candidate: ${context.candidateName}
- Job: ${context.jobTitle}
- Company: ${context.companyName}
${context.customMessage ? `- Context: ${context.customMessage}` : ""}

Content should:
- Follow up on previous communication
- Provide any requested information
- Move the process forward
- Be helpful and professional
`,
  };

  return typeSpecificPrompts[context.type];
}

/**
 * Parse generated email content into structured format
 */
function parseEmailContent(content: string, context: EmailContext): GeneratedEmail {
  // Try to extract subject and body
  const subjectMatch = content.match(/Subject:\s*(.+?)(?:\n|$)/i);
  const bodyMatch = content.match(/Body:\s*\n([\s\S]+)/i);

  const subject = subjectMatch
    ? subjectMatch[1].trim()
    : `${context.companyName} - ${context.jobTitle}`;

  const body = bodyMatch ? bodyMatch[1].trim() : content.trim();

  // Extract first line as preview
  const preview = body.split("\n")[0].trim();

  return {
    subject,
    body,
    preview,
  };
}

/**
 * Improve email tone
 */
export async function improveEmailTone(
  emailBody: string,
  desiredTone: "professional" | "friendly" | "warm"
): Promise<string> {
  const prompt = `Rewrite this email to have a more ${desiredTone} tone while keeping the same information:

${emailBody}

Return only the improved email body.`;

  try {
    const model = getModelForUseCase("emailGeneration");
    const improved = await generateContent(model, prompt);
    return improved.trim();
  } catch (error) {
    console.error("Error improving email tone:", error);
    return emailBody;
  }
}

/**
 * Make email more concise
 */
export async function makeEmailConcise(emailBody: string): Promise<string> {
  const prompt = `Make this email more concise while preserving all important information:

${emailBody}

Return only the concise version.`;

  try {
    const model = getModelForUseCase("emailGeneration");
    const concise = await generateContent(model, prompt);
    return concise.trim();
  } catch (error) {
    console.error("Error making email concise:", error);
    return emailBody;
  }
}
