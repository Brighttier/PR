"use client";

import React, { useState, useEffect } from "react";
import { doc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Edit2, Trash2, Archive, X, Loader2 } from "lucide-react";

interface Job {
  id: string;
  title: string;
  department?: string;
  location?: string;
  type: "Full-time" | "Part-time" | "Contract" | "Internship";
  experienceLevel: "Entry Level" | "Mid Level" | "Senior" | "Lead" | "Executive";
  salaryMin?: number;
  salaryMax?: number;
  description: string;
  requirements?: string;
  benefits?: string;
  requiredSkills?: string[];
  status: "Open" | "Closed" | "Archived";
}

interface EditJobDialogProps {
  job: Job;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
  onDelete?: () => void;
}

export function EditJobDialog({ job, trigger, onSuccess, onDelete }: EditJobDialogProps) {
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: job.title,
    department: job.department || "",
    location: job.location || "",
    type: job.type,
    experienceLevel: job.experienceLevel,
    salaryMin: job.salaryMin?.toString() || "",
    salaryMax: job.salaryMax?.toString() || "",
    description: job.description,
    requirements: job.requirements || "",
    benefits: job.benefits || "",
    requiredSkills: job.requiredSkills || [],
    status: job.status,
  });

  const [skillInput, setSkillInput] = useState("");

  // Update form when job prop changes
  useEffect(() => {
    setFormData({
      title: job.title,
      department: job.department || "",
      location: job.location || "",
      type: job.type,
      experienceLevel: job.experienceLevel,
      salaryMin: job.salaryMin?.toString() || "",
      salaryMax: job.salaryMax?.toString() || "",
      description: job.description,
      requirements: job.requirements || "",
      benefits: job.benefits || "",
      requiredSkills: job.requiredSkills || [],
      status: job.status,
    });
  }, [job]);

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

  // Update job
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
        status: formData.status,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(doc(db, "jobs", job.id), jobData);

      toast({
        title: "Job updated",
        description: `"${formData.title}" has been updated successfully.`,
      });

      setOpen(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error updating job:", error);
      toast({
        title: "Error",
        description: "Failed to update job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Archive job
  const handleArchive = async () => {
    setLoading(true);

    try {
      await updateDoc(doc(db, "jobs", job.id), {
        status: "Archived",
        updatedAt: Timestamp.now(),
      });

      toast({
        title: "Job archived",
        description: `"${job.title}" has been archived.`,
      });

      setShowArchiveDialog(false);
      setOpen(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error archiving job:", error);
      toast({
        title: "Error",
        description: "Failed to archive job.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete job
  const handleDelete = async () => {
    setLoading(true);

    try {
      await deleteDoc(doc(db, "jobs", job.id));

      toast({
        title: "Job deleted",
        description: `"${job.title}" has been deleted permanently.`,
      });

      setShowDeleteDialog(false);
      setOpen(false);

      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        title: "Error",
        description: "Failed to delete job.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline" size="sm">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </DialogTrigger>

        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job Posting</DialogTitle>
            <DialogDescription>Update the job details below.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => handleChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
                <Label htmlFor="type">Job Type</Label>
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
                <Label htmlFor="experienceLevel">Experience Level</Label>
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
              <Label htmlFor="description">
                Job Description <span className="text-red-500">*</span>
              </Label>
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
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                placeholder="List specific requirements..."
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
              <Label htmlFor="benefits">Benefits</Label>
              <Textarea
                id="benefits"
                placeholder="e.g., Health insurance, 401k..."
                value={formData.benefits}
                onChange={(e) => handleChange("benefits", e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            {/* Left side actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowArchiveDialog(true)}
                disabled={loading || job.status === "Archived"}
                className="gap-2"
              >
                <Archive className="w-4 h-4" />
                Archive
              </Button>

              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={loading}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>

            {/* Right side actions */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive this job?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the job from active listings. You can restore it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive} disabled={loading}>
              {loading ? "Archiving..." : "Archive Job"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this job permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job and all associated applications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? "Deleting..." : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
