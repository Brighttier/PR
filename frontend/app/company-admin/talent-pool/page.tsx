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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  Search,
  Plus,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Eye,
  FileText,
  Users,
  Target,
  Star,
  Folder,
  FolderPlus,
  Download,
  Trash2,
  Edit,
  BarChart3,
  Settings,
  Calendar,
  Filter,
  UserPlus,
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
  LinkedinIcon,
  Github,
  Globe,
  Tag,
  Archive,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TalentCandidate {
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
  matchScore: number;
  addedDate: string;
  lastContacted: string;
  status: "available" | "passive" | "not_looking" | "hired";
  source: string;
  tags: string[];
  folders: string[];
  linkedIn?: string;
  github?: string;
  portfolio?: string;
  notes: string;
}

interface TalentFolder {
  id: number;
  name: string;
  description: string;
  color: string;
  candidateCount: number;
  createdDate: string;
}

export default function TalentPoolPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [skillFilter, setSkillFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [folderFilter, setFolderFilter] = useState("all");
  const [selectedCandidate, setSelectedCandidate] = useState<TalentCandidate | null>(null);
  const [showCandidateDialog, setShowCandidateDialog] = useState(false);
  const [showAddCandidateDialog, setShowAddCandidateDialog] = useState(false);
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);
  const [showAddToFolderDialog, setShowAddToFolderDialog] = useState(false);

  // Add candidate form state
  const [newCandidateName, setNewCandidateName] = useState("");
  const [newCandidateEmail, setNewCandidateEmail] = useState("");
  const [newCandidatePhone, setNewCandidatePhone] = useState("");
  const [newCandidateLinkedIn, setNewCandidateLinkedIn] = useState("");

  // Create folder form state
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("blue");

  // Mock talent pool candidates
  const candidates: TalentCandidate[] = [
    {
      id: 1,
      name: "Alex Thompson",
      email: "alex.thompson@email.com",
      phone: "+1 (555) 111-2222",
      avatar: "",
      currentRole: "Senior Product Designer",
      company: "DesignCo",
      location: "San Francisco, CA",
      experience: "7 years",
      education: "BFA Design - RISD",
      skills: ["Figma", "UI/UX", "Design Systems", "Prototyping", "User Research"],
      matchScore: 92,
      addedDate: "Dec 15, 2023",
      lastContacted: "Jan 5, 2024",
      status: "passive",
      source: "LinkedIn",
      tags: ["Design", "Senior", "Remote OK"],
      folders: ["Design Talent", "Future Hires"],
      linkedIn: "linkedin.com/in/alexthompson",
      portfolio: "alexthompson.design",
      notes: "Excellent portfolio. Interested in remote opportunities. Follow up in Q2.",
    },
    {
      id: 2,
      name: "Maria Garcia",
      email: "maria.garcia@email.com",
      phone: "+1 (555) 222-3333",
      avatar: "",
      currentRole: "Full Stack Engineer",
      company: "TechStart",
      location: "Austin, TX",
      experience: "5 years",
      education: "BS Computer Science - UT Austin",
      skills: ["React", "Node.js", "Python", "AWS", "Docker"],
      matchScore: 88,
      addedDate: "Dec 20, 2023",
      lastContacted: "Never",
      status: "available",
      source: "Referral",
      tags: ["Engineering", "Full Stack", "Available"],
      folders: ["Engineering Talent"],
      github: "github.com/mariagarcia",
      notes: "Referred by John. Open to new opportunities. Strong backend skills.",
    },
    {
      id: 3,
      name: "James Wilson",
      email: "james.wilson@email.com",
      phone: "+1 (555) 333-4444",
      avatar: "",
      currentRole: "Data Science Manager",
      company: "DataCorp",
      location: "Boston, MA",
      experience: "9 years",
      education: "PhD Machine Learning - MIT",
      skills: ["Python", "TensorFlow", "SQL", "Leadership", "MLOps"],
      matchScore: 95,
      addedDate: "Nov 10, 2023",
      lastContacted: "Dec 20, 2023",
      status: "passive",
      source: "Conference",
      tags: ["Data Science", "Leadership", "PhD"],
      folders: ["Senior Talent", "Future Hires"],
      linkedIn: "linkedin.com/in/jameswilson",
      notes: "Met at AI Summit. Very impressive background. Keep warm relationship.",
    },
    {
      id: 4,
      name: "Sophie Chen",
      email: "sophie.chen@email.com",
      phone: "+1 (555) 444-5555",
      avatar: "",
      currentRole: "Product Manager",
      company: "ProductHub",
      location: "Seattle, WA",
      experience: "6 years",
      education: "MBA - Stanford GSB",
      skills: ["Product Strategy", "Agile", "Data Analysis", "User Research", "Roadmapping"],
      matchScore: 90,
      addedDate: "Jan 2, 2024",
      lastContacted: "Never",
      status: "available",
      source: "Application",
      tags: ["Product", "MBA", "Available"],
      folders: ["Product Talent"],
      linkedIn: "linkedin.com/in/sophiechen",
      notes: "Applied previously. Strong product sense. Reach out for PM role.",
    },
    {
      id: 5,
      name: "Robert Kumar",
      email: "robert.kumar@email.com",
      phone: "+1 (555) 555-6666",
      avatar: "",
      currentRole: "DevOps Architect",
      company: "CloudTech",
      location: "Remote",
      experience: "10 years",
      education: "MS Computer Science - Georgia Tech",
      skills: ["Kubernetes", "AWS", "Terraform", "CI/CD", "Monitoring"],
      matchScore: 94,
      addedDate: "Oct 5, 2023",
      lastContacted: "Nov 15, 2023",
      status: "not_looking",
      source: "LinkedIn",
      tags: ["DevOps", "Senior", "Remote"],
      folders: ["Engineering Talent", "Senior Talent"],
      linkedIn: "linkedin.com/in/robertkumar",
      github: "github.com/robertkumar",
      notes: "Happy at current role but open to exceptional opportunities. Check back in 6 months.",
    },
    {
      id: 6,
      name: "Emily White",
      email: "emily.white@email.com",
      phone: "+1 (555) 666-7777",
      avatar: "",
      currentRole: "Marketing Director",
      company: "BrandCo",
      location: "New York, NY",
      experience: "8 years",
      education: "BA Marketing - NYU",
      skills: ["Digital Marketing", "Brand Strategy", "SEO", "Content", "Analytics"],
      matchScore: 85,
      addedDate: "Dec 1, 2023",
      lastContacted: "Jan 10, 2024",
      status: "passive",
      source: "Networking Event",
      tags: ["Marketing", "Leadership", "NYC"],
      folders: ["Marketing Talent"],
      linkedIn: "linkedin.com/in/emilywhite",
      notes: "Strong marketing leader. Interested in startups. Keep engaged.",
    },
  ];

  const folders: TalentFolder[] = [
    {
      id: 1,
      name: "Engineering Talent",
      description: "Top engineering candidates for future roles",
      color: "blue",
      candidateCount: 12,
      createdDate: "Oct 1, 2023",
    },
    {
      id: 2,
      name: "Design Talent",
      description: "Exceptional designers and UX professionals",
      color: "purple",
      candidateCount: 8,
      createdDate: "Oct 15, 2023",
    },
    {
      id: 3,
      name: "Product Talent",
      description: "Product managers and product leaders",
      color: "green",
      candidateCount: 6,
      createdDate: "Nov 1, 2023",
    },
    {
      id: 4,
      name: "Senior Talent",
      description: "Senior and leadership candidates",
      color: "orange",
      candidateCount: 10,
      createdDate: "Sep 20, 2023",
    },
    {
      id: 5,
      name: "Future Hires",
      description: "High-potential candidates for upcoming roles",
      color: "pink",
      candidateCount: 15,
      createdDate: "Aug 10, 2023",
    },
    {
      id: 6,
      name: "Marketing Talent",
      description: "Marketing and growth professionals",
      color: "yellow",
      candidateCount: 5,
      createdDate: "Nov 20, 2023",
    },
  ];

  const allSkills = Array.from(new Set(candidates.flatMap(c => c.skills)));

  const stats = {
    total: candidates.length,
    available: candidates.filter(c => c.status === "available").length,
    passive: candidates.filter(c => c.status === "passive").length,
    avgMatchScore: Math.round(candidates.reduce((acc, c) => acc + c.matchScore, 0) / candidates.length),
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.currentRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.skills.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesSkill = skillFilter === "all" || candidate.skills.includes(skillFilter);
    const matchesStatus = statusFilter === "all" || candidate.status === statusFilter;
    const matchesFolder = folderFilter === "all" || candidate.folders.includes(folderFilter);

    return matchesSearch && matchesSkill && matchesStatus && matchesFolder;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      available: "bg-green-50 text-green-700 border-green-200",
      passive: "bg-blue-50 text-blue-700 border-blue-200",
      not_looking: "bg-gray-50 text-gray-700 border-gray-200",
      hired: "bg-purple-50 text-purple-700 border-purple-200",
    };
    return styles[status as keyof typeof styles] || styles.passive;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      available: "Available",
      passive: "Passive",
      not_looking: "Not Looking",
      hired: "Hired",
    };
    return labels[status as keyof typeof labels] || "Unknown";
  };

  const getFolderColor = (color: string) => {
    const colors = {
      blue: "bg-blue-100 text-blue-700 border-blue-200",
      purple: "bg-purple-100 text-purple-700 border-purple-200",
      green: "bg-green-100 text-green-700 border-green-200",
      orange: "bg-orange-100 text-orange-700 border-orange-200",
      pink: "bg-pink-100 text-pink-700 border-pink-200",
      yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const handleViewCandidate = (candidate: TalentCandidate) => {
    setSelectedCandidate(candidate);
    setShowCandidateDialog(true);
  };

  const handleAddCandidate = () => {
    console.log("Adding candidate:", {
      newCandidateName,
      newCandidateEmail,
      newCandidatePhone,
      newCandidateLinkedIn,
    });
    setShowAddCandidateDialog(false);
    // Reset form
    setNewCandidateName("");
    setNewCandidateEmail("");
    setNewCandidatePhone("");
    setNewCandidateLinkedIn("");
  };

  const handleCreateFolder = () => {
    console.log("Creating folder:", {
      newFolderName,
      newFolderDescription,
      newFolderColor,
    });
    setShowCreateFolderDialog(false);
    // Reset form
    setNewFolderName("");
    setNewFolderDescription("");
    setNewFolderColor("blue");
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
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted"
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
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground"
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
                <h1 className="text-3xl font-bold mb-2">Talent Pool</h1>
                <p className="text-muted-foreground">
                  Manage your saved candidates and build relationships for future opportunities
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateFolderDialog(true)}
                  className="gap-2"
                >
                  <FolderPlus className="w-4 h-4" />
                  Create Folder
                </Button>
                <Button onClick={() => setShowAddCandidateDialog(true)} className="gap-2">
                  <UserPlus className="w-4 h-4" />
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
                      <p className="text-sm text-muted-foreground mb-1">Available</p>
                      <p className="text-2xl font-bold">{stats.available}</p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Passive</p>
                      <p className="text-2xl font-bold">{stats.passive}</p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-500" />
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
                    <Target className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, role, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={folderFilter} onValueChange={setFolderFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Folders</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.name}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={skillFilter} onValueChange={setSkillFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Skill" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skills</SelectItem>
                  {allSkills.slice(0, 10).map((skill) => (
                    <SelectItem key={skill} value={skill}>
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="passive">Passive</SelectItem>
                  <SelectItem value="not_looking">Not Looking</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="candidates" className="space-y-4">
            <TabsList>
              <TabsTrigger value="candidates">Candidates ({filteredCandidates.length})</TabsTrigger>
              <TabsTrigger value="folders">Folders ({folders.length})</TabsTrigger>
            </TabsList>

            {/* Candidates Tab */}
            <TabsContent value="candidates">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCandidates.map((candidate) => (
                  <Card
                    key={candidate.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleViewCandidate(candidate)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={candidate.avatar} />
                            <AvatarFallback>
                              {candidate.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{candidate.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {candidate.currentRole}
                            </p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <Mail className="w-4 h-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <Folder className="w-4 h-4 mr-2" />
                              Add to Folder
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <Archive className="w-4 h-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => e.stopPropagation()}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Briefcase className="w-4 h-4" />
                          <span>{candidate.company}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{candidate.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{candidate.experience} experience</span>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <Badge variant="outline" className={getStatusBadge(candidate.status)}>
                            {getStatusLabel(candidate.status)}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`${
                              candidate.matchScore >= 90
                                ? "bg-green-50 text-green-700 border-green-200"
                                : candidate.matchScore >= 80
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-yellow-50 text-yellow-700 border-yellow-200"
                            }`}
                          >
                            <Target className="w-3 h-3 mr-1" />
                            {candidate.matchScore}%
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-1 pt-2">
                          {candidate.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {candidate.skills.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{candidate.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredCandidates.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No candidates found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Folders Tab */}
            <TabsContent value="folders">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {folders.map((folder) => (
                  <Card key={folder.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-lg ${getFolderColor(folder.color)}`}>
                            <Folder className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{folder.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {folder.candidateCount} candidates
                            </p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Candidates
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Folder
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Folder
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4">{folder.description}</p>

                      <div className="text-xs text-muted-foreground">
                        Created on {folder.createdDate}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
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
                {/* Header */}
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
                      <div className="flex gap-2">
                        <Badge variant="outline" className={getStatusBadge(selectedCandidate.status)}>
                          {getStatusLabel(selectedCandidate.status)}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`${
                            selectedCandidate.matchScore >= 90
                              ? "bg-green-50 text-green-700 border-green-200"
                              : selectedCandidate.matchScore >= 80
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200"
                          }`}
                        >
                          {selectedCandidate.matchScore}% Match
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
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

                {/* Details */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedCandidate.skills.map((skill) => (
                          <Badge key={skill} variant="secondary">
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
                      <p className="text-muted-foreground">{selectedCandidate.education}</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tags & Folders</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedCandidate.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Folders</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedCandidate.folders.map((folder) => (
                          <Badge key={folder} variant="outline">
                            <Folder className="w-3 h-3 mr-1" />
                            {folder}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {selectedCandidate.notes}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Added to talent pool</span>
                      <span className="font-medium">{selectedCandidate.addedDate}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last contacted</span>
                      <span className="font-medium">{selectedCandidate.lastContacted}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Source</span>
                      <span className="font-medium">{selectedCandidate.source}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button className="flex-1 gap-2">
                    <Mail className="w-4 h-4" />
                    Send Email
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <Send className="w-4 h-4" />
                    Reach Out
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <Folder className="w-4 h-4" />
                    Add to Folder
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Candidate Dialog */}
      <Dialog open={showAddCandidateDialog} onOpenChange={setShowAddCandidateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Candidate to Talent Pool</DialogTitle>
            <DialogDescription>
              Manually add a candidate to your talent pool for future opportunities
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                placeholder="John Doe"
                value={newCandidateName}
                onChange={(e) => setNewCandidateName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Email Address *</Label>
              <Input
                type="email"
                placeholder="john.doe@example.com"
                value={newCandidateEmail}
                onChange={(e) => setNewCandidateEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={newCandidatePhone}
                onChange={(e) => setNewCandidatePhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>LinkedIn URL</Label>
              <Input
                placeholder="linkedin.com/in/johndoe"
                value={newCandidateLinkedIn}
                onChange={(e) => setNewCandidateLinkedIn(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddCandidateDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddCandidate}
                disabled={!newCandidateName || !newCandidateEmail}
                className="flex-1"
              >
                Add Candidate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Folder Dialog */}
      <Dialog open={showCreateFolderDialog} onOpenChange={setShowCreateFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Organize your talent pool with custom folders
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Folder Name *</Label>
              <Input
                placeholder="e.g., Senior Engineers"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Brief description of this folder..."
                value={newFolderDescription}
                onChange={(e) => setNewFolderDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <Select value={newFolderColor} onValueChange={setNewFolderColor}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="purple">Purple</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="orange">Orange</SelectItem>
                  <SelectItem value="pink">Pink</SelectItem>
                  <SelectItem value="yellow">Yellow</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowCreateFolderDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateFolder}
                disabled={!newFolderName}
                className="flex-1 gap-2"
              >
                <FolderPlus className="w-4 h-4" />
                Create Folder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
