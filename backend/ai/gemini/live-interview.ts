/**
 * Gemini Live Voice Interview Session Manager
 * Handles real-time Voice-to-Voice AI interviews with Google Gemini Live API
 * Supports configurable duration (5-30 min) with dynamic warnings
 * Uses WebSocket for bidirectional audio streaming
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import WebSocket from "ws";
import {
  InterviewSession,
  InterviewAgentConfig,
  InterviewStage,
  InterviewMessage,
  TimeUpdate,
  SignOffType,
  TranscriptEntry,
} from "../../../shared/types/interview";
import {
  generateInterviewSystemPrompt,
  calculateWarningTimes
} from "../config/interview-agent-config";

/**
 * Gemini Live Interview Session Manager
 * Uses Gemini 2.0 Live API for real-time voice-to-voice conversation
 */
export class LiveInterviewSession {
  private sessionId: string;
  private config: InterviewAgentConfig;
  private jobTitle: string;
  private jobDescription: string;
  private scheduledDuration: number;

  private currentStage: InterviewStage = "PRE_START";
  private startTime: number = 0;
  private elapsedTime: number = 0;
  private timeMonitor: NodeJS.Timeout | null = null;

  // Dynamic warning times (calculated based on scheduledDuration)
  private firstWarningTime: number = 0;
  private finalWarningTime: number = 0;
  private warningsSent: Set<string> = new Set();

  private transcript: TranscriptEntry[] = [];
  private questionCount: number = 0;

  // Gemini Live Voice session
  private genAI: GoogleGenerativeAI | null = null;
  private liveSession: any = null; // Gemini Live session
  private geminiConnected: boolean = false;
  private ws: WebSocket | null = null; // WebSocket for audio streaming

  // Event callbacks
  private onStageChange?: (stage: InterviewStage) => void;
  private onTimeUpdate?: (update: TimeUpdate) => void;
  private onMessage?: (message: InterviewMessage) => void;
  private onTranscriptUpdate?: (entry: TranscriptEntry) => void;
  private onAudioOutput?: (audioData: Buffer) => void;
  private onError?: (error: Error) => void;

  constructor(
    sessionId: string,
    config: InterviewAgentConfig,
    jobTitle: string,
    jobDescription: string,
    scheduledDuration?: number
  ) {
    this.sessionId = sessionId;
    this.config = config;
    this.jobTitle = jobTitle;
    this.jobDescription = jobDescription;

    // Set scheduled duration (default to config.defaultDuration, max 30 min)
    this.scheduledDuration = scheduledDuration || config.defaultDuration;

    // Enforce max duration limit (30 minutes)
    if (this.scheduledDuration > config.maxDuration) {
      console.warn(
        `Scheduled duration ${this.scheduledDuration}s exceeds max ${config.maxDuration}s. Capping to max.`
      );
      this.scheduledDuration = config.maxDuration;
    }

    // Enforce min duration limit
    if (this.scheduledDuration < config.minDuration) {
      console.warn(
        `Scheduled duration ${this.scheduledDuration}s below min ${config.minDuration}s. Setting to min.`
      );
      this.scheduledDuration = config.minDuration;
    }

    // Calculate dynamic warning times based on scheduled duration
    const warningTimes = calculateWarningTimes(this.scheduledDuration, config);
    this.firstWarningTime = warningTimes.firstWarning;
    this.finalWarningTime = warningTimes.finalWarning;

    console.log(
      `[Interview ${this.sessionId}] Scheduled for ${this.scheduledDuration}s (${(this.scheduledDuration / 60).toFixed(1)} min)`
    );
    console.log(
      `[Interview ${this.sessionId}] First warning at ${this.firstWarningTime}s, Final warning at ${this.finalWarningTime}s`
    );
  }

  /**
   * Set event callbacks
   */
  public setEventHandlers(handlers: {
    onStageChange?: (stage: InterviewStage) => void;
    onTimeUpdate?: (update: TimeUpdate) => void;
    onMessage?: (message: InterviewMessage) => void;
    onTranscriptUpdate?: (entry: TranscriptEntry) => void;
    onAudioOutput?: (audioData: Buffer) => void;
    onError?: (error: Error) => void;
  }) {
    this.onStageChange = handlers.onStageChange;
    this.onTimeUpdate = handlers.onTimeUpdate;
    this.onMessage = handlers.onMessage;
    this.onTranscriptUpdate = handlers.onTranscriptUpdate;
    this.onAudioOutput = handlers.onAudioOutput;
    this.onError = handlers.onError;
  }

