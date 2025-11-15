/**
 * Cloud Function: Send Application Confirmation Email
 * Sends a confirmation email to candidate when they submit an application
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * Callable function to send application confirmation
 */
export const sendApplicationConfirmation = functions.https.onCall(
  async (data, context) => {
    try {
      const { applicationId } = data;

      if (!applicationId) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Missing required parameter: applicationId"
        );
      }

      console.log(`[Confirmation] Sending confirmation for application: ${applicationId}`);

      // Get application details
      const appDoc = await db.collection("applications").doc(applicationId).get();

      if (!appDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Application not found");
      }

      const application = appDoc.data();

      if (!application) {
        throw new functions.https.HttpsError("not-found", "Application data not found");
      }

      // Get company details
      const companyDoc = await db.collection("companies").doc(application.companyId).get();
      const company = companyDoc.data();

      // Prepare email data
      const emailData = {
        to: application.candidateEmail,
        subject: `Application Received - ${application.jobTitle}${company ? ` at ${company.name}` : ""}`,
        html: generateConfirmationEmail(application, company),
      };

      // Queue email
      await db.collection("email_queue").add({
        ...emailData,
        status: "pending",
        type: "application_confirmation",
        applicationId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`[Confirmation] Email queued for: ${application.candidateEmail}`);

      return {
        success: true,
        message: "Confirmation email sent",
      };
    } catch (error) {
      console.error("[Confirmation] Error:", error);

      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      throw new functions.https.HttpsError(
        "internal",
        `Failed to send confirmation: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
);

/**
 * Generate HTML for application confirmation email
 */
function generateConfirmationEmail(application: any, company: any): string {
  const companyName = company?.name || "our company";
  const companyLogo = company?.logoURL || "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Received</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  ${companyLogo ? `<img src="${companyLogo}" alt="${companyName}" style="max-width: 150px; margin-bottom: 20px;">` : ""}

  <h1 style="color: #16a34a;">Application Received!</h1>

  <p>Hi ${application.candidateName},</p>

  <p>Thank you for applying for the <strong>${application.jobTitle}</strong> position at ${companyName}.</p>

  <p>We've successfully received your application and our team will review it carefully. Here's what happens next:</p>

  <ol>
    <li><strong>Application Review:</strong> Our recruitment team will review your application and resume.</li>
    <li><strong>AI Screening:</strong> You may be invited to complete an AI-powered screening interview.</li>
    <li><strong>Team Interview:</strong> Qualified candidates will be invited for interviews with our team.</li>
    <li><strong>Decision:</strong> We'll notify you of our decision via email.</li>
  </ol>

  <div style="background-color: #f0f9ff; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0;">
    <p style="margin: 0;"><strong>Application ID:</strong> ${application.id || applicationId}</p>
    <p style="margin: 10px 0 0 0;"><strong>Position:</strong> ${application.jobTitle}</p>
    <p style="margin: 10px 0 0 0;"><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</p>
  </div>

  <p>We typically respond within 5-7 business days. If you're selected to move forward, we'll contact you via email.</p>

  <p>In the meantime, feel free to explore other opportunities at ${companyName}.</p>

  <p>Best regards,<br>
  The ${companyName} Recruitment Team</p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

  <p style="font-size: 12px; color: #6b7280;">
    This is an automated message. Please do not reply to this email.
  </p>
</body>
</html>
  `.trim();
}

/**
 * Automatically send confirmation when application is created
 * (Alternative to manual trigger)
 */
export const autoSendApplicationConfirmation = functions.firestore
  .document("applications/{applicationId}")
  .onCreate(async (snap, context) => {
    const application = snap.data();
    const applicationId = context.params.applicationId;

    try {
      console.log(
        `[Auto Confirmation] Sending for application: ${applicationId}`
      );

      // Get company details
      const companyDoc = await db
        .collection("companies")
        .doc(application.companyId)
        .get();
      const company = companyDoc.data();

      // Queue confirmation email
      await db.collection("email_queue").add({
        to: application.candidateEmail,
        subject: `Application Received - ${application.jobTitle}${company ? ` at ${company.name}` : ""}`,
        html: generateConfirmationEmail(application, company),
        status: "pending",
        type: "application_confirmation",
        applicationId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(
        `[Auto Confirmation] Email queued for: ${application.candidateEmail}`
      );
    } catch (error) {
      console.error("[Auto Confirmation] Error:", error);
    }
  });
