"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Building2,
  Users,
  Briefcase,
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Globe,
  Activity,
  ArrowLeft,
  Eye,
  Ban,
  CheckCircle,
  Clock,
  FileText,
  CreditCard,
  AlertCircle,
  UserCog,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CompanyData {
  id: string;
  name: string;
  industry?: string;
  size?: string;
  status: string;
  plan?: string;
  createdAt: any;
  website?: string;
  logoURL?: string;
}

interface UserData {
  id: string;
  displayName: string;
  email: string;
  role: string;
  createdAt: any;
  lastActive?: any;
}

interface ActivityLog {
  id: string;
  type: string;
  description: string;
  timestamp: any;
  userId: string;
  userName: string;
}

export default function CompanyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const companyId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    mrr: 0,
  });
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    if (companyId) {
      fetchCompanyDetails();
    }
  }, [companyId]);

  const fetchCompanyDetails = async () => {
    try {
      setLoading(true);

      // Fetch company document
      const companyDoc = await getDoc(doc(db, "companies", companyId));
      if (!companyDoc.exists()) {
        toast({
          title: "Error",
          description: "Company not found",
          variant: "destructive",
        });
        router.push("/platform-admin/companies");
        return;
      }

      const companyData = {
        id: companyDoc.id,
        ...companyDoc.data(),
      } as CompanyData;
      setCompany(companyData);

      // Fetch users for this company
      const usersSnapshot = await getDocs(
        query(collection(db, "users"), where("companyId", "==", companyId))
      );
      const usersData: UserData[] = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as UserData));
      setUsers(usersData);

      // Fetch jobs statistics
      const jobsSnapshot = await getDocs(
        query(collection(db, "jobs"), where("companyId", "==", companyId))
      );
      const activeJobsCount = jobsSnapshot.docs.filter(
        doc => doc.data().status === "Open"
      ).length;

      // Fetch applications statistics
      const appsSnapshot = await getDocs(
        query(collection(db, "applications"), where("companyId", "==", companyId))
      );

      // Calculate MRR (placeholder - would come from subscription data)
      const mrr = calculateMRR(companyData.plan || "Basic");

      setStats({
        totalJobs: jobsSnapshot.size,
        activeJobs: activeJobsCount,
        totalApplications: appsSnapshot.size,
        mrr,
      });

      // Generate activity logs (in production, fetch from actual activity collection)
      const logs: ActivityLog[] = [
        {
          id: "1",
          type: "user_added",
          description: "New user added to company",
          timestamp: new Date(),
          userId: "user1",
          userName: "John Doe",
        },
        {
          id: "2",
          type: "job_posted",
          description: "New job posting created",
          timestamp: new Date(Date.now() - 86400000),
          userId: "user2",
          userName: "Jane Smith",
        },
      ];
      setActivityLogs(logs);

    } catch (error) {
      console.error("Error fetching company details:", error);
      toast({
        title: "Error",
        description: "Failed to load company details",
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

  const handleSuspendCompany = async () => {
    try {
      await updateDoc(doc(db, "companies", companyId), {
        status: "Suspended",
      });
      toast({
        title: "Success",
        description: "Company has been suspended",
      });
      fetchCompanyDetails();
    } catch (error) {
      console.error("Error suspending company:", error);
      toast({
        title: "Error",
        description: "Failed to suspend company",
        variant: "destructive",
      });
    }
  };

  const handleActivateCompany = async () => {
    try {
      await updateDoc(doc(db, "companies", companyId), {
        status: "Active",
      });
      toast({
        title: "Success",
        description: "Company has been activated",
      });
      fetchCompanyDetails();
    } catch (error) {
      console.error("Error activating company:", error);
      toast({
        title: "Error",
        description: "Failed to activate company",
        variant: "destructive",
      });
    }
  };

  const handleImpersonate = () => {
    // In production, this would set up admin impersonation
    toast({
      title: "Impersonation Mode",
      description: `Viewing as ${company?.name}`,
    });
    // Redirect to company dashboard
    router.push(`/dashboard?impersonate=${companyId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-50 text-green-700 border-green-200";
      case "trial":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "suspended":
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getPlanColor = (plan?: string) => {
    switch (plan?.toLowerCase()) {
      case "enterprise":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "professional":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "growth":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
    } catch {
      return "N/A";
    }
  };

  const formatRelativeTime = (timestamp: any) => {
    if (!timestamp) return "Never";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 60) return `${minutes} minutes ago`;
      if (hours < 24) return `${hours} hours ago`;
      return `${days} days ago`;
    } catch {
      return "Never";
    }
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

  if (!company) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-2">Company not found</h3>
          <Button onClick={() => router.push("/platform-admin/companies")}>
            Back to Companies
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/platform-admin/companies")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                {company.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-3xl font-bold">{company.name}</h2>
              <p className="text-muted-foreground">
                {company.industry || "N/A"} • {company.size || "N/A"} employees
              </p>
              <div className="flex gap-2 mt-2">
                <Badge className={`border ${getPlanColor(company.plan)}`}>
                  {company.plan || "Basic"}
                </Badge>
                <Badge className={`border ${getStatusColor(company.status)}`}>
                  {company.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImpersonate}>
            <Eye className="w-4 h-4 mr-2" />
            Impersonate
          </Button>
          {company.status === "Active" ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <Ban className="w-4 h-4 mr-2" />
                  Suspend
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Suspend Company?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will prevent all users from this company from accessing the platform.
                    This action can be reversed later.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSuspendCompany}>
                    Suspend Company
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Button onClick={handleActivateCompany}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Activate
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                <h3 className="text-3xl font-bold mb-1">{users.length}</h3>
                <p className="text-sm text-muted-foreground">Active accounts</p>
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
                <p className="text-sm text-muted-foreground mb-1">Active Jobs</p>
                <h3 className="text-3xl font-bold mb-1">{stats.activeJobs}</h3>
                <p className="text-sm text-muted-foreground">of {stats.totalJobs} total</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Applications</p>
                <h3 className="text-3xl font-bold mb-1">{stats.totalApplications}</h3>
                <p className="text-sm text-muted-foreground">Total received</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">MRR</p>
                <h3 className="text-3xl font-bold mb-1">${stats.mrr}</h3>
                <p className="text-sm text-muted-foreground">Monthly revenue</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Basic company details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Company Name</p>
                    <p className="font-medium">{company.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-4 border-t">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Website</p>
                    <p className="font-medium">{company.website || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-4 border-t">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Joined Date</p>
                    <p className="font-medium">{formatDate(company.createdAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
                <CardDescription>Platform usage metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Jobs Posted</p>
                    <p className="text-2xl font-bold">{stats.totalJobs}</p>
                  </div>
                  <Briefcase className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Applications Received</p>
                    <p className="text-2xl font-bold">{stats.totalApplications}</p>
                  </div>
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Company Users</CardTitle>
              <CardDescription>All users associated with this company</CardDescription>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No users found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Last Active</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(user => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>
                                {user.displayName?.substring(0, 2).toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.displayName || "N/A"}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatRelativeTime(user.lastActive)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Details</CardTitle>
              <CardDescription>Billing and subscription information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Plan</p>
                  <p className="text-2xl font-bold">{company.plan || "Basic"}</p>
                </div>
                <Badge className={`border ${getPlanColor(company.plan)}`}>
                  {company.plan || "Basic"}
                </Badge>
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                  <p className="text-2xl font-bold">${stats.mrr}</p>
                </div>
                <CreditCard className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-2xl font-bold">{company.status}</p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>Recent company activity</CardDescription>
            </CardHeader>
            <CardContent>
              {activityLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No recent activity
                </div>
              ) : (
                <div className="space-y-4">
                  {activityLogs.map(log => (
                    <div key={log.id} className="flex items-start gap-3 pb-4 border-b last:border-0">
                      <div className="p-2 rounded-lg bg-muted">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{log.description}</p>
                        <p className="text-sm text-muted-foreground">
                          by {log.userName} • {formatRelativeTime(log.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
