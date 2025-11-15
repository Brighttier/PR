"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experienceLevel: string;
  salaryMin: number | null;
  salaryMax: number | null;
  description: string;
  requirements: string[];
  benefits: string[];
  status: "draft" | "published" | "closed" | "paused";
  [key: string]: any;
}

interface EditJobDialogProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditJobDialog({ job, open, onOpenChange, onSuccess }: EditJobDialogProps) {
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
  const [status, setStatus] = useState<"draft" | "published" | "closed" | "paused">("draft");

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Load job data when dialog opens
  useEffect(() => {
    if (job && open) {
      setTitle(job.title);
      setDepartment(job.department || "");
      setLocation(job.location || "");
      setType(job.type || "");
      setExperienceLevel(job.experienceLevel || "");
      setSalaryMin(job.salaryMin?.toString() || "");
      setSalaryMax(job.salaryMax?.toString() || "");
      setDescription(job.description || "");
      setRequirements(job.requirements?.join("\n") || "");
      setBenefits(job.benefits?.join("\n") || "");
      setStatus(job.status || "draft");
    }
  }, [job, open]);

  const handleSubmit = async () => {
    if (!job) return;

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

      const jobRef = doc(db, "jobs", job.id);
      await updateDoc(jobRef, {
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
        updatedAt: serverTimestamp(),
      });

      toast({
        title: "Success!",
        description: "Job updated successfully",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("Error updating job:", err);
      setError("Failed to update job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!job) return;

    setDeleting(true);

    try {
      const jobRef = doc(db, "jobs", job.id);
      await deleteDoc(jobRef);

      toast({
        title: "Job deleted",
        description: "The job posting has been permanently deleted",
      });

      setDeleteDialogOpen(false);
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("Error deleting job:", err);
      toast({
        title: "Error",
        description: "Failed to delete job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (!job) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
            <DialogDescription>Update job posting details</DialogDescription>
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
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    placeholder="e.g., Engineering"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Remote, San Francisco, CA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="type">Job Type *</Label>
                  <Select value={type} onValueChange={setType} disabled={loading}>
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
                  <Select value={experienceLevel} onValueChange={setExperienceLevel} disabled={loading}>
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
                    disabled={loading}
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
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={status}
                    onValueChange={(val) =>
                      setStatus(val as "draft" | "published" | "closed" | "paused")
                    }
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between">
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={loading}
              className="mr-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Job
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the job posting "{job?.title}". This action cannot be
              undone. All associated applications will remain but will be orphaned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Job"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