  /**
   * Start the interview session
   */
  public async start(): Promise<void> {
    try {
      console.log(`[Interview ${this.sessionId}] Starting voice interview session`);

      // Initialize Gemini Live Voice session
      await this.initializeGeminiLiveVoice();

      // Set stage to GREETING
      this.setStage("GREETING");

      // Start timer
      this.startTime = Date.now();
      this.startTimeMonitoring();

      // Gemini will automatically send greeting based on system prompt
      console.log(`[Interview ${this.sessionId}] Waiting for AI greeting...`);

      // Move to QUESTIONS stage after greeting
      setTimeout(() => {
        this.setStage("QUESTIONS");
      }, 5000); // Wait 5 seconds for greeting to complete
    } catch (error) {
      console.error(`[Interview ${this.sessionId}] Error starting session:`, error);
      this.handleError(error as Error);
    }
  }

  /**
   * Initialize Gemini Live Voice session
   */
  private async initializeGeminiLiveVoice(): Promise<void> {
    try {
      console.log(
        `[Interview ${this.sessionId}] Initializing Gemini Live Voice API`
      );

      // Generate system prompt
      const systemPrompt = generateInterviewSystemPrompt(
        this.config,
        this.jobTitle,
        this.jobDescription
      );

      // Initialize Google Generative AI
      const apiKey = process.env.GOOGLE_API_KEY;
      if (!apiKey) {
        throw new Error("GOOGLE_API_KEY environment variable not set");
      }

      this.genAI = new GoogleGenerativeAI(apiKey);

      // Initialize Gemini Live session with voice configuration
      // Using Gemini 2.0 Experimental Live API
      const liveConfig = {
        model: "models/gemini-2.0-flash-exp",
        systemInstruction: systemPrompt,
        generationConfig: {
          temperature: this.config.model.temperature,
          maxOutputTokens: this.config.model.maxOutputTokens,
          topP: this.config.model.topP,
          topK: this.config.model.topK,
          responseModalities: "audio", // Voice output
        },
        tools: [], // No tools needed for interview
      };

      // Create live session
      // Note: This is a placeholder for actual Gemini Live API
      // Actual implementation will use:
      // const live = await this.genAI.startLiveSession(liveConfig);

      // For now, we'll use a WebSocket-based approach
      await this.connectWebSocket(apiKey, liveConfig);

      this.geminiConnected = true;
      console.log(`[Interview ${this.sessionId}] Gemini Live Voice session initialized`);
    } catch (error) {
      console.error(`[Interview ${this.sessionId}] Gemini initialization failed:`, error);
      throw new Error("Failed to initialize AI voice interviewer");
    }
  }

  /**
   * Connect to Gemini Live API via WebSocket
   */
  private async connectWebSocket(apiKey: string, config: any): Promise<void> {
    return new Promise((resolve, reject) => {
      // Gemini Live API endpoint
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;

      this.ws = new WebSocket(wsUrl);

      this.ws.on("open", () => {
        console.log(`[Interview ${this.sessionId}] WebSocket connected to Gemini Live`);

        // Send setup message with configuration
        this.ws?.send(JSON.stringify({
          setup: {
            model: config.model,
            systemInstruction: { text: config.systemInstruction },
            generationConfig: config.generationConfig,
          }
        }));

        resolve();
      });

      this.ws.on("message", (data: Buffer) => {
        this.handleGeminiMessage(data);
      });

      this.ws.on("error", (error) => {
        console.error(`[Interview ${this.sessionId}] WebSocket error:`, error);
        reject(error);
      });

      this.ws.on("close", () => {
        console.log(`[Interview ${this.sessionId}] WebSocket closed`);
        this.geminiConnected = false;
      });
    });
  }

  /**
   * Handle incoming message from Gemini
   */
  private handleGeminiMessage(data: Buffer): void {
    try {
      const message = JSON.parse(data.toString());

      // Handle server content (audio output from Gemini)
      if (message.serverContent) {
        const content = message.serverContent;

        // Handle audio output
        if (content.modelTurn && content.modelTurn.parts) {
          content.modelTurn.parts.forEach((part: any) => {
            // Audio data from Gemini
            if (part.inlineData && part.inlineData.mimeType.startsWith("audio/")) {
              const audioBuffer = Buffer.from(part.inlineData.data, "base64");
              this.onAudioOutput?.(audioBuffer);
            }

            // Transcript text
            if (part.text) {
              this.addToTranscript("ai", part.text);

              const message: InterviewMessage = {
                type: "question",
                content: part.text,
                timestamp: this.getElapsedTime(),
                speaker: "ai",
                metadata: {
                  questionNumber: this.questionCount + 1,
                  totalQuestions: this.config.questions.totalQuestions,
                },
              };

              this.emitMessage(message);
              this.questionCount++;

              // Check if all questions answered
              if (this.questionCount >= this.config.questions.totalQuestions) {
                this.initiateEarlyCompletion();
              }
            }
          });
        }

        // Handle turn completion
        if (content.turnComplete) {
          console.log(`[Interview ${this.sessionId}] AI turn complete`);
        }
      }

      // Handle tool calls (if any)
      if (message.toolCall) {
        console.log(`[Interview ${this.sessionId}] Tool call received:`, message.toolCall);
      }

      // Handle setup completion
      if (message.setupComplete) {
        console.log(`[Interview ${this.sessionId}] Setup complete`);
      }
    } catch (error) {
      console.error(`[Interview ${this.sessionId}] Error handling Gemini message:`, error);
    }
  }

