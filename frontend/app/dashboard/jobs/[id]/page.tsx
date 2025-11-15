"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditJobDialog } from "@/components/dialogs/edit-job-dialog";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  DollarSign,
  Users,
  Calendar,
  Clock,
  ExternalLink,
  Edit2,
  Loader2,
  TrendingUp,
  Eye,
} from "lucide-react";
import { format } from "date-fns";

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
  applicants: number;
  createdAt: any;
  updatedAt: any;
  createdByName?: string;
}

interface Application {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  status: string;
  stage: string;
  matchScore?: number;
  aiRecommendation?: string;
  appliedAt: any;
}

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);

  // Load job and applications
  useEffect(() => {
    const loadData = async () => {
      if (!jobId) return;

      setLoading(true);

      try {
        // Load job
        const jobDoc = await getDoc(doc(db, "jobs", jobId));

        if (!jobDoc.exists()) {
          router.push("/dashboard/jobs");
          return;
        }

        const jobData = { id: jobDoc.id, ...jobDoc.data() } as Job;
        setJob(jobData);

        // Load applications
        const applicationsQuery = query(
          collection(db, "applications"),
          where("jobId", "==", jobId),
          orderBy("appliedAt", "desc")
        );

        const applicationsSnapshot = await getDocs(applicationsQuery);
        const applicationsData: Application[] = applicationsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Application));

        setApplications(applicationsData);
      } catch (error) {
        console.error("Error loading job data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [jobId, router]);

  // Refresh job after edit
  const handleJobUpdate = async () => {
    if (!jobId) return;

    const jobDoc = await getDoc(doc(db, "jobs", jobId));
    if (jobDoc.exists()) {
      setJob({ id: jobDoc.id, ...jobDoc.data() } as Job);
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; className: string }> = {
      Open: { variant: "default", className: "bg-green-100 text-green-700 border-green-200" },
      Closed: { variant: "secondary", className: "" },
      Archived: { variant: "outline", className: "" },
    };

    const config = statusConfig[status] || { variant: "default", className: "" };

    return (
      <Badge variant={config.variant as any} className={config.className}>
        {status}
      </Badge>
    );
  };

  // Get AI recommendation badge
  const getRecommendationBadge = (recommendation?: string) => {
    if (!recommendation) return null;

    const config: Record<string, { className: string }> = {
      "Fast Track": { className: "bg-green-100 text-green-700 border-green-200" },
      "Strong Candidate": { className: "bg-green-50 text-green-600 border-green-100" },
      "Worth Reviewing": { className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      "Marginal Fit": { className: "bg-gray-50 text-gray-600 border-gray-200" },
      "Not Recommended": { className: "bg-red-50 text-red-700 border-red-200" },
    };

    const style = config[recommendation] || config["Worth Reviewing"];

    return (
      <Badge variant="outline" className={style.className}>
        {recommendation}
      </Badge>
    );
  };

  // Format salary
  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "Not specified";
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `$${min.toLocaleString()}+`;
    return `Up to $${max?.toLocaleString()}`;
  };

  // Calculate application stats
  const stats = {
    total: applications.length,
    topMatches: applications.filter((a) => (a.matchScore || 0) >= 70).length,
    avgMatchScore:
      applications.length > 0
        ? Math.round(
            applications.reduce((sum, a) => sum + (a.matchScore || 0), 0) / applications.length
          )
        : 0,
    fastTrack: applications.filter((a) => a.aiRecommendation === "Fast Track").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Job not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/jobs")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{job.title}</h1>
              {getStatusBadge(job.status)}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                <span>{job.department || "General"}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{job.location || "Remote"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{job.type}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{job.applicants || 0} applicants</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  Posted {job.createdAt?.toDate ? format(job.createdAt.toDate(), "MMM d, yyyy") : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <a href={`/careers/${job.id}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Public Page
            </a>
          </Button>

          <EditJobDialog job={job} onSuccess={handleJobUpdate} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Applicants</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top Matches</p>
                <p className="text-2xl font-bold text-green-600">{stats.topMatches}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Match Score</p>
                <p className="text-2xl font-bold">{stats.avgMatchScore}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fast Track</p>
                <p className="text-2xl font-bold text-green-600">{stats.fastTrack}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="applicants" className="space-y-4">
        <TabsList>
          <TabsTrigger value="applicants">
            Applicants ({applications.length})
          </TabsTrigger>
          <TabsTrigger value="details">Job Details</TabsTrigger>
        </TabsList>

        {/* Applicants Tab */}
        <TabsContent value="applicants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Applicants</CardTitle>
              <CardDescription>
                Review and manage applications for this position
              </CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No applicants yet</h3>
                  <p className="text-muted-foreground">
                    Applications will appear here once candidates apply.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Match Score</TableHead>
                      <TableHead>AI Recommendation</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application) => (
                      <TableRow
                        key={application.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => router.push(`/dashboard/applications/${application.id}`)}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">{application.candidateName}</p>
                            <p className="text-sm text-muted-foreground">
                              {application.candidateEmail}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {application.matchScore !== undefined ? (
                            <Badge
                              variant="outline"
                              className={
                                application.matchScore >= 90
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : application.matchScore >= 70
                                  ? "bg-green-50 text-green-600 border-green-100"
                                  : application.matchScore >= 50
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                  : "bg-gray-50 text-gray-600 border-gray-200"
                              }
                            >
                              {application.matchScore}%
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {getRecommendationBadge(application.aiRecommendation) || (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{application.status}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {application.appliedAt?.toDate
                            ? format(application.appliedAt.toDate(), "MMM d, yyyy")
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/dashboard/applications/${application.id}`);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Job Details Tab */}
        <TabsContent value="details" className="space-y-4">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Experience Level</p>
                  <p className="font-medium">{job.experienceLevel}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Employment Type</p>
                  <p className="font-medium">{job.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Salary Range</p>
                  <p className="font-medium">{formatSalary(job.salaryMin, job.salaryMax)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div>{getStatusBadge(job.status)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{job.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          {job.requirements && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{job.requirements}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {job.requiredSkills && job.requiredSkills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Benefits */}
          {job.benefits && (
            <Card>
              <CardHeader>
                <CardTitle>Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{job.benefits}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
