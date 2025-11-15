# Voice-to-Voice Interview Implementation Guide

**Status:** ✅ **BACKEND READY** | ⏳ **FRONTEND IN PROGRESS**
**Date:** November 14, 2025
**Type:** Gemini Live Voice API (not Chat)

---

## Important: Voice-to-Voice, NOT Text Chat

The interview system uses **Gemini 2.0 Live Voice API** for real-time voice-to-voice conversation, NOT text-based chat. This was corrected from the initial implementation.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                  VOICE-TO-VOICE ARCHITECTURE                     │
└─────────────────────────────────────────────────────────────────┘

Candidate's Microphone
   ↓
Frontend (Browser MediaRecorder)
   ↓
WebSocket Client (ws://localhost:8080)
   ↓
WebSocket Server (backend/services/websocket-server.ts)
   ↓
LiveVoiceInterviewSession (backend/ai/gemini/live-interview-voice.ts)
   ↓
Gemini Live Voice API (wss://generativelanguage.googleapis.com/ws/...)
   ↓
Audio Response from Gemini
   ↓
WebSocket Server
   ↓
Frontend
   ↓
Browser Audio Playback (Candidate's Speakers)
```

---

## Key Components

### 1. **LiveVoiceInterviewSession** (Backend)

**File:** [backend/ai/gemini/live-interview-voice.ts](backend/ai/gemini/live-interview-voice.ts)

**Purpose:** Manages Gemini Live Voice API connection

**Key Features:**
- WebSocket connection to Gemini Live API
- Bidirectional audio streaming (send/receive)
- Real-time transcript generation
- Configurable duration (5-30 min)
- Dynamic warning thresholds

**Main Methods:**
- `initializeGeminiLiveVoice()` - Connect to Gemini API
- `connectWebSocket()` - Establish WebSocket with Gemini
- `handleGeminiMessage()` - Process audio/text from Gemini
- `sendAudio(audioData: Buffer)` - Send candidate audio to Gemini
- `sendTextInterrupt()` - Send system messages (time warnings)

**Audio Format:**
- **Input:** Linear PCM (audio/pcm) from candidate
- **Output:** Audio stream from Gemini (audio/pcm or audio/mp3)

---

### 2. **WebSocket Server** (Backend)

**File:** [backend/services/websocket-server.ts](backend/services/websocket-server.ts)

**Purpose:** Bridge between frontend and Gemini Live API

**Port:** 8080 (configurable via `WS_PORT` env var)

**Connection URL:**
```
ws://localhost:8080?interviewId=INT-2025-0001
```

**Message Types (Frontend → Server):**
```json
{
  "type": "audio_input",
  "data": "base64_encoded_pcm_audio"
}

{
  "type": "start"
}

{
  "type": "end"
}
```

**Message Types (Server → Frontend):**
```json
{
  "type": "connected",
  "interviewId": "INT-2025-0001"
}

{
  "type": "audio_output",
  "data": "base64_encoded_pcm_audio"
}

{
  "type": "transcript",
  "entry": {
    "id": "entry_123",
    "timestamp": 45,
    "speaker": "ai",
    "text": "Can you tell me about your background?"
  }
}

{
  "type": "stage_change",
  "stage": "QUESTIONS"
}

{
  "type": "time_update",
  "elapsed": 600,
  "remaining": 300,
  "percentage": 66.7
}

{
  "type": "ai_message",
  "content": "Thank you for your response.",
  "timestamp": 45
}

{
  "type": "error",
  "message": "Error message"
}
```

**Run Command:**
```bash
cd backend/services
ts-node websocket-server.ts
```

---

### 3. **Frontend Integration** (To Be Implemented)

**File:** [frontend/app/candidate/interview/[id]/page.tsx](frontend/app/candidate/interview/[id]/page.tsx)

**Required Changes:**

#### A. Add WebSocket Client

```typescript
const [ws, setWs] = useState<WebSocket | null>(null);
const audioContextRef = useRef<AudioContext | null>(null);
const audioChunksRef = useRef<Float32Array[]>([]);

useEffect(() => {
  // Connect to WebSocket server
  const websocket = new WebSocket(`ws://localhost:8080?interviewId=${interviewId}`);

  websocket.onopen = () => {
    console.log("WebSocket connected");
    toast({
      title: "Connected",
      description: "Ready to start interview",
    });
  };

  websocket.onmessage = (event) => {
    const message = JSON.parse(event.data);

    switch (message.type) {
      case "audio_output":
        // Play audio from Gemini
        playAudio(message.data);
        break;

      case "transcript":
        // Add to transcript
        setTranscript((prev) => [...prev, message.entry]);
        break;

      case "stage_change":
        setStage(message.stage);
        break;

      case "time_update":
        setElapsedTime(message.elapsed);
        break;

      case "error":
        setError(message.message);
        break;
    }
  };

  websocket.onerror = (error) => {
    console.error("WebSocket error:", error);
    setError("Connection error");
  };

  websocket.onclose = () => {
    console.log("WebSocket closed");
  };

  setWs(websocket);

  return () => {
    websocket.close();
  };
}, [interviewId]);
```

#### B. Capture Audio from Microphone

```typescript
const handleStartInterview = async () => {
  try {
    // Get media stream
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: {
        channelCount: 1, // Mono
        sampleRate: 16000, // 16 kHz
        echoCancellation: true,
        noiseSuppression: true,
      },
    });

    mediaStreamRef.current = stream;

    // Set video preview
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }

    // Start audio processing
    audioContextRef.current = new AudioContext({ sampleRate: 16000 });
    const source = audioContextRef.current.createMediaStreamSource(stream);
    const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (event) => {
      const inputData = event.inputBuffer.getChannelData(0);

      // Convert Float32Array to Int16Array (PCM)
      const pcmData = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        const s = Math.max(-1, Math.min(1, inputData[i]));
        pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }

      // Send to WebSocket
      if (ws && ws.readyState === WebSocket.OPEN) {
        const buffer = Buffer.from(pcmData.buffer);
        ws.send(JSON.stringify({
          type: "audio_input",
          data: buffer.toString("base64"),
        }));
      }
    };

    source.connect(processor);
    processor.connect(audioContextRef.current.destination);

    // Start recording for playback
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9,opus",
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordingChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(recordingChunksRef.current, { type: "video/webm" });
      await uploadInterviewRecording(interviewId, blob);
    };

    mediaRecorder.start(1000);
    mediaRecorderRef.current = mediaRecorder;

    setIsRecording(true);

    // Send start message to WebSocket
    ws?.send(JSON.stringify({ type: "start" }));

  } catch (error) {
    console.error("Error starting interview:", error);
    setError("Failed to access microphone");
  }
};
```

#### C. Play Audio from Gemini

```typescript
const playAudio = (base64Audio: string) => {
  const audioData = Buffer.from(base64Audio, "base64");

  // Convert to AudioBuffer and play
  if (audioContextRef.current) {
    audioContextRef.current.decodeAudioData(
      audioData.buffer,
      (buffer) => {
        const source = audioContextRef.current!.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current!.destination);
        source.start(0);
      },
      (error) => {
        console.error("Error decoding audio:", error);
      }
    );
  }
};
```

#### D. Stop Interview

```typescript
const handleStopInterview = async () => {
  // Send end message to WebSocket
  ws?.send(JSON.stringify({ type: "end" }));

  // Stop recording
  if (mediaRecorderRef.current) {
    mediaRecorderRef.current.stop();
  }

  // Stop audio processing
  if (audioContextRef.current) {
    audioContextRef.current.close();
  }

  // Stop media stream
  if (mediaStreamRef.current) {
    mediaStreamRef.current.getTracks().forEach((track) => track.stop());
  }

  // Close WebSocket
  ws?.close();

  setIsRecording(false);
  setStage("COMPLETED");

  // Redirect to completion page
  setTimeout(() => {
    router.push(`/candidate/interview/${interviewId}/complete`);
  }, 3000);
};
```

---

## Gemini Live Voice API Details

### Connection URL:
```
wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=YOUR_API_KEY
```

### Setup Message (sent on connection):
```json
{
  "setup": {
    "model": "models/gemini-2.0-flash-exp",
    "systemInstruction": {
      "text": "You are an AI interviewer for XYZ Company..."
    },
    "generationConfig": {
      "temperature": 0.7,
      "maxOutputTokens": 2048,
      "topP": 0.9,
      "topK": 40,
      "responseModalities": "audio"
    }
  }
}
```

### Send Audio to Gemini:
```json
{
  "realtimeInput": {
    "mediaChunks": [{
      "mimeType": "audio/pcm",
      "data": "base64_encoded_pcm_audio"
    }]
  }
}
```

### Receive from Gemini:
```json
{
  "serverContent": {
    "modelTurn": {
      "parts": [
        {
          "inlineData": {
            "mimeType": "audio/pcm",
            "data": "base64_encoded_audio"
          }
        },
        {
          "text": "Transcript of what AI said"
        }
      ]
    },
    "turnComplete": true
  }
}
```

---

## Audio Format Specifications

### Input (Candidate → Gemini):
- **Format:** Linear PCM (Pulse Code Modulation)
- **Sample Rate:** 16 kHz
- **Channels:** 1 (Mono)
- **Bit Depth:** 16-bit signed integers
- **Encoding:** Int16Array → Base64

### Output (Gemini → Candidate):
- **Format:** Linear PCM or MP3 (depends on Gemini response)
- **Sample Rate:** 24 kHz (typical)
- **Channels:** 1 (Mono)
- **Decoding:** Base64 → AudioBuffer → Web Audio API playback

---

## Deployment Instructions

### 1. Start WebSocket Server

```bash
# Development
cd backend/services
ts-node websocket-server.ts

