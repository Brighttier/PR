"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertCircle, Calendar, Clock, Video, Users, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ScheduleInterviewDialogProps {
  applicationId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobId: string;
  jobTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface TeamMember {
  uid: string;
  displayName: string;
  email: string;
  role: string;
  photoURL?: string;
}

export function ScheduleInterviewDialog({
  applicationId,
  candidateId,
  candidateName,
  candidateEmail,
  jobId,
  jobTitle,
  open,
  onOpenChange,
  onSuccess,
}: ScheduleInterviewDialogProps) {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  // Form state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [interviewType, setInterviewType] = useState<
    "ai_screening" | "ai_technical" | "face_to_face" | "panel"
  >("ai_screening");
  const [title, setTitle] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [duration, setDuration] = useState<number>(30); // in minutes
  const [meetingLink, setMeetingLink] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  // Team members for face-to-face/panel interviews
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedInterviewers, setSelectedInterviewers] = useState<string[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);

  // Load team members when dialog opens and type is face-to-face/panel
  useEffect(() => {
    if (
      open &&
      userProfile?.companyId &&
      (interviewType === "face_to_face" || interviewType === "panel")
    ) {
      loadTeamMembers();
    }
  }, [open, interviewType, userProfile?.companyId]);

  // Set default title based on type
  useEffect(() => {
    switch (interviewType) {
      case "ai_screening":
        setTitle("AI Screening Interview");
        setDuration(15);
        break;
      case "ai_technical":
        setTitle("AI Technical Interview");
        setDuration(30);
        break;
      case "face_to_face":
        setTitle("Face-to-Face Interview");
        setDuration(60);
        break;
      case "panel":
        setTitle("Panel Interview");
        setDuration(90);
        break;
    }
  }, [interviewType]);

  const loadTeamMembers = async () => {
    if (!userProfile?.companyId) return;

    setLoadingTeam(true);
    try {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("companyId", "==", userProfile.companyId),
        where("role", "in", ["interviewer", "recruiter", "hr_admin"])
      );

      const snapshot = await getDocs(q);
      const members: TeamMember[] = snapshot.docs.map((doc) => ({
        uid: doc.id,
        displayName: doc.data().displayName || "Unknown",
        email: doc.data().email || "",
        role: doc.data().role || "interviewer",
        photoURL: doc.data().photoURL,
      }));

      setTeamMembers(members);
    } catch (err) {
      console.error("Error loading team members:", err);
    } finally {
      setLoadingTeam(false);
    }
  };

  const toggleInterviewer = (uid: string) => {
    setSelectedInterviewers((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const handleSubmit = async () => {
    if (!user || !userProfile?.companyId) {
      setError("You must be logged in");
      return;
    }

    // Validation
    if (!title.trim()) {
      setError("Interview title is required");
      return;
    }

    if (!scheduledDate) {
      setError("Interview date is required");
      return;
    }

    if (!scheduledTime) {
      setError("Interview time is required");
      return;
    }

    if (!duration || duration < 5 || duration > 180) {
      setError("Duration must be between 5 and 180 minutes");
      return;
    }

    if ((interviewType === "face_to_face" || interviewType === "panel") && selectedInterviewers.length === 0) {
      setError("Please select at least one interviewer");
      return;
    }

    if (interviewType === "panel" && selectedInterviewers.length < 2) {
      setError("Panel interviews require at least 2 interviewers");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Combine date and time
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);

      if (scheduledDateTime < new Date()) {
        setError("Interview must be scheduled in the future");
        setLoading(false);
        return;
      }

      // Create session ID
      const sessionId = `SESSION-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const interviewData: any = {
        sessionId,
        applicationId,
        candidateId,
        candidateName,
        candidateEmail,
        jobId,
        jobTitle,
        companyId: userProfile.companyId,
        companyName: userProfile.companyName || "Company",
        type: interviewType,
        title: title.trim(),
        status: "scheduled",
        scheduledAt: scheduledDateTime,
        scheduledDuration: duration * 60, // convert to seconds
        duration: duration, // in minutes for display
        notes: notes.trim(),
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        createdByName: user.displayName || user.email,
        updatedAt: serverTimestamp(),
      };

      // Add type-specific fields
      if (interviewType === "ai_screening" || interviewType === "ai_technical") {
        interviewData.aiInterviewer = true;
        interviewData.geminiConnected = false;
      } else {
        interviewData.aiInterviewer = false;
        interviewData.assignedInterviewers = selectedInterviewers;
        interviewData.assignedInterviewerNames = teamMembers
          .filter((m) => selectedInterviewers.includes(m.uid))
          .map((m) => m.displayName);

        if (meetingLink) {
          interviewData.meetingLink = meetingLink.trim();
        }

        if (location) {
          interviewData.location = location.trim();
        }
      }

      const docRef = await addDoc(collection(db, "interviews"), interviewData);

      // TODO: Trigger Cloud Function to send calendar invites and email notifications
      // The Cloud Function `onInterviewCreate_NotifyInterviewers` will handle this

      toast({
        title: "Interview Scheduled!",
        description: `${interviewType === "ai_screening" || interviewType === "ai_technical" ? "AI interview" : "Interview"} scheduled for ${scheduledDateTime.toLocaleString()}`,
      });

      // Reset form
      setTitle("");
      setScheduledDate("");
      setScheduledTime("");
      setDuration(30);
      setMeetingLink("");
      setLocation("");
      setNotes("");
      setSelectedInterviewers([]);

      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("Error scheduling interview:", err);
      setError("Failed to schedule interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Interview</DialogTitle>
          <DialogDescription>
            Schedule an interview for {candidateName} - {jobTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Interview Type */}
          <div className="space-y-3">
            <Label>Interview Type *</Label>
            <RadioGroup value={interviewType} onValueChange={(val: any) => setInterviewType(val)}>
              <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="ai_screening" id="ai_screening" />
                <Label htmlFor="ai_screening" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-purple-600" />
                    <div>
                      <p className="font-medium">AI Screening</p>
                      <p className="text-xs text-muted-foreground">
                        Automated screening with voice AI (15-20 minutes)
                      </p>
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="ai_technical" id="ai_technical" />
                <Label htmlFor="ai_technical" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="font-medium">AI Technical Interview</p>
                      <p className="text-xs text-muted-foreground">
                        Technical assessment with AI (30-45 minutes)
                      </p>
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="face_to_face" id="face_to_face" />
                <Label htmlFor="face_to_face" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="font-medium">Face-to-Face Interview</p>
                      <p className="text-xs text-muted-foreground">
                        1-on-1 interview with human interviewer (60 minutes)
                      </p>
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="panel" id="panel" />
                <Label htmlFor="panel" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-600" />
                    <div>
                      <p className="font-medium">Panel Interview</p>
                      <p className="text-xs text-muted-foreground">
                        Multiple interviewers (90+ minutes)
                      </p>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Interview Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Interview Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Initial Screening"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="date">Scheduled Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="date"
                  type="date"
                  className="pl-10"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  disabled={loading}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="time">Scheduled Time *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  className="pl-10"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="col-span-2">
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Select value={duration.toString()} onValueChange={(val) => setDuration(parseInt(val))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                  <SelectItem value="120">120 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Interviewer Assignment (for face-to-face/panel) */}
          {(interviewType === "face_to_face" || interviewType === "panel") && (
            <div className="space-y-3">
              <Label>
                Assign Interviewers * {interviewType === "panel" && "(minimum 2 required)"}
              </Label>
              {loadingTeam ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Loading team members...</span>
                </div>
              ) : teamMembers.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    No team members found. Add interviewers to your team first.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="border rounded-lg p-4 space-y-2 max-h-60 overflow-y-auto">
                  {teamMembers.map((member) => (
                    <div
                      key={member.uid}
                      className="flex items-center space-x-3 p-2 rounded hover:bg-muted/50"
                    >
                      <Checkbox
                        id={member.uid}
                        checked={selectedInterviewers.includes(member.uid)}
                        onCheckedChange={() => toggleInterviewer(member.uid)}
                      />
                      <Label htmlFor={member.uid} className="flex-1 cursor-pointer">
                        <div>
                          <p className="font-medium">{member.displayName}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Meeting Link (for remote face-to-face/panel) */}
          {(interviewType === "face_to_face" || interviewType === "panel") && (
            <div>
              <Label htmlFor="meetingLink">Meeting Link (optional)</Label>
              <Input
                id="meetingLink"
                placeholder="https://meet.google.com/..."
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                For remote interviews (Zoom, Google Meet, Teams, etc.)
              </p>
            </div>
          )}

          {/* Location (for in-person face-to-face/panel) */}
          {(interviewType === "face_to_face" || interviewType === "panel") && (
            <div>
              <Label htmlFor="location">Location (optional)</Label>
              <Input
                id="location"
                placeholder="Conference Room A, Building 2"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground mt-1">For in-person interviews</p>
            </div>
          )}

          {/* Interview Notes */}
          <div>
            <Label htmlFor="notes">Interview Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special instructions or focus areas for the interviewers..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scheduling...
              </>
            ) : (
              "Schedule Interview"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
