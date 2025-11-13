"use client";

import { useState } from "react";
import {
  Calendar,
  FileText,
  Home,
  MessageSquare,
  Search,
  Star,
  Filter,
  Download,
  Eye,
  Edit3,
  Clock,
  CheckCircle2,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Minus,
  MoreVertical,
  ChevronDown,
  Users,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type FeedbackStatus = "draft" | "submitted" | "pending";
type RecommendationType = "strong-hire" | "hire" | "neutral" | "no-hire" | "strong-no-hire";
type InterviewType = "technical" | "hr" | "manager" | "portfolio" | "final";

interface Feedback {
  id: number;
  candidateName: string;
  candidateAvatar: string;
  jobTitle: string;
  company: string;
  interviewDate: string;
  interviewType: InterviewType;
  status: FeedbackStatus;
  recommendation?: RecommendationType;
  overallRating?: number;
  technicalSkills?: number;
  communicationSkills?: number;
  problemSolvingSkills?: number;
  cultureFit?: number;
  feedback?: string;
  strengths?: string;
  areasForImprovement?: string;
  lastModified: string;
  submittedAt?: string;
}

export default function InterviewerFeedbackPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Form state for editing feedback
  const [overallRating, setOverallRating] = useState(0);
  const [technicalSkills, setTechnicalSkills] = useState(0);
  const [communicationSkills, setCommunicationSkills] = useState(0);
  const [problemSolvingSkills, setProblemSolvingSkills] = useState(0);
  const [cultureFit, setCultureFit] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [strengths, setStrengths] = useState("");
  const [areasForImprovement, setAreasForImprovement] = useState("");
  const [recommendation, setRecommendation] = useState("");

  // Mock data
  const feedbackList: Feedback[] = [
    {
      id: 1,
      candidateName: "Sarah Johnson",
      candidateAvatar: "SJ",
      jobTitle: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      interviewDate: "2025-11-10T14:00:00",
      interviewType: "technical",
      status: "pending",
      lastModified: "2025-11-10T15:30:00",
    },
    {
      id: 2,
      candidateName: "Michael Chen",
      candidateAvatar: "MC",
      jobTitle: "Full Stack Engineer",
      company: "StartupXYZ",
      interviewDate: "2025-11-09T10:00:00",
      interviewType: "technical",
      status: "draft",
      recommendation: "hire",
      overallRating: 4,
      technicalSkills: 4,
      communicationSkills: 5,
      problemSolvingSkills: 4,
      cultureFit: 4,
      feedback: "Strong technical background with excellent problem-solving skills. Demonstrated good understanding of React and Node.js.",
      strengths: "Quick learner, excellent communication, strong coding skills",
      areasForImprovement: "Could benefit from more experience with cloud infrastructure",
      lastModified: "2025-11-09T12:45:00",
    },
    {
      id: 3,
      candidateName: "Emily Rodriguez",
      candidateAvatar: "ER",
      jobTitle: "UX/UI Designer",
      company: "DesignHub",
      interviewDate: "2025-11-08T15:00:00",
      interviewType: "portfolio",
      status: "submitted",
      recommendation: "strong-hire",
      overallRating: 5,
      technicalSkills: 5,
      communicationSkills: 5,
      problemSolvingSkills: 5,
      cultureFit: 5,
      feedback: "Exceptional portfolio showcasing innovative designs. Strong understanding of user-centered design principles and modern design tools.",
      strengths: "Creative thinking, attention to detail, excellent portfolio, collaborative mindset",
      areasForImprovement: "None significant. Ready to contribute immediately.",
      lastModified: "2025-11-08T16:30:00",
      submittedAt: "2025-11-08T16:30:00",
    },
    {
      id: 4,
      candidateName: "David Park",
      candidateAvatar: "DP",
      jobTitle: "DevOps Engineer",
      company: "CloudSystems",
      interviewDate: "2025-11-07T11:00:00",
      interviewType: "technical",
      status: "submitted",
      recommendation: "hire",
      overallRating: 4,
      technicalSkills: 4,
      communicationSkills: 4,
      problemSolvingSkills: 4,
      cultureFit: 4,
      feedback: "Solid DevOps experience with strong knowledge of AWS and Kubernetes. Good problem-solving approach.",
      strengths: "Hands-on experience, good technical depth, clear communication",
      areasForImprovement: "Could expand knowledge of monitoring tools and CI/CD best practices",
      lastModified: "2025-11-07T13:00:00",
      submittedAt: "2025-11-07T13:00:00",
    },
    {
      id: 5,
      candidateName: "Jessica Wong",
      candidateAvatar: "JW",
      jobTitle: "Product Manager",
      company: "InnovateNow",
      interviewDate: "2025-11-06T13:00:00",
      interviewType: "manager",
      status: "submitted",
      recommendation: "neutral",
      overallRating: 3,
      technicalSkills: 3,
      communicationSkills: 4,
      problemSolvingSkills: 3,
      cultureFit: 3,
      feedback: "Good communication skills and product sense. However, lacks experience managing technical teams at scale.",
      strengths: "Strong stakeholder management, good product vision",
      areasForImprovement: "Needs more experience with technical product management and agile methodologies",
      lastModified: "2025-11-06T14:30:00",
      submittedAt: "2025-11-06T14:30:00",
    },
    {
      id: 6,
      candidateName: "Alex Thompson",
      candidateAvatar: "AT",
      jobTitle: "Backend Developer",
      company: "DataFlow",
      interviewDate: "2025-11-05T10:00:00",
      interviewType: "technical",
      status: "pending",
      lastModified: "2025-11-05T11:30:00",
    },
    {
      id: 7,
      candidateName: "Maria Garcia",
      candidateAvatar: "MG",
      jobTitle: "Data Scientist",
      company: "AI Innovations",
      interviewDate: "2025-11-04T14:00:00",
      interviewType: "technical",
      status: "submitted",
      recommendation: "strong-hire",
      overallRating: 5,
      technicalSkills: 5,
      communicationSkills: 4,
      problemSolvingSkills: 5,
      cultureFit: 5,
      feedback: "Exceptional data science skills with strong ML background. Demonstrated excellent problem-solving abilities during the technical assessment.",
      strengths: "Advanced ML knowledge, Python expertise, research experience",
      areasForImprovement: "Could improve presentation skills for non-technical audiences",
      lastModified: "2025-11-04T16:00:00",
      submittedAt: "2025-11-04T16:00:00",
    },
    {
      id: 8,
      candidateName: "Robert Kim",
      candidateAvatar: "RK",
      jobTitle: "Mobile Developer",
      company: "AppWorks",
      interviewDate: "2025-11-03T09:00:00",
      interviewType: "technical",
      status: "draft",
      recommendation: "no-hire",
      overallRating: 2,
      technicalSkills: 2,
      communicationSkills: 3,
      problemSolvingSkills: 2,
      cultureFit: 3,
      feedback: "Limited experience with modern mobile development frameworks. Struggled with basic technical questions.",
      strengths: "Enthusiasm for learning, good attitude",
      areasForImprovement: "Needs significant improvement in technical skills and hands-on experience",
      lastModified: "2025-11-03T11:00:00",
    },
  ];

  const getStatusColor = (status: FeedbackStatus) => {
    switch (status) {
      case "submitted":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "draft":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getStatusIcon = (status: FeedbackStatus) => {
    switch (status) {
      case "submitted":
        return <CheckCircle2 className="w-4 h-4" />;
      case "draft":
        return <Edit3 className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getRecommendationColor = (recommendation?: RecommendationType) => {
    switch (recommendation) {
      case "strong-hire":
        return "bg-green-600/10 text-green-600 border-green-600/20";
      case "hire":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "neutral":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "no-hire":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "strong-no-hire":
        return "bg-red-600/10 text-red-600 border-red-600/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getRecommendationIcon = (recommendation?: RecommendationType) => {
    switch (recommendation) {
      case "strong-hire":
      case "hire":
        return <ThumbsUp className="w-4 h-4" />;
      case "neutral":
        return <Minus className="w-4 h-4" />;
      case "no-hire":
      case "strong-no-hire":
        return <ThumbsDown className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getRecommendationLabel = (recommendation?: RecommendationType) => {
    switch (recommendation) {
      case "strong-hire":
        return "Strong Hire";
      case "hire":
        return "Hire";
      case "neutral":
        return "Neutral";
      case "no-hire":
        return "No Hire";
      case "strong-no-hire":
        return "Strong No Hire";
      default:
        return "Not Set";
    }
  };

  const getTypeLabel = (type: InterviewType) => {
    switch (type) {
      case "technical":
        return "Technical";
      case "hr":
        return "HR";
      case "manager":
        return "Manager";
      case "portfolio":
        return "Portfolio";
      case "final":
        return "Final";
      default:
        return type;
    }
  };

  const getTypeColor = (type: InterviewType) => {
    switch (type) {
      case "technical":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "hr":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "manager":
        return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
      case "portfolio":
        return "bg-pink-500/10 text-pink-500 border-pink-500/20";
      case "final":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleViewFeedback = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setViewDialogOpen(true);
  };

  const handleEditFeedback = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setOverallRating(feedback.overallRating || 0);
    setTechnicalSkills(feedback.technicalSkills || 0);
    setCommunicationSkills(feedback.communicationSkills || 0);
    setProblemSolvingSkills(feedback.problemSolvingSkills || 0);
    setCultureFit(feedback.cultureFit || 0);
    setFeedbackText(feedback.feedback || "");
    setStrengths(feedback.strengths || "");
    setAreasForImprovement(feedback.areasForImprovement || "");
    setRecommendation(feedback.recommendation || "");
    setEditDialogOpen(true);
  };

  const handleSaveDraft = () => {
    console.log("Saving draft...");
    setEditDialogOpen(false);
  };

  const handleSubmitFeedback = () => {
    console.log("Submitting feedback...");
    setEditDialogOpen(false);
  };

  const filteredFeedback = feedbackList.filter((feedback) => {
    const matchesSearch =
      feedback.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.company.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === "all" || feedback.status === filterStatus;
    const matchesType = filterType === "all" || feedback.interviewType === filterType;

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && feedback.status === "pending") ||
      (activeTab === "drafts" && feedback.status === "draft") ||
      (activeTab === "submitted" && feedback.status === "submitted");

    return matchesSearch && matchesStatus && matchesType && matchesTab;
  });

  const stats = {
    pending: feedbackList.filter((f) => f.status === "pending").length,
    drafts: feedbackList.filter((f) => f.status === "draft").length,
    submitted: feedbackList.filter((f) => f.status === "submitted").length,
    avgRating:
      feedbackList.filter((f) => f.overallRating).length > 0
        ? (
            feedbackList.reduce((sum, f) => sum + (f.overallRating || 0), 0) /
            feedbackList.filter((f) => f.overallRating).length
          ).toFixed(1)
        : "N/A",
  };

  const StarRating = ({
    rating,
    onRatingChange,
    readonly = false,
  }: {
    rating: number;
    onRatingChange?: (rating: number) => void;
    readonly?: boolean;
  }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !readonly && onRatingChange && onRatingChange(star)}
            disabled={readonly}
            className={`${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"} transition-transform`}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
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
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">Feedback</span>
            <Badge variant="destructive" className="ml-auto">
              {stats.pending}
            </Badge>
          </a>
          <a
            href="/interviewer/candidates"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted"
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
            <h2 className="text-3xl font-bold mb-2">Interview Feedback</h2>
            <p className="text-muted-foreground">
              Manage and submit feedback for your completed interviews
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pending Feedback</p>
                  <p className="text-3xl font-bold">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground mt-1">Awaiting submission</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Draft Feedback</p>
                  <p className="text-3xl font-bold">{stats.drafts}</p>
                  <p className="text-sm text-muted-foreground mt-1">In progress</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Edit3 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Submitted</p>
                  <p className="text-3xl font-bold">{stats.submitted}</p>
                  <p className="text-sm text-muted-foreground mt-1">This month</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Avg Rating</p>
                  <p className="text-3xl font-bold">{stats.avgRating}</p>
                  <p className="text-sm text-muted-foreground mt-1">Out of 5.0</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search by candidate name, job title, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Interview Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="portfolio">Portfolio</SelectItem>
                <SelectItem value="final">Final</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">
                All Feedback ({feedbackList.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({stats.pending})
              </TabsTrigger>
              <TabsTrigger value="drafts">
                Drafts ({stats.drafts})
              </TabsTrigger>
              <TabsTrigger value="submitted">
                Submitted ({stats.submitted})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {filteredFeedback.length === 0 ? (
                <Card className="p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No feedback found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filters
                  </p>
                </Card>
              ) : (
                filteredFeedback.map((feedback) => (
                  <Card key={feedback.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <Avatar className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center font-semibold text-lg">
                          {feedback.candidateAvatar}
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold mb-1">
                                {feedback.candidateName}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {feedback.jobTitle} at {feedback.company}
                              </p>
                              <div className="flex flex-wrap gap-2 mb-3">
                                <Badge
                                  variant="outline"
                                  className={getTypeColor(feedback.interviewType)}
                                >
                                  {getTypeLabel(feedback.interviewType)}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={getStatusColor(feedback.status)}
                                >
                                  <span className="flex items-center gap-1">
                                    {getStatusIcon(feedback.status)}
                                    {feedback.status.charAt(0).toUpperCase() +
                                      feedback.status.slice(1)}
                                  </span>
                                </Badge>
                                {feedback.recommendation && (
                                  <Badge
                                    variant="outline"
                                    className={getRecommendationColor(
                                      feedback.recommendation
                                    )}
                                  >
                                    <span className="flex items-center gap-1">
                                      {getRecommendationIcon(feedback.recommendation)}
                                      {getRecommendationLabel(feedback.recommendation)}
                                    </span>
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>
                                Interview: {formatDate(feedback.interviewDate)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>
                                Last Modified: {formatDateTime(feedback.lastModified)}
                              </span>
                            </div>
                          </div>

                          {feedback.overallRating && (
                            <div className="mb-4">
                              <p className="text-sm font-medium mb-2">Overall Rating</p>
                              <StarRating rating={feedback.overallRating} readonly />
                            </div>
                          )}

                          {feedback.feedback && (
                            <div className="bg-muted p-4 rounded-lg mb-4">
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {feedback.feedback}
                              </p>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2">
                            {feedback.status === "pending" && (
                              <Button
                                onClick={() => handleEditFeedback(feedback)}
                              >
                                <Edit3 className="w-4 h-4 mr-2" />
                                Submit Feedback
                              </Button>
                            )}
                            {feedback.status === "draft" && (
                              <>
                                <Button
                                  onClick={() => handleEditFeedback(feedback)}
                                  variant="outline"
                                >
                                  <Edit3 className="w-4 h-4 mr-2" />
                                  Continue Editing
                                </Button>
                                <Button
                                  onClick={() => handleViewFeedback(feedback)}
                                  variant="outline"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Preview
                                </Button>
                              </>
                            )}
                            {feedback.status === "submitted" && (
                              <Button
                                onClick={() => handleViewFeedback(feedback)}
                                variant="outline"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Feedback
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
                                  Download PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <FileText className="w-4 h-4 mr-2" />
                                  View Resume
                                </DropdownMenuItem>
                                {feedback.status === "submitted" && (
                                  <DropdownMenuItem>
                                    <Edit3 className="w-4 h-4 mr-2" />
                                    Edit Feedback
                                  </DropdownMenuItem>
                                )}
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

      {/* View Feedback Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Interview Feedback</DialogTitle>
            <DialogDescription>
              Feedback for {selectedFeedback?.candidateName}
            </DialogDescription>
          </DialogHeader>

          {selectedFeedback && (
            <div className="space-y-6">
              {/* Candidate Info */}
              <div className="flex items-center gap-4 pb-4 border-b">
                <Avatar className="w-16 h-16 bg-primary text-primary-foreground flex items-center justify-center font-semibold text-xl">
                  {selectedFeedback.candidateAvatar}
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">
                    {selectedFeedback.candidateName}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedFeedback.jobTitle} at {selectedFeedback.company}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className={getTypeColor(selectedFeedback.interviewType)}
                    >
                      {getTypeLabel(selectedFeedback.interviewType)}
                    </Badge>
                    {selectedFeedback.recommendation && (
                      <Badge
                        variant="outline"
                        className={getRecommendationColor(
                          selectedFeedback.recommendation
                        )}
                      >
                        <span className="flex items-center gap-1">
                          {getRecommendationIcon(selectedFeedback.recommendation)}
                          {getRecommendationLabel(selectedFeedback.recommendation)}
                        </span>
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Ratings */}
              {selectedFeedback.overallRating && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold mb-2">
                      Overall Rating
                    </Label>
                    <StarRating rating={selectedFeedback.overallRating} readonly />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {selectedFeedback.technicalSkills && (
                      <div>
                        <Label className="text-sm mb-2">Technical Skills</Label>
                        <StarRating
                          rating={selectedFeedback.technicalSkills}
                          readonly
                        />
                      </div>
                    )}
                    {selectedFeedback.communicationSkills && (
                      <div>
                        <Label className="text-sm mb-2">
                          Communication Skills
                        </Label>
                        <StarRating
                          rating={selectedFeedback.communicationSkills}
                          readonly
                        />
                      </div>
                    )}
                    {selectedFeedback.problemSolvingSkills && (
                      <div>
                        <Label className="text-sm mb-2">
                          Problem Solving
                        </Label>
                        <StarRating
                          rating={selectedFeedback.problemSolvingSkills}
                          readonly
                        />
                      </div>
                    )}
                    {selectedFeedback.cultureFit && (
                      <div>
                        <Label className="text-sm mb-2">Culture Fit</Label>
                        <StarRating
                          rating={selectedFeedback.cultureFit}
                          readonly
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Feedback */}
              {selectedFeedback.feedback && (
                <div>
                  <Label className="text-base font-semibold mb-2">
                    Detailed Feedback
                  </Label>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedFeedback.feedback}
                    </p>
                  </div>
                </div>
              )}

              {/* Strengths */}
              {selectedFeedback.strengths && (
                <div>
                  <Label className="text-base font-semibold mb-2 flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-green-500" />
                    Strengths
                  </Label>
                  <div className="bg-green-500/5 border border-green-500/20 p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedFeedback.strengths}
                    </p>
                  </div>
                </div>
              )}

              {/* Areas for Improvement */}
              {selectedFeedback.areasForImprovement && (
                <div>
                  <Label className="text-base font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    Areas for Improvement
                  </Label>
                  <div className="bg-yellow-500/5 border border-yellow-500/20 p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedFeedback.areasForImprovement}
                    </p>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="pt-4 border-t text-sm text-muted-foreground space-y-1">
                <p>Interview Date: {formatDateTime(selectedFeedback.interviewDate)}</p>
                {selectedFeedback.submittedAt && (
                  <p>Submitted: {formatDateTime(selectedFeedback.submittedAt)}</p>
                )}
                <p>
                  Last Modified: {formatDateTime(selectedFeedback.lastModified)}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Feedback Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submit Interview Feedback</DialogTitle>
            <DialogDescription>
              Provide comprehensive feedback for {selectedFeedback?.candidateName}
            </DialogDescription>
          </DialogHeader>

          {selectedFeedback && (
            <div className="space-y-6">
              {/* Candidate Info */}
              <div className="flex items-center gap-4 pb-4 border-b">
                <Avatar className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  {selectedFeedback.candidateAvatar}
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {selectedFeedback.candidateName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedFeedback.jobTitle} at {selectedFeedback.company}
                  </p>
                </div>
              </div>

              {/* Overall Rating */}
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  Overall Rating *
                </Label>
                <StarRating
                  rating={overallRating}
                  onRatingChange={setOverallRating}
                />
              </div>

              {/* Specific Ratings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="mb-2 block">Technical Skills</Label>
                  <StarRating
                    rating={technicalSkills}
                    onRatingChange={setTechnicalSkills}
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Communication Skills</Label>
                  <StarRating
                    rating={communicationSkills}
                    onRatingChange={setCommunicationSkills}
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Problem Solving</Label>
                  <StarRating
                    rating={problemSolvingSkills}
                    onRatingChange={setProblemSolvingSkills}
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Culture Fit</Label>
                  <StarRating
                    rating={cultureFit}
                    onRatingChange={setCultureFit}
                  />
                </div>
              </div>

              {/* Recommendation */}
              <div>
                <Label className="mb-2 block">Recommendation *</Label>
                <Select value={recommendation} onValueChange={setRecommendation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recommendation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strong-hire">
                      <span className="flex items-center gap-2">
                        <ThumbsUp className="w-4 h-4 text-green-600" />
                        Strong Hire
                      </span>
                    </SelectItem>
                    <SelectItem value="hire">
                      <span className="flex items-center gap-2">
                        <ThumbsUp className="w-4 h-4 text-green-500" />
                        Hire
                      </span>
                    </SelectItem>
                    <SelectItem value="neutral">
                      <span className="flex items-center gap-2">
                        <Minus className="w-4 h-4 text-yellow-500" />
                        Neutral
                      </span>
                    </SelectItem>
                    <SelectItem value="no-hire">
                      <span className="flex items-center gap-2">
                        <ThumbsDown className="w-4 h-4 text-red-500" />
                        No Hire
                      </span>
                    </SelectItem>
                    <SelectItem value="strong-no-hire">
                      <span className="flex items-center gap-2">
                        <ThumbsDown className="w-4 h-4 text-red-600" />
                        Strong No Hire
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Detailed Feedback */}
              <div>
                <Label className="mb-2 block">Detailed Feedback *</Label>
                <Textarea
                  placeholder="Provide comprehensive feedback about the candidate's performance..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
              </div>

              {/* Strengths */}
              <div>
                <Label className="mb-2 block flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-green-500" />
                  Key Strengths
                </Label>
                <Textarea
                  placeholder="What were the candidate's main strengths?"
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Areas for Improvement */}
              <div>
                <Label className="mb-2 block flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  Areas for Improvement
                </Label>
                <Textarea
                  placeholder="What areas could the candidate improve on?"
                  value={areasForImprovement}
                  onChange={(e) => setAreasForImprovement(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={handleSaveDraft}
                  variant="outline"
                  className="flex-1"
                >
                  Save as Draft
                </Button>
                <Button
                  onClick={handleSubmitFeedback}
                  className="flex-1"
                >
                  Submit Feedback
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
