/**
 * API Route: Platform Admin Impersonation
 * POST /api/admin/impersonate
 *
 * Allows platform admins to impersonate company users for support purposes
 * Implements strict security controls and audit logging
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db, auth as adminAuth } from "@/lib/firebase-admin";
import crypto from "crypto";

interface ImpersonationRequest {
  targetUserId: string;
  reason: string;
  duration?: number; // Duration in minutes, default 60
}

interface ImpersonationToken {
  token: string;
  adminUserId: string;
  adminEmail: string;
  targetUserId: string;
  targetEmail: string;
  reason: string;
  createdAt: Date;
  expiresAt: Date;
  used: boolean;
}

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUserId = session.user.uid;
    const adminEmail = session.user.email;
    const adminRole = session.user.role;

    // Verify user is a platform admin
    if (adminRole !== "platform_admin") {
      console.warn(
        `[Admin Impersonate] Unauthorized impersonation attempt by non-admin user: ${adminUserId}`
      );
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "Only platform administrators can impersonate users",
        },
        { status: 403 }
      );
    }

    // Parse request body
    const { targetUserId, reason, duration = 60 }: ImpersonationRequest =
      await req.json();

    if (!targetUserId || !reason) {
      return NextResponse.json(
        {
          error: "Invalid request",
          message: "targetUserId and reason are required",
        },
        { status: 400 }
      );
    }

    // Validate duration (max 4 hours)
    if (duration > 240) {
      return NextResponse.json(
        {
          error: "Invalid duration",
          message: "Maximum impersonation duration is 240 minutes (4 hours)",
        },
        { status: 400 }
      );
    }

    console.log(
      `[Admin Impersonate] Admin ${adminEmail} requesting to impersonate user: ${targetUserId}`
    );

    // Get target user details
    let targetUser;
    try {
      targetUser = await adminAuth.getUser(targetUserId);
    } catch (error) {
      console.error("[Admin Impersonate] Target user not found:", error);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Prevent impersonating other platform admins
    const targetUserDoc = await db.collection("users").doc(targetUserId).get();
    if (targetUserDoc.exists) {
      const targetUserData = targetUserDoc.data();
      if (targetUserData?.role === "platform_admin") {
        console.warn(
          `[Admin Impersonate] Attempt to impersonate another platform admin blocked`
        );
        return NextResponse.json(
          {
            error: "Forbidden",
            message: "Cannot impersonate other platform administrators",
          },
          { status: 403 }
        );
      }
    }

    // Generate secure impersonation token
    const token = crypto.randomBytes(32).toString("hex");
    const now = new Date();
    const expiresAt = new Date(now.getTime() + duration * 60 * 1000);

    // Store impersonation token in Firestore
    const impersonationData: any = {
      token,
      adminUserId,
      adminEmail,
      targetUserId,
      targetEmail: targetUser.email || "",
      targetDisplayName: targetUser.displayName || "",
      reason,
      createdAt: now,
      expiresAt,
      used: false,
      duration,
      ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
      userAgent: req.headers.get("user-agent") || "unknown",
    };

    await db.collection("impersonationTokens").doc(token).set(impersonationData);

    // Log impersonation event (critical security event)
    await db.collection("auditLog").add({
      action: "admin_impersonation_created",
      adminUserId,
      adminEmail,
      targetUserId,
      targetEmail: targetUser.email,
      reason,
      timestamp: now,
      severity: "critical",
      metadata: {
        token: token.slice(0, 8) + "...", // Only log first 8 chars
        duration,
        expiresAt: expiresAt.toISOString(),
        ipAddress: impersonationData.ipAddress,
      },
    });

    // Send notification to security monitoring (if configured)
    // TODO: Implement Slack/Email notification to security team

    console.log(
      `[Admin Impersonate] Impersonation token created for ${targetUser.email} (expires in ${duration} minutes)`
    );

    return NextResponse.json({
      success: true,
      token,
      expiresAt: expiresAt.toISOString(),
      duration,
      targetUser: {
        uid: targetUserId,
        email: targetUser.email,
        displayName: targetUser.displayName,
      },
      warning:
        "This action has been logged. Use impersonation responsibly and only for legitimate support purposes.",
    });
  } catch (error) {
    console.error("[Admin Impersonate] Error creating impersonation token:", error);
    return NextResponse.json(
      {
        error: "Failed to create impersonation token",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to validate and consume impersonation token
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    // Retrieve token from Firestore
    const tokenDoc = await db.collection("impersonationTokens").doc(token).get();

    if (!tokenDoc.exists) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const tokenData = tokenDoc.data();

    // Check if token has been used
    if (tokenData?.used) {
      return NextResponse.json(
        { error: "Token has already been used" },
        { status: 401 }
      );
    }

    // Check if token has expired
    const expiresAt = tokenData?.expiresAt.toDate();
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Token has expired" },
        { status: 401 }
      );
    }

    // Mark token as used
    await db.collection("impersonationTokens").doc(token).update({
      used: true,
      usedAt: new Date(),
      usedIpAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
    });

    // Log token usage
    await db.collection("auditLog").add({
      action: "admin_impersonation_token_used",
      adminUserId: tokenData?.adminUserId,
      targetUserId: tokenData?.targetUserId,
      timestamp: new Date(),
      severity: "critical",
      metadata: {
        token: token.slice(0, 8) + "...",
        reason: tokenData?.reason,
      },
    });

    // Generate custom token for target user
    const customToken = await adminAuth.createCustomToken(tokenData?.targetUserId, {
      impersonating: true,
      impersonatedBy: tokenData?.adminUserId,
      impersonationReason: tokenData?.reason,
    });

    console.log(
      `[Admin Impersonate] Token consumed: ${tokenData?.adminEmail} → ${tokenData?.targetEmail}`
    );

    return NextResponse.json({
      success: true,
      customToken,
      targetUser: {
        uid: tokenData?.targetUserId,
        email: tokenData?.targetEmail,
        displayName: tokenData?.targetDisplayName,
      },
      impersonationInfo: {
        adminEmail: tokenData?.adminEmail,
        reason: tokenData?.reason,
        expiresAt: expiresAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("[Admin Impersonate] Error validating token:", error);
    return NextResponse.json(
      {
        error: "Failed to validate impersonation token",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE endpoint to revoke an active impersonation session
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUserId = session.user.uid;

    // Parse request body
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    // Verify admin owns this token or is platform admin
    const tokenDoc = await db.collection("impersonationTokens").doc(token).get();

    if (!tokenDoc.exists) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    const tokenData = tokenDoc.data();

    if (
      tokenData?.adminUserId !== adminUserId &&
      session.user.role !== "platform_admin"
    ) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Revoke token
    await db.collection("impersonationTokens").doc(token).update({
      revoked: true,
      revokedAt: new Date(),
      revokedBy: adminUserId,
    });

    // Log revocation
    await db.collection("auditLog").add({
      action: "admin_impersonation_revoked",
      adminUserId,
      targetUserId: tokenData?.targetUserId,
      timestamp: new Date(),
      severity: "high",
      metadata: {
        token: token.slice(0, 8) + "...",
        reason: "Manual revocation",
      },
    });

    console.log(`[Admin Impersonate] Token revoked: ${token.slice(0, 8)}...`);

    return NextResponse.json({
      success: true,
      message: "Impersonation token revoked successfully",
    });
  } catch (error) {
    console.error("[Admin Impersonate] Error revoking token:", error);
    return NextResponse.json(
      {
        error: "Failed to revoke impersonation token",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
