/**
 * Cloud Function: Vectorize Job Description
 * Callable function to manually trigger vectorization for a job
 * Can also be used to batch process existing jobs
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * Manually trigger job description vectorization
 */
export const vectorizeJobDescription = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }

    const { jobId } = data;

    if (!jobId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required parameter: jobId"
      );
    }

    console.log(`[Vectorize] Vectorizing job: ${jobId}`);

    // Get job document
    const jobDoc = await db.collection("jobs").doc(jobId).get();

    if (!jobDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Job not found");
    }

    const job = jobDoc.data();

    if (!job) {
      throw new functions.https.HttpsError("not-found", "Job data not found");
    }

    // Generate vector embedding
    const { generateJobEmbedding } = await import("../../../ai/vector/embeddings");

    const embedding = await generateJobEmbedding(job);

    if (!embedding) {
      throw new functions.https.HttpsError(
        "internal",
        "Failed to generate embedding"
      );
    }

    // Store embedding
    await db
      .collection("jobs")
      .doc(jobId)
      .collection("embeddings")
      .doc("description")
      .set({
        embedding,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    console.log(`[Vectorize] Successfully vectorized job: ${jobId}`);

    return {
      success: true,
      jobId,
      embeddingLength: embedding.length,
    };
  } catch (error) {
    console.error("[Vectorize] Error:", error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      "internal",
      `Failed to vectorize job: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
});

/**
 * Batch vectorize all jobs for a company
 */
export const batchVectorizeJobs = functions.https.onCall(async (data, context) => {
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
        "Only HR Admins can batch vectorize jobs"
      );
    }

    console.log(`[Batch Vectorize] Starting for company: ${companyId}`);

    // Get all jobs for this company
    const jobsSnapshot = await db
      .collection("jobs")
      .where("companyId", "==", companyId)
      .get();

    console.log(`[Batch Vectorize] Found ${jobsSnapshot.size} jobs to process`);

    const { generateJobEmbedding } = await import("../../../ai/vector/embeddings");

    let processed = 0;
    let errors = 0;

    // Process each job
    for (const doc of jobsSnapshot.docs) {
      try {
        const job = doc.data();
        const jobId = doc.id;

        console.log(`[Batch Vectorize] Processing job: ${jobId}`);

        const embedding = await generateJobEmbedding(job);

        if (embedding) {
          await db
            .collection("jobs")
            .doc(jobId)
            .collection("embeddings")
            .doc("description")
            .set({
              embedding,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

          processed++;
        }

        // Small delay to avoid rate limits
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(
          `[Batch Vectorize] Error processing job ${doc.id}:`,
          error
        );
        errors++;
      }
    }

    console.log(
      `[Batch Vectorize] Completed: ${processed} processed, ${errors} errors`
    );

    return {
      success: true,
      total: jobsSnapshot.size,
      processed,
      errors,
    };
  } catch (error) {
    console.error("[Batch Vectorize] Error:", error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      "internal",
      `Failed to batch vectorize jobs: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
});
