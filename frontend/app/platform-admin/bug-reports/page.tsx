"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  AlertTriangle,
  Bug,
  CheckCircle,
  Clock,
  Eye,
  Filter,
  Search,
  User,
  Calendar,
  MessageSquare,
  AlertCircle,
  XCircle,
  ArrowUpRight,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit, updateDoc, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

type BugPriority = "critical" | "high" | "medium" | "low";
type BugStatus = "new" | "in_progress" | "resolved" | "closed";

interface BugReport {
  id: string;
  title: string;
  description: string;
  priority: BugPriority;
  status: BugStatus;
  reportedBy: string;
  reportedByEmail: string;
  companyId?: string;
  companyName?: string;
  createdAt: any;
  updatedAt: any;
  assignedTo?: string;
  category: string;
  page?: string;
  browser?: string;
  os?: string;
  screenshots?: string[];
  reproSteps?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
}

export default function BugReportsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<BugReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<BugReport[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<BugReport | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchBugReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchQuery, filterStatus, filterPriority]);

  const fetchBugReports = async () => {
    try {
      setLoading(true);

      // Mock data for now - in production, fetch from Firestore
      const mockReports: BugReport[] = [
        {
          id: "1",
          title: "Login page crashes on Safari",
          description: "When trying to log in using Safari browser, the page becomes unresponsive after clicking the login button.",
          priority: "critical",
          status: "new",
          reportedBy: "John Doe",
          reportedByEmail: "john@techcorp.com",
          companyId: "comp1",
          companyName: "TechCorp Inc.",
          createdAt: new Date("2024-11-14T10:30:00"),
          updatedAt: new Date("2024-11-14T10:30:00"),
          category: "Authentication",
          page: "/auth/login",
          browser: "Safari 17.1",
          os: "macOS Sonoma 14.5",
          reproSteps: "1. Open Safari\n2. Navigate to login page\n3. Enter credentials\n4. Click login button",
          expectedBehavior: "User should be redirected to dashboard",
          actualBehavior: "Page freezes and becomes unresponsive",
        },
        {
          id: "2",
          title: "Resume upload fails for large PDF files",
          description: "Cannot upload PDF files larger than 5MB despite the limit being 10MB.",
          priority: "high",
          status: "in_progress",
          reportedBy: "Sarah Johnson",
          reportedByEmail: "sarah@startupxyz.com",
          companyId: "comp2",
          companyName: "StartupXYZ",
          createdAt: new Date("2024-11-14T09:15:00"),
          updatedAt: new Date("2024-11-14T11:00:00"),
          assignedTo: "Dev Team",
          category: "File Upload",
          page: "/candidate/profile",
          browser: "Chrome 119",
          os: "Windows 11",
          reproSteps: "1. Go to profile page\n2. Click upload resume\n3. Select PDF file > 5MB\n4. Click upload",
          expectedBehavior: "File should upload successfully up to 10MB",
          actualBehavior: "Upload fails with 'File too large' error",
        },
        {
          id: "3",
          title: "Job posting form validation is too strict",
          description: "Required skills field doesn't accept special characters like C++ or .NET",
          priority: "medium",
          status: "in_progress",
          reportedBy: "Mike Chen",
          reportedByEmail: "mike@digitalsolutions.com",
          companyId: "comp3",
          companyName: "Digital Solutions Ltd",
          createdAt: new Date("2024-11-13T16:20:00"),
          updatedAt: new Date("2024-11-14T08:30:00"),
          assignedTo: "Frontend Team",
          category: "Jobs",
          page: "/dashboard/jobs/new",
          browser: "Firefox 120",
          os: "Ubuntu 22.04",
        },
        {
          id: "4",
          title: "Email notifications are delayed",
          description: "Candidates receive interview invitations 2-3 hours after they're scheduled",
          priority: "high",
          status: "new",
          reportedBy: "Emily Rodriguez",
          reportedByEmail: "emily@healthtech.com",
          companyId: "comp4",
          companyName: "HealthTech Solutions",
          createdAt: new Date("2024-11-13T14:00:00"),
          updatedAt: new Date("2024-11-13T14:00:00"),
          category: "Notifications",
        },
        {
          id: "5",
          title: "Dashboard analytics showing incorrect numbers",
          description: "The total applications count doesn't match the sum of individual job applications",
          priority: "medium",
          status: "resolved",
          reportedBy: "David Kim",
          reportedByEmail: "david@financefirst.com",
          companyId: "comp5",
          companyName: "FinanceFirst",
          createdAt: new Date("2024-11-12T11:30:00"),
          updatedAt: new Date("2024-11-13T15:45:00"),
          assignedTo: "Backend Team",
          category: "Analytics",
          page: "/dashboard",
        },
        {
          id: "6",
          title: "Mobile responsive issue on applications page",
          description: "Table columns overflow on mobile devices making it unreadable",
          priority: "low",
          status: "new",
          reportedBy: "Lisa Wang",
          reportedByEmail: "lisa@creativeagency.co",
          companyId: "comp6",
          companyName: "CreativeAgency",
          createdAt: new Date("2024-11-12T09:00:00"),
          updatedAt: new Date("2024-11-12T09:00:00"),
          category: "UI/UX",
          page: "/dashboard/applications",
          browser: "Mobile Safari",
          os: "iOS 17",
        },
        {
          id: "7",
          title: "AI matching scores inconsistent",
          description: "Same candidate gets different match scores for the same job when application is resubmitted",
          priority: "critical",
          status: "in_progress",
          reportedBy: "Robert Smith",
          reportedByEmail: "r.smith@enterpriseco.com",
          companyId: "comp7",
          companyName: "Enterprise Co.",
          createdAt: new Date("2024-11-11T13:45:00"),
          updatedAt: new Date("2024-11-13T10:00:00"),
          assignedTo: "AI Team",
          category: "AI/ML",
        },
        {
          id: "8",
          title: "Search functionality not working for special characters",
          description: "Cannot search for candidates with names containing accents or apostrophes",
          priority: "medium",
          status: "resolved",
          reportedBy: "Anna Martinez",
          reportedByEmail: "anna@retailcorp.com",
          companyId: "comp8",
          companyName: "RetailCorp",
          createdAt: new Date("2024-11-10T15:20:00"),
          updatedAt: new Date("2024-11-12T11:30:00"),
          category: "Search",
          page: "/dashboard/candidates",
        },
      ];

      setReports(mockReports);
    } catch (error) {
      console.error("Error fetching bug reports:", error);
      toast({
        title: "Error",
        description: "Failed to load bug reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = [...reports];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        report =>
          report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(report => report.status === filterStatus);
    }

    // Priority filter
    if (filterPriority !== "all") {
      filtered = filtered.filter(report => report.priority === filterPriority);
    }

    setFilteredReports(filtered);
  };

  const handleStatusChange = async (reportId: string, newStatus: BugStatus) => {
    try {
      // In production, update Firestore
      setReports(prev =>
        prev.map(report =>
          report.id === reportId
            ? { ...report, status: newStatus, updatedAt: new Date() }
            : report
        )
      );

      toast({
        title: "Success",
        description: "Bug report status updated",
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: BugPriority) => {
    switch (priority) {
      case "critical":
        return "bg-red-50 text-red-700 border-red-200";
      case "high":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "medium":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  const getPriorityIcon = (priority: BugPriority) => {
    switch (priority) {
      case "critical":
        return <XCircle className="w-4 h-4" />;
      case "high":
        return <AlertTriangle className="w-4 h-4" />;
      case "medium":
        return <AlertCircle className="w-4 h-4" />;
      case "low":
        return <ArrowUpRight className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: BugStatus) => {
    switch (status) {
      case "new":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "in_progress":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "resolved":
        return "bg-green-50 text-green-700 border-green-200";
      case "closed":
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    try {
      const d = date instanceof Date ? date : date.toDate();
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    } catch {
      return "N/A";
    }
  };

  const stats = {
    total: reports.length,
    new: reports.filter(r => r.status === "new").length,
    inProgress: reports.filter(r => r.status === "in_progress").length,
    resolved: reports.filter(r => r.status === "resolved").length,
    critical: reports.filter(r => r.priority === "critical").length,
    high: reports.filter(r => r.priority === "high").length,
  };

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
          <h2 className="text-3xl font-bold">Bug Reports</h2>
          <p className="text-muted-foreground mt-1">
            User-submitted bug reports and issues
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Reports</p>
                <h3 className="text-3xl font-bold mb-1">{stats.total}</h3>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <Bug className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">New</p>
                <h3 className="text-3xl font-bold mb-1">{stats.new}</h3>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">In Progress</p>
                <h3 className="text-3xl font-bold mb-1">{stats.inProgress}</h3>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50">
                <MessageSquare className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Resolved</p>
                <h3 className="text-3xl font-bold mb-1">{stats.resolved}</h3>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Critical</p>
                <h3 className="text-3xl font-bold mb-1">{stats.critical}</h3>
              </div>
              <div className="p-3 rounded-lg bg-red-50">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">High Priority</p>
                <h3 className="text-3xl font-bold mb-1">{stats.high}</h3>
              </div>
              <div className="p-3 rounded-lg bg-orange-50">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, description, or category..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-48">
                <AlertTriangle className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bug Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bug Reports ({filteredReports.length})</CardTitle>
          <CardDescription>Manage and track bug reports from users</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <Bug className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No bug reports found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bug Details</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Reported By</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map(report => (
                  <TableRow key={report.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <p className="font-medium">{report.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {report.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`border ${getPriorityColor(report.priority)}`}>
                        <span className="flex items-center gap-1">
                          {getPriorityIcon(report.priority)}
                          {report.priority.charAt(0).toUpperCase() + report.priority.slice(1)}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={report.status}
                        onValueChange={(value: BugStatus) =>
                          handleStatusChange(report.id, value)
                        }
                      >
                        <SelectTrigger className="w-40">
                          <Badge className={`border ${getStatusColor(report.status)}`}>
                            {report.status.replace("_", " ").charAt(0).toUpperCase() +
                              report.status.replace("_", " ").slice(1)}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{report.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{report.reportedBy}</p>
                        <p className="text-xs text-muted-foreground">
                          {report.companyName || "N/A"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(report.createdAt)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{report.assignedTo || "Unassigned"}</span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedReport(report);
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
          )}
        </CardContent>
      </Card>

      {/* Bug Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedReport && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <DialogTitle className="text-2xl mb-2">
                      {selectedReport.title}
                    </DialogTitle>
                    <div className="flex gap-2 mb-4">
                      <Badge className={`border ${getPriorityColor(selectedReport.priority)}`}>
                        <span className="flex items-center gap-1">
                          {getPriorityIcon(selectedReport.priority)}
                          {selectedReport.priority.toUpperCase()}
                        </span>
                      </Badge>
                      <Badge className={`border ${getStatusColor(selectedReport.status)}`}>
                        {selectedReport.status.replace("_", " ").toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{selectedReport.category}</Badge>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedReport.description}</p>
                </div>

                {/* Reporter Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Reported By</h4>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{selectedReport.reportedBy}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedReport.reportedByEmail}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Company</h4>
                    <p className="text-sm">{selectedReport.companyName || "N/A"}</p>
                  </div>
                </div>

                {/* Technical Details */}
                {(selectedReport.browser || selectedReport.os || selectedReport.page) && (
                  <div>
                    <h4 className="font-semibold mb-2">Technical Details</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      {selectedReport.page && (
                        <div>
                          <p className="text-muted-foreground">Page</p>
                          <p className="font-mono">{selectedReport.page}</p>
                        </div>
                      )}
                      {selectedReport.browser && (
                        <div>
                          <p className="text-muted-foreground">Browser</p>
                          <p>{selectedReport.browser}</p>
                        </div>
                      )}
                      {selectedReport.os && (
                        <div>
                          <p className="text-muted-foreground">OS</p>
                          <p>{selectedReport.os}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Reproduction Steps */}
                {selectedReport.reproSteps && (
                  <div>
                    <h4 className="font-semibold mb-2">Steps to Reproduce</h4>
                    <pre className="text-sm bg-muted p-3 rounded whitespace-pre-wrap">
                      {selectedReport.reproSteps}
                    </pre>
                  </div>
                )}

                {/* Expected vs Actual Behavior */}
                {(selectedReport.expectedBehavior || selectedReport.actualBehavior) && (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedReport.expectedBehavior && (
                      <div>
                        <h4 className="font-semibold mb-2">Expected Behavior</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedReport.expectedBehavior}
                        </p>
                      </div>
                    )}
                    {selectedReport.actualBehavior && (
                      <div>
                        <h4 className="font-semibold mb-2">Actual Behavior</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedReport.actualBehavior}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Timestamps */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Created: {formatDate(selectedReport.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Updated: {formatDate(selectedReport.updatedAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Select
                    value={selectedReport.status}
                    onValueChange={(value: BugStatus) => {
                      handleStatusChange(selectedReport.id, value);
                      setSelectedReport({ ...selectedReport, status: value });
                    }}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">Assign to Developer</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
