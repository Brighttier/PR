/**
 * Cloud Function: Interview Creation Handler
 * Already implemented in index.ts as onInterviewCreate_NotifyInterviewers
 * This file is kept for reference and potential extensions
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * Generate calendar invite (.ics file) for interview
 */
export async function generateCalendarInvite(interview: any): Promise<string> {
  const startDate = interview.scheduledAt.toDate();
  const endDate = new Date(startDate.getTime() + interview.duration * 60 * 1000);

  const formatDate = (date: Date): string => {
    return date
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  };

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Persona Recruit AI//Interview//EN
BEGIN:VEVENT
UID:${interview.id}@personarecruit.ai
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:Interview - ${interview.jobTitle}
DESCRIPTION:Interview for ${interview.candidateName}\\n\\nJob: ${interview.jobTitle}\\n\\nType: ${interview.type}\\n\\n${interview.meetingLink ? `Meeting Link: ${interview.meetingLink}` : ""}
LOCATION:${interview.location || interview.meetingLink || "TBD"}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:Interview in 1 hour
END:VALARM
END:VEVENT
END:VCALENDAR`;

  return icsContent;
}

/**
 * Send interview invitation email with calendar invite
 */
export async function sendInterviewInvitation(
  interview: any,
  recipientEmail: string,
  recipientName: string,
  role: "candidate" | "interviewer"
): Promise<void> {
  try {
    console.log(`[Interview] Sending invitation to ${role}: ${recipientEmail}`);

    const calendarInvite = await generateCalendarInvite(interview);

    // TODO: Integrate with email service
    const emailData = {
      to: recipientEmail,
      subject: `Interview ${role === "candidate" ? "Invitation" : "Assignment"} - ${interview.jobTitle}`,
      template: `interview_${role}`,
      data: {
        recipientName,
        candidateName: interview.candidateName,
        jobTitle: interview.jobTitle,
        companyName: interview.companyName,
        interviewType: interview.type,
        scheduledDate: interview.scheduledAt.toDate().toLocaleDateString(),
        scheduledTime: interview.scheduledAt.toDate().toLocaleTimeString(),
        duration: interview.duration,
        meetingLink: interview.meetingLink,
        location: interview.location,
        notes: interview.notes,
      },
      attachments: [
        {
          filename: "interview.ics",
          content: calendarInvite,
          contentType: "text/calendar",
        },
      ],
    };

    console.log(`[Interview] Email would be sent:`, emailData);
  } catch (error) {
    console.error("[Interview] Error sending invitation:", error);
  }
}

/**
 * Create interview reminder job
 * Schedules a reminder to be sent before the interview
 */
export async function scheduleInterviewReminder(
  interviewId: string,
  interview: any
): Promise<void> {
  try {
    const reminderTime = new Date(
      interview.scheduledAt.toDate().getTime() - 24 * 60 * 60 * 1000
    ); // 24 hours before

    // Create a scheduled task document
    await db.collection("scheduled_tasks").add({
      type: "interview_reminder",
      interviewId,
      scheduledFor: admin.firestore.Timestamp.fromDate(reminderTime),
      status: "pending",
      data: {
        candidateEmail: interview.candidateEmail,
        candidateName: interview.candidateName,
        jobTitle: interview.jobTitle,
        interviewDate: interview.scheduledAt,
        meetingLink: interview.meetingLink,
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`[Interview] Reminder scheduled for: ${reminderTime.toISOString()}`);
  } catch (error) {
    console.error("[Interview] Error scheduling reminder:", error);
  }
}

/**
 * Update application status when interview is scheduled
 */
export const onInterviewCreate_UpdateApplication = functions.firestore
  .document("interviews/{interviewId}")
  .onCreate(async (snap, context) => {
    const interview = snap.data();

    try {
      // Update application status
      await db.collection("applications").doc(interview.applicationId).update({
        status: "Interview Scheduled",
        stage:
          interview.type === "ai_screening" ? "Initial Screening" : "Face-to-Face Interview",
        lastInterviewScheduledAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(
        `[Interview] Application updated with interview status: ${interview.applicationId}`
      );
    } catch (error) {
      console.error("[Interview] Error updating application:", error);
    }
  });
