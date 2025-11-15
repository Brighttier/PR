"use client";

import React, { useState } from "react";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ChangeStatusDialogProps {
  trigger?: React.ReactNode;
  applicationId: string;
  currentStatus: string;
  currentStage: string;
  candidateName: string;
  onSuccess?: () => void;
}

const STATUS_OPTIONS = [
  { value: "Applied", label: "Applied", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "Under Review", label: "Under Review", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  { value: "Screening Scheduled", label: "Screening Scheduled", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { value: "Technical Interview Scheduled", label: "Technical Interview Scheduled", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { value: "Interview Scheduled", label: "Interview Scheduled", color: "bg-green-100 text-green-800 border-green-300" },
  { value: "Offer Extended", label: "Offer Extended", color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  { value: "Hired", label: "Hired", color: "bg-green-500 text-white border-green-600" },
  { value: "Rejected", label: "Rejected", color: "bg-red-50 text-red-700 border-red-200" },
  { value: "Withdrawn", label: "Withdrawn", color: "bg-gray-50 text-gray-600 border-gray-200" },
];

const STAGE_OPTIONS = [
  { value: "Application Review", label: "Application Review" },
  { value: "Initial Screening", label: "Initial Screening" },
  { value: "Technical Interview", label: "Technical Interview" },
  { value: "Face-to-Face Interview", label: "Face-to-Face Interview" },
  { value: "Final Review", label: "Final Review" },
  { value: "Offer", label: "Offer" },
  { value: "Closed", label: "Closed" },
];

export function ChangeStatusDialog({
  trigger,
  applicationId,
  currentStatus,
  currentStage,
  candidateName,
  onSuccess,
}: ChangeStatusDialogProps) {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    status: currentStatus,
    stage: currentStage,
    notes: "",
  });

  // Check if user has permission to update status
  const canUpdate = userProfile?.role === "recruiter" || userProfile?.role === "hr_admin";

  // Handle form submission
  const handleSubmit = async () => {
    if (!canUpdate) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to update application status.",
        variant: "destructive",
      });
      return;
    }

    // Check if anything changed
    if (formData.status === currentStatus && formData.stage === currentStage) {
      toast({
        title: "No changes",
        description: "Please make changes before updating.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const applicationRef = doc(db, "applications", applicationId);

      const updateData: any = {
        updatedAt: Timestamp.now(),
        updatedBy: user?.uid,
      };

      // Only update fields that changed
      if (formData.status !== currentStatus) {
        updateData.status = formData.status;
        updateData.statusUpdatedAt = Timestamp.now();
      }

      if (formData.stage !== currentStage) {
        updateData.stage = formData.stage;
        updateData.stageUpdatedAt = Timestamp.now();
      }

      // Add note to activity log if provided
      if (formData.notes.trim()) {
        updateData.lastNote = {
          text: formData.notes.trim(),
          createdBy: user?.uid,
          createdByName: userProfile?.displayName || user?.email,
          createdAt: Timestamp.now(),
        };
      }

      await updateDoc(applicationRef, updateData);

      // TODO: Trigger Cloud Function to:
      // 1. Send notification to candidate (if status/stage changed significantly)
      // 2. Log activity in audit trail
      // 3. Update analytics/metrics

      toast({
        title: "Status updated",
        description: `Application status for ${candidateName} has been updated.`,
      });

      setFormData({
        status: currentStatus,
        stage: currentStage,
        notes: "",
      });

      setOpen(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!canUpdate) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Change Status
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Update Application Status</DialogTitle>
          <DialogDescription>
            Change the status and stage for {candidateName}'s application.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Status */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Current Status</Label>
            <div className="flex gap-2">
              <Badge variant="outline" className={STATUS_OPTIONS.find(s => s.value === currentStatus)?.color}>
                {currentStatus}
              </Badge>
              <Badge variant="outline" className="border-gray-300">
                {currentStage}
              </Badge>
            </div>
          </div>

          {/* New Status */}
          <div className="space-y-2">
            <Label htmlFor="status">
              New Status <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${option.color}`} />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* New Stage */}
          <div className="space-y-2">
            <Label htmlFor="stage">
              New Stage <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.stage}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, stage: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STAGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add a note about this status change..."
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              This note will be added to the application activity log.
            </p>
          </div>

          {/* Warning for significant status changes */}
          {(formData.status === "Rejected" || formData.status === "Hired") && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This is a terminal status. The candidate will be
                notified via email.
              </p>
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
                Updating...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Update Status
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
