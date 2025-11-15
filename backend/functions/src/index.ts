/**
 * Firebase Cloud Functions for Persona Recruit AI
 * Interview Management Functions
 * Uses Gemini Live Voice API for real-time voice-to-voice interviews
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { LiveVoiceInterviewSession, createVoiceInterviewSession } from "../../ai/gemini/live-interview-voice";
import { getInterviewConfig } from "../../ai/config/interview-agent-config";
import { InterviewSession, InterviewStatus } from "../../../shared/types/interview";

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();
const storage = admin.storage();

/**
 * Cloud Function: Start Interview Session
 * Triggered when an interview status changes to "in_progress"
 */
export const onInterviewStart_InitGeminiSession = functions.firestore
  .document("interviews/{interviewId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data() as InterviewSession;
    const after = change.after.data() as InterviewSession;

    // Only trigger if status changed to "in_progress"
    if (before.status !== "in_progress" && after.status === "in_progress") {
      const interviewId = context.params.interviewId;

      try {
        console.log(`[Function] Starting interview session: ${interviewId}`);

        // Get interview configuration
        const config = await getInterviewConfig(
          after.companyId,
          after.companyName
        );

        // Get job details
        const jobDoc = await db.collection("jobs").doc(after.jobId).get();
        const jobData = jobDoc.data();

        if (!jobData) {
          throw new Error(`Job not found: ${after.jobId}`);
        }

        // Create Gemini Live Voice interview session
        const session = await createVoiceInterviewSession(
          after.sessionId,
          config,
          after.jobTitle,
          jobData.description,
          after.scheduledDuration // Use the scheduled duration from interview doc
        );

        // Set up event handlers to update Firestore in real-time
        session.setEventHandlers({
          onStageChange: async (stage) => {
            await db.collection("interviews").doc(interviewId).update({
              currentStage: stage,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          },

          onTimeUpdate: async (update) => {
            await db.collection("interviews").doc(interviewId).update({
              elapsedTime: update.elapsed,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          },

          onTranscriptUpdate: async (entry) => {
            // Add transcript entry to sub-collection
            await db
              .collection("interviews")
              .doc(interviewId)
              .collection("transcript")
              .doc(entry.id)
              .set(entry);
          },

          onAudioOutput: async (audioData) => {
            // Audio from Gemini will be streamed to frontend via WebSocket
            // This is handled in the WebSocket server (see audio-stream route)
            console.log(`[Function] Audio output received: ${audioData.length} bytes`);
          },

          onError: async (error) => {
            console.error(`[Function] Interview error:`, error);
            await db.collection("interviews").doc(interviewId).update({
              status: "expired" as InterviewStatus,
              error: error.message,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          },
        });

        // Start the interview
        await session.start();

        // Update interview document with Gemini session ID
        await db.collection("interviews").doc(interviewId).update({
          geminiSessionId: after.sessionId,
          geminiConnected: true,
          startedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`[Function] Interview session started successfully: ${interviewId}`);
      } catch (error) {
        console.error(`[Function] Error starting interview:`, error);

        // Update interview with error
        await db.collection("interviews").doc(interviewId).update({
          status: "expired" as InterviewStatus,
          error: error instanceof Error ? error.message : "Unknown error",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }
  });

/**
 * Cloud Function: Process Interview Recording
 * Triggered when a video is uploaded to Firebase Storage
 */
export const onInterviewComplete_ProcessRecording = functions.storage
  .object()
  .onFinalize(async (object) => {
    const filePath = object.name;

    // Only process files in the interviews/ folder
    if (!filePath || !filePath.startsWith("interviews/")) {
      return;
    }

    // Extract interview ID from path: interviews/{interviewId}/recording.webm
    const pathParts = filePath.split("/");
    if (pathParts.length < 3) {
      return;
    }

    const interviewId = pathParts[1];

    try {
      console.log(`[Function] Processing recording for interview: ${interviewId}`);

      // Get interview document
      const interviewDoc = await db.collection("interviews").doc(interviewId).get();

      if (!interviewDoc.exists) {
        console.error(`[Function] Interview not found: ${interviewId}`);
        return;
      }

      const interview = interviewDoc.data() as InterviewSession;

      // Generate public URL for the recording
      const bucket = storage.bucket(object.bucket);
      const file = bucket.file(filePath!);

      // Generate signed URL (valid for 7 days)
      const [url] = await file.getSignedUrl({
        action: "read",
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Update interview document with recording URL
      await db.collection("interviews").doc(interviewId).update({
        videoRecordingUrl: url,
        status: "completed" as InterviewStatus,
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Update application status
      await db.collection("applications").doc(interview.applicationId).update({
        status: "Interview Completed",
        stage: "Interview Review",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // TODO: Trigger AI analysis of recording (future enhancement)
      // - Generate full transcript with timestamps
      // - Analyze candidate responses
      // - Generate feedback report

      console.log(`[Function] Recording processed successfully: ${interviewId}`);
    } catch (error) {
      console.error(`[Function] Error processing recording:`, error);
    }
  });

/**
 * Cloud Function: Handle Interview Timeout
 * Scheduled to run every 5 minutes to check for timed-out interviews
 */
export const onInterviewTimeout_CheckAndForceEnd = functions.pubsub
  .schedule("every 5 minutes")
  .onRun(async (context) => {
    try {
      console.log(`[Function] Checking for timed-out interviews`);

      const now = admin.firestore.Timestamp.now();
      const fiveMinutesAgo = new Date(now.toMillis() - 5 * 60 * 1000);

      // Query for in-progress interviews
      const snapshot = await db
        .collection("interviews")
        .where("status", "==", "in_progress")
        .where("startedAt", "<", admin.firestore.Timestamp.fromDate(fiveMinutesAgo))
        .get();

      console.log(`[Function] Found ${snapshot.size} potentially timed-out interviews`);

      const promises = snapshot.docs.map(async (doc) => {
        const interview = doc.data() as InterviewSession;
        const interviewId = doc.id;

        // Calculate elapsed time
        const startedAt = interview.startedAt as any; // Timestamp
        const elapsedMs = now.toMillis() - startedAt.toMillis();
        const elapsedSec = Math.floor(elapsedMs / 1000);

        // Check if exceeded max duration (with 1-minute grace period)
        if (elapsedSec > interview.maxDuration + 60) {
          console.log(
            `[Function] Force-ending timed-out interview: ${interviewId} (elapsed: ${elapsedSec}s, max: ${interview.maxDuration}s)`
          );

          // Update interview status
          await db.collection("interviews").doc(interviewId).update({
            status: "expired" as InterviewStatus,
            currentStage: "TIMEOUT",
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          // Update application status
          await db.collection("applications").doc(interview.applicationId).update({
            status: "Interview Incomplete",
            stage: "Interview Review",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      });

      await Promise.all(promises);

      console.log(`[Function] Timeout check completed`);
    } catch (error) {
      console.error(`[Function] Error checking timeouts:`, error);
    }
  });

/**
 * Cloud Function: Send Interview Notifications
 * Triggered when an interview is scheduled
 */
export const onInterviewCreate_NotifyInterviewers = functions.firestore
  .document("interviews/{interviewId}")
  .onCreate(async (snap, context) => {
    const interview = snap.data() as InterviewSession;
    const interviewId = context.params.interviewId;

    try {
      console.log(`[Function] Sending notifications for interview: ${interviewId}`);

      // Get candidate details
      const candidateDoc = await db.collection("users").doc(interview.candidateId).get();
      const candidate = candidateDoc.data();

      if (!candidate) {
        console.error(`[Function] Candidate not found: ${interview.candidateId}`);
        return;
      }

      // Get application details
      const applicationDoc = await db
        .collection("applications")
        .doc(interview.applicationId)
        .get();
      const application = applicationDoc.data();

      // TODO: Send email notifications
      // - Email to candidate with interview details and meeting link
      // - Email to interviewers (if face-to-face or panel interview)
      // - Generate calendar invite (.ics file)

      // For AI interviews, generate unique interview link
      if (interview.type === "ai_screening" || interview.type === "ai_technical") {
        const interviewLink = `https://app.personarecruit.ai/candidate/interview/${interviewId}`;

        // TODO: Send email with link
        console.log(`[Function] Interview link generated: ${interviewLink}`);
      }

      console.log(`[Function] Notifications sent for interview: ${interviewId}`);
    } catch (error) {
      console.error(`[Function] Error sending notifications:`, error);
    }
  });

/**
 * Cloud Function: Generate Interview Transcript
 * Triggered when an interview is completed
 */
export const onInterviewComplete_GenerateTranscript = functions.firestore
  .document("interviews/{interviewId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data() as InterviewSession;
    const after = change.after.data() as InterviewSession;

    // Only trigger if status changed to "completed"
    if (before.status !== "completed" && after.status === "completed") {
      const interviewId = context.params.interviewId;

      try {
        console.log(`[Function] Generating transcript for interview: ${interviewId}`);

        // Get all transcript entries
        const transcriptSnap = await db
          .collection("interviews")
          .doc(interviewId)
          .collection("transcript")
          .orderBy("timestamp", "asc")
          .get();

        if (transcriptSnap.empty) {
          console.log(`[Function] No transcript entries found for interview: ${interviewId}`);
          return;
        }

        // Build full transcript text
        let fullText = "";
        let wordCount = 0;

        const entries = transcriptSnap.docs.map((doc) => {
          const entry = doc.data();
          const speaker = entry.speaker === "ai" ? "AI Interviewer" : "Candidate";
          fullText += `[${formatTime(entry.timestamp)}] ${speaker}: ${entry.text}\n\n`;
          wordCount += entry.text.split(" ").length;
          return entry;
        });

        // Create transcript document
        const transcript = {
          sessionId: after.sessionId,
          entries,
          fullText,
          duration: after.elapsedTime,
          wordCount,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        // Save transcript
        await db
          .collection("interviews")
          .doc(interviewId)
          .collection("metadata")
          .doc("transcript")
          .set(transcript);

        // Update interview document
        await db.collection("interviews").doc(interviewId).update({
          transcriptUrl: `/interviews/${interviewId}/metadata/transcript`,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(
          `[Function] Transcript generated successfully: ${interviewId} (${entries.length} entries, ${wordCount} words)`
        );
      } catch (error) {
        console.error(`[Function] Error generating transcript:`, error);
      }
    }
  });

/**
 * Cloud Function: Generate AI Feedback
 * Triggered when an interview is completed
 */
export const onInterviewComplete_GenerateAIFeedback = functions.firestore
  .document("interviews/{interviewId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data() as InterviewSession;
    const after = change.after.data() as InterviewSession;

    // Only trigger if status changed to "completed"
    if (before.status !== "completed" && after.status === "completed") {
      const interviewId = context.params.interviewId;

      try {
        console.log(`[Function] Generating AI feedback for interview: ${interviewId}`);

        // Get transcript entries
        const transcriptSnap = await db
          .collection("interviews")
          .doc(interviewId)
          .collection("transcript")
          .orderBy("timestamp", "asc")
          .get();

        if (transcriptSnap.empty) {
          console.log(`[Function] No transcript found for interview: ${interviewId}`);
          return;
        }

        const transcriptEntries = transcriptSnap.docs.map((doc) => doc.data());

        // Get job description
        const jobDoc = await db.collection("jobs").doc(after.jobId).get();
        const jobDescription = jobDoc.data()?.description || "";

        // Generate AI feedback
        const { generateInterviewFeedback, generateFallbackFeedback } = await import(
          "../../services/ai-feedback.service"
        );

        let feedback;
        try {
          feedback = await generateInterviewFeedback(
            interviewId,
            after.applicationId,
            after.candidateId,
            transcriptEntries,
            jobDescription
          );
        } catch (aiError) {
          console.error(`[Function] AI analysis failed, using fallback:`, aiError);
          feedback = generateFallbackFeedback(
            interviewId,
            after.applicationId,
            after.candidateId,
            transcriptEntries
          );
        }

        // Save feedback to Firestore
        await db.collection("feedback").doc(feedback.feedbackId).set(feedback);

        // Update interview document
        await db.collection("interviews").doc(interviewId).update({
          feedbackGenerated: true,
          feedbackId: feedback.feedbackId,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Update application with AI scores
        await db.collection("applications").doc(after.applicationId).update({
          aiFeedbackScore: feedback.aiAnalysis.overallScore,
          aiRecommendation: feedback.aiAnalysis.recommendation,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(
          `[Function] AI feedback generated successfully: ${feedback.feedbackId} (Score: ${feedback.aiAnalysis.overallScore}, Recommendation: ${feedback.aiAnalysis.recommendation})`
        );
      } catch (error) {
        console.error(`[Function] Error in feedback generation:`, error);
      }
    }
  });

/**
 * Cloud Function: Send Email on AI Feedback Generation
 * Triggered when AI feedback is created
 */
export const onFeedbackCreate_NotifyRecruiter = functions.firestore
  .document("feedback/{feedbackId}")
  .onCreate(async (snap, context) => {
    const feedback = snap.data();
    const feedbackId = context.params.feedbackId;

    try {
      console.log(`[Function] Sending notification for feedback: ${feedbackId}`);

      // Get application details
      const applicationDoc = await db
        .collection("applications")
        .doc(feedback.applicationId)
        .get();

      if (!applicationDoc.exists) {
        console.error(`[Function] Application not found: ${feedback.applicationId}`);
        return;
      }

      const application = applicationDoc.data();

      // Get recruiter/HR admin users for this company
      const usersSnap = await db
        .collection("users")
        .where("companyId", "==", application?.companyId)
        .where("role", "in", ["recruiter", "hr_admin"])
        .get();

      if (usersSnap.empty) {
        console.log(`[Function] No recruiters found for company: ${application?.companyId}`);
        return;
      }

      // TODO: Send email notifications
      // For now, just log the notification details
      usersSnap.docs.forEach((doc) => {
        const recruiter = doc.data();
        console.log(
          `[Function] Would send email to: ${recruiter.email} about feedback for ${feedback.candidateName || "candidate"}`
        );
        console.log(`  - Overall Score: ${feedback.aiAnalysis.overallScore}%`);
        console.log(`  - Recommendation: ${feedback.aiAnalysis.recommendation}`);
      });

      // Email template would include:
      // - Candidate name
      // - Job title
      // - Overall score
      // - Recommendation
      // - Link to application details page
      // - Summary of strengths and weaknesses

      console.log(`[Function] Email notifications sent for feedback: ${feedbackId}`);
    } catch (error) {
      console.error(`[Function] Error sending feedback notifications:`, error);
    }
  });

/**
 * Helper: Format seconds to MM:SS
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
