/**
 * API Route: Meeting Bots Webhook
 * POST /api/webhooks/meeting-bots
 *
 * Handles webhooks from meeting bot services (Zoom, Microsoft Teams)
 * Processes recordings, transcripts, and triggers AI analysis
 */

import { NextRequest, NextResponse } from "next/server";
import { db, storage } from "@/lib/firebase-admin";
import crypto from "crypto";

interface MeetingBotWebhookPayload {
  provider: "zoom" | "teams" | "meet";
  meetingId: string;
  recordingUrl?: string;
  transcriptUrl?: string;
  transcript?: string;
  duration?: number;
  startTime?: string;
  endTime?: string;
  participants?: Array<{
    name: string;
    email?: string;
    duration?: number;
  }>;
  metadata?: Record<string, any>;
}

/**
 * Verify webhook signature (provider-specific)
 */
function verifyWebhookSignature(
  req: NextRequest,
  body: string,
  provider: string
): boolean {
  const signature = req.headers.get("x-webhook-signature");
  const timestamp = req.headers.get("x-webhook-timestamp");

  if (!signature || !timestamp) {
    console.error("[Meeting Bot Webhook] Missing signature or timestamp");
    return false;
  }

  // Get secret for provider
  const secret =
    provider === "zoom"
      ? process.env.ZOOM_WEBHOOK_SECRET
      : provider === "teams"
      ? process.env.TEAMS_WEBHOOK_SECRET
      : process.env.MEET_WEBHOOK_SECRET;

  if (!secret) {
    console.error(`[Meeting Bot Webhook] No secret configured for ${provider}`);
    return false;
  }

  // Compute HMAC signature
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${body}`)
    .digest("hex");

  // Compare signatures (constant-time comparison)
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const payload: MeetingBotWebhookPayload = JSON.parse(body);

    // Verify webhook signature
    if (!verifyWebhookSignature(req, body, payload.provider)) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    console.log(
      `[Meeting Bot Webhook] Received ${payload.provider} webhook for meeting: ${payload.meetingId}`
    );

    // Find interview by meeting ID
    const interviewsSnapshot = await db
      .collection("interviews")
      .where("meetingId", "==", payload.meetingId)
      .limit(1)
      .get();

    if (interviewsSnapshot.empty) {
      // Try to find by meeting link
      const meetingUrlQuery = await db
        .collection("interviews")
        .where("meetingLink", ">=", payload.meetingId)
        .where("meetingLink", "<=", payload.meetingId + "\uf8ff")
        .limit(1)
        .get();

      if (meetingUrlQuery.empty) {
        console.log(
          `[Meeting Bot Webhook] No interview found for meeting: ${payload.meetingId}`
        );
        // Not an error - this might be a non-interview meeting
        return NextResponse.json({
          received: true,
          message: "Meeting not associated with an interview",
        });
      }
    }

    const interviewDoc =
      interviewsSnapshot.docs[0] ||
      (await db.collection("interviews")
        .where("meetingLink", ">=", payload.meetingId)
        .where("meetingLink", "<=", payload.meetingId + "\uf8ff")
        .limit(1)
        .get()).docs[0];

    const interviewId = interviewDoc.id;
    const interview = interviewDoc.data();

    console.log(`[Meeting Bot Webhook] Processing meeting for interview: ${interviewId}`);

    // Update data object
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Handle recording URL
    if (payload.recordingUrl) {
      console.log(`[Meeting Bot Webhook] Recording URL received: ${payload.recordingUrl}`);

      // Download recording and upload to our storage
      try {
        const recordingResponse = await fetch(payload.recordingUrl);
        const recordingBuffer = await recordingResponse.arrayBuffer();

        // Upload to Firebase Storage
        const bucket = storage.bucket();
        const fileName = `recordings/${interview.companyId}/${interviewId}/${Date.now()}.mp4`;
        const file = bucket.file(fileName);

        await file.save(Buffer.from(recordingBuffer), {
          contentType: "video/mp4",
          metadata: {
            metadata: {
              interviewId,
              applicationId: interview.applicationId,
              candidateId: interview.candidateId,
              uploadedAt: new Date().toISOString(),
              provider: payload.provider,
            },
          },
        });

        // Generate signed URL (valid for 1 year)
        const [signedUrl] = await file.getSignedUrl({
          version: "v4",
          action: "read",
          expires: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
        });

        updateData.videoRecordingUrl = signedUrl;
        updateData.recordingStoragePath = fileName;
      } catch (error) {
        console.error("[Meeting Bot Webhook] Error downloading recording:", error);
        // Continue processing even if recording download fails
        updateData.recordingDownloadError = error instanceof Error ? error.message : "Unknown error";
      }
    }

    // Handle transcript
    if (payload.transcript || payload.transcriptUrl) {
      let transcript = payload.transcript;

      // If transcript URL is provided, download it
      if (payload.transcriptUrl && !transcript) {
        try {
          const transcriptResponse = await fetch(payload.transcriptUrl);
          transcript = await transcriptResponse.text();
        } catch (error) {
          console.error("[Meeting Bot Webhook] Error downloading transcript:", error);
        }
      }

      if (transcript) {
        updateData.transcript = transcript;
        updateData.transcriptGeneratedAt = new Date();

        // Trigger AI analysis of transcript
        // This would typically be done via a Cloud Function trigger
        // For now, we'll just flag it for processing
        updateData.aiAnalysisStatus = "pending";
      }
    }

    // Add meeting metadata
    if (payload.duration) {
      updateData.actualDuration = payload.duration;
    }

    if (payload.participants) {
      updateData.participants = payload.participants;
    }

    if (payload.startTime) {
      updateData.actualStartTime = new Date(payload.startTime);
    }

    if (payload.endTime) {
      updateData.actualEndTime = new Date(payload.endTime);
      updateData.status = "completed";
      updateData.completedAt = new Date(payload.endTime);
    }

    // Update interview document
    await db.collection("interviews").doc(interviewId).update(updateData);

    // Update application status
    if (updateData.status === "completed") {
      await db.collection("applications").doc(interview.applicationId).update({
        status: "Interview Completed",
        stage: "Interview Review",
        updatedAt: new Date(),
      });
    }

    // Log webhook event
    await db.collection("auditLog").add({
      interviewId,
      applicationId: interview.applicationId,
      companyId: interview.companyId,
      action: "meeting_bot_webhook_received",
      timestamp: new Date(),
      metadata: {
        provider: payload.provider,
        meetingId: payload.meetingId,
        hasRecording: !!payload.recordingUrl,
        hasTranscript: !!(payload.transcript || payload.transcriptUrl),
        duration: payload.duration,
      },
    });

    // TODO: Trigger Cloud Function for AI analysis
    // This should be handled by a Firestore trigger on the interview update

    console.log(`[Meeting Bot Webhook] Successfully processed meeting for interview: ${interviewId}`);

    return NextResponse.json({
      success: true,
      message: "Meeting bot webhook processed successfully",
      interviewId,
      processed: {
        recording: !!payload.recordingUrl,
        transcript: !!(payload.transcript || payload.transcriptUrl),
        metadata: !!payload.participants,
      },
    });
  } catch (error) {
    console.error("[Meeting Bot Webhook] Error processing webhook:", error);
    return NextResponse.json(
      {
        error: "Failed to process meeting bot webhook",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for webhook verification (Zoom requirement)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const challenge = searchParams.get("challenge");

  if (challenge) {
    // Zoom webhook verification
    return new NextResponse(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return NextResponse.json({
    status: "Meeting Bots Webhook Endpoint",
    supportedProviders: ["zoom", "teams", "meet"],
  });
}
