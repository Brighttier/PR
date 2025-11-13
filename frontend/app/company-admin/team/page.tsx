"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Search,
  UserPlus,
  MoreVertical,
  Mail,
  Shield,
  Crown,
  User,
  UserCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Copy,
  Trash2,
  Edit,
  BarChart3,
  Briefcase,
  FileText,
  Users,
  Settings,
  Calendar,
  Folder,
  AlertCircle,
  Ban,
  RefreshCw,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

type UserRole = "admin" | "recruiter" | "interviewer" | "hiring_manager";
type UserStatus = "active" | "invited" | "suspended" | "inactive";

interface TeamMember {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  status: UserStatus;
  department: string;
  joinedDate: string;
  lastActive: string;
  applicationsReviewed: number;
  interviewsConducted: number;
  permissions: string[];
}

interface PendingInvite {
  id: number;
  email: string;
  role: UserRole;
  invitedBy: string;
  invitedDate: string;
  expiresDate: string;
  status: "pending" | "expired";
}

export default function CompanyAdminTeamPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("recruiter");
  const [inviteMessage, setInviteMessage] = useState("");
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);

  // Mock team members data
  const teamMembers: TeamMember[] = [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@techcorp.com",
      avatar: "",
      role: "admin",
      status: "active",
      department: "HR",
      joinedDate: "Jan 15, 2023",
      lastActive: "2 hours ago",
      applicationsReviewed: 234,
      interviewsConducted: 45,
      permissions: ["manage_team", "manage_jobs", "manage_applications", "view_analytics"],
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.johnson@techcorp.com",
      avatar: "",
      role: "recruiter",
      status: "active",
      department: "Engineering",
      joinedDate: "Mar 20, 2023",
      lastActive: "30 minutes ago",
      applicationsReviewed: 189,
      interviewsConducted: 32,
      permissions: ["manage_jobs", "manage_applications", "schedule_interviews"],
    },
    {
      id: 3,
      name: "Michael Chen",
      email: "michael.chen@techcorp.com",
      avatar: "",
      role: "interviewer",
      status: "active",
      department: "Engineering",
      joinedDate: "Apr 10, 2023",
      lastActive: "1 day ago",
      applicationsReviewed: 0,
      interviewsConducted: 67,
      permissions: ["view_applications", "conduct_interviews", "submit_feedback"],
    },
    {
      id: 4,
      name: "Emily Rodriguez",
      email: "emily.rodriguez@techcorp.com",
      avatar: "",
      role: "recruiter",
      status: "active",
      department: "Design",
      joinedDate: "May 5, 2023",
      lastActive: "5 hours ago",
      applicationsReviewed: 145,
      interviewsConducted: 28,
      permissions: ["manage_jobs", "manage_applications", "schedule_interviews"],
    },
    {
      id: 5,
      name: "David Kim",
      email: "david.kim@techcorp.com",
      avatar: "",
      role: "hiring_manager",
      status: "active",
      department: "Product",
      joinedDate: "Jun 12, 2023",
      lastActive: "3 hours ago",
      applicationsReviewed: 98,
      interviewsConducted: 41,
      permissions: ["view_applications", "approve_offers", "conduct_interviews"],
    },
    {
      id: 6,
      name: "Jessica Taylor",
      email: "jessica.taylor@techcorp.com",
      avatar: "",
      role: "interviewer",
      status: "active",
      department: "Marketing",
      joinedDate: "Jul 8, 2023",
      lastActive: "2 days ago",
      applicationsReviewed: 0,
      interviewsConducted: 23,
      permissions: ["view_applications", "conduct_interviews", "submit_feedback"],
    },
    {
      id: 7,
      name: "Robert Anderson",
      email: "robert.anderson@techcorp.com",
      avatar: "",
      role: "recruiter",
      status: "suspended",
      department: "Engineering",
      joinedDate: "Feb 14, 2023",
      lastActive: "2 weeks ago",
      applicationsReviewed: 76,
      interviewsConducted: 15,
      permissions: [],
    },
    {
      id: 8,
      name: "Amanda White",
      email: "amanda.white@techcorp.com",
      avatar: "",
      role: "interviewer",
      status: "invited",
      department: "Sales",
      joinedDate: "",
      lastActive: "",
      applicationsReviewed: 0,
      interviewsConducted: 0,
      permissions: [],
    },
  ];

  const pendingInvites: PendingInvite[] = [
    {
      id: 1,
      email: "chris.martinez@email.com",
      role: "recruiter",
      invitedBy: "John Smith",
      invitedDate: "Jan 10, 2024",
      expiresDate: "Jan 17, 2024",
      status: "pending",
    },
    {
      id: 2,
      email: "lisa.wong@email.com",
      role: "interviewer",
      invitedBy: "Sarah Johnson",
      invitedDate: "Jan 8, 2024",
      expiresDate: "Jan 15, 2024",
      status: "pending",
    },
    {
      id: 3,
      email: "old.invite@email.com",
      role: "recruiter",
      invitedBy: "John Smith",
      invitedDate: "Dec 20, 2023",
      expiresDate: "Dec 27, 2023",
      status: "expired",
    },
  ];

  const stats = {
    total: teamMembers.length,
    active: teamMembers.filter((m) => m.status === "active").length,
    pending: teamMembers.filter((m) => m.status === "invited").length + pendingInvites.filter((i) => i.status === "pending").length,
    admins: teamMembers.filter((m) => m.role === "admin").length,
  };

  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: UserRole) => {
    const styles = {
      admin: "bg-purple-50 text-purple-700 border-purple-200",
      recruiter: "bg-blue-50 text-blue-700 border-blue-200",
      interviewer: "bg-green-50 text-green-700 border-green-200",
      hiring_manager: "bg-orange-50 text-orange-700 border-orange-200",
    };
    return styles[role];
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "admin":
        return <Crown className="w-3 h-3 mr-1" />;
      case "recruiter":
        return <UserCheck className="w-3 h-3 mr-1" />;
      case "interviewer":
        return <User className="w-3 h-3 mr-1" />;
      case "hiring_manager":
        return <Shield className="w-3 h-3 mr-1" />;
    }
  };

  const getRoleLabel = (role: UserRole) => {
    const labels = {
      admin: "Admin",
      recruiter: "Recruiter",
      interviewer: "Interviewer",
      hiring_manager: "Hiring Manager",
    };
    return labels[role];
  };

  const getStatusBadge = (status: UserStatus) => {
    const styles = {
      active: "bg-green-50 text-green-700 border-green-200",
      invited: "bg-yellow-50 text-yellow-700 border-yellow-200",
      suspended: "bg-red-50 text-red-700 border-red-200",
      inactive: "bg-gray-50 text-gray-700 border-gray-200",
    };
    return styles[status];
  };

  const handleInviteMember = () => {
    console.log("Inviting member:", { inviteEmail, inviteRole, inviteMessage, sendWelcomeEmail });
    // In production, send invite to backend
    setShowInviteDialog(false);
    // Reset form
    setInviteEmail("");
    setInviteRole("recruiter");
    setInviteMessage("");
    setSendWelcomeEmail(true);
  };

  const handleEditMember = (member: TeamMember) => {
    setSelectedMember(member);
    setShowEditDialog(true);
  };

  const handleResendInvite = (invite: PendingInvite) => {
    console.log("Resending invite to:", invite.email);
  };

  const handleCancelInvite = (invite: PendingInvite) => {
    console.log("Canceling invite to:", invite.email);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">Company Admin</h2>
              <p className="text-xs text-muted-foreground">TechCorp Inc.</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <a
            href="/company-admin/dashboard"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted"
          >
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </a>
          <a
            href="/company-admin/jobs"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted"
          >
            <Briefcase className="w-5 h-5" />
            <span className="font-medium">Jobs</span>
          </a>
          <a
            href="/company-admin/applications"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted"
          >
            <FileText className="w-5 h-5" />
            <span className="font-medium">Applications</span>
          </a>
          <a
            href="/company-admin/candidates"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted"
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Candidates</span>
          </a>
          <a
            href="/company-admin/team"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground"
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Team</span>
          </a>
          <a
            href="/company-admin/talent-pool"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted"
          >
            <Folder className="w-5 h-5" />
            <span className="font-medium">Talent Pool</span>
          </a>
          <a
            href="/company-admin/calendar"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted"
          >
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Calendar</span>
          </a>
          <a
            href="/company-admin/settings"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Team Management</h1>
                <p className="text-muted-foreground">
                  Manage your team members, roles, and permissions
                </p>
              </div>
              <Button onClick={() => setShowInviteDialog(true)} className="gap-2">
                <UserPlus className="w-4 h-4" />
                Invite Team Member
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Members</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Active</p>
                      <p className="text-2xl font-bold">{stats.active}</p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Pending Invites</p>
                      <p className="text-2xl font-bold">{stats.pending}</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Admins</p>
                      <p className="text-2xl font-bold">{stats.admins}</p>
                    </div>
                    <Crown className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="recruiter">Recruiter</SelectItem>
                  <SelectItem value="interviewer">Interviewer</SelectItem>
                  <SelectItem value="hiring_manager">Hiring Manager</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="invited">Invited</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Team Members Table */}
          <Tabs defaultValue="members" className="space-y-4">
            <TabsList>
              <TabsTrigger value="members">Team Members ({stats.total})</TabsTrigger>
              <TabsTrigger value="invites">Pending Invites ({pendingInvites.filter(i => i.status === "pending").length})</TabsTrigger>
            </TabsList>

            <TabsContent value="members">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead>Activity</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback>
                                  {member.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{member.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {member.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getRoleBadge(member.role)}>
                              {getRoleIcon(member.role)}
                              {getRoleLabel(member.role)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{member.department}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusBadge(member.status)}>
                              {member.status === "active" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                              {member.status === "invited" && <Clock className="w-3 h-3 mr-1" />}
                              {member.status === "suspended" && <Ban className="w-3 h-3 mr-1" />}
                              {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {member.joinedDate || "—"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {member.lastActive || "—"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm space-y-1">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <FileText className="w-3 h-3" />
                                <span>{member.applicationsReviewed} reviews</span>
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Users className="w-3 h-3" />
                                <span>{member.interviewsConducted} interviews</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditMember(member)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Role
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Mail className="w-4 h-4 mr-2" />
                                  Send Email
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {member.status === "active" && (
                                  <DropdownMenuItem className="text-orange-600">
                                    <Ban className="w-4 h-4 mr-2" />
                                    Suspend User
                                  </DropdownMenuItem>
                                )}
                                {member.status === "suspended" && (
                                  <DropdownMenuItem className="text-green-600">
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Activate User
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Remove from Team
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {filteredMembers.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No team members found</h3>
                      <p className="text-muted-foreground mb-4">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="invites">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Invited By</TableHead>
                        <TableHead>Invited Date</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingInvites.map((invite) => (
                        <TableRow key={invite.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{invite.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getRoleBadge(invite.role)}>
                              {getRoleIcon(invite.role)}
                              {getRoleLabel(invite.role)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{invite.invitedBy}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {invite.invitedDate}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {invite.expiresDate}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                invite.status === "pending"
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                              }
                            >
                              {invite.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                              {invite.status === "expired" && <AlertCircle className="w-3 h-3 mr-1" />}
                              {invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleResendInvite(invite)}>
                                  <RefreshCw className="w-4 h-4 mr-2" />
                                  Resend Invite
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="w-4 h-4 mr-2" />
                                  Copy Invite Link
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleCancelInvite(invite)}
                                  className="text-red-600"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Cancel Invite
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {pendingInvites.length === 0 && (
                    <div className="text-center py-12">
                      <Send className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No pending invites</h3>
                      <p className="text-muted-foreground mb-4">
                        All invites have been accepted or expired
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Invite Team Member Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to a new team member to join your organization
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email Address *</Label>
              <Input
                type="email"
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Role *</Label>
              <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-purple-600" />
                      <div>
                        <p className="font-medium">Admin</p>
                        <p className="text-xs text-muted-foreground">
                          Full access to all features and settings
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="recruiter">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="font-medium">Recruiter</p>
                        <p className="text-xs text-muted-foreground">
                          Manage jobs, review applications, schedule interviews
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="interviewer">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="font-medium">Interviewer</p>
                        <p className="text-xs text-muted-foreground">
                          Conduct interviews and submit feedback
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="hiring_manager">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-orange-600" />
                      <div>
                        <p className="font-medium">Hiring Manager</p>
                        <p className="text-xs text-muted-foreground">
                          Approve offers and make hiring decisions
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Personal Message (Optional)</Label>
              <Textarea
                placeholder="Add a personal message to the invitation email..."
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">Send welcome email</p>
                  <p className="text-xs text-muted-foreground">
                    Notify the user via email with invitation details
                  </p>
                </div>
              </div>
              <Switch checked={sendWelcomeEmail} onCheckedChange={setSendWelcomeEmail} />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowInviteDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleInviteMember}
                disabled={!inviteEmail}
                className="flex-1 gap-2"
              >
                <Send className="w-4 h-4" />
                Send Invitation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>
              Update role and permissions for {selectedMember?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedMember && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={selectedMember.avatar} />
                  <AvatarFallback>
                    {selectedMember.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedMember.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedMember.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Select defaultValue={selectedMember.role}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="recruiter">Recruiter</SelectItem>
                    <SelectItem value="interviewer">Interviewer</SelectItem>
                    <SelectItem value="hiring_manager">Hiring Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Department</Label>
                <Input defaultValue={selectedMember.department} />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={() => setShowEditDialog(false)} className="flex-1">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
