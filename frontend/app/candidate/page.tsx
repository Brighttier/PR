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
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  MapPin,
  TrendingUp,
  Eye,
  File,
} from "lucide-react";

export default function CandidateDashboard() {
  // Mock data
  const stats = [
    {
      title: "Total Applications",
      value: "12",
      change: "+3 this week",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Applications",
      value: "8",
      change: "In progress",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Interviews Scheduled",
      value: "3",
      change: "2 upcoming",
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Offers Received",
      value: "1",
      change: "Pending response",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  const applications = [
    {
      id: 1,
      jobTitle: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      location: "San Francisco, CA",
      appliedDate: "2 days ago",
      status: "Interview Scheduled",
      matchScore: 92,
      statusColor: "info",
      stage: "Technical Round",
    },
    {
      id: 2,
      jobTitle: "Full Stack Engineer",
      company: "StartupXYZ",
      location: "Remote",
      appliedDate: "5 days ago",
      status: "Under Review",
      matchScore: 85,
      statusColor: "warning",
      stage: "Initial Screening",
    },
    {
      id: 3,
      jobTitle: "React Developer",
      company: "Digital Solutions",
      location: "New York, NY",
      appliedDate: "1 week ago",
      status: "Interview Completed",
      matchScore: 88,
      statusColor: "success",
      stage: "Final Round",
    },
    {
      id: 4,
      jobTitle: "Frontend Architect",
      company: "Enterprise Co.",
      location: "Austin, TX",
      appliedDate: "2 weeks ago",
      status: "Offer Extended",
      matchScore: 94,
      statusColor: "success",
      stage: "Offer",
    },
  ];

  const upcomingInterviews = [
    {
      id: 1,
      jobTitle: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      type: "Technical Interview",
      date: "Tomorrow, 2:00 PM",
      interviewer: "Sarah Johnson",
      duration: "60 min",
    },
    {
      id: 2,
      jobTitle: "Full Stack Engineer",
      company: "StartupXYZ",
      type: "AI Screening",
      date: "Friday, 10:00 AM",
      interviewer: "AI Assistant",
      duration: "30 min",
    },
  ];

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-green-700 bg-green-100";
    if (score >= 70) return "text-green-600 bg-green-50";
    if (score >= 50) return "text-yellow-600 bg-yellow-50";
    return "text-gray-600 bg-gray-50";
  };

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground mt-1">
              Track your applications and upcoming interviews
            </p>
          </div>
          <Button>
            <Briefcase className="w-4 h-4 mr-2" />
            Browse Jobs
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-6">
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
            {/* Recent Applications */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Applications</CardTitle>
                    <CardDescription>
                      Track the status of your job applications
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job & Company</TableHead>
                      <TableHead>Match Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{app.jobTitle}</p>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <span>{app.company}</span>
                              <span>•</span>
                              <MapPin className="w-3 h-3" />
                              <span>{app.location}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md font-semibold text-sm ${getMatchScoreColor(app.matchScore)}`}>
                            <TrendingUp className="w-3 h-3" />
                            {app.matchScore}%
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant={app.statusColor as any}>
                              {app.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              {app.stage}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {app.appliedDate}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Upcoming Interviews */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Interviews</CardTitle>
                <CardDescription>Your scheduled interview sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingInterviews.map((interview) => (
                    <div
                      key={interview.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <p className="font-medium text-sm">{interview.jobTitle}</p>
                          <p className="text-xs text-muted-foreground">
                            {interview.company}
                          </p>
                          <div className="flex items-center gap-2 text-xs">
                            <Badge variant="outline">{interview.type}</Badge>
                            <span className="text-muted-foreground">
                              {interview.duration}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-primary">
                            {interview.date}
                          </p>
                        </div>
                      </div>
                      <Button className="w-full mt-3" size="sm">
                        Join Interview
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
