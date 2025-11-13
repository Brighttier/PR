"use client";

import { useState } from "react";
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
  Building2,
  Users,
  BarChart3,
  Settings,
  Activity,
  Shield,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Server,
  Database,
  Zap,
  HardDrive,
  Cpu,
  Globe,
  RefreshCw,
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Wifi,
  Cloud,
  Lock,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type ServiceStatus = "healthy" | "degraded" | "down" | "maintenance";

interface ServiceMetric {
  id: string;
  name: string;
  status: ServiceStatus;
  uptime: string;
  responseTime: string;
  lastCheck: string;
  requests24h: number;
  errorRate: string;
  description: string;
  icon: any;
}

interface ServerMetric {
  id: string;
  name: string;
  region: string;
  status: ServiceStatus;
  cpu: number;
  memory: number;
  disk: number;
  network: string;
  load: number;
}

interface IncidentLog {
  id: string;
  timestamp: string;
  severity: "critical" | "warning" | "info";
  service: string;
  message: string;
  status: "open" | "investigating" | "resolved";
  duration?: string;
}

export default function SystemHealthPage() {
  const [lastRefresh, setLastRefresh] = useState("Just now");

  // Core Services
  const coreServices: ServiceMetric[] = [
    {
      id: "1",
      name: "API Gateway",
      status: "healthy",
      uptime: "99.98%",
      responseTime: "45ms",
      lastCheck: "30 seconds ago",
      requests24h: 2847593,
      errorRate: "0.02%",
      description: "Main API gateway handling all requests",
      icon: Globe,
    },
    {
      id: "2",
      name: "Database (Primary)",
      status: "healthy",
      uptime: "99.99%",
      responseTime: "12ms",
      lastCheck: "30 seconds ago",
      requests24h: 5694821,
      errorRate: "0.00%",
      description: "PostgreSQL primary database cluster",
      icon: Database,
    },
    {
      id: "3",
      name: "Database (Replica)",
      status: "healthy",
      uptime: "99.97%",
      responseTime: "15ms",
      lastCheck: "30 seconds ago",
      requests24h: 3421567,
      errorRate: "0.01%",
      description: "PostgreSQL read replica",
      icon: Database,
    },
    {
      id: "4",
      name: "Redis Cache",
      status: "healthy",
      uptime: "99.95%",
      responseTime: "3ms",
      lastCheck: "30 seconds ago",
      requests24h: 9234567,
      errorRate: "0.00%",
      description: "Redis caching layer",
      icon: Zap,
    },
    {
      id: "5",
      name: "Authentication Service",
      status: "healthy",
      uptime: "99.96%",
      responseTime: "67ms",
      lastCheck: "30 seconds ago",
      requests24h: 456789,
      errorRate: "0.03%",
      description: "Firebase Authentication",
      icon: Lock,
    },
    {
      id: "6",
      name: "Storage Service",
      status: "healthy",
      uptime: "100%",
      responseTime: "89ms",
      lastCheck: "30 seconds ago",
      requests24h: 234567,
      errorRate: "0.00%",
      description: "Cloud storage for documents and files",
      icon: HardDrive,
    },
  ];

  // AI & ML Services
  const aiServices: ServiceMetric[] = [
    {
      id: "7",
      name: "Gemini AI API",
      status: "healthy",
      uptime: "99.5%",
      responseTime: "1245ms",
      lastCheck: "1 minute ago",
      requests24h: 145678,
      errorRate: "0.5%",
      description: "Google Gemini for resume parsing and matching",
      icon: Cpu,
    },
    {
      id: "8",
      name: "Resume Parser",
      status: "degraded",
      uptime: "98.2%",
      responseTime: "3456ms",
      lastCheck: "1 minute ago",
      requests24h: 34567,
      errorRate: "1.8%",
      description: "AI-powered resume parsing service",
      icon: Activity,
    },
    {
      id: "9",
      name: "Job Matching Engine",
      status: "healthy",
      uptime: "99.3%",
      responseTime: "567ms",
      lastCheck: "1 minute ago",
      requests24h: 89456,
      errorRate: "0.7%",
      description: "ML-based job recommendation engine",
      icon: TrendingUp,
    },
    {
      id: "10",
      name: "Interview Scheduler",
      status: "healthy",
      uptime: "99.8%",
      responseTime: "234ms",
      lastCheck: "30 seconds ago",
      requests24h: 12345,
      errorRate: "0.2%",
      description: "Automated interview scheduling service",
      icon: Clock,
    },
  ];

  // Third-Party Integrations
  const integrations: ServiceMetric[] = [
    {
      id: "11",
      name: "Email Service (SendGrid)",
      status: "healthy",
      uptime: "99.9%",
      responseTime: "456ms",
      lastCheck: "2 minutes ago",
      requests24h: 56789,
      errorRate: "0.1%",
      description: "Email delivery service",
      icon: Wifi,
    },
    {
      id: "12",
      name: "SMS Service (Twilio)",
      status: "healthy",
      uptime: "99.7%",
      responseTime: "678ms",
      lastCheck: "2 minutes ago",
      requests24h: 8765,
      errorRate: "0.3%",
      description: "SMS notification service",
      icon: Wifi,
    },
    {
      id: "13",
      name: "Payment Gateway (Stripe)",
      status: "healthy",
      uptime: "99.99%",
      responseTime: "234ms",
      lastCheck: "1 minute ago",
      requests24h: 4567,
      errorRate: "0.01%",
      description: "Payment processing service",
      icon: Cloud,
    },
    {
      id: "14",
      name: "Analytics (Google Analytics)",
      status: "healthy",
      uptime: "99.8%",
      responseTime: "123ms",
      lastCheck: "5 minutes ago",
      requests24h: 234567,
      errorRate: "0.2%",
      description: "Analytics and tracking service",
      icon: BarChart3,
    },
  ];

  // Server Infrastructure
  const servers: ServerMetric[] = [
    {
      id: "1",
      name: "Web Server 1 (US-East)",
      region: "us-east-1",
      status: "healthy",
      cpu: 45,
      memory: 62,
      disk: 58,
      network: "2.3 GB/s",
      load: 1.2,
    },
    {
      id: "2",
      name: "Web Server 2 (US-West)",
      region: "us-west-1",
      status: "healthy",
      cpu: 38,
      memory: 54,
      disk: 61,
      network: "1.8 GB/s",
      load: 0.9,
    },
    {
      id: "3",
      name: "Web Server 3 (EU-Central)",
      region: "eu-central-1",
      status: "healthy",
      cpu: 52,
      memory: 68,
      disk: 43,
      network: "1.5 GB/s",
      load: 1.5,
    },
    {
      id: "4",
      name: "API Server 1 (US-East)",
      region: "us-east-1",
      status: "healthy",
      cpu: 67,
      memory: 71,
      disk: 39,
      network: "3.2 GB/s",
      load: 2.1,
    },
    {
      id: "5",
      name: "API Server 2 (Asia-Pacific)",
      region: "ap-southeast-1",
      status: "degraded",
      cpu: 89,
      memory: 92,
      disk: 76,
      network: "2.9 GB/s",
      load: 3.8,
    },
    {
      id: "6",
      name: "Database Server (Primary)",
      region: "us-east-1",
      status: "healthy",
      cpu: 34,
      memory: 78,
      disk: 82,
      network: "4.1 GB/s",
      load: 1.3,
    },
  ];

  // Incident Logs
  const incidents: IncidentLog[] = [
    {
      id: "1",
      timestamp: "2024-11-11 09:45:23",
      severity: "warning",
      service: "Resume Parser",
      message: "High response times detected (>3s average)",
      status: "investigating",
    },
    {
      id: "2",
      timestamp: "2024-11-11 08:12:45",
      severity: "info",
      service: "API Server 2 (Asia-Pacific)",
      message: "CPU usage above 85% threshold",
      status: "investigating",
    },
    {
      id: "3",
      timestamp: "2024-11-11 06:30:12",
      severity: "warning",
      service: "Database (Replica)",
      message: "Replication lag detected (12s delay)",
      status: "resolved",
      duration: "45 minutes",
    },
    {
      id: "4",
      timestamp: "2024-11-10 22:15:33",
      severity: "critical",
      service: "Email Service",
      message: "Email delivery failures (rate: 15%)",
      status: "resolved",
      duration: "2 hours",
    },
    {
      id: "5",
      timestamp: "2024-11-10 18:45:22",
      severity: "info",
      service: "Redis Cache",
      message: "Cache eviction rate above normal",
      status: "resolved",
      duration: "1 hour",
    },
  ];

  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800 border-green-200";
      case "degraded":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "down":
        return "bg-red-100 text-red-800 border-red-200";
      case "maintenance":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: ServiceStatus) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-4 h-4" />;
      case "degraded":
        return <AlertTriangle className="w-4 h-4" />;
      case "down":
        return <XCircle className="w-4 h-4" />;
      case "maintenance":
        return <Clock className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: "critical" | "warning" | "info") => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "info":
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getIncidentStatusColor = (status: "open" | "investigating" | "resolved") => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800 border-red-200";
      case "investigating":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const getMetricColor = (value: number, type: "cpu" | "memory" | "disk") => {
    if (value >= 85) return "text-red-600";
    if (value >= 70) return "text-yellow-600";
    return "text-green-600";
  };

  const allServices = [...coreServices, ...aiServices, ...integrations];
  const healthyCount = allServices.filter((s) => s.status === "healthy").length;
  const degradedCount = allServices.filter((s) => s.status === "degraded").length;
  const downCount = allServices.filter((s) => s.status === "down").length;
  const overallHealth = ((healthyCount / allServices.length) * 100).toFixed(1);

  const handleRefresh = () => {
    setLastRefresh("Just now");
    // In a real app, this would trigger a data refresh
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
          <a href="/platform-admin/system-health" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground">
            <Activity className="w-5 h-5" />
            <span className="font-medium">System Health</span>
          </a>
          <a href="/platform-admin/reports" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
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
                <h2 className="text-2xl font-bold">System Health</h2>
                <p className="text-muted-foreground">
                  Real-time monitoring and diagnostics
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleRefresh}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>

            {/* Overall Health Stats */}
            <div className="grid grid-cols-5 gap-3">
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Overall Health</p>
                      <p className="text-2xl font-bold text-green-600">{overallHealth}%</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Healthy Services</p>
                      <p className="text-2xl font-bold">{healthyCount}/{allServices.length}</p>
                    </div>
                    <Activity className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Degraded</p>
                      <p className="text-2xl font-bold">{degradedCount}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Down</p>
                      <p className="text-2xl font-bold">{downCount}</p>
                    </div>
                    <XCircle className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Last Updated</p>
                      <p className="text-sm font-semibold">{lastRefresh}</p>
                    </div>
                    <Clock className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          <Tabs defaultValue="services" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
              <TabsTrigger value="incidents">Incident Logs</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            {/* Services Tab */}
            <TabsContent value="services" className="space-y-6">
              {/* Core Services */}
              <Card>
                <CardHeader>
                  <CardTitle>Core Services</CardTitle>
                  <CardDescription>
                    Critical infrastructure services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Uptime</TableHead>
                        <TableHead>Response Time</TableHead>
                        <TableHead>Requests (24h)</TableHead>
                        <TableHead>Error Rate</TableHead>
                        <TableHead>Last Check</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {coreServices.map((service) => {
                        const Icon = service.icon;
                        return (
                          <TableRow key={service.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <Icon className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium">{service.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {service.description}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`border ${getStatusColor(service.status)}`}>
                                <span className="flex items-center gap-1">
                                  {getStatusIcon(service.status)}
                                  {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                                </span>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm font-semibold text-green-600">
                                {service.uptime}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{service.responseTime}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {service.requests24h.toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{service.errorRate}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs text-muted-foreground">
                                {service.lastCheck}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* AI Services */}
              <Card>
                <CardHeader>
                  <CardTitle>AI & ML Services</CardTitle>
                  <CardDescription>
                    Machine learning and AI-powered features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Uptime</TableHead>
                        <TableHead>Response Time</TableHead>
                        <TableHead>Requests (24h)</TableHead>
                        <TableHead>Error Rate</TableHead>
                        <TableHead>Last Check</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {aiServices.map((service) => {
                        const Icon = service.icon;
                        return (
                          <TableRow key={service.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                  <Icon className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                  <p className="font-medium">{service.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {service.description}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`border ${getStatusColor(service.status)}`}>
                                <span className="flex items-center gap-1">
                                  {getStatusIcon(service.status)}
                                  {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                                </span>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm font-semibold text-green-600">
                                {service.uptime}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{service.responseTime}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {service.requests24h.toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{service.errorRate}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs text-muted-foreground">
                                {service.lastCheck}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Third-Party Integrations */}
              <Card>
                <CardHeader>
                  <CardTitle>Third-Party Integrations</CardTitle>
                  <CardDescription>
                    External service integrations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Uptime</TableHead>
                        <TableHead>Response Time</TableHead>
                        <TableHead>Requests (24h)</TableHead>
                        <TableHead>Error Rate</TableHead>
                        <TableHead>Last Check</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {integrations.map((service) => {
                        const Icon = service.icon;
                        return (
                          <TableRow key={service.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                  <Icon className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium">{service.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {service.description}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`border ${getStatusColor(service.status)}`}>
                                <span className="flex items-center gap-1">
                                  {getStatusIcon(service.status)}
                                  {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                                </span>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm font-semibold text-green-600">
                                {service.uptime}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{service.responseTime}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {service.requests24h.toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{service.errorRate}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs text-muted-foreground">
                                {service.lastCheck}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Infrastructure Tab */}
            <TabsContent value="infrastructure" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Server Infrastructure</CardTitle>
                  <CardDescription>
                    Physical and virtual server metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Server</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>CPU Usage</TableHead>
                        <TableHead>Memory Usage</TableHead>
                        <TableHead>Disk Usage</TableHead>
                        <TableHead>Network</TableHead>
                        <TableHead>Load Average</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {servers.map((server) => (
                        <TableRow key={server.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Server className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{server.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  Region: {server.region}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`border ${getStatusColor(server.status)}`}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(server.status)}
                                {server.status.charAt(0).toUpperCase() + server.status.slice(1)}
                              </span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Cpu className="w-3 h-3 text-muted-foreground" />
                                <span className={`text-sm font-semibold ${getMetricColor(server.cpu, "cpu")}`}>
                                  {server.cpu}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    server.cpu >= 85
                                      ? "bg-red-600"
                                      : server.cpu >= 70
                                      ? "bg-yellow-600"
                                      : "bg-green-600"
                                  }`}
                                  style={{ width: `${server.cpu}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <span className={`text-sm font-semibold ${getMetricColor(server.memory, "memory")}`}>
                                {server.memory}%
                              </span>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    server.memory >= 85
                                      ? "bg-red-600"
                                      : server.memory >= 70
                                      ? "bg-yellow-600"
                                      : "bg-green-600"
                                  }`}
                                  style={{ width: `${server.memory}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <span className={`text-sm font-semibold ${getMetricColor(server.disk, "disk")}`}>
                                {server.disk}%
                              </span>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    server.disk >= 85
                                      ? "bg-red-600"
                                      : server.disk >= 70
                                      ? "bg-yellow-600"
                                      : "bg-green-600"
                                  }`}
                                  style={{ width: `${server.disk}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{server.network}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-semibold">{server.load}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Incidents Tab */}
            <TabsContent value="incidents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Incidents</CardTitle>
                  <CardDescription>
                    System incidents and resolutions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {incidents.map((incident) => (
                        <TableRow key={incident.id}>
                          <TableCell>
                            <span className="text-sm font-mono">
                              {incident.timestamp}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={`border ${getSeverityColor(incident.severity)}`}>
                              {incident.severity.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-medium">
                              {incident.service}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{incident.message}</span>
                          </TableCell>
                          <TableCell>
                            <Badge className={`border ${getIncidentStatusColor(incident.status)}`}>
                              {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {incident.duration || "-"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Request Metrics (24h)</CardTitle>
                    <CardDescription>Total API requests in last 24 hours</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Requests</p>
                          <p className="text-2xl font-bold">23.4M</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">Successful</p>
                          <p className="text-2xl font-bold text-green-600">23.2M</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">Failed</p>
                          <p className="text-2xl font-bold text-red-600">234K</p>
                        </div>
                        <XCircle className="w-8 h-8 text-red-600" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">Success Rate</p>
                          <p className="text-2xl font-bold">99.0%</p>
                        </div>
                        <Activity className="w-8 h-8 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Response Times</CardTitle>
                    <CardDescription>Average response times across services</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">API Gateway</p>
                          <p className="text-2xl font-bold">45ms</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">Database Queries</p>
                          <p className="text-2xl font-bold">12ms</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">AI Services</p>
                          <p className="text-2xl font-bold">1.2s</p>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">Acceptable</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">Overall Average</p>
                          <p className="text-2xl font-bold">234ms</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Good</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
