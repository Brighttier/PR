"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface CompanyData {
  id: string;
  name: string;
  plan: string;
  userCount: number;
  jobCount: number;
  applicationCount: number;
  status: string;
  createdAt: any;
}

interface SystemMetric {
  service: string;
  status: string;
  uptime: string;
  responseTime: string;
  statusColor: string;
}

export default function PlatformAdminDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeUsers: 0,
    totalApplications: 0,
    systemHealth: "99.8%",
  });
  const [companies, setCompanies] = useState<CompanyData[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all companies
      const companiesSnapshot = await getDocs(collection(db, "companies"));
      const companiesData: CompanyData[] = [];

      let totalUsers = 0;
      let totalApplications = 0;

      for (const companyDoc of companiesSnapshot.docs) {
        const companyData = companyDoc.data();

        // Count users for this company
        const usersSnapshot = await getDocs(
          query(collection(db, "users"), where("companyId", "==", companyDoc.id))
        );
        const userCount = usersSnapshot.size;
        totalUsers += userCount;

        // Count jobs for this company
        const jobsSnapshot = await getDocs(
          query(collection(db, "jobs"), where("companyId", "==", companyDoc.id))
        );
        const jobCount = jobsSnapshot.size;

        // Count applications for this company
        const appsSnapshot = await getDocs(
          query(collection(db, "applications"), where("companyId", "==", companyDoc.id))
        );
        const applicationCount = appsSnapshot.size;
        totalApplications += applicationCount;

        companiesData.push({
          id: companyDoc.id,
          name: companyData.name || "Unnamed Company",
          plan: companyData.plan || "Basic",
          userCount,
          jobCount,
          applicationCount,
          status: companyData.status || "Active",
          createdAt: companyData.createdAt,
        });
      }

      // Sort by application count (most active first)
      companiesData.sort((a, b) => b.applicationCount - a.applicationCount);

      setCompanies(companiesData.slice(0, 5)); // Top 5 companies
      setStats({
        totalCompanies: companiesSnapshot.size,
        activeUsers: totalUsers,
        totalApplications,
        systemHealth: "99.8%",
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const systemMetrics: SystemMetric[] = [
    {
      service: "Firestore Database",
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
      service: "Firebase Storage",
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

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        year: "numeric",
      }).format(date);
    } catch {
      return "N/A";
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Platform Dashboard</h2>
              <p className="text-muted-foreground mt-1">Loading...</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="h-24 animate-pulse bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Platform Dashboard</h2>
            <p className="text-muted-foreground mt-1">
              Monitor system-wide metrics and company performance
            </p>
          </div>
          <Badge variant="outline" className="h-8 px-3 border-green-200 bg-green-50 text-green-700">
            <Activity className="w-3 h-3 mr-1" />
            All Systems Operational
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Companies</p>
                  <h3 className="text-3xl font-bold mb-1">{stats.totalCompanies}</h3>
                  <p className="text-sm text-muted-foreground">Active on platform</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Users</p>
                  <h3 className="text-3xl font-bold mb-1">{stats.activeUsers.toLocaleString()}</h3>
                  <p className="text-sm text-muted-foreground">Across all companies</p>
                </div>
                <div className="p-3 rounded-lg bg-green-50">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Applications</p>
                  <h3 className="text-3xl font-bold mb-1">{stats.totalApplications.toLocaleString()}</h3>
                  <p className="text-sm text-muted-foreground">Platform-wide</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-50">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">System Health</p>
                  <h3 className="text-3xl font-bold mb-1">{stats.systemHealth}</h3>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                </div>
                <div className="p-3 rounded-lg bg-green-50">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Companies */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Top Active Companies</CardTitle>
                  <CardDescription>Companies with most applications</CardDescription>
                </div>
                <Link href="/platform-admin/companies">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {companies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No companies found
                </div>
              ) : (
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
                      <TableRow key={company.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <Link href={`/platform-admin/companies/${company.id}`}>
                            <div>
                              <p className="font-medium">{company.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Joined {formatDate(company.createdAt)}
                              </p>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={company.plan === "Enterprise" ? "default" : "outline"}
                          >
                            {company.plan}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{company.userCount}</TableCell>
                        <TableCell className="text-sm">{company.jobCount}</TableCell>
                        <TableCell className="text-sm">
                          {company.applicationCount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={company.status === "Active" ? "outline" : "secondary"}
                            className={
                              company.status === "Active"
                                ? "border-green-200 bg-green-50 text-green-700"
                                : ""
                            }
                          >
                            {company.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
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
                  <div key={metric.service} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">{metric.service}</p>
                      <Badge
                        variant="outline"
                        className="border-green-200 bg-green-50 text-green-700"
                      >
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

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Platform management shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link href="/platform-admin/companies">
                <Button variant="outline" className="w-full justify-start">
                  <Building2 className="w-4 h-4 mr-2" />
                  Manage Companies
                </Button>
              </Link>
              <Link href="/platform-admin/users">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  View All Users
                </Button>
              </Link>
              <Link href="/platform-admin/system-health">
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="w-4 h-4 mr-2" />
                  System Health
                </Button>
              </Link>
              <Link href="/platform-admin/settings">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Platform Settings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
