/**
 * Cloud Function: Send Interview Reminder
 * Sends reminder emails before scheduled interviews
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * Scheduled function to check for upcoming interviews
 * Runs every hour to send reminders
 */
export const checkUpcomingInterviews = functions.pubsub
  .schedule("every 1 hours")
  .onRun(async (context) => {
    try {
      console.log("[Interview Reminder] Checking for upcoming interviews");

      const now = admin.firestore.Timestamp.now();
      const in24Hours = new Date(now.toMillis() + 24 * 60 * 60 * 1000);

      // Find interviews scheduled in the next 24 hours that haven't been reminded
      const interviewsSnapshot = await db
        .collection("interviews")
        .where("status", "==", "scheduled")
        .where("scheduledAt", "<=", admin.firestore.Timestamp.fromDate(in24Hours))
        .where("scheduledAt", ">", now)
        .where("reminderSent", "==", false)
        .get();

      console.log(
        `[Interview Reminder] Found ${interviewsSnapshot.size} interviews to remind`
      );

      let remindersSent = 0;

      for (const doc of interviewsSnapshot.docs) {
        const interview = doc.data();
        const interviewId = doc.id;

        try {
          await sendInterviewReminder(interview, interviewId);

          // Mark reminder as sent
          await doc.ref.update({
            reminderSent: true,
            reminderSentAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          remindersSent++;
        } catch (error) {
          console.error(
            `[Interview Reminder] Error sending reminder for ${interviewId}:`,
            error
          );
        }
      }

      console.log(`[Interview Reminder] Sent ${remindersSent} reminders`);

      return { checked: interviewsSnapshot.size, sent: remindersSent };
    } catch (error) {
      console.error("[Interview Reminder] Error checking interviews:", error);
      throw error;
    }
  });

/**
 * Send interview reminder email
 */
async function sendInterviewReminder(interview: any, interviewId: string) {
  try {
    console.log(`[Reminder] Sending reminder for interview: ${interviewId}`);

    // Get company details
    const companyDoc = await db.collection("companies").doc(interview.companyId).get();
    const company = companyDoc.data();

    const scheduledDate = interview.scheduledAt.toDate();
    const formattedDate = scheduledDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedTime = scheduledDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });

    // Send to candidate
    await db.collection("email_queue").add({
      to: interview.candidateEmail,
      subject: `Reminder: Interview Tomorrow - ${interview.jobTitle}`,
      html: generateReminderEmail(interview, company, formattedDate, formattedTime),
      status: "pending",
      type: "interview_reminder",
      interviewId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`[Reminder] Candidate reminder queued for: ${interview.candidateEmail}`);

    // Send to interviewers (if face-to-face or panel)
    if (
      interview.assignedInterviewers &&
      interview.assignedInterviewers.length > 0
    ) {
      for (const interviewerId of interview.assignedInterviewers) {
        const interviewerDoc = await db.collection("users").doc(interviewerId).get();
        const interviewer = interviewerDoc.data();

        if (interviewer) {
          await db.collection("email_queue").add({
            to: interviewer.email,
            subject: `Reminder: Interview Tomorrow - ${interview.candidateName}`,
            html: generateInterviewerReminderEmail(
              interview,
              company,
              interviewer,
              formattedDate,
              formattedTime
            ),
            status: "pending",
            type: "interview_reminder",
            interviewId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          console.log(`[Reminder] Interviewer reminder queued for: ${interviewer.email}`);
        }
      }
    }
  } catch (error) {
    console.error("[Reminder] Error sending reminder:", error);
    throw error;
  }
}

/**
 * Generate HTML for candidate reminder email
 */
function generateReminderEmail(
  interview: any,
  company: any,
  formattedDate: string,
  formattedTime: string
): string {
  const companyName = company?.name || "the company";
  const companyLogo = company?.logoURL || "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Interview Reminder</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  ${companyLogo ? `<img src="${companyLogo}" alt="${companyName}" style="max-width: 150px; margin-bottom: 20px;">` : ""}

  <h1 style="color: #16a34a;">Interview Reminder</h1>

  <p>Hi ${interview.candidateName},</p>

  <p>This is a friendly reminder about your upcoming interview with ${companyName}.</p>

  <div style="background-color: #f0f9ff; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0;">
    <p style="margin: 0;"><strong>Position:</strong> ${interview.jobTitle}</p>
    <p style="margin: 10px 0 0 0;"><strong>Date:</strong> ${formattedDate}</p>
    <p style="margin: 10px 0 0 0;"><strong>Time:</strong> ${formattedTime}</p>
    <p style="margin: 10px 0 0 0;"><strong>Duration:</strong> ${interview.duration || 60} minutes</p>
    ${interview.meetingLink ? `<p style="margin: 10px 0 0 0;"><strong>Meeting Link:</strong> <a href="${interview.meetingLink}" style="color: #16a34a;">${interview.meetingLink}</a></p>` : ""}
    ${interview.location ? `<p style="margin: 10px 0 0 0;"><strong>Location:</strong> ${interview.location}</p>` : ""}
  </div>

  <h3>Tips for Success:</h3>
  <ul>
    <li>Test your camera and microphone 15 minutes before the interview</li>
    <li>Find a quiet, well-lit space for the interview</li>
    <li>Have a copy of your resume handy</li>
    <li>Prepare questions about the role and company</li>
    <li>Join the meeting 5 minutes early</li>
  </ul>

  <p>We're looking forward to speaking with you!</p>

  <p>Best regards,<br>
  The ${companyName} Recruitment Team</p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

  <p style="font-size: 12px; color: #6b7280;">
    If you need to reschedule, please contact us as soon as possible.
  </p>
</body>
</html>
  `.trim();
}

/**
 * Generate HTML for interviewer reminder email
 */
function generateInterviewerReminderEmail(
  interview: any,
  company: any,
  interviewer: any,
  formattedDate: string,
  formattedTime: string
): string {
  const companyName = company?.name || "the company";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Interview Reminder</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #16a34a;">Interview Reminder</h1>

  <p>Hi ${interviewer.displayName},</p>

  <p>Reminder: You have an interview scheduled for tomorrow.</p>

  <div style="background-color: #f0f9ff; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0;">
    <p style="margin: 0;"><strong>Candidate:</strong> ${interview.candidateName}</p>
    <p style="margin: 10px 0 0 0;"><strong>Position:</strong> ${interview.jobTitle}</p>
    <p style="margin: 10px 0 0 0;"><strong>Date:</strong> ${formattedDate}</p>
    <p style="margin: 10px 0 0 0;"><strong>Time:</strong> ${formattedTime}</p>
    <p style="margin: 10px 0 0 0;"><strong>Duration:</strong> ${interview.duration || 60} minutes</p>
    ${interview.meetingLink ? `<p style="margin: 10px 0 0 0;"><strong>Meeting Link:</strong> <a href="${interview.meetingLink}" style="color: #16a34a;">${interview.meetingLink}</a></p>` : ""}
  </div>

  ${interview.notes ? `<p><strong>Interview Notes:</strong><br>${interview.notes}</p>` : ""}

  <p>
    <a href="https://app.personarecruit.ai/interviewer/interviews/${interview.id}" style="display: inline-block; background-color: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
      View Candidate Profile
    </a>
  </p>

  <p>Best regards,<br>
  ${companyName} Recruitment System</p>
</body>
</html>
  `.trim();
}

/**
 * Callable function to manually send interview reminder
 */
export const sendInterviewReminderManual = functions.https.onCall(
  async (data, context) => {
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

      await sendInterviewReminder(interview, interviewId);

      return {
        success: true,
        message: "Reminder sent",
      };
    } catch (error) {
      console.error("[Reminder] Error:", error);

      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      throw new functions.https.HttpsError(
        "internal",
        `Failed to send reminder: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
);
