"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2,
  Users,
  BarChart3,
  Settings,
  Activity,
  Shield,
  Save,
  Bell,
  Mail,
  Lock,
  Globe,
  CreditCard,
  Zap,
  Database,
  Cloud,
  Key,
  AlertCircle,
  CheckCircle,
  FileText,
  Palette,
  Code,
  Server,
  Webhook,
  Cpu,
  HardDrive,
  RefreshCw,
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export default function SettingsPage() {
  const [hasChanges, setHasChanges] = useState(false);

  // General Settings State
  const [platformName, setPlatformName] = useState("Persona Recruit AI");
  const [platformUrl, setPlatformUrl] = useState("https://persona-recruit.com");
  const [supportEmail, setSupportEmail] = useState("support@persona-recruit.com");
  const [timezone, setTimezone] = useState("America/New_York");

  // Email Settings State
  const [emailProvider, setEmailProvider] = useState("sendgrid");
  const [emailApiKey, setEmailApiKey] = useState("sg-*********************");
  const [emailFromName, setEmailFromName] = useState("Persona Recruit");
  const [emailFromAddress, setEmailFromAddress] = useState("noreply@persona-recruit.com");

  // Notification Settings State
  const [systemNotifications, setSystemNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [slackNotifications, setSlackNotifications] = useState(false);
  const [criticalAlerts, setCriticalAlerts] = useState(true);

  // Security Settings State
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [passwordMinLength, setPasswordMinLength] = useState("8");
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [ipWhitelist, setIpWhitelist] = useState("");
  const [allowedDomains, setAllowedDomains] = useState("persona-recruit.com\ntechcorp.com");

  // API Settings State
  const [apiRateLimit, setApiRateLimit] = useState("1000");
  const [apiTimeout, setApiTimeout] = useState("30");
  const [webhookUrl, setWebhookUrl] = useState("https://api.persona-recruit.com/webhooks");
  const [apiLogging, setApiLogging] = useState(true);

  // Payment Settings State
  const [paymentProvider, setPaymentProvider] = useState("stripe");
  const [stripePublicKey, setStripePublicKey] = useState("pk_live_*********************");
  const [stripeSecretKey, setStripeSecretKey] = useState("sk_live_*********************");
  const [testMode, setTestMode] = useState(false);

  // AI Settings State
  const [aiProvider, setAiProvider] = useState("gemini");
  const [geminiApiKey, setGeminiApiKey] = useState("*********************");
  const [aiModel, setAiModel] = useState("gemini-1.5-pro");
  const [aiTemperature, setAiTemperature] = useState("0.7");
  const [aiEnabled, setAiEnabled] = useState(true);

  // Storage Settings State
  const [storageProvider, setStorageProvider] = useState("firebase");
  const [storageBucket, setStorageBucket] = useState("persona-recruit-storage");
  const [maxFileSize, setMaxFileSize] = useState("10");
  const [allowedFileTypes, setAllowedFileTypes] = useState("pdf,doc,docx,jpg,png");

  // Feature Flags State
  const [resumeParsingEnabled, setResumeParsingEnabled] = useState(true);
  const [jobMatchingEnabled, setJobMatchingEnabled] = useState(true);
  const [videoInterviewsEnabled, setVideoInterviewsEnabled] = useState(true);
  const [candidateChatEnabled, setCandidateChatEnabled] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  const handleSaveSettings = () => {
    console.log("Saving platform settings...");
    // In a real app, this would save to the backend
    setHasChanges(false);
  };

  const markAsChanged = () => {
    setHasChanges(true);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Platform Admin</h1>
              <p className="text-xs text-muted-foreground">System Control</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <a href="/platform-admin/dashboard" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </a>
          <a href="/platform-admin/companies" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <Building2 className="w-5 h-5" />
            <span className="font-medium">Companies</span>
          </a>
          <a href="/platform-admin/users" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <Users className="w-5 h-5" />
            <span className="font-medium">Users</span>
          </a>
          <a href="/platform-admin/system-health" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <Activity className="w-5 h-5" />
            <span className="font-medium">System Health</span>
          </a>
          <a href="/platform-admin/reports" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <FileText className="w-5 h-5" />
            <span className="font-medium">Reports</span>
          </a>
          <a href="/platform-admin/settings" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </a>
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 bg-red-600 text-white flex items-center justify-center font-semibold">
              PA
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-sm">Platform Admin</p>
              <p className="text-xs text-muted-foreground">admin@persona-recruit.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-muted/30">
        <header className="border-b bg-card sticky top-0 z-10">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Platform Settings</h2>
                <p className="text-muted-foreground">
                  Configure system-wide settings and integrations
                </p>
              </div>
              <div className="flex gap-3">
                {hasChanges && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Unsaved Changes
                  </Badge>
                )}
                <Button onClick={handleSaveSettings} disabled={!hasChanges}>
                  <Save className="w-4 h-4 mr-2" />
                  Save All Settings
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="api">API</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="storage">Storage</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
            </TabsList>

            {/* General Settings Tab */}
            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Platform Settings</CardTitle>
                  <CardDescription>
                    Basic platform configuration and branding
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="platform-name">Platform Name</Label>
                      <Input
                        id="platform-name"
                        value={platformName}
                        onChange={(e) => { setPlatformName(e.target.value); markAsChanged(); }}
                        placeholder="Platform name"
                      />
                      <p className="text-xs text-muted-foreground">
                        The name displayed across the platform
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="platform-url">Platform URL</Label>
                      <Input
                        id="platform-url"
                        value={platformUrl}
                        onChange={(e) => { setPlatformUrl(e.target.value); markAsChanged(); }}
                        placeholder="https://yourplatform.com"
                      />
                      <p className="text-xs text-muted-foreground">
                        Primary domain for the platform
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="support-email">Support Email</Label>
                      <Input
                        id="support-email"
                        type="email"
                        value={supportEmail}
                        onChange={(e) => { setSupportEmail(e.target.value); markAsChanged(); }}
                        placeholder="support@example.com"
                      />
                      <p className="text-xs text-muted-foreground">
                        Email for user support inquiries
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Default Timezone</Label>
                      <Select value={timezone} onValueChange={(value) => { setTimezone(value); markAsChanged(); }}>
                        <SelectTrigger id="timezone">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                          <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                          <SelectItem value="Europe/London">London (GMT)</SelectItem>
                          <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                          <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                          <SelectItem value="Asia/Kolkata">India (IST)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Default timezone for the platform
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                  <CardDescription>
                    Current platform version and status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Platform Version</p>
                      <p className="text-2xl font-bold">v2.3.1</p>
                      <Badge className="mt-2 bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Up to date
                      </Badge>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Database Version</p>
                      <p className="text-2xl font-bold">PostgreSQL 15.2</p>
                      <p className="text-xs text-muted-foreground mt-2">Last backup: 2 hours ago</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Environment</p>
                      <p className="text-2xl font-bold">Production</p>
                      <Badge className="mt-2 bg-blue-100 text-blue-800">
                        Live
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Email Settings Tab */}
            <TabsContent value="email" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Provider Configuration</CardTitle>
                  <CardDescription>
                    Configure email delivery service
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email-provider">Email Provider</Label>
                      <Select value={emailProvider} onValueChange={(value) => { setEmailProvider(value); markAsChanged(); }}>
                        <SelectTrigger id="email-provider">
                          <Mail className="w-4 h-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sendgrid">SendGrid</SelectItem>
                          <SelectItem value="mailgun">Mailgun</SelectItem>
                          <SelectItem value="ses">Amazon SES</SelectItem>
                          <SelectItem value="smtp">Custom SMTP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-api-key">API Key</Label>
                      <Input
                        id="email-api-key"
                        type="password"
                        value={emailApiKey}
                        onChange={(e) => { setEmailApiKey(e.target.value); markAsChanged(); }}
                        placeholder="Enter API key"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email-from-name">From Name</Label>
                      <Input
                        id="email-from-name"
                        value={emailFromName}
                        onChange={(e) => { setEmailFromName(e.target.value); markAsChanged(); }}
                        placeholder="Your Platform Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-from-address">From Email Address</Label>
                      <Input
                        id="email-from-address"
                        type="email"
                        value={emailFromAddress}
                        onChange={(e) => { setEmailFromAddress(e.target.value); markAsChanged(); }}
                        placeholder="noreply@example.com"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Test Email Configuration</p>
                      <p className="text-sm text-muted-foreground">
                        Send a test email to verify settings
                      </p>
                    </div>
                    <Button variant="outline">
                      <Mail className="w-4 h-4 mr-2" />
                      Send Test Email
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Email Templates</CardTitle>
                  <CardDescription>
                    Manage email template settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: "Welcome Email", status: "Active", lastUpdated: "2 days ago" },
                      { name: "Password Reset", status: "Active", lastUpdated: "1 week ago" },
                      { name: "Application Submitted", status: "Active", lastUpdated: "3 days ago" },
                      { name: "Interview Scheduled", status: "Active", lastUpdated: "5 days ago" },
                      { name: "Job Alert", status: "Active", lastUpdated: "1 day ago" },
                    ].map((template) => (
                      <div key={template.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{template.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Last updated: {template.lastUpdated}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800">
                            {template.status}
                          </Badge>
                          <Button variant="ghost" size="sm">Edit</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Channels</CardTitle>
                  <CardDescription>
                    Configure how you receive platform notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">System Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          In-app notifications for platform events
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={systemNotifications}
                      onCheckedChange={(checked) => { setSystemNotifications(checked); markAsChanged(); }}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={(checked) => { setEmailNotifications(checked); markAsChanged(); }}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Webhook className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium">Slack Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Send notifications to Slack channel
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={slackNotifications}
                      onCheckedChange={(checked) => { setSlackNotifications(checked); markAsChanged(); }}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="font-medium">Critical Alerts</p>
                        <p className="text-sm text-muted-foreground">
                          Always notify for critical system issues
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={criticalAlerts}
                      onCheckedChange={(checked) => { setCriticalAlerts(checked); markAsChanged(); }}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Configure authentication and access controls
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">
                          Require 2FA for all admin accounts
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={twoFactorAuth}
                      onCheckedChange={(checked) => { setTwoFactorAuth(checked); markAsChanged(); }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="password-min-length">Minimum Password Length</Label>
                      <Input
                        id="password-min-length"
                        type="number"
                        value={passwordMinLength}
                        onChange={(e) => { setPasswordMinLength(e.target.value); markAsChanged(); }}
                        min="6"
                        max="32"
                      />
                      <p className="text-xs text-muted-foreground">
                        Characters (6-32)
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="session-timeout">Session Timeout</Label>
                      <Input
                        id="session-timeout"
                        type="number"
                        value={sessionTimeout}
                        onChange={(e) => { setSessionTimeout(e.target.value); markAsChanged(); }}
                        min="5"
                        max="1440"
                      />
                      <p className="text-xs text-muted-foreground">
                        Minutes (5-1440)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ip-whitelist">IP Whitelist</Label>
                    <Textarea
                      id="ip-whitelist"
                      value={ipWhitelist}
                      onChange={(e) => { setIpWhitelist(e.target.value); markAsChanged(); }}
                      placeholder="Enter IP addresses (one per line)"
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      Restrict admin access to specific IP addresses
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="allowed-domains">Allowed Email Domains</Label>
                    <Textarea
                      id="allowed-domains"
                      value={allowedDomains}
                      onChange={(e) => { setAllowedDomains(e.target.value); markAsChanged(); }}
                      placeholder="example.com"
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      Email domains allowed for registration (one per line)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* API Settings Tab */}
            <TabsContent value="api" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Configuration</CardTitle>
                  <CardDescription>
                    Configure API rate limits and webhooks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="api-rate-limit">Rate Limit (requests/hour)</Label>
                      <Input
                        id="api-rate-limit"
                        type="number"
                        value={apiRateLimit}
                        onChange={(e) => { setApiRateLimit(e.target.value); markAsChanged(); }}
                        placeholder="1000"
                      />
                      <p className="text-xs text-muted-foreground">
                        Maximum API requests per hour per key
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="api-timeout">API Timeout (seconds)</Label>
                      <Input
                        id="api-timeout"
                        type="number"
                        value={apiTimeout}
                        onChange={(e) => { setApiTimeout(e.target.value); markAsChanged(); }}
                        placeholder="30"
                      />
                      <p className="text-xs text-muted-foreground">
                        Request timeout duration
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="webhook-url">Webhook URL</Label>
                    <Input
                      id="webhook-url"
                      value={webhookUrl}
                      onChange={(e) => { setWebhookUrl(e.target.value); markAsChanged(); }}
                      placeholder="https://api.example.com/webhooks"
                    />
                    <p className="text-xs text-muted-foreground">
                      Endpoint for platform event webhooks
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Code className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">API Request Logging</p>
                        <p className="text-sm text-muted-foreground">
                          Log all API requests for debugging
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={apiLogging}
                      onCheckedChange={(checked) => { setApiLogging(checked); markAsChanged(); }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>
                    Manage platform API keys
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: "Production API Key", type: "Production", created: "30 days ago", lastUsed: "2 min ago" },
                      { name: "Development API Key", type: "Development", created: "45 days ago", lastUsed: "1 hour ago" },
                      { name: "Mobile App API Key", type: "Production", created: "15 days ago", lastUsed: "5 min ago" },
                    ].map((key) => (
                      <div key={key.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Key className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{key.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Created {key.created} • Last used {key.lastUsed}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={key.type === "Production" ? "default" : "outline"}>
                            {key.type}
                          </Badge>
                          <Button variant="ghost" size="sm">Revoke</Button>
                        </div>
                      </div>
                    ))}
                    <Button className="w-full" variant="outline">
                      <Key className="w-4 h-4 mr-2" />
                      Generate New API Key
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Integrations Tab */}
            <TabsContent value="integrations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Integration</CardTitle>
                  <CardDescription>
                    Configure payment processing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="payment-provider">Payment Provider</Label>
                    <Select value={paymentProvider} onValueChange={(value) => { setPaymentProvider(value); markAsChanged(); }}>
                      <SelectTrigger id="payment-provider">
                        <CreditCard className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stripe">Stripe</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="square">Square</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="stripe-public-key">Stripe Public Key</Label>
                      <Input
                        id="stripe-public-key"
                        value={stripePublicKey}
                        onChange={(e) => { setStripePublicKey(e.target.value); markAsChanged(); }}
                        placeholder="pk_live_..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stripe-secret-key">Stripe Secret Key</Label>
                      <Input
                        id="stripe-secret-key"
                        type="password"
                        value={stripeSecretKey}
                        onChange={(e) => { setStripeSecretKey(e.target.value); markAsChanged(); }}
                        placeholder="sk_live_..."
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="font-medium">Test Mode</p>
                        <p className="text-sm text-muted-foreground">
                          Use test API keys for development
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={testMode}
                      onCheckedChange={(checked) => { setTestMode(checked); markAsChanged(); }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Integration (Gemini)</CardTitle>
                  <CardDescription>
                    Configure AI-powered features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="ai-provider">AI Provider</Label>
                      <Select value={aiProvider} onValueChange={(value) => { setAiProvider(value); markAsChanged(); }}>
                        <SelectTrigger id="ai-provider">
                          <Cpu className="w-4 h-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gemini">Google Gemini</SelectItem>
                          <SelectItem value="openai">OpenAI GPT</SelectItem>
                          <SelectItem value="claude">Anthropic Claude</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gemini-api-key">API Key</Label>
                      <Input
                        id="gemini-api-key"
                        type="password"
                        value={geminiApiKey}
                        onChange={(e) => { setGeminiApiKey(e.target.value); markAsChanged(); }}
                        placeholder="Enter Gemini API key"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="ai-model">Model</Label>
                      <Select value={aiModel} onValueChange={(value) => { setAiModel(value); markAsChanged(); }}>
                        <SelectTrigger id="ai-model">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                          <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                          <SelectItem value="gemini-1.0-pro">Gemini 1.0 Pro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ai-temperature">Temperature</Label>
                      <Input
                        id="ai-temperature"
                        type="number"
                        value={aiTemperature}
                        onChange={(e) => { setAiTemperature(e.target.value); markAsChanged(); }}
                        min="0"
                        max="2"
                        step="0.1"
                      />
                      <p className="text-xs text-muted-foreground">
                        Creativity (0.0 - 2.0)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Cpu className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Enable AI Features</p>
                        <p className="text-sm text-muted-foreground">
                          Turn on AI-powered resume parsing and matching
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={aiEnabled}
                      onCheckedChange={(checked) => { setAiEnabled(checked); markAsChanged(); }}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Storage Tab */}
            <TabsContent value="storage" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Storage Configuration</CardTitle>
                  <CardDescription>
                    Configure file storage and uploads
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="storage-provider">Storage Provider</Label>
                      <Select value={storageProvider} onValueChange={(value) => { setStorageProvider(value); markAsChanged(); }}>
                        <SelectTrigger id="storage-provider">
                          <Cloud className="w-4 h-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="firebase">Firebase Storage</SelectItem>
                          <SelectItem value="s3">Amazon S3</SelectItem>
                          <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                          <SelectItem value="azure">Azure Blob Storage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="storage-bucket">Storage Bucket</Label>
                      <Input
                        id="storage-bucket"
                        value={storageBucket}
                        onChange={(e) => { setStorageBucket(e.target.value); markAsChanged(); }}
                        placeholder="bucket-name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="max-file-size">Max File Size (MB)</Label>
                      <Input
                        id="max-file-size"
                        type="number"
                        value={maxFileSize}
                        onChange={(e) => { setMaxFileSize(e.target.value); markAsChanged(); }}
                        placeholder="10"
                      />
                      <p className="text-xs text-muted-foreground">
                        Maximum upload size per file
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="allowed-file-types">Allowed File Types</Label>
                      <Input
                        id="allowed-file-types"
                        value={allowedFileTypes}
                        onChange={(e) => { setAllowedFileTypes(e.target.value); markAsChanged(); }}
                        placeholder="pdf,doc,docx,jpg,png"
                      />
                      <p className="text-xs text-muted-foreground">
                        Comma-separated file extensions
                      </p>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-muted/50">
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Total Storage Used</p>
                        <p className="text-2xl font-bold">145.6 GB</p>
                        <p className="text-xs text-muted-foreground mt-1">of 500 GB limit</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Total Files</p>
                        <p className="text-2xl font-bold">34,567</p>
                        <p className="text-xs text-muted-foreground mt-1">across all users</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Storage Growth</p>
                        <p className="text-2xl font-bold">+12.5%</p>
                        <p className="text-xs text-muted-foreground mt-1">this month</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Features Tab */}
            <TabsContent value="features" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Feature Flags</CardTitle>
                  <CardDescription>
                    Enable or disable platform features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">AI Resume Parsing</p>
                        <p className="text-sm text-muted-foreground">
                          Extract structured data from resumes using AI
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={resumeParsingEnabled}
                      onCheckedChange={(checked) => { setResumeParsingEnabled(checked); markAsChanged(); }}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium">Job Matching Algorithm</p>
                        <p className="text-sm text-muted-foreground">
                          AI-powered job-candidate matching
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={jobMatchingEnabled}
                      onCheckedChange={(checked) => { setJobMatchingEnabled(checked); markAsChanged(); }}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">Video Interviews</p>
                        <p className="text-sm text-muted-foreground">
                          Enable video interview scheduling and recording
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={videoInterviewsEnabled}
                      onCheckedChange={(checked) => { setVideoInterviewsEnabled(checked); markAsChanged(); }}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="font-medium">Candidate Chat</p>
                        <p className="text-sm text-muted-foreground">
                          Real-time messaging between candidates and recruiters
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={candidateChatEnabled}
                      onCheckedChange={(checked) => { setCandidateChatEnabled(checked); markAsChanged(); }}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-5 h-5 text-cyan-600" />
                      <div>
                        <p className="font-medium">Advanced Analytics</p>
                        <p className="text-sm text-muted-foreground">
                          Detailed hiring analytics and insights
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={analyticsEnabled}
                      onCheckedChange={(checked) => { setAnalyticsEnabled(checked); markAsChanged(); }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Mode</CardTitle>
                  <CardDescription>
                    System maintenance and updates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border border-yellow-300 rounded-lg bg-yellow-50">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-900">Scheduled Maintenance</p>
                        <p className="text-sm text-yellow-800 mt-1">
                          System will be unavailable during maintenance. All users will be notified.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Clear Cache
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Database className="w-4 h-4 mr-2" />
                      Backup Database
                    </Button>
                    <Button variant="outline" className="flex-1 border-yellow-300 text-yellow-700 hover:bg-yellow-50">
                      <Server className="w-4 h-4 mr-2" />
                      Enable Maintenance Mode
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
