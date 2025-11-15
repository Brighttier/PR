# Candidate Interview Session Architecture

## Component Hierarchy

```
/candidate/interview/[id]
├── page.tsx (Container)
│   ├── Loads interview data from Firestore
│   ├── Validates interview status
│   └── Renders LiveInterviewSession
│
└── LiveInterviewSession (Main Component)
    ├── Pre-Start Stage
    │   ├── System Checks
    │   │   ├── Camera Permission
    │   │   ├── Microphone Permission
    │   │   └── Internet Speed Test
    │   ├── Consents
    │   │   ├── Recording Consent Checkbox
    │   │   └── Terms & Privacy Checkbox
    │   └── Start Interview Button
    │
    ├── Active Stage
    │   ├── Top Bar
    │   │   ├── Company Logo & Name
    │   │   ├── Job Title Badge
    │   │   ├── Progress Indicator
    │   │   ├── Countdown Timer
    │   │   └── Connection Status
    │   │
    │   ├── Warning Banner (conditional)
    │   │   ├── 20-minute warning
    │   │   └── 25-minute warning
    │   │
    │   ├── Main Content (2-column layout)
    │   │   ├── Video Panel (Left)
    │   │   │   ├── Video Preview
    │   │   │   ├── Recording Indicator
    │   │   │   ├── Current Question Display
    │   │   │   └── Audio Visualizer
    │   │   │
    │   │   └── Transcript Sidebar (Right)
    │   │       ├── Live Transcript
    │   │       └── Questions Timeline
    │   │
    │   └── Bottom Controls
    │       └── End Interview Button
    │
    └── Completed Stage
        └── Redirect to /complete
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        User Action                          │
│                  (Click "Start Interview")                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Initialize Media                          │
│                                                              │
│  1. Request camera/microphone access                        │
│  2. Create MediaStream                                      │
│  3. Attach to <video> element                               │
│  4. Setup Audio Visualization                               │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 Initialize WebSocket                        │
│                                                              │
│  URL: wss://domain.com/api/interview/live/{interviewId}    │
│                                                              │
│  On Open:                                                   │
│    - Create MediaRecorder                                   │
│    - Start recording (1-second chunks)                      │
│    - Set stage to "active"                                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Start Recording                           │
│                                                              │
│  MediaRecorder.start(1000)                                  │
│    ├── Collect video/audio chunks every 1 second           │
│    └── Send chunks to WebSocket                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Start Timer                              │
│                                                              │
│  setInterval(() => {                                        │
│    setTimeElapsed(prev => prev + 1);                        │
│    checkWarnings();                                         │
│  }, 1000);                                                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  Interview Active                           │
│                                                              │
│  ┌────────────────────────────────────────────────┐        │
│  │           WebSocket Message Flow               │        │
│  │                                                 │        │
│  │  Client → Server:                              │        │
│  │    - Video/audio chunks (binary, every 1s)     │        │
│  │                                                 │        │
│  │  Server → Client:                              │        │
│  │    - Question (JSON)                            │        │
│  │    - Audio response (base64)                   │        │
│  │    - Transcript (JSON)                         │        │
│  │    - Sign-off (JSON)                           │        │
│  └────────────────────────────────────────────────┘        │
│                                                              │
│  Timer Events:                                              │
│    - 20:00 → Show yellow warning                           │
│    - 25:00 → Show red warning                              │
│    - 30:00 → Force end interview                           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   End Interview                             │
│                                                              │
│  1. Stop MediaRecorder                                      │
│  2. Close WebSocket                                         │
│  3. Stop video/audio tracks                                 │
│  4. Clear timer                                             │
│  5. Set stage to "completed"                                │
│  6. Redirect to /complete                                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  Completion Page                            │
│                                                              │
│  1. Load interview summary from Firestore                   │
│  2. Display:                                                │
│     - Duration                                              │
│     - Questions answered                                    │
│     - Interview ID                                          │
│  3. Show "What happens next?"                               │
│  4. Provide navigation buttons                              │
└─────────────────────────────────────────────────────────────┘
```

## State Machine

```
┌──────────────┐
│  PRE_START   │ ← Initial state
└──────┬───────┘
       │ User clicks "Start Interview"
       │ (after system checks pass)
       ▼
┌──────────────┐
│   GREETING   │ ← AI says hello
└──────┬───────┘
       │ Greeting complete
       ▼
┌──────────────┐
│  QUESTIONS   │ ◄─────┐
└──────┬───────┘       │
       │ Time: 0-20min │ AI asks questions
       ▼               │
┌──────────────┐       │
│WARNING_20_MIN│ ──────┘
└──────┬───────┘
       │ Time: 20-25min
       ▼
┌──────────────┐
│WARNING_25_MIN│
└──────┬───────┘
       │ Time: 25-30min
       ▼
┌──────────────┐
│ WRAPPING_UP  │
└──────┬───────┘
       │ Final question complete
       ▼
┌──────────────┐
│   SIGN_OFF   │ ← AI says goodbye
└──────┬───────┘
       │ Sign-off complete OR time limit
       ▼
┌──────────────┐
│  COMPLETED   │ ← Terminal state
└──────────────┘
       │
       ▼ Redirect to /complete
```

