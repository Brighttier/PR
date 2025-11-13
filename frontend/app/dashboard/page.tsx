"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Briefcase,
  Calendar,
  FileText,
  Search,
  Bell,
  Settings,
  LogOut,
  Home,
  UserPlus,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  MoreVertical,
} from "lucide-react";

export default function Dashboard() {
  // Mock data
  const stats = [
    {
      title: "Total Candidates",
      value: "1,284",
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Jobs",
      value: "43",
      change: "+3",
      trend: "up",
      icon: Briefcase,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Interviews Today",
      value: "18",
      change: "6 pending",
      trend: "neutral",
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Hired This Month",
      value: "24",
      change: "+8%",
      trend: "up",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  const recentCandidates = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      position: "Senior Frontend Developer",
      status: "Interview Scheduled",
      stage: "Technical Round",
      appliedDate: "2 days ago",
      avatar: "SJ",
      experience: "5 years",
      statusColor: "info",
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "m.chen@email.com",
      position: "Product Manager",
      status: "Under Review",
      stage: "Initial Screening",
      appliedDate: "1 day ago",
      avatar: "MC",
      experience: "7 years",
      statusColor: "warning",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      email: "emily.r@email.com",
      position: "UX Designer",
      status: "Offer Sent",
      stage: "Final Stage",
      appliedDate: "3 hours ago",
      avatar: "ER",
      experience: "4 years",
      statusColor: "success",
    },
    {
      id: 4,
      name: "David Park",
      email: "d.park@email.com",
      position: "Backend Engineer",
      status: "New Application",
      stage: "Application Review",
      appliedDate: "5 hours ago",
      avatar: "DP",
      experience: "6 years",
      statusColor: "secondary",
    },
    {
      id: 5,
      name: "Lisa Anderson",
      email: "lisa.a@email.com",
      position: "Data Scientist",
      status: "Rejected",
      stage: "Technical Round",
      appliedDate: "1 week ago",
      avatar: "LA",
      experience: "3 years",
      statusColor: "destructive",
    },
  ];

  const recentActivity = [
    {
      action: "Interview scheduled",
      candidate: "Sarah Johnson",
      position: "Senior Frontend Developer",
      time: "30 mins ago",
      icon: Calendar,
    },
    {
      action: "New application received",
      candidate: "David Park",
      position: "Backend Engineer",
      time: "2 hours ago",
      icon: FileText,
    },
    {
      action: "Offer accepted",
      candidate: "James Wilson",
      position: "DevOps Engineer",
      time: "4 hours ago",
      icon: CheckCircle,
    },
    {
      action: "Interview completed",
      candidate: "Emma Thompson",
      position: "Product Designer",
      time: "Yesterday",
      icon: Clock,
    },
  ];

  const navigationItems = [
    { name: "Dashboard", icon: Home, active: true },
    { name: "Candidates", icon: Users, active: false },
    { name: "Jobs", icon: Briefcase, active: false },
    { name: "Calendar", icon: Calendar, active: false },
    { name: "Reports", icon: FileText, active: false },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">RecruitPro</h1>
              <p className="text-xs text-muted-foreground">ATS Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigationItems.map((item) => (
            <button
              key={item.name}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                item.active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </button>
          ))}

          <div className="pt-4">
            <Button variant="outline" className="w-full justify-start gap-3">
              <UserPlus className="w-5 h-5" />
              Add Candidate
            </Button>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center font-semibold">
              JD
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-sm">John Doe</p>
              <p className="text-xs text-muted-foreground">Recruiter</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="flex-1">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="flex-1">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="border-b bg-card sticky top-0 z-10">
          <div className="flex items-center justify-between p-6">
            <div>
              <h2 className="text-2xl font-bold">Dashboard</h2>
              <p className="text-muted-foreground">
                Welcome back! Here's what's happening today.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search candidates..."
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
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
                      <div className="flex items-center gap-1">
                        {stat.trend === "up" && (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        )}
                        <span
                          className={`text-sm ${
                            stat.trend === "up"
                              ? "text-green-600"
                              : "text-muted-foreground"
                          }`}
                        >
                          {stat.change}
                        </span>
                      </div>
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
            {/* Recent Candidates Table */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Candidates</CardTitle>
                    <CardDescription>
                      Latest applications and their current status
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
                      <TableHead>Candidate</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentCandidates.map((candidate) => (
                      <TableRow key={candidate.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                              {candidate.avatar}
                            </Avatar>
                            <div>
                              <p className="font-medium">{candidate.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {candidate.experience}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {candidate.position}
                        </TableCell>
                        <TableCell>
                          <Badge variant={candidate.statusColor as any}>
                            {candidate.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {candidate.stage}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {candidate.appliedDate}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates and actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <activity.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.candidate}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.position}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Activity
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2 border-dashed hover:border-primary transition-colors cursor-pointer">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <UserPlus className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">Add New Candidate</h3>
                <p className="text-sm text-muted-foreground">
                  Manually add a candidate to the system
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-dashed hover:border-primary transition-colors cursor-pointer">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">Post New Job</h3>
                <p className="text-sm text-muted-foreground">
                  Create and publish a new job opening
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-dashed hover:border-primary transition-colors cursor-pointer">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">Schedule Interview</h3>
                <p className="text-sm text-muted-foreground">
                  Set up a new interview appointment
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
