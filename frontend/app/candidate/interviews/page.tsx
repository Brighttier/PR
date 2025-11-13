"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Briefcase,
  Calendar,
  FileText,
  Video,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Users,
  Download,
  ExternalLink,
  Play,
  MessageSquare,
  File,
} from "lucide-react";

export default function InterviewsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");

  // Mock data
  const upcomingInterviews = [
    {
      id: 1,
      jobTitle: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      companyLogo: "TC",
      type: "Technical Interview",
      interviewType: "video",
      scheduledDate: "Tomorrow",
      scheduledTime: "2:00 PM - 3:00 PM",
      fullDate: "January 12, 2024",
      duration: "60 min",
      interviewer: {
        name: "Sarah Johnson",
        title: "Engineering Manager",
        avatar: "SJ",
      },
      meetingLink: "https://meet.google.com/abc-defg-hij",
      location: "Online",
      instructions: "Please have your development environment ready. We'll be doing a live coding exercise.",
      prepMaterials: [
        "Review React Hooks documentation",
        "Be ready to discuss your previous projects",
        "Have questions prepared for the team",
      ],
      status: "confirmed",
    },
    {
      id: 2,
      jobTitle: "Full Stack Engineer",
      company: "StartupXYZ",
      companyLogo: "SX",
      type: "AI Screening",
      interviewType: "ai",
      scheduledDate: "Friday",
      scheduledTime: "10:00 AM - 10:30 AM",
      fullDate: "January 14, 2024",
      duration: "30 min",
      interviewer: {
        name: "AI Assistant",
        title: "Automated Screening",
        avatar: "AI",
      },
      meetingLink: "/candidate/interview/ai-001",
      location: "Online",
      instructions: "This is an AI-powered screening interview. Answer questions naturally and take your time.",
      prepMaterials: [
        "Have your resume handy for reference",
        "Find a quiet environment",
        "Test your microphone and camera",
      ],
      status: "confirmed",
    },
    {
      id: 3,
      jobTitle: "React Developer",
      company: "Digital Solutions",
      companyLogo: "DS",
      type: "Final Round - Panel Interview",
      interviewType: "panel",
      scheduledDate: "Next Monday",
      scheduledTime: "3:00 PM - 4:30 PM",
      fullDate: "January 17, 2024",
      duration: "90 min",
      interviewer: {
        name: "Multiple Interviewers",
        title: "Engineering Team",
        avatar: "MT",
      },
      meetingLink: "https://zoom.us/j/123456789",
      location: "Online",
      instructions: "You'll meet with 3 team members. Be prepared to discuss your technical background and cultural fit.",
      prepMaterials: [
        "Research company culture and values",
        "Prepare STAR method examples",
        "Review job description thoroughly",
      ],
      status: "pending-confirmation",
    },
  ];

  const completedInterviews = [
    {
      id: 4,
      jobTitle: "Frontend Architect",
      company: "Enterprise Co.",
      companyLogo: "EC",
      type: "Technical Round",
      scheduledDate: "January 5, 2024",
      scheduledTime: "2:00 PM",
      duration: "60 min",
      interviewer: {
        name: "John Smith",
        title: "Tech Lead",
        avatar: "JS",
      },
      status: "completed",
      feedback: {
        received: true,
        rating: 4.5,
        strengths: ["Strong technical skills", "Great communication", "Problem-solving ability"],
        nextSteps: "Moving to final round",
      },
    },
    {
      id: 5,
      jobTitle: "React Developer",
      company: "Digital Solutions",
      companyLogo: "DS",
      type: "Phone Screen",
      scheduledDate: "January 3, 2024",
      scheduledTime: "11:00 AM",
      duration: "30 min",
      interviewer: {
        name: "Emma Wilson",
        title: "HR Manager",
        avatar: "EW",
      },
      status: "completed",
      feedback: {
        received: true,
        rating: 4,
        strengths: ["Enthusiasm", "Relevant experience"],
        nextSteps: "Scheduled for technical round",
      },
    },
  ];

  const canceledInterviews = [
    {
      id: 6,
      jobTitle: "JavaScript Developer",
      company: "CodeWorks",
      companyLogo: "CW",
      type: "Initial Interview",
      scheduledDate: "December 22, 2023",
      scheduledTime: "4:00 PM",
      duration: "45 min",
      interviewer: {
        name: "Mike Brown",
        title: "Hiring Manager",
        avatar: "MB",
      },
      status: "canceled",
      cancelReason: "Position filled",
    },
  ];

  const stats = {
    upcoming: upcomingInterviews.length,
    completed: completedInterviews.length,
    pending: upcomingInterviews.filter(i => i.status === 'pending-confirmation').length,
  };

  const getInterviewIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'ai': return MessageSquare;
      case 'panel': return Users;
      case 'phone': return Phone;
      default: return Video;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending-confirmation': return 'warning';
      case 'completed': return 'secondary';
      case 'canceled': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Persona Recruit</h1>
              <p className="text-xs text-muted-foreground">Candidate Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <a href="/candidate" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <FileText className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </a>
          <a href="/candidate/applications" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <Briefcase className="w-5 h-5" />
            <span className="font-medium">My Applications</span>
          </a>
          <a href="/candidate/interviews" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Interviews</span>
            <Badge variant="secondary" className="ml-auto">
              {upcomingInterviews.length}
            </Badge>
          </a>
          <a href="/candidate/profile" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <FileText className="w-5 h-5" />
            <span className="font-medium">My Profile</span>
          </a>
          <a href="/candidate/documents" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <File className="w-5 h-5" />
            <span className="font-medium">My Documents</span>
          </a>
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center font-semibold">
              JC
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-sm">John Candidate</p>
              <p className="text-xs text-muted-foreground">candidate@example.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="border-b bg-card sticky top-0 z-10">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">My Interviews</h2>
                <p className="text-muted-foreground">
                  Manage your interview schedule and preparations
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Upcoming</p>
                      <p className="text-2xl font-bold">{stats.upcoming}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold">{stats.completed}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold">{stats.pending}</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </header>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingInterviews.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedInterviews.length})
              </TabsTrigger>
              <TabsTrigger value="canceled">
                Canceled ({canceledInterviews.length})
              </TabsTrigger>
            </TabsList>

            {/* Upcoming Interviews */}
            <TabsContent value="upcoming" className="space-y-6">
              {upcomingInterviews.map((interview) => {
                const Icon = getInterviewIcon(interview.interviewType);
                return (
                  <Card key={interview.id} className="overflow-hidden">
                    <div className="border-l-4 border-primary">
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Left: Interview Info */}
                          <div className="lg:col-span-2 space-y-4">
                            <div className="flex items-start gap-4">
                              <Avatar className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center font-bold">
                                {interview.companyLogo}
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h3 className="font-bold text-lg">{interview.jobTitle}</h3>
                                    <p className="text-muted-foreground">{interview.company}</p>
                                  </div>
                                  <Badge variant={getStatusColor(interview.status) as any}>
                                    {interview.status === 'confirmed' ? 'Confirmed' : 'Pending Confirmation'}
                                  </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Icon className="w-4 h-4 text-muted-foreground" />
                                    <span>{interview.type}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span>{interview.duration}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span>{interview.scheduledDate} at {interview.scheduledTime}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    <span>{interview.location}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Interviewer */}
                            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                              <Avatar className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                                {interview.interviewer.avatar}
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{interview.interviewer.name}</p>
                                <p className="text-xs text-muted-foreground">{interview.interviewer.title}</p>
                              </div>
                            </div>

                            {/* Instructions */}
                            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
                              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                Interview Instructions
                              </h4>
                              <p className="text-sm text-muted-foreground">{interview.instructions}</p>
                            </div>
                          </div>

                          {/* Right: Prep & Actions */}
                          <div className="space-y-4">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-sm">Preparation Checklist</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ul className="space-y-2">
                                  {interview.prepMaterials.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm">
                                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </CardContent>
                            </Card>

                            <div className="space-y-2">
                              {interview.interviewType === 'ai' ? (
                                <Button className="w-full">
                                  <Play className="w-4 h-4 mr-2" />
                                  Start AI Interview
                                </Button>
                              ) : (
                                <Button className="w-full">
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Join Meeting
                                </Button>
                              )}
                              <Button variant="outline" className="w-full">
                                <Download className="w-4 h-4 mr-2" />
                                Add to Calendar
                              </Button>
                              <Button variant="outline" className="w-full">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Contact Recruiter
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                );
              })}

              {upcomingInterviews.length === 0 && (
                <Card>
                  <CardContent className="pt-12 pb-12 text-center">
                    <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Upcoming Interviews</h3>
                    <p className="text-muted-foreground mb-4">
                      Your scheduled interviews will appear here
                    </p>
                    <Button variant="outline">Browse Jobs</Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Completed Interviews */}
            <TabsContent value="completed" className="space-y-4">
              {completedInterviews.map((interview) => (
                <Card key={interview.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        {interview.companyLogo}
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold">{interview.jobTitle}</h3>
                            <p className="text-sm text-muted-foreground">{interview.company}</p>
                            <div className="flex items-center gap-3 mt-2 text-sm">
                              <span>{interview.type}</span>
                              <span>•</span>
                              <span>{interview.scheduledDate}</span>
                              <span>•</span>
                              <span>{interview.interviewer.name}</span>
                            </div>
                          </div>
                          <Badge variant="success">Completed</Badge>
                        </div>

                        {interview.feedback.received && (
                          <div className="p-4 border rounded-lg bg-muted">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-sm">Interview Feedback</h4>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <CheckCircle
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < interview.feedback.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Strengths:</p>
                                <div className="flex flex-wrap gap-1">
                                  {interview.feedback.strengths.map((strength, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {strength}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Next Steps:</p>
                                <p className="text-sm">{interview.feedback.nextSteps}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Canceled Interviews */}
            <TabsContent value="canceled" className="space-y-4">
              {canceledInterviews.map((interview) => (
                <Card key={interview.id} className="opacity-60">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12 bg-muted text-muted-foreground flex items-center justify-center font-bold">
                        {interview.companyLogo}
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold">{interview.jobTitle}</h3>
                            <p className="text-sm text-muted-foreground">{interview.company}</p>
                            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                              <span>{interview.type}</span>
                              <span>•</span>
                              <span>{interview.scheduledDate}</span>
                            </div>
                            <div className="mt-3 p-2 bg-destructive/10 border border-destructive/20 rounded text-sm">
                              <span className="font-medium">Canceled:</span> {interview.cancelReason}
                            </div>
                          </div>
                          <Badge variant="destructive">Canceled</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
