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
  Zap,
  Settings,
  Play,
  Save,
  RotateCcw,
  TrendingUp,
  Target,
  CheckCircle2,
  AlertCircle,
  Info,
  ChevronRight,
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
} from "@/components/ui/dialog";

interface AIAgent {
  id: string;
  name: string;
  description: string;
  icon: any;
  status: "enabled" | "disabled";
  color: string;
  category: "screening" | "interview" | "analysis" | "communication";
  usageCount: number;
  lastUsed: string;
}

export default function AIAgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);

  // AI Agent configurations
  const [resumeParserEnabled, setResumeParserEnabled] = useState(true);
  const [resumeParserModel, setResumeParserModel] = useState("gemini-2.0-flash");
  const [resumeParserTemp, setResumeParserTemp] = useState(0.3);

  const [candidateScreeningEnabled, setCandidateScreeningEnabled] = useState(true);
  const [screeningModel, setScreeningModel] = useState("gemini-2.0-flash");
  const [screeningTemp, setScreeningTemp] = useState(0.7);
  const [matchThreshold, setMatchThreshold] = useState(70);

  const [interviewBotEnabled, setInterviewBotEnabled] = useState(true);
  const [interviewModel, setInterviewModel] = useState("gemini-1.5-pro");
  const [interviewTemp, setInterviewTemp] = useState(0.8);

  const [emailAssistantEnabled, setEmailAssistantEnabled] = useState(true);
  const [emailModel, setEmailModel] = useState("gemini-2.0-flash");
  const [emailTemp, setEmailTemp] = useState(0.9);

  const agents: AIAgent[] = [
    {
      id: "resume-parser",
      name: "Resume Parser",
      description: "Automatically extract and structure data from resumes and CVs",
      icon: FileText,
      status: resumeParserEnabled ? "enabled" : "disabled",
      color: "blue",
      category: "screening",
      usageCount: 1247,
      lastUsed: "2 hours ago",
    },
    {
      id: "candidate-screening",
      name: "Candidate Screening",
      description: "AI-powered candidate evaluation and job matching with detailed analysis",
      icon: Users,
      status: candidateScreeningEnabled ? "enabled" : "disabled",
      color: "purple",
      category: "screening",
      usageCount: 856,
      lastUsed: "1 hour ago",
    },
    {
      id: "interview-bot",
      name: "AI Interview Bot",
      description: "Conduct automated video/voice interviews with natural conversation",
      icon: MessageSquare,
      status: interviewBotEnabled ? "enabled" : "disabled",
      color: "green",
      category: "interview",
      usageCount: 432,
      lastUsed: "30 minutes ago",
    },
    {
      id: "email-assistant",
      name: "Email Assistant",
      description: "Generate professional emails and responses for candidate communication",
      icon: Brain,
      status: emailAssistantEnabled ? "enabled" : "disabled",
      color: "orange",
      category: "communication",
      usageCount: 678,
      lastUsed: "15 minutes ago",
    },
    {
      id: "skill-extraction",
      name: "Skill Extraction",
      description: "Identify and categorize technical and soft skills from resumes",
      icon: Target,
      status: "enabled",
      color: "pink",
      category: "analysis",
      usageCount: 1102,
      lastUsed: "3 hours ago",
    },
    {
      id: "sentiment-analysis",
      name: "Sentiment Analysis",
      description: "Analyze candidate responses and interview feedback for insights",
      icon: TrendingUp,
      status: "enabled",
      color: "teal",
      category: "analysis",
      usageCount: 345,
      lastUsed: "1 day ago",
    },
  ];

  const stats = {
    totalAgents: agents.length,
    activeAgents: agents.filter(a => a.status === "enabled").length,
    totalUsage: agents.reduce((acc, a) => acc + a.usageCount, 0),
    avgResponseTime: "1.2s",
  };

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      blue: "bg-blue-100 text-blue-700 border-blue-200",
      purple: "bg-purple-100 text-purple-700 border-purple-200",
      green: "bg-green-100 text-green-700 border-green-200",
      orange: "bg-orange-100 text-orange-700 border-orange-200",
      pink: "bg-pink-100 text-pink-700 border-pink-200",
      teal: "bg-teal-100 text-teal-700 border-teal-200",
    };
    return colors[color] || colors.blue;
  };

  const handleConfigureAgent = (agent: AIAgent) => {
    setSelectedAgent(agent);
    setShowConfigDialog(true);
  };

  const handleTestAgent = (agent: AIAgent) => {
    setSelectedAgent(agent);
    setShowTestDialog(true);
  };

  const handleSaveConfiguration = () => {
    console.log("Saving AI configuration...");
    setShowConfigDialog(false);
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
                  <Sparkles className="w-8 h-8 text-purple-600" />
                  AI Agents
                </h1>
                <p className="text-muted-foreground">
                  Configure and manage AI-powered automation for your recruitment workflow
                </p>
              </div>
              <a href="/company-admin/ai-agents/custom">
                <Button className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Create Custom Agent
                </Button>
              </a>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Agents</p>
                      <p className="text-2xl font-bold">{stats.totalAgents}</p>
                    </div>
                    <Sparkles className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Active</p>
                      <p className="text-2xl font-bold">{stats.activeAgents}</p>
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
                      <p className="text-2xl font-bold">{stats.totalUsage.toLocaleString()}</p>
                    </div>
                    <Zap className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Avg Response</p>
                      <p className="text-2xl font-bold">{stats.avgResponseTime}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* AI Agents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {agents.map((agent) => {
              const Icon = agent.icon;
              return (
                <Card
                  key={agent.id}
                  className={`hover:shadow-lg transition-all ${
                    agent.status === "enabled" ? "border-primary/50" : ""
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className={`p-3 rounded-lg ${getColorClass(agent.color)}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          agent.status === "enabled"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-gray-50 text-gray-700 border-gray-200"
                        }
                      >
                        {agent.status === "enabled" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <CardDescription>{agent.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="space-y-1">
                          <p className="text-muted-foreground">Usage Count</p>
                          <p className="font-semibold">{agent.usageCount.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-muted-foreground">Last Used</p>
                          <p className="font-semibold">{agent.lastUsed}</p>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={() => handleConfigureAgent(agent)}
                        >
                          <Settings className="w-4 h-4" />
                          Configure
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={() => handleTestAgent(agent)}
                        >
                          <Play className="w-4 h-4" />
                          Test
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Custom AI Agents Section */}
          <Card className="border-green-200 bg-green-50 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-green-600" />
                Create Custom AI Agents
              </CardTitle>
              <CardDescription className="text-green-900">
                Build specialized AI agents with custom knowledge bases for specific roles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-green-900 mb-2">Role-Specific Interviews</h4>
                  <p className="text-sm text-green-800 mb-4">
                    Create AI interviewers tailored to specific roles (e.g., Python Developer, React Frontend, DevOps Engineer) with custom knowledge bases including documents, technical guides, and best practices.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className="bg-white text-green-700 border-green-300">
                      <FileText className="w-3 h-3 mr-1" />
                      Upload Documents
                    </Badge>
                    <Badge variant="outline" className="bg-white text-green-700 border-green-300">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Add Text Content
                    </Badge>
                    <Badge variant="outline" className="bg-white text-green-700 border-green-300">
                      <Target className="w-3 h-3 mr-1" />
                      Link Resources
                    </Badge>
                  </div>
                  <a href="/company-admin/ai-agents/custom">
                    <Button className="gap-2">
                      <Sparkles className="w-4 h-4" />
                      Create Custom Agent
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
                <div className="w-48 space-y-2">
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-semibold">Python Interviewer</span>
                    </div>
                    <p className="text-xs text-muted-foreground">5 knowledge sources</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-semibold">React Screener</span>
                    </div>
                    <p className="text-xs text-muted-foreground">3 knowledge sources</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-semibold">DevOps Evaluator</span>
                    </div>
                    <p className="text-xs text-muted-foreground">4 knowledge sources</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Configuration Section */}
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                Quick Configuration
              </CardTitle>
              <CardDescription>
                Common settings across all AI agents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Default AI Model</Label>
                  <Select defaultValue="gemini-2.0-flash">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash (Fastest)</SelectItem>
                      <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro (Balanced)</SelectItem>
                      <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash (Fast)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Response Quality</Label>
                  <Select defaultValue="balanced">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fast">Fast (Lower accuracy)</SelectItem>
                      <SelectItem value="balanced">Balanced (Recommended)</SelectItem>
                      <SelectItem value="accurate">Accurate (Slower)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">AI Usage & Costs</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      All AI features are included in your Professional plan. Additional usage beyond
                      fair use limits may incur extra charges.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Configure Agent Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedAgent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {(() => {
                    const Icon = selectedAgent.icon;
                    return <Icon className="w-5 h-5" />;
                  })()}
                  Configure {selectedAgent.name}
                </DialogTitle>
                <DialogDescription>
                  Customize settings and parameters for this AI agent
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="settings" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="model">Model Parameters</TabsTrigger>
                  <TabsTrigger value="prompt">System Prompt</TabsTrigger>
                </TabsList>

                <TabsContent value="settings" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Basic Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                          <Label>Enable Agent</Label>
                          <p className="text-xs text-muted-foreground">
                            Activate or deactivate this AI agent
                          </p>
                        </div>
                        <Switch
                          checked={selectedAgent.status === "enabled"}
                          onCheckedChange={() => {}}
                        />
                      </div>

                      {selectedAgent.id === "candidate-screening" && (
                        <div className="space-y-2">
                          <Label>Match Score Threshold</Label>
                          <div className="flex items-center gap-4">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={matchThreshold}
                              onChange={(e) => setMatchThreshold(Number(e.target.value))}
                              className="flex-1"
                            />
                            <Badge variant="outline" className="min-w-[60px] justify-center">
                              {matchThreshold}%
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Minimum match score to consider a candidate qualified
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="model" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Model Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>AI Model</Label>
                        <Select
                          value={
                            selectedAgent.id === "resume-parser"
                              ? resumeParserModel
                              : selectedAgent.id === "interview-bot"
                              ? interviewModel
                              : screeningModel
                          }
                          onValueChange={(value) => {
                            if (selectedAgent.id === "resume-parser") setResumeParserModel(value);
                            else if (selectedAgent.id === "interview-bot") setInterviewModel(value);
                            else setScreeningModel(value);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gemini-2.0-flash">
                              Gemini 2.0 Flash (Fastest, Recommended)
                            </SelectItem>
                            <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro (Most Capable)</SelectItem>
                            <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash (Balanced)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Temperature</Label>
                          <Badge variant="outline">
                            {selectedAgent.id === "resume-parser"
                              ? resumeParserTemp
                              : selectedAgent.id === "interview-bot"
                              ? interviewTemp
                              : screeningTemp}
                          </Badge>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="2"
                          step="0.1"
                          value={
                            selectedAgent.id === "resume-parser"
                              ? resumeParserTemp
                              : selectedAgent.id === "interview-bot"
                              ? interviewTemp
                              : screeningTemp
                          }
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            if (selectedAgent.id === "resume-parser") setResumeParserTemp(value);
                            else if (selectedAgent.id === "interview-bot") setInterviewTemp(value);
                            else setScreeningTemp(value);
                          }}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          Controls randomness. Lower = more deterministic, Higher = more creative
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Max Output Tokens</Label>
                        <Input type="number" defaultValue="2048" />
                        <p className="text-xs text-muted-foreground">
                          Maximum length of AI response (256 - 8192)
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="prompt" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">System Prompt</CardTitle>
                      <CardDescription>
                        Customize the AI agent's behavior and instructions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Use Custom Prompt</Label>
                          <Switch defaultChecked={false} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Custom System Prompt</Label>
                        <Textarea
                          placeholder="Enter custom instructions for the AI agent..."
                          rows={10}
                          className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          Advanced: Customize the AI's behavior and response style
                        </p>
                      </div>

                      <Button variant="outline" className="gap-2">
                        <RotateCcw className="w-4 h-4" />
                        Reset to Default
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowConfigDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveConfiguration} className="flex-1 gap-2">
                  <Save className="w-4 h-4" />
                  Save Configuration
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Test Agent Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent className="max-w-2xl">
          {selectedAgent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Test {selectedAgent.name}
                </DialogTitle>
                <DialogDescription>
                  Test the AI agent with sample data to verify configuration
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Test Input</Label>
                  <Textarea
                    placeholder="Enter test input for the AI agent..."
                    rows={6}
                  />
                </div>

                <Button className="w-full gap-2">
                  <Play className="w-4 h-4" />
                  Run Test
                </Button>

                <div className="p-4 bg-gray-50 border rounded-lg">
                  <Label className="mb-2 block">Output</Label>
                  <p className="text-sm text-muted-foreground">
                    Test results will appear here...
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
