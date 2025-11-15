"use client";

import React, { useState, useEffect } from "react";
import { collection, addDoc, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/auth-provider";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarIcon, Clock, Video, MapPin, Users, Loader2, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ScheduleInterviewDialogProps {
  applicationId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobId: string;
  jobTitle: string;
  trigger?: React.ReactNode;
  onSuccess?: (interviewId: string) => void;
}

interface TeamMember {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: string;
}

export function ScheduleInterviewDialog({
  applicationId,
  candidateId,
  candidateName,
  candidateEmail,
  jobId,
  jobTitle,
  trigger,
  onSuccess,
}: ScheduleInterviewDialogProps) {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Form state
  const [interviewType, setInterviewType] = useState<
    "ai_screening" | "ai_technical" | "face_to_face" | "panel"
  >("face_to_face");
  const [title, setTitle] = useState("Initial Screening");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("09:00");
  const [duration, setDuration] = useState(60);
  const [selectedInterviewers, setSelectedInterviewers] = useState<string[]>([]);
  const [meetingLink, setMeetingLink] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  // Load team members
  useEffect(() => {
    const loadTeamMembers = async () => {
      if (!userProfile?.companyId || !open) return;

      setLoadingTeam(true);

      try {
        const usersQuery = query(
          collection(db, "users"),
          where("companyId", "==", userProfile.companyId),
          where("role", "in", ["interviewer", "hr_admin", "recruiter"])
        );

        const snapshot = await getDocs(usersQuery);
        const members: TeamMember[] = snapshot.docs.map((doc) => ({
          uid: doc.id,
          displayName: doc.data().displayName || doc.data().email,
          email: doc.data().email,
          photoURL: doc.data().photoURL,
          role: doc.data().role,
        }));

        setTeamMembers(members);
      } catch (error) {
        console.error("Error loading team members:", error);
        toast({
          title: "Error",
          description: "Failed to load team members.",
          variant: "destructive",
        });
      } finally {
        setLoadingTeam(false);
      }
    };

    loadTeamMembers();
  }, [userProfile?.companyId, open, toast]);

  // Toggle interviewer selection
  const toggleInterviewer = (uid: string) => {
    setSelectedInterviewers((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  // Handle submit
  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      toast({
        title: "Validation error",
        description: "Interview title is required.",
        variant: "destructive",
      });
      return;
    }

    if (!date) {
      toast({
        title: "Validation error",
        description: "Interview date is required.",
        variant: "destructive",
      });
      return;
    }

    if (interviewType === "face_to_face" || interviewType === "panel") {
      if (selectedInterviewers.length === 0) {
        toast({
          title: "Validation error",
          description: "Please select at least one interviewer.",
          variant: "destructive",
        });
        return;
      }

      if (interviewType === "panel" && selectedInterviewers.length < 2) {
        toast({
          title: "Validation error",
          description: "Panel interviews require at least 2 interviewers.",
          variant: "destructive",
        });
        return;
      }
    }

    if (!user || !userProfile?.companyId) {
      toast({
        title: "Error",
        description: "You must be logged in to schedule an interview.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Parse date and time
      const [hours, minutes] = time.split(":").map(Number);
      const scheduledDate = new Date(date);
      scheduledDate.setHours(hours, minutes, 0, 0);

      const interviewData = {
        applicationId,
        candidateId,
        candidateName,
        candidateEmail,
        jobId,
        jobTitle,
        companyId: userProfile.companyId,
        type: interviewType,
        title: title.trim(),
        status: "scheduled" as const,
        scheduledAt: Timestamp.fromDate(scheduledDate),
        duration,
        assignedInterviewers: selectedInterviewers,
        meetingLink: meetingLink.trim() || null,
        location: location.trim() || null,
        notes: notes.trim() || null,
        createdBy: user.uid,
        createdByName: userProfile.displayName || user.email,
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, "interviews"), interviewData);

      toast({
        title: "Interview scheduled",
        description: `Interview with ${candidateName} has been scheduled for ${format(
          scheduledDate,
          "PPP 'at' p"
        )}.`,
      });

      // Reset form
      setTitle("Initial Screening");
      setDate(undefined);
      setTime("09:00");
      setDuration(60);
      setSelectedInterviewers([]);
      setMeetingLink("");
      setLocation("");
      setNotes("");

      setOpen(false);

      if (onSuccess) {
        onSuccess(docRef.id);
      }
    } catch (error) {
      console.error("Error scheduling interview:", error);
      toast({
        title: "Error",
        description: "Failed to schedule interview. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <CalendarIcon className="w-4 h-4 mr-2" />
            Schedule Interview
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Interview</DialogTitle>
          <DialogDescription>
            Schedule an interview with {candidateName} for {jobTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Interview Type */}
          <div className="space-y-2">
            <Label>Interview Type</Label>
            <Select
              value={interviewType}
              onValueChange={(value: any) => setInterviewType(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ai_screening">AI Screening</SelectItem>
                <SelectItem value="ai_technical">AI Technical Interview</SelectItem>
                <SelectItem value="face_to_face">Face-to-Face Interview</SelectItem>
                <SelectItem value="panel">Panel Interview</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Interview Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Interview Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Initial Screening, Technical Round"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Date <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">
                Time <span className="text-red-500">*</span>
              </Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Select value={duration.toString()} onValueChange={(value) => setDuration(Number(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assign Interviewers (for face-to-face and panel) */}
          {(interviewType === "face_to_face" || interviewType === "panel") && (
            <div className="space-y-2">
              <Label>
                Assign Interviewers <span className="text-red-500">*</span>
                {interviewType === "panel" && (
                  <span className="text-xs text-muted-foreground ml-2">(Select at least 2)</span>
                )}
              </Label>

              {loadingTeam ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : teamMembers.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No team members available
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                  {teamMembers.map((member) => (
                    <div
                      key={member.uid}
                      className="flex items-center space-x-3 p-2 hover:bg-accent rounded-lg cursor-pointer"
                      onClick={() => toggleInterviewer(member.uid)}
                    >
                      <Checkbox
                        checked={selectedInterviewers.includes(member.uid)}
                        onCheckedChange={() => toggleInterviewer(member.uid)}
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.photoURL} />
                        <AvatarFallback>
                          {member.displayName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{member.displayName}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {member.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {selectedInterviewers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedInterviewers.map((uid) => {
                    const member = teamMembers.find((m) => m.uid === uid);
                    return member ? (
                      <Badge key={uid} variant="secondary" className="gap-2">
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={member.photoURL} />
                          <AvatarFallback className="text-xs">
                            {member.displayName[0]}
                          </AvatarFallback>
                        </Avatar>
                        {member.displayName}
                        <button
                          type="button"
                          onClick={() => toggleInterviewer(uid)}
                          className="hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          )}

          {/* Meeting Link */}
          <div className="space-y-2">
            <Label htmlFor="meetingLink">
              <Video className="w-4 h-4 inline mr-2" />
              Meeting Link (optional)
            </Label>
            <Input
              id="meetingLink"
              type="url"
              placeholder="https://meet.google.com/..."
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              For remote interviews (Zoom, Google Meet, Teams, etc.)
            </p>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">
              <MapPin className="w-4 h-4 inline mr-2" />
              Location (optional)
            </Label>
            <Input
              id="location"
              placeholder="e.g., Conference Room A, Building 2"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">For in-person interviews</p>
          </div>

          {/* Interview Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Internal Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special instructions or notes for the interviewers..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Summary */}
          {date && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="text-sm font-semibold">Interview Summary</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span>
                    {format(date, "EEEE, MMMM d, yyyy")} at {time}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{duration} minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>
                    {interviewType === "ai_screening" || interviewType === "ai_technical"
                      ? "AI Interview"
                      : `${selectedInterviewers.length} interviewer(s)`}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
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
