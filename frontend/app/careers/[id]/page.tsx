"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Briefcase,
  MapPin,
  Building2,
  Clock,
  DollarSign,
  Users,
  Loader2,
  ArrowLeft,
  Share2,
  Bookmark,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  companyDescription?: string;
  department: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Internship";
  experienceLevel: string;
  salaryMin?: number;
  salaryMax?: number;
  description: string;
  requiredSkills: string[];
  benefits?: string;
  postedAt: Date;
  applicants: number;
  status: string;
}

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;
  const [user] = useAuthState(auth);

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  // Fetch job details
  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) {
        setError("Invalid job ID");
        setLoading(false);
        return;
      }

      try {
        const jobRef = doc(db, "jobs", jobId);
        const jobSnap = await getDoc(jobRef);

        if (!jobSnap.exists()) {
          setError("Job not found");
          setLoading(false);
          return;
        }

        const data = jobSnap.data();

        // Check if job is still open
        if (data.status !== "Open") {
          setError("This job posting is no longer accepting applications");
          setLoading(false);
          return;
        }

        // Fetch company data
        const companyRef = doc(db, "companies", data.companyId);
        const companySnap = await getDoc(companyRef);
        const companyData = companySnap.exists() ? companySnap.data() : null;

        setJob({
          id: jobSnap.id,
          title: data.title,
          companyId: data.companyId,
          companyName: companyData?.name || "Company",
          companyLogo: companyData?.logoUrl,
          companyDescription: companyData?.description,
          department: data.department || "General",
          location: data.location || "Remote",
          type: data.type,
          experienceLevel: data.experienceLevel,
          salaryMin: data.salaryMin,
          salaryMax: data.salaryMax,
          description: data.description,
          requiredSkills: data.requiredSkills || [],
          benefits: data.benefits,
          postedAt: data.createdAt?.toDate() || new Date(),
          applicants: data.applicants || 0,
          status: data.status,
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching job:", err);
        setError("An error occurred while loading the job details");
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  // Format salary
  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "Competitive salary";
    if (min && max) {
      return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k per year`;
    }
    if (min) return `From $${(min / 1000).toFixed(0)}k per year`;
    return `Up to $${(max! / 1000).toFixed(0)}k per year`;
  };

  // Format date
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Posted today";
    if (diffDays === 1) return "Posted yesterday";
    if (diffDays < 7) return `Posted ${diffDays} days ago`;
    if (diffDays < 30) return `Posted ${Math.floor(diffDays / 7)} weeks ago`;
    return `Posted ${Math.floor(diffDays / 30)} months ago`;
  };

  // Handle apply click
  const handleApply = () => {
    if (!user) {
      // Redirect to signup/login with return URL
      router.push(`/auth/login?returnUrl=/careers/${jobId}/apply`);
    } else {
      // Redirect to application form
      router.push(`/careers/${jobId}/apply`);
    }
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: job?.title,
          text: `Check out this job: ${job?.title} at ${job?.companyName}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  // Handle save
  const handleSave = () => {
    // TODO: Implement save functionality
    setSaved(!saved);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !job) {
    return (
      <div className="min-h-screen bg-muted/30">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <Link href="/careers" className="inline-flex items-center text-sm hover:underline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-16">
          <Card>
            <CardContent className="py-16 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button asChild>
                <Link href="/careers">Browse All Jobs</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/careers" className="inline-flex items-center text-sm hover:underline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Link>
          <div className="flex items-center space-x-3">
            {!user && (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/signup/candidate">Join as Candidate</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Job Details - Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start space-x-4">
                  {/* Company Logo */}
                  {job.companyLogo ? (
                    <img
                      src={job.companyLogo}
                      alt={job.companyName}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}

                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
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
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {job.applicants} applicants
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      <Badge variant="secondary">{job.type}</Badge>
                      <Badge variant="outline">{job.experienceLevel}</Badge>
                      <Badge variant="outline">{job.department}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap">{job.description}</div>
              </CardContent>
            </Card>

            {/* Required Skills */}
            {job.requiredSkills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Required Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {job.benefits && (
              <Card>
                <CardHeader>
                  <CardTitle>Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap">{job.benefits}</div>
                </CardContent>
              </Card>
            )}

            {/* Company Description */}
            {job.companyDescription && (
              <Card>
                <CardHeader>
                  <CardTitle>About {job.companyName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{job.companyDescription}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Apply Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <div className="flex items-center text-2xl font-bold text-primary mb-2">
                  <DollarSign className="w-6 h-6" />
                  {formatSalary(job.salaryMin, job.salaryMax)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" size="lg" onClick={handleApply}>
                  Apply Now
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleSave}
                  >
                    <Bookmark
                      className={`w-4 h-4 mr-2 ${saved ? "fill-current" : ""}`}
                    />
                    {saved ? "Saved" : "Save"}
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>

                {!user && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      You need to sign in or create an account to apply for this job.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="pt-4 border-t space-y-3 text-sm">
                  <h3 className="font-semibold">Job Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Job Type</span>
                      <span className="font-medium">{job.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Experience Level</span>
                      <span className="font-medium">{job.experienceLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Department</span>
                      <span className="font-medium">{job.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location</span>
                      <span className="font-medium">{job.location}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center text-green-600 text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      AI-Powered Matching
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your application will be analyzed by AI to match your skills and
                      experience with this role.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
