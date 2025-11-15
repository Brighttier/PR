/**
 * Cloud Function: Pipeline Settings Update Handler
 * Triggered when pipeline settings are updated
 * Applies auto-reject rules to existing applications if threshold changes
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * When pipeline settings are updated, optionally re-evaluate existing applications
 */
export const onPipelineUpdate_ApplyRules = functions.firestore
  .document("companies/{companyId}/settings/pipeline")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const companyId = context.params.companyId;

    try {
      console.log(`[Pipeline Settings] Settings updated for company: ${companyId}`);

      // Check if auto-reject threshold changed
      const thresholdChanged =
        before.autoRejectThreshold !== after.autoRejectThreshold;

      const enabledChanged = before.autoRejectEnabled !== after.autoRejectEnabled;

      if (!thresholdChanged && !enabledChanged) {
        console.log(
          `[Pipeline Settings] No relevant changes detected, skipping re-evaluation`
        );
        return;
      }

      console.log(`[Pipeline Settings] Changes detected:`);
      console.log(`  - Auto-reject enabled: ${before.autoRejectEnabled} → ${after.autoRejectEnabled}`);
      console.log(`  - Threshold: ${before.autoRejectThreshold}% → ${after.autoRejectThreshold}%`);

      // Only re-evaluate if auto-reject is now enabled or threshold was lowered
      const shouldReEvaluate =
        (enabledChanged && after.autoRejectEnabled) ||
        (thresholdChanged &&
          after.autoRejectEnabled &&
          after.autoRejectThreshold > before.autoRejectThreshold);

      if (!shouldReEvaluate) {
        console.log(
          `[Pipeline Settings] No re-evaluation needed (auto-reject disabled or threshold raised)`
        );
        return;
      }

      // Get all pending applications with match scores
      console.log(
        `[Pipeline Settings] Re-evaluating applications with new threshold: ${after.autoRejectThreshold}%`
      );

      const applicationsSnapshot = await db
        .collection("applications")
        .where("companyId", "==", companyId)
        .where("status", "in", ["Applied", "Under Review"])
        .where("matchScore", ">", 0)
        .get();

      console.log(
        `[Pipeline Settings] Found ${applicationsSnapshot.size} applications to re-evaluate`
      );

      let rejectedCount = 0;
      const minApplications = after.minApplicationsThreshold || 5;

      // Group applications by job for minimum threshold check
      const applicationsByJob = new Map<string, any[]>();

      applicationsSnapshot.forEach((doc) => {
        const app = doc.data();
        const jobId = app.jobId;

        if (!applicationsByJob.has(jobId)) {
          applicationsByJob.set(jobId, []);
        }

        applicationsByJob.get(jobId)!.push({ id: doc.id, data: app });
      });

      // Process each job's applications
      for (const [jobId, applications] of applicationsByJob.entries()) {
        // Check if job has enough applications
        if (applications.length < minApplications) {
          console.log(
            `[Pipeline Settings] Skipping job ${jobId}: only ${applications.length}/${minApplications} applications`
          );
          continue;
        }

        console.log(
          `[Pipeline Settings] Processing ${applications.length} applications for job: ${jobId}`
        );

        // Auto-reject applications below threshold
        for (const app of applications) {
          if (app.data.matchScore < after.autoRejectThreshold) {
            await db
              .collection("applications")
              .doc(app.id)
              .update({
                status: "Rejected",
                stage: "Closed",
                rejectionReason: "Auto-rejected: Settings update",
                autoRejected: true,
                autoRejectedAt: admin.firestore.FieldValue.serverTimestamp(),
                autoRejectedThreshold: after.autoRejectThreshold,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              });

            rejectedCount++;

            // Send rejection email if configured
            if (after.sendRejectionEmail) {
              await queueRejectionEmail(app.data);
            }
          }
        }
      }

      console.log(
        `[Pipeline Settings] Re-evaluation completed: ${rejectedCount} applications auto-rejected`
      );

      // Log the settings update
      await db
        .collection("companies")
        .doc(companyId)
        .collection("audit_log")
        .add({
          type: "pipeline_settings_update",
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          changes: {
            autoRejectEnabled: {
              from: before.autoRejectEnabled,
              to: after.autoRejectEnabled,
            },
            autoRejectThreshold: {
              from: before.autoRejectThreshold,
              to: after.autoRejectThreshold,
            },
          },
          impact: {
            applicationsReviewed: applicationsSnapshot.size,
            applicationsRejected: rejectedCount,
          },
        });
    } catch (error) {
      console.error("[Pipeline Settings] Error applying rules:", error);
    }
  });

/**
 * Queue rejection email for candidate
 */
async function queueRejectionEmail(application: any) {
  try {
    await db.collection("email_queue").add({
      to: application.candidateEmail,
      subject: `Application Update - ${application.jobTitle}`,
      html: generateRejectionEmail(application),
      status: "pending",
      type: "auto_rejection",
      applicationId: application.id,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(
      `[Pipeline Settings] Rejection email queued for: ${application.candidateEmail}`
    );
  } catch (error) {
    console.error("[Pipeline Settings] Error queuing rejection email:", error);
  }
}

/**
 * Generate rejection email HTML
 */
function generateRejectionEmail(application: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Update</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #333;">Application Update</h1>

  <p>Hi ${application.candidateName},</p>

  <p>Thank you for your interest in the <strong>${application.jobTitle}</strong> position${application.companyName ? ` at ${application.companyName}` : ""}.</p>

  <p>After careful review of your application, we've decided to move forward with other candidates whose qualifications more closely match our current needs for this specific role.</p>

  <p>We encourage you to:</p>
  <ul>
    <li>Apply for other positions that may be a better fit for your skills and experience</li>
    <li>Keep your profile updated for future opportunities</li>
    <li>Stay connected with us for upcoming positions</li>
  </ul>

  <p>We appreciate the time you took to apply and wish you the best in your job search.</p>

  <p>Best regards,<br>
  The Recruitment Team</p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

  <p style="font-size: 12px; color: #6b7280;">
    This is an automated message. Please do not reply to this email.
  </p>
</body>
</html>
  `.trim();
}

/**
 * Callable function to manually apply pipeline rules to all applications
 */
export const applyPipelineRules = functions.https.onCall(async (data, context) => {
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

    // Verify user has permission
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
        "Only HR Admins can apply pipeline rules"
      );
    }

    console.log(
      `[Apply Rules] Manual trigger for company: ${companyId} by user: ${context.auth.uid}`
    );

    // Get pipeline settings
    const settingsDoc = await db
      .collection("companies")
      .doc(companyId)
      .collection("settings")
      .doc("pipeline")
      .get();

    if (!settingsDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Pipeline settings not found"
      );
    }

    const settings = settingsDoc.data();

    if (!settings?.autoRejectEnabled) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Auto-reject is not enabled"
      );
    }

    // Trigger the update handler by making a minor update
    await settingsDoc.ref.update({
      lastManualApply: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      message: "Pipeline rules application triggered",
    };
  } catch (error) {
    console.error("[Apply Rules] Error:", error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      "internal",
      `Failed to apply pipeline rules: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
});
