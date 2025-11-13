"use client";

import { useState } from "react";
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
  Building2,
  Users,
  BarChart3,
  Settings,
  Activity,
  Shield,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Briefcase,
  FileText,
  UserCheck,
  Clock,
  Target,
  Award,
  Globe,
  Mail,
  Phone,
  Filter,
  Search,
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

type ReportPeriod = "today" | "week" | "month" | "quarter" | "year" | "custom";

interface CompanyReport {
  id: string;
  name: string;
  plan: string;
  users: number;
  jobsPosted: number;
  applications: number;
  hires: number;
  revenue: number;
  growth: number;
  status: string;
}

interface UserActivityReport {
  role: string;
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  churned: number;
  engagementRate: string;
}

interface RevenueReport {
  month: string;
  mrr: number;
  newRevenue: number;
  churnedRevenue: number;
  netRevenue: number;
  growth: number;
}

interface JobReport {
  category: string;
  totalJobs: number;
  activeJobs: number;
  applications: number;
  avgTimeToHire: string;
  fillRate: string;
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>("month");
  const [searchQuery, setSearchQuery] = useState("");

  // Company Performance Reports
  const companyReports: CompanyReport[] = [
    {
      id: "1",
      name: "TechCorp Inc.",
      plan: "Enterprise",
      users: 45,
      jobsPosted: 23,
      applications: 1250,
      hires: 18,
      revenue: 4999,
      growth: 15.5,
      status: "Active",
    },
    {
      id: "2",
      name: "StartupXYZ",
      plan: "Professional",
      users: 12,
      jobsPosted: 8,
      applications: 234,
      hires: 5,
      revenue: 299,
      growth: 8.2,
      status: "Active",
    },
    {
      id: "3",
      name: "Enterprise Co.",
      plan: "Enterprise",
      users: 78,
      jobsPosted: 45,
      applications: 2100,
      hires: 32,
      revenue: 9999,
      growth: 22.1,
      status: "Active",
    },
    {
      id: "4",
      name: "Digital Solutions Ltd",
      plan: "Professional",
      users: 23,
      jobsPosted: 15,
      applications: 567,
      hires: 11,
      revenue: 299,
      growth: -5.3,
      status: "Active",
    },
    {
      id: "5",
      name: "HealthTech Solutions",
      plan: "Enterprise",
      users: 56,
      jobsPosted: 34,
      applications: 1456,
      hires: 25,
      revenue: 4999,
      growth: 18.7,
      status: "Active",
    },
  ];

  // User Activity Reports
  const userActivityReports: UserActivityReport[] = [
    {
      role: "Candidates",
      totalUsers: 15234,
      activeUsers: 12456,
      newUsers: 1234,
      churned: 234,
      engagementRate: "81.7%",
    },
    {
      role: "Recruiters",
      totalUsers: 2345,
      activeUsers: 2123,
      newUsers: 145,
      churned: 23,
      engagementRate: "90.5%",
    },
    {
      role: "Interviewers",
      totalUsers: 1234,
      activeUsers: 1098,
      newUsers: 89,
      churned: 12,
      engagementRate: "89.0%",
    },
    {
      role: "HR Admins",
      totalUsers: 456,
      activeUsers: 423,
      newUsers: 34,
      churned: 5,
      engagementRate: "92.8%",
    },
    {
      role: "Platform Admins",
      totalUsers: 12,
      activeUsers: 12,
      newUsers: 0,
      churned: 0,
      engagementRate: "100%",
    },
  ];

  // Revenue Reports
  const revenueReports: RevenueReport[] = [
    {
      month: "Nov 2024",
      mrr: 124567,
      newRevenue: 15234,
      churnedRevenue: 3456,
      netRevenue: 11778,
      growth: 10.4,
    },
    {
      month: "Oct 2024",
      mrr: 112789,
      newRevenue: 12345,
      churnedRevenue: 2345,
      netRevenue: 10000,
      growth: 9.7,
    },
    {
      month: "Sep 2024",
      mrr: 102789,
      newRevenue: 10234,
      churnedRevenue: 2567,
      netRevenue: 7667,
      growth: 8.1,
    },
    {
      month: "Aug 2024",
      mrr: 95122,
      newRevenue: 9876,
      churnedRevenue: 1234,
      netRevenue: 8642,
      growth: 10.0,
    },
    {
      month: "Jul 2024",
      mrr: 86480,
      newRevenue: 8234,
      churnedRevenue: 1876,
      netRevenue: 6358,
      growth: 7.9,
    },
  ];

