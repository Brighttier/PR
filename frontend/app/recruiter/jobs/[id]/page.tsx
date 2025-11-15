"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, query, where, getDocs, orderBy, updateDoc, deleteDoc, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  Users,
  TrendingUp,
  Calendar,
  DollarSign,
  MapPin,
  Briefcase,
  CheckCircle2,
  Clock,
  MoreVertical,
  Mail,
  Download,
  Target,
  Sparkles,
  Copy,
  ExternalLink,
  Pause,
  Play,
  XCircle,
} from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/dialogs/delete-confirmation-dialog";

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experienceLevel: string;
  salaryMin: number | null;
  salaryMax: number | null;
  status: string;
  description: string;
  requirements: string[];
  benefits: string[];
  skills: string[];
  applicants: number;
  views: number;
  createdAt: any;
  companyId: string;
  [key: string]: any;
}

interface Application {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  status: string;
  stage: string;
  appliedAt: any;
  aiAnalysis?: {
    matchScore: number;
    recommendation: string;
  };
}

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const jobId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (jobId) {
      loadJobData();
    }
  }, [jobId]);

  const loadJobData = async () => {
    try {
      setLoading(true);

      // Get job
      const jobRef = doc(db, "jobs", jobId);
      const jobSnap = await getDoc(jobRef);

      if (!jobSnap.exists()) {
        setError("Job not found");
        setLoading(false);
        return;
      }

      const jobData = { id: jobSnap.id, ...jobSnap.data() } as Job;
      setJob(jobData);

      // Get applications
      const applicationsRef = collection(db, "applications");
      const applicationsQuery = query(
        applicationsRef,
        where("jobId", "==", jobId),
        orderBy("appliedAt", "desc")
      );
      const applicationsSnap = await getDocs(applicationsQuery);
      const applicationsData = applicationsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Application[];
      setApplications(applicationsData);

      setLoading(false);
    } catch (err) {
      console.error("Error loading job:", err);
      setError("Failed to load job data");
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!job) return;

    setUpdating(true);
    try {
      const jobRef = doc(db, "jobs", jobId);
      await updateDoc(jobRef, {
        status: newStatus,
        updatedAt: new Date(),
      });

      setJob({ ...job, status: newStatus });

      toast({
        title: "Status updated",
        description: `Job status changed to ${newStatus}`,
      });
    } catch (err) {
      console.error("Error updating status:", err);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!job) return;

    setDeleting(true);
    try {
      await deleteDoc(doc(db, "jobs", jobId));

      toast({
        title: "Job Deleted",
        description: `${job.title} has been deleted successfully.`,
      });

      router.push("/recruiter/jobs");
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        title: "Error",
        description: "Failed to delete job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleDuplicate = async () => {
    if (!job || !userProfile?.companyId) return;

    try {
      const { id, createdAt, updatedAt, applicants, views, ...jobDataToCopy } = job;

      const newJobData = {
        ...jobDataToCopy,
        title: `${job.title} (Copy)`,
        status: "draft",
        createdAt: new Date(),
        updatedAt: new Date(),
        applicants: 0,
        views: 0,
      };

      const jobsRef = collection(db, "jobs");
      const docRef = await addDoc(jobsRef, newJobData);

      toast({
        title: "Job Duplicated",
        description: "A copy of this job has been created as a draft.",
      });

      router.push(`/recruiter/jobs/${docRef.id}`);
    } catch (error) {
      console.error("Error duplicating job:", error);
      toast({
        title: "Error",
        description: "Failed to duplicate job",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      published: "bg-green-50 text-green-700 border-green-200",
      draft: "bg-gray-50 text-gray-700 border-gray-200",
      closed: "bg-red-50 text-red-700 border-red-200",
      paused: "bg-yellow-50 text-yellow-700 border-yellow-200",
    };
    return styles[status.toLowerCase()] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-700 bg-green-50 border-green-200";
    if (score >= 70) return "text-blue-700 bg-blue-50 border-blue-200";
    if (score >= 50) return "text-yellow-700 bg-yellow-50 border-yellow-200";
    return "text-gray-700 bg-gray-50 border-gray-200";
  };

  const getRecommendationBadge = (recommendation: string) => {
    const styles: Record<string, string> = {
      "Strong Hire": "bg-green-50 text-green-700 border-green-200",
      "Hire": "bg-blue-50 text-blue-700 border-blue-200",
      "Consider": "bg-yellow-50 text-yellow-700 border-yellow-200",
      "Not Recommended": "bg-red-50 text-red-700 border-red-200",
    };
    return styles[recommendation] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container max-w-7xl py-8">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container max-w-7xl py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Job not found"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "Applied" || a.status === "Under Review").length,
    interview: applications.filter((a) => a.status === "Interview Scheduled").length,
    avgMatchScore: applications.length > 0
      ? Math.round(
          applications.reduce((acc, a) => acc + (a.aiAnalysis?.matchScore || 0), 0) / applications.length
        )
      : 0,
  };

  return (
    <div className="container max-w-7xl py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>

        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{job.title}</h1>
              <Badge variant="outline" className={`border ${getStatusBadge(job.status)}`}>
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                {job.department}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {job.location}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {job.type} • {job.experienceLevel}
              </div>
              {job.salaryMin && job.salaryMax && (
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={job.status} onValueChange={handleStatusChange} disabled={updating}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/recruiter/jobs/${jobId}/edit`)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Job
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Career Page
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Job
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Applications</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pending Review</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">In Interview</p>
                  <p className="text-2xl font-bold">{stats.interview}</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Avg Match Score</p>
                  <p className="text-2xl font-bold">{stats.avgMatchScore}%</p>
                </div>
                <Target className="w-8 h-8 text-teal-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="description" className="space-y-6">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="applicants">
            Applicants {applications.length > 0 && `(${applications.length})`}
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Description Tab */}
        <TabsContent value="description" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {job.description}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Required Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, idx) => (
                      <Badge key={idx} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Benefits & Perks</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-3 h-3 text-green-600 mt-1 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Applicants Tab */}
        <TabsContent value="applicants">
          {applications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                <p className="text-muted-foreground">
                  Applications will appear here once candidates start applying
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>Match Score</TableHead>
                      <TableHead>Recommendation</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application) => (
                      <TableRow
                        key={application.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => router.push(`/recruiter/applications/${application.id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {application.candidateName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{application.candidateName}</p>
                              <p className="text-sm text-muted-foreground">
                                {application.candidateEmail}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {formatDate(application.appliedAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`border ${getScoreColor(
                              application.aiAnalysis?.matchScore || 0
                            )}`}
                          >
                            {application.aiAnalysis?.matchScore || 0}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`border ${getRecommendationBadge(
                              application.aiAnalysis?.recommendation || "Not Recommended"
                            )}`}
                          >
                            <Sparkles className="w-3 h-3 mr-1" />
                            {application.aiAnalysis?.recommendation || "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{application.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/recruiter/applications/${application.id}`);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                <Mail className="w-4 h-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                <Download className="w-4 h-4 mr-2" />
                                Download Resume
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Job Performance Analytics</CardTitle>
              <CardDescription>Insights about this job posting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Total Views</p>
                  <p className="text-3xl font-bold">{job.views || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Conversion Rate</p>
                  <p className="text-3xl font-bold">
                    {job.views > 0 ? ((job.applicants / job.views) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-6">
                More detailed analytics coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Delete Job Posting"
        description="Are you sure you want to delete this job posting? This will also delete all associated applications."
        itemName={job.title}
        loading={deleting}
        destructiveAction="Delete Job"
      />
    </div>
  );
}
