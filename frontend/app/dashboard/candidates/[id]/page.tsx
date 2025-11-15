"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ExternalLink,
  Download,
  Star,
  TrendingUp,
  Loader2,
  FileText,
  Linkedin,
  Globe,
  GraduationCap,
  Building2,
  Clock,
  Eye,
} from "lucide-react";
import { format } from "date-fns";

interface Candidate {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  resumeUrl?: string;
  bio?: string;
  skills?: string[];
  yearsOfExperience?: number;
  currentCompany?: string;
  currentTitle?: string;
  education?: {
    degree: string;
    school: string;
    year: string;
  }[];
  experience?: {
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }[];
  createdAt: any;
}

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  status: string;
  stage: string;
  appliedAt: any;
  matchScore?: number;
  aiRecommendation?: string;
}

export default function CandidateProfilePage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);

  // Load candidate data
  useEffect(() => {
    const loadData = async () => {
      if (!candidateId) return;

      setLoading(true);

      try {
        // Load candidate profile
        const candidateDoc = await getDoc(doc(db, "users", candidateId));

        if (!candidateDoc.exists()) {
          router.push("/dashboard/candidates");
          return;
        }

        const candidateData = { uid: candidateDoc.id, ...candidateDoc.data() } as Candidate;
        setCandidate(candidateData);

        // Load applications
        const applicationsQuery = query(
          collection(db, "applications"),
          where("candidateId", "==", candidateId),
          orderBy("appliedAt", "desc")
        );
        const applicationsSnapshot = await getDocs(applicationsQuery);
        const applicationsData: Application[] = applicationsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Application));
        setApplications(applicationsData);
      } catch (error) {
        console.error("Error loading candidate:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [candidateId, router]);

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { className: string }> = {
      Applied: { className: "bg-blue-50 text-blue-700 border-blue-200" },
      "Under Review": { className: "bg-purple-50 text-purple-700 border-purple-200" },
      "Interview Scheduled": { className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      Hired: { className: "bg-green-500 text-white border-green-600" },
      Rejected: { className: "bg-red-50 text-red-700 border-red-200" },
    };

    const config = statusConfig[status] || { className: "" };

    return (
      <Badge variant="outline" className={config.className}>
        {status}
      </Badge>
    );
  };

  // Get match score badge
  const getMatchScoreBadge = (score?: number) => {
    if (!score) return null;

    let className = "";
    if (score >= 90) className = "bg-green-100 text-green-800 border-green-300";
    else if (score >= 70) className = "bg-green-50 text-green-700 border-green-200";
    else if (score >= 50) className = "bg-yellow-50 text-yellow-700 border-yellow-200";
    else className = "bg-gray-50 text-gray-600 border-gray-200";

    return (
      <Badge variant="outline" className={className}>
        {score}%
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Candidate not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/candidates")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={candidate.photoURL} />
              <AvatarFallback className="text-2xl">
                {candidate.displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div>
              <h1 className="text-3xl font-bold mb-2">{candidate.displayName}</h1>

              {candidate.currentTitle && candidate.currentCompany && (
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Briefcase className="w-4 h-4" />
                  <span>
                    {candidate.currentTitle} at {candidate.currentCompany}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  <span>{candidate.email}</span>
                </div>
                {candidate.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <span>{candidate.phone}</span>
                  </div>
                )}
                {candidate.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{candidate.location}</span>
                  </div>
                )}
                {candidate.yearsOfExperience !== undefined && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{candidate.yearsOfExperience} years experience</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {candidate.linkedinUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer">
                <Linkedin className="w-4 h-4 mr-2" />
                LinkedIn
              </a>
            </Button>
          )}

          {candidate.portfolioUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={candidate.portfolioUrl} target="_blank" rel="noopener noreferrer">
                <Globe className="w-4 h-4 mr-2" />
                Portfolio
              </a>
            </Button>
          )}

          {candidate.resumeUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4 mr-2" />
                Resume
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold">{applications.length}</p>
              </div>
              <Briefcase className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Applications</p>
                <p className="text-2xl font-bold text-green-600">
                  {applications.filter((a) => !["Hired", "Rejected", "Withdrawn"].includes(a.status)).length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Match Score</p>
                <p className="text-2xl font-bold">
                  {applications.length > 0
                    ? Math.round(
                        applications.reduce((sum, a) => sum + (a.matchScore || 0), 0) / applications.length
                      )
                    : 0}
                  %
                </p>
              </div>
              <Star className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top Matches</p>
                <p className="text-2xl font-bold text-green-600">
                  {applications.filter((a) => (a.matchScore || 0) >= 70).length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="applications">Applications ({applications.length})</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Bio */}
          {candidate.bio && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{candidate.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {candidate.skills && candidate.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resume Preview */}
          {candidate.resumeUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Resume</span>
                  <Button variant="outline" size="sm" asChild>
                    <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open in New Tab
                    </a>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden" style={{ height: "600px" }}>
                  <iframe
                    src={candidate.resumeUrl}
                    className="w-full h-full"
                    title="Resume Preview"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Experience Tab */}
        <TabsContent value="experience" className="space-y-4">
          {candidate.experience && candidate.experience.length > 0 ? (
            <div className="space-y-4">
              {candidate.experience.map((exp, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-muted rounded-lg">
                        <Building2 className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{exp.title}</h3>
                        <p className="text-muted-foreground mb-2">{exp.company}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {exp.startDate} - {exp.endDate || "Present"}
                          </span>
                        </div>
                        {exp.description && (
                          <p className="text-sm whitespace-pre-wrap">{exp.description}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No experience listed</h3>
                  <p className="text-muted-foreground">
                    This candidate has not added any work experience yet.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education" className="space-y-4">
          {candidate.education && candidate.education.length > 0 ? (
            <div className="space-y-4">
              {candidate.education.map((edu, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-muted rounded-lg">
                        <GraduationCap className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{edu.degree}</h3>
                        <p className="text-muted-foreground mb-2">{edu.school}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{edu.year}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No education listed</h3>
                  <p className="text-muted-foreground">
                    This candidate has not added any education details yet.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-4">
          {applications.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No applications</h3>
                  <p className="text-muted-foreground">
                    This candidate has not applied to any jobs yet.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Match Score</TableHead>
                      <TableHead>Recommendation</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application) => (
                      <TableRow
                        key={application.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => router.push(`/dashboard/applications/${application.id}`)}
                      >
                        <TableCell className="font-medium">{application.jobTitle}</TableCell>
                        <TableCell>
                          {application.matchScore !== undefined ? (
                            getMatchScoreBadge(application.matchScore)
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {application.aiRecommendation ? (
                            <Badge variant="outline">{application.aiRecommendation}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(application.status)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{application.stage}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {application.appliedAt?.toDate
                            ? format(application.appliedAt.toDate(), "MMM d, yyyy")
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/dashboard/applications/${application.id}`);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
