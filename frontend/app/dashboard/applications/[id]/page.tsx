"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScheduleInterviewDialog } from "@/components/dialogs/schedule-interview-dialog";
import {
  ArrowLeft,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ExternalLink,
  Download,
  Star,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
  Eye,
  FileText,
  Linkedin,
} from "lucide-react";
import { format } from "date-fns";

interface Application {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  candidateLocation?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  status: string;
  stage: string;
  appliedAt: any;
  resumeUrl?: string;
  coverLetter?: string;
  matchScore?: number;
  aiRecommendation?: string;
  aiSummary?: {
    oneLiner?: string;
    executiveSummary?: string;
    strengths?: string[];
    concerns?: string[];
    skillsMatch?: { skill: string; score: number }[];
  };
  currentSalary?: number;
  expectedSalary?: number;
  noticePeriod?: string;
  updatedAt: any;
}

interface Interview {
  id: string;
  applicationId: string;
  type: string;
  title: string;
  status: string;
  scheduledAt: any;
  duration: number;
  assignedInterviewers?: string[];
  meetingLink?: string;
  location?: string;
  feedbackSubmitted?: boolean;
}

interface Note {
  id: string;
  applicationId: string;
  content: string;
  createdBy: string;
  createdByName: string;
  createdAt: any;
}

const STATUS_OPTIONS = [
  "Applied",
  "Under Review",
  "Screening Scheduled",
  "Technical Interview Scheduled",
  "Interview Scheduled",
  "Offer Extended",
  "Hired",
  "Rejected",
  "Withdrawn",
];

const STAGE_OPTIONS = [
  "Application Review",
  "Initial Screening",
  "Technical Interview",
  "Face-to-Face Interview",
  "Final Review",
  "Offer",
  "Closed",
];

