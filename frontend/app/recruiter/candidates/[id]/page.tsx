"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  FileText,
  Briefcase,
  GraduationCap,
  Calendar,
  Target,
  Sparkles,
  Download,
  ExternalLink,
  Users,
  Clock,
  TrendingUp,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Candidate {
  id: string;
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  currentRole?: string;
  currentCompany?: string;
  summary?: string;
  [key: string]: any;
}

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  status: string;
  stage: string;
  appliedAt: any;
  aiAnalysis?: {
    matchScore: number;
    recommendation: string;
  };
}

export default function CandidateProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const candidateId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    if (candidateId) {
      loadCandidateData();
    }
  }, [candidateId]);

  const loadCandidateData = async () => {
    try {
      setLoading(true);

      // Get candidate profile
      const candidateRef = doc(db, "users", candidateId);
      const candidateSnap = await getDoc(candidateRef);

      if (!candidateSnap.exists()) {
        setError("Candidate not found");
        setLoading(false);
        return;
      }

      const candidateData = { id: candidateSnap.id, ...candidateSnap.data() } as Candidate;
      setCandidate(candidateData);

      // Get applications for this candidate (filter by company)
      if (userProfile?.companyId) {
        const applicationsRef = collection(db, "applications");
        const applicationsQuery = query(
          applicationsRef,
          where("candidateId", "==", candidateId),
          where("companyId", "==", userProfile.companyId),
          orderBy("appliedAt", "desc")
        );
        const applicationsSnap = await getDocs(applicationsQuery);
        const applicationsData = applicationsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Application[];
        setApplications(applicationsData);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error loading candidate:", err);
      setError("Failed to load candidate data");
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Applied: "bg-blue-50 text-blue-700 border-blue-200",
      "Under Review": "bg-yellow-50 text-yellow-700 border-yellow-200",
      "Interview Scheduled": "bg-purple-50 text-purple-700 border-purple-200",
      "Offer Extended": "bg-orange-50 text-orange-700 border-orange-200",
      Hired: "bg-green-50 text-green-700 border-green-200",
      Rejected: "bg-red-50 text-red-700 border-red-200",
      Withdrawn: "bg-gray-50 text-gray-700 border-gray-200",
    };
    return styles[status] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-700 bg-green-50 border-green-200";
    if (score >= 70) return "text-blue-700 bg-blue-50 border-blue-200";
    if (score >= 50) return "text-yellow-700 bg-yellow-50 border-yellow-200";
    return "text-gray-700 bg-gray-50 border-gray-200";
  };

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const avgMatchScore =
    applications.length > 0
      ? Math.round(
          applications.reduce((acc, a) => acc + (a.aiAnalysis?.matchScore || 0), 0) /
            applications.length
        )
      : 0;

  if (loading) {
    return (
      <div className="container max-w-7xl py-8">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading candidate profile...</p>
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="container max-w-7xl py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Candidate not found"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Candidates
        </Button>

        {/* Candidate Header Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="text-3xl">
                  {candidate.displayName
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{candidate.displayName}</h1>
                    {candidate.currentRole && (
                      <p className="text-lg text-muted-foreground">
                        {candidate.currentRole}
                        {candidate.currentCompany && ` at ${candidate.currentCompany}`}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a href={`mailto:${candidate.email}`} className="hover:underline">
                      {candidate.email}
                    </a>
                  </div>
                  {candidate.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{candidate.phone}</span>
                    </div>
                  )}
                  {candidate.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{candidate.location}</span>
                    </div>
                  )}
                  {candidate.experience && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      <span>{candidate.experience} experience</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  {candidate.linkedinUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="w-4 h-4 mr-2" />
                        LinkedIn
                        <ExternalLink className="w-3 h-3 ml-2" />
                      </a>
                    </Button>
                  )}
                  {candidate.githubUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={candidate.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="w-4 h-4 mr-2" />
                        GitHub
                        <ExternalLink className="w-3 h-3 ml-2" />
                      </a>
                    </Button>
                  )}
                  {candidate.portfolioUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={candidate.portfolioUrl} target="_blank" rel="noopener noreferrer">
                        <Globe className="w-4 h-4 mr-2" />
                        Portfolio
                        <ExternalLink className="w-3 h-3 ml-2" />
                      </a>
                    </Button>
                  )}
                  {candidate.resumeUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer">
                        <FileText className="w-4 h-4 mr-2" />
                        View Resume
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button onClick={() => window.open(`mailto:${candidate.email}`)}>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
                {candidate.resumeUrl && (
                  <Button variant="outline" asChild>
                    <a href={candidate.resumeUrl} download>
                      <Download className="w-4 h-4 mr-2" />
                      Download Resume
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Applications</p>
                  <p className="text-2xl font-bold">{applications.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Avg Match Score</p>
                  <p className="text-2xl font-bold">{avgMatchScore}%</p>
                </div>
                <Target className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">In Progress</p>
                  <p className="text-2xl font-bold">
                    {
                      applications.filter(
                        (a) => !["Hired", "Rejected", "Withdrawn"].includes(a.status)
                      ).length
                    }
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Hired</p>
                  <p className="text-2xl font-bold">
                    {applications.filter((a) => a.status === "Hired").length}
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">
            Applications {applications.length > 0 && `(${applications.length})`}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Summary */}
              {candidate.summary && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Professional Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {candidate.summary}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Education */}
              {candidate.education && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      Education
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{candidate.education}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Skills */}
            <div className="space-y-6">
              {candidate.skills && candidate.skills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications">
          {applications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No applications</h3>
                <p className="text-muted-foreground">
                  This candidate hasn't applied to any jobs at your company
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>Match Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application) => (
                      <TableRow
                        key={application.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => router.push(`/recruiter/applications/${application.id}`)}
                      >
                        <TableCell>
                          <p className="font-medium">{application.jobTitle}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {formatDate(application.appliedAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`border ${getScoreColor(
                              application.aiAnalysis?.matchScore || 0
                            )}`}
                          >
                            {application.aiAnalysis?.matchScore || 0}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`border ${getStatusBadge(application.status)}`}
                          >
                            {application.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">{application.stage}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/recruiter/applications/${application.id}`);
                            }}
                          >
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
