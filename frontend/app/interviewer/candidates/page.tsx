"use client";

import { useState } from "react";
import {
  Calendar,
  FileText,
  MessageSquare,
  Search,
  Filter,
  Download,
  Eye,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Award,
  Clock,
  Star,
  TrendingUp,
  CheckCircle,
  XCircle,
  MoreVertical,
  User,
  Users,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type InterviewStatus = "scheduled" | "completed" | "pending-feedback";
type CandidateStatus = "active" | "hired" | "rejected" | "on-hold";

interface Candidate {
  id: number;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  jobTitle: string;
  company: string;
  location: string;
  experience: string;
  education: string;
  skills: string[];
  matchScore: number;
  status: CandidateStatus;
  interviewStatus: InterviewStatus;
  lastInterviewDate?: string;
  nextInterviewDate?: string;
  interviewsCount: number;
  feedbackRating?: number;
  resumeUrl?: string;
  appliedDate: string;
  notes?: string;
}

export default function InterviewerCandidatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterInterview, setFilterInterview] = useState("all");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Mock data
  const candidates: Candidate[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "SJ",
      email: "sarah.johnson@email.com",
      phone: "+1 (555) 123-4567",
      jobTitle: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      location: "San Francisco, CA",
      experience: "7 years",
      education: "BS Computer Science, Stanford University",
      skills: ["React", "TypeScript", "Node.js", "GraphQL", "AWS"],
      matchScore: 95,
      status: "active",
      interviewStatus: "completed",
      lastInterviewDate: "2025-11-10T14:00:00",
      interviewsCount: 2,
      feedbackRating: 4,
      appliedDate: "2025-11-01",
      notes: "Strong technical skills, excellent communication",
    },
    {
      id: 2,
      name: "Michael Chen",
      avatar: "MC",
      email: "michael.chen@email.com",
      phone: "+1 (555) 234-5678",
      jobTitle: "Full Stack Engineer",
      company: "StartupXYZ",
      location: "New York, NY",
      experience: "5 years",
      education: "MS Software Engineering, MIT",
      skills: ["Python", "Django", "React", "PostgreSQL", "Docker"],
      matchScore: 88,
      status: "active",
      interviewStatus: "scheduled",
      nextInterviewDate: "2025-11-15T10:00:00",
      interviewsCount: 1,
      appliedDate: "2025-11-03",
      notes: "Good problem-solving skills",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      avatar: "ER",
      email: "emily.rodriguez@email.com",
      phone: "+1 (555) 345-6789",
      jobTitle: "UX/UI Designer",
      company: "DesignHub",
      location: "Austin, TX",
      experience: "6 years",
      education: "BFA Design, Parsons",
      skills: ["Figma", "Adobe XD", "User Research", "Prototyping", "Design Systems"],
      matchScore: 92,
      status: "hired",
      interviewStatus: "completed",
      lastInterviewDate: "2025-11-08T15:00:00",
      interviewsCount: 3,
      feedbackRating: 5,
      appliedDate: "2025-10-28",
      notes: "Exceptional portfolio, hired!",
    },
    {
      id: 4,
      name: "David Park",
      avatar: "DP",
      email: "david.park@email.com",
      phone: "+1 (555) 456-7890",
      jobTitle: "DevOps Engineer",
      company: "CloudSystems",
      location: "Seattle, WA",
      experience: "8 years",
      education: "BS Computer Engineering, Georgia Tech",
      skills: ["Kubernetes", "AWS", "Terraform", "CI/CD", "Monitoring"],
      matchScore: 85,
      status: "active",
      interviewStatus: "completed",
      lastInterviewDate: "2025-11-07T11:00:00",
      interviewsCount: 2,
      feedbackRating: 4,
      appliedDate: "2025-11-02",
      notes: "Solid DevOps experience",
    },
    {
      id: 5,
      name: "Jessica Wong",
      avatar: "JW",
      email: "jessica.wong@email.com",
      phone: "+1 (555) 567-8901",
      jobTitle: "Product Manager",
      company: "InnovateNow",
      location: "Boston, MA",
      experience: "4 years",
      education: "MBA, Harvard Business School",
      skills: ["Product Strategy", "Agile", "Data Analysis", "Stakeholder Management"],
      matchScore: 78,
      status: "on-hold",
      interviewStatus: "completed",
      lastInterviewDate: "2025-11-06T13:00:00",
      interviewsCount: 2,
      feedbackRating: 3,
      appliedDate: "2025-10-30",
      notes: "Needs more technical product experience",
    },
    {
      id: 6,
      name: "Alex Thompson",
      avatar: "AT",
      email: "alex.thompson@email.com",
      phone: "+1 (555) 678-9012",
      jobTitle: "Backend Developer",
      company: "DataFlow",
      location: "Denver, CO",
      experience: "3 years",
      education: "BS Computer Science, UC Berkeley",
      skills: ["Java", "Spring Boot", "MySQL", "Redis", "Microservices"],
      matchScore: 82,
      status: "active",
      interviewStatus: "pending-feedback",
      lastInterviewDate: "2025-11-05T10:00:00",
      interviewsCount: 1,
      appliedDate: "2025-11-04",
      notes: "Promising junior developer",
    },
    {
      id: 7,
      name: "Maria Garcia",
      avatar: "MG",
      email: "maria.garcia@email.com",
      phone: "+1 (555) 789-0123",
      jobTitle: "Data Scientist",
      company: "AI Innovations",
      location: "San Diego, CA",
      experience: "5 years",
      education: "PhD Machine Learning, CMU",
      skills: ["Python", "TensorFlow", "PyTorch", "Statistics", "NLP"],
      matchScore: 94,
      status: "active",
      interviewStatus: "completed",
      lastInterviewDate: "2025-11-04T14:00:00",
      interviewsCount: 2,
      feedbackRating: 5,
      appliedDate: "2025-10-29",
      notes: "Excellent ML background",
    },
    {
      id: 8,
      name: "Robert Kim",
      avatar: "RK",
      email: "robert.kim@email.com",
      phone: "+1 (555) 890-1234",
      jobTitle: "Mobile Developer",
      company: "AppWorks",
      location: "Chicago, IL",
      experience: "2 years",
      education: "BS Software Engineering, UIUC",
      skills: ["React Native", "Swift", "Kotlin", "Firebase", "Mobile UI"],
      matchScore: 68,
      status: "rejected",
      interviewStatus: "completed",
      lastInterviewDate: "2025-11-03T09:00:00",
      interviewsCount: 1,
      feedbackRating: 2,
      appliedDate: "2025-11-01",
      notes: "Limited experience with modern frameworks",
    },
  ];

  const getStatusColor = (status: CandidateStatus) => {
    switch (status) {
      case "active":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "hired":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "on-hold":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const getStatusLabel = (status: CandidateStatus) => {
    switch (status) {
      case "active":
        return "Active";
      case "hired":
        return "Hired";
      case "rejected":
        return "Rejected";
      case "on-hold":
        return "On Hold";
      default:
        return status;
    }
  };

  const getInterviewStatusColor = (status: InterviewStatus) => {
    switch (status) {
      case "scheduled":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "completed":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "pending-feedback":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const getInterviewStatusLabel = (status: InterviewStatus) => {
    switch (status) {
      case "scheduled":
        return "Scheduled";
      case "completed":
        return "Completed";
      case "pending-feedback":
        return "Pending Feedback";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleViewDetails = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setDetailsDialogOpen(true);
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.skills.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesStatus =
      filterStatus === "all" || candidate.status === filterStatus;
    const matchesInterview =
      filterInterview === "all" || candidate.interviewStatus === filterInterview;

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && candidate.status === "active") ||
      (activeTab === "interviewed" && candidate.interviewsCount > 0) ||
      (activeTab === "pending" && candidate.interviewStatus === "pending-feedback");

    return matchesSearch && matchesStatus && matchesInterview && matchesTab;
  });

  const stats = {
    total: candidates.length,
    active: candidates.filter((c) => c.status === "active").length,
    interviewed: candidates.filter((c) => c.interviewsCount > 0).length,
    pendingFeedback: candidates.filter(
      (c) => c.interviewStatus === "pending-feedback"
    ).length,
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Persona Recruit</h1>
              <p className="text-xs text-muted-foreground">Interviewer Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <a
            href="/interviewer/dashboard"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted"
          >
            <FileText className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </a>
          <a
            href="/interviewer/interviews"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted"
          >
            <Calendar className="w-5 h-5" />
            <span className="font-medium">My Interviews</span>
          </a>
          <a
            href="/interviewer/feedback"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">Feedback</span>
            <Badge variant="destructive" className="ml-auto">
              {stats.pendingFeedback}
            </Badge>
          </a>
          <a
            href="/interviewer/candidates"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground"
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Candidates</span>
          </a>
          <a
            href="/interviewer/calendar"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted"
          >
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Calendar</span>
          </a>
          <a
            href="/interviewer/settings"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </a>
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center font-semibold">
              MI
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-sm">Mike Interviewer</p>
              <p className="text-xs text-muted-foreground">interviewer@example.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Candidates</h2>
            <p className="text-muted-foreground">
              View and manage candidates you've interviewed
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Candidates</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground mt-1">All time</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Candidates</p>
                  <p className="text-3xl font-bold">{stats.active}</p>
                  <p className="text-sm text-muted-foreground mt-1">In process</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Interviewed</p>
                  <p className="text-3xl font-bold">{stats.interviewed}</p>
                  <p className="text-sm text-muted-foreground mt-1">Completed</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pending Feedback</p>
                  <p className="text-3xl font-bold">{stats.pendingFeedback}</p>
                  <p className="text-sm text-muted-foreground mt-1">Awaiting</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search by name, job title, company, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterInterview} onValueChange={setFilterInterview}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Interview Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Interviews</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending-feedback">Pending Feedback</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">
                All Candidates ({candidates.length})
              </TabsTrigger>
              <TabsTrigger value="active">
                Active ({stats.active})
              </TabsTrigger>
              <TabsTrigger value="interviewed">
                Interviewed ({stats.interviewed})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending Feedback ({stats.pendingFeedback})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {filteredCandidates.length === 0 ? (
                <Card className="p-12 text-center">
                  <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No candidates found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filters
                  </p>
                </Card>
              ) : (
                filteredCandidates.map((candidate) => (
                  <Card key={candidate.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <Avatar className="w-14 h-14 bg-primary text-primary-foreground flex items-center justify-center font-semibold text-lg">
                          {candidate.avatar}
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold mb-1">
                                {candidate.name}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {candidate.jobTitle} at {candidate.company}
                              </p>
                              <div className="flex flex-wrap gap-2 mb-3">
                                <Badge
                                  variant="outline"
                                  className={getStatusColor(candidate.status)}
                                >
                                  {getStatusLabel(candidate.status)}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={getInterviewStatusColor(
                                    candidate.interviewStatus
                                  )}
                                >
                                  {getInterviewStatusLabel(candidate.interviewStatus)}
                                </Badge>
                                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                                  Match: {candidate.matchScore}%
                                </Badge>
                                {candidate.feedbackRating && (
                                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                                    <Star className="w-3 h-3 mr-1 fill-current" />
                                    {candidate.feedbackRating}/5
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <span>{candidate.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Briefcase className="w-4 h-4" />
                              <span>{candidate.experience} experience</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {candidate.interviewsCount} interview
                                {candidate.interviewsCount !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-sm font-medium mb-2">Skills</p>
                            <div className="flex flex-wrap gap-2">
                              {candidate.skills.slice(0, 5).map((skill, index) => (
                                <Badge key={index} variant="secondary">
                                  {skill}
                                </Badge>
                              ))}
                              {candidate.skills.length > 5 && (
                                <Badge variant="secondary">
                                  +{candidate.skills.length - 5} more
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              onClick={() => handleViewDetails(candidate)}
                              variant="outline"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Profile
                            </Button>
                            <Button variant="outline">
                              <Mail className="w-4 h-4 mr-2" />
                              Email
                            </Button>
                            {candidate.interviewStatus === "pending-feedback" && (
                              <Button>
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Submit Feedback
                              </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Download className="w-4 h-4 mr-2" />
                                  Download Resume
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Phone className="w-4 h-4 mr-2" />
                                  Call Candidate
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Calendar className="w-4 h-4 mr-2" />
                                  Schedule Interview
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Candidate Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Candidate Profile</DialogTitle>
            <DialogDescription>
              Detailed information about {selectedCandidate?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedCandidate && (
            <div className="space-y-6">
              {/* Candidate Header */}
              <div className="flex items-start gap-4 pb-4 border-b">
                <Avatar className="w-20 h-20 bg-primary text-primary-foreground flex items-center justify-center font-semibold text-2xl">
                  {selectedCandidate.avatar}
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-1">
                    {selectedCandidate.name}
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    {selectedCandidate.jobTitle} at {selectedCandidate.company}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className={getStatusColor(selectedCandidate.status)}
                    >
                      {getStatusLabel(selectedCandidate.status)}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={getInterviewStatusColor(
                        selectedCandidate.interviewStatus
                      )}
                    >
                      {getInterviewStatusLabel(selectedCandidate.interviewStatus)}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                      Match Score: {selectedCandidate.matchScore}%
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedCandidate.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{selectedCandidate.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{selectedCandidate.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <Briefcase className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Experience</p>
                      <p className="font-medium">{selectedCandidate.experience}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Education */}
              <div>
                <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Education
                </h4>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-medium">{selectedCandidate.education}</p>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Interview History */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Interview History</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Total Interviews</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedCandidate.interviewsCount} session
                        {selectedCandidate.interviewsCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    {selectedCandidate.feedbackRating && (
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xl font-bold">
                          {selectedCandidate.feedbackRating}/5
                        </span>
                      </div>
                    )}
                  </div>
                  {selectedCandidate.lastInterviewDate && (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="font-medium mb-1">Last Interview</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(selectedCandidate.lastInterviewDate)}
                      </p>
                    </div>
                  )}
                  {selectedCandidate.nextInterviewDate && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="font-medium mb-1 text-blue-900">
                        Next Interview Scheduled
                      </p>
                      <p className="text-sm text-blue-700">
                        {formatDate(selectedCandidate.nextInterviewDate)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedCandidate.notes && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">Interview Notes</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedCandidate.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Application Date */}
              <div className="pt-4 border-t text-sm text-muted-foreground">
                <p>Applied: {formatDate(selectedCandidate.appliedDate)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
