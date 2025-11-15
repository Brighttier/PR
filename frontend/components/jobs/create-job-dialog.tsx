"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreateJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateJobDialog({ open, onOpenChange, onSuccess }: CreateJobDialogProps) {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  // Form state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState<string>("");
  const [experienceLevel, setExperienceLevel] = useState<string>("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [benefits, setBenefits] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);

  const handleSubmit = async (status: "draft" | "published") => {
    if (!user || !userProfile?.companyId) {
      setError("You must be logged in to create a job");
      return;
    }

    // Validation
    if (!title.trim()) {
      setError("Job title is required");
      return;
    }

    if (!type) {
      setError("Job type is required");
      return;
    }

    if (!experienceLevel) {
      setError("Experience level is required");
      return;
    }

    if (!description.trim()) {
      setError("Job description is required");
      return;
    }

    // Validate salary range
    if (salaryMin && salaryMax) {
      const min = parseInt(salaryMin);
      const max = parseInt(salaryMax);
      if (min >= max) {
        setError("Minimum salary must be less than maximum salary");
        return;
      }
    }

    setLoading(true);
    setError("");

    try {
      const requirementsArray = requirements
        .split("\n")
        .map((r) => r.trim())
        .filter((r) => r.length > 0);

      const benefitsArray = benefits
        .split("\n")
        .map((b) => b.trim())
        .filter((b) => b.length > 0);

      const jobData = {
        companyId: userProfile.companyId,
        companyName: userProfile.companyName || "Company",
        title: title.trim(),
        department: department.trim() || "General",
        location: location.trim() || "Not specified",
        type,
        experienceLevel,
        salaryMin: salaryMin ? parseInt(salaryMin) : null,
        salaryMax: salaryMax ? parseInt(salaryMax) : null,
        description: description.trim(),
        requirements: requirementsArray,
        benefits: benefitsArray,
        status,
        applicants: 0,
        views: 0,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        createdByName: user.displayName || user.email,
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "jobs"), jobData);

      toast({
        title: "Success!",
        description: `Job ${status === "published" ? "published" : "saved as draft"} successfully`,
      });

      // Reset form
      setTitle("");
      setDepartment("");
      setLocation("");
      setType("");
      setExperienceLevel("");
      setSalaryMin("");
      setSalaryMax("");
      setDescription("");
      setRequirements("");
      setBenefits("");

      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("Error creating job:", err);
      setError("Failed to create job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!title.trim()) {
      setError("Please enter a job title first");
      return;
    }

    setAiGenerating(true);
    setError("");

    try {
      // TODO: Integrate with AI service to generate job description
      // For now, using placeholder text
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const generatedDescription = `We are seeking a talented ${title} to join our ${department || "team"}.

Key Responsibilities:
- Lead and contribute to innovative projects
- Collaborate with cross-functional teams
- Drive technical excellence and best practices
- Mentor junior team members

What We're Looking For:
- Strong technical skills and problem-solving abilities
- Excellent communication and collaboration skills
- Passion for continuous learning and improvement
- Experience with modern development practices`;

      const generatedRequirements = `${experienceLevel || "3+ years"} of relevant experience
Strong technical foundation
Excellent communication skills
Team player with leadership qualities`;

      const generatedBenefits = `Competitive salary and equity
Health insurance and wellness benefits
Flexible work arrangements
Learning and development budget
Collaborative and inclusive culture`;

      setDescription(generatedDescription);
      setRequirements(generatedRequirements);
      setBenefits(generatedBenefits);

      toast({
        title: "AI Generated!",
        description: "Job description generated. You can edit it before publishing.",
      });
    } catch (err) {
      console.error("Error generating with AI:", err);
      setError("Failed to generate job description. Please try manually.");
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post New Job</DialogTitle>
          <DialogDescription>
            Create a new job posting to attract top talent
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Senior Frontend Developer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading || aiGenerating}
                />
              </div>

              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  placeholder="e.g., Engineering"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  disabled={loading || aiGenerating}
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Remote, San Francisco, CA"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={loading || aiGenerating}
                />
              </div>

              <div>
                <Label htmlFor="type">Job Type *</Label>
                <Select value={type} onValueChange={setType} disabled={loading || aiGenerating}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="experience">Experience Level *</Label>
                <Select
                  value={experienceLevel}
                  onValueChange={setExperienceLevel}
                  disabled={loading || aiGenerating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Entry Level">Entry Level (0-2 years)</SelectItem>
                    <SelectItem value="Mid Level">Mid Level (2-5 years)</SelectItem>
                    <SelectItem value="Senior">Senior (5-8 years)</SelectItem>
                    <SelectItem value="Lead">Lead (8-12 years)</SelectItem>
                    <SelectItem value="Executive">Executive (12+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="salaryMin">Minimum Salary</Label>
                <Input
                  id="salaryMin"
                  type="number"
                  placeholder="e.g., 100000"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  disabled={loading || aiGenerating}
                />
              </div>

              <div>
                <Label htmlFor="salaryMax">Maximum Salary</Label>
                <Input
                  id="salaryMax"
                  type="number"
                  placeholder="e.g., 150000"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  disabled={loading || aiGenerating}
                />
              </div>
            </div>
          </div>

          {/* AI Generate Button */}
          <div className="flex items-center justify-between border-t border-b py-3">
            <div>
              <p className="text-sm font-medium">AI Job Description Generator</p>
              <p className="text-xs text-muted-foreground">
                Let AI create a professional job description based on your inputs
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleAIGenerate}
              disabled={!title.trim() || loading || aiGenerating}
            >
              {aiGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate with AI
                </>
              )}
            </Button>
          </div>

          {/* Job Description */}
          <div>
            <Label htmlFor="description">Job Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide a detailed description of the role, responsibilities, and requirements"
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading || aiGenerating}
            />
          </div>

          {/* Requirements */}
          <div>
            <Label htmlFor="requirements">Requirements (one per line)</Label>
            <Textarea
              id="requirements"
              placeholder="e.g., 5+ years React experience&#10;TypeScript proficiency&#10;System design knowledge"
              rows={5}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              disabled={loading || aiGenerating}
            />
          </div>

          {/* Benefits */}
          <div>
            <Label htmlFor="benefits">Benefits (one per line)</Label>
            <Textarea
              id="benefits"
              placeholder="e.g., Health insurance&#10;401k matching&#10;Remote work&#10;Flexible hours"
              rows={4}
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
              disabled={loading || aiGenerating}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSubmit("draft")}
            disabled={loading || aiGenerating}
          >
            Save as Draft
          </Button>
          <Button onClick={() => handleSubmit("published")} disabled={loading || aiGenerating}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              "Publish Job"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
