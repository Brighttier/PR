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
  UserCheck,
  UserX,
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
  Briefcase,
  Download,
  BarChart3,
  Settings,
  Shield,
  Activity,
  TrendingUp,
  Plus,
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
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type UserRole = "candidate" | "recruiter" | "interviewer" | "hr_admin" | "platform_admin";
type UserStatus = "active" | "inactive" | "suspended" | "pending";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  status: UserStatus;
  company: string;
  companyId: string;
  joinedDate: string;
  lastActive: string;
  location: string;
  phone: string;
  jobsPosted?: number;
  applicationsSubmitted?: number;
  interviewsConducted?: number;
  loginCount: number;
  deviceType: string;
}

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Mock data
  const users: User[] = [
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah.j@techcorp.com",
      avatar: "SJ",
      role: "recruiter",
      status: "active",
      company: "TechCorp Inc.",
      companyId: "1",
      joinedDate: "2023-01-15",
      lastActive: "2 hours ago",
      location: "San Francisco, CA",
      phone: "+1 (555) 123-4567",
      jobsPosted: 45,
      loginCount: 234,
      deviceType: "Desktop",
    },
    {
      id: "2",
      name: "John Candidate",
      email: "john.c@email.com",
      avatar: "JC",
      role: "candidate",
      status: "active",
      company: "N/A",
      companyId: "0",
      joinedDate: "2023-06-20",
      lastActive: "1 day ago",
      location: "New York, NY",
      phone: "+1 (555) 234-5678",
      applicationsSubmitted: 23,
      loginCount: 156,
      deviceType: "Mobile",
    },
    {
      id: "3",
      name: "Mike Chen",
      email: "mike@startupxyz.com",
      avatar: "MC",
      role: "hr_admin",
      status: "active",
      company: "StartupXYZ",
      companyId: "2",
      joinedDate: "2023-06-20",
      lastActive: "30 minutes ago",
      location: "Austin, TX",
      phone: "+1 (555) 345-6789",
      jobsPosted: 12,
      loginCount: 89,
      deviceType: "Desktop",
    },
    {
      id: "4",
      name: "Emily Rodriguez",
      email: "emily@digitalsolutions.com",
      avatar: "ER",
      role: "recruiter",
      status: "active",
      company: "Digital Solutions Ltd",
      companyId: "3",
      joinedDate: "2023-03-10",
      lastActive: "3 hours ago",
      location: "New York, NY",
      phone: "+1 (555) 456-7890",
      jobsPosted: 28,
      loginCount: 178,
      deviceType: "Desktop",
    },
    {
      id: "5",
      name: "Dr. Lisa Wang",
      email: "lisa.wang@healthtech.com",
      avatar: "LW",
      role: "interviewer",
      status: "active",
      company: "HealthTech Solutions",
      companyId: "6",
      joinedDate: "2023-08-12",
      lastActive: "1 hour ago",
      location: "Boston, MA",
      phone: "+1 (555) 567-8901",
      interviewsConducted: 67,
      loginCount: 134,
      deviceType: "Tablet",
    },
    {
      id: "6",
      name: "James Anderson",
      email: "j.anderson@financefirst.com",
      avatar: "JA",
      role: "hr_admin",
      status: "active",
      company: "FinanceFirst",
      companyId: "7",
      joinedDate: "2023-02-28",
      lastActive: "4 hours ago",
      location: "New York, NY",
      phone: "+1 (555) 678-9012",
      jobsPosted: 34,
      loginCount: 245,
      deviceType: "Desktop",
    },
    {
      id: "7",
      name: "Anna Martinez",
      email: "anna@creativeagency.co",
      avatar: "AM",
      role: "recruiter",
      status: "active",
      company: "CreativeAgency",
      companyId: "8",
      joinedDate: "2023-10-05",
      lastActive: "2 days ago",
      location: "Los Angeles, CA",
      phone: "+1 (555) 789-0123",
      jobsPosted: 8,
      loginCount: 67,
      deviceType: "Mobile",
    },
    {
      id: "8",
      name: "Robert Smith",
      email: "r.smith@enterpriseco.com",
      avatar: "RS",
      role: "hr_admin",
      status: "active",
      company: "Enterprise Co.",
      companyId: "5",
      joinedDate: "2022-09-05",
      lastActive: "5 hours ago",
      location: "Chicago, IL",
      phone: "+1 (555) 890-1234",
      jobsPosted: 89,
      loginCount: 567,
      deviceType: "Desktop",
    },
    {
      id: "9",
      name: "David Kim",
      email: "david@growthhackers.io",
      avatar: "DK",
      role: "recruiter",
      status: "pending",
      company: "GrowthHackers",
      companyId: "4",
      joinedDate: "2024-11-01",
      lastActive: "30 minutes ago",
      location: "Seattle, WA",
      phone: "+1 (555) 901-2345",
      jobsPosted: 2,
      loginCount: 12,
      deviceType: "Desktop",
    },
    {
      id: "10",
      name: "Rachel Green",
      email: "rachel@edulearn.com",
      avatar: "RG",
      role: "recruiter",
      status: "inactive",
      company: "EduLearn Platform",
      companyId: "10",
      joinedDate: "2022-11-10",
      lastActive: "90 days ago",
      location: "Philadelphia, PA",
      phone: "+1 (555) 012-3456",
      jobsPosted: 15,
      loginCount: 89,
      deviceType: "Desktop",
    },
    {
      id: "11",
      name: "Tom Wilson",
      email: "tom.w@retailcorp.com",
      avatar: "TW",
      role: "recruiter",
      status: "suspended",
      company: "RetailCorp",
      companyId: "9",
      joinedDate: "2023-04-20",
      lastActive: "30 days ago",
      location: "Miami, FL",
      phone: "+1 (555) 123-4567",
      jobsPosted: 23,
      loginCount: 145,
      deviceType: "Desktop",
    },
    {
      id: "12",
      name: "Maria Garcia",
      email: "maria.g@email.com",
      avatar: "MG",
      role: "candidate",
      status: "active",
      company: "N/A",
      companyId: "0",
      joinedDate: "2023-09-15",
      lastActive: "5 hours ago",
      location: "Miami, FL",
      phone: "+1 (555) 234-5678",
      applicationsSubmitted: 45,
      loginCount: 234,
      deviceType: "Mobile",
    },
    {
      id: "13",
      name: "Alex Thompson",
      email: "alex.t@email.com",
      avatar: "AT",
      role: "candidate",
      status: "active",
      company: "N/A",
      companyId: "0",
      joinedDate: "2023-07-22",
      lastActive: "12 hours ago",
      location: "San Francisco, CA",
      phone: "+1 (555) 345-6789",
      applicationsSubmitted: 67,
      loginCount: 345,
      deviceType: "Desktop",
    },
    {
      id: "14",
      name: "Jennifer Lee",
      email: "jennifer.l@techcorp.com",
      avatar: "JL",
      role: "interviewer",
      status: "active",
      company: "TechCorp Inc.",
      companyId: "1",
      joinedDate: "2023-02-10",
      lastActive: "1 hour ago",
      location: "San Francisco, CA",
      phone: "+1 (555) 456-7890",
      interviewsConducted: 123,
      loginCount: 289,
      deviceType: "Desktop",
    },
    {
      id: "15",
      name: "Platform Admin",
      email: "admin@persona-recruit.com",
      avatar: "PA",
      role: "platform_admin",
      status: "active",
      company: "Persona Recruit",
      companyId: "0",
      joinedDate: "2022-01-01",
      lastActive: "Just now",
      location: "Remote",
      phone: "+1 (555) 567-8901",
      loginCount: 1234,
      deviceType: "Desktop",
    },
  ];

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "platform_admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "hr_admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "recruiter":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "interviewer":
        return "bg-green-100 text-green-800 border-green-200";
      case "candidate":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "platform_admin":
        return "Platform Admin";
      case "hr_admin":
        return "HR Admin";
      case "recruiter":
        return "Recruiter";
      case "interviewer":
        return "Interviewer";
      case "candidate":
        return "Candidate";
      default:
        return role;
    }
  };

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "suspended":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.company.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    inactive: users.filter((u) => u.status === "inactive").length,
    suspended: users.filter((u) => u.status === "suspended").length,
    pending: users.filter((u) => u.status === "pending").length,
    candidates: users.filter((u) => u.role === "candidate").length,
    recruiters: users.filter((u) => u.role === "recruiter").length,
    interviewers: users.filter((u) => u.role === "interviewer").length,
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
          <a href="/platform-admin/companies" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <Building2 className="w-5 h-5" />
            <span className="font-medium">Companies</span>
          </a>
          <a href="/platform-admin/users" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground">
            <Users className="w-5 h-5" />
            <span className="font-medium">Users</span>
            <Badge variant="secondary" className="ml-auto">
              {users.length}
            </Badge>
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
                <h2 className="text-2xl font-bold">Users</h2>
                <p className="text-muted-foreground">
                  Manage all users across the platform
                </p>
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-6 gap-3">
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Users</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <Users className="w-8 h-8 text-muted-foreground" />
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
                    <UserCheck className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Candidates</p>
                      <p className="text-2xl font-bold">{stats.candidates}</p>
                    </div>
                    <Users className="w-8 h-8 text-gray-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Recruiters</p>
                      <p className="text-2xl font-bold">{stats.recruiters}</p>
                    </div>
                    <Briefcase className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Interviewers</p>
                      <p className="text-2xl font-bold">{stats.interviewers}</p>
                    </div>
                    <UserCheck className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Suspended</p>
                      <p className="text-2xl font-bold">{stats.suspended}</p>
                    </div>
                    <UserX className="w-8 h-8 text-red-600" />
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
                    placeholder="Search by name, email, or company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-48">
                    <Shield className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="candidate">Candidate</SelectItem>
                    <SelectItem value="recruiter">Recruiter</SelectItem>
                    <SelectItem value="interviewer">Interviewer</SelectItem>
                    <SelectItem value="hr_admin">HR Admin</SelectItem>
                    <SelectItem value="platform_admin">Platform Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Users ({filteredUsers.length})</CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                            {user.avatar}
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`border ${getRoleColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{user.company}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`border ${getStatusColor(user.status)}`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          {user.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.jobsPosted !== undefined && (
                            <span className="text-muted-foreground">{user.jobsPosted} jobs</span>
                          )}
                          {user.applicationsSubmitted !== undefined && (
                            <span className="text-muted-foreground">{user.applicationsSubmitted} apps</span>
                          )}
                          {user.interviewsConducted !== undefined && (
                            <span className="text-muted-foreground">{user.interviewsConducted} interviews</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{user.joinedDate}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{user.lastActive}</span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
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

              {filteredUsers.length === 0 && (
                <div className="py-12 text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">No users found</h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* User Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedUser && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 bg-primary text-primary-foreground flex items-center justify-center font-bold text-2xl">
                      {selectedUser.avatar}
                    </Avatar>
                    <div>
                      <DialogTitle className="text-2xl">{selectedUser.name}</DialogTitle>
                      <DialogDescription>{selectedUser.email}</DialogDescription>
                      <div className="flex gap-2 mt-2">
                        <Badge className={`border ${getRoleColor(selectedUser.role)}`}>
                          {getRoleLabel(selectedUser.role)}
                        </Badge>
                        <Badge className={`border ${getStatusColor(selectedUser.status)}`}>
                          {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    {selectedUser.status !== "suspended" && (
                      <Button variant="outline" size="sm">
                        <Ban className="w-4 h-4 mr-2" />
                        Suspend
                      </Button>
                    )}
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="overview" className="mt-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="company">Company</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Account Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold mb-2">
                          {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Joined {selectedUser.joinedDate}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Login Count</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold mb-2">{selectedUser.loginCount}</p>
                        <p className="text-xs text-muted-foreground">
                          Last: {selectedUser.lastActive}
                        </p>
                      </CardContent>
                    </Card>
                    {selectedUser.jobsPosted !== undefined && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Jobs Posted</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-bold">{selectedUser.jobsPosted}</p>
                        </CardContent>
                      </Card>
                    )}
                    {selectedUser.applicationsSubmitted !== undefined && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Applications</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-bold">{selectedUser.applicationsSubmitted}</p>
                        </CardContent>
                      </Card>
                    )}
                    {selectedUser.interviewsConducted !== undefined && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Interviews Conducted</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-bold">{selectedUser.interviewsConducted}</p>
                        </CardContent>
                      </Card>
                    )}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Device Type</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{selectedUser.deviceType}</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Logins</p>
                          <p className="text-lg font-semibold">{selectedUser.loginCount}</p>
                        </div>
                        <Activity className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <p className="text-sm text-muted-foreground">Last Active</p>
                          <p className="text-lg font-semibold">{selectedUser.lastActive}</p>
                        </div>
                        <Clock className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <p className="text-sm text-muted-foreground">Device Type</p>
                          <p className="text-lg font-semibold">{selectedUser.deviceType}</p>
                        </div>
                        <Activity className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <p className="text-sm text-muted-foreground">Join Date</p>
                          <p className="text-lg font-semibold">{selectedUser.joinedDate}</p>
                        </div>
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{selectedUser.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-4 border-t">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium">{selectedUser.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-4 border-t">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p className="font-medium">{selectedUser.location}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="company" className="space-y-4">
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Company</p>
                          <p className="font-medium">{selectedUser.company}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-4 border-t">
                        <Shield className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Role</p>
                          <p className="font-medium">{getRoleLabel(selectedUser.role)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-4 border-t">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Joined Company</p>
                          <p className="font-medium">{selectedUser.joinedDate}</p>
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
