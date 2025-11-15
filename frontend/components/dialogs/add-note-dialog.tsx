"use client";

import React, { useState } from "react";
import { doc, updateDoc, arrayUnion, Timestamp } from "firebase/firestore";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, StickyNote } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface AddNoteDialogProps {
  trigger?: React.ReactNode;
  applicationId: string;
  candidateName: string;
  onSuccess?: () => void;
}

export function AddNoteDialog({
  trigger,
  applicationId,
  candidateName,
  onSuccess,
}: AddNoteDialogProps) {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    noteText: "",
    isPrivate: false,
  });

  // Handle form submission
  const handleSubmit = async () => {
    // Validation
    if (!formData.noteText.trim()) {
      toast({
        title: "Validation error",
        description: "Note text is required.",
        variant: "destructive",
      });
      return;
    }

    if (!user || !userProfile) {
      toast({
        title: "Error",
        description: "You must be logged in to add a note.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const applicationRef = doc(db, "applications", applicationId);

      const newNote = {
        id: `NOTE-${Date.now()}`,
        text: formData.noteText.trim(),
        isPrivate: formData.isPrivate,
        createdBy: user.uid,
        createdByName: userProfile.displayName || user.email,
        createdByRole: userProfile.role,
        createdAt: Timestamp.now(),
      };

      // Update application document
      await updateDoc(applicationRef, {
        notes: arrayUnion(newNote),
        updatedAt: Timestamp.now(),
        lastNoteAt: Timestamp.now(),
      });

      toast({
        title: "Note added",
        description: `Note added to ${candidateName}'s application.`,
      });

      // Reset form
      setFormData({
        noteText: "",
        isPrivate: false,
      });

      setOpen(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error adding note:", error);
      toast({
        title: "Error",
        description: "Failed to add note. Please try again.",
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
          <Button variant="outline" size="sm">
            <StickyNote className="w-4 h-4 mr-2" />
            Add Note
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Internal Note</DialogTitle>
          <DialogDescription>
            Add a note to {candidateName}'s application. Notes are visible to all team
            members unless marked as private.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Note Text */}
          <div className="space-y-2">
            <Label htmlFor="noteText">
              Note <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="noteText"
              placeholder="Enter your note here..."
              value={formData.noteText}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, noteText: e.target.value }))
              }
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {formData.noteText.length} characters
            </p>
          </div>

          {/* Private Note Option */}
          <div className="flex items-start space-x-2 p-3 bg-muted rounded-md">
            <Checkbox
              id="isPrivate"
              checked={formData.isPrivate}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  isPrivate: checked === true,
                }))
              }
            />
            <div className="space-y-1">
              <Label
                htmlFor="isPrivate"
                className="text-sm font-normal cursor-pointer"
              >
                Mark as private
              </Label>
              <p className="text-xs text-muted-foreground">
                Private notes are only visible to HR Admins and the note author.
                Recruiters and interviewers won't be able to see this note.
              </p>
            </div>
          </div>

          {/* Note Info */}
          <div className="text-xs text-muted-foreground space-y-1 border-l-2 border-muted pl-3">
            <p>
              <strong>Note author:</strong> {userProfile?.displayName || user?.email}
            </p>
            <p>
              <strong>Role:</strong>{" "}
              {userProfile?.role === "hr_admin"
                ? "HR Admin"
                : userProfile?.role === "recruiter"
                ? "Recruiter"
                : userProfile?.role === "interviewer"
                ? "Interviewer"
                : userProfile?.role}
            </p>
            <p>
              <strong>Timestamp:</strong> {new Date().toLocaleString()}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <StickyNote className="mr-2 h-4 w-4" />
                Add Note
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
