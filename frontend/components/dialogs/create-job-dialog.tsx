"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Sparkles, Plus, X, Loader2 } from "lucide-react";

interface CreateJobDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: (jobId: string) => void;
}

export function CreateJobDialog({ trigger, onSuccess }: CreateJobDialogProps) {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    type: "Full-time" as "Full-time" | "Part-time" | "Contract" | "Internship",
    experienceLevel: "Mid Level" as "Entry Level" | "Mid Level" | "Senior" | "Lead" | "Executive",
    salaryMin: "",
    salaryMax: "",
    description: "",
    requirements: "",
    benefits: "",
    requiredSkills: [] as string[],
  });

  const [skillInput, setSkillInput] = useState("");

  // Handle form changes
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Add skill tag
  const addSkill = () => {
    if (skillInput.trim() && !formData.requiredSkills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  // Remove skill tag
  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter((s) => s !== skill),
    }));
  };

  // AI Generate Job Description
  const handleAIGenerate = async () => {
    if (!formData.title) {
      toast({
        title: "Missing information",
        description: "Please provide a job title first.",
        variant: "destructive",
      });
      return;
    }

    setAiGenerating(true);

    try {
      // TODO: Call AI service to generate job description
      // For now, use a placeholder
      const generatedDescription = `We are seeking a talented ${formData.title} to join our ${
        formData.department || "team"
      }. This is a ${formData.type.toLowerCase()} position requiring ${
        formData.experienceLevel.toLowerCase()
      } experience.

Key Responsibilities:
- Lead development of innovative solutions
- Collaborate with cross-functional teams
- Mentor junior team members
- Drive technical excellence

Requirements:
- ${formData.experienceLevel} experience in relevant field
- Strong technical and communication skills
- Passion for continuous learning

We offer competitive compensation, comprehensive benefits, and opportunities for growth.`;

      setFormData((prev) => ({
        ...prev,
        description: generatedDescription,
      }));

      toast({
        title: "Description generated",
        description: "AI has generated a job description. Feel free to customize it.",
      });
    } catch (error) {
      console.error("Error generating description:", error);
      toast({
        title: "Error",
        description: "Failed to generate description.",
        variant: "destructive",
      });
    } finally {
      setAiGenerating(false);
    }
  };

  // Submit job
  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      toast({
        title: "Validation error",
        description: "Job title is required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Validation error",
        description: "Job description is required.",
        variant: "destructive",
      });
      return;
    }

    if (formData.salaryMin && formData.salaryMax) {
      const min = parseInt(formData.salaryMin);
      const max = parseInt(formData.salaryMax);
      if (min > max) {
        toast({
          title: "Validation error",
          description: "Minimum salary cannot be greater than maximum salary.",
          variant: "destructive",
        });
        return;
      }
    }

    if (!user || !userProfile?.companyId) {
      toast({
        title: "Error",
        description: "You must be logged in to create a job.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const jobData = {
        title: formData.title.trim(),
        department: formData.department.trim() || null,
        location: formData.location.trim() || "Remote",
        type: formData.type,
        experienceLevel: formData.experienceLevel,
        salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
        description: formData.description.trim(),
        requirements: formData.requirements.trim() || null,
        benefits: formData.benefits.trim() || null,
        requiredSkills: formData.requiredSkills,

        // Metadata
        companyId: userProfile.companyId,
        createdBy: user.uid,
        createdByName: userProfile.displayName || user.email,
        status: "Open" as const,
        applicants: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, "jobs"), jobData);

      toast({
        title: "Job created",
        description: `"${formData.title}" has been posted successfully.`,
      });

      // Reset form
      setFormData({
        title: "",
        department: "",
        location: "",
        type: "Full-time",
        experienceLevel: "Mid Level",
        salaryMin: "",
        salaryMax: "",
        description: "",
        requirements: "",
        benefits: "",
        requiredSkills: [],
      });

      setOpen(false);

      if (onSuccess) {
        onSuccess(docRef.id);
      } else {
        router.push(`/dashboard/jobs/${docRef.id}`);
      }
    } catch (error) {
      console.error("Error creating job:", error);
      toast({
        title: "Error",
        description: "Failed to create job. Please try again.",
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
            <Plus className="w-4 h-4 mr-2" />
            Create Job
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Job Posting</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new job posting. Use AI to generate a description.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Job Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Job Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Senior Frontend Developer"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />
          </div>

          {/* Department and Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                placeholder="e.g., Engineering"
                value={formData.department}
                onChange={(e) => handleChange("department", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Remote, San Francisco, CA"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
              />
            </div>
          </div>

          {/* Job Type and Experience Level */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">
                Job Type <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.type} onValueChange={(value: any) => handleChange("type", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experienceLevel">
                Experience Level <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.experienceLevel}
                onValueChange={(value: any) => handleChange("experienceLevel", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Entry Level">Entry Level</SelectItem>
                  <SelectItem value="Mid Level">Mid Level</SelectItem>
                  <SelectItem value="Senior">Senior</SelectItem>
                  <SelectItem value="Lead">Lead</SelectItem>
                  <SelectItem value="Executive">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Salary Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salaryMin">Minimum Salary</Label>
              <Input
                id="salaryMin"
                type="number"
                placeholder="e.g., 120000"
                value={formData.salaryMin}
                onChange={(e) => handleChange("salaryMin", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salaryMax">Maximum Salary</Label>
              <Input
                id="salaryMax"
                type="number"
                placeholder="e.g., 150000"
                value={formData.salaryMax}
                onChange={(e) => handleChange("salaryMax", e.target.value)}
              />
            </div>
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">
                Job Description <span className="text-red-500">*</span>
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAIGenerate}
                disabled={aiGenerating || !formData.title}
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
              id="description"
              placeholder="Describe the role, responsibilities, and requirements..."
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={8}
            />
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements (optional)</Label>
            <Textarea
              id="requirements"
              placeholder="List specific requirements, qualifications, or certifications..."
              value={formData.requirements}
              onChange={(e) => handleChange("requirements", e.target.value)}
              rows={4}
            />
          </div>

          {/* Required Skills */}
          <div className="space-y-2">
            <Label htmlFor="skills">Required Skills</Label>
            <div className="flex gap-2">
              <Input
                id="skills"
                placeholder="e.g., React, TypeScript"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addSkill}>
                Add
              </Button>
            </div>

            {/* Skills tags */}
            {formData.requiredSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.requiredSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            <Label htmlFor="benefits">Benefits (optional)</Label>
            <Textarea
              id="benefits"
              placeholder="e.g., Health insurance, 401k, Flexible hours, Remote work..."
              value={formData.benefits}
              onChange={(e) => handleChange("benefits", e.target.value)}
              rows={3}
            />
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
                Creating...
              </>
            ) : (
              "Create Job"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
