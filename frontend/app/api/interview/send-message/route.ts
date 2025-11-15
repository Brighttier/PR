/**
 * API Route: Send Message to Interview AI
 * POST /api/interview/send-message
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import { InterviewSession } from "@/shared/types/interview";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const { interviewId, message, messageType } = await req.json();

    if (!interviewId || !message) {
      return NextResponse.json(
        { error: "Interview ID and message are required" },
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
        { error: "You do not have permission to send messages in this interview" },
        { status: 403 }
      );
    }

    // Verify interview is in progress
    if (interview.status !== "in_progress") {
      return NextResponse.json(
        { error: "Interview is not in progress" },
        { status: 400 }
      );
    }

    // Calculate elapsed time
    const startedAt = interview.startedAt as any;
    const now = Date.now();
    const elapsedSec = Math.floor((now - startedAt.toMillis()) / 1000);

    // Add candidate message to transcript
    const candidateEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: elapsedSec,
      speaker: "candidate",
      text: message,
      confidence: 1.0,
    };

    await interviewRef
      .collection("transcript")
      .doc(candidateEntry.id)
      .set(candidateEntry);

    // Get AI response using Gemini
    // Note: In production, this should use the session's chat history
    // For now, we'll create a new chat context
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: interview.config.model.name,
      generationConfig: {
        temperature: interview.config.model.temperature,
        maxOutputTokens: interview.config.model.maxOutputTokens,
        topP: interview.config.model.topP,
        topK: interview.config.model.topK,
      },
    });

    // Get chat history from Firestore
    const transcriptSnap = await interviewRef
      .collection("transcript")
      .orderBy("timestamp", "asc")
      .get();

    const chatHistory = transcriptSnap.docs.map((doc) => {
      const entry = doc.data();
      return {
        role: entry.speaker === "ai" ? "model" : "user",
        parts: [{ text: entry.text }],
      };
    });

    // Start chat with history
    const chat = model.startChat({
      history: chatHistory,
    });

    // Send message and get response
    const result = await chat.sendMessage(message);
    const aiResponse = result.response.text();

    // Add AI response to transcript
    const aiEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: elapsedSec,
      speaker: "ai",
      text: aiResponse,
      confidence: 1.0,
    };

    await interviewRef
      .collection("transcript")
      .doc(aiEntry.id)
      .set(aiEntry);

    // Update interview elapsed time
    await interviewRef.update({
      elapsedTime: elapsedSec,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      response: aiResponse,
      timestamp: elapsedSec,
    });
  } catch (error) {
    console.error("[API] Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
