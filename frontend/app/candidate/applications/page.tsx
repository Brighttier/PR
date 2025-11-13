"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  Briefcase,
  Calendar,
  MapPin,
  TrendingUp,
  Eye,
  Search,
  Filter,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Building2,
  DollarSign,
  ArrowUpRight,
  File,
} from "lucide-react";

export default function MyApplicationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  // Mock data
  const applications = [
    {
      id: 1,
      jobTitle: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      companyLogo: "TC",
      location: "San Francisco, CA",
      type: "Full-time",
      salary: "$120k - $160k",
      appliedDate: "2024-01-08",
      appliedDateFormatted: "2 days ago",
      status: "Interview Scheduled",
      stage: "Technical Round",
      matchScore: 92,
      statusColor: "info",
      description: "We are looking for a senior frontend developer with 5+ years of experience in React and TypeScript.",
      aiSummary: {
        oneLiner: "Strong match for frontend architecture role",
        strengths: ["React expertise", "TypeScript proficiency", "System design"],
        recommendation: "Fast Track",
      },
      timeline: [
        { stage: "Applied", date: "Jan 8, 2024", status: "completed" },
        { stage: "Resume Review", date: "Jan 9, 2024", status: "completed" },
        { stage: "Technical Round", date: "Jan 12, 2024", status: "current" },
        { stage: "Manager Round", date: "Pending", status: "pending" },
        { stage: "Final Round", date: "Pending", status: "pending" },
      ],
    },
    {
      id: 2,
      jobTitle: "Full Stack Engineer",
      company: "StartupXYZ",
      companyLogo: "SX",
      location: "Remote",
      type: "Full-time",
      salary: "$100k - $140k",
      appliedDate: "2024-01-05",
      appliedDateFormatted: "5 days ago",
      status: "Under Review",
      stage: "Initial Screening",
      matchScore: 85,
      statusColor: "warning",
      description: "Join our growing team to build cutting-edge web applications.",
      aiSummary: {
        oneLiner: "Good fit for full-stack development",
        strengths: ["Full-stack experience", "Node.js skills"],
        recommendation: "Strong Candidate",
      },
      timeline: [
        { stage: "Applied", date: "Jan 5, 2024", status: "completed" },
        { stage: "Resume Review", date: "In Progress", status: "current" },
        { stage: "Phone Screen", date: "Pending", status: "pending" },
        { stage: "Technical Round", date: "Pending", status: "pending" },
      ],
    },
    {
      id: 3,
      jobTitle: "React Developer",
      company: "Digital Solutions",
      companyLogo: "DS",
      location: "New York, NY",
      type: "Full-time",
      salary: "$110k - $145k",
      appliedDate: "2024-01-03",
      appliedDateFormatted: "1 week ago",
      status: "Interview Completed",
      stage: "Final Round",
      matchScore: 88,
      statusColor: "success",
      description: "Looking for React developer to join our product team.",
      aiSummary: {
        oneLiner: "Excellent React skills alignment",
        strengths: ["React expertise", "Component architecture"],
        recommendation: "Fast Track",
      },
      timeline: [
        { stage: "Applied", date: "Jan 3, 2024", status: "completed" },
        { stage: "Resume Review", date: "Jan 4, 2024", status: "completed" },
        { stage: "Technical Round", date: "Jan 6, 2024", status: "completed" },
        { stage: "Final Round", date: "Jan 10, 2024", status: "completed" },
        { stage: "Decision", date: "Pending", status: "current" },
      ],
    },
    {
      id: 4,
      jobTitle: "Frontend Architect",
      company: "Enterprise Co.",
      companyLogo: "EC",
      location: "Austin, TX",
      type: "Full-time",
      salary: "$140k - $180k",
      appliedDate: "2023-12-28",
      appliedDateFormatted: "2 weeks ago",
      status: "Offer Extended",
      stage: "Offer",
      matchScore: 94,
      statusColor: "success",
      description: "Lead our frontend architecture team and drive technical decisions.",
      aiSummary: {
        oneLiner: "Perfect match for architecture role",
        strengths: ["Architecture experience", "Leadership", "React"],
        recommendation: "Fast Track",
      },
      timeline: [
        { stage: "Applied", date: "Dec 28, 2023", status: "completed" },
        { stage: "Resume Review", date: "Dec 29, 2023", status: "completed" },
        { stage: "Technical Round", date: "Jan 2, 2024", status: "completed" },
        { stage: "Manager Round", date: "Jan 5, 2024", status: "completed" },
        { stage: "Offer Extended", date: "Jan 9, 2024", status: "current" },
      ],
    },
    {
      id: 5,
      jobTitle: "JavaScript Developer",
      company: "CodeWorks",
      companyLogo: "CW",
      location: "Boston, MA",
      type: "Contract",
      salary: "$80/hr - $100/hr",
      appliedDate: "2023-12-20",
      appliedDateFormatted: "3 weeks ago",
      status: "Rejected",
      stage: "Initial Screening",
      matchScore: 65,
      statusColor: "destructive",
      description: "Contract position for JavaScript development.",
      aiSummary: {
        oneLiner: "Skills mismatch for required expertise",
        strengths: ["JavaScript basics"],
        recommendation: "Not Recommended",
      },
      timeline: [
        { stage: "Applied", date: "Dec 20, 2023", status: "completed" },
        { stage: "Resume Review", date: "Dec 22, 2023", status: "completed" },
        { stage: "Rejected", date: "Dec 23, 2023", status: "rejected" },
      ],
    },
  ];

  const stats = {
    total: applications.length,
    active: applications.filter(a => !['Rejected', 'Withdrawn', 'Offer Extended'].includes(a.status)).length,
    interviews: applications.filter(a => a.status.includes('Interview')).length,
    offers: applications.filter(a => a.status === 'Offer Extended').length,
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-green-700 bg-green-100 border-green-200";
    if (score >= 70) return "text-green-600 bg-green-50 border-green-100";
    if (score >= 50) return "text-yellow-600 bg-yellow-50 border-yellow-100";
    return "text-gray-600 bg-gray-50 border-gray-100";
  };

  const filteredApplications = applications
    .filter(app => {
      const matchesSearch = app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           app.company.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "recent") return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
      if (sortBy === "match") return b.matchScore - a.matchScore;
      return 0;
    });

  const [selectedApp, setSelectedApp] = useState(applications[0]);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Persona Recruit</h1>
              <p className="text-xs text-muted-foreground">Candidate Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <a href="/candidate" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <FileText className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </a>
          <a href="/candidate/applications" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground">
            <Briefcase className="w-5 h-5" />
            <span className="font-medium">My Applications</span>
            <Badge variant="secondary" className="ml-auto">
              {applications.length}
            </Badge>
          </a>
          <a href="/candidate/interviews" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Interviews</span>
          </a>
          <a href="/candidate/profile" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <FileText className="w-5 h-5" />
            <span className="font-medium">My Profile</span>
          </a>
          <a href="/candidate/documents" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <File className="w-5 h-5" />
            <span className="font-medium">My Documents</span>
          </a>
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center font-semibold">
              JC
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-sm">John Candidate</p>
              <p className="text-xs text-muted-foreground">candidate@example.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="border-b bg-card sticky top-0 z-10">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">My Applications</h2>
                <p className="text-muted-foreground">
                  Track and manage all your job applications
                </p>
              </div>
              <Button>
                <Briefcase className="w-4 h-4 mr-2" />
                Browse Jobs
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <FileText className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active</p>
                      <p className="text-2xl font-bold">{stats.active}</p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Interviews</p>
                      <p className="text-2xl font-bold">{stats.interviews}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Offers</p>
                      <p className="text-2xl font-bold">{stats.offers}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </header>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Applications List */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by job title or company..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Under Review">Under Review</SelectItem>
                        <SelectItem value="Interview Scheduled">Interview Scheduled</SelectItem>
                        <SelectItem value="Interview Completed">Interview Completed</SelectItem>
                        <SelectItem value="Offer Extended">Offer Extended</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">Most Recent</SelectItem>
                        <SelectItem value="match">Best Match</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredApplications.map((app) => (
                    <button
                      key={app.id}
                      onClick={() => setSelectedApp(app)}
                      className={`w-full text-left p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                        selectedApp.id === app.id ? 'border-primary bg-muted/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                          {app.companyLogo}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold">{app.jobTitle}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <Building2 className="w-3 h-3" />
                                <span>{app.company}</span>
                                <span>•</span>
                                <MapPin className="w-3 h-3" />
                                <span>{app.location}</span>
                              </div>
                            </div>
                            <div className={`px-2 py-1 rounded-md border text-xs font-semibold ${getMatchScoreColor(app.matchScore)}`}>
                              {app.matchScore}% Match
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={app.statusColor as any} className="text-xs">
                              {app.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {app.stage}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Applied {app.appliedDateFormatted}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Application Details */}
            <Card>
              <CardHeader>
                <CardTitle>Application Details</CardTitle>
                <CardDescription>Selected application information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Company Info */}
                <div>
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {selectedApp.companyLogo}
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-bold">{selectedApp.jobTitle}</h3>
                      <p className="text-sm text-muted-foreground">{selectedApp.company}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedApp.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedApp.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedApp.salary}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Applied {selectedApp.appliedDateFormatted}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">AI Match Analysis</h4>
                  <div className={`p-3 rounded-lg border mb-3 ${getMatchScoreColor(selectedApp.matchScore)}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-bold">{selectedApp.matchScore}% Match Score</span>
                    </div>
                    <p className="text-sm">{selectedApp.aiSummary.oneLiner}</p>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm font-medium mb-2">Key Strengths:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedApp.aiSummary.strengths.map((strength, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Badge variant="success" className="w-full justify-center">
                    {selectedApp.aiSummary.recommendation}
                  </Badge>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Application Timeline</h4>
                  <div className="space-y-3">
                    {selectedApp.timeline.map((item, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            item.status === 'completed' ? 'bg-green-500' :
                            item.status === 'current' ? 'bg-blue-500' :
                            item.status === 'rejected' ? 'bg-red-500' :
                            'bg-gray-300'
                          }`}>
                            {item.status === 'completed' && <CheckCircle className="w-4 h-4 text-white" />}
                            {item.status === 'current' && <Clock className="w-4 h-4 text-white" />}
                            {item.status === 'rejected' && <XCircle className="w-4 h-4 text-white" />}
                            {item.status === 'pending' && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          {idx < selectedApp.timeline.length - 1 && (
                            <div className={`w-0.5 h-8 ${
                              item.status === 'completed' || item.status === 'rejected' ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium text-sm">{item.stage}</p>
                          <p className="text-xs text-muted-foreground">{item.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <Button className="w-full" variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    View Job Details
                  </Button>
                  <Button className="w-full" variant="outline">
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    View Company Page
                  </Button>
                  {selectedApp.status === 'Interview Scheduled' && (
                    <Button className="w-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      Join Interview
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
