"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, query, where, getDocs, orderBy, updateDoc, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { RecruiterSidebar } from "@/components/recruiter/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  FileText,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  Clock,
  User,
  Briefcase,
  GraduationCap,
  Star,
  TrendingUp,
  MessageSquare,
  Video,
  Download,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScheduleInterviewDialog } from "@/components/interviews/schedule-interview-dialog";

interface Application {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  candidateLocation?: string;
  candidateLinkedIn?: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  resumeUrl?: string;
  status: string;
  stage: string;
  appliedAt: any;
  aiAnalysis?: {
    matchScore: number;
    recommendation: string;
    oneLiner: string;
    executiveSummary: string;
    strengths: string[];
    redFlags: string[];
    skillsMatch: any;
    experienceAlignment: any;
  };
  [key: string]: any;
}

interface Interview {
  id: string;
  type: string;
  status: string;
  scheduledAt: any;
  duration: number;
  assignedInterviewerNames?: string[];
  feedbackGenerated?: boolean;
  [key: string]: any;
}

interface Note {
  id: string;
  content: string;
  createdBy: string;
  createdByName: string;
  createdAt: any;
}

export default function ApplicationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const applicationId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [application, setApplication] = useState<Application | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  // Schedule interview dialog
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  useEffect(() => {
    if (applicationId) {
      loadApplicationData();
    }
  }, [applicationId]);

  const loadApplicationData = async () => {
    try {
      setLoading(true);

      // Get application
      const appRef = doc(db, "applications", applicationId);
      const appSnap = await getDoc(appRef);

      if (!appSnap.exists()) {
        setError("Application not found");
        setLoading(false);
        return;
      }

      const appData = { id: appSnap.id, ...appSnap.data() } as Application;
      setApplication(appData);

      // Get interviews
      const interviewsRef = collection(db, "interviews");
      const interviewsQuery = query(
        interviewsRef,
        where("applicationId", "==", applicationId),
        orderBy("scheduledAt", "desc")
      );
      const interviewsSnap = await getDocs(interviewsQuery);
      const interviewsData = interviewsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Interview[];
      setInterviews(interviewsData);

      // Get notes
      const notesRef = collection(db, "applications", applicationId, "notes");
      const notesQuery = query(notesRef, orderBy("createdAt", "desc"));
      const notesSnap = await getDocs(notesQuery);
      const notesData = notesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Note[];
      setNotes(notesData);

      setLoading(false);
    } catch (err) {
      console.error("Error loading application:", err);
      setError("Failed to load application data");
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!application) return;

    setUpdating(true);
    try {
      const appRef = doc(db, "applications", applicationId);
      await updateDoc(appRef, {
        status: newStatus,
        updatedAt: new Date(),
      });

      setApplication({ ...application, status: newStatus });

      toast({
        title: "Status updated",
        description: `Application status changed to ${newStatus}`,
      });
    } catch (err) {
      console.error("Error updating status:", err);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleStageChange = async (newStage: string) => {
    if (!application) return;

    setUpdating(true);
    try {
      const appRef = doc(db, "applications", applicationId);
      await updateDoc(appRef, {
        stage: newStage,
        updatedAt: new Date(),
      });

      setApplication({ ...application, stage: newStage });

      toast({
        title: "Stage updated",
        description: `Application moved to ${newStage}`,
      });
    } catch (err) {
      console.error("Error updating stage:", err);
      toast({
        title: "Error",
        description: "Failed to update stage",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !userProfile) return;

    setAddingNote(true);
    try {
      const notesRef = collection(db, "applications", applicationId, "notes");
      const noteData = {
        content: newNote.trim(),
        createdBy: userProfile.uid,
        createdByName: userProfile.displayName || userProfile.email || "Unknown",
        createdAt: new Date(),
      };

      await addDoc(notesRef, noteData);

      // Reload notes
      await loadApplicationData();

      setNewNote("");
      toast({
        title: "Note added",
        description: "Your note has been saved",
      });
    } catch (err) {
      console.error("Error adding note:", err);
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      });
    } finally {
      setAddingNote(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-700 bg-green-50 border-green-200";
    if (score >= 70) return "text-blue-700 bg-blue-50 border-blue-200";
    if (score >= 50) return "text-yellow-700 bg-yellow-50 border-yellow-200";
    return "text-gray-700 bg-gray-50 border-gray-200";
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec.toLowerCase()) {
      case "fast track":
        return "bg-green-100 text-green-800 border-green-200";
      case "strong candidate":
        return "bg-green-50 text-green-700 border-green-200";
      case "worth reviewing":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "marginal fit":
        return "bg-gray-50 text-gray-700 border-gray-200";
      case "not recommended":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <RecruiterSidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading application...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="flex h-screen bg-gray-50">
        <RecruiterSidebar />
        <main className="flex-1 p-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || "Application not found"}</AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <RecruiterSidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{application.candidateName}</h1>
                <p className="text-muted-foreground">{application.jobTitle}</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => window.open(`mailto:${application.candidateEmail}`)}>
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
                <Button onClick={() => setScheduleDialogOpen(true)}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Interview
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Match Score</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`text-lg font-bold border ${getScoreColor(application.aiAnalysis?.matchScore || 0)}`}>
                    {application.aiAnalysis?.matchScore || 0}%
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Select value={application.status} onValueChange={handleStatusChange} disabled={updating}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Applied">Applied</SelectItem>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                    <SelectItem value="Interview Scheduled">Interview Scheduled</SelectItem>
                    <SelectItem value="Offer Extended">Offer Extended</SelectItem>
                    <SelectItem value="Hired">Hired</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Withdrawn">Withdrawn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Stage</Label>
                <Select value={application.stage} onValueChange={handleStageChange} disabled={updating}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Application Review">Application Review</SelectItem>
                    <SelectItem value="Initial Screening">Initial Screening</SelectItem>
                    <SelectItem value="Technical Interview">Technical Interview</SelectItem>
                    <SelectItem value="Face-to-Face Interview">Face-to-Face Interview</SelectItem>
                    <SelectItem value="Final Review">Final Review</SelectItem>
                    <SelectItem value="Offer">Offer</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Applied</Label>
                <p className="text-sm font-medium mt-1">
                  {formatDate(application.appliedAt)}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Tabs Content */}
        <div className="p-6">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
              <TabsTrigger value="interviews">
                Interviews {interviews.length > 0 && `(${interviews.length})`}
              </TabsTrigger>
              <TabsTrigger value="notes">Notes {notes.length > 0 && `(${notes.length})`}</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Candidate Info */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Candidate Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Candidate Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Email</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <a href={`mailto:${application.candidateEmail}`} className="text-sm hover:underline">
                              {application.candidateEmail}
                            </a>
                          </div>
                        </div>
                        {application.candidatePhone && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Phone</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">{application.candidatePhone}</span>
                            </div>
                          </div>
                        )}
                        {application.candidateLocation && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Location</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">{application.candidateLocation}</span>
                            </div>
                          </div>
                        )}
                        {application.candidateLinkedIn && (
                          <div>
                            <Label className="text-xs text-muted-foreground">LinkedIn</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Linkedin className="w-4 h-4 text-muted-foreground" />
                              <a
                                href={application.candidateLinkedIn}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm hover:underline flex items-center gap-1"
                              >
                                View Profile
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        )}
                      </div>

                      {application.aiAnalysis?.oneLiner && (
                        <div className="bg-muted/50 rounded-lg p-3 mt-4">
                          <p className="text-sm font-medium">{application.aiAnalysis.oneLiner}</p>
                        </div>
                      )}

                      {application.resumeUrl && (
                        <Separator />
                      )}

                      {application.resumeUrl && (
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1" asChild>
                            <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer">
                              <FileText className="w-4 h-4 mr-2" />
                              View Resume
                            </a>
                          </Button>
                          <Button variant="outline" className="flex-1" asChild>
                            <a href={application.resumeUrl} download>
                              <Download className="w-4 h-4 mr-2" />
                              Download Resume
                            </a>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Executive Summary */}
                  {application.aiAnalysis?.executiveSummary && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Briefcase className="w-5 h-5" />
                          Executive Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {application.aiAnalysis.executiveSummary}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Right Column - AI Insights */}
                <div className="space-y-6">
                  {/* AI Recommendation */}
                  {application.aiAnalysis && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5" />
                          AI Recommendation
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center">
                          <Badge className={`text-lg border ${getRecommendationColor(application.aiAnalysis.recommendation)}`}>
                            {application.aiAnalysis.recommendation}
                          </Badge>
                        </div>

                        {/* Strengths */}
                        {application.aiAnalysis.strengths && application.aiAnalysis.strengths.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                              <ThumbsUp className="w-4 h-4 text-green-600" />
                              Strengths
                            </h4>
                            <ul className="space-y-1">
                              {application.aiAnalysis.strengths.map((strength: string, i: number) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start">
                                  <CheckCircle2 className="w-3 h-3 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                                  <span>{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Red Flags */}
                        {application.aiAnalysis.redFlags && application.aiAnalysis.redFlags.length > 0 && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-red-800">
                              <AlertCircle className="w-4 h-4 text-red-600" />
                              Red Flags
                            </h4>
                            <ul className="space-y-1">
                              {application.aiAnalysis.redFlags.map((flag: string, i: number) => (
                                <li key={i} className="text-sm text-red-700 flex items-start">
                                  <AlertCircle className="w-3 h-3 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                                  <span>{flag}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* AI Analysis Tab */}
            <TabsContent value="ai-analysis" className="space-y-6">
              {!application.aiAnalysis ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground">No AI analysis available yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Match Score Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Overall Match</span>
                          <span className="text-2xl font-bold text-primary">
                            {application.aiAnalysis.matchScore}%
                          </span>
                        </div>
                        <Progress value={application.aiAnalysis.matchScore} />
                      </div>

                      {/* Additional breakdowns can go here */}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Skills Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Detailed skills matching will be displayed here
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Interviews Tab */}
            <TabsContent value="interviews" className="space-y-6">
              {interviews.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground mb-4">No interviews scheduled yet</p>
                    <Button onClick={() => setScheduleDialogOpen(true)}>
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Interview
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {interviews.map((interview) => (
                    <Card key={interview.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{interview.title || interview.type}</CardTitle>
                          <Badge variant="outline">{interview.status}</Badge>
                        </div>
                        <CardDescription>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(interview.scheduledAt)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Video className="w-3 h-3" />
                              {interview.duration} minutes
                            </div>
                          </div>
                        </CardDescription>
                      </CardHeader>
                      {interview.assignedInterviewerNames && interview.assignedInterviewerNames.length > 0 && (
                        <CardContent>
                          <Label className="text-xs text-muted-foreground">Interviewers</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {interview.assignedInterviewerNames.map((name: string, idx: number) => (
                              <Badge key={idx} variant="outline">
                                {name}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add Note</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Write a note about this candidate..."
                    rows={4}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    disabled={addingNote}
                  />
                  <Button onClick={handleAddNote} disabled={!newNote.trim() || addingNote}>
                    {addingNote ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Add Note
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {notes.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground">No notes yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <Card key={note.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{note.createdByName}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(note.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {note.content}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Schedule Interview Dialog */}
      <ScheduleInterviewDialog
        applicationId={applicationId}
        candidateId={application.candidateId}
        candidateName={application.candidateName}
        candidateEmail={application.candidateEmail}
        jobId={application.jobId}
        jobTitle={application.jobTitle}
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        onSuccess={loadApplicationData}
      />
    </div>
  );
}
