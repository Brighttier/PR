"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Video,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  MessageSquare,
  Users,
  Settings,
} from "lucide-react";

export default function InterviewerDashboard() {
  // Mock data
  const stats = [
    {
      title: "Upcoming Interviews",
      value: "5",
      change: "This week",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Pending Feedback",
      value: "3",
      change: "Awaiting submission",
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Completed Interviews",
      value: "24",
      change: "This month",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Avg. Rating Given",
      value: "3.8",
      change: "Out of 5.0",
      icon: Star,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const upcomingInterviews = [
    {
      id: 1,
      candidateName: "Sarah Johnson",
      jobTitle: "Senior Frontend Developer",
      scheduledAt: "Today, 2:00 PM",
      duration: "60 min",
      type: "Technical Round",
      matchScore: 92,
      avatar: "SJ",
    },
    {
      id: 2,
      candidateName: "Michael Chen",
      jobTitle: "Product Manager",
      scheduledAt: "Tomorrow, 10:00 AM",
      duration: "45 min",
      type: "Manager Round",
      matchScore: 87,
      avatar: "MC",
    },
    {
      id: 3,
      candidateName: "Emily Rodriguez",
      jobTitle: "UX Designer",
      scheduledAt: "Tomorrow, 3:00 PM",
      duration: "60 min",
      type: "Portfolio Review",
      matchScore: 88,
      avatar: "ER",
    },
  ];

  const pendingFeedback = [
    {
      id: 1,
      candidateName: "James Wilson",
      jobTitle: "DevOps Engineer",
      interviewDate: "Yesterday",
      type: "Technical Round",
      avatar: "JW",
    },
    {
      id: 2,
      candidateName: "Lisa Anderson",
      jobTitle: "Data Scientist",
      interviewDate: "2 days ago",
      type: "Technical Round",
      avatar: "LA",
    },
    {
      id: 3,
      candidateName: "David Park",
      jobTitle: "Backend Engineer",
      interviewDate: "3 days ago",
      type: "Final Round",
      avatar: "DP",
    },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Video className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Persona Recruit</h1>
              <p className="text-xs text-muted-foreground">Interviewer Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <a href="/interviewer/dashboard" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground">
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
            <Badge variant="destructive" className="ml-auto">
              {pendingFeedback.length}
            </Badge>
          </a>
          <a href="/interviewer/candidates" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <Users className="w-5 h-5" />
            <span className="font-medium">Candidates</span>
          </a>
          <a href="/interviewer/calendar" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Calendar</span>
          </a>
          <a href="/interviewer/settings" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </a>
        </nav>

        {/* User Profile */}
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
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="border-b bg-card sticky top-0 z-10">
          <div className="flex items-center justify-between p-6">
            <div>
              <h2 className="text-2xl font-bold">Interviewer Dashboard</h2>
              <p className="text-muted-foreground">
                Manage your interview schedule and provide feedback
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {stat.title}
                      </p>
                      <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
                      <p className="text-sm text-muted-foreground">
                        {stat.change}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Interviews */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Upcoming Interviews</CardTitle>
                    <CardDescription>
                      Your scheduled interview sessions
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    View Calendar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Match</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingInterviews.map((interview) => (
                      <TableRow key={interview.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                              {interview.avatar}
                            </Avatar>
                            <div>
                              <p className="font-medium">{interview.candidateName}</p>
                              <p className="text-xs text-muted-foreground">
                                {interview.duration}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {interview.jobTitle}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{interview.type}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {interview.scheduledAt}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="success">{interview.matchScore}%</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            View Profile
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Pending Feedback */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Feedback</CardTitle>
                <CardDescription>Complete interview evaluations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingFeedback.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border-2 border-dashed border-orange-200 rounded-lg hover:bg-orange-50/50 transition-colors"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                          {item.avatar}
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.candidateName}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.jobTitle}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {item.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {item.interviewDate}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button className="w-full" size="sm" variant="outline">
                        <Star className="w-3 h-3 mr-2" />
                        Submit Feedback
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interview Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Interview Tips</CardTitle>
              <CardDescription>Best practices for conducting effective interviews</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Be Prepared</h4>
                  <p className="text-sm text-muted-foreground">
                    Review candidate profile and resume before the interview
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-3">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Ask Follow-ups</h4>
                  <p className="text-sm text-muted-foreground">
                    Dig deeper into responses to assess critical thinking
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                    <Star className="w-5 h-5 text-purple-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Provide Feedback</h4>
                  <p className="text-sm text-muted-foreground">
                    Submit detailed feedback within 24 hours of the interview
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
