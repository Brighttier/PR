"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
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
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  FileText,
  Settings,
  Plus,
  Search,
  Filter,
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
  BarChart3,
  Globe,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type JobStatus = "published" | "draft" | "closed" | "paused";

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  salary: string;
  status: JobStatus;
  applicants: number;
  views: number;
  matchScore: number;
  postedDate: string;
  closingDate: string;
  description: string;
  requirements: string[];
  benefits: string[];
  aiGenerated: boolean;
}

export default function CompanyAdminJobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Mock data
  const jobs: Job[] = [
    {
      id: "1",
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "San Francisco, CA",
      type: "Full-time",
      experience: "5+ years",
      salary: "$120k - $160k",
      status: "published",
      applicants: 45,
      views: 234,
      matchScore: 87,
      postedDate: "2025-01-05",
      closingDate: "2025-02-05",
      description: "We are looking for an experienced Frontend Developer...",
      requirements: ["5+ years React", "TypeScript", "System Design"],
      benefits: ["Health Insurance", "401k", "Remote Work"],
      aiGenerated: true,
    },
    {
      id: "2",
      title: "Product Manager",
      department: "Product",
      location: "Remote",
      type: "Full-time",
      experience: "3-5 years",
      salary: "$100k - $140k",
      status: "published",
      applicants: 28,
      views: 189,
      matchScore: 92,
      postedDate: "2025-01-08",
      closingDate: "2025-02-08",
      description: "Join our product team to build innovative solutions...",
      requirements: ["Product Management", "Agile", "Analytics"],
      benefits: ["Health Insurance", "Stock Options", "Flexible Hours"],
      aiGenerated: false,
    },
    {
      id: "3",
      title: "UX Designer",
      department: "Design",
      location: "New York, NY",
      type: "Full-time",
      experience: "2-4 years",
      salary: "$90k - $120k",
      status: "draft",
      applicants: 0,
      views: 0,
      matchScore: 85,
      postedDate: "",
      closingDate: "",
      description: "We're seeking a talented UX Designer...",
      requirements: ["Figma", "User Research", "Prototyping"],
      benefits: ["Health Insurance", "Unlimited PTO", "Learning Budget"],
      aiGenerated: true,
    },
    {
      id: "4",
      title: "Backend Engineer",
      department: "Engineering",
      location: "Austin, TX",
      type: "Full-time",
      experience: "3-6 years",
      salary: "$110k - $145k",
      status: "published",
      applicants: 67,
      views: 345,
      matchScore: 90,
      postedDate: "2025-01-03",
      closingDate: "2025-02-03",
      description: "Looking for a Backend Engineer to build scalable systems...",
      requirements: ["Node.js", "Python", "Microservices", "AWS"],
      benefits: ["Health Insurance", "401k", "Relocation Assistance"],
      aiGenerated: false,
    },
    {
      id: "5",
      title: "Data Scientist",
      department: "Data",
      location: "Boston, MA",
      type: "Full-time",
      experience: "4+ years",
      salary: "$130k - $170k",
      status: "paused",
      applicants: 23,
      views: 156,
      matchScore: 88,
      postedDate: "2024-12-20",
      closingDate: "2025-01-20",
      description: "Join our data team to drive insights...",
      requirements: ["Machine Learning", "Python", "SQL", "Statistics"],
      benefits: ["Health Insurance", "Stock Options", "Conference Budget"],
      aiGenerated: true,
    },
    {
      id: "6",
      title: "DevOps Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      experience: "4-7 years",
      salary: "$125k - $155k",
      status: "closed",
      applicants: 89,
      views: 423,
      matchScore: 91,
      postedDate: "2024-12-01",
      closingDate: "2025-01-01",
      description: "We need a DevOps Engineer to manage our infrastructure...",
      requirements: ["Kubernetes", "Docker", "CI/CD", "AWS"],
      benefits: ["Health Insurance", "401k", "Remote Work"],
      aiGenerated: false,
    },
  ];

  const stats = {
    total: jobs.length,
    published: jobs.filter(j => j.status === "published").length,
    draft: jobs.filter(j => j.status === "draft").length,
    totalApplicants: jobs.reduce((sum, j) => sum + j.applicants, 0),
    avgMatchScore: Math.round(jobs.reduce((sum, j) => sum + j.matchScore, 0) / jobs.length),
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

  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setDetailsOpen(true);
  };

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
              <p className="text-xs text-muted-foreground">Company Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <a href="/company-admin/dashboard" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </a>
          <a href="/company-admin/jobs" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground">
            <Briefcase className="w-5 h-5" />
            <span className="font-medium">Jobs</span>
            <Badge variant="secondary" className="ml-auto">
              {jobs.length}
            </Badge>
          </a>
          <a href="/company-admin/candidates" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <Users className="w-5 h-5" />
            <span className="font-medium">Candidates</span>
          </a>
          <a href="/company-admin/interviews" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Interviews</span>
          </a>
          <a href="/company-admin/analytics" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Analytics</span>
          </a>
          <a href="/company-admin/settings" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </a>
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center font-semibold">
              HA
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-sm">HR Admin</p>
              <p className="text-xs text-muted-foreground">admin@techcorp.com</p>
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
                <a href="/company-admin/jobs/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Post New Job
                  </Button>
                </a>
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
                      <p className="text-sm text-muted-foreground">Avg Match Score</p>
                      <p className="text-2xl font-bold">{stats.avgMatchScore}%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-orange-500" />
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applicants</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Match Score</TableHead>
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
                            {job.aiGenerated && (
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                <Sparkles className="w-3 h-3 mr-1" />
                                AI
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {job.type} • {job.experience}
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
                          <span className="font-medium">{job.applicants}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                          <span>{job.views}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${
                          job.matchScore >= 90 ? "bg-green-50 text-green-700 border-green-200" :
                          job.matchScore >= 80 ? "bg-blue-50 text-blue-700 border-blue-200" :
                          "bg-gray-50 text-gray-700 border-gray-200"
                        }`}>
                          {job.matchScore}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {job.postedDate || "Not posted"}
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
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Job
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
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
              {selectedJob?.aiGenerated && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Generated
                </Badge>
              )}
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
                  <p>{selectedJob.experience}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Salary Range</p>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedJob.salary}</span>
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
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedJob.applicants}</p>
                  <p className="text-sm text-muted-foreground">Applicants</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedJob.views}</p>
                  <p className="text-sm text-muted-foreground">Views</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedJob.matchScore}%</p>
                  <p className="text-sm text-muted-foreground">Avg Match</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button className="flex-1">
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
    </div>
  );
}
