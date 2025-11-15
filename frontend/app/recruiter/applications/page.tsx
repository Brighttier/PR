"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { RecruiterSidebar } from "@/components/recruiter/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Download,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Eye,
  FileText,
  Calendar,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Download as DownloadIcon,
  ThumbsUp,
  ThumbsDown,
  Send,
  Users,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type ApplicationStatus =
  | "Applied"
  | "Under Review"
  | "Screening Scheduled"
  | "Technical Interview Scheduled"
  | "Interview Scheduled"
  | "Offer Extended"
  | "Hired"
  | "Rejected"
  | "Withdrawn";

interface Application {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  appliedAt: any;
  status: ApplicationStatus;
  stage: string;
  resumeUrl?: string;
  coverLetter?: string;
  aiAnalysis?: {
    matchScore: number;
    recommendation: string;
    oneLiner?: string;
    executiveSummary?: string;
    strengths: string[];
    redFlags?: string[];
  };
  createdAt?: any;
  updatedAt?: any;
}

export default function RecruiterApplicationsPage() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [matchScoreFilter, setMatchScoreFilter] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load applications from Firestore
  useEffect(() => {
    loadApplications();
  }, [userProfile?.companyId]);

  const loadApplications = async () => {
    if (!userProfile?.companyId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const applicationsRef = collection(db, "applications");
      const q = query(
        applicationsRef,
        where("companyId", "==", userProfile.companyId),
        orderBy("appliedAt", "desc")
      );

      const snapshot = await getDocs(q);
      const applicationsData: Application[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Application));

      setApplications(applicationsData);

      // Extract unique job titles for filter
      const uniqueJobs = Array.from(new Set(applicationsData.map(app => app.jobTitle)));
      setJobs(uniqueJobs);
    } catch (error) {
      console.error("Error loading applications:", error);
    } finally {
      setLoading(false);
    }
  };


  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "Applied" || a.status === "Under Review").length,
    interview: applications.filter((a) =>
      a.status === "Interview Scheduled" ||
      a.status === "Screening Scheduled" ||
      a.status === "Technical Interview Scheduled"
    ).length,
    offer: applications.filter((a) => a.status === "Offer Extended").length,
    hired: applications.filter((a) => a.status === "Hired").length,
    avgMatchScore: applications.length > 0
      ? Math.round(
          applications.reduce((acc, a) => acc + (a.aiAnalysis?.matchScore || 0), 0) / applications.length
        )
      : 0,
  };

  const filteredApplications = applications.filter((application) => {
    const matchesSearch =
      application.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      application.candidateEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      application.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || application.status === statusFilter;

    const matchesJob =
      jobFilter === "all" || application.jobTitle === jobFilter;

    const matchScore = application.aiAnalysis?.matchScore || 0;
    const matchesMatchScore =
      matchScoreFilter === "all" ||
      (matchScoreFilter === "high" && matchScore >= 85) ||
      (matchScoreFilter === "medium" && matchScore >= 70 && matchScore < 85) ||
      (matchScoreFilter === "low" && matchScore < 70);

    return matchesSearch && matchesStatus && matchesJob && matchesMatchScore;
  });

  const handleViewApplication = (application: Application) => {
    // Navigate to dedicated application details page
    router.push(`/recruiter/applications/${application.id}`);
  };

  const handleSendEmail = (application: Application) => {
    setSelectedApplication(application);
    setEmailSubject(`Re: Your application for ${application.jobTitle}`);
    setEmailBody(`Dear ${application.candidateName.split(" ")[0]},\n\nThank you for your application for the ${application.jobTitle} position.\n\nBest regards,\nHiring Team`);
    setShowEmailDialog(true);
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    const styles: Record<string, string> = {
      "Applied": "bg-blue-50 text-blue-700 border-blue-200",
      "Under Review": "bg-yellow-50 text-yellow-700 border-yellow-200",
      "Screening Scheduled": "bg-purple-50 text-purple-700 border-purple-200",
      "Technical Interview Scheduled": "bg-purple-50 text-purple-700 border-purple-200",
      "Interview Scheduled": "bg-purple-50 text-purple-700 border-purple-200",
      "Offer Extended": "bg-orange-50 text-orange-700 border-orange-200",
      "Hired": "bg-green-50 text-green-700 border-green-200",
      "Rejected": "bg-red-50 text-red-700 border-red-200",
      "Withdrawn": "bg-gray-50 text-gray-700 border-gray-200",
    };
    return styles[status] || "bg-gray-50 text-gray-700 border-gray-200";
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

  return (
    <div className="flex h-screen bg-gray-50">
      <RecruiterSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Applications</h1>
                <p className="text-muted-foreground">
                  Review and manage all job applications
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-6 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <FileText className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Pending</p>
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
                      <p className="text-sm text-muted-foreground mb-1">Interview</p>
                      <p className="text-2xl font-bold">{stats.interview}</p>
                    </div>
                    <Users className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Offer</p>
                      <p className="text-2xl font-bold">{stats.offer}</p>
                    </div>
                    <Send className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Hired</p>
                      <p className="text-2xl font-bold">{stats.hired}</p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Avg Match</p>
                      <p className="text-2xl font-bold">{stats.avgMatchScore}%</p>
                    </div>
                    <Target className="w-8 h-8 text-teal-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by candidate name, email, or job title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Applied">Applied</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Screening Scheduled">Screening Scheduled</SelectItem>
                  <SelectItem value="Interview Scheduled">Interview Scheduled</SelectItem>
                  <SelectItem value="Offer Extended">Offer Extended</SelectItem>
                  <SelectItem value="Hired">Hired</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={jobFilter} onValueChange={setJobFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Job" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  {jobs.map((job) => (
                    <SelectItem key={job} value={job}>
                      {job}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={matchScoreFilter} onValueChange={setMatchScoreFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Match Score" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scores</SelectItem>
                  <SelectItem value="high">High (85%+)</SelectItem>
                  <SelectItem value="medium">Medium (70-84%)</SelectItem>
                  <SelectItem value="low">Low (&lt;70%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Applications Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-muted-foreground mt-4">Loading applications...</p>
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No applications found</h3>
                  <p className="text-muted-foreground mb-4">
                    {applications.length === 0
                      ? "No applications submitted yet"
                      : "Try adjusting your search or filters"}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Job</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>Match Score</TableHead>
                      <TableHead>AI Recommendation</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((application) => (
                    <TableRow
                      key={application.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleViewApplication(application)}
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
                        <p className="font-medium text-sm">{application.jobTitle}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {application.appliedAt?.toDate
                            ? new Date(application.appliedAt.toDate()).toLocaleDateString()
                            : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${
                            (application.aiAnalysis?.matchScore || 0) >= 90
                              ? "bg-green-50 text-green-700 border-green-200"
                              : (application.aiAnalysis?.matchScore || 0) >= 80
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : (application.aiAnalysis?.matchScore || 0) >= 70
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : "bg-gray-50 text-gray-700 border-gray-200"
                          }`}
                        >
                          <Target className="w-3 h-3 mr-1" />
                          {application.aiAnalysis?.matchScore || 0}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getRecommendationBadge(
                            application.aiAnalysis?.recommendation || "Not Recommended"
                          )}
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          {application.aiAnalysis?.recommendation || "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusBadge(application.status)}
                        >
                          {application.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {application.stage}
                        </span>
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
                                handleViewApplication(application);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSendEmail(application);
                              }}
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <DownloadIcon className="w-4 h-4 mr-2" />
                              Download Resume
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <Calendar className="w-4 h-4 mr-2" />
                              Schedule Interview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Move to Next Stage
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => e.stopPropagation()}
                              className="text-red-600"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject Application
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

      {/* Application Details Dialog */}
      <Dialog open={showApplicationDialog} onOpenChange={setShowApplicationDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          {selectedApplication && (
            <>
              <DialogHeader>
                <DialogTitle>Application Details</DialogTitle>
                <DialogDescription>
                  Review {selectedApplication.candidateName}'s application for{" "}
                  {selectedApplication.jobTitle}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Header Section */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="text-xl">
                      {selectedApplication.candidateName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold">
                          {selectedApplication.candidateName}
                        </h3>
                        <p className="text-muted-foreground">
                          Applied for {selectedApplication.jobTitle}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge
                          variant="outline"
                          className={getStatusBadge(selectedApplication.status)}
                        >
                          {selectedApplication.status}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`${
                            (selectedApplication.aiAnalysis?.matchScore || 0) >= 90
                              ? "bg-green-50 text-green-700 border-green-200"
                              : (selectedApplication.aiAnalysis?.matchScore || 0) >= 80
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-gray-50 text-gray-700 border-gray-200"
                          }`}
                        >
                          {selectedApplication.aiAnalysis?.matchScore || 0}% Match
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {selectedApplication.candidateEmail}
                      </div>
                      {selectedApplication.candidatePhone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {selectedApplication.candidatePhone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Analysis */}
                {selectedApplication.aiAnalysis && (
                  <Card className="border-purple-200 bg-purple-50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        AI Analysis & Recommendation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Badge
                          variant="outline"
                          className={getRecommendationBadge(
                            selectedApplication.aiAnalysis.recommendation || "Not Recommended"
                          )}
                        >
                          {selectedApplication.aiAnalysis.recommendation || "Pending"}
                        </Badge>
                      </div>
                      {selectedApplication.aiAnalysis.oneLiner && (
                        <p className="text-sm font-medium">
                          {selectedApplication.aiAnalysis.oneLiner}
                        </p>
                      )}
                      {selectedApplication.aiAnalysis.executiveSummary && (
                        <p className="text-muted-foreground">
                          {selectedApplication.aiAnalysis.executiveSummary}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        {selectedApplication.aiAnalysis.strengths &&
                         selectedApplication.aiAnalysis.strengths.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-green-700">
                              <ThumbsUp className="w-4 h-4" />
                              Strengths
                            </h4>
                            <ul className="space-y-1">
                              {selectedApplication.aiAnalysis.strengths.map((strength, index) => (
                                <li key={index} className="text-sm flex items-start gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  <span>{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {selectedApplication.aiAnalysis.redFlags &&
                         selectedApplication.aiAnalysis.redFlags.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-orange-700">
                              <AlertCircle className="w-4 h-4" />
                              Red Flags
                            </h4>
                            <ul className="space-y-1">
                              {selectedApplication.aiAnalysis.redFlags.map((flag, index) => (
                                <li key={index} className="text-sm flex items-start gap-2">
                                  <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                  <span>{flag}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Resume Section */}
                {selectedApplication.resumeUrl && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Resume</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Resume.pdf</p>
                            <p className="text-sm text-muted-foreground">View or download resume</p>
                          </div>
                        </div>
                        <Button variant="outline" className="gap-2">
                          <DownloadIcon className="w-4 h-4" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Cover Letter */}
                {selectedApplication.coverLetter && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Cover Letter</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {selectedApplication.coverLetter}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    className="flex-1 gap-2"
                    onClick={() => {
                      setShowApplicationDialog(false);
                      handleSendEmail(selectedApplication);
                    }}
                  >
                    <Mail className="w-4 h-4" />
                    Send Email
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <Calendar className="w-4 h-4" />
                    Schedule Interview
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Move to Next Stage
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Email</DialogTitle>
            <DialogDescription>
              Send an email to {selectedApplication?.candidateName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>To</Label>
              <Input value={selectedApplication?.candidateEmail} disabled />
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Email subject"
              />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Email message"
                rows={10}
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowEmailDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowEmailDialog(false);
                  // Handle send email
                }}
                className="flex-1 gap-2"
              >
                <Send className="w-4 h-4" />
                Send Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
