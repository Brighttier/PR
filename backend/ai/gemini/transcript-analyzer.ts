/**
 * Interview Transcript Analyzer using Google Gemini
 *
 * Analyzes interview transcripts to extract insights, sentiment,
 * key topics, red flags, strengths, and confidence scores.
 */

import { getModelForUseCase, generateJSON, generateContent, trackUsage } from "./client";

// Transcript entry
export interface TranscriptEntry {
  timestamp: number; // seconds from start
  speaker: "ai" | "candidate";
  text: string;
  confidence?: number; // 0-1 (from speech-to-text)
}

// Sentiment data point
export interface SentimentDataPoint {
  timestamp: number;
  sentiment: number; // -1 to 1 (negative to positive)
  emotion?: string; // "confident", "hesitant", "enthusiastic", etc.
}

// Key moment in interview
export interface KeyMoment {
  timestamp: number;
  type: "highlight" | "concern" | "question" | "strong_answer" | "weak_answer";
  label: string;
  description: string;
  relevantText: string;
}

// Speaking statistics
export interface SpeakingStats {
  aiSpeakingTime: number; // seconds
  candidateSpeakingTime: number; // seconds
  aiSpeakingPercentage: number; // 0-100
  candidateSpeakingPercentage: number; // 0-100
  totalSpeakingTime: number;
  averageResponseLength: number; // seconds
  longestResponse: number;
  shortestResponse: number;
}

// Hesitation analysis
export interface HesitationAnalysis {
  hesitationCount: number;
  hesitationTimestamps: number[];
  fillerWords: { [word: string]: number }; // "um", "uh", "like", etc.
  pauseCount: number; // Long pauses in speech
}

// Topic extraction
export interface TopicAnalysis {
  topics: string[]; // Main topics discussed
  topicFrequency: { [topic: string]: number };
  keywords: string[]; // Most frequently mentioned keywords
  technicalTerms: string[]; // Technical keywords mentioned
}

// Red flags detected
export interface RedFlag {
  type: string; // "contradiction", "unclear_answer", "lack_of_knowledge", etc.
  timestamp: number;
  description: string;
  severity: "low" | "medium" | "high";
  relatedText: string;
}

// Strengths identified
export interface Strength {
  type: string; // "technical_knowledge", "communication", "problem_solving", etc.
  timestamp: number;
  description: string;
  relatedText: string;
}

// Complete transcript analysis
export interface TranscriptAnalysis {
  // Overall metrics
  overallSentiment: number; // -1 to 1
  averageConfidence: number; // 0-1

  // Sentiment timeline
  sentimentTimeline: SentimentDataPoint[];

  // Speaking analysis
  speakingStats: SpeakingStats;
  hesitationAnalysis: HesitationAnalysis;

  // Content analysis
  topicAnalysis: TopicAnalysis;
  keyMoments: KeyMoment[];

  // Evaluation
  redFlags: RedFlag[];
  strengths: Strength[];

  // Summary
  executiveSummary: string;
  candidateSummary: string;
}

/**
 * Analyze complete interview transcript
 */
export async function analyzeTranscript(
  transcript: TranscriptEntry[]
): Promise<TranscriptAnalysis> {
  console.log(`Analyzing transcript with ${transcript.length} entries`);

  try {
    // Get the model for transcript analysis
    const model = getModelForUseCase("transcriptAnalysis");

    // Build comprehensive analysis prompt
    const transcriptText = formatTranscript(transcript);
    const prompt = buildAnalysisPrompt(transcriptText);

    // Generate analysis
    const analysis = await generateJSON<TranscriptAnalysis>(model, prompt);

    // Calculate speaking stats
    const speakingStats = calculateSpeakingStats(transcript);
    analysis.speakingStats = speakingStats;

    // Validate and enrich analysis
    const enrichedAnalysis = validateAndEnrichAnalysis(analysis, transcript);

    console.log("Transcript analysis completed successfully");
    return enrichedAnalysis;
  } catch (error) {
    console.error("Error analyzing transcript:", error);
    trackUsage(0, true);
    throw new Error(`Failed to analyze transcript: ${error}`);
  }
}

/**
 * Extract key moments from transcript
 */
