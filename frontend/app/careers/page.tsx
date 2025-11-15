"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  MapPin,
  Building2,
  Search,
  Filter,
  Clock,
  TrendingUp,
  Loader2,
  ExternalLink
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  department: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Internship";
  experienceLevel: string;
  salaryMin?: number;
  salaryMax?: number;
  description: string;
  requiredSkills: string[];
  postedAt: Date;
  applicants: number;
}

export default function CareersPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  // Fetch jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsRef = collection(db, "jobs");
        const q = query(
          jobsRef,
          where("status", "==", "Open"),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);

        const jobsData: Job[] = [];

        for (const docSnap of querySnapshot.docs) {
          const data = docSnap.data();

          // Fetch company data
          const companyRef = collection(db, "companies");
          const companyQuery = query(companyRef, where("companyId", "==", data.companyId));
          const companySnapshot = await getDocs(companyQuery);
          const companyData = companySnapshot.docs[0]?.data();

          jobsData.push({
            id: docSnap.id,
            title: data.title,
            companyId: data.companyId,
            companyName: companyData?.name || "Company",
            companyLogo: companyData?.logoUrl,
            department: data.department || "General",
            location: data.location || "Remote",
            type: data.type,
            experienceLevel: data.experienceLevel,
            salaryMin: data.salaryMin,
            salaryMax: data.salaryMax,
            description: data.description,
            requiredSkills: data.requiredSkills || [],
            postedAt: data.createdAt?.toDate() || new Date(),
            applicants: data.applicants || 0,
          });
        }

        setJobs(jobsData);
        setFilteredJobs(jobsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = jobs;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.requiredSkills.some((skill) =>
            skill.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Location filter
    if (locationFilter) {
      filtered = filtered.filter((job) =>
        job.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter) {
      filtered = filtered.filter((job) => job.type === typeFilter);
    }

    // Department filter
    if (departmentFilter) {
      filtered = filtered.filter((job) =>
        job.department.toLowerCase().includes(departmentFilter.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  }, [searchQuery, locationFilter, typeFilter, departmentFilter, jobs]);

  // Get unique values for filters
  const departments = Array.from(new Set(jobs.map((job) => job.department)));
  const locations = Array.from(new Set(jobs.map((job) => job.location)));

  // Format salary
  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "Competitive salary";
    if (min && max) {
      return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
    }
    if (min) return `From $${(min / 1000).toFixed(0)}k`;
    return `Up to $${(max! / 1000).toFixed(0)}k`;
  };

  // Format date
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">Persona Recruit</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup/candidate">Join as Candidate</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-background to-muted/30 py-16 border-b">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            Find Your Next Opportunity
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover jobs from top companies powered by AI-driven matching
          </p>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by job title, skill, or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <Button size="lg" className="px-8">
                Search
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-12 text-sm">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" />
              <span>
                <span className="font-semibold">{jobs.length}</span> open positions
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              <span>
                <span className="font-semibold">
                  {new Set(jobs.map((j) => j.companyId)).size}
                </span>{" "}
                companies
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>
                <span className="font-semibold">AI-powered</span> matching
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Job Type Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Job Type</Label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">All Types</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                {/* Location Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Location</Label>
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">All Locations</option>
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Department Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Department</Label>
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                {(searchQuery || locationFilter || typeFilter || departmentFilter) && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSearchQuery("");
                      setLocationFilter("");
                      setTypeFilter("");
                      setDepartmentFilter("");
                    }}
                  >
                    Clear All Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          </aside>

          {/* Job Listings */}
          <main className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                Showing {filteredJobs.length} of {jobs.length} jobs
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading jobs...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Briefcase className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Try adjusting your filters or search query
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setLocationFilter("");
                      setTypeFilter("");
                      setDepartmentFilter("");
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <Card
                    key={job.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <Link href={`/careers/${job.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            {/* Company Logo */}
                            {job.companyLogo ? (
                              <img
                                src={job.companyLogo}
                                alt={job.companyName}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}

                            <div className="flex-1">
                              <CardTitle className="text-xl mb-1 hover:text-primary transition-colors">
                                {job.title}
                              </CardTitle>
                              <CardDescription className="flex flex-wrap items-center gap-3">
                                <span className="flex items-center">
                                  <Building2 className="w-4 h-4 mr-1" />
                                  {job.companyName}
                                </span>
                                <span className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {job.location}
                                </span>
                                <span className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {formatDate(job.postedAt)}
                                </span>
                              </CardDescription>
                            </div>
                          </div>

                          <ExternalLink className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Job Details */}
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">{job.type}</Badge>
                            <Badge variant="outline">{job.experienceLevel}</Badge>
                            <Badge variant="outline">{job.department}</Badge>
                          </div>

                          {/* Description Preview */}
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {job.description}
                          </p>

                          {/* Skills */}
                          {job.requiredSkills.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {job.requiredSkills.slice(0, 5).map((skill) => (
                                <Badge key={skill} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {job.requiredSkills.length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                  +{job.requiredSkills.length - 5} more
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Salary & Applicants */}
                          <div className="flex items-center justify-between pt-2 border-t">
                            <span className="text-sm font-medium text-primary">
                              {formatSalary(job.salaryMin, job.salaryMax)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {job.applicants} applicants
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-background mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Persona Recruit</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered recruitment platform connecting talent with opportunity.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Job Seekers</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/careers" className="text-muted-foreground hover:text-foreground">
                    Browse Jobs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/signup/candidate"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Create Account
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Employers</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/auth/signup/company"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Post a Job
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2025 Persona Recruit AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

// Label component (if not already in UI library)
function Label({ children, className = "", ...props }: any) {
  return (
    <label className={`text-sm font-medium ${className}`} {...props}>
      {children}
    </label>
  );
}
