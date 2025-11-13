"use client";

import { useState } from "react";
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
  Building2,
  Search,
  Filter,
  Download,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Star,
  Eye,
  FileText,
  Calendar,
  TrendingUp,
  Users,
  Target,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  LinkedinIcon,
  Github,
  Globe,
  Folder,
  Plus,
  BarChart3,
  Settings,
  Sparkles,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type CandidateStatus = "active" | "hired" | "rejected" | "withdrawn";

interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  currentRole: string;
  company: string;
  location: string;
  experience: string;
  education: string;
  skills: string[];
  applications: number;
  avgMatchScore: number;
  lastActive: string;
  status: CandidateStatus;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
  resumeUrl?: string;
  summary?: string;
  interviews: number;
  offers: number;
}

export default function CompanyAdminCandidatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showCandidateDialog, setShowCandidateDialog] = useState(false);
  const [showAddNoteDialog, setShowAddNoteDialog] = useState(false);
  const [note, setNote] = useState("");

  // Mock candidates data
  const candidates: Candidate[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+1 (555) 123-4567",
      avatar: "",
      currentRole: "Senior Software Engineer",
      company: "TechCorp",
      location: "San Francisco, CA",
      experience: "8 years",
      education: "BS Computer Science - Stanford University",
      skills: ["React", "TypeScript", "Node.js", "AWS", "Docker", "GraphQL"],
      applications: 3,
      avgMatchScore: 94,
      lastActive: "2 hours ago",
      status: "active",
      linkedIn: "linkedin.com/in/sarahjohnson",
      github: "github.com/sarahjohnson",
      portfolio: "sarahjohnson.dev",
      summary: "Experienced full-stack engineer with a passion for building scalable web applications. Led multiple high-impact projects and mentored junior developers.",
      interviews: 2,
      offers: 0,
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael.chen@email.com",
      phone: "+1 (555) 234-5678",
      avatar: "",
      currentRole: "Product Manager",
      company: "InnovateLab",
      location: "New York, NY",
      experience: "6 years",
      education: "MBA - Harvard Business School",
      skills: ["Product Strategy", "Agile", "User Research", "Data Analysis", "SQL"],
      applications: 2,
      avgMatchScore: 88,
      lastActive: "1 day ago",
      status: "active",
      linkedIn: "linkedin.com/in/michaelchen",
      summary: "Product leader with a track record of launching successful products. Strong analytical skills and customer-centric approach.",
      interviews: 1,
      offers: 0,
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      email: "emily.rodriguez@email.com",
      phone: "+1 (555) 345-6789",
      avatar: "",
      currentRole: "UX Designer",
      company: "DesignHub",
      location: "Austin, TX",
      experience: "5 years",
      education: "BFA Design - Rhode Island School of Design",
      skills: ["Figma", "User Research", "Prototyping", "Design Systems", "Accessibility"],
      applications: 4,
      avgMatchScore: 92,
      lastActive: "3 hours ago",
      status: "active",
      portfolio: "emilyrodriguez.design",
      summary: "Creative UX designer focused on creating intuitive and accessible user experiences. Collaborated with cross-functional teams to deliver award-winning designs.",
      interviews: 3,
      offers: 1,
    },
    {
      id: 4,
      name: "David Kim",
      email: "david.kim@email.com",
      phone: "+1 (555) 456-7890",
      avatar: "",
      currentRole: "Data Scientist",
      company: "DataTech Solutions",
      location: "Seattle, WA",
      experience: "7 years",
      education: "PhD Statistics - MIT",
      skills: ["Python", "Machine Learning", "TensorFlow", "SQL", "R", "Data Visualization"],
      applications: 2,
      avgMatchScore: 89,
      lastActive: "5 hours ago",
      status: "hired",
      linkedIn: "linkedin.com/in/davidkim",
      github: "github.com/davidkim",
      summary: "Data scientist specializing in machine learning and predictive analytics. Published researcher with expertise in deep learning.",
      interviews: 2,
      offers: 1,
    },
    {
      id: 5,
      name: "Jessica Taylor",
      email: "jessica.taylor@email.com",
      phone: "+1 (555) 567-8901",
      avatar: "",
      currentRole: "Marketing Manager",
      company: "BrandWorks",
      location: "Los Angeles, CA",
      experience: "4 years",
      education: "BA Marketing - UCLA",
      skills: ["Digital Marketing", "SEO", "Content Strategy", "Analytics", "Social Media"],
      applications: 1,
      avgMatchScore: 79,
      lastActive: "2 days ago",
      status: "active",
      linkedIn: "linkedin.com/in/jessicataylor",
      summary: "Marketing professional with expertise in digital campaigns and brand strategy. Proven track record of driving growth and engagement.",
      interviews: 1,
      offers: 0,
    },
    {
      id: 6,
      name: "Robert Anderson",
      email: "robert.anderson@email.com",
      phone: "+1 (555) 678-9012",
      avatar: "",
      currentRole: "DevOps Engineer",
      company: "CloudFirst Inc",
      location: "Remote",
      experience: "9 years",
      education: "BS Information Technology - Georgia Tech",
      skills: ["Kubernetes", "AWS", "Terraform", "CI/CD", "Python", "Monitoring"],
      applications: 2,
      avgMatchScore: 91,
      lastActive: "1 hour ago",
      status: "active",
      github: "github.com/robertanderson",
      summary: "DevOps expert focused on automation and infrastructure optimization. Experience managing large-scale cloud deployments.",
      interviews: 1,
      offers: 0,
    },
    {
      id: 7,
      name: "Amanda White",
      email: "amanda.white@email.com",
      phone: "+1 (555) 789-0123",
      avatar: "",
      currentRole: "Sales Director",
      company: "SalesPro",
      location: "Chicago, IL",
      experience: "10 years",
      education: "BA Business Administration - Northwestern",
      skills: ["Enterprise Sales", "Negotiation", "CRM", "Team Leadership", "Strategy"],
      applications: 1,
      avgMatchScore: 76,
      lastActive: "1 week ago",
      status: "rejected",
      linkedIn: "linkedin.com/in/amandawhite",
      summary: "Sales leader with consistent track record of exceeding targets. Strong relationship builder with Fortune 500 experience.",
      interviews: 1,
      offers: 0,
    },
    {
      id: 8,
      name: "Chris Martinez",
      email: "chris.martinez@email.com",
      phone: "+1 (555) 890-1234",
      avatar: "",
      currentRole: "Full Stack Developer",
      company: "WebDev Solutions",
      location: "Miami, FL",
      experience: "3 years",
      education: "BS Computer Science - University of Florida",
      skills: ["JavaScript", "React", "Node.js", "MongoDB", "Express", "Git"],
      applications: 2,
      avgMatchScore: 82,
      lastActive: "4 hours ago",
      status: "active",
      github: "github.com/chrismartinez",
      portfolio: "chrismartinez.io",
      summary: "Passionate developer eager to learn and grow. Experience building modern web applications with full-stack technologies.",
      interviews: 1,
      offers: 0,
    },
  ];

  const stats = {
    total: candidates.length,
    active: candidates.filter((c) => c.status === "active").length,
    hired: candidates.filter((c) => c.status === "hired").length,
    avgMatchScore: Math.round(
      candidates.reduce((acc, c) => acc + c.avgMatchScore, 0) / candidates.length
    ),
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.currentRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.skills.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesStatus =
      statusFilter === "all" || candidate.status === statusFilter;

    const matchesExperience =
      experienceFilter === "all" ||
      (experienceFilter === "junior" && parseInt(candidate.experience) <= 3) ||
      (experienceFilter === "mid" &&
        parseInt(candidate.experience) > 3 &&
        parseInt(candidate.experience) <= 6) ||
      (experienceFilter === "senior" && parseInt(candidate.experience) > 6);

    return matchesSearch && matchesStatus && matchesExperience;
  });

  const handleViewCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setShowCandidateDialog(true);
  };

  const getStatusBadge = (status: CandidateStatus) => {
    const styles = {
      active: "bg-green-50 text-green-700 border-green-200",
      hired: "bg-blue-50 text-blue-700 border-blue-200",
      rejected: "bg-red-50 text-red-700 border-red-200",
      withdrawn: "bg-gray-50 text-gray-700 border-gray-200",
    };
    return styles[status];
  };

  const getStatusIcon = (status: CandidateStatus) => {
    switch (status) {
      case "active":
        return <AlertCircle className="w-3 h-3 mr-1" />;
      case "hired":
        return <CheckCircle2 className="w-3 h-3 mr-1" />;
      case "rejected":
        return <XCircle className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">Company Admin</h2>
              <p className="text-xs text-muted-foreground">TechCorp Inc.</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <a
            href="/company-admin/dashboard"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted"
          >
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </a>
          <a
            href="/company-admin/jobs"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted"
          >
            <Briefcase className="w-5 h-5" />
            <span className="font-medium">Jobs</span>
          </a>
          <a
            href="/company-admin/applications"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted"
          >
            <FileText className="w-5 h-5" />
            <span className="font-medium">Applications</span>
          </a>
          <a
            href="/company-admin/candidates"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground"
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Candidates</span>
          </a>
          <a
            href="/company-admin/team"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted"
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Team</span>
          </a>
          <a
            href="/company-admin/talent-pool"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted"
          >
            <Folder className="w-5 h-5" />
            <span className="font-medium">Talent Pool</span>
          </a>
          <a
            href="/company-admin/calendar"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted"
          >
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Calendar</span>
          </a>
          <a
            href="/company-admin/settings"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Candidates</h1>
                <p className="text-muted-foreground">
                  Manage and track all candidates who have applied to your jobs
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Candidate
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Candidates</p>
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
                      <p className="text-sm text-muted-foreground mb-1">Active</p>
                      <p className="text-2xl font-bold">{stats.active}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500" />
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
                    <CheckCircle2 className="w-8 h-8 text-purple-500" />
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
                    <Target className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, role, or skills..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
              <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="junior">Junior (0-3 years)</SelectItem>
                  <SelectItem value="mid">Mid (4-6 years)</SelectItem>
                  <SelectItem value="senior">Senior (7+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Candidates Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Avg Match</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCandidates.map((candidate) => (
                    <TableRow
                      key={candidate.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleViewCandidate(candidate)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={candidate.avatar} />
                            <AvatarFallback>
                              {candidate.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{candidate.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {candidate.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{candidate.currentRole}</p>
                          <p className="text-xs text-muted-foreground">
                            {candidate.company}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {candidate.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{candidate.experience}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{candidate.applications}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${
                            candidate.avgMatchScore >= 90
                              ? "bg-green-50 text-green-700 border-green-200"
                              : candidate.avgMatchScore >= 80
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : candidate.avgMatchScore >= 70
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : "bg-gray-50 text-gray-700 border-gray-200"
                          }`}
                        >
                          {candidate.avgMatchScore}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusBadge(candidate.status)}
                        >
                          {getStatusIcon(candidate.status)}
                          {candidate.status.charAt(0).toUpperCase() +
                            candidate.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {candidate.lastActive}
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
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleViewCandidate(candidate);
                            }}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <Mail className="w-4 h-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <FileText className="w-4 h-4 mr-2" />
                              View Applications
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <Folder className="w-4 h-4 mr-2" />
                              Add to Talent Pool
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredCandidates.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No candidates found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Candidate Details Dialog */}
      <Dialog open={showCandidateDialog} onOpenChange={setShowCandidateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedCandidate && (
            <>
              <DialogHeader>
                <DialogTitle>Candidate Profile</DialogTitle>
                <DialogDescription>
                  Detailed information about {selectedCandidate.name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Header Section */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={selectedCandidate.avatar} />
                    <AvatarFallback className="text-2xl">
                      {selectedCandidate.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-2xl font-bold">{selectedCandidate.name}</h3>
                        <p className="text-muted-foreground">
                          {selectedCandidate.currentRole} at {selectedCandidate.company}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={getStatusBadge(selectedCandidate.status)}
                      >
                        {getStatusIcon(selectedCandidate.status)}
                        {selectedCandidate.status.charAt(0).toUpperCase() +
                          selectedCandidate.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {selectedCandidate.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {selectedCandidate.phone}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {selectedCandidate.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {selectedCandidate.experience}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      {selectedCandidate.linkedIn && (
                        <Button variant="outline" size="sm" className="gap-2">
                          <LinkedinIcon className="w-4 h-4" />
                          LinkedIn
                        </Button>
                      )}
                      {selectedCandidate.github && (
                        <Button variant="outline" size="sm" className="gap-2">
                          <Github className="w-4 h-4" />
                          GitHub
                        </Button>
                      )}
                      {selectedCandidate.portfolio && (
                        <Button variant="outline" size="sm" className="gap-2">
                          <Globe className="w-4 h-4" />
                          Portfolio
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="applications">
                      Applications ({selectedCandidate.applications})
                    </TabsTrigger>
                    <TabsTrigger value="interviews">
                      Interviews ({selectedCandidate.interviews})
                    </TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    {/* Summary */}
                    {selectedCandidate.summary && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                            AI Summary
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground">
                            {selectedCandidate.summary}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Skills */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Skills</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {selectedCandidate.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Education */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <GraduationCap className="w-5 h-5" />
                          Education
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">
                          {selectedCandidate.education}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">
                              {selectedCandidate.avgMatchScore}%
                            </p>
                            <p className="text-sm text-muted-foreground">Avg Match Score</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">
                              {selectedCandidate.interviews}
                            </p>
                            <p className="text-sm text-muted-foreground">Interviews</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600">
                              {selectedCandidate.offers}
                            </p>
                            <p className="text-sm text-muted-foreground">Offers</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="applications">
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">
                          Application history will be displayed here
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="interviews">
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">
                          Interview history will be displayed here
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="notes">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <Button
                            onClick={() => setShowAddNoteDialog(true)}
                            className="w-full gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Add Note
                          </Button>
                          <p className="text-center text-muted-foreground">
                            No notes yet. Add your first note about this candidate.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button className="flex-1 gap-2">
                    <Mail className="w-4 h-4" />
                    Send Email
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <FileText className="w-4 h-4" />
                    View Resume
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <Folder className="w-4 h-4" />
                    Add to Talent Pool
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={showAddNoteDialog} onOpenChange={setShowAddNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>
              Add a note about {selectedCandidate?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Note</Label>
              <Textarea
                placeholder="Enter your note here..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={5}
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAddNoteDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setNote("");
                  setShowAddNoteDialog(false);
                }}
                className="flex-1"
              >
                Save Note
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
