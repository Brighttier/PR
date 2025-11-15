/**
 * API Route: Start Interview Session
 * POST /api/interview/start
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import { InterviewSession } from "@/shared/types/interview";

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const { interviewId } = await req.json();

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
        { error: "You do not have permission to start this interview" },
        { status: 403 }
      );
    }

    // Check if interview is scheduled
    if (interview.status !== "scheduled") {
      return NextResponse.json(
        { error: `Interview cannot be started (status: ${interview.status})` },
        { status: 400 }
      );
    }

    // Update interview status to "in_progress"
    // This will trigger the Cloud Function to initialize Gemini session
    await interviewRef.update({
      status: "in_progress",
      startedAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Interview started successfully",
      interviewId,
    });
  } catch (error) {
    console.error("[API] Error starting interview:", error);
    return NextResponse.json(
      { error: "Failed to start interview" },
      { status: 500 }
    );
  }
}
