"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Video,
  StopCircle,
  Play,
  Trash2,
  Upload,
  Camera,
  Mic,
  MicOff,
  VideoOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw
} from "lucide-react";

interface VideoRecorderProps {
  onVideoRecorded: (videoBlob: Blob, videoUrl: string) => void;
  maxDuration?: number; // in seconds
  required?: boolean;
}

export default function VideoRecorder({
  onVideoRecorded,
  maxDuration = 120, // 2 minutes default
  required = false
}: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string>("");
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionError, setPermissionError] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playbackRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Request camera and microphone permissions
  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true; // Mute preview to avoid feedback
        setCameraReady(true);
      }

      setHasPermission(true);
      setPermissionError("");
    } catch (err: any) {
      console.error("Permission error:", err);
      if (err.name === "NotAllowedError") {
        setPermissionError("Camera and microphone access denied. Please allow access to record your introduction.");
      } else if (err.name === "NotFoundError") {
        setPermissionError("No camera or microphone found. Please connect a device and try again.");
      } else {
        setPermissionError("Unable to access camera and microphone. Please check your device settings.");
      }
      setHasPermission(false);
    }
  };

  // Start recording
  const startRecording = () => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: "video/webm;codecs=vp9,opus"
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setRecordedBlob(blob);
      setRecordedUrl(url);
      onVideoRecorded(blob, url);
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(1000); // Capture in 1-second chunks
    setIsRecording(true);
    setRecordingTime(0);

    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => {
        const newTime = prev + 1;
        if (newTime >= maxDuration) {
          stopRecording();
        }
        return newTime;
      });
    }, 1000);
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Stop camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setCameraReady(false);
      }
    }
  };

  // Delete recorded video
  const deleteRecording = () => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }
    setRecordedBlob(null);
    setRecordedUrl("");
    setRecordingTime(0);
  };

  // Retry - request permissions again
  const retry = () => {
    deleteRecording();
    requestPermissions();
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [recordedUrl]);

  // Calculate progress percentage
  const progressPercentage = (recordingTime / maxDuration) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5 text-primary" />
          Video Introduction
        </CardTitle>
        <CardDescription>
          Record a brief introduction video (max {Math.floor(maxDuration / 60)} minutes)
          {required && <span className="text-destructive ml-1">*</span>}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Permission Error */}
        {permissionError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{permissionError}</AlertDescription>
          </Alert>
        )}

        {/* Camera Preview / Recorded Video */}
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          {!hasPermission && !recordedUrl && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
              <Camera className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-lg font-semibold mb-2">Camera Access Required</p>
              <p className="text-sm text-muted-foreground mb-4">
                We need access to your camera and microphone to record your introduction
              </p>
              <Button onClick={requestPermissions} size="lg">
                <Camera className="w-4 h-4 mr-2" />
                Enable Camera & Microphone
              </Button>
            </div>
          )}

          {/* Live Camera Preview */}
          {hasPermission && !recordedUrl && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {isRecording && (
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-semibold">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  REC {formatTime(recordingTime)}
                </div>
              )}
              {cameraReady && !isRecording && (
                <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                  <CheckCircle2 className="w-4 h-4 inline mr-1 text-green-600" />
                  Camera Ready
                </div>
              )}
            </>
          )}

          {/* Recorded Video Playback */}
          {recordedUrl && (
            <>
              <video
                ref={playbackRef}
                src={recordedUrl}
                controls
                className="w-full h-full object-cover"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4 inline mr-1" />
                Recorded
              </div>
            </>
          )}
        </div>

        {/* Recording Progress Bar */}
        {isRecording && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Recording...</span>
              <span className="font-medium">
                {formatTime(recordingTime)} / {formatTime(maxDuration)}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2 justify-center">
          {!hasPermission && !recordedUrl && (
            <Button onClick={requestPermissions} size="lg" variant="default">
              <Camera className="w-4 h-4 mr-2" />
              Enable Camera
            </Button>
          )}

          {hasPermission && !isRecording && !recordedUrl && cameraReady && (
            <Button onClick={startRecording} size="lg" variant="default">
              <Video className="w-4 h-4 mr-2" />
              Start Recording
            </Button>
          )}

          {isRecording && (
            <Button onClick={stopRecording} size="lg" variant="destructive">
              <StopCircle className="w-4 h-4 mr-2" />
              Stop Recording
            </Button>
          )}

          {recordedUrl && (
            <>
              <Button onClick={retry} size="lg" variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Re-record
              </Button>
              <Button onClick={deleteRecording} size="lg" variant="outline">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>

        {/* Tips */}
        {!recordedUrl && (
          <Alert>
            <Mic className="h-4 w-4" />
            <AlertDescription>
              <strong>Tips for a great introduction:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Ensure good lighting and a quiet environment</li>
                <li>Look directly at the camera and speak clearly</li>
                <li>Introduce yourself and briefly highlight your experience</li>
                <li>Keep it professional and concise</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Recording Info */}
        {recordedUrl && (
          <Alert>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription>
              Video recorded successfully! Duration: {formatTime(recordingTime)}
              {recordedBlob && (
                <span className="ml-2 text-muted-foreground">
                  ({(recordedBlob.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