export async function extractKeyMoments(
  transcript: TranscriptEntry[]
): Promise<KeyMoment[]> {
  console.log("Extracting key moments from transcript");

  try {
    const model = getModelForUseCase("transcriptAnalysis");
    const transcriptText = formatTranscript(transcript);

    const prompt = `Analyze this interview transcript and identify KEY MOMENTS.

Key moment types:
- **highlight**: Exceptional answer or demonstration of skill
- **concern**: Unclear, weak, or problematic response
- **question**: Important question that reveals key information
- **strong_answer**: Well-articulated, confident response
- **weak_answer**: Hesitant, vague, or incomplete response

For each key moment, provide:
- timestamp (in seconds)
- type
- label (short title)
- description (why this moment is significant)
- relevantText (the actual text from transcript)

Return as JSON array of key moments.

TRANSCRIPT:
${transcriptText}`;

    const keyMoments = await generateJSON<KeyMoment[]>(model, prompt);
    console.log(`Extracted ${keyMoments.length} key moments`);
    return keyMoments;
  } catch (error) {
    console.error("Error extracting key moments:", error);
    return [];
  }
}

/**
 * Analyze sentiment over time
 */
export async function analyzeSentiment(
  transcript: TranscriptEntry[]
): Promise<SentimentDataPoint[]> {
  console.log("Analyzing sentiment over time");

  try {
    const model = getModelForUseCase("transcriptAnalysis");
    const transcriptText = formatTranscript(transcript);

    const prompt = `Analyze the sentiment of the candidate's responses throughout this interview.

For each candidate response, provide:
- timestamp (in seconds)
- sentiment score (-1 to 1, where -1 = very negative, 0 = neutral, 1 = very positive)
- emotion (optional: "confident", "hesitant", "enthusiastic", "nervous", "calm", etc.)

Consider:
- Tone and word choice
- Confidence level
- Enthusiasm and engagement
- Stress or nervousness indicators

Return as JSON array of sentiment data points.

TRANSCRIPT:
${transcriptText}`;

    const sentimentData = await generateJSON<SentimentDataPoint[]>(model, prompt);
    console.log(`Analyzed sentiment for ${sentimentData.length} data points`);
    return sentimentData;
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return [];
  }
}

/**
 * Detect hesitations and filler words
 */
export function detectHesitations(transcript: TranscriptEntry[]): HesitationAnalysis {
  const fillerWords = ["um", "uh", "like", "you know", "sort of", "kind of", "i mean"];
  const hesitationTimestamps: number[] = [];
  const fillerCounts: { [word: string]: number } = {};
  let pauseCount = 0;

  // Initialize filler word counts
  fillerWords.forEach((word) => (fillerCounts[word] = 0));

  transcript.forEach((entry) => {
    if (entry.speaker === "candidate") {
      const text = entry.text.toLowerCase();

      // Check for filler words
      fillerWords.forEach((filler) => {
        const regex = new RegExp(`\\b${filler}\\b`, "gi");
        const matches = text.match(regex);
        if (matches) {
          fillerCounts[filler] += matches.length;
          hesitationTimestamps.push(entry.timestamp);
        }
      });

      // Check for long pauses (indicated by "..." in transcript)
      if (text.includes("...")) {
        pauseCount++;
      }
    }
  });

  return {
    hesitationCount: hesitationTimestamps.length,
    hesitationTimestamps,
    fillerWords: fillerCounts,
    pauseCount,
  };
}

/**
 * Extract topics and keywords
 */
export async function extractTopics(transcript: TranscriptEntry[]): Promise<TopicAnalysis> {
  console.log("Extracting topics and keywords");

  try {
    const model = getModelForUseCase("transcriptAnalysis");
    const candidateResponses = transcript
      .filter((entry) => entry.speaker === "candidate")
      .map((entry) => entry.text)
      .join("\n\n");

    const prompt = `Analyze this candidate's interview responses and extract:

1. Main topics discussed (top 5-10 topics)
2. Topic frequency (how many times each topic was mentioned)
3. Keywords (most frequently mentioned words, excluding common words)
4. Technical terms (technical/professional keywords mentioned)

Return as JSON with this structure:
{
  "topics": ["topic1", "topic2", ...],
  "topicFrequency": {"topic1": 5, "topic2": 3, ...},
  "keywords": ["keyword1", "keyword2", ...],
  "technicalTerms": ["React", "TypeScript", ...]
}

CANDIDATE RESPONSES:
${candidateResponses}`;

    const topicAnalysis = await generateJSON<TopicAnalysis>(model, prompt);
    console.log(`Extracted ${topicAnalysis.topics.length} topics`);
    return topicAnalysis;
  } catch (error) {
    console.error("Error extracting topics:", error);
    return {
      topics: [],
      topicFrequency: {},
      keywords: [],
      technicalTerms: [],
    };
  }
}

