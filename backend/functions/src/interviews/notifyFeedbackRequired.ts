/**
 * Cloud Function: Notify Interviewers to Submit Feedback
 * Sends reminders to interviewers who haven't submitted feedback
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * Scheduled function to check for pending feedback
 * Runs daily to remind interviewers
 */
export const checkPendingFeedback = functions.pubsub
  .schedule("every day 09:00")
  .timeZone("America/New_York")
  .onRun(async (context) => {
    try {
      console.log("[Feedback Reminder] Checking for pending feedback");

      const now = admin.firestore.Timestamp.now();
      const twoDaysAgo = new Date(now.toMillis() - 2 * 24 * 60 * 60 * 1000);

      // Find completed interviews without feedback (completed > 2 days ago)
      const interviewsSnapshot = await db
        .collection("interviews")
        .where("status", "==", "completed")
        .where("feedbackSubmitted", "==", false)
        .where("completedAt", "<", admin.firestore.Timestamp.fromDate(twoDaysAgo))
        .get();

      console.log(
        `[Feedback Reminder] Found ${interviewsSnapshot.size} interviews with pending feedback`
      );

      let remindersSent = 0;

      for (const doc of interviewsSnapshot.docs) {
        const interview = doc.data();

        // For face-to-face interviews, notify assigned interviewers
        if (
          interview.type === "face_to_face" ||
          interview.type === "panel"
        ) {
          if (interview.assignedInterviewers && interview.assignedInterviewers.length > 0) {
            await notifyInterviewers(interview, doc.id);
            remindersSent++;
          }
        }
      }

      console.log(
        `[Feedback Reminder] Sent ${remindersSent} feedback reminder notifications`
      );

      return { checked: interviewsSnapshot.size, reminders: remindersSent };
    } catch (error) {
      console.error("[Feedback Reminder] Error checking pending feedback:", error);
      throw error;
    }
  });

/**
 * Notify assigned interviewers to submit feedback
 */
async function notifyInterviewers(interview: any, interviewId: string) {
  try {
    // Get interviewer details
    for (const interviewerId of interview.assignedInterviewers) {
      const interviewerDoc = await db.collection("users").doc(interviewerId).get();
      const interviewer = interviewerDoc.data();

      if (!interviewer) {
        console.warn(`[Feedback Reminder] Interviewer not found: ${interviewerId}`);
        continue;
      }

      // Check if this interviewer has already submitted feedback
      const feedbackSnapshot = await db
        .collection("feedback")
        .where("interviewId", "==", interviewId)
        .where("interviewerId", "==", interviewerId)
        .limit(1)
        .get();

      if (!feedbackSnapshot.empty) {
        console.log(
          `[Feedback Reminder] Interviewer ${interviewer.email} already submitted feedback`
        );
        continue;
      }

      // Send reminder email
      console.log(
        `[Feedback Reminder] Sending reminder to: ${interviewer.email}`
      );

      // TODO: Integrate with email service
      const emailData = {
        to: interviewer.email,
        subject: `Reminder: Interview Feedback Needed - ${interview.candidateName}`,
        template: "feedback_reminder",
        data: {
          interviewerName: interviewer.displayName,
          candidateName: interview.candidateName,
          jobTitle: interview.jobTitle,
          interviewDate: interview.completedAt.toDate().toLocaleDateString(),
          feedbackLink: `https://app.personarecruit.ai/interviewer/feedback/${interviewId}`,
        },
      };

      console.log(`[Feedback Reminder] Email would be sent:`, emailData);
    }
  } catch (error) {
    console.error("[Feedback Reminder] Error notifying interviewers:", error);
  }
}

/**
 * Trigger notification immediately when interview is completed
 */
export const onInterviewComplete_RequestFeedback = functions.firestore
  .document("interviews/{interviewId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const interviewId = context.params.interviewId;

    // Only trigger if status changed to "completed"
    if (before.status !== "completed" && after.status === "completed") {
      try {
        console.log(
          `[Feedback Request] Interview completed: ${interviewId}, requesting feedback`
        );

        // For face-to-face interviews, immediately notify interviewers
        if (
          after.type === "face_to_face" ||
          after.type === "panel"
        ) {
          await notifyInterviewers(after, interviewId);

          console.log(
            `[Feedback Request] Notified interviewers for interview: ${interviewId}`
          );
        }

        // For AI interviews, feedback is auto-generated (already handled in index.ts)
      } catch (error) {
        console.error("[Feedback Request] Error requesting feedback:", error);
      }
    }
  });

/**
 * Callable function to manually send feedback reminder
 */
export const sendFeedbackReminder = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }

    const { interviewId } = data;

    if (!interviewId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required parameter: interviewId"
      );
    }

    // Get interview
    const interviewDoc = await db.collection("interviews").doc(interviewId).get();

    if (!interviewDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Interview not found");
    }

    const interview = interviewDoc.data();

    if (interview?.status !== "completed") {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Interview is not completed yet"
      );
    }

    // Send notifications
    await notifyInterviewers(interview, interviewId);

    console.log(`[Feedback Reminder] Manual reminder sent for interview: ${interviewId}`);

    return {
      success: true,
      interviewId,
      message: "Feedback reminder sent",
    };
  } catch (error) {
    console.error("[Feedback Reminder] Error sending manual reminder:", error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      "internal",
      `Failed to send feedback reminder: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
});
