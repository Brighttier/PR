"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  Users,
  Briefcase,
  DollarSign,
  BarChart3,
  Calendar,
  MapPin,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

interface AnalyticsData {
  mrr: number;
  arr: number;
  totalUsers: number;
  activeUsers: number;
  totalApplications: number;
  totalJobs: number;
  conversionRate: number;
  churnRate: number;
}

export default function AnalyticsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    mrr: 0,
    arr: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalApplications: 0,
    totalJobs: 0,
    conversionRate: 0,
    churnRate: 0,
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch companies and calculate MRR/ARR
      const companiesSnapshot = await getDocs(collection(db, "companies"));
      let totalMRR = 0;
      companiesSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.status === "Active") {
          totalMRR += calculateMRR(data.plan || "Basic");
        }
      });

      // Fetch total users
      const usersSnapshot = await getDocs(collection(db, "users"));
      const totalUsers = usersSnapshot.size;

      // Calculate active users (logged in within last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      let activeUsers = 0;
      usersSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.lastActive && data.lastActive.toDate() > thirtyDaysAgo) {
          activeUsers++;
        }
      });

      // Fetch applications
      const applicationsSnapshot = await getDocs(collection(db, "applications"));
      const totalApplications = applicationsSnapshot.size;

      // Fetch jobs
      const jobsSnapshot = await getDocs(collection(db, "jobs"));
      const totalJobs = jobsSnapshot.size;

      setAnalytics({
        mrr: totalMRR,
        arr: totalMRR * 12,
        totalUsers,
        activeUsers,
        totalApplications,
        totalJobs,
        conversionRate: totalJobs > 0 ? (totalApplications / totalJobs) : 0,
        churnRate: 2.5, // Placeholder
      });

    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateMRR = (plan: string): number => {
    const planPricing: { [key: string]: number } = {
      Enterprise: 2499,
      Professional: 599,
      Growth: 249,
      Basic: 99,
      Trial: 0,
    };
    return planPricing[plan] || 0;
  };

  // Mock data for charts
  const revenueData = [
    { month: "Jan", mrr: 45000, arr: 540000 },
    { month: "Feb", mrr: 52000, arr: 624000 },
    { month: "Mar", mrr: 58000, arr: 696000 },
    { month: "Apr", mrr: 65000, arr: 780000 },
    { month: "May", mrr: 72000, arr: 864000 },
    { month: "Jun", mrr: 78000, arr: 936000 },
    { month: "Jul", mrr: 85000, arr: 1020000 },
    { month: "Aug", mrr: 92000, arr: 1104000 },
    { month: "Sep", mrr: 98000, arr: 1176000 },
    { month: "Oct", mrr: 105000, arr: 1260000 },
    { month: "Nov", mrr: 112000, arr: 1344000 },
    { month: "Dec", mrr: 120000, arr: 1440000 },
  ];

  const userGrowthData = [
    { month: "Jan", users: 1200, companies: 45 },
    { month: "Feb", users: 1450, companies: 52 },
    { month: "Mar", users: 1680, companies: 58 },
    { month: "Apr", users: 1920, companies: 65 },
    { month: "May", users: 2150, companies: 72 },
    { month: "Jun", users: 2400, companies: 78 },
    { month: "Jul", users: 2650, companies: 85 },
    { month: "Aug", users: 2890, companies: 92 },
    { month: "Sep", users: 3120, companies: 98 },
    { month: "Oct", users: 3350, companies: 105 },
    { month: "Nov", users: 3580, companies: 112 },
    { month: "Dec", users: 3800, companies: 120 },
  ];

  const applicationVolumeData = [
    { month: "Jan", applications: 5600 },
    { month: "Feb", applications: 6200 },
    { month: "Mar", applications: 6800 },
    { month: "Apr", applications: 7500 },
    { month: "May", applications: 8200 },
    { month: "Jun", applications: 8900 },
    { month: "Jul", applications: 9600 },
    { month: "Aug", applications: 10200 },
    { month: "Sep", applications: 10800 },
    { month: "Oct", applications: 11500 },
    { month: "Nov", applications: 12100 },
    { month: "Dec", applications: 12800 },
  ];

  const jobCategoriesData = [
    { name: "Engineering", value: 3500, color: "#3b82f6" },
    { name: "Sales & Marketing", value: 2800, color: "#10b981" },
    { name: "Product & Design", value: 2200, color: "#f59e0b" },
    { name: "Operations", value: 1800, color: "#8b5cf6" },
    { name: "Finance", value: 1200, color: "#ef4444" },
    { name: "Other", value: 1000, color: "#6b7280" },
  ];

  const geographicData = [
    { region: "North America", companies: 65, percentage: 54.2 },
    { region: "Europe", companies: 35, percentage: 29.2 },
    { region: "Asia Pacific", companies: 15, percentage: 12.5 },
    { region: "Latin America", companies: 3, percentage: 2.5 },
    { region: "Middle East & Africa", companies: 2, percentage: 1.6 },
  ];

  const conversionFunnelData = [
    { stage: "Visitors", count: 50000, percentage: 100 },
    { stage: "Sign Ups", count: 5000, percentage: 10 },
    { stage: "Trial Started", count: 2500, percentage: 5 },
    { stage: "Paid Conversion", count: 500, percentage: 1 },
    { stage: "Active Users", count: 450, percentage: 0.9 },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="grid grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Platform Analytics</h2>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights into platform performance
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">MRR</p>
                <h3 className="text-3xl font-bold mb-1">
                  ${(analytics.mrr / 1000).toFixed(0)}k
                </h3>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>12.5% from last month</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">ARR</p>
                <h3 className="text-3xl font-bold mb-1">
                  ${(analytics.arr / 1000000).toFixed(1)}M
                </h3>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>15.2% from last year</span>
                </div>
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
                <p className="text-sm text-muted-foreground mb-1">Active Users</p>
                <h3 className="text-3xl font-bold mb-1">
                  {analytics.activeUsers.toLocaleString()}
                </h3>
                <p className="text-sm text-muted-foreground">
                  of {analytics.totalUsers.toLocaleString()} total
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Churn Rate</p>
                <h3 className="text-3xl font-bold mb-1">{analytics.churnRate}%</h3>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <ArrowDownRight className="w-4 h-4" />
                  <span>0.5% improvement</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-orange-50">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Growth</CardTitle>
            <CardDescription>Monthly recurring revenue and annual run rate</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="mrr"
                  stackId="1"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                  name="MRR"
                />
                <Area
                  type="monotone"
                  dataKey="arr"
                  stackId="2"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  name="ARR"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Total users and companies over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Total Users"
                />
                <Line
                  type="monotone"
                  dataKey="companies"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Companies"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Application Volume & Job Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Application Volume</CardTitle>
            <CardDescription>Total applications over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={applicationVolumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="applications" fill="#8b5cf6" name="Applications" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popular Job Categories</CardTitle>
            <CardDescription>Distribution of jobs by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={jobCategoriesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {jobCategoriesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Geographic Distribution</CardTitle>
          <CardDescription>Companies by region</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {geographicData.map((region, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{region.region}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">
                      {region.companies} companies
                    </span>
                    <span className="font-semibold">{region.percentage}%</span>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${region.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>User journey from visitor to active customer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {conversionFunnelData.map((stage, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{stage.stage}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">
                      {stage.count.toLocaleString()}
                    </span>
                    <Badge variant="outline">{stage.percentage}%</Badge>
                  </div>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                    style={{ width: `${stage.percentage * 10}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