  /**
   * Send audio from candidate to Gemini
   */
  public async sendAudio(audioData: Buffer): Promise<void> {
    if (!this.ws || !this.geminiConnected) {
      throw new Error("Gemini session not connected");
    }

    try {
      // Convert audio buffer to base64
      const audioBase64 = audioData.toString("base64");

      // Send realtime input to Gemini
      this.ws.send(JSON.stringify({
        realtimeInput: {
          mediaChunks: [{
            mimeType: "audio/pcm", // Linear PCM audio
            data: audioBase64,
          }]
        }
      }));
    } catch (error) {
      console.error(`[Interview ${this.sessionId}] Error sending audio:`, error);
      this.handleError(error as Error);
    }
  }

  /**
   * Send text interrupt (for time warnings)
   */
  private async sendTextInterrupt(text: string): Promise<void> {
    if (!this.ws || !this.geminiConnected) {
      return;
    }

    try {
      this.ws.send(JSON.stringify({
        clientContent: {
          turns: [{
            role: "user",
            parts: [{ text }]
          }],
          turnComplete: true
        }
      }));
    } catch (error) {
      console.error(`[Interview ${this.sessionId}] Error sending text:`, error);
    }
  }

  /**
   * Start time monitoring
   */
  private startTimeMonitoring(): void {
    // Update every 30 seconds
    this.timeMonitor = setInterval(() => {
      const elapsed = this.getElapsedTime();
      const remaining = this.scheduledDuration - elapsed;
      const percentage = (elapsed / this.scheduledDuration) * 100;

      const update: TimeUpdate = {
        elapsed,
        remaining,
        percentage,
      };

      // Check for first warning
      if (
        elapsed >= this.firstWarningTime &&
        elapsed < this.firstWarningTime + 30 &&
        !this.warningsSent.has("first") &&
        this.currentStage === "QUESTIONS"
      ) {
        const remainingMin = Math.ceil(remaining / 60);
        this.sendTimeWarning("first_warning", remainingMin);
        this.warningsSent.add("first");
      }

      // Check for final warning
      if (
        elapsed >= this.finalWarningTime &&
        elapsed < this.finalWarningTime + 30 &&
        !this.warningsSent.has("final") &&
        this.currentStage === "QUESTIONS"
      ) {
        const remainingMin = Math.ceil(remaining / 60);
        this.sendTimeWarning("final_warning", remainingMin);
        this.warningsSent.add("final");
      }

      // Force end at scheduled duration
      if (elapsed >= this.scheduledDuration) {
        this.forceEndInterview("time_limit_reached");
      }

      this.emitTimeUpdate(update);
    }, 30000); // Every 30 seconds
  }

  /**
   * Send time warning to AI
   */
  private sendTimeWarning(warningType: string, remainingMin: number): void {
    console.log(`[Interview ${this.sessionId}] Time warning: ${warningType}, ${remainingMin} min remaining`);

    let warningMessage = "";

    if (warningType === "first_warning") {
      this.setStage("WARNING_20_MIN");
      warningMessage = `[SYSTEM: TIME WARNING] ${remainingMin} minute${remainingMin > 1 ? 's' : ''} remaining. Please wrap up soon.`;
    } else if (warningType === "final_warning") {
      this.setStage("WARNING_25_MIN");
      warningMessage = "[SYSTEM: FINAL WARNING] Approaching time limit. Please conclude the interview.";
    }

    if (warningMessage) {
      // Send as text interrupt to Gemini
      this.sendTextInterrupt(warningMessage);

      const message: InterviewMessage = {
        type: "warning",
        content: warningMessage,
        timestamp: this.getElapsedTime(),
        speaker: "ai",
        metadata: { warningType },
      };

      this.emitMessage(message);
    }
  }

