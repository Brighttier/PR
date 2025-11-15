# Candidate Interview Session - Implementation Documentation

## Overview

This directory contains the implementation of the AI-powered live interview session for candidates, based on the Plan.md specifications (lines 512-1128).

## File Structure

```
/frontend/app/candidate/interview/
├── [id]/
│   ├── page.tsx                    # Main interview session page (loader & router)
│   └── complete/
│       └── page.tsx                # Interview completion/success page
└── README.md                       # This file

/frontend/components/interview/
└── live-interview-session.tsx      # Main interview UI component
```

## Features Implemented

### 1. Pre-Interview Screen (`stage: "pre-start"`)

**System Checks:**
- ✅ Camera permission check
- ✅ Microphone permission check
- ✅ Internet connection speed test
- ✅ Real-time status badges (Granted/Denied/Checking)

**Required Consents:**
- ✅ Recording consent checkbox
- ✅ Terms & Privacy Policy acceptance
- ✅ Links to privacy policy and terms of service

**UI Elements:**
- Company logo display (if available)
- Job title and company name
- Interview duration information (20-25 min, max 30)
- Interview type badge
- "Start Interview" button (disabled until all checks pass)

### 2. Active Interview Screen (`stage: "active"`)

**Top Bar:**
- ✅ Company logo and name
- ✅ Job title badge
- ✅ Progress indicator (questions answered / total)
- ✅ Countdown timer with color coding:
  - Green: 0-20 minutes
  - Yellow: 20-25 minutes (with warning)
  - Red: 25-30 minutes (with final warning)
- ✅ Connection status badge

