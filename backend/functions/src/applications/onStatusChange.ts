/**
 * Cloud Function: Application Status Change Handler
 * Triggered when application status or stage changes
 * Sends notifications and updates related documents
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * Send notifications when application status changes
 */
export const onApplicationUpdate_SendNotifications = functions.firestore
  .document("applications/{applicationId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const applicationId = context.params.applicationId;

    try {
      // Check if status or stage changed
      const statusChanged = before.status !== after.status;
      const stageChanged = before.stage !== after.stage;

      if (!statusChanged && !stageChanged) {
        return; // No relevant changes
      }

      console.log(`[Function] Application status/stage changed: ${applicationId}`);
      console.log(`  - Status: ${before.status} → ${after.status}`);
      console.log(`  - Stage: ${before.stage} → ${after.stage}`);

      // Send notification to candidate for major status changes
      const shouldNotifyCandidate =
        statusChanged &&
        ["Interview Scheduled", "Offer Extended", "Hired", "Rejected"].includes(
          after.status
        );

      if (shouldNotifyCandidate) {
        await sendCandidateNotification(after, applicationId);
      }

      // Log status change in audit trail
      await logStatusChange(applicationId, before, after);

      console.log(`[Function] Notifications sent for application: ${applicationId}`);
    } catch (error) {
      console.error("[Function] Error in status change handler:", error);
    }
  });

/**
 * Send notification email to candidate
 */
async function sendCandidateNotification(application: any, applicationId: string) {
  try {
    console.log(
      `[Notification] Sending status update to: ${application.candidateEmail}`
    );

    const emailTemplate = getEmailTemplate(application.status);

    // TODO: Integrate with email service
    const emailData = {
      to: application.candidateEmail,
      subject: emailTemplate.subject.replace("{jobTitle}", application.jobTitle),
      template: emailTemplate.templateName,
      data: {
        candidateName: application.candidateName,
        jobTitle: application.jobTitle,
        companyName: application.companyName || "our company",
        status: application.status,
        applicationId,
        message: emailTemplate.message,
      },
    };

    console.log(`[Notification] Email would be sent:`, emailData);
  } catch (error) {
    console.error("[Notification] Error sending candidate notification:", error);
  }
}

/**
 * Get email template based on status
 */
function getEmailTemplate(status: string): {
  subject: string;
  templateName: string;
  message: string;
} {
  switch (status) {
    case "Interview Scheduled":
      return {
        subject: "Interview Scheduled - {jobTitle}",
        templateName: "interview_scheduled",
        message:
          "Great news! We'd like to invite you for an interview. Please check your email for interview details.",
      };

    case "Offer Extended":
      return {
        subject: "Job Offer - {jobTitle}",
        templateName: "offer_extended",
        message:
          "Congratulations! We're pleased to extend you an offer for this position.",
      };

    case "Hired":
      return {
        subject: "Welcome to the Team! - {jobTitle}",
        templateName: "hired",
        message: "Welcome aboard! We're excited to have you join our team.",
      };

    case "Rejected":
      return {
        subject: "Application Update - {jobTitle}",
        templateName: "application_rejected",
        message:
          "Thank you for your interest. Unfortunately, we've decided to move forward with other candidates at this time.",
      };

    default:
      return {
        subject: "Application Update - {jobTitle}",
        templateName: "application_update",
        message: "Your application status has been updated.",
      };
  }
}

/**
 * Log status change in audit trail
 */
async function logStatusChange(applicationId: string, before: any, after: any) {
  try {
    await db
      .collection("applications")
      .doc(applicationId)
      .collection("audit_log")
      .add({
        type: "status_change",
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        changes: {
          status: {
            from: before.status,
            to: after.status,
          },
          stage: {
            from: before.stage,
            to: after.stage,
          },
        },
        updatedBy: after.updatedBy || "system",
      });

    console.log(`[Audit] Logged status change for application: ${applicationId}`);
  } catch (error) {
    console.error("[Audit] Error logging status change:", error);
  }
}

/**
 * Update application analytics when status changes
 */
export const onApplicationUpdate_UpdateAnalytics = functions.firestore
  .document("applications/{applicationId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    try {
      // Only process if status changed
      if (before.status === after.status) {
        return;
      }

      const companyId = after.companyId;
      const jobId = after.jobId;

      // Update company-level analytics
      const analyticsRef = db
        .collection("companies")
        .doc(companyId)
        .collection("analytics")
        .doc("applications");

      await analyticsRef.set(
        {
          byStatus: {
            [after.status]: admin.firestore.FieldValue.increment(1),
            [before.status]: admin.firestore.FieldValue.increment(-1),
          },
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      // Update job-level analytics
      const jobAnalyticsRef = db
        .collection("jobs")
        .doc(jobId)
        .collection("analytics")
        .doc("applications");

      await jobAnalyticsRef.set(
        {
          byStatus: {
            [after.status]: admin.firestore.FieldValue.increment(1),
            [before.status]: admin.firestore.FieldValue.increment(-1),
          },
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      console.log(`[Analytics] Updated analytics for status change: ${before.status} → ${after.status}`);
    } catch (error) {
      console.error("[Analytics] Error updating analytics:", error);
    }
  });