  /**
   * Force end interview (time limit reached)
   */
  private forceEndInterview(reason: "time_limit_reached"): void {
    console.log(`[Interview ${this.sessionId}] Force ending: ${reason}`);

    this.setStage("WRAPPING_UP");

    // Send time-expired closing
    const signOff = this.config.signOff.timeExpiredClosing;

    this.sendTextInterrupt(`[SYSTEM: TIME EXPIRED] Please deliver closing message: "${signOff}"`);

    const message: InterviewMessage = {
      type: "sign_off",
      content: signOff,
      timestamp: this.getElapsedTime(),
      speaker: "ai",
      metadata: { signOffType: "time_expired" },
    };

    this.emitMessage(message);

    // Wait 5 seconds then complete
    setTimeout(() => {
      this.complete("time_expired");
    }, 5000);
  }

  /**
   * Initiate early completion (all questions answered before time limit)
   */
  private initiateEarlyCompletion(): void {
    console.log(`[Interview ${this.sessionId}] All questions answered, wrapping up`);

    this.setStage("WRAPPING_UP");

    const signOff = this.config.signOff.earlyCompletionClosing;

    this.sendTextInterrupt(`[SYSTEM: QUESTIONS COMPLETE] Please deliver closing message: "${signOff}"`);

    const message: InterviewMessage = {
      type: "sign_off",
      content: signOff,
      timestamp: this.getElapsedTime(),
      speaker: "ai",
      metadata: { signOffType: "early_completion" },
    };

    this.emitMessage(message);

    // Wait for candidate's final response, then complete
    setTimeout(() => {
      this.complete("early_completion");
    }, 30000);
  }

  /**
   * Complete the interview
   */
  public async complete(signOffType: SignOffType): Promise<void> {
    console.log(`[Interview ${this.sessionId}] Completing interview: ${signOffType}`);

    this.setStage("SIGN_OFF");

    // Stop time monitoring
    if (this.timeMonitor) {
      clearInterval(this.timeMonitor);
      this.timeMonitor = null;
    }

    // Send standard closing if not already sent
    if (signOffType === "standard") {
      const signOff = this.config.signOff.standardClosing;

      this.sendTextInterrupt(`[SYSTEM: END INTERVIEW] Please deliver closing message: "${signOff}"`);

      const message: InterviewMessage = {
        type: "sign_off",
        content: signOff,
        timestamp: this.getElapsedTime(),
        speaker: "ai",
        metadata: { signOffType: "standard" },
      };

      this.emitMessage(message);
    }

    // Wait 3 seconds then set to COMPLETED
    setTimeout(() => {
      this.setStage("COMPLETED");
      this.cleanup();
    }, 3000);
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    if (this.timeMonitor) {
      clearInterval(this.timeMonitor);
    }

    // Close WebSocket connection
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.geminiConnected = false;
    }

    console.log(`[Interview ${this.sessionId}] Session cleaned up`);
  }

  /**
   * Get elapsed time in seconds
   */
  private getElapsedTime(): number {
    if (this.startTime === 0) return 0;
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  /**
   * Add entry to transcript
   */
  private addToTranscript(speaker: "ai" | "candidate", text: string): void {
    const entry: TranscriptEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: this.getElapsedTime(),
      speaker,
      text,
      confidence: speaker === "ai" ? 1.0 : 0.95,
    };

    this.transcript.push(entry);
    this.onTranscriptUpdate?.(entry);
  }

  /**
   * Set stage and emit change
   */
  private setStage(stage: InterviewStage): void {
    this.currentStage = stage;
    console.log(`[Interview ${this.sessionId}] Stage changed to: ${stage}`);
    this.onStageChange?.(stage);
  }

  /**
   * Emit message
   */
  private emitMessage(message: InterviewMessage): void {
    this.onMessage?.(message);
  }

  /**
   * Emit time update
   */
  private emitTimeUpdate(update: TimeUpdate): void {
    this.onTimeUpdate?.(update);
  }

  /**
   * Handle error
   */
  private handleError(error: Error): void {
    console.error(`[Interview ${this.sessionId}] Error:`, error);
    this.onError?.(error);
  }

  /**
   * Get current transcript
   */
  public getTranscript(): TranscriptEntry[] {
    return this.transcript;
  }

  /**
   * Get current stage
   */
  public getCurrentStage(): InterviewStage {
    return this.currentStage;
  }

  /**
   * Get session status
   */
  public getStatus() {
    return {
      sessionId: this.sessionId,
      currentStage: this.currentStage,
      elapsedTime: this.getElapsedTime(),
      questionCount: this.questionCount,
      geminiConnected: this.geminiConnected,
      transcript: this.transcript,
    };
  }
}

/**
 * Create a new voice interview session
 */
export async function createVoiceInterviewSession(
  sessionId: string,
  config: InterviewAgentConfig,
  jobTitle: string,
  jobDescription: string,
  scheduledDuration?: number
): Promise<LiveInterviewSession> {
  const session = new LiveInterviewSession(
    sessionId,
    config,
    jobTitle,
    jobDescription,
    scheduledDuration
  );
  return session;
}
