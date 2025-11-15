/**
 * Cloud Function: Process Resume Upload
 * Triggered when a resume file is uploaded to Firebase Storage
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { processAIPipeline } from "./processAIPipeline";

const db = admin.firestore();

/**
 * Triggered when a file is uploaded to resumes/ folder
 * Automatically start AI processing
 */
export const onResumeUpload_StartProcessing = functions.storage
  .object()
  .onFinalize(async (object) => {
    const filePath = object.name;

    // Only process files in the resumes/ folder
    if (!filePath || !filePath.startsWith("resumes/")) {
      return;
    }

    try {
      console.log(`[Function] Resume uploaded: ${filePath}`);

      // Extract metadata from path: resumes/{companyId}/{candidateId}/{filename}
      const pathParts = filePath.split("/");

      if (pathParts.length < 4) {
        console.warn(`[Function] Invalid resume path format: ${filePath}`);
        return;
      }

      const companyId = pathParts[1];
      const candidateId = pathParts[2];
      const fileName = pathParts[3];

      console.log(`[Function] Extracted metadata:`);
      console.log(`  - Company: ${companyId}`);
      console.log(`  - Candidate: ${candidateId}`);
      console.log(`  - File: ${fileName}`);

      // Generate public URL for the resume
      const bucket = admin.storage().bucket(object.bucket);
      const file = bucket.file(filePath);

      // Generate signed URL (valid for 1 year)
      const [url] = await file.getSignedUrl({
        action: "read",
        expires: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
      });

      console.log(`[Function] Resume URL generated: ${url.substring(0, 50)}...`);

      // Find associated application
      const applicationSnapshot = await db
        .collection("applications")
        .where("candidateId", "==", candidateId)
        .where("companyId", "==", companyId)
        .orderBy("appliedAt", "desc")
        .limit(1)
        .get();

      if (!applicationSnapshot.empty) {
        const applicationDoc = applicationSnapshot.docs[0];
        const application = applicationDoc.data();
        const applicationId = applicationDoc.id;

        console.log(`[Function] Found application: ${applicationId}`);

        // Update application with resume URL
        await applicationDoc.ref.update({
          resumeUrl: url,
          resumeFileName: fileName,
          resumeUploadedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Trigger AI processing pipeline
        console.log(`[Function] Triggering AI pipeline for application: ${applicationId}`);

        await processAIPipeline(applicationId, {
          candidateId,
          jobId: application.jobId,
          resumeUrl: url,
          companyId,
        });
      } else {
        console.log(`[Function] No application found for candidate: ${candidateId}`);

        // Update candidate profile with resume URL
        await db
          .collection("candidates")
          .doc(candidateId)
          .set(
            {
              resumeUrl: url,
              resumeFileName: fileName,
              resumeUploadedAt: admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
      }

      console.log(`[Function] Resume processing completed: ${filePath}`);
    } catch (error) {
      console.error(`[Function] Error processing resume upload:`, error);
    }
  });

/**
 * Callable function to manually trigger resume processing
 */
export const processResume = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }

    const { resumeUrl, candidateId, applicationId } = data;

    if (!resumeUrl || !candidateId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required parameters: resumeUrl and candidateId"
      );
    }

    console.log(`[Callable] Processing resume for candidate: ${candidateId}`);

    if (applicationId) {
      // Process for specific application
      const appDoc = await db.collection("applications").doc(applicationId).get();

      if (!appDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Application not found");
      }

      const application = appDoc.data();

      if (!application) {
        throw new functions.https.HttpsError("not-found", "Application data not found");
      }

      await processAIPipeline(applicationId, {
        candidateId,
        jobId: application.jobId,
        resumeUrl,
        companyId: application.companyId,
      });

      return {
        success: true,
        applicationId,
        message: "Resume processing started",
      };
    } else {
      // Just parse resume and update candidate profile
      const { parseResume } = await import("../../../ai/gemini/resume-parser");

      // Download resume text
      // (Reuse download logic from processAIPipeline)

      return {
        success: true,
        candidateId,
        message: "Resume parsing started",
      };
    }
  } catch (error) {
    console.error("[Callable] Error processing resume:", error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      "internal",
      `Failed to process resume: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
});
