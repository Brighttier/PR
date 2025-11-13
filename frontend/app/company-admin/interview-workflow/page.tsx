"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  FileText,
  Users,
  MessageSquare,
  Brain,
  Video,
  Plus,
  Trash2,
  Edit,
  Play,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowDown,
  Clock,
  UserCheck,
  Monitor,
  MapPin,
  Phone,
  Mail,
  Copy,
  Eye,
  ChevronRight,
  Workflow,
  GitBranch,
  Target,
  Zap,
} from "lucide-react";
import { CompanyAdminSidebar } from "@/components/company-admin/sidebar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WorkflowStep {
  id: string;
  type: "ai_screening" | "ai_interview" | "video_call" | "in_person" | "assessment" | "decision";
  name: string;
  description: string;
  duration?: number; // in minutes
  aiAgent?: string;
  assignees?: string[];
  autoSchedule?: boolean;
  passingScore?: number;
  mandatory: boolean;
  order: number;
}

interface Workflow {
  id: number;
  name: string;
  description: string;
  jobRoles: string[];
  status: "active" | "draft" | "archived";
  steps: WorkflowStep[];
  candidatesProcessed: number;
  avgCompletionTime: string;
  successRate: number;
  createdDate: string;
  lastModified: string;
}

export default function InterviewWorkflowPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showStepDialog, setShowStepDialog] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);

  // Form states for creating workflow
  const [workflowName, setWorkflowName] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [selectedJobRoles, setSelectedJobRoles] = useState<string[]>([]);

  // Form states for creating step
  const [stepType, setStepType] = useState<WorkflowStep["type"]>("ai_screening");
  const [stepName, setStepName] = useState("");
  const [stepDescription, setStepDescription] = useState("");
  const [stepDuration, setStepDuration] = useState(30);
  const [stepAiAgent, setStepAiAgent] = useState("");
  const [stepMandatory, setStepMandatory] = useState(true);
  const [stepAutoSchedule, setStepAutoSchedule] = useState(false);
  const [stepPassingScore, setStepPassingScore] = useState(70);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);

  // Mock data
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: 1,
      name: "Software Engineer - Full Pipeline",
      description: "Complete automated workflow for software engineering positions with AI screening, technical interview, and final round",
      jobRoles: ["Software Engineer", "Senior Software Engineer", "Full Stack Developer"],
      status: "active",
      steps: [
        {
          id: "step1",
          type: "ai_screening",
          name: "Initial AI Screening",
          description: "Automated resume screening and basic qualification check",
          duration: 15,
          aiAgent: "Resume Parser & Screener",
          mandatory: true,
          passingScore: 60,
          autoSchedule: true,
          order: 1,
        },
        {
          id: "step2",
          type: "ai_interview",
          name: "AI Technical Interview",
          description: "Automated technical interview covering coding and problem-solving",
          duration: 45,
          aiAgent: "Python Developer Interviewer",
          mandatory: true,
          passingScore: 70,
          autoSchedule: true,
          order: 2,
        },
        {
          id: "step3",
          type: "video_call",
          name: "Team Interview",
          description: "Video call with hiring manager and team members",
          duration: 60,
          assignees: ["John Smith", "Sarah Johnson"],
          mandatory: true,
          autoSchedule: false,
          order: 3,
        },
        {
          id: "step4",
          type: "decision",
          name: "Final Decision",
          description: "Review all interview feedback and make hiring decision",
          mandatory: true,
          order: 4,
        },
      ],
      candidatesProcessed: 145,
      avgCompletionTime: "5 days",
      successRate: 68,
      createdDate: "Dec 1, 2024",
      lastModified: "Jan 10, 2025",
    },
    {
      id: 2,
      name: "Product Manager - Fast Track",
      description: "Streamlined workflow for experienced product managers",
      jobRoles: ["Product Manager", "Senior Product Manager"],
      status: "active",
      steps: [
        {
          id: "step1",
          type: "ai_screening",
          name: "Resume Review",
          description: "AI-powered resume analysis and experience matching",
          duration: 10,
          aiAgent: "Resume Parser",
          mandatory: true,
          passingScore: 70,
          autoSchedule: true,
          order: 1,
        },
        {
          id: "step2",
          type: "video_call",
          name: "Product Leadership Interview",
          description: "Interview with VP of Product and product team",
          duration: 90,
          assignees: ["Michael Chen", "Emily Rodriguez"],
          mandatory: true,
          autoSchedule: false,
          order: 2,
        },
        {
          id: "step3",
          type: "assessment",
          name: "Product Case Study",
          description: "Take-home product strategy case study",
          duration: 240,
          mandatory: true,
          autoSchedule: true,
          order: 3,
        },
        {
          id: "step4",
          type: "decision",
          name: "Offer Decision",
          description: "Final review and offer decision",
          mandatory: true,
          order: 4,
        },
      ],
      candidatesProcessed: 87,
      avgCompletionTime: "7 days",
      successRate: 72,
      createdDate: "Nov 15, 2024",
      lastModified: "Jan 5, 2025",
    },
    {
      id: 3,
      name: "Entry Level - High Volume",
      description: "Efficient workflow for high-volume entry-level hiring with maximum automation",
      jobRoles: ["Junior Developer", "Associate", "Intern"],
      status: "active",
      steps: [
        {
          id: "step1",
          type: "ai_screening",
          name: "Basic Qualification Check",
          description: "Automated screening for minimum requirements",
          duration: 5,
          aiAgent: "Basic Screener",
          mandatory: true,
          passingScore: 50,
          autoSchedule: true,
          order: 1,
        },
        {
          id: "step2",
          type: "ai_interview",
          name: "AI Behavioral Interview",
          description: "Automated behavioral and culture fit assessment",
          duration: 30,
          aiAgent: "Behavioral Interviewer",
          mandatory: true,
          passingScore: 65,
          autoSchedule: true,
          order: 2,
        },
        {
          id: "step3",
          type: "video_call",
          name: "Manager Interview",
          description: "Brief interview with hiring manager",
          duration: 30,
          assignees: ["David Kim"],
          mandatory: true,
          autoSchedule: true,
          order: 3,
        },
        {
          id: "step4",
          type: "decision",
          name: "Hiring Decision",
          description: "Quick decision based on interview feedback",
          mandatory: true,
          order: 4,
        },
      ],
      candidatesProcessed: 342,
      avgCompletionTime: "3 days",
      successRate: 55,
      createdDate: "Oct 20, 2024",
      lastModified: "Dec 28, 2024",
    },
  ]);

  const availableAiAgents = [
    "Resume Parser & Screener",
    "Python Developer Interviewer",
    "React Frontend Screener",
    "DevOps Engineer Evaluator",
    "Behavioral Interviewer",
    "Basic Screener",
    "Technical Screener",
  ];

  const availableInterviewers = [
    "John Smith",
    "Sarah Johnson",
    "Michael Chen",
    "Emily Rodriguez",
    "David Kim",
    "Jessica Taylor",
  ];

  const getStepTypeIcon = (type: WorkflowStep["type"]) => {
    switch (type) {
      case "ai_screening":
        return <Brain className="w-4 h-4" />;
      case "ai_interview":
        return <Sparkles className="w-4 h-4" />;
      case "video_call":
        return <Video className="w-4 h-4" />;
      case "in_person":
        return <MapPin className="w-4 h-4" />;
      case "assessment":
        return <FileText className="w-4 h-4" />;
      case "decision":
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <Workflow className="w-4 h-4" />;
    }
  };

  const getStepTypeColor = (type: WorkflowStep["type"]) => {
    switch (type) {
      case "ai_screening":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "ai_interview":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "video_call":
        return "bg-green-100 text-green-700 border-green-200";
      case "in_person":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "assessment":
        return "bg-pink-100 text-pink-700 border-pink-200";
      case "decision":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-50 text-green-700 border-green-200",
      draft: "bg-yellow-50 text-yellow-700 border-yellow-200",
      archived: "bg-gray-50 text-gray-600 border-gray-200",
    };
    return styles[status as keyof typeof styles];
  };

  const handleAddStep = () => {
    const newStep: WorkflowStep = {
      id: `step${workflowSteps.length + 1}`,
      type: stepType,
      name: stepName,
      description: stepDescription,
      duration: stepDuration,
      aiAgent: stepType.includes("ai") ? stepAiAgent : undefined,
      mandatory: stepMandatory,
      autoSchedule: stepAutoSchedule,
      passingScore: stepType.includes("ai") ? stepPassingScore : undefined,
      order: workflowSteps.length + 1,
    };

    setWorkflowSteps([...workflowSteps, newStep]);
    setShowStepDialog(false);

    // Reset form
    setStepName("");
    setStepDescription("");
    setStepDuration(30);
    setStepAiAgent("");
  };

  const handleCreateWorkflow = () => {
    const newWorkflow: Workflow = {
      id: workflows.length + 1,
      name: workflowName,
      description: workflowDescription,
      jobRoles: selectedJobRoles,
      status: "draft",
      steps: workflowSteps,
      candidatesProcessed: 0,
      avgCompletionTime: "N/A",
      successRate: 0,
      createdDate: new Date().toLocaleDateString(),
      lastModified: new Date().toLocaleDateString(),
    };

    setWorkflows([...workflows, newWorkflow]);
    setShowCreateDialog(false);

    // Reset form
    setWorkflowName("");
    setWorkflowDescription("");
    setSelectedJobRoles([]);
    setWorkflowSteps([]);
  };

  const handleDeleteWorkflow = (id: number) => {
    setWorkflows(workflows.filter(w => w.id !== id));
  };

  const handleDuplicateWorkflow = (workflow: Workflow) => {
    const duplicated: Workflow = {
      ...workflow,
      id: workflows.length + 1,
      name: `${workflow.name} (Copy)`,
      status: "draft",
      candidatesProcessed: 0,
      createdDate: new Date().toLocaleDateString(),
      lastModified: new Date().toLocaleDateString(),
    };
    setWorkflows([...workflows, duplicated]);
  };

  const stats = {
    totalWorkflows: workflows.length,
    activeWorkflows: workflows.filter(w => w.status === "active").length,
    totalCandidates: workflows.reduce((acc, w) => acc + w.candidatesProcessed, 0),
    avgSuccessRate: Math.round(
      workflows.reduce((acc, w) => acc + w.successRate, 0) / workflows.length
    ),
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <CompanyAdminSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <GitBranch className="w-8 h-8 text-blue-600" />
                  Interview Workflow Automation
                </h1>
                <p className="text-muted-foreground">
                  Design and automate your complete recruitment workflow with AI screening, interviews, and assessments
                </p>
              </div>
              <Button className="gap-2" onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4" />
                Create Workflow
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Workflows</p>
                      <p className="text-2xl font-bold">{stats.totalWorkflows}</p>
                    </div>
                    <Workflow className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Active</p>
                      <p className="text-2xl font-bold">{stats.activeWorkflows}</p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Candidates Processed</p>
                      <p className="text-2xl font-bold">{stats.totalCandidates}</p>
                    </div>
                    <Users className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Avg Success Rate</p>
                      <p className="text-2xl font-bold">{stats.avgSuccessRate}%</p>
                    </div>
                    <Target className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Workflows List */}
          <div className="space-y-6">
            {workflows.map((workflow) => (
              <Card key={workflow.id} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{workflow.name}</CardTitle>
                        <Badge variant="outline" className={getStatusBadge(workflow.status)}>
                          {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription className="mb-3">{workflow.description}</CardDescription>
                      <div className="flex flex-wrap gap-2">
                        {workflow.jobRoles.map((role, idx) => (
                          <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            <Briefcase className="w-3 h-3 mr-1" />
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedWorkflow(workflow)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditingWorkflow(workflow)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Workflow
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateWorkflow(workflow)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteWorkflow(workflow.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Workflow Steps Visualization */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Workflow className="w-4 h-4" />
                      Workflow Steps ({workflow.steps.length})
                    </h4>
                    <div className="relative">
                      <div className="flex items-start gap-4 overflow-x-auto pb-4">
                        {workflow.steps.map((step, idx) => (
                          <div key={step.id} className="flex items-center">
                            <div className="flex flex-col items-center min-w-[180px]">
                              <div
                                className={`w-full p-4 rounded-lg border-2 ${
                                  step.mandatory ? "border-primary" : "border-dashed border-gray-300"
                                } bg-white`}
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <div className={`p-2 rounded ${getStepTypeColor(step.type)}`}>
                                    {getStepTypeIcon(step.type)}
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    Step {step.order}
                                  </Badge>
                                </div>
                                <p className="font-semibold text-sm mb-1">{step.name}</p>
                                <p className="text-xs text-muted-foreground mb-2">
                                  {step.description}
                                </p>
                                {step.duration && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    {step.duration} min
                                  </div>
                                )}
                                {step.aiAgent && (
                                  <div className="flex items-center gap-1 text-xs text-purple-600 mt-1">
                                    <Brain className="w-3 h-3" />
                                    {step.aiAgent}
                                  </div>
                                )}
                                {step.autoSchedule && (
                                  <Badge variant="outline" className="mt-2 text-xs bg-green-50 text-green-700 border-green-200">
                                    <Zap className="w-3 h-3 mr-1" />
                                    Auto
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {idx < workflow.steps.length - 1 && (
                              <ArrowRight className="w-6 h-6 text-gray-400 mx-2 flex-shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Workflow Statistics */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Candidates Processed</p>
                      <p className="text-lg font-semibold">{workflow.candidatesProcessed}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Avg Completion Time</p>
                      <p className="text-lg font-semibold">{workflow.avgCompletionTime}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                      <p className="text-lg font-semibold">{workflow.successRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {workflows.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="pt-12 pb-12 text-center">
                <GitBranch className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Workflows Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first interview workflow to automate your recruitment process
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Workflow
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Create Workflow Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitBranch className="w-5 h-5" />
              Create Interview Workflow
            </DialogTitle>
            <DialogDescription>
              Design a custom recruitment workflow with AI screening, interviews, and assessments
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="steps">Workflow Steps</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Workflow Name *</Label>
                <Input
                  placeholder="e.g., Software Engineer - Full Pipeline"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe the purpose and stages of this workflow..."
                  rows={3}
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Applicable Job Roles</Label>
                <Select
                  value={selectedJobRoles[0] || ""}
                  onValueChange={(value) => {
                    if (!selectedJobRoles.includes(value)) {
                      setSelectedJobRoles([...selectedJobRoles, value]);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select job roles..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Software Engineer">Software Engineer</SelectItem>
                    <SelectItem value="Senior Software Engineer">Senior Software Engineer</SelectItem>
                    <SelectItem value="Product Manager">Product Manager</SelectItem>
                    <SelectItem value="Designer">Designer</SelectItem>
                    <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                    <SelectItem value="DevOps Engineer">DevOps Engineer</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedJobRoles.map((role) => (
                    <Badge key={role} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {role}
                      <button
                        onClick={() => setSelectedJobRoles(selectedJobRoles.filter(r => r !== role))}
                        className="ml-2 hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="steps" className="space-y-4 mt-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">Workflow Steps</h3>
                  <p className="text-sm text-muted-foreground">
                    Add and configure interview steps in sequence
                  </p>
                </div>
                <Button size="sm" onClick={() => setShowStepDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Step
                </Button>
              </div>

              {/* Steps List */}
              <div className="space-y-3">
                {workflowSteps.map((step, idx) => (
                  <Card key={step.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded ${getStepTypeColor(step.type)}`}>
                          {getStepTypeIcon(step.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{step.name}</p>
                            <Badge variant="outline" className="text-xs">
                              Step {step.order}
                            </Badge>
                            {step.mandatory && (
                              <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                Required
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {step.duration && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {step.duration} min
                              </span>
                            )}
                            {step.aiAgent && (
                              <span className="flex items-center gap-1 text-purple-600">
                                <Brain className="w-3 h-3" />
                                {step.aiAgent}
                              </span>
                            )}
                            {step.autoSchedule && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                <Zap className="w-3 h-3 mr-1" />
                                Auto-schedule
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setWorkflowSteps(workflowSteps.filter(s => s.id !== step.id))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {workflowSteps.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <GitBranch className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No steps added yet</p>
                    <p className="text-xs text-muted-foreground">Click "Add Step" to start building your workflow</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateWorkflow}
              disabled={!workflowName || workflowSteps.length === 0}
            >
              Create Workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Step Dialog */}
      <Dialog open={showStepDialog} onOpenChange={setShowStepDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Workflow Step</DialogTitle>
            <DialogDescription>
              Configure a new step in your interview workflow
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Step Type *</Label>
              <Select value={stepType} onValueChange={(value: any) => setStepType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ai_screening">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      AI Screening - Automated resume review
                    </div>
                  </SelectItem>
                  <SelectItem value="ai_interview">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      AI Interview - Automated Q&A session
                    </div>
                  </SelectItem>
                  <SelectItem value="video_call">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      Video Call - Remote interview
                    </div>
                  </SelectItem>
                  <SelectItem value="in_person">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      In-Person Interview - On-site meeting
                    </div>
                  </SelectItem>
                  <SelectItem value="assessment">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Assessment - Take-home or online test
                    </div>
                  </SelectItem>
                  <SelectItem value="decision">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Decision Point - Review and decide
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Step Name *</Label>
              <Input
                placeholder="e.g., Initial AI Screening"
                value={stepName}
                onChange={(e) => setStepName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe what happens in this step..."
                rows={2}
                value={stepDescription}
                onChange={(e) => setStepDescription(e.target.value)}
              />
            </div>

            {stepType !== "decision" && (
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={stepDuration}
                  onChange={(e) => setStepDuration(Number(e.target.value))}
                  min="5"
                  max="480"
                />
              </div>
            )}

            {(stepType === "ai_screening" || stepType === "ai_interview") && (
              <>
                <div className="space-y-2">
                  <Label>AI Agent *</Label>
                  <Select value={stepAiAgent} onValueChange={setStepAiAgent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select AI agent..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAiAgents.map((agent) => (
                        <SelectItem key={agent} value={agent}>
                          {agent}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Passing Score (%)</Label>
                  <Input
                    type="number"
                    value={stepPassingScore}
                    onChange={(e) => setStepPassingScore(Number(e.target.value))}
                    min="0"
                    max="100"
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum score required to pass this step
                  </p>
                </div>
              </>
            )}

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="space-y-1">
                <Label>Mandatory Step</Label>
                <p className="text-xs text-muted-foreground">
                  Candidates must complete this step to proceed
                </p>
              </div>
              <Switch checked={stepMandatory} onCheckedChange={setStepMandatory} />
            </div>

            {stepType !== "decision" && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="space-y-1">
                  <Label>Auto-schedule</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically schedule this step when previous step completes
                  </p>
                </div>
                <Switch checked={stepAutoSchedule} onCheckedChange={setStepAutoSchedule} />
              </div>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowStepDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStep} disabled={!stepName || !stepType}>
              Add Step
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