export default function ApplicationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  const applicationId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<Application | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Load application data
  useEffect(() => {
    const loadData = async () => {
      if (!applicationId) return;

      setLoading(true);

      try {
        // Load application
        const appDoc = await getDoc(doc(db, "applications", applicationId));

        if (!appDoc.exists()) {
          toast({
            title: "Application not found",
            description: "This application may have been deleted.",
            variant: "destructive",
          });
          router.push("/dashboard/applications");
          return;
        }

        const appData = { id: appDoc.id, ...appDoc.data() } as Application;
        setApplication(appData);

        // Load interviews
        const interviewsQuery = query(
          collection(db, "interviews"),
          where("applicationId", "==", applicationId),
          orderBy("scheduledAt", "desc")
        );
        const interviewsSnapshot = await getDocs(interviewsQuery);
        const interviewsData: Interview[] = interviewsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Interview));
        setInterviews(interviewsData);

        // Load notes
        const notesQuery = query(
          collection(db, "applications", applicationId, "notes"),
          orderBy("createdAt", "desc")
        );
        const notesSnapshot = await getDocs(notesQuery);
        const notesData: Note[] = notesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Note));
        setNotes(notesData);
      } catch (error) {
        console.error("Error loading application:", error);
        toast({
          title: "Error",
          description: "Failed to load application details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [applicationId, router, toast]);

  // Update status
  const handleStatusChange = async (newStatus: string) => {
    if (!application) return;

    setUpdatingStatus(true);

    try {
      await updateDoc(doc(db, "applications", applicationId), {
        status: newStatus,
        updatedAt: Timestamp.now(),
      });

      setApplication((prev) => (prev ? { ...prev, status: newStatus } : null));

      toast({
        title: "Status updated",
        description: `Application status changed to ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Update stage
  const handleStageChange = async (newStage: string) => {
    if (!application) return;

    setUpdatingStatus(true);

    try {
      await updateDoc(doc(db, "applications", applicationId), {
        stage: newStage,
        updatedAt: Timestamp.now(),
      });

      setApplication((prev) => (prev ? { ...prev, stage: newStage } : null));

      toast({
        title: "Stage updated",
        description: `Application stage changed to ${newStage}.`,
      });
    } catch (error) {
      console.error("Error updating stage:", error);
      toast({
        title: "Error",
        description: "Failed to update stage.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Add note
  const handleAddNote = async () => {
    if (!newNote.trim() || !user || !userProfile) return;

    setSavingNote(true);

    try {
      const noteData = {
        applicationId,
        content: newNote.trim(),
        createdBy: user.uid,
        createdByName: userProfile.displayName || user.email,
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, "applications", applicationId, "notes"), noteData);

      setNotes((prev) => [
        { id: Date.now().toString(), ...noteData } as Note,
        ...prev,
      ]);

      setNewNote("");

      toast({
        title: "Note added",
        description: "Your note has been saved.",
      });
    } catch (error) {
      console.error("Error adding note:", error);
      toast({
        title: "Error",
        description: "Failed to add note.",
        variant: "destructive",
      });
    } finally {
      setSavingNote(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { className: string; icon: any }> = {
      Applied: { className: "bg-blue-50 text-blue-700 border-blue-200", icon: Clock },
      "Under Review": { className: "bg-purple-50 text-purple-700 border-purple-200", icon: Eye },
      "Screening Scheduled": { className: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Calendar },
      "Technical Interview Scheduled": { className: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Calendar },
      "Interview Scheduled": { className: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Calendar },
      "Offer Extended": { className: "bg-green-100 text-green-800 border-green-300", icon: CheckCircle2 },
      Hired: { className: "bg-green-500 text-white border-green-600", icon: CheckCircle2 },
      Rejected: { className: "bg-red-50 text-red-700 border-red-200", icon: AlertTriangle },
      Withdrawn: { className: "bg-gray-50 text-gray-600 border-gray-200", icon: AlertTriangle },
    };

    const config = statusConfig[status] || { className: "", icon: Clock };
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  // Get match score badge
  const getMatchScoreBadge = (score?: number) => {
    if (!score) return null;

    let className = "";
    if (score >= 90) className = "bg-green-100 text-green-800 border-green-300";
    else if (score >= 70) className = "bg-green-50 text-green-700 border-green-200";
    else if (score >= 50) className = "bg-yellow-50 text-yellow-700 border-yellow-200";
    else className = "bg-gray-50 text-gray-600 border-gray-200";

    return (
      <Badge variant="outline" className={className}>
        <TrendingUp className="w-3 h-3 mr-1" />
        {score}% Match
      </Badge>
    );
  };

  // Get AI recommendation badge
  const getRecommendationBadge = (recommendation?: string) => {
    if (!recommendation) return null;

    const config: Record<string, { className: string }> = {
      "Fast Track": { className: "bg-green-100 text-green-800 border-green-300" },
      "Strong Candidate": { className: "bg-green-50 text-green-700 border-green-200" },
      "Worth Reviewing": { className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      "Marginal Fit": { className: "bg-gray-50 text-gray-600 border-gray-200" },
      "Not Recommended": { className: "bg-red-50 text-red-700 border-red-200" },
    };

    const style = config[recommendation] || config["Worth Reviewing"];

    return (
      <Badge variant="outline" className={style.className}>
        <Star className="w-3 h-3 mr-1" />
        {recommendation}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Application not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/applications")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{application.candidateName}</h1>
              {getStatusBadge(application.status)}
              {getMatchScoreBadge(application.matchScore)}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                <span>{application.jobTitle}</span>
              </div>
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <span>{application.candidateEmail}</span>
              </div>
              {application.candidatePhone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  <span>{application.candidatePhone}</span>
                </div>
              )}
              {application.candidateLocation && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{application.candidateLocation}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  Applied {application.appliedAt?.toDate ? format(application.appliedAt.toDate(), "MMM d, yyyy") : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {application.linkedinUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={application.linkedinUrl} target="_blank" rel="noopener noreferrer">
                <Linkedin className="w-4 h-4 mr-2" />
                LinkedIn
              </a>
            </Button>
          )}

          {application.resumeUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4 mr-2" />
                Resume
              </a>
            </Button>
          )}

          <ScheduleInterviewDialog
            applicationId={application.id}
            candidateId={application.candidateId}
            candidateName={application.candidateName}
            candidateEmail={application.candidateEmail}
            jobId={application.jobId}
            jobTitle={application.jobTitle}
            onSuccess={() => {
              // Reload interviews
              const loadInterviews = async () => {
                const interviewsQuery = query(
                  collection(db, "interviews"),
                  where("applicationId", "==", applicationId),
                  orderBy("scheduledAt", "desc")
                );
                const snapshot = await getDocs(interviewsQuery);
                setInterviews(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Interview)));
              };
              loadInterviews();
            }}
          />
        </div>
      </div>

      {/* Status & Stage Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={application.status}
                onValueChange={handleStatusChange}
                disabled={updatingStatus}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Stage</label>
              <Select
                value={application.stage}
                onValueChange={handleStageChange}
                disabled={updatingStatus}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGE_OPTIONS.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="interviews">Interviews ({interviews.length})</TabsTrigger>
          <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* AI Recommendation */}
          {application.aiRecommendation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  AI Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {getRecommendationBadge(application.aiRecommendation)}
                  {application.aiSummary?.oneLiner && (
                    <p className="text-sm text-muted-foreground">{application.aiSummary.oneLiner}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Candidate Information */}
          <Card>
            <CardHeader>
              <CardTitle>Candidate Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{application.candidateEmail}</p>
                </div>
                {application.candidatePhone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{application.candidatePhone}</p>
                  </div>
                )}
                {application.candidateLocation && (
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{application.candidateLocation}</p>
                  </div>
                )}
                {application.currentSalary && (
                  <div>
                    <p className="text-sm text-muted-foreground">Current Salary</p>
                    <p className="font-medium">${application.currentSalary.toLocaleString()}</p>
                  </div>
                )}
                {application.expectedSalary && (
                  <div>
                    <p className="text-sm text-muted-foreground">Expected Salary</p>
                    <p className="font-medium">${application.expectedSalary.toLocaleString()}</p>
                  </div>
                )}
                {application.noticePeriod && (
                  <div>
                    <p className="text-sm text-muted-foreground">Notice Period</p>
                    <p className="font-medium">{application.noticePeriod}</p>
                  </div>
                )}
              </div>

              {application.coverLetter && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Cover Letter</p>
                    <p className="text-sm whitespace-pre-wrap">{application.coverLetter}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Resume Preview */}
          {application.resumeUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Resume</span>
                  <Button variant="outline" size="sm" asChild>
                    <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open in New Tab
                    </a>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden" style={{ height: "600px" }}>
                  <iframe
                    src={application.resumeUrl}
                    className="w-full h-full"
                    title="Resume Preview"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* AI Analysis Tab */}
        <TabsContent value="ai-analysis" className="space-y-4">
          {application.aiSummary ? (
            <>
              {/* Executive Summary */}
              {application.aiSummary.executiveSummary && (
                <Card>
                  <CardHeader>
                    <CardTitle>Executive Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{application.aiSummary.executiveSummary}</p>
                  </CardContent>
                </Card>
              )}

              {/* Strengths */}
              {application.aiSummary.strengths && application.aiSummary.strengths.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <CheckCircle2 className="w-5 h-5" />
                      Key Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {application.aiSummary.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                          <span className="text-sm">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Concerns */}
              {application.aiSummary.concerns && application.aiSummary.concerns.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-700">
                      <AlertTriangle className="w-5 h-5" />
                      Concerns
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {application.aiSummary.concerns.map((concern, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                          <span className="text-sm">{concern}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Skills Match */}
              {application.aiSummary.skillsMatch && application.aiSummary.skillsMatch.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Skills Match</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {application.aiSummary.skillsMatch.map((skill, index) => (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{skill.skill}</span>
                            <span className="text-sm text-muted-foreground">{skill.score}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                skill.score >= 80
                                  ? "bg-green-500"
                                  : skill.score >= 60
                                  ? "bg-yellow-500"
                                  : "bg-gray-400"
                              }`}
                              style={{ width: `${skill.score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No AI Analysis Available</h3>
                  <p className="text-muted-foreground">
                    AI analysis is being processed. Check back shortly.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Interviews Tab */}
        <TabsContent value="interviews" className="space-y-4">
          {interviews.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No interviews scheduled</h3>
                  <p className="text-muted-foreground mb-4">
                    Schedule an interview to continue the hiring process.
                  </p>
                  <ScheduleInterviewDialog
                    applicationId={application.id}
                    candidateId={application.candidateId}
                    candidateName={application.candidateName}
                    candidateEmail={application.candidateEmail}
                    jobId={application.jobId}
                    jobTitle={application.jobTitle}
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {interviews.map((interview) => (
                <Card key={interview.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{interview.title}</h4>
                          <Badge variant="outline">{interview.type.replace(/_/g, " ")}</Badge>
                          <Badge
                            variant={
                              interview.status === "completed"
                                ? "default"
                                : interview.status === "scheduled"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {interview.status}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {interview.scheduledAt?.toDate
                                ? format(interview.scheduledAt.toDate(), "MMM d, yyyy 'at' h:mm a")
                                : "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{interview.duration} minutes</span>
                          </div>
                          {interview.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{interview.location}</span>
                            </div>
                          )}
                        </div>

                        {interview.meetingLink && (
                          <Button variant="link" size="sm" className="h-auto p-0" asChild>
                            <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Join Meeting
                            </a>
                          </Button>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/interviews/${interview.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          {/* Add Note */}
          <Card>
            <CardHeader>
              <CardTitle>Add Note</CardTitle>
              <CardDescription>Internal notes are only visible to your team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Write your note here..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={4}
              />
              <Button onClick={handleAddNote} disabled={!newNote.trim() || savingNote}>
                {savingNote ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Add Note
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Notes List */}
          {notes.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No notes yet</h3>
                  <p className="text-muted-foreground">
                    Add notes to track your thoughts and decisions about this candidate.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <Card key={note.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {note.createdByName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{note.createdByName}</p>
                          <p className="text-xs text-muted-foreground">
                            {note.createdAt?.toDate
                              ? format(note.createdAt.toDate(), "MMM d, yyyy 'at' h:mm a")
                              : "N/A"}
                          </p>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
