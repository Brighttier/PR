/**
 * Firebase Cloud Functions for Persona Recruit AI
 * Complete Function Registry
 */

// ==================== AUTHENTICATION FUNCTIONS ====================
export {
  onInviteAccept_SetUserRole,
  onInviteAccepted_SendWelcomeEmail,
} from "./auth/onInviteAccept";

export { setCustomClaims, updateUserRole } from "./auth/setCustomClaims";

export { onUserCreate } from "./auth/onUserCreate";

// ==================== APPLICATION FUNCTIONS ====================
export {
  onApplicationCreate_TriggerPipeline,
  onApplicationCreate_IncrementJobCount,
} from "./applications/onApplicationCreate";

export {
  processAIPipeline,
  triggerAIPipeline,
} from "./applications/processAIPipeline";

export {
  onResumeUpload_StartProcessing,
  processResume,
} from "./applications/onResumeUpload";

export {
  onApplicationUpdate_SendNotifications,
  onApplicationUpdate_UpdateAnalytics,
} from "./applications/onStatusChange";

export {
  onApplicationUpdate_CheckAutoReject,
  runAutoRejectCheck,
} from "./applications/onApplicationUpdate_CheckAutoReject";

// ==================== INTERVIEW FUNCTIONS ====================
export {
  onInterviewStart_InitGeminiSession,
  onInterviewComplete_ProcessRecording,
  onInterviewTimeout_CheckAndForceEnd,
  onInterviewCreate_NotifyInterviewers,
  onInterviewComplete_GenerateTranscript,
  onInterviewComplete_GenerateAIFeedback,
  onFeedbackCreate_NotifyRecruiter,
} from "./index"; // These are in the main index.ts

export {
  onInterviewCreate_UpdateApplication,
} from "./interviews/onInterviewCreate";

export {
  processInterviewVideo,
  extractVideoThumbnail,
} from "./interviews/processInterviewVideo";

export {
  checkPendingFeedback,
  onInterviewComplete_RequestFeedback,
  sendFeedbackReminder,
} from "./interviews/notifyFeedbackRequired";

// ==================== JOB FUNCTIONS ====================
export {
  onJobCreate_VectorizeDescription,
  onJobCreate_NotifyRecruiters,
  onJobCreate_UpdateCompanyStats,
} from "./jobs/onJobCreate";

export {
  onJobUpdate_UpdateEmbedding,
  onJobUpdate_UpdateCompanyStats,
  onJobUpdate_NotifyStatusChange,
} from "./jobs/onJobUpdate";

export {
  vectorizeJobDescription,
  batchVectorizeJobs,
} from "./jobs/onJobWrite_VectorizeDescription";

// ==================== NOTIFICATION FUNCTIONS ====================
export {
  sendEmail,
  processEmailQueue,
  sendTemplatedEmail,
} from "./notifications/sendEmail";

export {
  sendApplicationConfirmation,
  autoSendApplicationConfirmation,
} from "./notifications/sendApplicationConfirmation";

export {
  checkUpcomingInterviews,
  sendInterviewReminderManual,
} from "./notifications/sendInterviewReminder";

// ==================== SETTINGS FUNCTIONS ====================
export {
  onPipelineUpdate_ApplyRules,
  applyPipelineRules,
} from "./settings/onPipelineUpdate";

// ==================== SUMMARY ====================
/**
 * TOTAL CLOUD FUNCTIONS: 40+
 *
 * AUTHENTICATION (4):
 * - onInviteAccept_SetUserRole (callable)
 * - onInviteAccepted_SendWelcomeEmail (trigger)
 * - setCustomClaims (callable)
 * - updateUserRole (callable)
 * - onUserCreate (trigger) [existing]
 *
 * APPLICATIONS (8):
 * - onApplicationCreate_TriggerPipeline (trigger)
 * - onApplicationCreate_IncrementJobCount (trigger)
 * - processAIPipeline (internal function)
 * - triggerAIPipeline (callable)
 * - onResumeUpload_StartProcessing (storage trigger)
 * - processResume (callable)
 * - onApplicationUpdate_SendNotifications (trigger)
 * - onApplicationUpdate_UpdateAnalytics (trigger)
 * - onApplicationUpdate_CheckAutoReject (trigger)
 * - runAutoRejectCheck (callable)
 *
 * INTERVIEWS (11):
 * - onInterviewStart_InitGeminiSession (trigger)
 * - onInterviewComplete_ProcessRecording (storage trigger)
 * - onInterviewTimeout_CheckAndForceEnd (scheduled)
 * - onInterviewCreate_NotifyInterviewers (trigger)
 * - onInterviewComplete_GenerateTranscript (trigger)
 * - onInterviewComplete_GenerateAIFeedback (trigger)
 * - onFeedbackCreate_NotifyRecruiter (trigger)
 * - onInterviewCreate_UpdateApplication (trigger)
 * - processInterviewVideo (callable)
 * - extractVideoThumbnail (storage trigger)
 * - checkPendingFeedback (scheduled)
 * - onInterviewComplete_RequestFeedback (trigger)
 * - sendFeedbackReminder (callable)
 *
 * JOBS (8):
 * - onJobCreate_VectorizeDescription (trigger)
 * - onJobCreate_NotifyRecruiters (trigger)
 * - onJobCreate_UpdateCompanyStats (trigger)
 * - onJobUpdate_UpdateEmbedding (trigger)
 * - onJobUpdate_UpdateCompanyStats (trigger)
 * - onJobUpdate_NotifyStatusChange (trigger)
 * - vectorizeJobDescription (callable)
 * - batchVectorizeJobs (callable)
 *
 * NOTIFICATIONS (7):
 * - sendEmail (callable)
 * - processEmailQueue (trigger)
 * - sendTemplatedEmail (callable)
 * - sendApplicationConfirmation (callable)
 * - autoSendApplicationConfirmation (trigger)
 * - checkUpcomingInterviews (scheduled)
 * - sendInterviewReminderManual (callable)
 *
 * SETTINGS (2):
 * - onPipelineUpdate_ApplyRules (trigger)
 * - applyPipelineRules (callable)
 */
