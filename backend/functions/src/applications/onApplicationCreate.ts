/**
 * Cloud Function: Trigger AI Pipeline on Application Creation
 * Triggered when a new application is submitted
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * When application is created, trigger AI processing pipeline
 */
export const onApplicationCreate_TriggerPipeline = functions.firestore
  .document("applications/{applicationId}")
  .onCreate(async (snap, context) => {
    const application = snap.data();
    const applicationId = context.params.applicationId;

    try {
      console.log(`[Function] New application created: ${applicationId}`);
      console.log(`  - Candidate: ${application.candidateName}`);
      console.log(`  - Job: ${application.jobTitle}`);
      console.log(`  - Resume URL: ${application.resumeUrl || "No resume"}`);

      // Update application status to processing
      await snap.ref.update({
        status: "Under Review",
        stage: "Application Review",
        aiProcessingStatus: "processing",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // If resume URL exists, trigger AI pipeline
      if (application.resumeUrl) {
        console.log(`[Function] Triggering AI pipeline for application: ${applicationId}`);

        // Call the AI processing pipeline function
        // This will be a separate callable function or triggered via Pub/Sub
        const { processAIPipeline } = await import("./processAIPipeline");

        await processAIPipeline(applicationId, {
          candidateId: application.candidateId,
          jobId: application.jobId,
          resumeUrl: application.resumeUrl,
          companyId: application.companyId,
        });
      } else {
        console.log(
          `[Function] No resume URL found for application: ${applicationId}. Skipping AI processing.`
        );

        // Update status to indicate manual review needed
        await snap.ref.update({
          aiProcessingStatus: "skipped",
          aiProcessingNote: "No resume provided - manual review required",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // Send confirmation email to candidate
      await sendApplicationConfirmation(application);

      // Notify recruiters of new application
      await notifyRecruiters(application);

      console.log(`[Function] Application processing initiated: ${applicationId}`);
    } catch (error) {
      console.error(
        `[Function] Error processing application creation: ${applicationId}`,
        error
      );

      // Update application with error status
      await snap.ref.update({
        aiProcessingStatus: "error",
        aiProcessingError:
          error instanceof Error ? error.message : "Unknown error",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  });

/**
 * Send application confirmation email to candidate
 */
async function sendApplicationConfirmation(application: any) {
  try {
    console.log(
      `[Function] Sending application confirmation to: ${application.candidateEmail}`
    );

    // TODO: Integrate with email service (SendGrid/Resend)
    // For now, just log the details

    const emailData = {
      to: application.candidateEmail,
      subject: `Application Received - ${application.jobTitle}`,
      template: "application_received",
      data: {
        candidateName: application.candidateName,
        jobTitle: application.jobTitle,
        companyName: application.companyName || "our company",
        applicationId: application.id || application.applicationId,
        nextSteps: "We'll review your application and get back to you soon.",
      },
    };

    console.log(`[Function] Email would be sent:`, emailData);
    console.log(`[Function] Application confirmation logged for: ${application.candidateEmail}`);
  } catch (error) {
    console.error("[Function] Error sending application confirmation:", error);
  }
}

/**
 * Notify recruiters of new application
 */
async function notifyRecruiters(application: any) {
  try {
    console.log(
      `[Function] Notifying recruiters of new application for job: ${application.jobId}`
    );

    // Get all recruiters and HR admins for this company
    const recruitersSnapshot = await db
      .collection("users")
      .where("companyId", "==", application.companyId)
      .where("role", "in", ["recruiter", "hr_admin"])
      .get();

    if (recruitersSnapshot.empty) {
      console.log(`[Function] No recruiters found for company: ${application.companyId}`);
      return;
    }

    // TODO: Send email notifications
    recruitersSnapshot.forEach((doc) => {
      const recruiter = doc.data();
      console.log(`[Function] Would notify recruiter: ${recruiter.email}`);
      console.log(`  - Candidate: ${application.candidateName}`);
      console.log(`  - Job: ${application.jobTitle}`);
    });

    console.log(
      `[Function] Notified ${recruitersSnapshot.size} recruiters of new application`
    );
  } catch (error) {
    console.error("[Function] Error notifying recruiters:", error);
  }
}

/**
 * Increment application count on job document
 */
export const onApplicationCreate_IncrementJobCount = functions.firestore
  .document("applications/{applicationId}")
  .onCreate(async (snap, context) => {
    const application = snap.data();

    try {
      // Increment applicants count on job document
      await db
        .collection("jobs")
        .doc(application.jobId)
        .update({
          applicants: admin.firestore.FieldValue.increment(1),
          lastApplicationDate: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      console.log(`[Function] Incremented applicant count for job: ${application.jobId}`);
    } catch (error) {
      console.error("[Function] Error incrementing job count:", error);
    }
  });
