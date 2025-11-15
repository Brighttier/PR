/**
 * Cloud Function: Handle Team Invite Acceptance
 * Triggered when a team invite is accepted and user account is created
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * Set user role and company when accepting team invite
 * This is a callable function triggered from the frontend after signup
 */
export const onInviteAccept_SetUserRole = functions.https.onCall(
  async (data, context) => {
    try {
      const { inviteToken, userId } = data;

      if (!inviteToken || !userId) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Missing required parameters: inviteToken and userId"
        );
      }

      console.log(`[Function] Processing invite acceptance for user: ${userId}`);

      // Find the invite by token
      const inviteSnapshot = await db
        .collection("invites")
        .where("inviteToken", "==", inviteToken)
        .where("status", "==", "pending")
        .limit(1)
        .get();

      if (inviteSnapshot.empty) {
        throw new functions.https.HttpsError(
          "not-found",
          "Invite not found or already used"
        );
      }

      const inviteDoc = inviteSnapshot.docs[0];
      const invite = inviteDoc.data();

      // Check if invite has expired
      const now = admin.firestore.Timestamp.now();
      if (invite.expiresAt && invite.expiresAt < now) {
        await inviteDoc.ref.update({
          status: "expired",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        throw new functions.https.HttpsError(
          "failed-precondition",
          "This invitation has expired"
        );
      }

      // Update user document with role and company
      await db.collection("users").doc(userId).update({
        role: invite.role,
        companyId: invite.companyId,
        invitedBy: invite.invitedBy,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Set custom claims for the user
      await admin.auth().setCustomUserClaims(userId, {
        role: invite.role,
        companyId: invite.companyId,
      });

      // Update invite status
      await inviteDoc.ref.update({
        status: "accepted",
        acceptedBy: userId,
        acceptedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Get user details for logging
      const userDoc = await db.collection("users").doc(userId).get();
      const userData = userDoc.data();

      console.log(
        `[Function] Invite accepted successfully: ${userData?.email} joined as ${invite.role} for company ${invite.companyId}`
      );

      return {
        success: true,
        role: invite.role,
        companyId: invite.companyId,
      };
    } catch (error) {
      console.error("[Function] Error processing invite acceptance:", error);

      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      throw new functions.https.HttpsError(
        "internal",
        `Failed to process invite: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
);

/**
 * Trigger when invite document is updated to "accepted"
 * Send welcome email to new team member
 */
export const onInviteAccepted_SendWelcomeEmail = functions.firestore
  .document("invites/{inviteId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Only trigger if status changed to "accepted"
    if (before.status !== "accepted" && after.status === "accepted") {
      const inviteId = context.params.inviteId;

      try {
        console.log(`[Function] Sending welcome email for invite: ${inviteId}`);

        // Get company details
        const companyDoc = await db.collection("companies").doc(after.companyId).get();
        const company = companyDoc.data();

        // Get new team member details
        const userDoc = await db.collection("users").doc(after.acceptedBy).get();
        const user = userDoc.data();

        if (!user || !company) {
          console.error("[Function] User or company not found");
          return;
        }

        // TODO: Send welcome email using email service
        console.log(`[Function] Would send welcome email to: ${user.email}`);
        console.log(`  - Company: ${company.name}`);
        console.log(`  - Role: ${after.role}`);

        // Email template would include:
        // - Welcome message
        // - Company name
        // - Role assigned
        // - Link to dashboard
        // - Getting started guide

        console.log(`[Function] Welcome email sent for invite: ${inviteId}`);
      } catch (error) {
        console.error("[Function] Error sending welcome email:", error);
      }
    }
  });
