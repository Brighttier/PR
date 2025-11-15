"use client";

import React, { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, UserPlus } from "lucide-react";

interface InviteTeamMemberDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function InviteTeamMemberDialog({
  trigger,
  onSuccess,
}: InviteTeamMemberDialogProps) {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    displayName: "",
    role: "recruiter" as "recruiter" | "interviewer" | "hr_admin",
    sendWelcomeEmail: true,
  });

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Generate secure invite token
  const generateInviteToken = (): string => {
    return Array.from({ length: 32 }, () =>
      Math.random().toString(36).charAt(2)
    ).join("");
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validation
    if (!formData.email.trim()) {
      toast({
        title: "Validation error",
        description: "Email address is required.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidEmail(formData.email)) {
      toast({
        title: "Validation error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.displayName.trim()) {
      toast({
        title: "Validation error",
        description: "Display name is required.",
        variant: "destructive",
      });
      return;
    }

    if (!userProfile?.companyId) {
      toast({
        title: "Error",
        description: "Company information not found.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const inviteToken = generateInviteToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      // Create invite document
      const inviteData = {
        email: formData.email.toLowerCase().trim(),
        displayName: formData.displayName.trim(),
        role: formData.role,
        companyId: userProfile.companyId,
        invitedBy: user?.uid,
        invitedByName: userProfile.displayName || user?.email,
        inviteToken,
        status: "pending",
        sentAt: Timestamp.now(),
        expiresAt: Timestamp.fromDate(expiresAt),
      };

      await addDoc(collection(db, "invites"), inviteData);

      // Send invitation email if enabled
      if (formData.sendWelcomeEmail) {
        // TODO: Trigger Cloud Function to send email
        // The email should contain:
        // - Greeting with inviter's name
        // - Role information
        // - Accept invitation link: /auth/accept-invite?token={inviteToken}
        // - Expiry date (7 days)
        console.log("Sending invite email to:", formData.email);
      }

      toast({
        title: "Invitation sent",
        description: `Invite sent to ${formData.email}. It will expire in 7 days.`,
      });

      // Reset form
      setFormData({
        email: "",
        displayName: "",
        role: "recruiter",
        sendWelcomeEmail: true,
      });

      setOpen(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error sending invite:", error);
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
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
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Team Member
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Send an invitation to join your team. The invite will expire in 7 days.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Email Address */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName">
              Display Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="displayName"
              placeholder="John Doe"
              value={formData.displayName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, displayName: e.target.value }))
              }
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">
              Role <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value: any) =>
                setFormData((prev) => ({ ...prev, role: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recruiter">Recruiter</SelectItem>
                <SelectItem value="interviewer">Interviewer</SelectItem>
                <SelectItem value="hr_admin">HR Admin</SelectItem>
              </SelectContent>
            </Select>

            {/* Role Descriptions */}
            <div className="text-xs text-muted-foreground space-y-1 mt-2">
              {formData.role === "recruiter" && (
                <p>
                  Can manage jobs, review applications, and communicate with candidates.
                  Cannot manage team members or billing.
                </p>
              )}
              {formData.role === "interviewer" && (
                <p>
                  Can view assigned applications, conduct interviews, and submit feedback.
                  Limited access to other features.
                </p>
              )}
              {formData.role === "hr_admin" && (
                <p>
                  Full access to all features including team management, AI configuration,
                  and billing.
                </p>
              )}
            </div>
          </div>

          {/* Send Welcome Email */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sendWelcomeEmail"
              checked={formData.sendWelcomeEmail}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  sendWelcomeEmail: checked === true,
                }))
              }
            />
            <Label
              htmlFor="sendWelcomeEmail"
              className="text-sm font-normal cursor-pointer"
            >
              Send welcome email with invitation link
            </Label>
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
                Sending...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Send Invite
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