**Main Video Panel:**
- ✅ Video preview (candidate's camera)
- ✅ Recording indicator (red dot with "REC" badge)
- ✅ Current question display with question number
- ✅ Audio visualizer (shows when candidate is speaking)

**Right Sidebar:**
- ✅ Live transcript with timestamps
- ✅ Speaker identification (AI Interviewer vs. You)
- ✅ Color-coded messages (AI in primary color, candidate in muted)
- ✅ Questions timeline showing progress through all questions
- ✅ Auto-scroll to latest transcript entry

**Bottom Controls:**
- ✅ "End Interview" button with confirmation dialog

**Time Management:**
- ✅ Warning at 20 minutes: "⚠️ 10 minutes remaining"
- ✅ Final warning at 25 minutes: "⚠️ 5 minutes remaining - Final questions"
- ✅ Hard stop at 30 minutes (automatic interview end)
- ✅ Warning banners displayed at top of screen

### 3. Completion Page (`/complete`)

**Features:**
- ✅ Success animation (animated checkmark)
- ✅ Interview summary card with:
  - Total duration
  - Questions answered
  - Completion rate (100%)
- ✅ Interview ID display
- ✅ "What happens next?" section with timeline
- ✅ Action buttons:
  - View Dashboard
  - My Applications
- ✅ Support contact link

## Technical Implementation

### WebSocket Integration

The component establishes a WebSocket connection to the backend for real-time communication:

```typescript
const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const wsUrl = `${wsProtocol}//${window.location.host}/api/interview/live/${interviewId}`;
webSocketRef.current = new WebSocket(wsUrl);
```

**Message Types:**
- `question`: AI asks a new question
- `audio`: AI audio response (base64 encoded)
- `transcript`: Candidate response transcribed
- `sign_off`: AI is ending the interview

### MediaRecorder API

Video and audio are recorded using the MediaRecorder API:

```typescript
mediaRecorderRef.current = new MediaRecorder(stream, {
  mimeType: "video/webm;codecs=vp9,opus",
});
mediaRecorderRef.current.start(1000); // Send chunks every second
```

Chunks are streamed to the backend via WebSocket for real-time processing.

### Audio Visualization

Audio levels are monitored using the Web Audio API:

```typescript
audioContextRef.current = new AudioContext();
analyserRef.current = audioContextRef.current.createAnalyser();
const source = audioContextRef.current.createMediaStreamSource(stream);
source.connect(analyserRef.current);
```

This detects when the candidate is speaking and displays a visual indicator.

### Timer Management

A precise interval timer tracks elapsed time:

```typescript
timerRef.current = setInterval(() => {
  setTimeElapsed((prev) => {
    const newTime = prev + 1;
    // Check for warning thresholds...
    return newTime;
  });
}, 1000);
```

### State Management

The component uses React state for:
- `stage`: Pre-start → Active → Completed
- `timeElapsed`: Seconds elapsed since start
- `transcript`: Array of transcript entries
- `questionsAnswered`: Current progress
- `isConnected`: WebSocket connection status
- `isSpeaking`: Audio activity detection

## Backend API Endpoints

The following backend endpoints need to be implemented:

### WebSocket Endpoint
- **URL:** `wss://domain.com/api/interview/live/{interviewId}`
- **Protocol:** WebSocket
- **Purpose:** Real-time bidirectional communication

**Client → Server Messages:**
- Video/audio chunks (binary)
- Control messages (JSON)

**Server → Client Messages:**
```typescript
{
  type: "question",
  text: "Can you tell me about your experience with React?",
  questionNumber: 3,
  timestamp: 180 // seconds elapsed
}

{
  type: "audio",
  audioData: "base64-encoded-wav-data"
}

{
  type: "transcript",
  text: "I have 5 years of experience with React...",
  timestamp: 185
}

{
  type: "sign_off",
  message: "Thank you for your time..."
}
```

### HTTP Endpoints (Optional)

These may be used instead of or in addition to WebSocket:

- **POST** `/api/interview/start`
  - Body: `{ interviewId: string }`
  - Response: `{ sessionId: string, success: boolean }`

- **POST** `/api/interview/end`
  - Body: `{ interviewId: string, signOffType: string }`
  - Response: `{ success: boolean }`

## Firestore Data Structure

### `interviews/{interviewId}`

```typescript
{
  id: string;
  jobTitle: string;
  jobId: string;
  companyName: string;
  companyId: string;
  companyLogoUrl?: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  type: "AI Screening" | "AI Technical" | "Face-to-Face";
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  scheduledDuration: number; // seconds (default: 1800)

  // Set during interview
  currentStage?: InterviewStage;
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  duration?: number; // actual duration in seconds
  questionsAsked?: number;
  endReason?: "natural_completion" | "time_limit" | "user_ended";

  // Recording
  recordingUrl?: string;
  transcriptUrl?: string;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### `interviews/{interviewId}/transcript` (Sub-collection)

```typescript
{
  id: string;
  timestamp: number; // seconds elapsed
  speaker: "ai" | "candidate";
  text: string;
  createdAt: Timestamp;
}
```

### `interviews/{interviewId}/events` (Sub-collection)

```typescript
{
  stage: InterviewStage;
  timestamp: number; // seconds elapsed
  content?: string;
  questionNumber?: number;
  createdAt: Timestamp;
}
```

## Interview Stages

```typescript
enum InterviewStage {
  PRE_START = "pre_start",           // System check
  GREETING = "greeting",              // AI greeting
  QUESTIONS = "questions",            // Main interview
  WARNING_20_MIN = "warning_20",      // 20-minute warning
  WARNING_25_MIN = "warning_25",      // 25-minute warning
  WRAPPING_UP = "wrapping_up",        // Final question
  SIGN_OFF = "sign_off",              // Thank you message
  COMPLETED = "completed"             // Interview ended
}
```

## Environment Variables

None required for frontend. Backend will need:

```env
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash-exp
```

## Browser Compatibility

**Required APIs:**
- MediaDevices.getUserMedia() - Chrome 53+, Firefox 36+, Safari 11+
- MediaRecorder API - Chrome 47+, Firefox 25+, Safari 14.1+
- WebSocket API - All modern browsers
- Web Audio API - All modern browsers

**Recommended:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Testing Checklist

### Pre-Start Screen
- [ ] Camera permission check works
- [ ] Microphone permission check works
- [ ] Internet speed test completes
- [ ] All checkboxes must be checked to enable "Start Interview"
- [ ] Clicking "Start Interview" initializes media and WebSocket

### Active Interview
- [ ] Video preview shows candidate's camera
- [ ] Recording indicator appears
- [ ] Timer starts counting down from 30:00
- [ ] Timer turns yellow at 20:00
- [ ] Timer turns red at 25:00
- [ ] Warning banner shows at 20:00
- [ ] Warning banner shows at 25:00
- [ ] Interview auto-ends at 30:00
- [ ] Transcript updates in real-time
- [ ] Questions timeline shows progress
- [ ] Audio visualizer activates when speaking
- [ ] "End Interview" requires confirmation

### Completion Page
- [ ] Success animation plays
- [ ] Interview summary displays correct data
- [ ] Interview ID is shown
- [ ] "View Dashboard" button navigates correctly
- [ ] "My Applications" button navigates correctly

## Known Limitations

1. **WebSocket URL**: Currently hardcoded to use same host. May need configuration for different environments.
2. **Audio Playback**: AI audio responses use simple Audio() constructor. May need more robust audio player.
3. **Recording Upload**: Currently streams to WebSocket. Large interviews may benefit from chunked upload to storage.
4. **Network Resilience**: WebSocket disconnect handling could be improved with reconnection logic.
5. **Mobile Support**: Video constraints may need adjustment for mobile devices.

## Future Enhancements

1. **Adaptive Bitrate**: Adjust video quality based on connection speed
2. **Offline Support**: Cache questions for offline completion
3. **Multi-language**: Support for interviews in multiple languages
4. **Screen Sharing**: Option to share screen for technical questions
5. **Practice Mode**: Allow candidates to practice before real interview
6. **AI Coach**: Real-time feedback on speech pace, filler words, etc.

## Related Files

- `/backend/ai/gemini/live-interview.ts` - Backend AI interview service (Plan.md lines 566-798)
- `/backend/api/interview/` - Interview API endpoints
- `/shared/types/interview.ts` - Shared TypeScript types

## References

- Plan.md (lines 512-1128) - Original specifications
- CLAUDE.md - Project architecture documentation
- Gemini Live API documentation
- MediaRecorder API documentation
- WebSocket API documentation
