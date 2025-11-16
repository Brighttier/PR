"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { RecruiterSidebar } from "@/components/recruiter/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Copy,
  Trash2,
  MoreVertical,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  Briefcase,
  Users,
  FileText,
  Globe,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateJobDialog } from "@/components/jobs/create-job-dialog";
import { EditJobDialog } from "@/components/jobs/edit-job-dialog";
import { DeleteConfirmationDialog } from "@/components/dialogs/delete-confirmation-dialog";
import { useToast } from "@/hooks/use-toast";

type JobStatus = "published" | "draft" | "closed" | "paused";

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experienceLevel: string;
  salaryMin: number | null;
  salaryMax: number | null;
  status: JobStatus;
  applicants?: number;
  views?: number;
  createdAt: any;
  updatedAt?: any;
  description: string;
  requirements: string[];
  benefits: string[];
  companyId: string;
  companyName?: string;
}

export default function RecruiterJobsPage() {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load jobs from Firestore
  useEffect(() => {
    loadJobs();
  }, [userProfile?.companyId]);

  const loadJobs = async () => {
    if (!userProfile?.companyId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const jobsRef = collection(db, "jobs");
      const q = query(
        jobsRef,
        where("companyId", "==", userProfile.companyId),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      const jobsData: Job[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Job));

      setJobs(jobsData);
    } catch (error) {
      console.error("Error loading jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setDetailsOpen(true);
  };

  const handleDeleteJob = (job: Job) => {
    setJobToDelete(job);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!jobToDelete) return;

    setIsDeleting(true);
    try {
      const { deleteDoc, doc } = await import("firebase/firestore");
      await deleteDoc(doc(db, "jobs", jobToDelete.id));

      toast({
        title: "Job Deleted",
        description: `${jobToDelete.title} has been deleted successfully.`,
      });

      // Reload jobs
      await loadJobs();
      setShowDeleteDialog(false);
      setJobToDelete(null);
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        title: "Error",
        description: "Failed to delete job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const stats = {
    total: jobs.length,
    published: jobs.filter(j => j.status === "published").length,
    draft: jobs.filter(j => j.status === "draft").length,
    closed: jobs.filter(j => j.status === "closed").length,
    totalApplicants: jobs.reduce((sum, j) => sum + (j.applicants || 0), 0),
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    const matchesDepartment = departmentFilter === "all" || job.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const departments = Array.from(new Set(jobs.map(j => j.department)));

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 border-green-200";
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "closed":
        return "bg-red-100 text-red-800 border-red-200";
      case "paused":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: JobStatus) => {
    switch (status) {
      case "published":
        return <CheckCircle className="w-4 h-4" />;
      case "draft":
        return <FileText className="w-4 h-4" />;
      case "closed":
        return <XCircle className="w-4 h-4" />;
      case "paused":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <RecruiterSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="border-b bg-white sticky top-0 z-10">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">Job Openings</h2>
                <p className="text-muted-foreground">
                  Manage your job postings and attract top talent
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline">
                  <Globe className="w-4 h-4 mr-2" />
                  View Career Page
                </Button>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Post New Job
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-5 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Jobs</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <Briefcase className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Published</p>
                      <p className="text-2xl font-bold">{stats.published}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Drafts</p>
                      <p className="text-2xl font-bold">{stats.draft}</p>
                    </div>
                    <FileText className="w-8 h-8 text-gray-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Applicants</p>
                      <p className="text-2xl font-bold">{stats.totalApplicants}</p>
                    </div>
                    <Users className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Closed</p>
                      <p className="text-2xl font-bold">{stats.closed}</p>
                    </div>
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </header>

        <div className="p-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Jobs</CardTitle>
                  <CardDescription>Manage and track all job postings</CardDescription>
                </div>
                <div className="flex gap-3">
                  <div className="relative w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search jobs..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-muted-foreground mt-4">Loading jobs...</p>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                  <p className="text-muted-foreground mb-4">
                    {jobs.length === 0 ? "Create your first job posting!" : "Try adjusting your filters"}
                  </p>
                  {jobs.length === 0 && (
                    <Button onClick={() => setCreateDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Post New Job
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applicants</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Salary Range</TableHead>
                      <TableHead>Posted</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredJobs.map((job) => (
                    <TableRow key={job.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{job.title}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {job.type} • {job.experienceLevel}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{job.department}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">{job.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`border ${getStatusColor(job.status)}`}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(job.status)}
                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{job.applicants || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                          <span>{job.views || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {job.salaryMin && job.salaryMax
                            ? `$${(job.salaryMin / 1000).toFixed(0)}k - $${(job.salaryMax / 1000).toFixed(0)}k`
                            : "Not specified"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {job.createdAt?.toDate ? new Date(job.createdAt.toDate()).toLocaleDateString() : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewJob(job)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setJobToEdit(job);
                              setEditDialogOpen(true);
                            }}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Job
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteJob(job);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Job Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedJob?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedJob?.department} • {selectedJob?.location}
            </DialogDescription>
          </DialogHeader>

          {selectedJob && (
            <div className="space-y-6">
              {/* Job Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Employment Type</p>
                  <p>{selectedJob.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Experience</p>
                  <p>{selectedJob.experienceLevel}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Salary Range</p>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {selectedJob.salaryMin && selectedJob.salaryMax
                        ? `$${(selectedJob.salaryMin / 1000).toFixed(0)}k - $${(selectedJob.salaryMax / 1000).toFixed(0)}k`
                        : "Not specified"}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
                  <Badge className={`border ${getStatusColor(selectedJob.status)}`}>
                    {selectedJob.status.charAt(0).toUpperCase() + selectedJob.status.slice(1)}
                  </Badge>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold mb-2">Job Description</h4>
                <p className="text-muted-foreground">{selectedJob.description}</p>
              </div>

              {/* Requirements */}
              <div>
                <h4 className="font-semibold mb-2">Requirements</h4>
                <ul className="space-y-1">
                  {selectedJob.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benefits */}
              <div>
                <h4 className="font-semibold mb-2">Benefits</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.benefits.map((benefit, idx) => (
                    <Badge key={idx} variant="outline">
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedJob.applicants || 0}</p>
                  <p className="text-sm text-muted-foreground">Applicants</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedJob.views || 0}</p>
                  <p className="text-sm text-muted-foreground">Views</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  className="flex-1"
                  onClick={() => {
                    setJobToEdit(selectedJob);
                    setDetailsOpen(false);
                    setEditDialogOpen(true);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Job
                </Button>
                <Button variant="outline" className="flex-1">
                  <Users className="w-4 h-4 mr-2" />
                  View Applicants
                </Button>
                <Button variant="outline" className="flex-1">
                  <Globe className="w-4 h-4 mr-2" />
                  Preview on Career Page
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Job Dialog */}
      <CreateJobDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          loadJobs(); // Reload jobs list from Firestore
          setCreateDialogOpen(false);
        }}
      />

      {/* Edit Job Dialog */}
      <EditJobDialog
        job={jobToEdit}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={() => {
          loadJobs(); // Reload jobs list from Firestore
          setEditDialogOpen(false);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        title="Delete Job Posting"
        description="Are you sure you want to delete this job posting? This will also delete all associated applications."
        itemName={jobToDelete?.title}
        loading={isDeleting}
        destructiveAction="Delete Job"
      />
    </div>
  );
}
