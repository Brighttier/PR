"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Loader2,
  Plus,
  X,
  Sparkles,
  DollarSign,
  MapPin,
  Briefcase,
  FileText,
  Users,
  CheckCircle2,
  Gift,
  AlertCircle,
} from "lucide-react";

const jobTypes = ["Full-time", "Part-time", "Contract", "Internship"];
const experienceLevels = ["Entry Level", "Mid Level", "Senior", "Lead", "Executive"];
const departments = [
  "Engineering",
  "Product",
  "Design",
  "Marketing",
  "Sales",
  "Customer Success",
  "Operations",
  "Finance",
  "Human Resources",
  "Legal",
  "Other",
];

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const jobId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    type: "Full-time",
    experienceLevel: "Mid Level",
    salaryMin: "",
    salaryMax: "",
    description: "",
    requirements: [] as string[],
    benefits: [] as string[],
    skills: [] as string[],
  });

  // Temporary input fields for arrays
  const [requirementInput, setRequirementInput] = useState("");
  const [benefitInput, setBenefitInput] = useState("");
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    loadJob();
  }, [jobId]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const jobRef = doc(db, "jobs", jobId);
      const jobSnap = await getDoc(jobRef);

      if (!jobSnap.exists()) {
        setError("Job not found");
        setLoading(false);
        return;
      }

      const jobData = jobSnap.data();
      setFormData({
        title: jobData.title || "",
        department: jobData.department || "",
        location: jobData.location || "",
        type: jobData.type || "Full-time",
        experienceLevel: jobData.experienceLevel || "Mid Level",
        salaryMin: jobData.salaryMin?.toString() || "",
        salaryMax: jobData.salaryMax?.toString() || "",
        description: jobData.description || "",
        requirements: jobData.requirements || [],
        benefits: jobData.benefits || [],
        skills: jobData.skills || [],
      });

      setLoading(false);
    } catch (err) {
      console.error("Error loading job:", err);
      setError("Failed to load job data");
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addArrayItem = (field: "requirements" | "benefits" | "skills", value: string) => {
    if (!value.trim()) return;
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], value.trim()],
    }));
    // Clear input
    if (field === "requirements") setRequirementInput("");
    if (field === "benefits") setBenefitInput("");
    if (field === "skills") setSkillInput("");
  };

  const removeArrayItem = (field: "requirements" | "benefits" | "skills", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      toast({
        title: "Missing required fields",
        description: "Please fill in job title and description",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const jobRef = doc(db, "jobs", jobId);
      const updateData = {
        title: formData.title,
        department: formData.department,
        location: formData.location,
        type: formData.type,
        experienceLevel: formData.experienceLevel,
        salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
        description: formData.description,
        requirements: formData.requirements,
        benefits: formData.benefits,
        skills: formData.skills,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(jobRef, updateData);

      toast({
        title: "Job Updated",
        description: "Your changes have been saved successfully",
      });

      router.push(`/recruiter/jobs/${jobId}`);
    } catch (error) {
      console.error("Error updating job:", error);
      toast({
        title: "Error",
        description: "Failed to update job posting",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading job...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold mb-2">Edit Job</h1>
        <p className="text-muted-foreground">
          Update the job posting details
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Essential details about the position</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Job Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Senior Frontend Developer"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleInputChange("department", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location
                </Label>
                <Input
                  id="location"
                  placeholder="e.g., Remote, San Francisco, CA"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Employment Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience Level</Label>
                <Select
                  value={formData.experienceLevel}
                  onValueChange={(value) => handleInputChange("experienceLevel", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                <DollarSign className="w-4 h-4 inline mr-1" />
                Salary Range (Annual)
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="Min (e.g., 80000)"
                  value={formData.salaryMin}
                  onChange={(e) => handleInputChange("salaryMin", e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Max (e.g., 120000)"
                  value={formData.salaryMax}
                  onChange={(e) => handleInputChange("salaryMax", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Description */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Job Description
            </CardTitle>
            <CardDescription>Detailed description of the role</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Describe the role, responsibilities, and what makes this opportunity unique..."
              rows={10}
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              required
            />
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Requirements
            </CardTitle>
            <CardDescription>Key qualifications and skills needed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a requirement (e.g., 5+ years of React experience)"
                value={requirementInput}
                onChange={(e) => setRequirementInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addArrayItem("requirements", requirementInput);
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => addArrayItem("requirements", requirementInput)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {formData.requirements.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.requirements.map((req, index) => (
                  <Badge key={index} variant="secondary" className="gap-2">
                    {req}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeArrayItem("requirements", index)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Required Skills
            </CardTitle>
            <CardDescription>Technical and soft skills</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill (e.g., React, TypeScript, Leadership)"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addArrayItem("skills", skillInput);
                  }
                }}
              />
              <Button type="button" onClick={() => addArrayItem("skills", skillInput)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="gap-2">
                    {skill}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeArrayItem("skills", index)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Benefits & Perks
            </CardTitle>
            <CardDescription>What you offer to employees</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a benefit (e.g., Health insurance, 401k, Remote work)"
                value={benefitInput}
                onChange={(e) => setBenefitInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addArrayItem("benefits", benefitInput);
                  }
                }}
              />
              <Button type="button" onClick={() => addArrayItem("benefits", benefitInput)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {formData.benefits.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.benefits.map((benefit, index) => (
                  <Badge key={index} variant="secondary" className="gap-2">
                    {benefit}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeArrayItem("benefits", index)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={saving}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving} className="flex-1">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
