/**
 * Cloud Function: Job Creation Handler
 * Triggered when a new job is created
 * Generates vector embeddings for semantic search
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * Generate vector embedding when job is created
 */
export const onJobCreate_VectorizeDescription = functions.firestore
  .document("jobs/{jobId}")
  .onCreate(async (snap, context) => {
    const job = snap.data();
    const jobId = context.params.jobId;

    try {
      console.log(`[Job Create] New job created: ${jobId}`);
      console.log(`  - Title: ${job.title}`);
      console.log(`  - Company: ${job.companyId}`);

      // Generate vector embedding for job description
      const { generateJobEmbedding } = await import("../../../ai/vector/embeddings");

      const embedding = await generateJobEmbedding(job);

      if (embedding) {
        // Store embedding in sub-collection
        await db
          .collection("jobs")
          .doc(jobId)
          .collection("embeddings")
          .doc("description")
          .set({
            embedding,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });

        console.log(`[Job Create] Vector embedding generated for job: ${jobId}`);
      }

      // Initialize job analytics document
      await db
        .collection("jobs")
        .doc(jobId)
        .collection("analytics")
        .doc("applications")
        .set({
          byStatus: {
            Applied: 0,
            "Under Review": 0,
            "Interview Scheduled": 0,
            "Offer Extended": 0,
            Hired: 0,
            Rejected: 0,
          },
          totalApplications: 0,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });

      console.log(`[Job Create] Analytics initialized for job: ${jobId}`);
    } catch (error) {
      console.error(`[Job Create] Error processing job creation:`, error);
    }
  });

/**
 * Notify recruiters when job is created
 */
export const onJobCreate_NotifyRecruiters = functions.firestore
  .document("jobs/{jobId}")
  .onCreate(async (snap, context) => {
    const job = snap.data();
    const jobId = context.params.jobId;

    try {
      console.log(`[Job Create] Notifying recruiters of new job: ${jobId}`);

      // Get all recruiters for this company
      const recruitersSnapshot = await db
        .collection("users")
        .where("companyId", "==", job.companyId)
        .where("role", "in", ["recruiter", "hr_admin"])
        .get();

      if (recruitersSnapshot.empty) {
        console.log(`[Job Create] No recruiters found for company: ${job.companyId}`);
        return;
      }

      // TODO: Send email notifications
      recruitersSnapshot.forEach((doc) => {
        const recruiter = doc.data();

        // Skip the creator
        if (recruiter.uid === job.createdBy) {
          return;
        }

        console.log(`[Job Create] Would notify recruiter: ${recruiter.email}`);
        console.log(`  - Job Title: ${job.title}`);
        console.log(`  - Department: ${job.department}`);
      });

      console.log(
        `[Job Create] Notified ${recruitersSnapshot.size} recruiters of new job`
      );
    } catch (error) {
      console.error(`[Job Create] Error notifying recruiters:`, error);
    }
  });

/**
 * Update company job count when job is created
 */
export const onJobCreate_UpdateCompanyStats = functions.firestore
  .document("jobs/{jobId}")
  .onCreate(async (snap, context) => {
    const job = snap.data();

    try {
      // Increment company job count
      await db
        .collection("companies")
        .doc(job.companyId)
        .update({
          totalJobs: admin.firestore.FieldValue.increment(1),
          activeJobs: job.status === "Open" ? admin.firestore.FieldValue.increment(1) : 0,
          lastJobCreatedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      console.log(`[Job Create] Updated company stats for: ${job.companyId}`);
    } catch (error) {
      console.error(`[Job Create] Error updating company stats:`, error);
    }
  });