/**
 * Identify red flags
 */
export async function identifyRedFlags(transcript: TranscriptEntry[]): Promise<RedFlag[]> {
  console.log("Identifying red flags");

  try {
    const model = getModelForUseCase("transcriptAnalysis");
    const transcriptText = formatTranscript(transcript);

    const prompt = `Analyze this interview transcript for potential RED FLAGS or concerning patterns.

Red flag types to look for:
- **contradiction**: Contradictory statements
- **unclear_answer**: Vague, evasive, or unclear responses
- **lack_of_knowledge**: Gaps in expected knowledge
- **negative_attitude**: Negative comments about previous employers/colleagues
- **overconfidence**: Unrealistic claims or arrogance
- **poor_communication**: Difficulty articulating thoughts
- **lack_of_preparation**: Unfamiliarity with company/role
- **cultural_concerns**: Potential cultural fit issues

For each red flag, provide:
- type
- timestamp (in seconds)
- description (what the concern is)
- severity ("low", "medium", "high")
- relatedText (relevant quote from transcript)

Return as JSON array. If no red flags, return empty array.

TRANSCRIPT:
${transcriptText}`;

    const redFlags = await generateJSON<RedFlag[]>(model, prompt);
    console.log(`Identified ${redFlags.length} red flags`);
    return redFlags;
  } catch (error) {
    console.error("Error identifying red flags:", error);
    return [];
  }
}

/**
 * Identify strengths
 */
export async function identifyStrengths(transcript: TranscriptEntry[]): Promise<Strength[]> {
  console.log("Identifying candidate strengths");

  try {
    const model = getModelForUseCase("transcriptAnalysis");
    const transcriptText = formatTranscript(transcript);

    const prompt = `Analyze this interview transcript to identify the candidate's STRENGTHS.

Strength types to look for:
- **technical_knowledge**: Strong technical expertise
- **communication**: Clear, articulate communication
- **problem_solving**: Analytical thinking and problem-solving
- **leadership**: Leadership experience or potential
- **collaboration**: Teamwork and collaboration skills
- **adaptability**: Flexibility and learning agility
- **passion**: Enthusiasm for the role/industry
- **experience**: Relevant experience and achievements

For each strength, provide:
- type
- timestamp (in seconds where demonstrated)
- description (what the strength is)
- relatedText (relevant quote from transcript)

Return as JSON array.

TRANSCRIPT:
${transcriptText}`;

    const strengths = await generateJSON<Strength[]>(model, prompt);
    console.log(`Identified ${strengths.length} strengths`);
    return strengths;
  } catch (error) {
    console.error("Error identifying strengths:", error);
    return [];
  }
}

/**
 * Calculate confidence score over time
 */
export function calculateConfidenceScore(transcript: TranscriptEntry[]): number[] {
  // Calculate confidence based on STT confidence scores
  const candidateEntries = transcript.filter((entry) => entry.speaker === "candidate");

  return candidateEntries.map((entry) => entry.confidence || 0.9);
}

/**
 * Generate executive summary
 */
export async function generateExecutiveSummary(
  transcript: TranscriptEntry[]
): Promise<string> {
  console.log("Generating executive summary");

  try {
    const model = getModelForUseCase("transcriptAnalysis");
    const transcriptText = formatTranscript(transcript);

    const prompt = `Provide a concise EXECUTIVE SUMMARY (2-3 sentences) of this interview.

Focus on:
- Overall candidate performance
- Key strengths demonstrated
- Main concerns (if any)
- Recommendation context

TRANSCRIPT:
${transcriptText}`;

    const summary = await generateContent(model, prompt);
    return summary.trim();
  } catch (error) {
    console.error("Error generating executive summary:", error);
    return "Unable to generate summary.";
  }
}

