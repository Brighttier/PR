/**
 * Cloud Function: AI Processing Pipeline
 * Main pipeline for processing applications with AI
 * Steps:
 * 1. Parse resume
 * 2. Generate candidate profile
 * 3. Create vector embeddings
 * 4. Calculate job match score
 * 5. Generate candidate summary
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();
const storage = admin.storage();

interface PipelineData {
  candidateId: string;
  jobId: string;
  resumeUrl: string;
  companyId: string;
}

/**
 * Main AI processing pipeline
 * Can be called directly or via Pub/Sub
 */
export async function processAIPipeline(
  applicationId: string,
  data: PipelineData
): Promise<void> {
  console.log(`[AI Pipeline] Starting processing for application: ${applicationId}`);

  try {
    const { candidateId, jobId, resumeUrl, companyId } = data;

    // Step 1: Download resume from Storage
    console.log(`[AI Pipeline] Step 1: Downloading resume from: ${resumeUrl}`);
    const resumeText = await downloadResumeText(resumeUrl);

    if (!resumeText) {
      throw new Error("Failed to extract text from resume");
    }

    // Step 2: Parse resume with Gemini
    console.log(`[AI Pipeline] Step 2: Parsing resume with Gemini AI`);
    const { parseResume } = await import("../../../ai/gemini/resume-parser");
    const parsedResume = await parseResume(resumeText);

    // Step 3: Update candidate profile with parsed data
    console.log(`[AI Pipeline] Step 3: Updating candidate profile`);
    await updateCandidateProfile(candidateId, parsedResume);

    // Step 4: Generate vector embedding for candidate
    console.log(`[AI Pipeline] Step 4: Generating vector embedding`);
    const { generateCandidateEmbedding } = await import("../../../ai/vector/embeddings");
    const candidateEmbedding = await generateCandidateEmbedding(parsedResume);

    // Step 5: Get job details
    console.log(`[AI Pipeline] Step 5: Fetching job details`);
    const jobDoc = await db.collection("jobs").doc(jobId).get();
    const job = jobDoc.data();

    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    // Step 6: Calculate match score
    console.log(`[AI Pipeline] Step 6: Calculating job match score`);
    const { calculateMatchScore } = await import("../../../ai/gemini/job-matcher");
    const matchResult = await calculateMatchScore(parsedResume, job);

    // Step 7: Generate candidate summary
    console.log(`[AI Pipeline] Step 7: Generating AI summary`);
    const { generateCandidateSummary } = await import(
      "../../../ai/gemini/candidate-summarizer"
    );
    const aiSummary = await generateCandidateSummary(parsedResume, job, matchResult);

    // Step 8: Update application with AI analysis
    console.log(`[AI Pipeline] Step 8: Updating application with results`);
    await db
      .collection("applications")
      .doc(applicationId)
      .update({
        // Match score and recommendation
        matchScore: matchResult.score,
        aiRecommendation: matchResult.recommendation,

        // AI summary
        aiSummary: {
          oneLiner: aiSummary.oneLiner,
          executiveSummary: aiSummary.executiveSummary,
          strengths: aiSummary.strengths,
          redFlags: aiSummary.redFlags || [],
          recommendation: matchResult.recommendation,
        },

        // Skills analysis
        skillsMatch: matchResult.skillsMatch,
        experienceMatch: matchResult.experienceMatch,

        // Candidate data
        candidateSkills: parsedResume.skills.technical,
        candidateExperienceYears: parsedResume.totalExperienceYears,
        candidateCareerLevel: parsedResume.careerLevel,

        // Processing status
        aiProcessingStatus: "completed",
        aiProcessingCompletedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    // Step 9: Store vector embedding (for semantic search)
    if (candidateEmbedding) {
      await db
        .collection("candidates")
        .doc(candidateId)
        .collection("embeddings")
        .doc("profile")
        .set({
          embedding: candidateEmbedding,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }

    console.log(
      `[AI Pipeline] Processing completed successfully for application: ${applicationId}`
    );
    console.log(`  - Match Score: ${matchResult.score}%`);
    console.log(`  - Recommendation: ${matchResult.recommendation}`);
  } catch (error) {
    console.error(`[AI Pipeline] Error processing application: ${applicationId}`, error);

    // Update application with error
    await db
      .collection("applications")
      .doc(applicationId)
      .update({
        aiProcessingStatus: "error",
        aiProcessingError: error instanceof Error ? error.message : "Unknown error",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    throw error;
  }
}

/**
 * Download and extract text from resume
 */
async function downloadResumeText(resumeUrl: string): Promise<string> {
  try {
    // Extract bucket and file path from URL
    // Format: gs://bucket-name/path/to/file or https://storage.googleapis.com/bucket-name/path/to/file
    let bucketName: string;
    let filePath: string;

    if (resumeUrl.startsWith("gs://")) {
      const parts = resumeUrl.replace("gs://", "").split("/");
      bucketName = parts[0];
      filePath = parts.slice(1).join("/");
    } else if (resumeUrl.includes("storage.googleapis.com")) {
      const url = new URL(resumeUrl);
      const parts = url.pathname.substring(1).split("/");
      bucketName = parts[0];
      filePath = parts.slice(1).join("/");
    } else {
      throw new Error("Invalid resume URL format");
    }

    console.log(`[Download] Downloading from bucket: ${bucketName}, path: ${filePath}`);

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filePath);

    // Download file
    const [fileBuffer] = await file.download();

    // Check file type and extract text
    const fileName = filePath.toLowerCase();

    if (fileName.endsWith(".pdf")) {
      // TODO: Implement PDF text extraction
      // For now, return placeholder
      console.warn("[Download] PDF extraction not yet implemented");
      return fileBuffer.toString("utf-8");
    } else if (fileName.endsWith(".txt")) {
      return fileBuffer.toString("utf-8");
    } else if (fileName.endsWith(".doc") || fileName.endsWith(".docx")) {
      // TODO: Implement DOC/DOCX extraction
      console.warn("[Download] DOC/DOCX extraction not yet implemented");
      return fileBuffer.toString("utf-8");
    } else {
      // Assume plain text
      return fileBuffer.toString("utf-8");
    }
  } catch (error) {
    console.error("[Download] Error downloading resume:", error);
    throw error;
  }
}

/**
 * Update candidate profile with parsed resume data
 */
async function updateCandidateProfile(candidateId: string, parsedResume: any) {
  try {
    await db
      .collection("candidates")
      .doc(candidateId)
      .set(
        {
          // Personal info
          fullName: parsedResume.personalInfo.fullName,
          email: parsedResume.personalInfo.email,
          phone: parsedResume.personalInfo.phone,
          location: parsedResume.personalInfo.location,
          linkedIn: parsedResume.personalInfo.linkedIn,
          github: parsedResume.personalInfo.github,
          portfolio: parsedResume.personalInfo.portfolio,

          // Professional summary
          summary: parsedResume.summary,

          // Experience
          experience: parsedResume.experience,
          totalExperienceYears: parsedResume.totalExperienceYears,
          careerLevel: parsedResume.careerLevel,

          // Education
          education: parsedResume.education,

          // Skills
          skills: parsedResume.skills,

          // Certifications
          certifications: parsedResume.certifications || [],

          // Projects
          projects: parsedResume.projects || [],

          // Industry focus
          industryFocus: parsedResume.industryFocus || [],

          // Metadata
          profileCompleted: true,
          lastParsedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    console.log(`[Update] Candidate profile updated: ${candidateId}`);
  } catch (error) {
    console.error("[Update] Error updating candidate profile:", error);
    throw error;
  }
}

/**
 * Callable function to manually trigger AI pipeline
 */
export const triggerAIPipeline = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }

    const { applicationId } = data;

    if (!applicationId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required parameter: applicationId"
      );
    }

    // Get application
    const appDoc = await db.collection("applications").doc(applicationId).get();

    if (!appDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Application not found");
    }

    const application = appDoc.data();

    if (!application) {
      throw new functions.https.HttpsError("not-found", "Application data not found");
    }

    // Trigger pipeline
    await processAIPipeline(applicationId, {
      candidateId: application.candidateId,
      jobId: application.jobId,
      resumeUrl: application.resumeUrl,
      companyId: application.companyId,
    });

    return { success: true, applicationId };
  } catch (error) {
    console.error("[Callable] Error triggering AI pipeline:", error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      "internal",
      `Failed to trigger AI pipeline: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
});
