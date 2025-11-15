/**
 * API Route: GDPR Data Export
 * POST /api/gdpr/export-data
 *
 * Exports all user data in compliance with GDPR Article 15 (Right of Access)
 * Generates a comprehensive JSON export of all personal data
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db, storage } from "@/lib/firebase-admin";
import { checkRateLimit, getRateLimitIdentifier, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

interface UserDataExport {
  metadata: {
    exportedAt: string;
    userId: string;
    email: string;
    exportVersion: string;
  };
  profile: any;
  applications: any[];
  interviews: any[];
  notes: any[];
  communications: any[];
  consents: any[];
  auditLog: any[];
}

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.uid;
    const userEmail = session.user.email;

    // Rate limiting - 3 exports per hour
    const clientIp = getClientIp(req);
    const rateLimitId = getRateLimitIdentifier(userId, clientIp);
    const rateLimit = checkRateLimit(rateLimitId, RATE_LIMITS.GDPR_EXPORT);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: "Too many export requests. Please try again later.",
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfter || 60),
            "X-RateLimit-Limit": String(RATE_LIMITS.GDPR_EXPORT.maxRequests),
            "X-RateLimit-Remaining": String(rateLimit.remaining),
            "X-RateLimit-Reset": String(Math.floor(rateLimit.resetTime / 1000)),
          },
        }
      );
    }

    console.log(`[GDPR Export] Starting data export for user: ${userId}`);

    // Initialize export object
    const exportData: UserDataExport = {
      metadata: {
        exportedAt: new Date().toISOString(),
        userId,
        email: userEmail,
        exportVersion: "1.0",
      },
      profile: {},
      applications: [],
      interviews: [],
      notes: [],
      communications: [],
      consents: [],
      auditLog: [],
    };

    // 1. Export user profile
    const userDoc = await db.collection("users").doc(userId).get();
    if (userDoc.exists) {
      exportData.profile = {
        ...userDoc.data(),
        id: userDoc.id,
      };
    }

    // 2. Export candidate profile (if exists)
    const candidateDoc = await db.collection("candidates").doc(userId).get();
    if (candidateDoc.exists) {
      exportData.profile.candidateProfile = {
        ...candidateDoc.data(),
        id: candidateDoc.id,
      };
    }

    // 3. Export all applications
    const applicationsSnapshot = await db
      .collection("applications")
      .where("candidateId", "==", userId)
      .get();

    exportData.applications = applicationsSnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    // 4. Export all interviews
    const interviewsSnapshot = await db
      .collection("interviews")
      .where("candidateId", "==", userId)
      .get();

    exportData.interviews = interviewsSnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    // 5. Export interview feedback (from applications sub-collection)
    for (const app of exportData.applications) {
      const feedbackSnapshot = await db
        .collection("applications")
        .doc(app.id)
        .collection("feedback")
        .get();

      if (!feedbackSnapshot.empty) {
        if (!exportData.notes) exportData.notes = [];
        feedbackSnapshot.docs.forEach((doc) => {
          exportData.notes.push({
            type: "interview_feedback",
            applicationId: app.id,
            ...doc.data(),
            id: doc.id,
          });
        });
      }
    }

    // 6. Export communications (emails sent to/from user)
    const communicationsSnapshot = await db
      .collection("communications")
      .where("recipientId", "==", userId)
      .get();

    exportData.communications = communicationsSnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    // 7. Export consent records
    const consentsSnapshot = await db
      .collection("consents")
      .where("userId", "==", userId)
      .get();

    exportData.consents = consentsSnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    // 8. Export audit log entries
    const auditLogSnapshot = await db
      .collection("auditLog")
      .where("userId", "==", userId)
      .orderBy("timestamp", "desc")
      .limit(500) // Last 500 entries
      .get();

    exportData.auditLog = auditLogSnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    // 9. Generate downloadable file
    const exportJson = JSON.stringify(exportData, null, 2);
    const exportFileName = `persona-ai-data-export-${userId}-${Date.now()}.json`;

    // Upload to Firebase Storage (temporary, 7-day expiration)
    const bucket = storage.bucket();
    const file = bucket.file(`gdpr-exports/${userId}/${exportFileName}`);

    await file.save(exportJson, {
      contentType: "application/json",
      metadata: {
        metadata: {
          userId,
          exportedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        },
      },
    });

    // Generate signed URL (valid for 7 days)
    const [signedUrl] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Log export event
    await db.collection("auditLog").add({
      userId,
      action: "gdpr_data_export",
      timestamp: new Date(),
      metadata: {
        fileName: exportFileName,
        recordCounts: {
          applications: exportData.applications.length,
          interviews: exportData.interviews.length,
          communications: exportData.communications.length,
          consents: exportData.consents.length,
          auditLog: exportData.auditLog.length,
        },
      },
    });

    console.log(`[GDPR Export] Successfully exported data for user: ${userId}`);

    // Return download URL
    return NextResponse.json({
      success: true,
      message: "Data export completed successfully",
      downloadUrl: signedUrl,
      fileName: exportFileName,
      expiresIn: "7 days",
      recordCounts: {
        applications: exportData.applications.length,
        interviews: exportData.interviews.length,
        communications: exportData.communications.length,
        consents: exportData.consents.length,
        auditLog: exportData.auditLog.length,
      },
    });
  } catch (error) {
    console.error("[GDPR Export] Error exporting user data:", error);
    return NextResponse.json(
      {
        error: "Failed to export user data",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
