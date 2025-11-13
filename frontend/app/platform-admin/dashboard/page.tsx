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
  Shield,
  Building2,
  Users,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Settings,
} from "lucide-react";

export default function PlatformAdminDashboard() {
  // Mock data
  const stats = [
    {
      title: "Total Companies",
      value: "142",
      change: "+12 this month",
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Users",
      value: "3,847",
      change: "+234 this week",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Applications",
      value: "18,592",
      change: "+1,205 today",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "System Health",
      value: "99.8%",
      change: "Uptime",
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  const companies = [
    {
      id: 1,
      name: "TechCorp Inc.",
      plan: "Enterprise",
      users: 45,
      jobs: 23,
      applications: 1250,
      status: "Active",
      joinedDate: "Jan 2024",
    },
    {
      id: 2,
      name: "StartupXYZ",
      plan: "Professional",
      users: 12,
      jobs: 8,
      applications: 234,
      status: "Active",
      joinedDate: "Mar 2024",
    },
    {
      id: 3,
      name: "Enterprise Co.",
      plan: "Enterprise",
      users: 78,
      jobs: 45,
      applications: 2100,
      status: "Active",
      joinedDate: "Dec 2023",
    },
    {
      id: 4,
      name: "Digital Solutions",
      plan: "Basic",
      users: 5,
      jobs: 3,
      applications: 89,
      status: "Trial",
      joinedDate: "Yesterday",
    },
  ];

  const systemMetrics = [
    {
      service: "Database",
      status: "Healthy",
      uptime: "99.9%",
      responseTime: "12ms",
      statusColor: "success",
    },
    {
      service: "AI Services (Gemini)",
      status: "Healthy",
      uptime: "99.5%",
      responseTime: "245ms",
      statusColor: "success",
    },
    {
      service: "Storage",
      status: "Healthy",
      uptime: "100%",
      responseTime: "8ms",
      statusColor: "success",
    },
    {
      service: "Authentication",
      status: "Healthy",
      uptime: "99.8%",
      responseTime: "45ms",
      statusColor: "success",
    },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        {/* Logo */}
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

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <a href="/platform-admin/dashboard" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground">
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </a>
          <a href="/platform-admin/companies" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <Building2 className="w-5 h-5" />
            <span className="font-medium">Companies</span>
            <Badge variant="secondary" className="ml-auto">
              {companies.length}
            </Badge>
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
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium">Reports</span>
          </a>
          <a href="/platform-admin/settings" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </a>
        </nav>

        {/* User Profile */}
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
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="border-b bg-card sticky top-0 z-10">
          <div className="flex items-center justify-between p-6">
            <div>
              <h2 className="text-2xl font-bold">Platform Dashboard</h2>
              <p className="text-muted-foreground">
                Monitor system-wide metrics and company performance
              </p>
            </div>
            <Badge variant="success" className="h-8 px-3">
              <Activity className="w-3 h-3 mr-1" />
              All Systems Operational
            </Badge>
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
            {/* Companies */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Active Companies</CardTitle>
                    <CardDescription>
                      Companies using the platform
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
                      <TableHead>Company</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>Jobs</TableHead>
                      <TableHead>Applications</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{company.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Joined {company.joinedDate}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={company.plan === 'Enterprise' ? 'default' : 'outline'}>
                            {company.plan}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{company.users}</TableCell>
                        <TableCell className="text-sm">{company.jobs}</TableCell>
                        <TableCell className="text-sm">{company.applications}</TableCell>
                        <TableCell>
                          <Badge variant={company.status === 'Active' ? 'success' : 'warning'}>
                            {company.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Real-time service status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemMetrics.map((metric) => (
                    <div
                      key={metric.service}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm">{metric.service}</p>
                        <Badge variant={metric.statusColor as any}>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {metric.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>
                          <p>Uptime</p>
                          <p className="font-semibold text-foreground">{metric.uptime}</p>
                        </div>
                        <div>
                          <p>Response</p>
                          <p className="font-semibold text-foreground">{metric.responseTime}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Platform Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Analytics</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-1">8.2k</div>
                  <p className="text-sm text-muted-foreground">Jobs Posted</p>
                  <p className="text-xs text-green-600 mt-1">+15% vs last month</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-1">45k</div>
                  <p className="text-sm text-muted-foreground">Applications</p>
                  <p className="text-xs text-green-600 mt-1">+23% vs last month</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-3xl font-bold text-purple-600 mb-1">12.5k</div>
                  <p className="text-sm text-muted-foreground">Interviews</p>
                  <p className="text-xs text-green-600 mt-1">+18% vs last month</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-3xl font-bold text-orange-600 mb-1">1,234</div>
                  <p className="text-sm text-muted-foreground">Hires Made</p>
                  <p className="text-xs text-green-600 mt-1">+8% vs last month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
