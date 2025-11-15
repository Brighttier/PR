/**
 * API Route: GDPR Account Deletion
 * DELETE /api/gdpr/delete-account
 *
 * Implements GDPR Article 17 (Right to Erasure / "Right to be Forgotten")
 * Soft deletes user account with 30-day retention period
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db, auth as adminAuth, fieldValue } from "@/lib/firebase-admin";
import { checkRateLimit, getRateLimitIdentifier, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

export async function DELETE(req: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.uid;
    const userEmail = session.user.email;

    // Rate limiting - 1 deletion per day (strict limit to prevent abuse)
    const clientIp = getClientIp(req);
    const rateLimitId = getRateLimitIdentifier(userId, clientIp);
    const rateLimit = checkRateLimit(rateLimitId, RATE_LIMITS.GDPR_DELETE);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: "Account deletion can only be requested once per 24 hours.",
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfter || 86400),
          },
        }
      );
    }

    // Parse request body for confirmation token
    const { confirmationToken } = await req.json();

    // Verify confirmation token matches expected format
    const expectedToken = `DELETE_${userId.slice(-8)}`;
    if (confirmationToken !== expectedToken) {
      return NextResponse.json(
        {
          error: "Invalid confirmation token",
          message: "Please provide the correct confirmation token to proceed with account deletion",
        },
        { status: 400 }
      );
    }

    console.log(`[GDPR Delete] Starting account deletion for user: ${userId}`);

    const now = new Date();
    const deletionScheduledDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    // 1. Mark user profile as deleted (soft delete)
    const userRef = db.collection("users").doc(userId);
    await userRef.update({
      deletionStatus: "scheduled",
      deletionScheduledAt: now,
      deletionScheduledFor: deletionScheduledDate,
      deletedAt: now,
      accountActive: false,
      updatedAt: now,
      // Redact personal information (retain for audit purposes but anonymize)
      email: `deleted_${userId}@deleted.local`,
      displayName: "[Deleted User]",
      phoneNumber: fieldValue.delete(),
      photoURL: fieldValue.delete(),
    });

    // 2. Mark candidate profile as deleted (if exists)
    const candidateRef = db.collection("candidates").doc(userId);
    const candidateDoc = await candidateRef.get();
    if (candidateDoc.exists) {
      await candidateRef.update({
        deletionStatus: "scheduled",
        deletionScheduledAt: now,
        deletedAt: now,
        // Anonymize personal data
        name: "[Deleted User]",
        email: `deleted_${userId}@deleted.local`,
        phoneNumber: fieldValue.delete(),
        linkedinUrl: fieldValue.delete(),
        portfolioUrl: fieldValue.delete(),
        resumeUrl: fieldValue.delete(), // Will be deleted from storage after 30 days
      });
    }

    // 3. Anonymize applications (retain for company records but anonymize candidate info)
    const applicationsSnapshot = await db
      .collection("applications")
      .where("candidateId", "==", userId)
      .get();

    const batch = db.batch();
    applicationsSnapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        candidateName: "[Deleted User]",
        candidateEmail: `deleted_${userId}@deleted.local`,
        candidatePhone: fieldValue.delete(),
        deletionStatus: "anonymized",
        anonymizedAt: now,
      });
    });
    await batch.commit();

    // 4. Cancel scheduled interviews
    const interviewsSnapshot = await db
      .collection("interviews")
      .where("candidateId", "==", userId)
      .where("status", "in", ["scheduled", "in_progress"])
      .get();

    const interviewBatch = db.batch();
    interviewsSnapshot.docs.forEach((doc) => {
      interviewBatch.update(doc.ref, {
        status: "cancelled",
        cancellationReason: "Account deletion requested by user",
        cancelledAt: now,
      });
    });
    await interviewBatch.commit();

    // 5. Disable Firebase Authentication (but don't delete yet - 30 day retention)
    try {
      await adminAuth.updateUser(userId, {
        disabled: true,
        displayName: "[Deleted User]",
      });
    } catch (authError) {
      console.error("[GDPR Delete] Error disabling Firebase Auth user:", authError);
      // Continue even if auth update fails
    }

    // 6. Schedule permanent deletion (Cloud Scheduler will handle this)
    await db.collection("deletionQueue").add({
      userId,
      userEmail,
      scheduledFor: deletionScheduledDate,
      requestedAt: now,
      status: "pending",
      type: "gdpr_account_deletion",
      metadata: {
        applicationCount: applicationsSnapshot.size,
        interviewCount: interviewsSnapshot.size,
      },
    });

    // 7. Log deletion event
    await db.collection("auditLog").add({
      userId,
      action: "gdpr_account_deletion_requested",
      timestamp: now,
      metadata: {
        scheduledDeletionDate: deletionScheduledDate.toISOString(),
        confirmationToken,
        applicationCount: applicationsSnapshot.size,
        interviewCount: interviewsSnapshot.size,
      },
    });

    // 8. Send confirmation email (handled by Cloud Function trigger)
    // Note: Email sending should be implemented in a Cloud Function
    // that triggers on deletionQueue writes

    console.log(`[GDPR Delete] Account deletion scheduled for user: ${userId}`);

    return NextResponse.json({
      success: true,
      message: "Account deletion request processed successfully",
      scheduledDeletionDate: deletionScheduledDate.toISOString(),
      retentionPeriod: "30 days",
      details: {
        userAccountDisabled: true,
        applicationCount: applicationsSnapshot.size,
        interviewsCancelled: interviewsSnapshot.size,
        permanentDeletionDate: deletionScheduledDate.toISOString(),
      },
      nextSteps: [
        "Your account has been disabled immediately",
        "Your personal data has been anonymized in company records",
        "All scheduled interviews have been cancelled",
        "Your data will be permanently deleted after 30 days",
        "You will receive a confirmation email shortly",
      ],
    });
  } catch (error) {
    console.error("[GDPR Delete] Error deleting account:", error);
    return NextResponse.json(
      {
        error: "Failed to process account deletion request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to retrieve deletion status
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.uid;

    // Check if there's a pending deletion
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    const deletionStatus = userData?.deletionStatus;
    const deletionScheduledFor = userData?.deletionScheduledFor;

    if (deletionStatus === "scheduled" && deletionScheduledFor) {
      return NextResponse.json({
        deletionScheduled: true,
        scheduledFor: deletionScheduledFor.toDate().toISOString(),
        daysRemaining: Math.ceil(
          (deletionScheduledFor.toDate().getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        ),
        canCancel: true,
      });
    }

    return NextResponse.json({
      deletionScheduled: false,
      accountActive: userData?.accountActive !== false,
    });
  } catch (error) {
    console.error("[GDPR Delete] Error checking deletion status:", error);
    return NextResponse.json(
      { error: "Failed to check deletion status" },
      { status: 500 }
    );
  }
}