## WebSocket Protocol

### Connection

```typescript
// Client initiates connection
const ws = new WebSocket(`wss://domain.com/api/interview/live/${interviewId}`);

ws.onopen = () => {
  console.log("Connected to interview session");
  // Start recording
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  handleMessage(data);
};

ws.onerror = (error) => {
  console.error("WebSocket error:", error);
  // Handle connection errors
};

ws.onclose = () => {
  console.log("Connection closed");
  // Clean up
};
```

### Message Types

#### 1. Question (Server → Client)

```json
{
  "type": "question",
  "text": "Can you tell me about your experience with React?",
  "questionNumber": 3,
  "timestamp": 180
}
```

**Client Action:**
- Display question in main panel
- Update progress indicator (3/6)
- Add to transcript with "AI Interviewer" speaker
- Increment `questionsAnswered` state

#### 2. Audio Response (Server → Client)

```json
{
  "type": "audio",
  "audioData": "UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAABA..."
}
```

**Client Action:**
- Decode base64 audio data
- Play using Audio() constructor
- Continue recording candidate's response

#### 3. Transcript (Server → Client)

```json
{
  "type": "transcript",
  "text": "I have 5 years of experience with React...",
  "timestamp": 185
}
```

**Client Action:**
- Add to transcript with "You" speaker
- Update transcript UI
- Auto-scroll to latest entry

#### 4. Sign-Off (Server → Client)

```json
{
  "type": "sign_off",
  "message": "Thank you for your time. Best of luck!"
}
```

**Client Action:**
- Display final message
- Wait 5 seconds for audio to finish
- End interview and redirect

#### 5. Video/Audio Chunk (Client → Server)

```
Binary Blob (video/webm)
- Sent every 1 second
- Codec: VP9 video + Opus audio
```

**Server Action:**
- Stream to Gemini Live API
- Process audio in real-time
- Generate transcripts and responses

## Firestore Integration

### Read Operations

#### Interview Data (On Page Load)

```typescript
const interviewRef = doc(db, "interviews", interviewId);
const interviewSnap = await getDoc(interviewRef);

if (interviewSnap.exists()) {
  const data = interviewSnap.data();
  // Extract: jobTitle, companyName, companyLogoUrl, etc.
}
```

#### Interview Summary (On Completion)

```typescript
const interviewRef = doc(db, "interviews", interviewId);
const interviewSnap = await getDoc(interviewRef);

if (interviewSnap.exists()) {
  const data = interviewSnap.data();
  // Extract: duration, questionsAsked, completedAt
}
```

### Write Operations (Backend)

#### Update Interview Status

```typescript
await updateDoc(doc(db, "interviews", interviewId), {
  status: "in_progress",
  startedAt: Timestamp.now(),
  currentStage: "GREETING"
});
```

#### Save Transcript Entry

```typescript
await addDoc(collection(db, "interviews", interviewId, "transcript"), {
  timestamp: 180,
  speaker: "ai",
  text: "Can you tell me about your experience?",
  createdAt: Timestamp.now()
});
```

#### Complete Interview

```typescript
await updateDoc(doc(db, "interviews", interviewId), {
  status: "completed",
  completedAt: Timestamp.now(),
  duration: 1650,
  questionsAsked: 6,
  endReason: "natural_completion",
  currentStage: "COMPLETED"
});
```

## Timer Logic

### Time Tracking

```typescript
const [timeElapsed, setTimeElapsed] = useState(0);
const maxDuration = 1800; // 30 minutes

