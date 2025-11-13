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
  Plus,
  FileText,
  Upload,
  Save,
  Trash2,
  Edit,
  Play,
  MoreVertical,
  ArrowLeft,
  Brain,
  BookOpen,
  Code,
  Database,
  Link as LinkIcon,
  FileUp,
  CheckCircle2,
  X,
} from "lucide-react";
import { CompanyAdminSidebar } from "@/components/company-admin/sidebar";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface KnowledgeSource {
  id: string;
  type: "document" | "text" | "url";
  name: string;
  content?: string;
  url?: string;
  fileSize?: string;
  addedDate: string;
}

interface CustomAgent {
  id: number;
  name: string;
  role: string;
  description: string;
  status: "active" | "draft" | "testing";
  agentType: "interviewer" | "screener" | "evaluator";
  knowledgeBase: KnowledgeSource[];
  usageCount: number;
  createdDate: string;
  lastUsed: string;
  model: string;
  temperature: number;
}

export default function CustomAIAgentsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showKnowledgeDialog, setShowKnowledgeDialog] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<CustomAgent | null>(null);

  // Create agent form state
  const [agentName, setAgentName] = useState("");
  const [agentRole, setAgentRole] = useState("");
  const [agentDescription, setAgentDescription] = useState("");
  const [agentType, setAgentType] = useState<"interviewer" | "screener" | "evaluator">("interviewer");
  const [agentModel, setAgentModel] = useState("gemini-2.0-flash");
  const [agentTemperature, setAgentTemperature] = useState(0.7);
  const [systemPrompt, setSystemPrompt] = useState("");

  // Knowledge base state
  const [knowledgeType, setKnowledgeType] = useState<"document" | "text" | "url">("text");
  const [knowledgeName, setKnowledgeName] = useState("");
  const [knowledgeContent, setKnowledgeContent] = useState("");
  const [knowledgeUrl, setKnowledgeUrl] = useState("");
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([]);

  // Mock custom agents
  const [customAgents, setCustomAgents] = useState<CustomAgent[]>([
    {
      id: 1,
      name: "Python Developer Interviewer",
      role: "Python Developer",
      description: "Specialized AI interviewer for Python developer positions with deep knowledge of Python frameworks, best practices, and coding standards",
      status: "active",
      agentType: "interviewer",
      knowledgeBase: [
        {
          id: "kb1",
          type: "document",
          name: "Python Best Practices Guide.pdf",
          fileSize: "2.4 MB",
          addedDate: "Jan 10, 2024",
        },
        {
          id: "kb2",
          type: "text",
          name: "Django Interview Questions",
          content: "Common Django interview questions and expected answers...",
          addedDate: "Jan 10, 2024",
        },
        {
          id: "kb3",
          type: "url",
          name: "Python Documentation",
          url: "https://docs.python.org/3/",
          addedDate: "Jan 11, 2024",
        },
      ],
      usageCount: 45,
      createdDate: "Jan 10, 2024",
      lastUsed: "2 hours ago",
      model: "gemini-2.0-flash",
      temperature: 0.7,
    },
    {
      id: 2,
      name: "React Frontend Screener",
      role: "Frontend Developer (React)",
      description: "AI screener specialized in evaluating React.js skills, component architecture, and modern frontend development practices",
      status: "active",
      agentType: "screener",
      knowledgeBase: [
        {
          id: "kb4",
          type: "document",
          name: "React Patterns & Anti-patterns.pdf",
          fileSize: "1.8 MB",
          addedDate: "Jan 12, 2024",
        },
        {
          id: "kb5",
          type: "text",
          name: "TypeScript with React Guidelines",
          content: "TypeScript best practices for React development...",
          addedDate: "Jan 12, 2024",
        },
      ],
      usageCount: 32,
      createdDate: "Jan 12, 2024",
      lastUsed: "1 day ago",
      model: "gemini-1.5-pro",
      temperature: 0.5,
    },
    {
      id: 3,
      name: "DevOps Engineer Evaluator",
      role: "DevOps Engineer",
      description: "Technical evaluator for DevOps positions focusing on cloud infrastructure, CI/CD, and automation skills",
      status: "draft",
      agentType: "evaluator",
      knowledgeBase: [
        {
          id: "kb6",
          type: "document",
          name: "Kubernetes Best Practices.pdf",
          fileSize: "3.2 MB",
          addedDate: "Jan 14, 2024",
        },
      ],
      usageCount: 0,
      createdDate: "Jan 14, 2024",
      lastUsed: "Never",
      model: "gemini-2.0-flash",
      temperature: 0.6,
    },
  ]);

  const handleAddKnowledgeSource = () => {
    const newSource: KnowledgeSource = {
      id: `kb${Date.now()}`,
      type: knowledgeType,
      name: knowledgeName,
      content: knowledgeType === "text" ? knowledgeContent : undefined,
      url: knowledgeType === "url" ? knowledgeUrl : undefined,
      fileSize: knowledgeType === "document" ? "1.5 MB" : undefined,
      addedDate: new Date().toLocaleDateString(),
    };

    setKnowledgeSources([...knowledgeSources, newSource]);

    // Reset form
    setKnowledgeName("");
    setKnowledgeContent("");
    setKnowledgeUrl("");
  };

  const handleRemoveKnowledgeSource = (id: string) => {
    setKnowledgeSources(knowledgeSources.filter(kb => kb.id !== id));
  };

  const handleCreateAgent = () => {
    const newAgent: CustomAgent = {
      id: customAgents.length + 1,
      name: agentName,
      role: agentRole,
      description: agentDescription,
      status: "draft",
      agentType,
      knowledgeBase: knowledgeSources,
      usageCount: 0,
      createdDate: new Date().toLocaleDateString(),
      lastUsed: "Never",
      model: agentModel,
      temperature: agentTemperature,
    };

    setCustomAgents([...customAgents, newAgent]);
    setShowCreateDialog(false);

    // Reset form
    setAgentName("");
    setAgentRole("");
    setAgentDescription("");
    setKnowledgeSources([]);
    setSystemPrompt("");
  };

  const handleDeleteAgent = (id: number) => {
    setCustomAgents(customAgents.filter(agent => agent.id !== id));
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-50 text-green-700 border-green-200",
      draft: "bg-yellow-50 text-yellow-700 border-yellow-200",
      testing: "bg-blue-50 text-blue-700 border-blue-200",
    };
    return styles[status as keyof typeof styles];
  };

  const getAgentTypeIcon = (type: string) => {
    switch (type) {
      case "interviewer":
        return Brain;
      case "screener":
        return Users;
      case "evaluator":
        return CheckCircle2;
      default:
        return Sparkles;
    }
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
            <div className="flex items-center gap-2 mb-4">
              <a href="/company-admin/ai-agents">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to AI Agents
                </Button>
              </a>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <Brain className="w-8 h-8 text-purple-600" />
                  Custom AI Agents
                </h1>
                <p className="text-muted-foreground">
                  Create role-specific AI agents with custom knowledge bases for specialized interviews and evaluations
                </p>
              </div>
              <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Custom Agent
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Custom Agents</p>
                    <p className="text-2xl font-bold">{customAgents.length}</p>
                  </div>
                  <Brain className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Active</p>
                    <p className="text-2xl font-bold">
                      {customAgents.filter(a => a.status === "active").length}
                    </p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Usage</p>
                    <p className="text-2xl font-bold">
                      {customAgents.reduce((acc, a) => acc + a.usageCount, 0)}
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Knowledge Sources</p>
                    <p className="text-2xl font-bold">
                      {customAgents.reduce((acc, a) => acc + a.knowledgeBase.length, 0)}
                    </p>
                  </div>
                  <BookOpen className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Custom Agents List */}
          <div className="space-y-4">
            {customAgents.map((agent) => {
              const TypeIcon = getAgentTypeIcon(agent.agentType);
              return (
                <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <TypeIcon className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold">{agent.name}</h3>
                            <Badge variant="outline" className={getStatusBadge(agent.status)}>
                              {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                            </Badge>
                            <Badge variant="outline">
                              {agent.agentType.charAt(0).toUpperCase() + agent.agentType.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            For: <span className="font-medium text-foreground">{agent.role}</span>
                          </p>
                          <p className="text-muted-foreground mb-4">{agent.description}</p>

                          <div className="grid grid-cols-4 gap-6 mb-4">
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">Knowledge Base</p>
                              <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-purple-600" />
                                <p className="font-semibold">{agent.knowledgeBase.length} sources</p>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">Usage Count</p>
                              <p className="font-semibold">{agent.usageCount}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">Created</p>
                              <p className="font-semibold">{agent.createdDate}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">Last Used</p>
                              <p className="font-semibold">{agent.lastUsed}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="gap-1">
                              <Database className="w-3 h-3" />
                              {agent.model}
                            </Badge>
                            <Badge variant="secondary" className="gap-1">
                              <Settings className="w-3 h-3" />
                              Temp: {agent.temperature}
                            </Badge>
                            {agent.knowledgeBase.map((kb, idx) => (
                              <Badge key={idx} variant="outline" className="gap-1">
                                {kb.type === "document" && <FileText className="w-3 h-3" />}
                                {kb.type === "text" && <Code className="w-3 h-3" />}
                                {kb.type === "url" && <LinkIcon className="w-3 h-3" />}
                                {kb.name}
                              </Badge>
                            ))}
                          </div>
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
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Agent
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <BookOpen className="w-4 h-4 mr-2" />
                            Manage Knowledge Base
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Play className="w-4 h-4 mr-2" />
                            Test Agent
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteAgent(agent.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Agent
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {customAgents.length === 0 && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Custom Agents Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first custom AI agent to get started
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Custom Agent
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Create Custom Agent Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              Create Custom AI Agent
            </DialogTitle>
            <DialogDescription>
              Build a specialized AI agent with custom knowledge for specific roles
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
              <TabsTrigger value="config">Configuration</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Agent Name *</Label>
                  <Input
                    placeholder="e.g., Python Developer Interviewer"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Role / Position *</Label>
                  <Input
                    placeholder="e.g., Senior Python Developer"
                    value={agentRole}
                    onChange={(e) => setAgentRole(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Agent Type *</Label>
                  <Select value={agentType} onValueChange={(value: any) => setAgentType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="interviewer">
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4" />
                          <div>
                            <p className="font-medium">Interviewer</p>
                            <p className="text-xs text-muted-foreground">
                              Conduct technical interviews with candidates
                            </p>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="screener">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <div>
                            <p className="font-medium">Screener</p>
                            <p className="text-xs text-muted-foreground">
                              Screen and evaluate candidate applications
                            </p>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="evaluator">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          <div>
                            <p className="font-medium">Evaluator</p>
                            <p className="text-xs text-muted-foreground">
                              Assess technical skills and provide feedback
                            </p>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea
                    placeholder="Describe what this AI agent will do and its purpose..."
                    value={agentDescription}
                    onChange={(e) => setAgentDescription(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="knowledge" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add Knowledge Sources</CardTitle>
                  <CardDescription>
                    Upload documents, add text, or link to resources that will train your AI agent
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Knowledge Type</Label>
                    <Select value={knowledgeType} onValueChange={(value: any) => setKnowledgeType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="document">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Document Upload (PDF, DOCX, TXT)
                          </div>
                        </SelectItem>
                        <SelectItem value="text">
                          <div className="flex items-center gap-2">
                            <Code className="w-4 h-4" />
                            Text Content
                          </div>
                        </SelectItem>
                        <SelectItem value="url">
                          <div className="flex items-center gap-2">
                            <LinkIcon className="w-4 h-4" />
                            URL / Website
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Source Name</Label>
                    <Input
                      placeholder="e.g., Python Best Practices Guide"
                      value={knowledgeName}
                      onChange={(e) => setKnowledgeName(e.target.value)}
                    />
                  </div>

                  {knowledgeType === "document" && (
                    <div className="space-y-2">
                      <Label>Upload Document</Label>
                      <div className="border-2 border-dashed rounded-lg p-8 text-center">
                        <FileUp className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Drag and drop or click to upload
                        </p>
                        <Button variant="outline" size="sm">
                          Choose File
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                          Supported: PDF, DOCX, TXT (Max 10MB)
                        </p>
                      </div>
                    </div>
                  )}

                  {knowledgeType === "text" && (
                    <div className="space-y-2">
                      <Label>Text Content</Label>
                      <Textarea
                        placeholder="Paste or type the knowledge content here..."
                        value={knowledgeContent}
                        onChange={(e) => setKnowledgeContent(e.target.value)}
                        rows={8}
                        className="font-mono text-sm"
                      />
                    </div>
                  )}

                  {knowledgeType === "url" && (
                    <div className="space-y-2">
                      <Label>URL</Label>
                      <Input
                        type="url"
                        placeholder="https://example.com/documentation"
                        value={knowledgeUrl}
                        onChange={(e) => setKnowledgeUrl(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        The AI will fetch and learn from the content at this URL
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleAddKnowledgeSource}
                    disabled={!knowledgeName}
                    className="w-full gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Knowledge Source
                  </Button>
                </CardContent>
              </Card>

              {knowledgeSources.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Added Sources ({knowledgeSources.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {knowledgeSources.map((source) => (
                        <div
                          key={source.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {source.type === "document" && <FileText className="w-5 h-5 text-blue-600" />}
                            {source.type === "text" && <Code className="w-5 h-5 text-green-600" />}
                            {source.type === "url" && <LinkIcon className="w-5 h-5 text-purple-600" />}
                            <div>
                              <p className="font-medium">{source.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {source.type === "document" && `Document • ${source.fileSize}`}
                                {source.type === "text" && "Text Content"}
                                {source.type === "url" && `URL • ${source.url}`}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveKnowledgeSource(source.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="config" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Model Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>AI Model</Label>
                    <Select value={agentModel} onValueChange={setAgentModel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gemini-2.0-flash">
                          Gemini 2.0 Flash (Fastest, Recommended)
                        </SelectItem>
                        <SelectItem value="gemini-1.5-pro">
                          Gemini 1.5 Pro (Most Capable)
                        </SelectItem>
                        <SelectItem value="gemini-1.5-flash">
                          Gemini 1.5 Flash (Balanced)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Temperature</Label>
                      <Badge variant="outline">{agentTemperature}</Badge>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={agentTemperature}
                      onChange={(e) => setAgentTemperature(Number(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Controls creativity. Lower = more consistent, Higher = more creative
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Prompt (Optional)</CardTitle>
                  <CardDescription>
                    Customize the AI's behavior and instructions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Enter custom system prompt to guide the AI's behavior..."
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    rows={10}
                    className="font-mono text-sm"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateAgent}
              disabled={!agentName || !agentRole || !agentDescription}
              className="flex-1 gap-2"
            >
              <Save className="w-4 h-4" />
              Create Agent
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
