"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddCandidateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddCandidateDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddCandidateDialogProps) {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  // Form state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [skills, setSkills] = useState("");
  const [notes, setNotes] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!validTypes.includes(file.type)) {
        setError("Please upload a PDF or Word document");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }

      setResumeFile(file);
      setError("");
    }
  };

  const handleSubmit = async () => {
    if (!user || !userProfile?.companyId) {
      setError("You must be logged in");
      return;
    }

    // Validation
    if (!fullName.trim()) {
      setError("Full name is required");
      return;
    }

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Parse skills from comma-separated string
      const skillsArray = skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const candidateData: any = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        linkedIn: linkedIn.trim(),
        skills: skillsArray,
        notes: notes.trim(),
        companyId: userProfile.companyId,
        addedBy: user.uid,
        addedByName: user.displayName || user.email,
        source: "manual_entry",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // If resume file is provided, we'll need to upload it
      // For now, we'll just store the filename and indicate it needs processing
      if (resumeFile) {
        candidateData.resumeFileName = resumeFile.name;
        candidateData.resumeNeedsUpload = true;
        // TODO: Implement actual file upload to Firebase Storage
        // This would typically be done via a Cloud Function or client-side upload
      }

      await addDoc(collection(db, "talentPool"), candidateData);

      toast({
        title: "Candidate Added!",
        description: `${fullName} has been added to your talent pool.`,
      });

      // Reset form
      setFullName("");
      setEmail("");
      setPhone("");
      setLinkedIn("");
      setSkills("");
      setNotes("");
      setResumeFile(null);

      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("Error adding candidate:", err);
      setError("Failed to add candidate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Candidate to Talent Pool</DialogTitle>
          <DialogDescription>
            Manually add a candidate to your talent pool for future opportunities.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Full Name */}
          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* LinkedIn */}
          <div>
            <Label htmlFor="linkedIn">LinkedIn URL (optional)</Label>
            <Input
              id="linkedIn"
              type="url"
              placeholder="https://linkedin.com/in/johndoe"
              value={linkedIn}
              onChange={(e) => setLinkedIn(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Resume Upload */}
          <div>
            <Label htmlFor="resume">Resume (optional)</Label>
            <div className="mt-2">
              <label
                htmlFor="resume"
                className="flex items-center justify-center w-full h-32 px-4 transition bg-muted border-2 border-dashed rounded-md appearance-none cursor-pointer hover:border-primary focus:outline-none"
              >
                <div className="flex flex-col items-center space-y-2">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                  <span className="font-medium text-sm">
                    {resumeFile ? resumeFile.name : "Click to upload resume"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    PDF, DOC, or DOCX (max 5MB)
                  </span>
                </div>
                <input
                  id="resume"
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  disabled={loading}
                />
              </label>
            </div>
          </div>

          {/* Skills */}
          <div>
            <Label htmlFor="skills">Skills (optional)</Label>
            <Input
              id="skills"
              placeholder="React, TypeScript, Node.js (comma-separated)"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Separate skills with commas
            </p>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes about this candidate..."
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
                Adding...
              </>
            ) : (
              "Add to Talent Pool"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
