"use client";

import { useState } from "react";
import { RecruiterSidebar } from "@/components/recruiter/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Briefcase,
  Users,
  FileText,
  Clock,
  CheckCircle2,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Award,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RecruiterDashboard() {
  const [timeRange, setTimeRange] = useState("30");

  // Dashboard statistics (removed Team Members stat - recruiter doesn't manage team)
  const stats = [
    {
      title: "Active Jobs",
      value: "24",
      change: "+12%",
      trend: "up",
      icon: Briefcase,
      description: "vs last month",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Applications",
      value: "1,247",
      change: "+23%",
      trend: "up",
      icon: FileText,
      description: "vs last month",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Candidates Hired",
      value: "18",
      change: "+8%",
      trend: "up",
      icon: Users,
      description: "vs last month",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Avg. Time to Hire",
      value: "24 days",
      change: "-15%",
      trend: "up",
      icon: Clock,
      description: "vs last month",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Avg. Match Score",
      value: "78%",
      change: "+5%",
      trend: "up",
      icon: Target,
      description: "vs last month",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
  ];

  // Recent applications
  const recentApplications = [
    {
      id: 1,
      candidateName: "Sarah Johnson",
      candidateAvatar: "",
      position: "Senior Software Engineer",
      department: "Engineering",
      appliedDate: "2 hours ago",
      matchScore: 94,
      status: "Under Review",
      statusColor: "bg-yellow-50 text-yellow-700 border-yellow-200",
    },
    {
      id: 2,
      candidateName: "Michael Chen",
      candidateAvatar: "",
      position: "Product Manager",
      department: "Product",
      appliedDate: "5 hours ago",
      matchScore: 88,
      status: "Interview Scheduled",
      statusColor: "bg-green-50 text-green-700 border-green-200",
    },
    {
      id: 3,
      candidateName: "Emily Rodriguez",
      candidateAvatar: "",
      position: "UX Designer",
      department: "Design",
      appliedDate: "1 day ago",
      matchScore: 92,
      status: "Screening",
      statusColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      id: 4,
      candidateName: "David Kim",
      candidateAvatar: "",
      position: "Data Scientist",
      department: "Analytics",
      appliedDate: "1 day ago",
      matchScore: 86,
      status: "Under Review",
      statusColor: "bg-yellow-50 text-yellow-700 border-yellow-200",
    },
    {
      id: 5,
      candidateName: "Jessica Taylor",
      candidateAvatar: "",
      position: "Marketing Manager",
      department: "Marketing",
      appliedDate: "2 days ago",
      matchScore: 79,
      status: "Applied",
      statusColor: "bg-gray-50 text-gray-700 border-gray-200",
    },
  ];

  // Top performing jobs
  const topJobs = [
    {
      id: 1,
      title: "Senior Software Engineer",
      department: "Engineering",
      applicants: 156,
      views: 2340,
      matchRate: 82,
      status: "Published",
      daysOpen: 12,
    },
    {
      id: 2,
      title: "Product Manager",
      department: "Product",
      applicants: 89,
      views: 1876,
      matchRate: 78,
      status: "Published",
      daysOpen: 8,
    },
    {
      id: 3,
      title: "UX Designer",
      department: "Design",
      applicants: 124,
      views: 2100,
      matchRate: 85,
      status: "Published",
      daysOpen: 15,
    },
    {
      id: 4,
      title: "Data Scientist",
      department: "Analytics",
      applicants: 67,
      views: 1234,
      matchRate: 76,
      status: "Published",
      daysOpen: 6,
    },
  ];

  // Hiring pipeline data
  const pipelineStages = [
    { stage: "Applied", count: 487, color: "bg-gray-400" },
    { stage: "Screening", count: 234, color: "bg-blue-400" },
    { stage: "Interview", count: 156, color: "bg-purple-400" },
    { stage: "Offer", count: 45, color: "bg-yellow-400" },
    { stage: "Hired", count: 18, color: "bg-green-500" },
  ];

  // Recent activities (removed team-related activities)
  const recentActivities = [
    {
      id: 1,
      type: "application",
      message: "New application for Senior Software Engineer",
      user: "Sarah Johnson",
      time: "2 hours ago",
      icon: FileText,
      color: "text-blue-600",
    },
    {
      id: 2,
      type: "interview",
      message: "Interview scheduled with Michael Chen",
      user: "You",
      time: "3 hours ago",
      icon: Clock,
      color: "text-purple-600",
    },
    {
      id: 3,
      type: "hired",
      message: "Emily Rodriguez accepted the offer",
      user: "HR Team",
      time: "5 hours ago",
      icon: CheckCircle2,
      color: "text-green-600",
    },
    {
      id: 4,
      type: "job",
      message: "New job posted: Data Scientist",
      user: "You",
      time: "1 day ago",
      icon: Briefcase,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <RecruiterSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">
                  Welcome back! Here's what's happening with your recruitment.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="gap-2">
                  <Briefcase className="w-4 h-4" />
                  Post New Job
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Grid - 5 items for recruiter (no Team Members) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        {stat.trend === "up" ? (
                          <ArrowUpRight className="w-4 h-4 text-green-600" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-red-600" />
                        )}
                        <span
                          className={
                            stat.trend === "up" ? "text-green-600" : "text-red-600"
                          }
                        >
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold mb-1">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Charts and Data Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Hiring Pipeline */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Hiring Pipeline</CardTitle>
                <CardDescription>Candidate distribution across stages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pipelineStages.map((stage) => (
                    <div key={stage.stage} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{stage.stage}</span>
                        <span className="text-muted-foreground">
                          {stage.count} candidates
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`${stage.color} h-2 rounded-full transition-all`}
                          style={{
                            width: `${(stage.count / 940) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Key metrics overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Acceptance Rate</p>
                      <p className="text-xs text-muted-foreground">Offer acceptance</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-green-600">89%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Job Views</p>
                      <p className="text-xs text-muted-foreground">This month</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-blue-600">12.4K</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium">Quality Score</p>
                      <p className="text-xs text-muted-foreground">AI assessment</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-purple-600">8.7/10</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium">Response Time</p>
                      <p className="text-xs text-muted-foreground">Avg. to candidate</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-orange-600">2.3d</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Applications and Top Jobs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Applications */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Applications</CardTitle>
                    <CardDescription>Latest candidate submissions</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/recruiter/applications">View All</a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentApplications.map((application) => (
                    <div
                      key={application.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar>
                          <AvatarImage src={application.candidateAvatar} />
                          <AvatarFallback>
                            {application.candidateName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {application.candidateName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {application.position}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {application.appliedDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`${
                            application.matchScore >= 90
                              ? "bg-green-50 text-green-700 border-green-200"
                              : application.matchScore >= 80
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-gray-50 text-gray-700 border-gray-200"
                          }`}
                        >
                          {application.matchScore}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Jobs */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Top Performing Jobs</CardTitle>
                    <CardDescription>Most popular job postings</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/recruiter/jobs">View All</a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topJobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{job.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {job.department} • {job.daysOpen} days open
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {job.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{job.applicants} applicants</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{job.views} views</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          <span>{job.matchRate}% match rate</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-3 border-b last:border-0"
                    >
                      <div className={`p-2 rounded-lg bg-gray-50`}>
                        <Icon className={`w-4 h-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.user} • {activity.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
