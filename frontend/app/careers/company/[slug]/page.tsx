"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  MapPin,
  Clock,
  Users,
  Building2,
  Globe,
  Linkedin,
  Twitter,
  Loader2,
  ExternalLink,
  ArrowRight
} from "lucide-react";

interface Company {
  companyId: string;
  name: string;
  logoUrl?: string;
  description?: string;
  industry: string;
  size: string;
  website?: string;
  headquarters?: string;
  founded?: string;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
}

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experienceLevel: string;
  postedAt: Date;
  applicants: number;
}

export default function CompanyCareerPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        // Find company by slug (for now, using name as slug)
        // In production, you'd have a slug field in the company document
        const companiesRef = collection(db, "companies");
        const q = query(companiesRef);
        const querySnapshot = await getDocs(q);

        let companyData: Company | null = null;
        let companyId = "";

        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          // Simple slug matching (company name lowercase, spaces replaced with hyphens)
          const companySlug = data.name.toLowerCase().replace(/\s+/g, "-");
          if (companySlug === slug) {
            companyData = {
              companyId: data.companyId,
              name: data.name,
              logoUrl: data.logoUrl,
              description: data.description,
              industry: data.industry,
              size: data.size,
              website: data.website,
              headquarters: data.headquarters,
              founded: data.founded,
              socialMedia: data.socialMedia,
            };
            companyId = data.companyId;
            break;
          }
        }

        if (!companyData) {
          setError("Company not found");
          setLoading(false);
          return;
        }

        setCompany(companyData);

        // Fetch jobs for this company
        const jobsRef = collection(db, "jobs");
        const jobsQuery = query(
          jobsRef,
          where("companyId", "==", companyId),
          where("status", "==", "Open")
        );
        const jobsSnapshot = await getDocs(jobsQuery);

        const jobsData: Job[] = jobsSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            department: data.department || "General",
            location: data.location || "Remote",
            type: data.type,
            experienceLevel: data.experienceLevel,
            postedAt: data.createdAt?.toDate() || new Date(),
            applicants: data.applicants || 0,
          };
        });

        setJobs(jobsData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching company data:", err);
        setError("An error occurred while loading the career page");
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [slug]);

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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading career page...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !company) {
    return (
      <div className="min-h-screen bg-muted/30">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <Link href="/careers" className="inline-flex items-center text-sm hover:underline">
              Back to Jobs
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-16">
          <Card>
            <CardContent className="py-16 text-center">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Company Not Found</h2>
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
          <Link href="/careers" className="text-sm hover:underline">
            ← Back to All Jobs
          </Link>
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
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Company Logo */}
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.name}
                className="w-24 h-24 rounded-2xl object-cover mx-auto mb-6 border-2 border-border"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6 border-2 border-border">
                <Building2 className="w-12 h-12 text-muted-foreground" />
              </div>
            )}

            <h1 className="text-5xl font-bold mb-4">{company.name}</h1>
            <p className="text-xl text-muted-foreground mb-6">
              {company.description || `Join ${company.name} and make an impact`}
            </p>

            {/* Company Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <span>{company.industry}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span>{company.size} employees</span>
              </div>
              {company.headquarters && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{company.headquarters}</span>
                </div>
              )}
              {company.founded && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Founded {company.founded}</span>
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="flex items-center justify-center gap-4 mt-6">
              {company.website && (
                <Button variant="outline" size="sm" asChild>
                  <a href={company.website} target="_blank" rel="noopener noreferrer">
                    <Globe className="w-4 h-4 mr-2" />
                    Website
                  </a>
                </Button>
              )}
              {company.socialMedia?.linkedin && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={company.socialMedia.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </a>
                </Button>
              )}
              {company.socialMedia?.twitter && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={company.socialMedia.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Jobs Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Open Positions</h2>
                <p className="text-muted-foreground">
                  {jobs.length} {jobs.length === 1 ? "position" : "positions"} available
                </p>
              </div>
            </div>

            {jobs.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No open positions</h3>
                  <p className="text-muted-foreground mb-6">
                    There are currently no open positions at {company.name}. Check back later!
                  </p>
                  <Button asChild>
                    <Link href="/careers">Browse All Jobs</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <Card
                    key={job.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <Link href={`/careers/${job.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-2 hover:text-primary transition-colors">
                              {job.title}
                            </CardTitle>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center">
                                <Briefcase className="w-4 h-4 mr-1" />
                                {job.department}
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
                          </div>
                          <ExternalLink className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <Badge variant="secondary">{job.type}</Badge>
                            <Badge variant="outline">{job.experienceLevel}</Badge>
                          </div>
                          <Button variant="ghost" size="sm">
                            View Details
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to join {company.name}?</h3>
            <p className="text-muted-foreground mb-6">
              Create your account and start your application today
            </p>
            <div className="flex justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/auth/signup/candidate">
                  Create Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/careers">Browse All Jobs</Link>
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
