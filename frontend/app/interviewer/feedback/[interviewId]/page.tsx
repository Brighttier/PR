"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, addDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Save,
  Send,
  ArrowLeft,
  Video,
  FileText,
  BarChart3,
  CheckCircle2,
  Clock,
  User,
  Briefcase,
  Calendar,
  Loader2,
} from "lucide-react";

// Import our interview components
import { VideoPlayer } from "@/components/interview/video-player";
import { TranscriptViewer } from "@/components/interview/transcript-viewer";
import { VideoTimeline } from "@/components/interview/video-timeline";
import { SentimentGraph } from "@/components/interview/sentiment-graph";
import { SpeakingTimeChart } from "@/components/interview/speaking-time-chart";
import { ConfidenceGraph } from "@/components/interview/confidence-graph";
import { SkillsRadar } from "@/components/interview/skills-radar";
import { WordCloud } from "@/components/interview/word-cloud";
import { RatingInput, RatingQuestions } from "@/components/interview/rating-input";
import { SkillsMatrix } from "@/components/interview/skills-matrix";
import { KeyMomentMarker, type KeyMoment } from "@/components/interview/key-moment-marker";
import { RichTextEditor, FeedbackTemplateSelector } from "@/components/interview/rich-text-editor";

import type { TranscriptEntry, TranscriptAnalysis } from "@/backend/ai/gemini/transcript-analyzer";
import type { InterviewScore, SkillScore } from "@/backend/ai/gemini/interview-scorer";

interface Interview {
  id: string;
  applicationId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  type: "ai_screening" | "ai_technical" | "face_to_face" | "panel";
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  scheduledAt: Timestamp;
  duration: number;
  assignedInterviewers: string[];
  meetingLink?: string;
  location?: string;
  recordingUrl?: string;
  transcript?: TranscriptEntry[];
  transcriptAnalysis?: TranscriptAnalysis;
  aiScore?: InterviewScore;
}

interface FeedbackData {
  // Overall assessment
  overallRating: number;
  recommendation: "strong_hire" | "hire" | "consider" | "no_hire";

  // Technical skills
  technicalSkills: Array<{
    skill: string;
    rating: number;
    notes?: string;
    required?: boolean;
    targetLevel?: number;
  }>;

  // Soft skills ratings
  softSkills: {
    communication: number;
    cultureFit: number;
    enthusiasm: number;
    professionalism: number;
    adaptability: number;
  };

  // Key moments
  keyMoments: KeyMoment[];

  // Detailed feedback
  strengths: string;
  concerns: string;
  detailedNotes: string;

  // Metadata
  interviewerId: string;
  interviewerName: string;
  submittedAt?: Timestamp;
  isDraft: boolean;
}

