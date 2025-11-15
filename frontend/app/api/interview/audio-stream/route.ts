/**
 * API Route: WebSocket Audio Streaming for Voice Interviews
 * ws://localhost:3000/api/interview/audio-stream?interviewId=xxx
 *
 * This route handles bidirectional audio streaming between:
 * - Frontend (candidate's microphone)
 * - Gemini Live Voice API (AI interviewer)
 *
 * Note: Next.js doesn't natively support WebSockets in API routes.
 * This file provides the structure, but you'll need to use a custom server
 * or deploy to a platform that supports WebSockets (e.g., Vercel with WebSocket support).
 */

import { NextRequest } from "next/server";

/**
 * For production, you'll need to set up a separate WebSocket server
 * or use a service like Vercel's WebSocket support.
 *
 * Alternative approaches:
 * 1. Use a separate Node.js WebSocket server (recommended)
 * 2. Use Server-Sent Events (SSE) for one-way streaming
 * 3. Use Firebase Realtime Database for message passing
 */

export async function GET(req: NextRequest) {
  return new Response(
    JSON.stringify({
      error: "WebSocket not supported in Next.js API routes",
      message: "Please use the standalone WebSocket server at ws://localhost:8080/audio-stream",
    }),
    { status: 501 }
  );
}