# Production (with PM2)
pm2 start websocket-server.ts --name "interview-ws" --interpreter ts-node

# Or compile and run
tsc websocket-server.ts
node websocket-server.js
```

### 2. Environment Variables

```bash
# .env
GOOGLE_API_KEY=your_gemini_api_key_here
WS_PORT=8080
```

### 3. Update Frontend Config

```typescript
// frontend/src/config/websocket.ts
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
```

### 4. Deploy WebSocket Server

**Option A: Same Server as Next.js**
- Run WebSocket server on port 8080
- Reverse proxy with Nginx/Caddy

**Option B: Separate Server**
- Deploy WebSocket server to dedicated instance
- Update `WS_URL` to point to deployed URL

**Option C: Serverless (Advanced)**
- Use AWS API Gateway WebSocket API
- Lambda functions for message handling

---

## Testing Checklist

- [ ] WebSocket server starts successfully
- [ ] Frontend connects to WebSocket
- [ ] Microphone audio captured and sent
- [ ] Audio from Gemini received and played
- [ ] Transcript updates in real-time
- [ ] Time warnings work correctly
- [ ] Interview ends gracefully
- [ ] Recording saved to Firebase Storage
- [ ] Configurable duration (5-30 min) works

---

## Differences from Text Chat Implementation

| Feature | Text Chat (OLD) | Voice-to-Voice (NEW) |
|---------|-----------------|----------------------|
| **API** | Gemini Chat API | Gemini Live Voice API |
| **Communication** | HTTP POST requests | WebSocket (bidirectional) |
| **Input** | Text messages | PCM audio stream |
| **Output** | Text responses | Audio + Transcript |
| **Latency** | Request/response | Real-time streaming |
| **Frontend** | Input field + Send button | Microphone capture |
| **Backend** | API route | WebSocket server |
| **Files** | `send-message/route.ts` | `websocket-server.ts` |
| **Session** | `LiveInterviewSession` | `LiveVoiceInterviewSession` |

---

## Known Issues & Future Enhancements

### Current Limitations:
1. **Browser Compatibility:** Web Audio API support required
2. **Audio Quality:** Depends on microphone and internet connection
3. **Latency:** ~200-500ms typical (acceptable for interviews)
4. **WebSocket Deployment:** Requires custom server (not supported in Next.js API routes)

### Planned Enhancements:
1. **Voice Activity Detection (VAD):** Only send audio when candidate is speaking
2. **Noise Suppression:** Advanced audio filtering
3. **Multi-language Support:** Detect and transcribe in candidate's language
4. **Emotion Detection:** Analyze tone, confidence, hesitation
5. **Screen Sharing:** Record candidate's screen during technical interviews

---

## References

- [Gemini Live Voice API Documentation](https://ai.google.dev/gemini-api/docs/live-api)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [WebSocket MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)

---

**End of Voice-to-Voice Implementation Guide**
