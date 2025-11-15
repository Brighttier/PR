"use client";

import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
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
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, Paperclip, X, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SendEmailDialogProps {
  trigger?: React.ReactNode;
  recipientEmail: string;
  recipientName: string;
  candidateId?: string;
  jobTitle?: string;
  companyName?: string;
  interviewDate?: string;
  interviewTime?: string;
  meetingLink?: string;
  onSuccess?: () => void;
}

interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  content: string;
}

const AVAILABLE_VARIABLES = [
  { key: "{{candidateName}}", description: "Candidate's name" },
  { key: "{{jobTitle}}", description: "Job title" },
  { key: "{{companyName}}", description: "Company name" },
  { key: "{{interviewDate}}", description: "Interview date" },
  { key: "{{interviewTime}}", description: "Interview time" },
  { key: "{{meetingLink}}", description: "Meeting link" },
];

export function SendEmailDialog({
  trigger,
  recipientEmail,
  recipientName,
  candidateId,
  jobTitle,
  companyName,
  interviewDate,
  interviewTime,
  meetingLink,
  onSuccess,
}: SendEmailDialogProps) {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    templateId: "",
    to: recipientEmail,
    cc: "",
    bcc: "",
    subject: "",
    body: "",
  });

  // Load email templates
  useEffect(() => {
    if (open && userProfile?.companyId) {
      loadTemplates();
    }
  }, [open, userProfile?.companyId]);

  const loadTemplates = async () => {
    if (!userProfile?.companyId) return;

    setLoadingTemplates(true);
    try {
      const templatesRef = collection(db, "templates");
      const q = query(
        templatesRef,
        where("companyId", "==", userProfile.companyId),
        where("type", "==", "email")
      );
      const snapshot = await getDocs(q);

      const loadedTemplates: EmailTemplate[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as EmailTemplate[];

      setTemplates(loadedTemplates);
    } catch (error) {
      console.error("Error loading templates:", error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  // Handle template selection
  const handleTemplateChange = (templateId: string) => {
    if (!templateId) {
      setFormData((prev) => ({ ...prev, templateId: "", subject: "", body: "" }));
      return;
    }

    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setFormData((prev) => ({
        ...prev,
        templateId,
        subject: replaceVariables(template.subject),
        body: replaceVariables(template.content),
      }));
    }
  };

  // Replace variables in text
  const replaceVariables = (text: string): string => {
    let result = text;
    result = result.replace(/\{\{candidateName\}\}/g, recipientName || "");
    result = result.replace(/\{\{jobTitle\}\}/g, jobTitle || "");
    result = result.replace(/\{\{companyName\}\}/g, companyName || "");
    result = result.replace(/\{\{interviewDate\}\}/g, interviewDate || "");
    result = result.replace(/\{\{interviewTime\}\}/g, interviewTime || "");
    result = result.replace(/\{\{meetingLink\}\}/g, meetingLink || "");
    return result;
  };

  // Handle file attachments
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate file count
    if (attachments.length + files.length > 5) {
      toast({
        title: "Too many files",
        description: "You can attach a maximum of 5 files.",
        variant: "destructive",
      });
      return;
    }

    // Validate file sizes
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 10MB limit.`,
          variant: "destructive",
        });
        return;
      }
    }

    setAttachments((prev) => [...prev, ...files]);
  };

  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Insert variable at cursor
  const insertVariable = (variable: string) => {
    setFormData((prev) => ({
      ...prev,
      body: prev.body + variable,
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validation
    if (!formData.to.trim()) {
      toast({
        title: "Validation error",
        description: "Recipient email is required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.subject.trim()) {
      toast({
        title: "Validation error",
        description: "Email subject is required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.body.trim()) {
      toast({
        title: "Validation error",
        description: "Email body is required.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // TODO: Implement email sending via Cloud Function or API
      // This would typically:
      // 1. Upload attachments to Firebase Storage
      // 2. Call a Cloud Function to send email via SendGrid/Mailgun
      // 3. Log email in audit trail

      // Simulated delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "Email sent",
        description: `Email successfully sent to ${recipientName}.`,
      });

      // Reset form
      setFormData({
        templateId: "",
        to: recipientEmail,
        cc: "",
        bcc: "",
        subject: "",
        body: "",
      });
      setAttachments([]);
      setOpen(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
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
          <Button variant="outline">
            <Mail className="w-4 h-4 mr-2" />
            Email Candidate
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Email to {recipientName}</DialogTitle>
          <DialogDescription>
            Compose and send an email. Use templates or start from scratch.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Template Selector */}
          <div className="space-y-2">
            <Label>Email Template (optional)</Label>
            <Select
              value={formData.templateId}
              onValueChange={handleTemplateChange}
              disabled={loadingTemplates}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a template or start blank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Blank (no template)</SelectItem>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* To Field (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="to">
              To <span className="text-red-500">*</span>
            </Label>
            <Input
              id="to"
              type="email"
              value={formData.to}
              readOnly
              className="bg-muted"
            />
          </div>

          {/* CC Field */}
          <div className="space-y-2">
            <Label htmlFor="cc">CC (optional)</Label>
            <Input
              id="cc"
              type="text"
              placeholder="email1@example.com, email2@example.com"
              value={formData.cc}
              onChange={(e) => setFormData((prev) => ({ ...prev, cc: e.target.value }))}
            />
          </div>

          {/* BCC Field */}
          <div className="space-y-2">
            <Label htmlFor="bcc">BCC (optional)</Label>
            <Input
              id="bcc"
              type="text"
              placeholder="email1@example.com, email2@example.com"
              value={formData.bcc}
              onChange={(e) => setFormData((prev) => ({ ...prev, bcc: e.target.value }))}
            />
          </div>

          {/* Subject Field */}
          <div className="space-y-2">
            <Label htmlFor="subject">
              Subject <span className="text-red-500">*</span>
            </Label>
            <Input
              id="subject"
              placeholder="Enter email subject"
              value={formData.subject}
              onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
            />
          </div>

          {/* Available Variables */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Available Variables
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click a variable to insert it into the email body</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_VARIABLES.map((variable) => (
                <Badge
                  key={variable.key}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => insertVariable(variable.key)}
                >
                  {variable.key}
                </Badge>
              ))}
            </div>
          </div>

          {/* Email Body */}
          <div className="space-y-2">
            <Label htmlFor="body">
              Email Body <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="body"
              placeholder="Enter your message here..."
              value={formData.body}
              onChange={(e) => setFormData((prev) => ({ ...prev, body: e.target.value }))}
              rows={12}
            />
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label htmlFor="attachments">
              Attachments (optional, max 5 files, 10MB each)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="attachments"
                type="file"
                multiple
                onChange={handleFileChange}
                className="cursor-pointer"
                disabled={attachments.length >= 5}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => document.getElementById("attachments")?.click()}
                disabled={attachments.length >= 5}
              >
                <Paperclip className="w-4 h-4" />
              </Button>
            </div>

            {/* Attached Files */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
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
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
