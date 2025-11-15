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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Sparkles, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CreateTemplateDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: (templateId: string) => void;
}

const TEMPLATE_TYPES = [
  { value: "email", label: "Email Template" },
  { value: "interview_questions", label: "Interview Questions Template" },
  { value: "job_description", label: "Job Description Template" },
];

const EMAIL_CATEGORIES = [
  { value: "application_response", label: "Application Response" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "rejection", label: "Rejection" },
  { value: "general", label: "General" },
];

const AVAILABLE_VARIABLES = [
  { key: "{{candidateName}}", description: "Candidate's name" },
  { key: "{{jobTitle}}", description: "Job title" },
  { key: "{{companyName}}", description: "Company name" },
  { key: "{{interviewDate}}", description: "Interview date" },
  { key: "{{interviewTime}}", description: "Interview time" },
  { key: "{{meetingLink}}", description: "Meeting link" },
];

export function CreateTemplateDialog({
  trigger,
  onSuccess,
}: CreateTemplateDialogProps) {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "email" as "email" | "interview_questions" | "job_description",
    category: "general",
    subject: "",
    content: "",
  });

  // Handle AI content generation
  const handleAIGenerate = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a template name first.",
        variant: "destructive",
      });
      return;
    }

    setAiGenerating(true);

    try {
      // TODO: Call AI service to generate template content
      let generatedContent = "";

      if (formData.type === "email") {
        // Generate email template
        const subjectLine =
          formData.category === "interview"
            ? "Interview Invitation - {{jobTitle}} at {{companyName}}"
            : formData.category === "offer"
            ? "Job Offer - {{jobTitle}} at {{companyName}}"
            : formData.category === "rejection"
            ? "Application Update - {{jobTitle}}"
            : "Update on Your Application - {{jobTitle}}";

        generatedContent = `Dear {{candidateName}},

Thank you for your interest in the {{jobTitle}} position at {{companyName}}.

[Your message content here...]

Best regards,
{{companyName}} Team`;

        setFormData((prev) => ({
          ...prev,
          subject: subjectLine,
          content: generatedContent,
        }));
      } else if (formData.type === "interview_questions") {
        generatedContent = `Interview Questions Template: ${formData.name}

1. Can you tell me about yourself and your background?

2. Why are you interested in this role at our company?

3. What are your key strengths that make you a good fit?

4. Can you describe a challenging project you've worked on?

5. How do you handle tight deadlines and pressure?

6. What are your salary expectations?

7. Do you have any questions for us?`;

        setFormData((prev) => ({ ...prev, content: generatedContent }));
      } else if (formData.type === "job_description") {
        generatedContent = `Job Title: [Position Title]

Company Overview:
{{companyName}} is [brief company description].

Role Overview:
We are seeking a [position] to join our [team/department].

Key Responsibilities:
- [Responsibility 1]
- [Responsibility 2]
- [Responsibility 3]

Requirements:
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

Benefits:
- [Benefit 1]
- [Benefit 2]
- [Benefit 3]`;

        setFormData((prev) => ({ ...prev, content: generatedContent }));
      }

      toast({
        title: "Content generated",
        description: "AI has generated template content. Feel free to customize it.",
      });
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        title: "Error",
        description: "Failed to generate content.",
        variant: "destructive",
      });
    } finally {
      setAiGenerating(false);
    }
  };

  // Insert variable into content
  const insertVariable = (variable: string) => {
    setFormData((prev) => ({
      ...prev,
      content: prev.content + variable,
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast({
        title: "Validation error",
        description: "Template name is required.",
        variant: "destructive",
      });
      return;
    }

    if (formData.type === "email" && !formData.subject.trim()) {
      toast({
        title: "Validation error",
        description: "Email subject is required for email templates.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.content.trim()) {
      toast({
        title: "Validation error",
        description: "Template content is required.",
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
      const templateData = {
        name: formData.name.trim(),
        type: formData.type,
        category: formData.type === "email" ? formData.category : null,
        subject: formData.type === "email" ? formData.subject.trim() : null,
        content: formData.content.trim(),
        companyId: userProfile.companyId,
        createdBy: user?.uid,
        createdByName: userProfile.displayName || user?.email,
        status: "active",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, "templates"), templateData);

      toast({
        title: "Template created",
        description: `"${formData.name}" has been created successfully.`,
      });

      // Reset form
      setFormData({
        name: "",
        type: "email",
        category: "general",
        subject: "",
        content: "",
      });

      setOpen(false);

      if (onSuccess) {
        onSuccess(docRef.id);
      }
    } catch (error) {
      console.error("Error creating template:", error);
      toast({
        title: "Error",
        description: "Failed to create template. Please try again.",
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
            <FileText className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Template</DialogTitle>
          <DialogDescription>
            Create a reusable template for emails, interview questions, or job descriptions.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="py-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Template Details</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            {/* Template Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Template Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Interview Invitation Template"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            {/* Template Type */}
            <div className="space-y-2">
              <Label htmlFor="type">
                Template Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) =>
                  setFormData((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category (for email templates only) */}
            {formData.type === "email" && (
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EMAIL_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Subject Line (for email templates only) */}
            {formData.type === "email" && (
              <div className="space-y-2">
                <Label htmlFor="subject">
                  Subject Line <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="subject"
                  placeholder="Enter email subject"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, subject: e.target.value }))
                  }
                />
              </div>
            )}

            {/* Available Variables */}
            {formData.type === "email" && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Available Variables
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Click a variable to insert it into the template</p>
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
            )}

            {/* Template Content */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content">
                  Template Content <span className="text-red-500">*</span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAIGenerate}
                  disabled={aiGenerating || !formData.name}
                  className="gap-2"
                >
                  {aiGenerating ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      AI Generate
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                id="content"
                placeholder="Enter template content..."
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                rows={12}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {formData.content.length} characters
              </p>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            {/* Preview Subject */}
            {formData.type === "email" && formData.subject && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Subject Preview</Label>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">{formData.subject}</p>
                </div>
              </div>
            )}

            {/* Preview Content */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Content Preview</Label>
              <div className="p-4 bg-muted rounded-md whitespace-pre-wrap min-h-[300px]">
                {formData.content || (
                  <p className="text-muted-foreground italic">
                    Template content will appear here...
                  </p>
                )}
              </div>
            </div>

            {/* Variable Info */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Variables will be replaced with actual values when
                the template is used.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Create Template
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
