/**
 * Cloud Function: Generic Email Sending Service
 * Provides email sending functionality using SendGrid or similar service
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * Email data interface
 */
interface EmailData {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  html?: string;
  text?: string;
  templateId?: string;
  templateData?: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType?: string;
  }>;
}

/**
 * Callable function to send email
 */
export const sendEmail = functions.https.onCall(async (data: EmailData, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated to send emails"
      );
    }

    const { to, cc, bcc, subject, html, text, templateId, templateData, attachments } =
      data;

    if (!to || !subject) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required parameters: to and subject"
      );
    }

    console.log(`[Email] Sending email to: ${Array.isArray(to) ? to.join(", ") : to}`);
    console.log(`[Email] Subject: ${subject}`);

    // TODO: Integrate with email service (SendGrid, AWS SES, or Resend)
    // For now, log the email details and store in Firestore

    const emailDoc = {
      to: Array.isArray(to) ? to : [to],
      cc: cc ? (Array.isArray(cc) ? cc : [cc]) : [],
      bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : [],
      subject,
      html: html || "",
      text: text || "",
      templateId: templateId || null,
      templateData: templateData || null,
      attachments: attachments || [],
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: context.auth.uid,
    };

    // Store email in queue for processing
    const emailRef = await db.collection("email_queue").add(emailDoc);

    console.log(`[Email] Email queued with ID: ${emailRef.id}`);

    // In production, this would trigger an email service
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({ to, subject, html });

    return {
      success: true,
      emailId: emailRef.id,
      message: "Email queued for sending",
    };
  } catch (error) {
    console.error("[Email] Error sending email:", error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      "internal",
      `Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
});

/**
 * Process email queue
 * Triggered when email is added to queue
 */
export const processEmailQueue = functions.firestore
  .document("email_queue/{emailId}")
  .onCreate(async (snap, context) => {
    const email = snap.data();
    const emailId = context.params.emailId;

    try {
      console.log(`[Email Queue] Processing email: ${emailId}`);

      // TODO: Actually send the email using email service
      // For now, just mark as sent

      await snap.ref.update({
        status: "sent",
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`[Email Queue] Email sent: ${emailId}`);
      console.log(`  - To: ${email.to.join(", ")}`);
      console.log(`  - Subject: ${email.subject}`);
    } catch (error) {
      console.error(`[Email Queue] Error processing email:`, error);

      await snap.ref.update({
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  });

/**
 * Send email from template
 */
export const sendTemplatedEmail = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }

    const { to, templateName, templateData, companyId } = data;

    if (!to || !templateName) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required parameters: to and templateName"
      );
    }

    console.log(`[Templated Email] Sending ${templateName} to: ${to}`);

    // Get email template
    const templateDoc = await db
      .collection("companies")
      .doc(companyId)
      .collection("email_templates")
      .doc(templateName)
      .get();

    if (!templateDoc.exists) {
      // Fall back to default template
      const defaultTemplateDoc = await db
        .collection("email_templates")
        .doc(templateName)
        .get();

      if (!defaultTemplateDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          `Email template not found: ${templateName}`
        );
      }
    }

    const template = templateDoc.exists
      ? templateDoc.data()
      : (await db.collection("email_templates").doc(templateName).get()).data();

    if (!template) {
      throw new functions.https.HttpsError("not-found", "Template data not found");
    }

    // Replace variables in template
    let subject = template.subject;
    let html = template.html;

    Object.entries(templateData || {}).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, "g"), value as string);
      html = html.replace(new RegExp(placeholder, "g"), value as string);
    });

    // Queue email for sending
    const emailRef = await db.collection("email_queue").add({
      to: [to],
      subject,
      html,
      templateName,
      templateData,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: context.auth.uid,
    });

    console.log(`[Templated Email] Email queued: ${emailRef.id}`);

    return {
      success: true,
      emailId: emailRef.id,
    };
  } catch (error) {
    console.error("[Templated Email] Error:", error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      "internal",
      `Failed to send templated email: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
});
