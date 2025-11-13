"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Video,
  Calendar,
  Clock,
  MapPin,
  Search,
  Filter,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  MessageSquare,
  Users,
  TrendingUp,
  Download,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Send,
  Phone,
  Mail,
  Briefcase,
  ChevronDown,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type InterviewStatus = "upcoming" | "in-progress" | "completed" | "cancelled";
type InterviewType = "technical" | "hr" | "manager" | "portfolio" | "final";

interface Interview {
  id: number;
  candidateName: string;
  candidateAvatar: string;
  jobTitle: string;
  company: string;
  scheduledAt: string;
  duration: string;
  type: InterviewType;
  status: InterviewStatus;
  matchScore: number;
  location: string;
  meetingLink?: string;
  candidateEmail: string;
  candidatePhone: string;
  resumeUrl?: string;
  notes?: string;
  feedbackSubmitted?: boolean;
  rating?: number;
}

export default function InterviewerInterviewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);

  // Mock data
  const interviews: Interview[] = [
    {
      id: 1,
      candidateName: "Sarah Johnson",
      candidateAvatar: "SJ",
      jobTitle: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      scheduledAt: "2025-11-11T14:00:00",
      duration: "60 min",
      type: "technical",
      status: "upcoming",
      matchScore: 92,
      location: "Virtual",
      meetingLink: "https://meet.google.com/abc-defg-hij",
      candidateEmail: "sarah.j@email.com",
      candidatePhone: "+1 (555) 123-4567",
      resumeUrl: "/resumes/sarah-johnson.pdf",
      notes: "Strong React and TypeScript experience. Check system design knowledge.",
    },
    {
      id: 2,
      candidateName: "Michael Chen",
      candidateAvatar: "MC",
      jobTitle: "Product Manager",
      company: "InnovateLabs",
      scheduledAt: "2025-11-12T10:00:00",
      duration: "45 min",
      type: "manager",
      status: "upcoming",
      matchScore: 87,
      location: "Office - Room 301",
      candidateEmail: "m.chen@email.com",
      candidatePhone: "+1 (555) 234-5678",
      resumeUrl: "/resumes/michael-chen.pdf",
    },
    {
      id: 3,
      candidateName: "Emily Rodriguez",
      candidateAvatar: "ER",
      jobTitle: "UX Designer",
      company: "DesignHub",
      scheduledAt: "2025-11-12T15:00:00",
      duration: "60 min",
      type: "portfolio",
      status: "upcoming",
      matchScore: 88,
      location: "Virtual",
      meetingLink: "https://zoom.us/j/123456789",
      candidateEmail: "emily.r@email.com",
      candidatePhone: "+1 (555) 345-6789",
    },
    {
      id: 4,
      candidateName: "James Wilson",
      candidateAvatar: "JW",
      jobTitle: "DevOps Engineer",
      company: "CloudTech Systems",
      scheduledAt: "2025-11-10T16:00:00",
      duration: "45 min",
      type: "technical",
      status: "completed",
      matchScore: 85,
      location: "Virtual",
      candidateEmail: "j.wilson@email.com",
      candidatePhone: "+1 (555) 456-7890",
      feedbackSubmitted: false,
      notes: "Interview completed. Needs feedback submission.",
    },
    {
      id: 5,
      candidateName: "Lisa Park",
      candidateAvatar: "LP",
      jobTitle: "Data Scientist",
      company: "DataVision",
      scheduledAt: "2025-11-09T11:00:00",
      duration: "60 min",
      type: "technical",
      status: "completed",
      matchScore: 94,
      location: "Virtual",
      candidateEmail: "lisa.park@email.com",
      candidatePhone: "+1 (555) 567-8901",
      feedbackSubmitted: true,
      rating: 5,
    },
    {
      id: 6,
      candidateName: "Robert Kumar",
      candidateAvatar: "RK",
      jobTitle: "Backend Developer",
      company: "TechCorp Inc.",
      scheduledAt: "2025-11-13T09:00:00",
      duration: "60 min",
      type: "technical",
      status: "upcoming",
      matchScore: 79,
      location: "Office - Room 205",
      candidateEmail: "r.kumar@email.com",
      candidatePhone: "+1 (555) 678-9012",
    },
  ];

  const getStatusColor = (status: InterviewStatus) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "in-progress":
        return "bg-green-50 text-green-700 border-green-200";
      case "completed":
        return "bg-gray-50 text-gray-700 border-gray-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getTypeLabel = (type: InterviewType) => {
    switch (type) {
      case "technical":
        return "Technical Round";
      case "hr":
        return "HR Round";
      case "manager":
        return "Manager Round";
      case "portfolio":
        return "Portfolio Review";
      case "final":
        return "Final Round";
      default:
        return type;
    }
  };

  const getTypeColor = (type: InterviewType) => {
    switch (type) {
      case "technical":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "hr":
        return "bg-pink-50 text-pink-700 border-pink-200";
      case "manager":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "portfolio":
        return "bg-teal-50 text-teal-700 border-teal-200";
      case "final":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const filteredInterviews = interviews.filter((interview) => {
    const matchesSearch =
      interview.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || interview.type === filterType;
    const matchesStatus = filterStatus === "all" || interview.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const upcomingCount = interviews.filter((i) => i.status === "upcoming").length;
  const completedCount = interviews.filter((i) => i.status === "completed").length;
  const pendingFeedbackCount = interviews.filter(
    (i) => i.status === "completed" && !i.feedbackSubmitted
  ).length;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${timeStr}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${timeStr}`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
  };

  return (
    <div className="flex h-screen bg-background">
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
          <a href="/interviewer/dashboard" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <FileText className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </a>
          <a href="/interviewer/interviews" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">My Interviews</span>
            <Badge variant="secondary" className="ml-auto">
              {upcomingCount}
            </Badge>
          </a>
          <a href="/interviewer/feedback" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">Feedback</span>
            {pendingFeedbackCount > 0 && (
              <Badge variant="destructive" className="ml-auto">
                {pendingFeedbackCount}
              </Badge>
            )}
          </a>
          <a href="/interviewer/candidates" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <Users className="w-5 h-5" />
            <span className="font-medium">Candidates</span>
          </a>
          <a href="/interviewer/calendar" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Calendar</span>
          </a>
          <a href="/interviewer/settings" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
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
      <main className="flex-1 overflow-auto bg-muted/30">
        <header className="border-b bg-card sticky top-0 z-10">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">My Interviews</h2>
                <p className="text-muted-foreground">
                  Manage and conduct your scheduled interviews
                </p>
              </div>
              <Button>
                <Calendar className="w-4 h-4 mr-2" />
                View Calendar
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Upcoming</p>
                      <p className="text-2xl font-bold">{upcomingCount}</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold">{completedCount}</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Feedback</p>
                      <p className="text-2xl font-bold">{pendingFeedbackCount}</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg. Rating</p>
                      <p className="text-2xl font-bold">4.2</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
                      <Star className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Filters and Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by candidate name, job title, or company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Interview Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="hr">HR Round</SelectItem>
                    <SelectItem value="manager">Manager Round</SelectItem>
                    <SelectItem value="portfolio">Portfolio Review</SelectItem>
                    <SelectItem value="final">Final Round</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Interviews Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Interviews</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="pending-feedback">Pending Feedback</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-6">
              {filteredInterviews.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No interviews found matching your filters</p>
                  </CardContent>
                </Card>
              ) : (
                filteredInterviews.map((interview) => (
                  <Card key={interview.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        {/* Candidate Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <Avatar className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center font-semibold text-lg">
                                {interview.candidateAvatar}
                              </Avatar>
                              <div>
                                <h3 className="font-semibold text-lg">{interview.candidateName}</h3>
                                <p className="text-sm text-muted-foreground">{interview.jobTitle}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  <Briefcase className="w-3 h-3 inline mr-1" />
                                  {interview.company}
                                </p>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Reschedule
                                </DropdownMenuItem>
                                {interview.resumeUrl && (
                                  <DropdownMenuItem>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Resume
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem className="text-red-600">
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Cancel Interview
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Interview Details */}
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span>{formatDateTime(interview.scheduledAt)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>{interview.duration}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span>{interview.location}</span>
                            </div>
                          </div>

                          {/* Contact Info */}
                          <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              <span>{interview.candidateEmail}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              <span>{interview.candidatePhone}</span>
                            </div>
                          </div>

                          {/* Badges */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            <Badge variant="outline" className={getStatusColor(interview.status)}>
                              {interview.status}
                            </Badge>
                            <Badge variant="outline" className={getTypeColor(interview.type)}>
                              {getTypeLabel(interview.type)}
                            </Badge>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <Star className="w-3 h-3 mr-1 fill-green-600" />
                              Match: {interview.matchScore}%
                            </Badge>
                            {interview.feedbackSubmitted && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Feedback Submitted
                              </Badge>
                            )}
                          </div>

                          {/* Notes */}
                          {interview.notes && (
                            <div className="bg-muted/50 p-3 rounded-lg text-sm">
                              <p className="text-muted-foreground">{interview.notes}</p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 min-w-[180px]">
                          {interview.status === "upcoming" && (
                            <>
                              {interview.meetingLink && (
                                <Button className="w-full">
                                  <Video className="w-4 h-4 mr-2" />
                                  Join Meeting
                                </Button>
                              )}
                              <Button variant="outline" className="w-full">
                                <FileText className="w-4 h-4 mr-2" />
                                View Resume
                              </Button>
                              <Button variant="outline" className="w-full">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Notes
                              </Button>
                            </>
                          )}
                          {interview.status === "completed" && !interview.feedbackSubmitted && (
                            <>
                              <Button
                                className="w-full"
                                onClick={() => {
                                  setSelectedInterview(interview);
                                  setFeedbackDialogOpen(true);
                                }}
                              >
                                <Send className="w-4 h-4 mr-2" />
                                Submit Feedback
                              </Button>
                              <Button variant="outline" className="w-full">
                                <FileText className="w-4 h-4 mr-2" />
                                View Resume
                              </Button>
                            </>
                          )}
                          {interview.status === "completed" && interview.feedbackSubmitted && (
                            <>
                              <Button variant="outline" className="w-full">
                                <Eye className="w-4 h-4 mr-2" />
                                View Feedback
                              </Button>
                              <Button variant="outline" className="w-full">
                                <Download className="w-4 h-4 mr-2" />
                                Export Report
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-4 mt-6">
              {filteredInterviews.filter((i) => i.status === "upcoming").length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No upcoming interviews</p>
                  </CardContent>
                </Card>
              ) : (
                filteredInterviews
                  .filter((i) => i.status === "upcoming")
                  .map((interview) => (
                    <Card key={interview.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        {/* Same content as above */}
                        <div className="flex gap-6">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-4">
                                <Avatar className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center font-semibold text-lg">
                                  {interview.candidateAvatar}
                                </Avatar>
                                <div>
                                  <h3 className="font-semibold text-lg">{interview.candidateName}</h3>
                                  <p className="text-sm text-muted-foreground">{interview.jobTitle}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    <Briefcase className="w-3 h-3 inline mr-1" />
                                    {interview.company}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span>{formatDateTime(interview.scheduledAt)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span>{interview.duration}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span>{interview.location}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className={getTypeColor(interview.type)}>
                                {getTypeLabel(interview.type)}
                              </Badge>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Star className="w-3 h-3 mr-1 fill-green-600" />
                                Match: {interview.matchScore}%
                              </Badge>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 min-w-[180px]">
                            {interview.meetingLink && (
                              <Button className="w-full">
                                <Video className="w-4 h-4 mr-2" />
                                Join Meeting
                              </Button>
                            )}
                            <Button variant="outline" className="w-full">
                              <FileText className="w-4 h-4 mr-2" />
                              View Resume
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4 mt-6">
              {filteredInterviews.filter((i) => i.status === "completed").map((interview) => (
                <Card key={interview.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center font-semibold text-lg">
                              {interview.candidateAvatar}
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-lg">{interview.candidateName}</h3>
                              <p className="text-sm text-muted-foreground">{interview.jobTitle}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                            Completed
                          </Badge>
                          {interview.feedbackSubmitted ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Feedback Submitted
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Pending Feedback
                            </Badge>
                          )}
                          {interview.rating && (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              <Star className="w-3 h-3 mr-1 fill-purple-600" />
                              Rating: {interview.rating}/5
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 min-w-[180px]">
                        {!interview.feedbackSubmitted ? (
                          <Button
                            className="w-full"
                            onClick={() => {
                              setSelectedInterview(interview);
                              setFeedbackDialogOpen(true);
                            }}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Submit Feedback
                          </Button>
                        ) : (
                          <>
                            <Button variant="outline" className="w-full">
                              <Eye className="w-4 h-4 mr-2" />
                              View Feedback
                            </Button>
                            <Button variant="outline" className="w-full">
                              <Download className="w-4 h-4 mr-2" />
                              Export Report
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="pending-feedback" className="space-y-4 mt-6">
              {filteredInterviews.filter((i) => i.status === "completed" && !i.feedbackSubmitted).map((interview) => (
                <Card key={interview.id} className="hover:shadow-md transition-shadow border-orange-200">
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center font-semibold text-lg">
                              {interview.candidateAvatar}
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-lg">{interview.candidateName}</h3>
                              <p className="text-sm text-muted-foreground">{interview.jobTitle}</p>
                              <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Feedback pending submission
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className={getTypeColor(interview.type)}>
                            {getTypeLabel(interview.type)}
                          </Badge>
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                            Interviewed on {formatDateTime(interview.scheduledAt)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 min-w-[180px]">
                        <Button
                          className="w-full"
                          onClick={() => {
                            setSelectedInterview(interview);
                            setFeedbackDialogOpen(true);
                          }}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Submit Feedback
                        </Button>
                        <Button variant="outline" className="w-full">
                          <FileText className="w-4 h-4 mr-2" />
                          View Resume
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit Interview Feedback</DialogTitle>
            <DialogDescription>
              Provide your evaluation for {selectedInterview?.candidateName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Rating */}
            <div className="space-y-2">
              <Label>Overall Rating</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    variant="outline"
                    size="lg"
                    className="w-16 h-16"
                  >
                    <Star className="w-6 h-6" />
                  </Button>
                ))}
              </div>
            </div>

            {/* Technical Skills */}
            <div className="space-y-2">
              <Label htmlFor="technical-skills">Technical Skills Assessment</Label>
              <Select>
                <SelectTrigger id="technical-skills">
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="average">Average</SelectItem>
                  <SelectItem value="below-average">Below Average</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Communication */}
            <div className="space-y-2">
              <Label htmlFor="communication">Communication Skills</Label>
              <Select>
                <SelectTrigger id="communication">
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="average">Average</SelectItem>
                  <SelectItem value="below-average">Below Average</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Detailed Feedback */}
            <div className="space-y-2">
              <Label htmlFor="feedback">Detailed Feedback</Label>
              <Textarea
                id="feedback"
                placeholder="Provide detailed feedback about the candidate's performance..."
                rows={6}
              />
            </div>

            {/* Recommendation */}
            <div className="space-y-2">
              <Label htmlFor="recommendation">Recommendation</Label>
              <Select>
                <SelectTrigger id="recommendation">
                  <SelectValue placeholder="Select recommendation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strongly-recommend">Strongly Recommend</SelectItem>
                  <SelectItem value="recommend">Recommend</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="not-recommend">Do Not Recommend</SelectItem>
                  <SelectItem value="strongly-not-recommend">Strongly Do Not Recommend</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setFeedbackDialogOpen(false)}
              >
                Save as Draft
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  // Handle feedback submission
                  setFeedbackDialogOpen(false);
                }}
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Feedback
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