/**
 * Format transcript for analysis
 */
function formatTranscript(transcript: TranscriptEntry[]): string {
  return transcript
    .map((entry) => {
      const time = formatTime(entry.timestamp);
      const speaker = entry.speaker === "ai" ? "INTERVIEWER" : "CANDIDATE";
      return `[${time}] ${speaker}: ${entry.text}`;
    })
    .join("\n\n");
}

/**
 * Format timestamp
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Build comprehensive analysis prompt
 */
function buildAnalysisPrompt(transcriptText: string): string {
  return `Analyze this interview transcript comprehensively.

Provide:

1. **overallSentiment**: Overall sentiment score (-1 to 1)
2. **averageConfidence**: Average confidence level (0-1)
3. **sentimentTimeline**: Array of sentiment data points over time
4. **hesitationAnalysis**: Analysis of hesitations and filler words
5. **topicAnalysis**: Topics, keywords, and technical terms discussed
6. **keyMoments**: Important moments in the interview
7. **redFlags**: Any concerning patterns or answers
8. **strengths**: Demonstrated strengths
9. **executiveSummary**: 2-3 sentence overview
10. **candidateSummary**: Detailed summary of candidate performance (2-3 paragraphs)

Return as structured JSON.

TRANSCRIPT:
${transcriptText}`;
}

/**
 * Calculate speaking statistics
 */
function calculateSpeakingStats(transcript: TranscriptEntry[]): SpeakingStats {
  let aiTime = 0;
  let candidateTime = 0;
  const candidateResponses: number[] = [];

  for (let i = 0; i < transcript.length; i++) {
    const entry = transcript[i];
    const nextEntry = transcript[i + 1];

    // Estimate speaking time based on next timestamp
    const duration = nextEntry ? nextEntry.timestamp - entry.timestamp : 0;

    if (entry.speaker === "ai") {
      aiTime += duration;
    } else {
      candidateTime += duration;
      candidateResponses.push(duration);
    }
  }

  const totalTime = aiTime + candidateTime;

  return {
    aiSpeakingTime: aiTime,
    candidateSpeakingTime: candidateTime,
    aiSpeakingPercentage: totalTime > 0 ? (aiTime / totalTime) * 100 : 0,
    candidateSpeakingPercentage: totalTime > 0 ? (candidateTime / totalTime) * 100 : 0,
    totalSpeakingTime: totalTime,
    averageResponseLength:
      candidateResponses.length > 0
        ? candidateResponses.reduce((a, b) => a + b, 0) / candidateResponses.length
        : 0,
    longestResponse: candidateResponses.length > 0 ? Math.max(...candidateResponses) : 0,
    shortestResponse: candidateResponses.length > 0 ? Math.min(...candidateResponses) : 0,
  };
}

/**
 * Validate and enrich analysis
 */
function validateAndEnrichAnalysis(
  analysis: TranscriptAnalysis,
  transcript: TranscriptEntry[]
): TranscriptAnalysis {
  // Ensure all required fields exist
  if (!analysis.overallSentiment) {
    analysis.overallSentiment = 0;
  }

  if (!analysis.averageConfidence) {
    const confidences = transcript
      .filter((e) => e.speaker === "candidate")
      .map((e) => e.confidence || 0.9);
    analysis.averageConfidence =
      confidences.length > 0 ? confidences.reduce((a, b) => a + b, 0) / confidences.length : 0.9;
  }

  if (!analysis.sentimentTimeline) {
    analysis.sentimentTimeline = [];
  }

  if (!analysis.keyMoments) {
    analysis.keyMoments = [];
  }

  if (!analysis.redFlags) {
    analysis.redFlags = [];
  }

  if (!analysis.strengths) {
    analysis.strengths = [];
  }

  if (!analysis.topicAnalysis) {
    analysis.topicAnalysis = {
      topics: [],
      topicFrequency: {},
      keywords: [],
      technicalTerms: [],
    };
  }

  if (!analysis.hesitationAnalysis) {
    analysis.hesitationAnalysis = detectHesitations(transcript);
  }

  return analysis;
}