  // Job Performance Reports
  const jobReports: JobReport[] = [
    {
      category: "Engineering",
      totalJobs: 2345,
      activeJobs: 1234,
      applications: 45678,
      avgTimeToHire: "32 days",
      fillRate: "78.5%",
    },
    {
      category: "Sales & Marketing",
      totalJobs: 1234,
      activeJobs: 678,
      applications: 23456,
      avgTimeToHire: "28 days",
      fillRate: "82.3%",
    },
    {
      category: "Product & Design",
      totalJobs: 876,
      activeJobs: 456,
      applications: 15678,
      avgTimeToHire: "35 days",
      fillRate: "75.2%",
    },
    {
      category: "Operations",
      totalJobs: 654,
      activeJobs: 345,
      applications: 9876,
      avgTimeToHire: "25 days",
      fillRate: "85.1%",
    },
    {
      category: "Finance & Legal",
      totalJobs: 432,
      activeJobs: 234,
      applications: 5678,
      avgTimeToHire: "38 days",
      fillRate: "71.8%",
    },
    {
      category: "Human Resources",
      totalJobs: 321,
      activeJobs: 178,
      applications: 4321,
      avgTimeToHire: "30 days",
      fillRate: "79.4%",
    },
  ];

  const filteredCompanies = companyReports.filter((company) =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalMRR = revenueReports[0].mrr;
  const totalCompanies = companyReports.length;
  const totalUsers = userActivityReports.reduce((sum, r) => sum + r.totalUsers, 0);
  const totalJobs = jobReports.reduce((sum, r) => sum + r.totalJobs, 0);
  const totalApplications = jobReports.reduce((sum, r) => sum + r.applications, 0);
  const totalHires = companyReports.reduce((sum, r) => sum + r.hires, 0);

  const handleExportReport = (reportType: string) => {
    console.log(`Exporting ${reportType} report for period: ${period}`);
    // In a real app, this would generate and download a CSV/PDF report
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
          <a href="/platform-admin/reports" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground">
            <FileText className="w-5 h-5" />
            <span className="font-medium">Reports</span>
          </a>
          <a href="/platform-admin/settings" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
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
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">Analytics & Reports</h2>
                <p className="text-muted-foreground">
                  Comprehensive business intelligence and insights
                </p>
              </div>
              <div className="flex gap-3">
                <Select value={period} onValueChange={(value) => setPeriod(value as ReportPeriod)}>
                  <SelectTrigger className="w-40">
                    <Calendar className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Export All Reports
                </Button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-6 gap-3">
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">MRR</p>
                      <p className="text-xl font-bold">${(totalMRR / 1000).toFixed(1)}k</p>
                      <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3" />
                        +10.4%
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Companies</p>
                      <p className="text-xl font-bold">{totalCompanies}</p>
                      <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3" />
                        +12%
                      </p>
                    </div>
                    <Building2 className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Users</p>
                      <p className="text-xl font-bold">{(totalUsers / 1000).toFixed(1)}k</p>
                      <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3" />
                        +8%
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Jobs</p>
                      <p className="text-xl font-bold">{(totalJobs / 1000).toFixed(1)}k</p>
                      <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3" />
                        +15%
                      </p>
                    </div>
                    <Briefcase className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Applications</p>
                      <p className="text-xl font-bold">{(totalApplications / 1000).toFixed(0)}k</p>
                      <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3" />
                        +23%
                      </p>
                    </div>
                    <FileText className="w-8 h-8 text-cyan-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Hires</p>
                      <p className="text-xl font-bold">{totalHires}</p>
                      <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3" />
                        +18%
                      </p>
                    </div>
                    <Award className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          <Tabs defaultValue="revenue" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="companies">Companies</TabsTrigger>
              <TabsTrigger value="users">User Activity</TabsTrigger>
              <TabsTrigger value="jobs">Job Performance</TabsTrigger>
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
            </TabsList>

            {/* Revenue Tab */}
            <TabsContent value="revenue" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Revenue Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    Monthly recurring revenue and growth trends
                  </p>
                </div>
                <Button variant="outline" onClick={() => handleExportReport("revenue")}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Revenue Report
                </Button>
              </div>

              {/* Revenue Summary Cards */}
              <div className="grid grid-cols-4 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Current MRR</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-600">
                      ${totalMRR.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Monthly Recurring Revenue
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">New Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-blue-600">
                      ${revenueReports[0].newRevenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Churned Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-red-600">
                      ${revenueReports[0].churnedRevenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Growth Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-600">
                      +{revenueReports[0].growth}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Month over month
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Revenue Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue Breakdown</CardTitle>
                  <CardDescription>Last 5 months revenue performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead>MRR</TableHead>
                        <TableHead>New Revenue</TableHead>
                        <TableHead>Churned Revenue</TableHead>
                        <TableHead>Net Revenue</TableHead>
                        <TableHead>Growth</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {revenueReports.map((report) => (
                        <TableRow key={report.month}>
                          <TableCell className="font-medium">{report.month}</TableCell>
                          <TableCell>
                            <span className="font-semibold">
                              ${report.mrr.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-green-600">
                              +${report.newRevenue.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-red-600">
                              -${report.churnedRevenue.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold">
                              ${report.netRevenue.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {report.growth >= 0 ? (
                                <TrendingUp className="w-4 h-4 text-green-600" />
                              ) : (
                                <TrendingDown className="w-4 h-4 text-red-600" />
                              )}
                              <span className={report.growth >= 0 ? "text-green-600" : "text-red-600"}>
                                {report.growth >= 0 ? "+" : ""}{report.growth}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Companies Tab */}
            <TabsContent value="companies" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Company Performance</h3>
                  <p className="text-sm text-muted-foreground">
                    Individual company metrics and rankings
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search companies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" onClick={() => handleExportReport("companies")}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Company Rankings</CardTitle>
                  <CardDescription>Sorted by total revenue contribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Users</TableHead>
                        <TableHead>Jobs Posted</TableHead>
                        <TableHead>Applications</TableHead>
                        <TableHead>Hires</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Growth</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCompanies
                        .sort((a, b) => b.revenue - a.revenue)
                        .map((company, index) => (
                          <TableRow key={company.id}>
                            <TableCell>
                              <Badge variant={index < 3 ? "default" : "outline"}>
                                #{index + 1}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{company.name}</TableCell>
                            <TableCell>
                              <Badge variant={company.plan === "Enterprise" ? "default" : "outline"}>
                                {company.plan}
                              </Badge>
                            </TableCell>
                            <TableCell>{company.users}</TableCell>
                            <TableCell>{company.jobsPosted}</TableCell>
                            <TableCell>{company.applications.toLocaleString()}</TableCell>
                            <TableCell>{company.hires}</TableCell>
                            <TableCell>
                              <span className="font-semibold">
                                ${company.revenue.toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {company.growth >= 0 ? (
                                  <TrendingUp className="w-4 h-4 text-green-600" />
                                ) : (
                                  <TrendingDown className="w-4 h-4 text-red-600" />
                                )}
                                <span className={company.growth >= 0 ? "text-green-600" : "text-red-600"}>
                                  {company.growth >= 0 ? "+" : ""}{company.growth}%
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* User Activity Tab */}
            <TabsContent value="users" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">User Activity Reports</h3>
                  <p className="text-sm text-muted-foreground">
                    User engagement and activity by role
                  </p>
                </div>
                <Button variant="outline" onClick={() => handleExportReport("users")}>
                  <Download className="w-4 h-4 mr-2" />
                  Export User Report
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>User Activity by Role</CardTitle>
                  <CardDescription>Breakdown of user engagement metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Role</TableHead>
                        <TableHead>Total Users</TableHead>
                        <TableHead>Active Users</TableHead>
                        <TableHead>New Users</TableHead>
                        <TableHead>Churned</TableHead>
                        <TableHead>Engagement Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userActivityReports.map((report) => (
                        <TableRow key={report.role}>
                          <TableCell className="font-medium">{report.role}</TableCell>
                          <TableCell>
                            <span className="font-semibold">
                              {report.totalUsers.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-green-600">
                              {report.activeUsers.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-blue-600">
                              +{report.newUsers.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-red-600">
                              {report.churned.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={`border ${
                              parseFloat(report.engagementRate) >= 90
                                ? "bg-green-100 text-green-800 border-green-200"
                                : parseFloat(report.engagementRate) >= 80
                                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                : "bg-red-100 text-red-800 border-red-200"
                            }`}>
                              {report.engagementRate}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* User Growth Trend */}
              <div className="grid grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Total Active Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {userActivityReports.reduce((sum, r) => sum + r.activeUsers, 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      +8.5% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">New Users This Month</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-blue-600">
                      {userActivityReports.reduce((sum, r) => sum + r.newUsers, 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Across all roles
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Avg Engagement Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-600">
                      87.2%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Platform-wide average
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Job Performance Tab */}
            <TabsContent value="jobs" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Job Performance Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    Hiring metrics and job category performance
                  </p>
                </div>
                <Button variant="outline" onClick={() => handleExportReport("jobs")}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Job Report
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Performance by Job Category</CardTitle>
                  <CardDescription>Key hiring metrics across categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Total Jobs</TableHead>
                        <TableHead>Active Jobs</TableHead>
                        <TableHead>Applications</TableHead>
                        <TableHead>Avg Time to Hire</TableHead>
                        <TableHead>Fill Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobReports.map((report) => (
                        <TableRow key={report.category}>
                          <TableCell className="font-medium">{report.category}</TableCell>
                          <TableCell>{report.totalJobs.toLocaleString()}</TableCell>
                          <TableCell>
                            <span className="text-blue-600">
                              {report.activeJobs.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold">
                              {report.applications.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              {report.avgTimeToHire}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`border ${
                              parseFloat(report.fillRate) >= 80
                                ? "bg-green-100 text-green-800 border-green-200"
                                : parseFloat(report.fillRate) >= 70
                                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                : "bg-red-100 text-red-800 border-red-200"
                            }`}>
                              {report.fillRate}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Job Metrics Summary */}
              <div className="grid grid-cols-4 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Total Active Jobs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {jobReports.reduce((sum, r) => sum + r.activeJobs, 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Currently open positions
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Total Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-blue-600">
                      {totalApplications.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      +23% this month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Avg Time to Hire</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">31 days</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Platform average
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Overall Fill Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-600">78.7%</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Successful placements
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Engagement Tab */}
            <TabsContent value="engagement" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Platform Engagement Metrics</h3>
                  <p className="text-sm text-muted-foreground">
                    User engagement and platform activity trends
                  </p>
                </div>
                <Button variant="outline" onClick={() => handleExportReport("engagement")}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Engagement Report
                </Button>
              </div>

              {/* Engagement Metrics Grid */}
              <div className="grid grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Daily Active Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">8,234</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      +12.5% vs last week
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Avg Session Duration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">18m 34s</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      +2.3 minutes
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Actions Per Session</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">24.7</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      +3.2 actions
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Feature Usage */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Feature Usage</CardTitle>
                  <CardDescription>Most used platform features this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { feature: "Job Search & Browse", usage: 45678, growth: 15.2 },
                      { feature: "Application Submission", usage: 34567, growth: 23.4 },
                      { feature: "Resume Builder", usage: 23456, growth: 18.7 },
                      { feature: "Interview Scheduling", usage: 12345, growth: 12.1 },
                      { feature: "Candidate Messaging", usage: 9876, growth: 8.9 },
                      { feature: "Job Posting", usage: 5678, growth: 10.3 },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{item.feature}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.usage.toLocaleString()} uses this month
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${(item.usage / 45678) * 100}%` }}
                            />
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            +{item.growth}%
                          </Badge>
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
