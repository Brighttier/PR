"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  Calendar,
  MessageSquare,
  Users,
  Settings,
  Save,
  Bell,
  User,
  Lock,
  Globe,
  Clock,
  Video,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  AlertCircle,
  CheckCircle,
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

export default function InterviewerSettingsPage() {
  const [hasChanges, setHasChanges] = useState(false);

  // Profile Settings
  const [fullName, setFullName] = useState("Mike Interviewer");
  const [email, setEmail] = useState("interviewer@example.com");
  const [phone, setPhone] = useState("+1 (555) 123-4567");
  const [location, setLocation] = useState("San Francisco, CA");
  const [title, setTitle] = useState("Senior Engineering Manager");
  const [department, setDepartment] = useState("Engineering");
  const [bio, setBio] = useState("Experienced engineering leader with 10+ years in software development and team management.");

  // Availability Settings
  const [timezone, setTimezone] = useState("America/Los_Angeles");
  const [workingHoursStart, setWorkingHoursStart] = useState("09:00");
  const [workingHoursEnd, setWorkingHoursEnd] = useState("17:00");
  const [maxInterviewsPerDay, setMaxInterviewsPerDay] = useState("4");
  const [bufferTime, setBufferTime] = useState("15");

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [interviewReminders, setInterviewReminders] = useState(true);
  const [feedbackReminders, setFeedbackReminders] = useState(true);
  const [newCandidateAlerts, setNewCandidateAlerts] = useState(true);
  const [reminderTime, setReminderTime] = useState("30");

  // Interview Preferences
  const [preferredInterviewType, setPreferredInterviewType] = useState("video");
  const [defaultInterviewDuration, setDefaultInterviewDuration] = useState("60");
  const [autoAcceptInterviews, setAutoAcceptInterviews] = useState(false);
  const [requirePrep, setRequirePrep] = useState(true);

  const handleSaveSettings = () => {
    console.log("Saving interviewer settings...");
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
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Persona Recruit</h1>
              <p className="text-xs text-muted-foreground">Interviewer Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <a href="/interviewer/dashboard" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <FileText className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </a>
          <a href="/interviewer/interviews" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">My Interviews</span>
          </a>
          <a href="/interviewer/feedback" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">Feedback</span>
          </a>
          <a href="/interviewer/candidates" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <Users className="w-5 h-5" />
            <span className="font-medium">Candidates</span>
          </a>
          <a href="/interviewer/calendar" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Calendar</span>
          </a>
          <a href="/interviewer/settings" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </a>
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center font-semibold">
              MI
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-sm">Mike Interviewer</p>
              <p className="text-xs text-muted-foreground">interviewer@example.com</p>
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
                <h2 className="text-2xl font-bold">Settings</h2>
                <p className="text-muted-foreground">
                  Manage your interviewer profile and preferences
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
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 max-w-5xl mx-auto">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal details and professional information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => { setFullName(e.target.value); markAsChanged(); }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Job Title</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => { setTitle(e.target.value); markAsChanged(); }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          className="pl-10"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); markAsChanged(); }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          className="pl-10"
                          value={phone}
                          onChange={(e) => { setPhone(e.target.value); markAsChanged(); }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="location"
                          className="pl-10"
                          value={location}
                          onChange={(e) => { setLocation(e.target.value); markAsChanged(); }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="department"
                          className="pl-10"
                          value={department}
                          onChange={(e) => { setDepartment(e.target.value); markAsChanged(); }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Professional Bio</Label>
                    <Textarea
                      id="bio"
                      rows={4}
                      value={bio}
                      onChange={(e) => { setBio(e.target.value); markAsChanged(); }}
                      placeholder="Tell candidates about your background and expertise..."
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Security
                  </CardTitle>
                  <CardDescription>
                    Manage your password and security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
                    </div>
                    <Button variant="outline">Change Password</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                    </div>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Availability Tab */}
            <TabsContent value="availability" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Working Hours
                  </CardTitle>
                  <CardDescription>
                    Set your preferred interview schedule and availability
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={timezone} onValueChange={(val) => { setTimezone(val); markAsChanged(); }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT)</SelectItem>
                        <SelectItem value="Asia/Kolkata">India (IST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="workStart">Work Start Time</Label>
                      <Input
                        id="workStart"
                        type="time"
                        value={workingHoursStart}
                        onChange={(e) => { setWorkingHoursStart(e.target.value); markAsChanged(); }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="workEnd">Work End Time</Label>
                      <Input
                        id="workEnd"
                        type="time"
                        value={workingHoursEnd}
                        onChange={(e) => { setWorkingHoursEnd(e.target.value); markAsChanged(); }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxInterviews">Max Interviews Per Day</Label>
                      <Select value={maxInterviewsPerDay} onValueChange={(val) => { setMaxInterviewsPerDay(val); markAsChanged(); }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 interviews</SelectItem>
                          <SelectItem value="3">3 interviews</SelectItem>
                          <SelectItem value="4">4 interviews</SelectItem>
                          <SelectItem value="5">5 interviews</SelectItem>
                          <SelectItem value="6">6 interviews</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="buffer">Buffer Time (minutes)</Label>
                      <Select value={bufferTime} onValueChange={(val) => { setBufferTime(val); markAsChanged(); }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No buffer</SelectItem>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900">Sync with Calendar</p>
                        <p className="text-sm text-blue-700">
                          Connect your Google or Outlook calendar to automatically block out busy times
                        </p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Connect Calendar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Choose how and when you want to be notified
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch
                        checked={emailNotifications}
                        onCheckedChange={(checked) => { setEmailNotifications(checked); markAsChanged(); }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">SMS Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Receive urgent notifications via SMS
                        </p>
                      </div>
                      <Switch
                        checked={smsNotifications}
                        onCheckedChange={(checked) => { setSmsNotifications(checked); markAsChanged(); }}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-4">Notification Types</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Interview Reminders</p>
                          <p className="text-sm text-muted-foreground">
                            Get reminded before upcoming interviews
                          </p>
                        </div>
                        <Switch
                          checked={interviewReminders}
                          onCheckedChange={(checked) => { setInterviewReminders(checked); markAsChanged(); }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Feedback Reminders</p>
                          <p className="text-sm text-muted-foreground">
                            Reminders to submit pending feedback
                          </p>
                        </div>
                        <Switch
                          checked={feedbackReminders}
                          onCheckedChange={(checked) => { setFeedbackReminders(checked); markAsChanged(); }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">New Candidate Alerts</p>
                          <p className="text-sm text-muted-foreground">
                            Alerts when new candidates are assigned to you
                          </p>
                        </div>
                        <Switch
                          checked={newCandidateAlerts}
                          onCheckedChange={(checked) => { setNewCandidateAlerts(checked); markAsChanged(); }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="reminderTime">Reminder Time Before Interview</Label>
                      <Select value={reminderTime} onValueChange={(val) => { setReminderTime(val); markAsChanged(); }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes before</SelectItem>
                          <SelectItem value="30">30 minutes before</SelectItem>
                          <SelectItem value="60">1 hour before</SelectItem>
                          <SelectItem value="120">2 hours before</SelectItem>
                          <SelectItem value="1440">1 day before</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Interview Preferences
                  </CardTitle>
                  <CardDescription>
                    Set your default interview settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="interviewType">Preferred Interview Type</Label>
                    <Select value={preferredInterviewType} onValueChange={(val) => { setPreferredInterviewType(val); markAsChanged(); }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Video Call</SelectItem>
                        <SelectItem value="phone">Phone Call</SelectItem>
                        <SelectItem value="in-person">In-Person</SelectItem>
                        <SelectItem value="ai">AI-Assisted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Default Interview Duration</Label>
                    <Select value={defaultInterviewDuration} onValueChange={(val) => { setDefaultInterviewDuration(val); markAsChanged(); }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="90">90 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border-t pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Auto-Accept Interview Requests</p>
                        <p className="text-sm text-muted-foreground">
                          Automatically accept interviews within your availability
                        </p>
                      </div>
                      <Switch
                        checked={autoAcceptInterviews}
                        onCheckedChange={(checked) => { setAutoAcceptInterviews(checked); markAsChanged(); }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Require Candidate Preparation</p>
                        <p className="text-sm text-muted-foreground">
                          Candidates must complete prep materials before interview
                        </p>
                      </div>
                      <Switch
                        checked={requirePrep}
                        onCheckedChange={(checked) => { setRequirePrep(checked); markAsChanged(); }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Regional Settings
                  </CardTitle>
                  <CardDescription>
                    Configure language and format preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Date Format</Label>
                    <Select defaultValue="mm-dd-yyyy">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                        <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
                        <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Time Format</Label>
                    <Select defaultValue="12h">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                        <SelectItem value="24h">24-hour</SelectItem>
                      </SelectContent>
                    </Select>
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
