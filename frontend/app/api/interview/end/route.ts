/**
 * API Route: End Interview Session
 * POST /api/interview/end
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import { InterviewSession, SignOffType } from "@/shared/types/interview";

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const { interviewId, signOffType, recordingUrl } = await req.json();

    if (!interviewId) {
      return NextResponse.json(
        { error: "Interview ID is required" },
        { status: 400 }
      );
    }

    // Get interview document
    const interviewRef = db.collection("interviews").doc(interviewId);
    const interviewDoc = await interviewRef.get();

    if (!interviewDoc.exists) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    const interview = interviewDoc.data() as InterviewSession;

    // Verify candidate owns this interview
    if (interview.candidateId !== session.user.uid) {
      return NextResponse.json(
        { error: "You do not have permission to end this interview" },
        { status: 403 }
      );
    }

    // Calculate elapsed time
    const startedAt = interview.startedAt as any; // Firestore Timestamp
    const now = new Date();
    const elapsedSec = Math.floor((now.getTime() - startedAt.toDate().getTime()) / 1000);

    // Update interview status
    const updateData: any = {
      status: "completed",
      currentStage: "COMPLETED",
      completedAt: now,
      elapsedTime: elapsedSec,
      updatedAt: now,
    };

    // Add recording URL if provided
    if (recordingUrl) {
      updateData.videoRecordingUrl = recordingUrl;
    }

    await interviewRef.update(updateData);

    // Update application status
    await db.collection("applications").doc(interview.applicationId).update({
      status: "Interview Completed",
      stage: "Interview Review",
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      message: "Interview ended successfully",
      interviewId,
      elapsedTime: elapsedSec,
    });
  } catch (error) {
    console.error("[API] Error ending interview:", error);
    return NextResponse.json(
      { error: "Failed to end interview" },
      { status: 500 }
    );
  }
}
