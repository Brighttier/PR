"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  Brain,
  MessageSquare,
  FileText,
  Target,
  Users,
  Video,
  Settings,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Info,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface AIAgent {
  id: string;
  name: string;
  description: string;
  icon: any;
  enabled: boolean;
  category: "screening" | "matching" | "communication" | "analysis";
  usageCount: number;
  lastUsed?: string;
  configPath?: string;
}

interface AIAgentSettings {
  resumeParser: {
    enabled: boolean;
    model: string;
    temperature: number;
  };
  jobMatcher: {
    enabled: boolean;
    model: string;
    matchThreshold: number;
  };
  interviewBot: {
    enabled: boolean;
    model: string;
    personality: string;
  };
  candidateSummarizer: {
    enabled: boolean;
    model: string;
    summaryLength: string;
  };
  emailGenerator: {
    enabled: boolean;
    model: string;
    tone: string;
  };
  meetingTranscriber: {
    enabled: boolean;
    model: string;
    language: string;
  };
  insightsAnalyzer: {
    enabled: boolean;
    model: string;
    insightDepth: string;
  };
}

export default function AIAgentsPage() {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<AIAgentSettings>({
    resumeParser: { enabled: true, model: "gemini-2.0-flash", temperature: 0.3 },
    jobMatcher: { enabled: true, model: "gemini-2.0-flash", matchThreshold: 70 },
    interviewBot: { enabled: true, model: "gemini-2.0-flash", personality: "professional" },
    candidateSummarizer: { enabled: true, model: "gemini-2.0-flash", summaryLength: "medium" },
    emailGenerator: { enabled: true, model: "gemini-2.0-flash", tone: "professional" },
    meetingTranscriber: { enabled: false, model: "gemini-2.0-flash", language: "en" },
    insightsAnalyzer: { enabled: true, model: "gemini-2.0-flash", insightDepth: "detailed" },
  });

  const [agents, setAgents] = useState<AIAgent[]>([
    {
      id: "resumeParser",
      name: "Resume Parser",
      description: "Automatically extract structured data from candidate resumes",
      icon: FileText,
      enabled: true,
      category: "screening",
      usageCount: 0,
      configPath: "/company-admin/settings/ai-agents/resume-parser",
    },
    {
      id: "jobMatcher",
      name: "Job Matcher",
      description: "AI-powered candidate-to-job matching with scoring",
      icon: Target,
      enabled: true,
      category: "matching",
      usageCount: 0,
      configPath: "/company-admin/settings/ai-agents/job-matcher",
    },
    {
      id: "interviewBot",
      name: "Interview Bot",
      description: "Conduct automated AI interviews with candidates",
      icon: MessageSquare,
      enabled: true,
      category: "screening",
      usageCount: 0,
      configPath: "/company-admin/settings/ai-agents/interview-bot",
    },
    {
      id: "candidateSummarizer",
      name: "Candidate Summarizer",
      description: "Generate executive summaries of candidate profiles",
      icon: Brain,
      enabled: true,
      category: "analysis",
      usageCount: 0,
      configPath: "/company-admin/settings/ai-agents/candidate-summarizer",
    },
    {
      id: "emailGenerator",
      name: "Email Generator",
      description: "AI-assisted email composition for candidate communication",
      icon: Sparkles,
      enabled: true,
      category: "communication",
      usageCount: 0,
      configPath: "/company-admin/settings/ai-agents/email-generator",
    },
    {
      id: "meetingTranscriber",
      name: "Meeting Transcriber",
      description: "Real-time transcription and summarization of interviews",
      icon: Video,
      enabled: false,
      category: "analysis",
      usageCount: 0,
      configPath: "/company-admin/settings/ai-agents/meeting-transcriber",
    },
    {
      id: "insightsAnalyzer",
      name: "Insights Analyzer",
      description: "Generate recruitment insights and analytics",
      icon: TrendingUp,
      enabled: true,
      category: "analysis",
      usageCount: 0,
      configPath: "/company-admin/settings/ai-agents/insights-analyzer",
    },
  ]);

  useEffect(() => {
    fetchSettings();
  }, [userProfile?.companyId]);

  const fetchSettings = async () => {
    if (!userProfile?.companyId) return;

    try {
      setLoading(true);
      const settingsDoc = await getDoc(
        doc(db, "companies", userProfile.companyId, "settings", "aiAgents")
      );

      if (settingsDoc.exists()) {
        const data = settingsDoc.data() as Partial<AIAgentSettings>;
        setSettings({ ...settings, ...data });

        // Update agent enabled states
        setAgents((prevAgents) =>
          prevAgents.map((agent) => ({
            ...agent,
            enabled: (data as any)[agent.id]?.enabled ?? agent.enabled,
          }))
        );
      }

      // Fetch usage statistics (mock data for now)
      // In production, this would query actual usage from analytics collection
      setAgents((prevAgents) =>
        prevAgents.map((agent) => ({
          ...agent,
          usageCount: Math.floor(Math.random() * 500),
          lastUsed:
            agent.enabled && Math.random() > 0.3
              ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
              : undefined,
        }))
      );
    } catch (error) {
      console.error("Error fetching AI agent settings:", error);
      toast({
        title: "Error",
        description: "Failed to load AI agent settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAgent = async (agentId: string, enabled: boolean) => {
    if (!userProfile?.companyId) return;

    // Update local state immediately
    setAgents((prevAgents) =>
      prevAgents.map((agent) => (agent.id === agentId ? { ...agent, enabled } : agent))
    );

    setSettings((prev) => ({
      ...prev,
      [agentId]: {
        ...(prev as any)[agentId],
        enabled,
      },
    }));

    // Save to Firestore
    try {
      await setDoc(
        doc(db, "companies", userProfile.companyId, "settings", "aiAgents"),
        {
          [agentId]: {
            ...(settings as any)[agentId],
            enabled,
          },
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      toast({
        title: enabled ? "Agent Enabled" : "Agent Disabled",
        description: `${agents.find((a) => a.id === agentId)?.name} has been ${
          enabled ? "enabled" : "disabled"
        }.`,
      });
    } catch (error) {
      console.error("Error updating agent status:", error);
      toast({
        title: "Error",
        description: "Failed to update agent status.",
        variant: "destructive",
      });

      // Revert on error
      setAgents((prevAgents) =>
        prevAgents.map((agent) => (agent.id === agentId ? { ...agent, enabled: !enabled } : agent))
      );
    }
  };

  const handleConfigure = (configPath?: string) => {
    if (configPath) {
      router.push(configPath);
    } else {
      toast({
        title: "Coming Soon",
        description: "This configuration page is under development.",
      });
    }
  };

  const getEnabledCount = () => agents.filter((a) => a.enabled).length;
  const getTotalUsage = () => agents.reduce((sum, a) => sum + a.usageCount, 0);

  const getCategoryAgents = (category: AIAgent["category"]) =>
    agents.filter((a) => a.category === category);

  const categories = [
    { id: "screening", label: "Screening & Interviewing", icon: MessageSquare },
    { id: "matching", label: "Candidate Matching", icon: Target },
    { id: "communication", label: "Communication", icon: Sparkles },
    { id: "analysis", label: "Analytics & Insights", icon: Brain },
  ] as const;

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Loading AI agents...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">AI Agents Configuration</h1>
            <p className="text-muted-foreground">
              Manage and configure AI-powered features for your recruitment workflow
            </p>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Agents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">
                    {getEnabledCount()} / {agents.length}
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <Progress
                  value={(getEnabledCount() / agents.length) * 100}
                  className="mt-3"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Usage (30 days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{getTotalUsage().toLocaleString()}</div>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  AI operations performed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Model Provider
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-xl font-bold">Google Gemini</div>
                  <Sparkles className="w-8 h-8 text-purple-500" />
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Version: 2.0 Flash
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Info Alert */}
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>AI Processing:</strong> All AI agents use Google's Gemini models for
              advanced natural language processing. Enable or disable agents based on your
              recruitment needs. Click "Configure" to customize each agent's behavior.
            </AlertDescription>
          </Alert>

          {/* Agents by Category */}
          <div className="space-y-8">
            {categories.map((category) => {
              const categoryAgents = getCategoryAgents(category.id as AIAgent["category"]);
              if (categoryAgents.length === 0) return null;

              return (
                <div key={category.id}>
                  <div className="flex items-center gap-3 mb-4">
                    <category.icon className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">{category.label}</h2>
                    <Badge variant="secondary">{categoryAgents.length} agents</Badge>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {categoryAgents.map((agent) => {
                      const Icon = agent.icon;
                      return (
                        <Card
                          key={agent.id}
                          className={`transition-all ${
                            agent.enabled
                              ? "border-primary/20 bg-primary/5"
                              : "opacity-75 hover:opacity-100"
                          }`}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`p-2 rounded-lg ${
                                    agent.enabled
                                      ? "bg-primary/10 text-primary"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                                  <CardDescription className="mt-1">
                                    {agent.description}
                                  </CardDescription>
                                </div>
                              </div>
                              <Switch
                                checked={agent.enabled}
                                onCheckedChange={(enabled) =>
                                  handleToggleAgent(agent.id, enabled)
                                }
                              />
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-6 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Usage (30 days)</p>
                                  <p className="font-semibold">
                                    {agent.usageCount.toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Last Used</p>
                                  <p className="font-semibold">
                                    {agent.lastUsed
                                      ? new Date(agent.lastUsed).toLocaleDateString()
                                      : "Never"}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleConfigure(agent.configPath)}
                                disabled={!agent.enabled}
                              >
                                <Settings className="w-4 h-4 mr-2" />
                                Configure
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </div>

                            {agent.enabled && agent.usageCount > 0 && (
                              <div className="mt-4 pt-4 border-t">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                                  <span>Active and processing requests</span>
                                </div>
                              </div>
                            )}

                            {!agent.enabled && (
                              <div className="mt-4 pt-4 border-t">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <AlertCircle className="w-3 h-3 text-amber-500" />
                                  <span>Agent is disabled. Enable to use this feature.</span>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Global Settings Card */}
          <Card className="mt-8 border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <Sparkles className="w-5 h-5" />
                Global AI Settings
              </CardTitle>
              <CardDescription className="text-purple-700">
                Configure global AI model parameters and behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-purple-900">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Model:</strong> All agents use Google Gemini 2.0 Flash for optimal
                  speed and accuracy
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Data Privacy:</strong> All candidate data is processed securely and
                  in compliance with GDPR
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Fallback:</strong> If AI processing fails, manual review is always
                  available
                </span>
              </div>
              <div className="mt-4">
                <Button variant="outline" className="bg-white">
                  <Settings className="w-4 h-4 mr-2" />
                  Advanced Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
  );
}
