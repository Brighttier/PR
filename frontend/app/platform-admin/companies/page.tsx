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
  Briefcase,
  TrendingUp,
  Search,
  Filter,
  Eye,
  Edit,
  Ban,
  CheckCircle,
  Clock,
  Calendar,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Download,
  BarChart3,
  FileText,
  Settings,
  AlertCircle,
  ChevronDown,
  Plus,
  Activity,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type CompanyStatus = "active" | "trial" | "suspended" | "churned";
type SubscriptionPlan = "enterprise" | "professional" | "basic" | "trial";

interface Company {
  id: string;
  name: string;
  logo: string;
  industry: string;
  size: string;
  status: CompanyStatus;
  plan: SubscriptionPlan;
  joinedDate: string;
  expiryDate: string;
  users: number;
  jobsPosted: number;
  applicationsReceived: number;
  activeJobs: number;
  mrr: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  location: string;
  website: string;
  lastActive: string;
}

export default function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPlan, setFilterPlan] = useState<string>("all");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Mock data
  const companies: Company[] = [
    {
      id: "1",
      name: "TechCorp Inc.",
      logo: "TC",
      industry: "Technology",
      size: "500-1000",
      status: "active",
      plan: "enterprise",
      joinedDate: "2023-01-15",
      expiryDate: "2025-01-15",
      users: 45,
      jobsPosted: 234,
      applicationsReceived: 5678,
      activeJobs: 23,
      mrr: 2499,
      contactName: "Sarah Johnson",
      contactEmail: "sarah.j@techcorp.com",
      contactPhone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      website: "techcorp.com",
      lastActive: "2 hours ago",
    },
    {
      id: "2",
      name: "StartupXYZ",
      logo: "SX",
      industry: "E-commerce",
      size: "50-100",
      status: "active",
      plan: "professional",
      joinedDate: "2023-06-20",
      expiryDate: "2024-12-20",
      users: 12,
      jobsPosted: 89,
      applicationsReceived: 1456,
      activeJobs: 8,
      mrr: 499,
      contactName: "Mike Chen",
      contactEmail: "mike@startupxyz.com",
      contactPhone: "+1 (555) 234-5678",
      location: "Austin, TX",
      website: "startupxyz.com",
      lastActive: "1 day ago",
    },
    {
      id: "3",
      name: "Digital Solutions Ltd",
      logo: "DS",
      industry: "Consulting",
      size: "100-500",
      status: "active",
      plan: "professional",
      joinedDate: "2023-03-10",
      expiryDate: "2025-03-10",
      users: 28,
      jobsPosted: 156,
      applicationsReceived: 3245,
      activeJobs: 15,
      mrr: 499,
      contactName: "Emily Rodriguez",
      contactEmail: "emily@digitalsolutions.com",
      contactPhone: "+1 (555) 345-6789",
      location: "New York, NY",
      website: "digitalsolutions.com",
      lastActive: "3 hours ago",
    },
    {
      id: "4",
      name: "GrowthHackers",
      logo: "GH",
      industry: "Marketing",
      size: "10-50",
      status: "trial",
      plan: "trial",
      joinedDate: "2024-11-01",
      expiryDate: "2024-11-15",
      users: 5,
      jobsPosted: 12,
      applicationsReceived: 234,
      activeJobs: 3,
      mrr: 0,
      contactName: "David Kim",
      contactEmail: "david@growthhackers.io",
      contactPhone: "+1 (555) 456-7890",
      location: "Seattle, WA",
      website: "growthhackers.io",
      lastActive: "30 minutes ago",
    },
    {
      id: "5",
      name: "Enterprise Co.",
      logo: "EC",
      industry: "Manufacturing",
      size: "1000+",
      status: "active",
      plan: "enterprise",
      joinedDate: "2022-09-05",
      expiryDate: "2025-09-05",
      users: 120,
      jobsPosted: 567,
      applicationsReceived: 12345,
      activeJobs: 45,
      mrr: 4999,
      contactName: "Robert Smith",
      contactEmail: "r.smith@enterpriseco.com",
      contactPhone: "+1 (555) 567-8901",
      location: "Chicago, IL",
      website: "enterpriseco.com",
      lastActive: "5 hours ago",
    },
    {
      id: "6",
      name: "HealthTech Solutions",
      logo: "HT",
      industry: "Healthcare",
      size: "100-500",
      status: "active",
      plan: "professional",
      joinedDate: "2023-08-12",
      expiryDate: "2024-12-12",
      users: 22,
      jobsPosted: 98,
      applicationsReceived: 1987,
      activeJobs: 12,
      mrr: 499,
      contactName: "Dr. Lisa Wang",
      contactEmail: "lisa.wang@healthtech.com",
      contactPhone: "+1 (555) 678-9012",
      location: "Boston, MA",
      website: "healthtech.com",
      lastActive: "1 hour ago",
    },
    {
      id: "7",
      name: "FinanceFirst",
      logo: "FF",
      industry: "Finance",
      size: "500-1000",
      status: "active",
      plan: "enterprise",
      joinedDate: "2023-02-28",
      expiryDate: "2025-02-28",
      users: 67,
      jobsPosted: 289,
      applicationsReceived: 6789,
      activeJobs: 28,
      mrr: 2499,
      contactName: "James Anderson",
      contactEmail: "j.anderson@financefirst.com",
      contactPhone: "+1 (555) 789-0123",
      location: "New York, NY",
      website: "financefirst.com",
      lastActive: "4 hours ago",
    },
    {
      id: "8",
      name: "CreativeAgency",
      logo: "CA",
      industry: "Marketing",
      size: "50-100",
      status: "active",
      plan: "basic",
      joinedDate: "2023-10-05",
      expiryDate: "2024-12-05",
      users: 8,
      jobsPosted: 45,
      applicationsReceived: 678,
      activeJobs: 5,
      mrr: 199,
      contactName: "Anna Martinez",
      contactEmail: "anna@creativeagency.co",
      contactPhone: "+1 (555) 890-1234",
      location: "Los Angeles, CA",
      website: "creativeagency.co",
      lastActive: "2 days ago",
    },
    {
      id: "9",
      name: "RetailCorp",
      logo: "RC",
      industry: "Retail",
      size: "1000+",
      status: "suspended",
      plan: "professional",
      joinedDate: "2023-04-20",
      expiryDate: "2024-11-20",
      users: 34,
      jobsPosted: 178,
      applicationsReceived: 2345,
      activeJobs: 0,
      mrr: 0,
      contactName: "Tom Wilson",
      contactEmail: "tom.w@retailcorp.com",
      contactPhone: "+1 (555) 901-2345",
      location: "Miami, FL",
      website: "retailcorp.com",
      lastActive: "30 days ago",
    },
    {
      id: "10",
      name: "EduLearn Platform",
      logo: "EP",
      industry: "Education",
      size: "100-500",
      status: "churned",
      plan: "basic",
      joinedDate: "2022-11-10",
      expiryDate: "2024-10-10",
      users: 0,
      jobsPosted: 123,
      applicationsReceived: 1567,
      activeJobs: 0,
      mrr: 0,
      contactName: "Rachel Green",
      contactEmail: "rachel@edulearn.com",
      contactPhone: "+1 (555) 012-3456",
      location: "Philadelphia, PA",
      website: "edulearn.com",
      lastActive: "90 days ago",
    },
  ];

  const getStatusColor = (status: CompanyStatus) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "trial":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "suspended":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "churned":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPlanColor = (plan: SubscriptionPlan) => {
    switch (plan) {
      case "enterprise":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "professional":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "basic":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "trial":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === "all" || company.status === filterStatus;
    const matchesPlan = filterPlan === "all" || company.plan === filterPlan;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const stats = {
    total: companies.length,
    active: companies.filter((c) => c.status === "active").length,
    trial: companies.filter((c) => c.status === "trial").length,
    suspended: companies.filter((c) => c.status === "suspended").length,
    churned: companies.filter((c) => c.status === "churned").length,
    totalMRR: companies.filter((c) => c.status === "active").reduce((sum, c) => sum + c.mrr, 0),
    totalUsers: companies.reduce((sum, c) => sum + c.users, 0),
    totalJobs: companies.reduce((sum, c) => sum + c.activeJobs, 0),
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Persona Recruit</h1>
              <p className="text-xs text-muted-foreground">Platform Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <a href="/platform-admin/dashboard" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </a>
          <a href="/platform-admin/companies" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground">
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
            <Avatar className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center font-semibold">
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
                <h2 className="text-2xl font-bold">Companies</h2>
                <p className="text-muted-foreground">
                  Manage all companies on the platform
                </p>
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Company
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-6 gap-3">
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <Building2 className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Active</p>
                      <p className="text-2xl font-bold">{stats.active}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Trial</p>
                      <p className="text-2xl font-bold">{stats.trial}</p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">MRR</p>
                      <p className="text-2xl font-bold">${(stats.totalMRR / 1000).toFixed(1)}k</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Users</p>
                      <p className="text-2xl font-bold">{stats.totalUsers}</p>
                    </div>
                    <Users className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Active Jobs</p>
                      <p className="text-2xl font-bold">{stats.totalJobs}</p>
                    </div>
                    <Briefcase className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by company name, industry, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="churned">Churned</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPlan} onValueChange={setFilterPlan}>
                  <SelectTrigger className="w-48">
                    <CreditCard className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Companies Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Companies ({filteredCompanies.length})</CardTitle>
              <CardDescription>
                Manage company accounts and subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Active Jobs</TableHead>
                    <TableHead>MRR</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.map((company) => (
                    <TableRow key={company.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                            {company.logo}
                          </Avatar>
                          <div>
                            <p className="font-medium">{company.name}</p>
                            <p className="text-xs text-muted-foreground">{company.size} employees</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{company.industry}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`border ${getPlanColor(company.plan)}`}>
                          {company.plan.charAt(0).toUpperCase() + company.plan.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`border ${getStatusColor(company.status)}`}>
                          {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="w-3 h-3 text-muted-foreground" />
                          {company.users}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Briefcase className="w-3 h-3 text-muted-foreground" />
                          {company.activeJobs}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">${company.mrr}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{company.joinedDate}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{company.lastActive}</span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCompany(company);
                            setDetailsOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredCompanies.length === 0 && (
                <div className="py-12 text-center">
                  <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">No companies found</h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Company Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedCompany && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 bg-primary text-primary-foreground flex items-center justify-center font-bold text-2xl">
                      {selectedCompany.logo}
                    </Avatar>
                    <div>
                      <DialogTitle className="text-2xl">{selectedCompany.name}</DialogTitle>
                      <DialogDescription>
                        {selectedCompany.industry} • {selectedCompany.size} employees
                      </DialogDescription>
                      <div className="flex gap-2 mt-2">
                        <Badge className={`border ${getPlanColor(selectedCompany.plan)}`}>
                          {selectedCompany.plan.charAt(0).toUpperCase() + selectedCompany.plan.slice(1)}
                        </Badge>
                        <Badge className={`border ${getStatusColor(selectedCompany.status)}`}>
                          {selectedCompany.status.charAt(0).toUpperCase() + selectedCompany.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Ban className="w-4 h-4 mr-2" />
                      Suspend
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="overview" className="mt-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="subscription">Subscription</TabsTrigger>
                  <TabsTrigger value="usage">Usage Stats</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Users</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{selectedCompany.users}</p>
                        <p className="text-xs text-muted-foreground">Active accounts</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Jobs Posted</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{selectedCompany.jobsPosted}</p>
                        <p className="text-xs text-muted-foreground">{selectedCompany.activeJobs} currently active</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Applications</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{selectedCompany.applicationsReceived.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Total received</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">MRR</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">${selectedCompany.mrr}</p>
                        <p className="text-xs text-muted-foreground">Monthly recurring revenue</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="subscription" className="space-y-4">
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Current Plan</p>
                          <p className="text-lg font-semibold">
                            {selectedCompany.plan.charAt(0).toUpperCase() + selectedCompany.plan.slice(1)}
                          </p>
                        </div>
                        <Badge className={`border ${getPlanColor(selectedCompany.plan)}`}>
                          {selectedCompany.plan.charAt(0).toUpperCase() + selectedCompany.plan.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <p className="text-sm text-muted-foreground">Joined Date</p>
                          <p className="text-lg font-semibold">{selectedCompany.joinedDate}</p>
                        </div>
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <p className="text-sm text-muted-foreground">Expiry Date</p>
                          <p className="text-lg font-semibold">{selectedCompany.expiryDate}</p>
                        </div>
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                          <p className="text-lg font-semibold">${selectedCompany.mrr}</p>
                        </div>
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="usage" className="space-y-4">
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Jobs Posted</p>
                          <p className="text-lg font-semibold">{selectedCompany.jobsPosted}</p>
                        </div>
                        <Briefcase className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <p className="text-sm text-muted-foreground">Active Jobs</p>
                          <p className="text-lg font-semibold">{selectedCompany.activeJobs}</p>
                        </div>
                        <Briefcase className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <p className="text-sm text-muted-foreground">Applications Received</p>
                          <p className="text-lg font-semibold">{selectedCompany.applicationsReceived.toLocaleString()}</p>
                        </div>
                        <FileText className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <p className="text-sm text-muted-foreground">Last Active</p>
                          <p className="text-lg font-semibold">{selectedCompany.lastActive}</p>
                        </div>
                        <Clock className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Contact Person</p>
                        <p className="text-lg font-semibold">{selectedCompany.contactName}</p>
                      </div>
                      <div className="flex items-center gap-2 pt-4 border-t">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{selectedCompany.contactEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-4 border-t">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium">{selectedCompany.contactPhone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-4 border-t">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p className="font-medium">{selectedCompany.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-4 border-t">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Website</p>
                          <p className="font-medium">{selectedCompany.website}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
