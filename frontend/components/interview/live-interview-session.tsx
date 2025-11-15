"use client";

import { useState, useEffect, useRef } from "react";
import { Timer, Video, Mic, AlertTriangle, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LiveInterviewSessionProps {
  interviewId: string;
  companyName: string;
  companyLogoUrl?: string;
  jobTitle: string;
  maxDuration: number; // in seconds (default: 1800 = 30 min)
}

interface TranscriptEntry {
  speaker: "ai" | "candidate";
  text: string;
  time: number; // seconds elapsed
}

export default function LiveInterviewSession({
  interviewId,
  companyName,
  companyLogoUrl,
  jobTitle,
  maxDuration = 1800,
}: LiveInterviewSessionProps) {
  const [stage, setStage] = useState<"pre-start" | "active" | "completed">("pre-start");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(6);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // System checks
  const [cameraPermission, setCameraPermission] = useState<"pending" | "granted" | "denied">("pending");
  const [micPermission, setMicPermission] = useState<"pending" | "granted" | "denied">("pending");
  const [internetSpeed, setInternetSpeed] = useState<"checking" | "good" | "poor">("checking");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [recordingConsent, setRecordingConsent] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const webSocketRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // System checks on mount
  useEffect(() => {
    if (stage === "pre-start") {
      checkPermissions();
      checkInternetSpeed();
    }
  }, [stage]);

  // Timer effect
  useEffect(() => {
    if (stage !== "active") return;

    timerRef.current = setInterval(() => {
      setTimeElapsed((prev) => {
        const newTime = prev + 1;

        // Show warnings at specific times
        if (newTime === 1200) {
          // 20 minutes
          setShowWarning(true);
          setWarningMessage("⚠️ 10 minutes remaining");
          setTimeout(() => setShowWarning(false), 5000);
        } else if (newTime === 1500) {
          // 25 minutes
          setShowWarning(true);
          setWarningMessage("⚠️ 5 minutes remaining - Final questions");
          setTimeout(() => setShowWarning(false), 5000);
        } else if (newTime >= maxDuration) {
          // 30 minutes
          endInterview("time_limit");
        }

        return newTime;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [stage, maxDuration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (webSocketRef.current) {
        webSocketRef.current.close();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const checkPermissions = async () => {
    try {
      // Check camera
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraPermission("granted");
      cameraStream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      setCameraPermission("denied");
    }

    try {
      // Check microphone
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission("granted");
      micStream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      setMicPermission("denied");
    }
  };

  const checkInternetSpeed = async () => {
    try {
      const startTime = Date.now();
      await fetch("https://www.google.com/favicon.ico", { mode: "no-cors" });
      const endTime = Date.now();
      const latency = endTime - startTime;

      setInternetSpeed(latency < 200 ? "good" : "poor");
    } catch (err) {
      setInternetSpeed("poor");
    }
  };

  const startInterview = async () => {
    if (!termsAccepted || !recordingConsent) {
      alert("Please accept the terms and recording consent to continue.");
      return;
    }

    try {
      // Request camera and microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 24000,
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Setup audio visualization
      setupAudioVisualization(stream);

      // Initialize WebSocket connection to backend
      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${wsProtocol}//${window.location.host}/api/interview/live/${interviewId}`;

      webSocketRef.current = new WebSocket(wsUrl);

      webSocketRef.current.onopen = () => {
        console.log("Connected to interview session");
        setIsConnected(true);

        // Initialize MediaRecorder
        mediaRecorderRef.current = new MediaRecorder(stream, {
          mimeType: "video/webm;codecs=vp9,opus",
        });

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0 && webSocketRef.current?.readyState === WebSocket.OPEN) {
            // Stream video/audio chunks to backend
            webSocketRef.current.send(event.data);
          }
        };

        mediaRecorderRef.current.start(1000); // Send chunks every second
        setStage("active");
      };

      webSocketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "question") {
          setCurrentQuestion(data.text);
          setQuestionsAnswered(data.questionNumber - 1);

          // Add to transcript
          setTranscript((prev) => [
            ...prev,
            {
              speaker: "ai",
              text: data.text,
              time: data.timestamp,
            },
          ]);
        } else if (data.type === "audio") {
          // Play AI audio response
          playAudioResponse(data.audioData);
        } else if (data.type === "transcript") {
          // Add candidate response to transcript
          setTranscript((prev) => [
            ...prev,
            {
              speaker: "candidate",
              text: data.text,
              time: data.timestamp,
            },
          ]);
        } else if (data.type === "sign_off") {
          // AI is ending the interview
          setTimeout(() => {
            endInterview("natural_completion");
          }, 5000); // Wait for sign-off to finish
        }
      };

      webSocketRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
      };

      webSocketRef.current.onclose = () => {
        console.log("WebSocket connection closed");
        setIsConnected(false);
      };
    } catch (error) {
      console.error("Failed to start interview:", error);
      alert("Could not access camera/microphone. Please check permissions.");
    }
  };

  const setupAudioVisualization = (stream: MediaStream) => {
    try {
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      // Monitor audio levels to detect speaking
      const checkAudioLevel = () => {
        if (!analyserRef.current) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setIsSpeaking(average > 20); // Threshold for speaking detection

        if (stage === "active") {
          requestAnimationFrame(checkAudioLevel);
        }
      };

      checkAudioLevel();
    } catch (err) {
      console.error("Failed to setup audio visualization:", err);
    }
  };

  const playAudioResponse = (audioData: string) => {
    const audio = new Audio(`data:audio/wav;base64,${audioData}`);
    audio.play();
  };

  const endInterview = (reason: string) => {
    setStage("completed");

    // Stop recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    // Close WebSocket
    if (webSocketRef.current) {
      webSocketRef.current.close();
    }

    // Stop video stream
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }

    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Navigate to completion page
    setTimeout(() => {
      window.location.href = `/candidate/interview/${interviewId}/complete`;
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimerColor = () => {
    if (timeElapsed < 1200) return "text-green-600"; // 0-20 min
    if (timeElapsed < 1500) return "text-yellow-600"; // 20-25 min
    return "text-red-600"; // 25-30 min
  };

  const canStartInterview =
    cameraPermission === "granted" &&
    micPermission === "granted" &&
    internetSpeed !== "checking" &&
    termsAccepted &&
    recordingConsent;

  // Pre-start screen
  if (stage === "pre-start") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/30 px-4">
        <div className="max-w-2xl w-full p-8 bg-card rounded-lg shadow-lg">
          {/* Company Logo */}
          {companyLogoUrl && (
            <div className="flex justify-center mb-6">
              <img src={companyLogoUrl} alt={companyName} className="h-16 object-contain" />
            </div>
          )}

          <h1 className="text-3xl font-bold mb-2 text-center">AI Interview</h1>
          <p className="text-xl mb-2 text-center text-muted-foreground">{jobTitle}</p>
          <p className="text-lg mb-8 text-center font-medium">{companyName}</p>

          {/* Interview Details */}
          <div className="space-y-4 my-8">
            <div className="flex items-center gap-3">
              <Timer className="w-5 h-5 text-primary" />
              <span>Duration: 20-25 minutes (maximum 30 minutes)</span>
            </div>
            <div className="flex items-center gap-3">
              <Video className="w-5 h-5 text-primary" />
              <span>Type: AI Screening Interview</span>
            </div>
          </div>

          {/* System Checks */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-3">System Check</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Camera Permission</span>
                <Badge
                  variant={
                    cameraPermission === "granted"
                      ? "default"
                      : cameraPermission === "denied"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {cameraPermission === "granted" ? "✓ Granted" : cameraPermission === "denied" ? "✗ Denied" : "Checking..."}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Microphone Permission</span>
                <Badge
                  variant={
                    micPermission === "granted"
                      ? "default"
                      : micPermission === "denied"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {micPermission === "granted" ? "✓ Granted" : micPermission === "denied" ? "✗ Denied" : "Checking..."}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Internet Connection</span>
                <Badge
                  variant={internetSpeed === "good" ? "default" : internetSpeed === "poor" ? "destructive" : "secondary"}
                >
                  {internetSpeed === "good" ? "✓ Good" : internetSpeed === "poor" ? "⚠ Slow" : "Checking..."}
                </Badge>
              </div>
            </div>
          </div>

          {/* Consents */}
          <div className="space-y-3 mb-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={recordingConsent}
                onChange={(e) => setRecordingConsent(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm">
                I consent to my interview being recorded and transcribed for evaluation purposes.
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm">
                I have read and accept the{" "}
                <a href="/privacy" target="_blank" className="text-primary underline">
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a href="/terms" target="_blank" className="text-primary underline">
                  Terms of Service
                </a>
                .
              </span>
            </label>
          </div>

          {/* Start Button */}
          <Button onClick={startInterview} size="lg" className="w-full" disabled={!canStartInterview}>
            Start Interview
          </Button>

          {!canStartInterview && (
            <p className="text-sm text-center text-muted-foreground mt-3">
              Please complete all system checks and accept the terms to start.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Active interview screen
  if (stage === "active") {
    return (
      <div className="flex flex-col h-screen">
        {/* Top Bar */}
        <div className="border-b bg-card p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              {companyLogoUrl && (
                <img src={companyLogoUrl} alt={companyName} className="h-8 object-contain" />
              )}
              <div className="font-bold text-lg">{companyName}</div>
              <Badge variant="outline">{jobTitle}</Badge>
            </div>

            <div className="flex items-center gap-6">
              {/* Progress */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Progress:</span>
                <span className="font-medium">
                  {questionsAnswered}/{totalQuestions}
                </span>
                <Progress value={(questionsAnswered / totalQuestions) * 100} className="w-24" />
              </div>

              {/* Timer */}
              <div className={`flex items-center gap-2 font-mono text-lg ${getTimerColor()}`}>
                <Timer className="w-5 h-5" />
                {formatTime(maxDuration - timeElapsed)}
              </div>

              {/* Connection Status */}
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Warning Banner */}
        {showWarning && (
          <div className="bg-yellow-100 border-b border-yellow-300 px-4 py-2 text-center">
            <div className="flex items-center justify-center gap-2 text-yellow-900">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">{warningMessage}</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Video Panel */}
          <div className="flex-1 bg-black flex flex-col items-center justify-center p-8">
            <video ref={videoRef} autoPlay muted className="max-w-2xl w-full rounded-lg shadow-2xl" />

            {/* Recording Indicator */}
            <div className="mt-4 flex items-center gap-2 text-white">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
              <span>Recording</span>
            </div>

            {/* Current Question */}
            {currentQuestion && (
              <div className="mt-8 max-w-2xl w-full bg-card p-6 rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">
                  Question {questionsAnswered + 1} of {totalQuestions}
                </div>
                <p className="text-lg">{currentQuestion}</p>
              </div>
            )}

            {/* Audio Visualizer */}
            {isSpeaking && (
              <div className="mt-4 flex items-center gap-2 text-white">
                <Activity className="w-5 h-5 animate-pulse" />
                <span className="text-sm">You're speaking...</span>
              </div>
            )}
          </div>

          {/* Transcript Sidebar */}
          <div className="w-80 bg-card border-l overflow-y-auto p-4">
            <h3 className="font-semibold mb-4">Live Transcript</h3>
            <div className="space-y-3">
              {transcript.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center mt-8">
                  Transcript will appear here during the interview
                </p>
              ) : (
                transcript.map((item, index) => (
                  <div
                    key={index}
                    className={`text-sm p-3 rounded-lg ${
                      item.speaker === "ai" ? "bg-primary/10 border border-primary/20" : "bg-muted"
                    }`}
                  >
                    <div className="font-medium mb-1">{item.speaker === "ai" ? "AI Interviewer" : "You"}</div>
                    <div className="text-foreground">{item.text}</div>
                    <div className="text-xs text-muted-foreground mt-1">{formatTime(item.time)}</div>
                  </div>
                ))
              )}
            </div>

            {/* Questions Timeline */}
            <div className="mt-8 pt-4 border-t">
              <h3 className="font-semibold mb-3">Questions Timeline</h3>
              <div className="space-y-2">
                {Array.from({ length: totalQuestions }, (_, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 text-sm ${
                      i < questionsAnswered ? "text-primary font-medium" : "text-muted-foreground"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        i < questionsAnswered ? "bg-primary" : "bg-muted-foreground/30"
                      }`}
                    />
                    <span>Question {i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="border-t bg-card p-4">
          <div className="max-w-7xl mx-auto flex justify-center gap-4">
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm("Are you sure you want to end the interview?")) {
                  endInterview("user_ended");
                }
              }}
            >
              End Interview
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Completed state (transitioning)
  if (stage === "completed") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/30">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Interview Complete</h2>
          <p className="text-muted-foreground">Redirecting to completion page...</p>
        </div>
      </div>
    );
  }

  return null;
}