useEffect(() => {
  if (stage !== "active") return;

  const timer = setInterval(() => {
    setTimeElapsed(prev => {
      const newTime = prev + 1;

      // Check thresholds
      if (newTime === 1200) { // 20:00
        setShowWarning(true);
        setWarningMessage("⚠️ 10 minutes remaining");
        setTimeout(() => setShowWarning(false), 5000);
      }

      if (newTime === 1500) { // 25:00
        setShowWarning(true);
        setWarningMessage("⚠️ 5 minutes remaining - Final questions");
        setTimeout(() => setShowWarning(false), 5000);
      }

      if (newTime >= maxDuration) { // 30:00
        endInterview("time_limit");
      }

      return newTime;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [stage, maxDuration]);
```

### Display Format

```typescript
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// Usage:
formatTime(timeElapsed) // "5:30"
formatTime(maxDuration - timeElapsed) // "24:30" (countdown)
```

### Color Coding

```typescript
const getTimerColor = () => {
  if (timeElapsed < 1200) return "text-green-600";   // 0-20 min
  if (timeElapsed < 1500) return "text-yellow-600";  // 20-25 min
  return "text-red-600";                              // 25-30 min
};

// Usage in JSX:
<div className={`font-mono text-lg ${getTimerColor()}`}>
  {formatTime(maxDuration - timeElapsed)}
</div>
```

## Audio Visualization

### Setup

```typescript
const audioContextRef = useRef<AudioContext | null>(null);
const analyserRef = useRef<AnalyserNode | null>(null);

const setupAudioVisualization = (stream: MediaStream) => {
  audioContextRef.current = new AudioContext();
  analyserRef.current = audioContextRef.current.createAnalyser();

  const source = audioContextRef.current.createMediaStreamSource(stream);
  source.connect(analyserRef.current);

  analyserRef.current.fftSize = 256;

  checkAudioLevel();
};
```

### Level Detection

```typescript
const checkAudioLevel = () => {
  if (!analyserRef.current) return;

  const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
  analyserRef.current.getByteFrequencyData(dataArray);

  const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
  setIsSpeaking(average > 20); // Threshold

  if (stage === "active") {
    requestAnimationFrame(checkAudioLevel);
  }
};
```

### Visual Indicator

```tsx
{isSpeaking && (
  <div className="flex items-center gap-2 text-white">
    <Activity className="w-5 h-5 animate-pulse" />
    <span className="text-sm">You're speaking...</span>
  </div>
)}
```

## Error Handling

### Permission Denied

```typescript
try {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
} catch (error) {
  if (error.name === "NotAllowedError") {
    alert("Camera and microphone access is required for the interview.");
  } else {
    alert("Failed to access media devices. Please check your settings.");
  }
}
```

### WebSocket Connection Failed

```typescript
webSocketRef.current.onerror = (error) => {
  console.error("WebSocket error:", error);
  setIsConnected(false);
  setError("Lost connection to interview server. Please refresh and try again.");
};
```

### Interview Already Completed

```typescript
if (data.status === "completed") {
  setError("This interview has already been completed.");
  return;
}
```

## Performance Considerations

### Memory Management

```typescript
// Clean up on unmount or interview end
const cleanup = () => {
  // Stop media recorder
  if (mediaRecorderRef.current?.state !== "inactive") {
    mediaRecorderRef.current.stop();
  }

  // Close WebSocket
  if (webSocketRef.current) {
    webSocketRef.current.close();
  }

  // Stop media tracks
  if (videoRef.current?.srcObject) {
    const stream = videoRef.current.srcObject as MediaStream;
    stream.getTracks().forEach(track => track.stop());
  }

  // Close audio context
  if (audioContextRef.current) {
    audioContextRef.current.close();
  }

  // Clear timer
  if (timerRef.current) {
    clearInterval(timerRef.current);
  }
};

useEffect(() => {
  return cleanup;
}, []);
```

### Efficient Re-renders

- Use `useRef` for values that don't need to trigger re-renders (WebSocket, MediaRecorder, timers)
- Use `useState` only for values that affect the UI
- Memoize callbacks with `useCallback` if passed to child components

### Network Optimization

- 1-second chunks balance latency vs. overhead
- WebSocket provides lower latency than HTTP polling
- Binary data transfer for video/audio (not base64)

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Backend WebSocket server running
- [ ] Gemini Live API key set
- [ ] Firestore security rules updated
- [ ] Storage bucket permissions set
- [ ] HTTPS/WSS enabled (required for getUserMedia)
- [ ] CORS configured for WebSocket
- [ ] Load testing completed
- [ ] Error monitoring setup
- [ ] Logging configured

---

## Monitoring & Analytics

### Key Metrics

1. **Interview Completion Rate**
   - % of started interviews that complete
   - Track drop-off points

2. **Average Interview Duration**
   - Monitor if interviews are too long/short
   - Adjust question count accordingly

3. **Connection Issues**
   - WebSocket disconnect rate
   - MediaRecorder failures
   - Permission denial rate

4. **Quality Metrics**
   - Audio/video quality scores
   - Transcript accuracy
   - AI response latency

### Logging Points

```typescript
// Log interview start
console.log("Interview started", { interviewId, candidateId, timestamp });

// Log each question
console.log("Question asked", { questionNumber, timestamp });

// Log warnings
console.log("Warning shown", { warningType, timeElapsed });

// Log interview end
console.log("Interview ended", { reason, duration, questionsAsked });
```
