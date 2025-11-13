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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Save,
  Upload,
  Mail,
  Bell,
  Globe,
  Lock,
  CreditCard,
  Palette,
  Zap,
  Shield,
  Users,
  BarChart3,
  Briefcase,
  FileText,
  Settings,
  Calendar,
  Folder,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function CompanyAdminSettingsPage() {
  // Company Profile State
  const [companyName, setCompanyName] = useState("TechCorp Inc.");
  const [companyWebsite, setCompanyWebsite] = useState("https://techcorp.com");
  const [companyIndustry, setCompanyIndustry] = useState("Technology");
  const [companySize, setCompanySize] = useState("51-200");
  const [companyDescription, setCompanyDescription] = useState(
    "Leading technology company focused on innovative solutions."
  );
  const [companyLogo, setCompanyLogo] = useState("");

  // Career Page State
  const [careerPageEnabled, setCareerPageEnabled] = useState(true);
  const [careerPageSlug, setCareerPageSlug] = useState("techcorp");
  const [careerPageTitle, setCareerPageTitle] = useState("Join Our Team");
  const [careerPageDescription, setCareerPageDescription] = useState(
    "We're looking for talented individuals to join our growing team."
  );
  const [showSalary, setShowSalary] = useState(true);
  const [showBenefits, setShowBenefits] = useState(true);

  // Notification State
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [newApplicationNotif, setNewApplicationNotif] = useState(true);
  const [interviewReminderNotif, setInterviewReminderNotif] = useState(true);
  const [dailyDigestNotif, setDailyDigestNotif] = useState(false);
  const [weeklyReportNotif, setWeeklyReportNotif] = useState(true);

  // Privacy & Security State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [dataRetention, setDataRetention] = useState("12");
  const [gdprCompliance, setGdprCompliance] = useState(true);

  // AI Settings State
  const [aiScreeningEnabled, setAiScreeningEnabled] = useState(true);
  const [autoRejectThreshold, setAutoRejectThreshold] = useState(30);
  const [aiInterviewEnabled, setAiInterviewEnabled] = useState(true);
  const [aiResumeParsingEnabled, setAiResumeParsingEnabled] = useState(true);

  // Integration State
  const [slackIntegration, setSlackIntegration] = useState(false);
  const [calendarIntegration, setCalendarIntegration] = useState(true);
  const [hrisIntegration, setHrisIntegration] = useState(false);

  // Billing State
  const [currentPlan] = useState("Professional");
  const [billingCycle] = useState("Monthly");
  const [nextBillingDate] = useState("Feb 15, 2024");
  const [monthlyPrice] = useState("$599");

  const handleSaveCompanyProfile = () => {
    console.log("Saving company profile...");
    // In production, save to backend
  };

  const handleSaveCareerPage = () => {
    console.log("Saving career page settings...");
  };

  const handleSaveNotifications = () => {
    console.log("Saving notification settings...");
  };

  const handleSavePrivacy = () => {
    console.log("Saving privacy settings...");
  };

  const handleSaveAISettings = () => {
    console.log("Saving AI settings...");
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
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground"
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
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">
              Manage your company profile, preferences, and integrations
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="company" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="company">Company</TabsTrigger>
              <TabsTrigger value="career-page">Career Page</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="privacy">Privacy & Security</TabsTrigger>
              <TabsTrigger value="ai">AI Settings</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>

            {/* Company Profile Tab */}
            <TabsContent value="company" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>
                    Update your company details and branding
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Company Logo</Label>
                      <div className="flex items-center gap-4">
                        <Avatar className="w-20 h-20">
                          <AvatarImage src={companyLogo} />
                          <AvatarFallback>
                            <Building2 className="w-10 h-10" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Button variant="outline" className="gap-2">
                            <Upload className="w-4 h-4" />
                            Upload Logo
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2">
                            PNG, JPG or SVG. Max size 2MB. Recommended: 500x500px
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Company Name *</Label>
                        <Input
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Website</Label>
                        <Input
                          type="url"
                          value={companyWebsite}
                          onChange={(e) => setCompanyWebsite(e.target.value)}
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Industry</Label>
                        <Select value={companyIndustry} onValueChange={setCompanyIndustry}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Technology">Technology</SelectItem>
                            <SelectItem value="Healthcare">Healthcare</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="Education">Education</SelectItem>
                            <SelectItem value="Retail">Retail</SelectItem>
                            <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Company Size</Label>
                        <Select value={companySize} onValueChange={setCompanySize}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-10">1-10 employees</SelectItem>
                            <SelectItem value="11-50">11-50 employees</SelectItem>
                            <SelectItem value="51-200">51-200 employees</SelectItem>
                            <SelectItem value="201-500">201-500 employees</SelectItem>
                            <SelectItem value="501-1000">501-1000 employees</SelectItem>
                            <SelectItem value="1000+">1000+ employees</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Company Description</Label>
                      <Textarea
                        value={companyDescription}
                        onChange={(e) => setCompanyDescription(e.target.value)}
                        rows={4}
                        placeholder="Brief description of your company..."
                      />
                      <p className="text-xs text-muted-foreground">
                        {companyDescription.length}/500 characters
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveCompanyProfile} className="gap-2">
                      <Save className="w-4 h-4" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Career Page Tab */}
            <TabsContent value="career-page" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Career Page Settings</CardTitle>
                      <CardDescription>
                        Customize your public career page and job listings
                      </CardDescription>
                    </div>
                    <Switch checked={careerPageEnabled} onCheckedChange={setCareerPageEnabled} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Career Page URL</Label>
                      <div className="flex gap-2">
                        <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border">
                          <Globe className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            careers.recruitai.com/
                          </span>
                          <Input
                            value={careerPageSlug}
                            onChange={(e) => setCareerPageSlug(e.target.value)}
                            className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                          />
                        </div>
                        <Button variant="outline" className="gap-2">
                          <Eye className="w-4 h-4" />
                          Preview
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Page Title</Label>
                      <Input
                        value={careerPageTitle}
                        onChange={(e) => setCareerPageTitle(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Page Description</Label>
                      <Textarea
                        value={careerPageDescription}
                        onChange={(e) => setCareerPageDescription(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold">Display Options</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Show Salary Range</Label>
                            <p className="text-xs text-muted-foreground">
                              Display salary information on job listings
                            </p>
                          </div>
                          <Switch checked={showSalary} onCheckedChange={setShowSalary} />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Show Benefits</Label>
                            <p className="text-xs text-muted-foreground">
                              Display company benefits on job listings
                            </p>
                          </div>
                          <Switch checked={showBenefits} onCheckedChange={setShowBenefits} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveCareerPage} className="gap-2">
                      <Save className="w-4 h-4" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Manage how and when you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email Notifications
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>

                    {emailNotifications && (
                      <>
                        <Separator />
                        <div className="space-y-4 pl-6">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>New Application</Label>
                              <p className="text-xs text-muted-foreground">
                                When a candidate applies to a job
                              </p>
                            </div>
                            <Switch
                              checked={newApplicationNotif}
                              onCheckedChange={setNewApplicationNotif}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Interview Reminders</Label>
                              <p className="text-xs text-muted-foreground">
                                Reminders before scheduled interviews
                              </p>
                            </div>
                            <Switch
                              checked={interviewReminderNotif}
                              onCheckedChange={setInterviewReminderNotif}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Daily Digest</Label>
                              <p className="text-xs text-muted-foreground">
                                Summary of daily activity (8:00 AM)
                              </p>
                            </div>
                            <Switch
                              checked={dailyDigestNotif}
                              onCheckedChange={setDailyDigestNotif}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Weekly Report</Label>
                              <p className="text-xs text-muted-foreground">
                                Weekly analytics report (Monday 9:00 AM)
                              </p>
                            </div>
                            <Switch
                              checked={weeklyReportNotif}
                              onCheckedChange={setWeeklyReportNotif}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveNotifications} className="gap-2">
                      <Save className="w-4 h-4" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy & Security Tab */}
            <TabsContent value="privacy" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy & Security</CardTitle>
                  <CardDescription>
                    Manage data privacy and security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Two-Factor Authentication
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Switch
                        checked={twoFactorEnabled}
                        onCheckedChange={setTwoFactorEnabled}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Data Retention Period</Label>
                      <Select value={dataRetention} onValueChange={setDataRetention}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6">6 months</SelectItem>
                          <SelectItem value="12">12 months</SelectItem>
                          <SelectItem value="24">24 months</SelectItem>
                          <SelectItem value="36">36 months</SelectItem>
                          <SelectItem value="indefinite">Indefinite</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        How long to keep candidate data after application closure
                      </p>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200">
                      <div className="space-y-0.5">
                        <Label className="flex items-center gap-2 text-green-700">
                          <CheckCircle2 className="w-4 h-4" />
                          GDPR Compliance
                        </Label>
                        <p className="text-xs text-green-600">
                          Your account is configured for GDPR compliance
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                        Enabled
                      </Badge>
                    </div>

                    <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-orange-900">Data Export & Deletion</h4>
                          <p className="text-sm text-orange-700 mt-1">
                            Candidates can request data export or account deletion at any time
                            through their profile settings.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSavePrivacy} className="gap-2">
                      <Save className="w-4 h-4" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Settings Tab */}
            <TabsContent value="ai" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-600" />
                    AI & Automation Settings
                  </CardTitle>
                  <CardDescription>
                    Configure AI-powered features and automation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label>AI Resume Parsing</Label>
                        <p className="text-xs text-muted-foreground">
                          Automatically extract and structure resume data
                        </p>
                      </div>
                      <Switch
                        checked={aiResumeParsingEnabled}
                        onCheckedChange={setAiResumeParsingEnabled}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label>AI Candidate Screening</Label>
                        <p className="text-xs text-muted-foreground">
                          AI-powered candidate evaluation and matching
                        </p>
                      </div>
                      <Switch
                        checked={aiScreeningEnabled}
                        onCheckedChange={setAiScreeningEnabled}
                      />
                    </div>

                    {aiScreeningEnabled && (
                      <div className="space-y-2 pl-6">
                        <Label>Auto-Reject Threshold</Label>
                        <div className="space-y-3">
                          <div className="flex items-center gap-4">
                            <input
                              type="range"
                              min="0"
                              max="50"
                              value={autoRejectThreshold}
                              onChange={(e) => setAutoRejectThreshold(Number(e.target.value))}
                              className="flex-1"
                            />
                            <Badge variant="outline" className="min-w-[60px] justify-center">
                              {autoRejectThreshold}%
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Automatically reject applications with match scores below this threshold
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label>AI Interview</Label>
                        <p className="text-xs text-muted-foreground">
                          Enable AI-powered video interviews
                        </p>
                      </div>
                      <Switch
                        checked={aiInterviewEnabled}
                        onCheckedChange={setAiInterviewEnabled}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveAISettings} className="gap-2">
                      <Save className="w-4 h-4" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>
                    Manage your subscription and billing information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-6 border-2 border-primary rounded-lg bg-primary/5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold">{currentPlan}</h3>
                        <p className="text-muted-foreground">Perfect for growing teams</p>
                      </div>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
                        Active
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Billing cycle</span>
                        <span className="font-medium">{billingCycle}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-medium text-lg">{monthlyPrice}/month</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Next billing date</span>
                        <span className="font-medium">{nextBillingDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Plan Features</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>Unlimited job postings</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>AI-powered screening</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>Advanced analytics</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>Custom career page</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>Priority support</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>API access</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1">
                      Change Plan
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Update Payment Method
                    </Button>
                  </div>

                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <h4 className="font-medium text-red-900 mb-2">Cancel Subscription</h4>
                    <p className="text-sm text-red-700 mb-3">
                      Canceling will disable your account at the end of the current billing period.
                    </p>
                    <Button variant="destructive" size="sm">
                      Cancel Subscription
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Billing History</CardTitle>
                  <CardDescription>
                    View and download your invoices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { date: "Jan 15, 2024", amount: "$599.00", status: "Paid" },
                      { date: "Dec 15, 2023", amount: "$599.00", status: "Paid" },
                      { date: "Nov 15, 2023", amount: "$599.00", status: "Paid" },
                    ].map((invoice, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <CreditCard className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{invoice.amount}</p>
                            <p className="text-sm text-muted-foreground">{invoice.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {invoice.status}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
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
