/**
 * Cloud Function: Set Custom User Claims
 * Callable function to set or update user roles and custom claims
 * Only accessible by HR Admins and Platform Admins
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * Set custom claims for a user
 * Used when:
 * - Changing user role
 * - Assigning user to company
 * - Updating permissions
 */
export const setCustomClaims = functions.https.onCall(async (data, context) => {
  try {
    // Ensure user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated to set custom claims"
      );
    }

    const callerId = context.auth.uid;
    const { targetUserId, role, companyId } = data;

    if (!targetUserId || !role) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required parameters: targetUserId and role"
      );
    }

    console.log(
      `[Function] Setting custom claims for user ${targetUserId} by ${callerId}`
    );

    // Get caller's user document
    const callerDoc = await db.collection("users").doc(callerId).get();
    const caller = callerDoc.data();

    if (!caller) {
      throw new functions.https.HttpsError("not-found", "Caller user not found");
    }

    // Verify caller has permission
    const hasPermission =
      caller.role === "hr_admin" || caller.role === "platform_admin";

    if (!hasPermission) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Only HR Admins and Platform Admins can set custom claims"
      );
    }

    // If caller is HR Admin, verify they're managing users in their own company
    if (caller.role === "hr_admin" && caller.companyId !== companyId) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "HR Admins can only manage users in their own company"
      );
    }

    // Validate role
    const validRoles = [
      "candidate",
      "recruiter",
      "interviewer",
      "hr_admin",
      "platform_admin",
    ];

    if (!validRoles.includes(role)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        `Invalid role: ${role}. Must be one of: ${validRoles.join(", ")}`
      );
    }

    // Set custom claims
    const claims: Record<string, any> = { role };

    if (companyId) {
      claims.companyId = companyId;
    }

    await admin.auth().setCustomUserClaims(targetUserId, claims);

    // Update user document in Firestore
    const updateData: Record<string, any> = {
      role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: callerId,
    };

    if (companyId) {
      updateData.companyId = companyId;
    }

    await db.collection("users").doc(targetUserId).update(updateData);

    // Get target user details for logging
    const targetUserDoc = await db.collection("users").doc(targetUserId).get();
    const targetUser = targetUserDoc.data();

    console.log(
      `[Function] Custom claims set successfully for ${targetUser?.email}: role=${role}, companyId=${companyId || "none"}`
    );

    return {
      success: true,
      userId: targetUserId,
      claims,
    };
  } catch (error) {
    console.error("[Function] Error setting custom claims:", error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      "internal",
      `Failed to set custom claims: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
});

/**
 * Update user role (wrapper for setCustomClaims)
 * Simplified interface for role updates
 */
export const updateUserRole = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }

    const { userId, newRole } = data;

    if (!userId || !newRole) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required parameters: userId and newRole"
      );
    }

    // Get user's current company
    const userDoc = await db.collection("users").doc(userId).get();
    const user = userDoc.data();

    if (!user) {
      throw new functions.https.HttpsError("not-found", "User not found");
    }

    // Call setCustomClaims with current company
    return setCustomClaims.run(
      {
        targetUserId: userId,
        role: newRole,
        companyId: user.companyId,
      },
      context
    );
  } catch (error) {
    console.error("[Function] Error updating user role:", error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      "internal",
      `Failed to update user role: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
});
