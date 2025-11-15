/**
 * Cloud Function: Job Update Handler
 * Triggered when a job is updated
 * Regenerates vector embeddings if description changes
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * Regenerate vector embedding when job description changes
 */
export const onJobUpdate_UpdateEmbedding = functions.firestore
  .document("jobs/{jobId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const jobId = context.params.jobId;

    try {
      // Check if description or requirements changed
      const descriptionChanged = before.description !== after.description;
      const skillsChanged =
        JSON.stringify(before.requiredSkills) !== JSON.stringify(after.requiredSkills);

      if (!descriptionChanged && !skillsChanged) {
        return; // No relevant changes
      }

      console.log(`[Job Update] Job description changed: ${jobId}`);
      console.log(`  - Description changed: ${descriptionChanged}`);
      console.log(`  - Skills changed: ${skillsChanged}`);

      // Regenerate vector embedding
      const { generateJobEmbedding } = await import("../../../ai/vector/embeddings");

      const embedding = await generateJobEmbedding(after);

      if (embedding) {
        // Update embedding in sub-collection
        await db
          .collection("jobs")
          .doc(jobId)
          .collection("embeddings")
          .doc("description")
          .set(
            {
              embedding,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );

        console.log(`[Job Update] Vector embedding updated for job: ${jobId}`);
      }
    } catch (error) {
      console.error(`[Job Update] Error updating embedding:`, error);
    }
  });

/**
 * Update company stats when job status changes
 */
export const onJobUpdate_UpdateCompanyStats = functions.firestore
  .document("jobs/{jobId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    try {
      // Check if status changed
      if (before.status === after.status) {
        return;
      }

      console.log(`[Job Update] Job status changed: ${before.status} → ${after.status}`);

      const companyRef = db.collection("companies").doc(after.companyId);

      // Update active jobs count
      if (before.status === "Open" && after.status !== "Open") {
        // Job was closed
        await companyRef.update({
          activeJobs: admin.firestore.FieldValue.increment(-1),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else if (before.status !== "Open" && after.status === "Open") {
        // Job was reopened
        await companyRef.update({
          activeJobs: admin.firestore.FieldValue.increment(1),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      console.log(`[Job Update] Company stats updated for: ${after.companyId}`);
    } catch (error) {
      console.error(`[Job Update] Error updating company stats:`, error);
    }
  });

/**
 * Notify recruiters when job is archived or closed
 */
export const onJobUpdate_NotifyStatusChange = functions.firestore
  .document("jobs/{jobId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const jobId = context.params.jobId;

    try {
      // Only notify for significant status changes
      const statusChanged = before.status !== after.status;

      if (
        !statusChanged ||
        !["Closed", "Archived"].includes(after.status)
      ) {
        return;
      }

      console.log(
        `[Job Update] Job status changed to ${after.status}: ${jobId}, notifying recruiters`
      );

      // Get recruiters for this company
      const recruitersSnapshot = await db
        .collection("users")
        .where("companyId", "==", after.companyId)
        .where("role", "in", ["recruiter", "hr_admin"])
        .get();

      if (recruitersSnapshot.empty) {
        return;
      }

      // TODO: Send email notifications
      recruitersSnapshot.forEach((doc) => {
        const recruiter = doc.data();

        console.log(`[Job Update] Would notify recruiter: ${recruiter.email}`);
        console.log(`  - Job: ${after.title}`);
        console.log(`  - Status: ${after.status}`);
      });

      console.log(
        `[Job Update] Notified ${recruitersSnapshot.size} recruiters of status change`
      );
    } catch (error) {
      console.error(`[Job Update] Error notifying recruiters:`, error);
    }
  });
