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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  Search,
  Loader2,
  TrendingUp,
  Star,
  Briefcase,
  MapPin,
  Eye,
} from "lucide-react";

interface Candidate {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  location?: string;
  currentCompany?: string;
  currentTitle?: string;
  skills?: string[];
  yearsOfExperience?: number;
  applicationCount?: number;
  avgMatchScore?: number;
  topMatchCount?: number;
  createdAt: any;
}

interface Application {
  id: string;
  candidateId: string;
  matchScore?: number;
}

export default function CandidatesPage() {
  const router = useRouter();
  const { userProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [experienceFilter, setExperienceFilter] = useState<string>("all");

  // Load candidates
  useEffect(() => {
    const loadCandidates = async () => {
      if (!userProfile?.companyId) return;

      setLoading(true);

      try {
        // Load all applications for this company to get candidate IDs
        const applicationsQuery = query(
          collection(db, "applications"),
          where("companyId", "==", userProfile.companyId)
        );
        const applicationsSnapshot = await getDocs(applicationsQuery);

        // Get unique candidate IDs
        const candidateIds = new Set<string>();
        const applicationsByCandidate = new Map<string, Application[]>();

        applicationsSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          const candidateId = data.candidateId;
          candidateIds.add(candidateId);

          if (!applicationsByCandidate.has(candidateId)) {
            applicationsByCandidate.set(candidateId, []);
          }
          applicationsByCandidate.get(candidateId)?.push({
            id: doc.id,
            candidateId,
            matchScore: data.matchScore,
          });
        });

        // Load candidate profiles
        const candidatesData: Candidate[] = [];

        for (const candidateId of candidateIds) {
          try {
            const candidateDoc = await getDoc(doc(db, "users", candidateId));
            if (candidateDoc.exists()) {
              const candidateData = candidateDoc.data();
              const applications = applicationsByCandidate.get(candidateId) || [];

              // Calculate stats
              const applicationCount = applications.length;
              const avgMatchScore =
                applications.length > 0
                  ? Math.round(
                      applications.reduce((sum, app) => sum + (app.matchScore || 0), 0) /
                        applications.length
                    )
                  : 0;
              const topMatchCount = applications.filter((app) => (app.matchScore || 0) >= 70).length;

              candidatesData.push({
                uid: candidateDoc.id,
                email: candidateData.email,
                displayName: candidateData.displayName,
                photoURL: candidateData.photoURL,
                phone: candidateData.phone,
                location: candidateData.location,
                currentCompany: candidateData.currentCompany,
                currentTitle: candidateData.currentTitle,
                skills: candidateData.skills,
                yearsOfExperience: candidateData.yearsOfExperience,
                applicationCount,
                avgMatchScore,
                topMatchCount,
                createdAt: candidateData.createdAt,
              });
            }
          } catch (error) {
            console.error(`Error loading candidate ${candidateId}:`, error);
          }
        }

        // Sort by average match score (highest first)
        candidatesData.sort((a, b) => (b.avgMatchScore || 0) - (a.avgMatchScore || 0));

        setCandidates(candidatesData);
        setFilteredCandidates(candidatesData);
      } catch (error) {
        console.error("Error loading candidates:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCandidates();
  }, [userProfile?.companyId]);

  // Apply filters
  useEffect(() => {
    let filtered = candidates;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (candidate) =>
          candidate.displayName.toLowerCase().includes(query) ||
          candidate.email.toLowerCase().includes(query) ||
          candidate.currentTitle?.toLowerCase().includes(query) ||
          candidate.currentCompany?.toLowerCase().includes(query) ||
          candidate.skills?.some((skill) => skill.toLowerCase().includes(query))
      );
    }

    // Location filter
    if (locationFilter !== "all") {
      filtered = filtered.filter(
        (candidate) => candidate.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Experience filter
    if (experienceFilter !== "all") {
      const [min, max] = experienceFilter.split("-").map((v) => (v === "+" ? Infinity : parseInt(v)));
      filtered = filtered.filter(
        (candidate) =>
          candidate.yearsOfExperience !== undefined &&
          candidate.yearsOfExperience >= min &&
          candidate.yearsOfExperience <= max
      );
    }

    setFilteredCandidates(filtered);
  }, [searchQuery, locationFilter, experienceFilter, candidates]);

  // Get unique locations
  const locations = Array.from(
    new Set(candidates.map((c) => c.location).filter(Boolean))
  ) as string[];

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
      <div>
        <h1 className="text-3xl font-bold">Candidates</h1>
        <p className="text-muted-foreground">
          Browse and manage candidates who have applied to your jobs
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Candidates</p>
                <p className="text-2xl font-bold">{candidates.length}</p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top Matches (70%+)</p>
                <p className="text-2xl font-bold text-green-600">
                  {candidates.filter((c) => (c.avgMatchScore || 0) >= 70).length}
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
                  {candidates.length > 0
                    ? Math.round(
                        candidates.reduce((sum, c) => sum + (c.avgMatchScore || 0), 0) / candidates.length
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
                <p className="text-sm text-muted-foreground">Active Applications</p>
                <p className="text-2xl font-bold">
                  {candidates.reduce((sum, c) => sum + (c.applicationCount || 0), 0)}
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
                placeholder="Search by name, email, title, company, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Location Filter */}
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Experience Filter */}
            <Select value={experienceFilter} onValueChange={setExperienceFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Experience</SelectItem>
                <SelectItem value="0-2">0-2 years</SelectItem>
                <SelectItem value="3-5">3-5 years</SelectItem>
                <SelectItem value="6-10">6-10 years</SelectItem>
                <SelectItem value="11-+">11+ years</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(searchQuery || locationFilter !== "all" || experienceFilter !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setLocationFilter("all");
                  setExperienceFilter("all");
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Candidates Grid */}
      {filteredCandidates.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {candidates.length === 0 ? "No candidates yet" : "No candidates found"}
              </h3>
              <p className="text-muted-foreground">
                {candidates.length === 0
                  ? "Candidates will appear here once they apply to your jobs."
                  : "Try adjusting your filters."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCandidates.map((candidate) => (
            <Card
              key={candidate.uid}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(`/dashboard/candidates/${candidate.uid}`)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={candidate.photoURL} />
                    <AvatarFallback>
                      {candidate.displayName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{candidate.displayName}</h3>
                    {candidate.currentTitle && (
                      <p className="text-sm text-muted-foreground truncate">
                        {candidate.currentTitle}
                      </p>
                    )}
                    {candidate.currentCompany && (
                      <p className="text-xs text-muted-foreground truncate">
                        at {candidate.currentCompany}
                      </p>
                    )}
                  </div>

                  {/* Match Score Badge */}
                  {candidate.avgMatchScore !== undefined && candidate.avgMatchScore > 0 && (
                    <Badge
                      variant="outline"
                      className={
                        candidate.avgMatchScore >= 90
                          ? "bg-green-100 text-green-800 border-green-300"
                          : candidate.avgMatchScore >= 70
                          ? "bg-green-50 text-green-700 border-green-200"
                          : candidate.avgMatchScore >= 50
                          ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                          : "bg-gray-50 text-gray-600 border-gray-200"
                      }
                    >
                      {candidate.avgMatchScore}%
                    </Badge>
                  )}
                </div>

                {/* Location and Experience */}
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-3">
                  {candidate.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{candidate.location}</span>
                    </div>
                  )}
                  {candidate.yearsOfExperience !== undefined && (
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      <span>{candidate.yearsOfExperience} yrs exp</span>
                    </div>
                  )}
                </div>

                {/* Skills */}
                {candidate.skills && candidate.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {candidate.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {candidate.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{candidate.skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-xs pt-3 border-t">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-muted-foreground">Applications: </span>
                      <span className="font-medium">{candidate.applicationCount || 0}</span>
                    </div>
                    {candidate.topMatchCount !== undefined && candidate.topMatchCount > 0 && (
                      <div>
                        <span className="text-muted-foreground">Top Matches: </span>
                        <span className="font-medium text-green-600">{candidate.topMatchCount}</span>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/candidates/${candidate.uid}`);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