export default function InterviewFeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  const interviewId = params.interviewId as string;
  const videoRef = useRef<HTMLVideoElement>(null);

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setIsSaving] = useState(false);
  const [submitting, setIsSubmitting] = useState(false);
  const [interview, setInterview] = useState<Interview | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedTab, setSelectedTab] = useState("overview");

  // Feedback state
  const [feedback, setFeedback] = useState<FeedbackData>({
    overallRating: 0,
    recommendation: "consider",
    technicalSkills: [],
    softSkills: {
      communication: 0,
      cultureFit: 0,
      enthusiasm: 0,
      professionalism: 0,
      adaptability: 0,
    },
    keyMoments: [],
    strengths: "",
    concerns: "",
    detailedNotes: "",
    interviewerId: user?.uid || "",
    interviewerName: userProfile?.displayName || "",
    isDraft: true,
  });

  // Load interview data
  useEffect(() => {
    const loadInterview = async () => {
      if (!interviewId) return;

      try {
        setLoading(true);
        const interviewDoc = await getDoc(doc(db, "interviews", interviewId));

        if (!interviewDoc.exists()) {
          toast({
            title: "Interview not found",
            description: "This interview does not exist.",
            variant: "destructive",
          });
          router.push("/interviewer/dashboard");
          return;
        }

        const interviewData = { id: interviewDoc.id, ...interviewDoc.data() } as Interview;

        // Verify interviewer is assigned
        if (!interviewData.assignedInterviewers.includes(user?.uid || "")) {
          toast({
            title: "Access denied",
            description: "You are not assigned to this interview.",
            variant: "destructive",
          });
          router.push("/interviewer/dashboard");
          return;
        }

        setInterview(interviewData);

        // Initialize technical skills from job requirements or AI analysis
        if (interviewData.aiScore?.technicalAssessment.skillScores) {
          setFeedback((prev) => ({
            ...prev,
            technicalSkills: interviewData.aiScore!.technicalAssessment.skillScores.map((skill) => ({
              skill: skill.skill,
              rating: 0,
              notes: "",
              required: true,
              targetLevel: 3.5,
            })),
          }));
        }

        // Load existing feedback if any
        const feedbackDoc = await getDoc(
          doc(db, `interviews/${interviewId}/feedback`, user?.uid || "")
        );

        if (feedbackDoc.exists()) {
          setFeedback({ ...feedbackDoc.data() as FeedbackData, isDraft: true });
        }

      } catch (error) {
        console.error("Error loading interview:", error);
        toast({
          title: "Error",
          description: "Failed to load interview data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadInterview();
  }, [interviewId, user, userProfile, router, toast]);

  // Save as draft
  const handleSaveDraft = async () => {
    if (!interview || !user) return;

    try {
      setIsSaving(true);

      const feedbackRef = doc(db, `interviews/${interviewId}/feedback`, user.uid);
      await updateDoc(feedbackRef, {
        ...feedback,
        isDraft: true,
        updatedAt: Timestamp.now(),
      }).catch(async () => {
        // If doesn't exist, create it
        await addDoc(collection(db, `interviews/${interviewId}/feedback`), {
          ...feedback,
          isDraft: true,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      });

      toast({
        title: "Draft saved",
        description: "Your feedback has been saved as a draft.",
      });
    } catch (error) {
      console.error("Error saving draft:", error);
      toast({
        title: "Error",
        description: "Failed to save draft.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Submit feedback
  const handleSubmit = async () => {
    if (!interview || !user) return;

    // Validation
    if (feedback.overallRating === 0) {
      toast({
        title: "Incomplete feedback",
        description: "Please provide an overall rating.",
        variant: "destructive",
      });
      return;
    }

    if (!feedback.strengths.trim() && !feedback.concerns.trim()) {
      toast({
        title: "Incomplete feedback",
        description: "Please provide either strengths or concerns.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const feedbackData: FeedbackData = {
        ...feedback,
        isDraft: false,
        submittedAt: Timestamp.now(),
      };

      // Save to Firestore
      const feedbackRef = doc(db, `interviews/${interviewId}/feedback`, user.uid);
      await updateDoc(feedbackRef, feedbackData).catch(async () => {
        await addDoc(collection(db, `interviews/${interviewId}/feedback`), feedbackData);
      });

      // Update interview status
      await updateDoc(doc(db, "interviews", interviewId), {
        status: "completed",
        completedAt: Timestamp.now(),
      });

      toast({
        title: "Feedback submitted",
        description: "Your feedback has been submitted successfully.",
      });

      // Redirect to dashboard
      router.push("/interviewer/dashboard");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle video time update
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  // Handle jump to timestamp
  const handleJumpToTimestamp = (timestamp: number) => {
    setCurrentTime(timestamp);
    setSelectedTab("video");
  };

  // Update technical skill
  const handleSkillUpdate = (index: number, field: "rating" | "notes", value: string | number) => {
    setFeedback((prev) => ({
      ...prev,
      technicalSkills: prev.technicalSkills.map((skill, i) =>
        i === index ? { ...skill, [field]: value } : skill
      ),
    }));
  };

  // Update soft skill ratings
  const handleSoftSkillUpdate = (skillId: string, value: number) => {
    setFeedback((prev) => ({
      ...prev,
      softSkills: {
        ...prev.softSkills,
        [skillId]: value,
      },
    }));
  };

  // Add key moment
  const handleAddMoment = (moment: Omit<KeyMoment, "id">) => {
    const newMoment: KeyMoment = {
      ...moment,
      id: `moment_${Date.now()}`,
      createdBy: user?.uid,
    };

    setFeedback((prev) => ({
      ...prev,
      keyMoments: [...prev.keyMoments, newMoment],
    }));
  };

  // Update key moment
  const handleUpdateMoment = (id: string, updates: Partial<KeyMoment>) => {
    setFeedback((prev) => ({
      ...prev,
      keyMoments: prev.keyMoments.map((moment) =>
        moment.id === id ? { ...moment, ...updates } : moment
      ),
    }));
  };

  // Delete key moment
  const handleDeleteMoment = (id: string) => {
    setFeedback((prev) => ({
      ...prev,
      keyMoments: prev.keyMoments.filter((moment) => moment.id !== id),
    }));
  };

  // Soft skills questions
  const softSkillQuestions = [
    {
      id: "communication",
      label: "Communication Skills",
      description: "Clarity, articulation, active listening",
      required: true,
    },
    {
      id: "cultureFit",
      label: "Culture Fit",
      description: "Alignment with company values and team dynamics",
      required: true,
    },
    {
      id: "enthusiasm",
      label: "Enthusiasm & Motivation",
      description: "Passion for the role and company",
      required: true,
    },
    {
      id: "professionalism",
      label: "Professionalism",
      description: "Appropriate demeanor, preparedness, respect",
      required: true,
    },
    {
      id: "adaptability",
      label: "Adaptability & Learning",
      description: "Flexibility, openness to feedback, growth mindset",
      required: true,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Interview not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Back button and title */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/interviewer/dashboard")}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>

              <div>
                <h1 className="text-2xl font-bold">Interview Feedback</h1>
                <p className="text-sm text-muted-foreground">
                  {interview.candidateName} - {interview.jobTitle}
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={saving}
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Draft"}
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={submitting}
              >
                <Send className="w-4 h-4 mr-2" />
                {submitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            </div>
          </div>

          {/* Interview metadata */}
          <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{interview.candidateName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              <span>{interview.jobTitle}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{interview.scheduledAt.toDate().toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{interview.duration} minutes</span>
            </div>
            <Badge variant="outline">
              {interview.type.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          {/* Tab navigation */}
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="video" className="gap-2">
              <Video className="w-4 h-4" />
              Video & Transcript
            </TabsTrigger>
            <TabsTrigger value="analysis" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              AI Analysis
            </TabsTrigger>
            <TabsTrigger value="feedback" className="gap-2">
              <FileText className="w-4 h-4" />
              Your Feedback
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Overall Rating */}
            <Card>
              <CardHeader>
                <CardTitle>Overall Assessment</CardTitle>
                <CardDescription>
                  Provide your overall rating and recommendation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <RatingInput
                  label="Overall Rating"
                  description="Rate the candidate's overall performance (1 = Poor, 5 = Excellent)"
                  value={feedback.overallRating}
                  onChange={(value) => setFeedback((prev) => ({ ...prev, overallRating: value }))}
                  required
                  size="lg"
                />

                <Separator />

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Recommendation <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { value: "strong_hire", label: "Strong Hire", color: "bg-green-100 border-green-300 text-green-700" },
                      { value: "hire", label: "Hire", color: "bg-green-50 border-green-200 text-green-600" },
                      { value: "consider", label: "Consider", color: "bg-yellow-50 border-yellow-200 text-yellow-700" },
                      { value: "no_hire", label: "Do Not Hire", color: "bg-red-50 border-red-200 text-red-700" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFeedback((prev) => ({ ...prev, recommendation: option.value as any }))}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          feedback.recommendation === option.value
                            ? option.color
                            : "bg-background border-border hover:bg-accent"
                        }`}
                      >
                        <p className="font-semibold text-sm">{option.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <RichTextEditor
                    value={feedback.strengths}
                    onChange={(value) => setFeedback((prev) => ({ ...prev, strengths: value }))}
                    placeholder="What did the candidate do exceptionally well?"
                    minHeight="150px"
                    maxHeight="300px"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Areas of Concern</CardTitle>
                </CardHeader>
                <CardContent>
                  <RichTextEditor
                    value={feedback.concerns}
                    onChange={(value) => setFeedback((prev) => ({ ...prev, concerns: value }))}
                    placeholder="What are the candidate's weaknesses or red flags?"
                    minHeight="150px"
                    maxHeight="300px"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Video & Transcript Tab */}
          <TabsContent value="video" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Video player (2/3 width) */}
              <div className="lg:col-span-2 space-y-4">
                {interview.recordingUrl ? (
                  <>
                    <VideoPlayer
                      videoUrl={interview.recordingUrl}
                      onTimeUpdate={handleTimeUpdate}
                      timestamps={feedback.keyMoments}
                    />

                    {interview.transcriptAnalysis?.keyMoments && (
                      <VideoTimeline
                        markers={interview.transcriptAnalysis.keyMoments}
                        duration={interview.duration * 60}
                        currentTime={currentTime}
                        onMarkerClick={handleJumpToTimestamp}
                      />
                    )}
                  </>
                ) : (
                  <Card>
                    <CardContent className="flex items-center justify-center h-96">
                      <div className="text-center text-muted-foreground">
                        <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Recording not available</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Transcript */}
                {interview.transcript && (
                  <TranscriptViewer
                    transcript={interview.transcript}
                    onTimestampClick={handleJumpToTimestamp}
                  />
                )}
              </div>

              {/* Key moments sidebar (1/3 width) */}
              <div>
                <KeyMomentMarker
                  moments={feedback.keyMoments}
                  currentTime={currentTime}
                  onAddMoment={handleAddMoment}
                  onUpdateMoment={handleUpdateMoment}
                  onDeleteMoment={handleDeleteMoment}
                  onJumpToMoment={handleJumpToTimestamp}
                />
              </div>
            </div>
          </TabsContent>

          {/* AI Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            {interview.transcriptAnalysis && interview.aiScore ? (
              <>
                {/* Analytics grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SentimentGraph data={interview.transcriptAnalysis.sentimentTimeline} />
                  <SpeakingTimeChart stats={interview.transcriptAnalysis.speakingStats} />
                  <ConfidenceGraph data={interview.transcriptAnalysis.sentimentTimeline.map(s => ({ timestamp: s.timestamp, confidence: s.confidence || 0.9 }))} />
                  <WordCloud words={interview.transcriptAnalysis.topicAnalysis.topics.map(t => ({ word: t, count: Math.floor(Math.random() * 20) + 5 }))} />
                </div>

                {/* Skills assessment */}
                {interview.aiScore.technicalAssessment.skillScores.length > 0 && (
                  <SkillsRadar skills={interview.aiScore.technicalAssessment.skillScores} />
                )}

                {/* AI Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>AI-Generated Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: interview.aiScore.summary }} />
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-96">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>AI analysis not available</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-6">
            {/* Technical Skills */}
            {feedback.technicalSkills.length > 0 && (
              <SkillsMatrix
                skills={feedback.technicalSkills}
                onChange={handleSkillUpdate}
                showNotes={true}
                showTargetComparison={true}
              />
            )}

            {/* Soft Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Soft Skills Assessment</CardTitle>
                <CardDescription>
                  Rate the candidate on key soft skills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RatingQuestions
                  questions={softSkillQuestions}
                  values={feedback.softSkills}
                  onChange={handleSoftSkillUpdate}
                />
              </CardContent>
            </Card>

            {/* Detailed Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Feedback Notes</CardTitle>
                <CardDescription>
                  Provide comprehensive feedback for the hiring team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FeedbackTemplateSelector
                  onSelectTemplate={(template) =>
                    setFeedback((prev) => ({ ...prev, detailedNotes: template }))
                  }
                />

                <RichTextEditor
                  value={feedback.detailedNotes}
                  onChange={(value) => setFeedback((prev) => ({ ...prev, detailedNotes: value }))}
                  placeholder="Write your detailed feedback here..."
                  minHeight="300px"
                  aiSuggestions={false}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
