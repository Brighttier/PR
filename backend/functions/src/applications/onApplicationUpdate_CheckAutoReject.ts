/**
 * Cloud Function: Auto-Reject Based on Threshold
 * Triggered when application is updated with AI match score
 * Automatically rejects applications below configured threshold
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * Check if application should be auto-rejected based on match score
 */
export const onApplicationUpdate_CheckAutoReject = functions.firestore
  .document("applications/{applicationId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const applicationId = context.params.applicationId;

    try {
      // Only trigger if match score was just added
      const scoreJustAdded = !before.matchScore && after.matchScore !== undefined;

      if (!scoreJustAdded) {
        return; // No new match score
      }

      console.log(
        `[Auto-Reject] Checking application: ${applicationId} (Score: ${after.matchScore}%)`
      );

      // Get company's pipeline settings
      const pipelineSettingsDoc = await db
        .collection("companies")
        .doc(after.companyId)
        .collection("settings")
        .doc("pipeline")
        .get();

      if (!pipelineSettingsDoc.exists) {
        console.log(
          `[Auto-Reject] No pipeline settings found for company: ${after.companyId}`
        );
        return;
      }

      const pipelineSettings = pipelineSettingsDoc.data();

      // Check if auto-reject is enabled
      if (!pipelineSettings?.autoRejectEnabled) {
        console.log(`[Auto-Reject] Auto-reject disabled for company: ${after.companyId}`);
        return;
      }

      const threshold = pipelineSettings.autoRejectThreshold || 30;
      const minApplications = pipelineSettings.minApplicationsThreshold || 5;

      console.log(`[Auto-Reject] Settings: threshold=${threshold}%, minApplications=${minApplications}`);

      // Check if job has enough applications
      const jobApplicationsCount = await countJobApplications(after.jobId);

      if (jobApplicationsCount < minApplications) {
        console.log(
          `[Auto-Reject] Not enough applications for job (${jobApplicationsCount}/${minApplications}). Skipping auto-reject.`
        );
        return;
      }

      // Check if match score is below threshold
      if (after.matchScore < threshold) {
        console.log(
          `[Auto-Reject] Application below threshold: ${after.matchScore}% < ${threshold}%`
        );

        // Auto-reject the application
        await change.after.ref.update({
          status: "Rejected",
          stage: "Closed",
          rejectionReason: "Auto-rejected: Match score below threshold",
          autoRejected: true,
          autoRejectedAt: admin.firestore.FieldValue.serverTimestamp(),
          autoRejectedThreshold: threshold,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Send rejection email if configured
        if (pipelineSettings.sendRejectionEmail) {
          await sendAutoRejectionEmail(after, threshold);
        }

        console.log(`[Auto-Reject] Application auto-rejected: ${applicationId}`);
      } else {
        console.log(
          `[Auto-Reject] Application above threshold: ${after.matchScore}% >= ${threshold}%. No action taken.`
        );
      }
    } catch (error) {
      console.error("[Auto-Reject] Error in auto-reject check:", error);
    }
  });

/**
 * Count total applications for a job
 */
async function countJobApplications(jobId: string): Promise<number> {
  try {
    const snapshot = await db
      .collection("applications")
      .where("jobId", "==", jobId)
      .count()
      .get();

    return snapshot.data().count;
  } catch (error) {
    console.error("[Auto-Reject] Error counting job applications:", error);
    return 0;
  }
}

/**
 * Send auto-rejection email to candidate
 */
async function sendAutoRejectionEmail(application: any, threshold: number) {
  try {
    console.log(
      `[Auto-Reject] Sending rejection email to: ${application.candidateEmail}`
    );

    // TODO: Integrate with email service
    const emailData = {
      to: application.candidateEmail,
      subject: `Application Update - ${application.jobTitle}`,
      template: "auto_rejection",
      data: {
        candidateName: application.candidateName,
        jobTitle: application.jobTitle,
        companyName: application.companyName || "our company",
        message:
          "Thank you for your interest in this position. After careful review of your application, we've decided to move forward with other candidates whose qualifications more closely match our current needs.",
        encouragement:
          "We encourage you to apply for other positions that may be a better fit for your skills and experience.",
      },
    };

    console.log(`[Auto-Reject] Rejection email would be sent:`, emailData);
  } catch (error) {
    console.error("[Auto-Reject] Error sending rejection email:", error);
  }
}

/**
 * Callable function to manually run auto-reject check for all applications
 */
export const runAutoRejectCheck = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }

    const { companyId } = data;

    if (!companyId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required parameter: companyId"
      );
    }

    // Verify user has permission (HR Admin or Platform Admin)
    const userDoc = await db.collection("users").doc(context.auth.uid).get();
    const user = userDoc.data();

    if (!user) {
      throw new functions.https.HttpsError("not-found", "User not found");
    }

    const hasPermission =
      user.role === "hr_admin" || user.role === "platform_admin";

    if (!hasPermission) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Only HR Admins can run auto-reject check"
      );
    }

    console.log(
      `[Auto-Reject] Manual check triggered for company: ${companyId} by user: ${context.auth.uid}`
    );

    // Get pending applications with match scores
    const applicationsSnapshot = await db
      .collection("applications")
      .where("companyId", "==", companyId)
      .where("status", "in", ["Applied", "Under Review"])
      .where("matchScore", ">", 0)
      .get();

    console.log(
      `[Auto-Reject] Found ${applicationsSnapshot.size} applications to check`
    );

    let rejectedCount = 0;

    // Process each application
    for (const doc of applicationsSnapshot.docs) {
      const application = doc.data();

      // Get pipeline settings
      const pipelineSettingsDoc = await db
        .collection("companies")
        .doc(companyId)
        .collection("settings")
        .doc("pipeline")
        .get();

      const pipelineSettings = pipelineSettingsDoc.data();

      if (!pipelineSettings?.autoRejectEnabled) {
        continue;
      }

      const threshold = pipelineSettings.autoRejectThreshold || 30;

      // Check threshold
      if (application.matchScore < threshold) {
        await doc.ref.update({
          status: "Rejected",
          stage: "Closed",
          rejectionReason: "Auto-rejected: Manual batch check",
          autoRejected: true,
          autoRejectedAt: admin.firestore.FieldValue.serverTimestamp(),
          autoRejectedThreshold: threshold,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        rejectedCount++;
      }
    }

    console.log(
      `[Auto-Reject] Manual check completed: ${rejectedCount} applications auto-rejected`
    );

    return {
      success: true,
      checked: applicationsSnapshot.size,
      rejected: rejectedCount,
    };
  } catch (error) {
    console.error("[Auto-Reject] Error in manual check:", error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      "internal",
      `Failed to run auto-reject check: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
});
