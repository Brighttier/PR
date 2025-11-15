"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateJobDialog } from "@/components/dialogs/create-job-dialog";
import { EditJobDialog } from "@/components/dialogs/edit-job-dialog";
import {
  Briefcase,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit2,
  Users,
  MapPin,
  DollarSign,
  Loader2,
  Plus,
} from "lucide-react";
import { format } from "date-fns";

interface Job {
  id: string;
  title: string;
  department?: string;
  location?: string;
  type: "Full-time" | "Part-time" | "Contract" | "Internship";
  experienceLevel: "Entry Level" | "Mid Level" | "Senior" | "Lead" | "Executive";
  salaryMin?: number;
  salaryMax?: number;
  description: string;
  requirements?: string;
  benefits?: string;
  requiredSkills?: string[];
  status: "Open" | "Closed" | "Archived";
  applicants: number;
  createdAt: any;
  updatedAt: any;
}

export default function JobsPage() {
  const router = useRouter();
  const { userProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  // Load jobs
  useEffect(() => {
    const loadJobs = async () => {
      if (!userProfile?.companyId) return;

      setLoading(true);

      try {
        const jobsQuery = query(
          collection(db, "jobs"),
          where("companyId", "==", userProfile.companyId),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(jobsQuery);
        const jobsData: Job[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Job));

        setJobs(jobsData);
        setFilteredJobs(jobsData);
      } catch (error) {
        console.error("Error loading jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [userProfile?.companyId]);

  // Apply filters
  useEffect(() => {
    let filtered = jobs;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.department?.toLowerCase().includes(query) ||
          job.location?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((job) => job.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((job) => job.type === typeFilter);
    }

    setFilteredJobs(filtered);
  }, [searchQuery, statusFilter, typeFilter, jobs]);

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Open":
        return <Badge className="bg-green-100 text-green-700 border-green-200">Open</Badge>;
      case "Closed":
        return <Badge variant="secondary">Closed</Badge>;
      case "Archived":
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Format salary range
  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "Not specified";
    if (min && max) {
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    }
    if (min) return `$${min.toLocaleString()}+`;
    return `Up to $${max?.toLocaleString()}`;
  };

  // Refresh jobs after create/edit
  const handleJobSuccess = async () => {
    if (!userProfile?.companyId) return;

    const jobsQuery = query(
      collection(db, "jobs"),
      where("companyId", "==", userProfile.companyId),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(jobsQuery);
    const jobsData: Job[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Job));

    setJobs(jobsData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Postings</h1>
          <p className="text-muted-foreground">
            Manage your job postings and view applications
          </p>
        </div>

        <CreateJobDialog onSuccess={handleJobSuccess} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
                <p className="text-2xl font-bold">{jobs.length}</p>
              </div>
              <Briefcase className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Positions</p>
                <p className="text-2xl font-bold text-green-600">
                  {jobs.filter((j) => j.status === "Open").length}
                </p>
              </div>
              <Briefcase className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Applicants</p>
                <p className="text-2xl font-bold">
                  {jobs.reduce((sum, job) => sum + (job.applicants || 0), 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Archived</p>
                <p className="text-2xl font-bold">
                  {jobs.filter((j) => j.status === "Archived").length}
                </p>
              </div>
              <Briefcase className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs by title, department, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Part-time">Part-time</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Internship">Internship</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(searchQuery || statusFilter !== "all" || typeFilter !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card>
        <CardContent className="p-0">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {jobs.length === 0 ? "No jobs yet" : "No jobs found"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {jobs.length === 0
                  ? "Create your first job posting to start receiving applications."
                  : "Try adjusting your filters."}
              </p>
              {jobs.length === 0 && (
                <CreateJobDialog
                  trigger={
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Job
                    </Button>
                  }
                  onSuccess={handleJobSuccess}
                />
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applicants</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job) => (
                  <TableRow
                    key={job.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
                  >
                    <TableCell className="font-medium">
                      <div>
                        <p className="font-semibold">{job.title}</p>
                        {job.experienceLevel && (
                          <p className="text-xs text-muted-foreground">
                            {job.experienceLevel}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {job.department || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.location || "Remote"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{job.type}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(job.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {job.applicants || 0}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {job.createdAt?.toDate
                        ? format(job.createdAt.toDate(), "MMM d, yyyy")
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/dashboard/jobs/${job.id}`);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingJob(job);
                            }}
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Job
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/dashboard/applications?jobId=${job.id}`);
                            }}
                          >
                            <Users className="w-4 h-4 mr-2" />
                            View Applications
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Job Dialog */}
      {editingJob && (
        <EditJobDialog
          job={editingJob}
          trigger={<></>}
          onSuccess={() => {
            handleJobSuccess();
            setEditingJob(null);
          }}
          onDelete={() => {
            handleJobSuccess();
            setEditingJob(null);
          }}
        />
      )}
    </div>
  );
}
