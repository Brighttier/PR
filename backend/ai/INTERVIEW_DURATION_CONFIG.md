# Interview Duration Configuration

## Overview

The AI interview system supports **fully configurable interview durations** with a **30-minute maximum limit**.

## Key Features

### 1. Configurable Duration (Per Interview)
- **Range**: 5 minutes (300 seconds) to 30 minutes (1800 seconds)
- **Default**: 30 minutes (configurable in company settings)
- **Set When**: Interview is scheduled
- **Examples**:
  - Quick screening: 10 minutes (600 seconds)
  - Standard interview: 20 minutes (1200 seconds)
  - Full interview: 30 minutes (1800 seconds)

### 2. Dynamic Warning Thresholds

Warnings are **percentage-based** and automatically adjust to the scheduled duration:

#### Default Percentages:
- **First Warning**: 66% of scheduled duration
- **Final Warning**: 83% of scheduled duration

#### Examples:

**30-minute interview (1800 seconds):**
- First warning: 20 minutes (1200 sec) - "10 minutes remaining"
- Final warning: 25 minutes (1500 sec) - "5 minutes remaining"

**15-minute interview (900 seconds):**
- First warning: 10 minutes (594 sec) - "5 minutes remaining"
- Final warning: 12.5 minutes (747 sec) - "2.5 minutes remaining"

**10-minute interview (600 seconds):**
- First warning: 6.6 minutes (396 sec) - "3.4 minutes remaining"
- Final warning: 8.3 minutes (498 sec) - "1.7 minutes remaining"

## Configuration

### Company-Level Configuration

```typescript
InterviewAgentConfig {
  // Global limits
  defaultDuration: 1800,    // Default: 30 minutes
  maxDuration: 1800,        // Hard limit: 30 minutes
  minDuration: 300,         // Minimum: 5 minutes

  // Warning thresholds (percentage-based)
  warningThresholds: {
    firstWarningPercent: 66,  // First warning at 66%
    finalWarningPercent: 83,  // Final warning at 83%
  }
}
```

### Interview-Level Configuration

When scheduling an interview:

```typescript
// Create interview with custom duration (15 minutes)
const session = await createInterviewSession(
  sessionId,
  config,
  jobTitle,
  jobDescription,
  900  // 15 minutes in seconds
);
```

## Implementation

### 1. Scheduling Flow

```
User Schedules Interview
  ↓
Select Duration (5-30 min)
  ↓
System validates:
  - Must be >= minDuration (300s)
  - Must be <= maxDuration (1800s)
  ↓
Calculate Warning Times:
  - firstWarning = duration * 66%
  - finalWarning = duration * 83%
  ↓
Store in Interview Document
```

### 2. Runtime Flow

```
Interview Starts
  ↓
Timer begins (updates every 30s)
  ↓
Check elapsed time:
  - If >= firstWarning → Send first warning
  - If >= finalWarning → Send final warning
  - If >= scheduledDuration → Force end
  ↓
Interview Complete
```

### 3. Warning Messages

**First Warning (66%):**
```
"Just a reminder, we have about {X} minute(s) remaining in this interview.
Let's continue with the next few questions."
```

**Final Warning (83%):**
```
"We're approaching the end of our time together.
I have just a couple more questions, and then we'll wrap up."
```

**Time Expired (100%):**
```
"I notice we're at the {duration}-minute mark for this interview.
Thank you so much for your thoughtful responses today.
Our team will review everything we discussed and reach out to you soon with next steps."
```

## Database Schema

### Interview Document

```typescript
{
  interviewId: "INT-2025-0001",
  scheduledDuration: 900,  // 15 minutes (set when scheduling)
  maxDuration: 1800,       // Hard limit (30 minutes)
  startedAt: Timestamp,
  elapsedTime: 0,
  status: "in_progress",
  config: {
    warningThresholds: {
      firstWarningPercent: 66,
      finalWarningPercent: 83
    }
  }
}
```

## Usage Examples

### Example 1: Quick Screening (10 minutes)

```typescript
// Schedule 10-minute screening
await createInterviewSession(
  sessionId,
  config,
  "Junior Developer",
  jobDescription,
  600  // 10 minutes
);

// Warnings:
// - 6.6 min: "3.4 minutes remaining"
// - 8.3 min: "approaching the end"
// - 10 min: Force end
```

### Example 2: Standard Interview (20 minutes)

```typescript
// Schedule 20-minute interview
await createInterviewSession(
  sessionId,
  config,
  "Senior Engineer",
  jobDescription,
  1200  // 20 minutes
);

// Warnings:
// - 13.2 min: "6.8 minutes remaining"
// - 16.6 min: "approaching the end"
// - 20 min: Force end
```

### Example 3: Full Interview (30 minutes - default)

```typescript
// Schedule 30-minute interview (uses default)
await createInterviewSession(
  sessionId,
  config,
  "Tech Lead",
  jobDescription
  // No duration specified = uses config.defaultDuration (1800s)
);

// Warnings:
// - 20 min: "10 minutes remaining"
// - 25 min: "approaching the end"
// - 30 min: Force end
```

## Validation

### Duration Validation

```typescript
function validateDuration(duration: number, config: InterviewAgentConfig): number {
  // Too short
  if (duration < config.minDuration) {
    console.warn(`Duration ${duration}s below minimum, using ${config.minDuration}s`);
    return config.minDuration;
  }

  // Too long
  if (duration > config.maxDuration) {
    console.warn(`Duration ${duration}s exceeds maximum, using ${config.maxDuration}s`);
    return config.maxDuration;
  }

  return duration;
}
```

### Warning Calculation

```typescript
function calculateWarningTimes(
  scheduledDuration: number,
  config: InterviewAgentConfig
): {
  firstWarning: number;
  finalWarning: number;
} {
  return {
    firstWarning: Math.floor(
      (scheduledDuration * config.warningThresholds.firstWarningPercent) / 100
    ),
    finalWarning: Math.floor(
      (scheduledDuration * config.warningThresholds.finalWarningPercent) / 100
    ),
  };
}
```

## Benefits

1. **Flexibility**: Companies can schedule interviews of any length (5-30 min)
2. **Consistency**: Warning thresholds automatically adapt to duration
3. **Efficiency**: Short screenings (10 min) vs full interviews (30 min)
4. **User Experience**: Clear, contextual warnings based on actual time remaining
5. **Scalability**: Easy to adjust company defaults without code changes

## Notes

- **Hard Limit**: 30 minutes is absolute maximum (enforced at system level)
- **Minimum**: 5 minutes minimum to ensure quality interviews
- **Percentage-based**: Warnings scale proportionally with duration
- **Dynamic Messages**: Remaining time calculated in real-time
- **Graceful Handling**: System prevents invalid durations automatically
