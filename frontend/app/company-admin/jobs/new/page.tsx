"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Users,
  Clock,
  Sparkles,
  Save,
  Eye,
  Send,
  X,
  Plus,
  Loader2,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Settings,
  Calendar,
  FileText,
  Folder,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

export default function NewJobPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showMatchSimulation, setShowMatchSimulation] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);

  // Form state
  const [jobData, setJobData] = useState({
    title: "",
    department: "",
    location: "",
    type: "full-time",
    experience: "mid-level",
    salaryMin: "",
    salaryMax: "",
    description: "",
    requirements: [] as string[],
    benefits: [] as string[],
    employmentType: "full-time",
    workMode: "hybrid",
    vacancies: "1",
  });

  const [newRequirement, setNewRequirement] = useState("");
  const [newBenefit, setNewBenefit] = useState("");

  // Match score simulation data
  const matchSimulation = {
    totalCandidates: 1247,
    distribution: [
      { range: "90-100%", count: 34, percentage: 2.7, color: "bg-green-500" },
      { range: "80-89%", count: 156, percentage: 12.5, color: "bg-blue-500" },
      { range: "70-79%", count: 287, percentage: 23.0, color: "bg-yellow-500" },
      { range: "60-69%", count: 412, percentage: 33.0, color: "bg-orange-500" },
      { range: "Below 60%", count: 358, percentage: 28.8, color: "bg-gray-400" },
    ],
    topMatches: [
      {
        name: "Sarah Johnson",
        currentRole: "Senior Software Engineer",
        matchScore: 94,
        skills: ["React", "TypeScript", "Node.js", "AWS"],
        experience: "6 years",
      },
      {
        name: "Michael Chen",
        currentRole: "Full Stack Developer",
        matchScore: 92,
        skills: ["React", "Python", "PostgreSQL", "Docker"],
        experience: "5 years",
      },
      {
        name: "Emily Rodriguez",
        currentRole: "Frontend Engineer",
        matchScore: 89,
        skills: ["React", "JavaScript", "GraphQL", "CSS"],
        experience: "4 years",
      },
    ],
  };

  const handleGenerateWithAI = async () => {
    setIsGenerating(true);

    // Simulate AI generation (in production, this would call Google Gemini API)
    await new Promise(resolve => setTimeout(resolve, 2000));

    const generatedContent = {
      description: `We are seeking a talented ${jobData.title} to join our ${jobData.department} team. In this role, you will be responsible for designing, developing, and maintaining high-quality software solutions that drive our business forward.

As a key member of our engineering team, you will collaborate with cross-functional teams to deliver innovative products that exceed customer expectations. You will have the opportunity to work with cutting-edge technologies and contribute to architectural decisions that shape the future of our platform.

The ideal candidate will bring strong technical expertise, excellent problem-solving skills, and a passion for creating exceptional user experiences. You will be empowered to take ownership of projects, mentor junior team members, and continuously improve our development processes.`,

      requirements: [
        "5+ years of experience in software development",
        "Strong proficiency in modern JavaScript frameworks (React, Vue, or Angular)",
        "Experience with backend technologies (Node.js, Python, or Java)",
        "Solid understanding of database design and optimization",
        "Excellent problem-solving and analytical skills",
        "Strong communication and collaboration abilities",
        "Bachelor's degree in Computer Science or related field (or equivalent experience)",
        "Experience with cloud platforms (AWS, Azure, or GCP)",
      ],

      benefits: [
        "Competitive salary and equity package",
        "Comprehensive health, dental, and vision insurance",
        "401(k) with company matching",
        "Flexible work arrangements (remote/hybrid options)",
        "Generous paid time off and parental leave",
        "Professional development budget",
        "Latest technology and equipment",
        "Collaborative and inclusive work environment",
        "Regular team events and activities",
      ],
    };

    setJobData({
      ...jobData,
      description: generatedContent.description,
      requirements: generatedContent.requirements,
      benefits: generatedContent.benefits,
    });

    setAiGenerated(true);
    setIsGenerating(false);
  };

  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      setJobData({
        ...jobData,
        requirements: [...jobData.requirements, newRequirement.trim()],
      });
      setNewRequirement("");
    }
  };

  const handleRemoveRequirement = (index: number) => {
    setJobData({
      ...jobData,
      requirements: jobData.requirements.filter((_, i) => i !== index),
    });
  };

  const handleAddBenefit = () => {
    if (newBenefit.trim()) {
      setJobData({
        ...jobData,
        benefits: [...jobData.benefits, newBenefit.trim()],
      });
      setNewBenefit("");
    }
  };

  const handleRemoveBenefit = (index: number) => {
    setJobData({
      ...jobData,
      benefits: jobData.benefits.filter((_, i) => i !== index),
    });
  };

  const handleSaveDraft = () => {
    console.log("Saving as draft:", jobData);
    // In production, save to database with status: "draft"
  };

  const handlePublish = () => {
    console.log("Publishing job:", jobData);
    // In production, save to database with status: "published"
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
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground"
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
        <div className="max-w-5xl mx-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold">Create New Job</h1>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowMatchSimulation(true)}
                  className="gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  Match Simulation
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(true)}
                  className="gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Draft
                </Button>
                <Button onClick={handlePublish} className="gap-2">
                  <Send className="w-4 h-4" />
                  Publish
                </Button>
              </div>
            </div>
            <p className="text-muted-foreground">
              Create a new job posting with AI-powered description generation
            </p>
          </div>

          {/* AI Generation Card */}
          <Card className="mb-6 border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                AI Job Description Generator
              </CardTitle>
              <CardDescription>
                Fill in the basic information below and let AI generate a comprehensive job description
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Job Title</Label>
                  <Input
                    placeholder="e.g., Senior Software Engineer"
                    value={jobData.title}
                    onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input
                    placeholder="e.g., Engineering"
                    value={jobData.department}
                    onChange={(e) => setJobData({ ...jobData, department: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Experience Level</Label>
                  <Select
                    value={jobData.experience}
                    onValueChange={(value) => setJobData({ ...jobData, experience: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry-level">Entry Level</SelectItem>
                      <SelectItem value="mid-level">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="executive">Executive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={handleGenerateWithAI}
                disabled={!jobData.title || !jobData.department || isGenerating}
                className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Job Description with AI
                  </>
                )}
              </Button>
              {aiGenerated && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-700">
                    AI-generated content loaded. Review and edit as needed.
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Details Form */}
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="benefits">Benefits</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Core details about the job position
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Job Title *</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          className="pl-10"
                          placeholder="e.g., Senior Software Engineer"
                          value={jobData.title}
                          onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Department *</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          className="pl-10"
                          placeholder="e.g., Engineering"
                          value={jobData.department}
                          onChange={(e) => setJobData({ ...jobData, department: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Location *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          className="pl-10"
                          placeholder="e.g., San Francisco, CA"
                          value={jobData.location}
                          onChange={(e) => setJobData({ ...jobData, location: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Work Mode *</Label>
                      <Select
                        value={jobData.workMode}
                        onValueChange={(value) => setJobData({ ...jobData, workMode: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="remote">Remote</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                          <SelectItem value="on-site">On-Site</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Employment Type *</Label>
                      <Select
                        value={jobData.employmentType}
                        onValueChange={(value) => setJobData({ ...jobData, employmentType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full-Time</SelectItem>
                          <SelectItem value="part-time">Part-Time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Experience Level *</Label>
                      <Select
                        value={jobData.experience}
                        onValueChange={(value) => setJobData({ ...jobData, experience: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entry-level">Entry Level (0-2 years)</SelectItem>
                          <SelectItem value="mid-level">Mid Level (3-5 years)</SelectItem>
                          <SelectItem value="senior">Senior (6-10 years)</SelectItem>
                          <SelectItem value="lead">Lead (10+ years)</SelectItem>
                          <SelectItem value="executive">Executive (15+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Salary Range</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="number"
                          className="pl-10"
                          placeholder="Min (e.g., 100000)"
                          value={jobData.salaryMin}
                          onChange={(e) => setJobData({ ...jobData, salaryMin: e.target.value })}
                        />
                      </div>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="number"
                          className="pl-10"
                          placeholder="Max (e.g., 150000)"
                          value={jobData.salaryMax}
                          onChange={(e) => setJobData({ ...jobData, salaryMax: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Number of Vacancies</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="number"
                        className="pl-10"
                        placeholder="e.g., 1"
                        value={jobData.vacancies}
                        onChange={(e) => setJobData({ ...jobData, vacancies: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Description Tab */}
            <TabsContent value="description" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Job Description
                    {aiGenerated && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Generated
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Detailed description of the role and responsibilities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    rows={15}
                    placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                    value={jobData.description}
                    onChange={(e) => setJobData({ ...jobData, description: e.target.value })}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {jobData.description.length} characters
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Requirements Tab */}
            <TabsContent value="requirements" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Requirements & Qualifications
                    {aiGenerated && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Generated
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Skills, experience, and qualifications needed for this role
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a requirement (e.g., 5+ years of React experience)"
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAddRequirement()}
                    />
                    <Button onClick={handleAddRequirement} size="icon">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {jobData.requirements.map((req, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg group"
                      >
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="flex-1 text-sm">{req}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveRequirement(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {jobData.requirements.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">No requirements added yet</p>
                      <p className="text-xs">Use AI generation or add manually</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Benefits Tab */}
            <TabsContent value="benefits" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Benefits & Perks
                    {aiGenerated && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Generated
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    What candidates can expect working at your company
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a benefit (e.g., Health insurance)"
                      value={newBenefit}
                      onChange={(e) => setNewBenefit(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAddBenefit()}
                    />
                    <Button onClick={handleAddBenefit} size="icon">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {jobData.benefits.map((benefit, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg group"
                      >
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="flex-1 text-sm">{benefit}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveBenefit(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {jobData.benefits.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">No benefits added yet</p>
                      <p className="text-xs">Use AI generation or add manually</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Job Posting Preview</DialogTitle>
            <DialogDescription>
              How this job will appear on your career page
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{jobData.title || "Job Title"}</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className="gap-1">
                  <Building2 className="w-3 h-3" />
                  {jobData.department || "Department"}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <MapPin className="w-3 h-3" />
                  {jobData.location || "Location"}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Clock className="w-3 h-3" />
                  {jobData.employmentType || "Employment Type"}
                </Badge>
                {jobData.salaryMin && jobData.salaryMax && (
                  <Badge variant="outline" className="gap-1">
                    <DollarSign className="w-3 h-3" />
                    ${parseInt(jobData.salaryMin).toLocaleString()} - ${parseInt(jobData.salaryMax).toLocaleString()}
                  </Badge>
                )}
              </div>
            </div>

            {jobData.description && (
              <div>
                <h3 className="font-semibold mb-2">About the Role</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {jobData.description}
                </p>
              </div>
            )}

            {jobData.requirements.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Requirements</h3>
                <ul className="space-y-2">
                  {jobData.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {jobData.benefits.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Benefits</h3>
                <ul className="space-y-2">
                  {jobData.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-4 border-t">
              <Button className="w-full">Apply Now</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Match Simulation Dialog */}
      <Dialog open={showMatchSimulation} onOpenChange={setShowMatchSimulation}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Candidate Match Simulation</DialogTitle>
            <DialogDescription>
              Estimated match distribution based on current candidate pool
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Match Score Distribution</CardTitle>
                <CardDescription>
                  Based on {matchSimulation.totalCandidates.toLocaleString()} candidates in database
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {matchSimulation.distribution.map((range) => (
                  <div key={range.range} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{range.range}</span>
                      <span className="text-muted-foreground">
                        {range.count} candidates ({range.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${range.color} h-2 rounded-full transition-all`}
                        style={{ width: `${range.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Matching Candidates</CardTitle>
                <CardDescription>
                  Preview of candidates who would match well with this job
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {matchSimulation.topMatches.map((candidate) => (
                  <div
                    key={candidate.name}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="space-y-2">
                      <div>
                        <h4 className="font-medium">{candidate.name}</h4>
                        <p className="text-sm text-muted-foreground">{candidate.currentRole}</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">{candidate.experience}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      {candidate.matchScore}%
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Match scores are calculated based on skills, experience level,
                location preferences, and other factors from candidate profiles. Actual results may vary
                once the job is published.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
