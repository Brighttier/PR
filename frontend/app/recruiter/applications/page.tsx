"use client";

import { useState } from "react";
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
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "hired"
  | "rejected"
  | "withdrawn";

interface Application {
  id: number;
  candidateName: string;
  candidateEmail: string;
  candidateAvatar: string;
  candidatePhone: string;
  jobTitle: string;
  jobDepartment: string;
  appliedDate: string;
  status: ApplicationStatus;
  stage: string;
  matchScore: number;
  aiRecommendation: string;
  resumeUrl: string;
  coverLetter?: string;
  experience: string;
  location: string;
  expectedSalary?: string;
  noticePeriod?: string;
  skills: string[];
  education: string;
  aiSummary: string;
  strengths: string[];
  concerns: string[];
  interviewsScheduled: number;
  lastUpdated: string;
}

export default function RecruiterApplicationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [matchScoreFilter, setMatchScoreFilter] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  // Mock applications data
  const applications: Application[] = [
    {
      id: 1,
      candidateName: "Sarah Johnson",
      candidateEmail: "sarah.johnson@email.com",
      candidateAvatar: "",
      candidatePhone: "+1 (555) 123-4567",
      jobTitle: "Senior Software Engineer",
      jobDepartment: "Engineering",
      appliedDate: "Jan 15, 2024",
      status: "interview",
      stage: "Technical Interview",
      matchScore: 94,
      aiRecommendation: "Strong Hire",
      resumeUrl: "/resumes/sarah-johnson.pdf",
      coverLetter: "I am excited to apply for the Senior Software Engineer position...",
      experience: "8 years",
      location: "San Francisco, CA",
      expectedSalary: "$150,000 - $180,000",
      noticePeriod: "2 weeks",
      skills: ["React", "TypeScript", "Node.js", "AWS", "Docker", "GraphQL"],
      education: "BS Computer Science - Stanford University",
      aiSummary: "Highly experienced full-stack engineer with strong technical skills and leadership experience. Excellent cultural fit with proven track record of delivering complex projects.",
      strengths: [
        "8+ years of experience with modern tech stack",
        "Led multiple high-impact projects",
        "Strong communication skills",
        "Active open-source contributor",
      ],
      concerns: [
        "Salary expectation at upper range",
        "May need relocation assistance",
      ],
      interviewsScheduled: 2,
      lastUpdated: "2 hours ago",
    },
    {
      id: 2,
      candidateName: "Michael Chen",
      candidateEmail: "michael.chen@email.com",
      candidateAvatar: "",
      candidatePhone: "+1 (555) 234-5678",
      jobTitle: "Product Manager",
      jobDepartment: "Product",
      appliedDate: "Jan 14, 2024",
      status: "screening",
      stage: "Initial Screening",
      matchScore: 88,
      aiRecommendation: "Hire",
      resumeUrl: "/resumes/michael-chen.pdf",
      experience: "6 years",
      location: "New York, NY",
      expectedSalary: "$130,000 - $150,000",
      noticePeriod: "1 month",
      skills: ["Product Strategy", "Agile", "User Research", "Data Analysis", "SQL"],
      education: "MBA - Harvard Business School",
      aiSummary: "Strong product leader with excellent analytical skills and proven track record of launching successful products. Good cultural fit.",
      strengths: [
        "6 years PM experience at top companies",
        "Strong analytical and data-driven approach",
        "Excellent stakeholder management",
      ],
      concerns: [
        "Limited experience with B2B products",
      ],
      interviewsScheduled: 1,
      lastUpdated: "5 hours ago",
    },
    {
      id: 3,
      candidateName: "Emily Rodriguez",
      candidateEmail: "emily.rodriguez@email.com",
      candidateAvatar: "",
      candidatePhone: "+1 (555) 345-6789",
      jobTitle: "UX Designer",
      jobDepartment: "Design",
      appliedDate: "Jan 13, 2024",
      status: "offer",
      stage: "Offer Extended",
      matchScore: 92,
      aiRecommendation: "Strong Hire",
      resumeUrl: "/resumes/emily-rodriguez.pdf",
      experience: "5 years",
      location: "Austin, TX",
      expectedSalary: "$110,000 - $130,000",
      noticePeriod: "2 weeks",
      skills: ["Figma", "User Research", "Prototyping", "Design Systems", "Accessibility"],
      education: "BFA Design - Rhode Island School of Design",
      aiSummary: "Talented UX designer with strong portfolio and excellent design thinking skills. Very strong cultural fit with collaborative mindset.",
      strengths: [
        "Outstanding portfolio with award-winning work",
        "Strong user research skills",
        "Experience with design systems",
        "Excellent collaboration skills",
      ],
      concerns: [],
      interviewsScheduled: 3,
      lastUpdated: "1 day ago",
    },
    {
      id: 4,
      candidateName: "David Kim",
      candidateEmail: "david.kim@email.com",
      candidateAvatar: "",
      candidatePhone: "+1 (555) 456-7890",
      jobTitle: "Data Scientist",
      jobDepartment: "Analytics",
      appliedDate: "Jan 12, 2024",
      status: "hired",
      stage: "Onboarding",
      matchScore: 89,
      aiRecommendation: "Hire",
      resumeUrl: "/resumes/david-kim.pdf",
      experience: "7 years",
      location: "Seattle, WA",
      expectedSalary: "$140,000 - $160,000",
      noticePeriod: "3 weeks",
      skills: ["Python", "Machine Learning", "TensorFlow", "SQL", "R", "Data Visualization"],
      education: "PhD Statistics - MIT",
      aiSummary: "Exceptional data scientist with PhD and strong research background. Published researcher with deep learning expertise.",
      strengths: [
        "PhD from top institution",
        "Published research in ML",
        "Strong technical skills",
        "Industry experience",
      ],
      concerns: [],
      interviewsScheduled: 2,
      lastUpdated: "3 days ago",
    },
    {
      id: 5,
      candidateName: "Jessica Taylor",
      candidateEmail: "jessica.taylor@email.com",
      candidateAvatar: "",
      candidatePhone: "+1 (555) 567-8901",
      jobTitle: "Marketing Manager",
      jobDepartment: "Marketing",
      appliedDate: "Jan 11, 2024",
      status: "applied",
      stage: "Application Review",
      matchScore: 79,
      aiRecommendation: "Consider",
      resumeUrl: "/resumes/jessica-taylor.pdf",
      experience: "4 years",
      location: "Los Angeles, CA",
      expectedSalary: "$90,000 - $110,000",
      noticePeriod: "2 weeks",
      skills: ["Digital Marketing", "SEO", "Content Strategy", "Analytics", "Social Media"],
      education: "BA Marketing - UCLA",
      aiSummary: "Solid marketing professional with good digital marketing skills. May need more senior-level experience for this role.",
      strengths: [
        "Strong digital marketing skills",
        "Good analytical mindset",
        "Creative content strategy",
      ],
      concerns: [
        "Limited experience with B2B marketing",
        "Role may require more senior experience",
      ],
      interviewsScheduled: 0,
      lastUpdated: "1 day ago",
    },
    {
      id: 6,
      candidateName: "Robert Anderson",
      candidateEmail: "robert.anderson@email.com",
      candidateAvatar: "",
      candidatePhone: "+1 (555) 678-9012",
      jobTitle: "DevOps Engineer",
      jobDepartment: "Engineering",
      appliedDate: "Jan 10, 2024",
      status: "screening",
      stage: "Technical Screening",
      matchScore: 91,
      aiRecommendation: "Strong Hire",
      resumeUrl: "/resumes/robert-anderson.pdf",
      experience: "9 years",
      location: "Remote",
      expectedSalary: "$140,000 - $165,000",
      noticePeriod: "1 month",
      skills: ["Kubernetes", "AWS", "Terraform", "CI/CD", "Python", "Monitoring"],
      education: "BS Information Technology - Georgia Tech",
      aiSummary: "Expert DevOps engineer with extensive cloud infrastructure experience. Strong automation skills and proven track record.",
      strengths: [
        "9+ years DevOps experience",
        "Deep Kubernetes expertise",
        "Strong automation mindset",
        "Remote work experience",
      ],
      concerns: [
        "Notice period is 1 month",
      ],
      interviewsScheduled: 1,
      lastUpdated: "3 hours ago",
    },
    {
      id: 7,
      candidateName: "Amanda White",
      candidateEmail: "amanda.white@email.com",
      candidateAvatar: "",
      candidatePhone: "+1 (555) 789-0123",
      jobTitle: "Sales Director",
      jobDepartment: "Sales",
      appliedDate: "Jan 9, 2024",
      status: "rejected",
      stage: "Application Review",
      matchScore: 68,
      aiRecommendation: "Not Recommended",
      resumeUrl: "/resumes/amanda-white.pdf",
      experience: "10 years",
      location: "Chicago, IL",
      expectedSalary: "$150,000 - $200,000",
      skills: ["Enterprise Sales", "Negotiation", "CRM", "Team Leadership", "Strategy"],
      education: "BA Business Administration - Northwestern",
      aiSummary: "Experienced sales professional but skill set doesn't align well with our technical product sales requirements.",
      strengths: [
        "10+ years sales experience",
        "Strong enterprise sales background",
      ],
      concerns: [
        "Limited technical product experience",
        "Salary expectations significantly above budget",
        "Background focused on different industry",
      ],
      interviewsScheduled: 0,
      lastUpdated: "2 days ago",
    },
    {
      id: 8,
      candidateName: "Chris Martinez",
      candidateEmail: "chris.martinez@email.com",
      candidateAvatar: "",
      candidatePhone: "+1 (555) 890-1234",
      jobTitle: "Full Stack Developer",
      jobDepartment: "Engineering",
      appliedDate: "Jan 8, 2024",
      status: "applied",
      stage: "Application Review",
      matchScore: 82,
      aiRecommendation: "Consider",
      resumeUrl: "/resumes/chris-martinez.pdf",
      experience: "3 years",
      location: "Miami, FL",
      expectedSalary: "$90,000 - $110,000",
      noticePeriod: "2 weeks",
      skills: ["JavaScript", "React", "Node.js", "MongoDB", "Express", "Git"],
      education: "BS Computer Science - University of Florida",
      aiSummary: "Promising junior developer with solid foundation. Good cultural fit but may need mentorship for senior-level responsibilities.",
      strengths: [
        "Strong fundamentals in modern web stack",
        "Eager to learn and grow",
        "Good problem-solving skills",
      ],
      concerns: [
        "Limited experience for mid-level role",
        "May need additional training",
      ],
      interviewsScheduled: 0,
      lastUpdated: "4 hours ago",
    },
  ];

  const jobs = [
    "Senior Software Engineer",
    "Product Manager",
    "UX Designer",
    "Data Scientist",
    "Marketing Manager",
    "DevOps Engineer",
    "Sales Director",
    "Full Stack Developer",
  ];

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "applied" || a.status === "screening").length,
    interview: applications.filter((a) => a.status === "interview").length,
    offer: applications.filter((a) => a.status === "offer").length,
    hired: applications.filter((a) => a.status === "hired").length,
    avgMatchScore: Math.round(
      applications.reduce((acc, a) => acc + a.matchScore, 0) / applications.length
    ),
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

    const matchesMatchScore =
      matchScoreFilter === "all" ||
      (matchScoreFilter === "high" && application.matchScore >= 85) ||
      (matchScoreFilter === "medium" && application.matchScore >= 70 && application.matchScore < 85) ||
      (matchScoreFilter === "low" && application.matchScore < 70);

    return matchesSearch && matchesStatus && matchesJob && matchesMatchScore;
  });

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setShowApplicationDialog(true);
  };

  const handleSendEmail = (application: Application) => {
    setSelectedApplication(application);
    setEmailSubject(`Re: Your application for ${application.jobTitle}`);
    setEmailBody(`Dear ${application.candidateName.split(" ")[0]},\n\nThank you for your application for the ${application.jobTitle} position.\n\nBest regards,\nHiring Team`);
    setShowEmailDialog(true);
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    const styles = {
      applied: "bg-blue-50 text-blue-700 border-blue-200",
      screening: "bg-yellow-50 text-yellow-700 border-yellow-200",
      interview: "bg-purple-50 text-purple-700 border-purple-200",
      offer: "bg-orange-50 text-orange-700 border-orange-200",
      hired: "bg-green-50 text-green-700 border-green-200",
      rejected: "bg-red-50 text-red-700 border-red-200",
      withdrawn: "bg-gray-50 text-gray-700 border-gray-200",
    };
    return styles[status];
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
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="screening">Screening</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
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
                            <AvatarImage src={application.candidateAvatar} />
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
                        <div>
                          <p className="font-medium text-sm">{application.jobTitle}</p>
                          <p className="text-xs text-muted-foreground">
                            {application.jobDepartment}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {application.appliedDate}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${
                            application.matchScore >= 90
                              ? "bg-green-50 text-green-700 border-green-200"
                              : application.matchScore >= 80
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : application.matchScore >= 70
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : "bg-gray-50 text-gray-700 border-gray-200"
                          }`}
                        >
                          <Target className="w-3 h-3 mr-1" />
                          {application.matchScore}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getRecommendationBadge(application.aiRecommendation)}
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          {application.aiRecommendation}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusBadge(application.status)}
                        >
                          {application.status.charAt(0).toUpperCase() +
                            application.status.slice(1)}
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

              {filteredApplications.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No applications found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search or filters
                  </p>
                </div>
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
                    <AvatarImage src={selectedApplication.candidateAvatar} />
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
                          {selectedApplication.status.charAt(0).toUpperCase() +
                            selectedApplication.status.slice(1)}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`${
                            selectedApplication.matchScore >= 90
                              ? "bg-green-50 text-green-700 border-green-200"
                              : selectedApplication.matchScore >= 80
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-gray-50 text-gray-700 border-gray-200"
                          }`}
                        >
                          {selectedApplication.matchScore}% Match
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {selectedApplication.candidateEmail}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {selectedApplication.candidatePhone}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {selectedApplication.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {selectedApplication.experience}
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Analysis */}
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
                          selectedApplication.aiRecommendation
                        )}
                      >
                        {selectedApplication.aiRecommendation}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">
                      {selectedApplication.aiSummary}
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-green-700">
                          <ThumbsUp className="w-4 h-4" />
                          Strengths
                        </h4>
                        <ul className="space-y-1">
                          {selectedApplication.strengths.map((strength, index) => (
                            <li key={index} className="text-sm flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {selectedApplication.concerns.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-orange-700">
                            <ThumbsDown className="w-4 h-4" />
                            Concerns
                          </h4>
                          <ul className="space-y-1">
                            {selectedApplication.concerns.map((concern, index) => (
                              <li key={index} className="text-sm flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                <span>{concern}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="resume">Resume & Documents</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Skills</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {selectedApplication.skills.map((skill, index) => (
                              <Badge key={index} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <GraduationCap className="w-5 h-5" />
                            Education
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground">
                            {selectedApplication.education}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {selectedApplication.expectedSalary && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Compensation & Availability</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Expected Salary</p>
                            <p className="font-medium">{selectedApplication.expectedSalary}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Notice Period</p>
                            <p className="font-medium">{selectedApplication.noticePeriod}</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

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
                  </TabsContent>

                  <TabsContent value="resume">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                          <FileText className="w-16 h-16 text-muted-foreground mx-auto" />
                          <div>
                            <p className="font-medium mb-2">Resume</p>
                            <p className="text-sm text-muted-foreground mb-4">
                              {selectedApplication.resumeUrl}
                            </p>
                            <Button className="gap-2">
                              <DownloadIcon className="w-4 h-4" />
                              Download Resume
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="timeline">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex gap-4">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                            <div>
                              <p className="font-medium">Application Submitted</p>
                              <p className="text-sm text-muted-foreground">
                                {selectedApplication.appliedDate}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-4">
                            <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
                            <div>
                              <p className="font-medium">Under Review</p>
                              <p className="text-sm text-muted-foreground">
                                {selectedApplication.lastUpdated}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="notes">
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">
                          No notes yet. Add your first note about this application.
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

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
