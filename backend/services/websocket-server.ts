/**
 * WebSocket Server for Interview Audio Streaming
 * Handles bidirectional audio between candidate and Gemini Live Voice API
 *
 * Run with: node websocket-server.js
 * Or: ts-node backend/services/websocket-server.ts
 */

import WebSocket, { WebSocketServer } from "ws";
import { createServer } from "http";
import { parse } from "url";
import { LiveVoiceInterviewSession, createVoiceInterviewSession } from "../ai/gemini/live-interview-voice";
import { getInterviewConfig } from "../ai/config/interview-agent-config";
import { db } from "../../frontend/src/lib/firebase-admin";

// Create HTTP server
const server = createServer();

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Store active interview sessions
const activeSessions = new Map<string, LiveVoiceInterviewSession>();

/**
 * Handle WebSocket connection
 */
wss.on("connection", async (ws: WebSocket, req) => {
  try {
    // Parse query parameters
    const { query } = parse(req.url || "", true);
    const interviewId = query.interviewId as string;

    if (!interviewId) {
      ws.send(JSON.stringify({ error: "Interview ID required" }));
      ws.close();
      return;
    }

    console.log(`[WebSocket] Client connected for interview: ${interviewId}`);

    // Get interview document from Firestore
    const interviewDoc = await db.collection("interviews").doc(interviewId).get();

    if (!interviewDoc.exists) {
      ws.send(JSON.stringify({ error: "Interview not found" }));
      ws.close();
      return;
    }

    const interview = interviewDoc.data();

    // Check if session already exists
    let session = activeSessions.get(interviewId);

    if (!session) {
      // Create new voice interview session
      const config = await getInterviewConfig(
        interview.companyId,
        interview.companyName
      );

      // Get job details
      const jobDoc = await db.collection("jobs").doc(interview.jobId).get();
      const jobData = jobDoc.data();

      session = await createVoiceInterviewSession(
        interview.sessionId,
        config,
        interview.jobTitle,
        jobData?.description || "",
        interview.scheduledDuration
      );

      // Set up event handlers
      session.setEventHandlers({
        onStageChange: async (stage) => {
          // Send stage update to frontend
          ws.send(JSON.stringify({
            type: "stage_change",
            stage,
          }));

          // Update Firestore
          await db.collection("interviews").doc(interviewId).update({
            currentStage: stage,
            updatedAt: new Date(),
          });
        },

        onTimeUpdate: async (update) => {
          // Send time update to frontend
          ws.send(JSON.stringify({
            type: "time_update",
            elapsed: update.elapsed,
            remaining: update.remaining,
            percentage: update.percentage,
          }));

          // Update Firestore
          await db.collection("interviews").doc(interviewId).update({
            elapsedTime: update.elapsed,
            updatedAt: new Date(),
          });
        },

        onMessage: async (message) => {
          // Send AI message to frontend
          ws.send(JSON.stringify({
            type: "ai_message",
            content: message.content,
            timestamp: message.timestamp,
          }));
        },

        onTranscriptUpdate: async (entry) => {
          // Send transcript entry to frontend
          ws.send(JSON.stringify({
            type: "transcript",
            entry,
          }));

          // Save to Firestore
          await db
            .collection("interviews")
            .doc(interviewId)
            .collection("transcript")
            .doc(entry.id)
            .set(entry);
        },

        onAudioOutput: async (audioData) => {
          // Send audio from Gemini to frontend
          ws.send(JSON.stringify({
            type: "audio_output",
            data: audioData.toString("base64"),
          }));
        },

        onError: async (error) => {
          // Send error to frontend
          ws.send(JSON.stringify({
            type: "error",
            message: error.message,
          }));

          // Update Firestore
          await db.collection("interviews").doc(interviewId).update({
            status: "expired",
            error: error.message,
            updatedAt: new Date(),
          });
        },
      });

      // Start the session
      await session.start();

      // Store session
      activeSessions.set(interviewId, session);

      console.log(`[WebSocket] New voice session created for interview: ${interviewId}`);
    }

    // Handle incoming messages from frontend
    ws.on("message", async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());

        // Handle different message types
        switch (message.type) {
          case "audio_input":
            // Audio from candidate's microphone
            const audioBuffer = Buffer.from(message.data, "base64");
            await session?.sendAudio(audioBuffer);
            break;

          case "start":
            // Start interview (if not already started)
            if (!activeSessions.has(interviewId)) {
              await session?.start();
            }
            break;

          case "end":
            // End interview
            await session?.complete("standard");
            activeSessions.delete(interviewId);
            ws.close();
            break;

          default:
            console.warn(`[WebSocket] Unknown message type: ${message.type}`);
        }
      } catch (error) {
        console.error("[WebSocket] Error handling message:", error);
        ws.send(JSON.stringify({
          type: "error",
          message: "Failed to process message",
        }));
      }
    });

    // Handle client disconnect
    ws.on("close", () => {
      console.log(`[WebSocket] Client disconnected from interview: ${interviewId}`);

      // Clean up session if interview ended
      const session = activeSessions.get(interviewId);
      if (session && session.getCurrentStage() === "COMPLETED") {
        activeSessions.delete(interviewId);
      }
    });

    // Handle errors
    ws.on("error", (error) => {
      console.error(`[WebSocket] Error for interview ${interviewId}:`, error);
    });

    // Send connection success
    ws.send(JSON.stringify({
      type: "connected",
      interviewId,
      message: "WebSocket connected successfully",
    }));
  } catch (error) {
    console.error("[WebSocket] Connection error:", error);
    ws.send(JSON.stringify({
      type: "error",
      message: "Failed to establish connection",
    }));
    ws.close();
  }
});

// Start server
const PORT = process.env.WS_PORT || 8080;
server.listen(PORT, () => {
  console.log(`[WebSocket] Server listening on port ${PORT}`);
  console.log(`[WebSocket] Connect at: ws://localhost:${PORT}?interviewId=xxx`);
});

// Handle shutdown
process.on("SIGINT", () => {
  console.log("\n[WebSocket] Shutting down...");

  // Close all active sessions
  activeSessions.forEach((session, interviewId) => {
    console.log(`[WebSocket] Closing session: ${interviewId}`);
    session.complete("standard");
  });

  activeSessions.clear();

  // Close WebSocket server
  wss.close(() => {
    console.log("[WebSocket] Server closed");
    process.exit(0);
  });
});
