"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/auth-provider";
import { useToast } from "@/hooks/use-toast";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Search,
  Loader2,
  TrendingUp,
  Star,
  Briefcase,
  MapPin,
  Eye,
  Plus,
  MoreVertical,
  Trash2,
  Mail,
  UserPlus,
  X,
} from "lucide-react";

interface TalentPoolEntry {
  id: string;
  candidateId?: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  candidateLocation?: string;
  currentTitle?: string;
  currentCompany?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  skills?: string[];
  notes?: string;
  tags?: string[];
  source?: string; // "application" | "manual" | "referral"
  addedBy: string;
  addedByName: string;
  addedAt: any;
  companyId: string;
  photoURL?: string;
}

export default function TalentPoolPage() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [talentPool, setTalentPool] = useState<TalentPoolEntry[]>([]);
  const [filteredTalentPool, setFilteredTalentPool] = useState<TalentPoolEntry[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  // Add candidate dialog
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    currentTitle: "",
    currentCompany: "",
    linkedinUrl: "",
    portfolioUrl: "",
    resumeUrl: "",
    notes: "",
    skills: [] as string[],
    tags: [] as string[],
    source: "manual",
  });
  const [skillInput, setSkillInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  // Load talent pool
  useEffect(() => {
    const loadTalentPool = async () => {
      if (!userProfile?.companyId) return;

      setLoading(true);

      try {
        const talentPoolQuery = query(
          collection(db, "talentPool"),
          where("companyId", "==", userProfile.companyId)
        );
        const snapshot = await getDocs(talentPoolQuery);
        const talentPoolData: TalentPoolEntry[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as TalentPoolEntry));

        // Sort by addedAt (newest first)
        talentPoolData.sort((a, b) => {
          const aTime = a.addedAt?.toDate?.() || new Date(0);
          const bTime = b.addedAt?.toDate?.() || new Date(0);
          return bTime.getTime() - aTime.getTime();
        });

        setTalentPool(talentPoolData);
        setFilteredTalentPool(talentPoolData);
      } catch (error) {
        console.error("Error loading talent pool:", error);
        toast({
          title: "Error",
          description: "Failed to load talent pool.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadTalentPool();
  }, [userProfile?.companyId, toast]);

  // Apply filters
  useEffect(() => {
    let filtered = talentPool;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (entry) =>
          entry.candidateName.toLowerCase().includes(query) ||
          entry.candidateEmail.toLowerCase().includes(query) ||
          entry.currentTitle?.toLowerCase().includes(query) ||
          entry.currentCompany?.toLowerCase().includes(query) ||
          entry.skills?.some((skill) => skill.toLowerCase().includes(query))
      );
    }

    // Tag filter
    if (tagFilter !== "all") {
      filtered = filtered.filter((entry) => entry.tags?.includes(tagFilter));
    }

    // Source filter
    if (sourceFilter !== "all") {
      filtered = filtered.filter((entry) => entry.source === sourceFilter);
    }

    setFilteredTalentPool(filtered);
  }, [searchQuery, tagFilter, sourceFilter, talentPool]);

  // Get unique tags
  const allTags = Array.from(
    new Set(talentPool.flatMap((entry) => entry.tags || []))
  );

  // Add skill
  const addSkill = () => {
    if (skillInput.trim() && !newCandidate.skills.includes(skillInput.trim())) {
      setNewCandidate((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  // Remove skill
  const removeSkill = (skill: string) => {
    setNewCandidate((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  // Add tag
  const addTag = () => {
    if (tagInput.trim() && !newCandidate.tags.includes(tagInput.trim())) {
      setNewCandidate((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  // Remove tag
  const removeTag = (tag: string) => {
    setNewCandidate((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  // Add candidate to talent pool
  const handleAddCandidate = async () => {
    if (!newCandidate.name.trim() || !newCandidate.email.trim()) {
      toast({
        title: "Validation error",
        description: "Name and email are required.",
        variant: "destructive",
      });
      return;
    }

    if (!user || !userProfile?.companyId) {
      toast({
        title: "Error",
        description: "You must be logged in.",
        variant: "destructive",
      });
      return;
    }

    setAdding(true);

    try {
      const entryData: Omit<TalentPoolEntry, "id"> = {
        candidateName: newCandidate.name.trim(),
        candidateEmail: newCandidate.email.trim(),
        candidatePhone: newCandidate.phone.trim() || undefined,
        candidateLocation: newCandidate.location.trim() || undefined,
        currentTitle: newCandidate.currentTitle.trim() || undefined,
        currentCompany: newCandidate.currentCompany.trim() || undefined,
        linkedinUrl: newCandidate.linkedinUrl.trim() || undefined,
        portfolioUrl: newCandidate.portfolioUrl.trim() || undefined,
        resumeUrl: newCandidate.resumeUrl.trim() || undefined,
        skills: newCandidate.skills,
        notes: newCandidate.notes.trim() || undefined,
        tags: newCandidate.tags,
        source: newCandidate.source,
        addedBy: user.uid,
        addedByName: userProfile.displayName || user.email || "",
        addedAt: Timestamp.now(),
        companyId: userProfile.companyId,
      };

      const docRef = await addDoc(collection(db, "talentPool"), entryData);

      setTalentPool((prev) => [
        { id: docRef.id, ...entryData } as TalentPoolEntry,
        ...prev,
      ]);

      toast({
        title: "Candidate added",
        description: `${newCandidate.name} has been added to your talent pool.`,
      });

      // Reset form
      setNewCandidate({
        name: "",
        email: "",
        phone: "",
        location: "",
        currentTitle: "",
        currentCompany: "",
        linkedinUrl: "",
        portfolioUrl: "",
        resumeUrl: "",
        notes: "",
        skills: [],
        tags: [],
        source: "manual",
      });
      setShowAddDialog(false);
    } catch (error) {
      console.error("Error adding candidate:", error);
      toast({
        title: "Error",
        description: "Failed to add candidate.",
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  // Remove candidate from talent pool
  const handleRemoveCandidate = async (entryId: string, candidateName: string) => {
    if (!confirm(`Remove ${candidateName} from talent pool?`)) return;

    try {
      await deleteDoc(doc(db, "talentPool", entryId));

      setTalentPool((prev) => prev.filter((entry) => entry.id !== entryId));

      toast({
        title: "Candidate removed",
        description: `${candidateName} has been removed from your talent pool.`,
      });
    } catch (error) {
      console.error("Error removing candidate:", error);
      toast({
        title: "Error",
        description: "Failed to remove candidate.",
        variant: "destructive",
      });
    }
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
          <h1 className="text-3xl font-bold">Talent Pool</h1>
          <p className="text-muted-foreground">
            Save and organize promising candidates for future opportunities
          </p>
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Candidate
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Candidate to Talent Pool</DialogTitle>
              <DialogDescription>
                Manually add a candidate to your talent pool for future opportunities.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Name and Email */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={newCandidate.name}
                    onChange={(e) =>
                      setNewCandidate((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={newCandidate.email}
                    onChange={(e) =>
                      setNewCandidate((prev) => ({ ...prev, email: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Phone and Location */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    value={newCandidate.phone}
                    onChange={(e) =>
                      setNewCandidate((prev) => ({ ...prev, phone: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="San Francisco, CA"
                    value={newCandidate.location}
                    onChange={(e) =>
                      setNewCandidate((prev) => ({ ...prev, location: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Current Title and Company */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentTitle">Current Title</Label>
                  <Input
                    id="currentTitle"
                    placeholder="Senior Software Engineer"
                    value={newCandidate.currentTitle}
                    onChange={(e) =>
                      setNewCandidate((prev) => ({ ...prev, currentTitle: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentCompany">Current Company</Label>
                  <Input
                    id="currentCompany"
                    placeholder="Acme Inc."
                    value={newCandidate.currentCompany}
                    onChange={(e) =>
                      setNewCandidate((prev) => ({ ...prev, currentCompany: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* LinkedIn and Portfolio */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                  <Input
                    id="linkedinUrl"
                    type="url"
                    placeholder="https://linkedin.com/in/johndoe"
                    value={newCandidate.linkedinUrl}
                    onChange={(e) =>
                      setNewCandidate((prev) => ({ ...prev, linkedinUrl: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                  <Input
                    id="portfolioUrl"
                    type="url"
                    placeholder="https://johndoe.com"
                    value={newCandidate.portfolioUrl}
                    onChange={(e) =>
                      setNewCandidate((prev) => ({ ...prev, portfolioUrl: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Resume URL */}
              <div className="space-y-2">
                <Label htmlFor="resumeUrl">Resume URL</Label>
                <Input
                  id="resumeUrl"
                  type="url"
                  placeholder="https://..."
                  value={newCandidate.resumeUrl}
                  onChange={(e) =>
                    setNewCandidate((prev) => ({ ...prev, resumeUrl: e.target.value }))
                  }
                />
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <div className="flex gap-2">
                  <Input
                    id="skills"
                    placeholder="e.g., React, TypeScript"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addSkill}>
                    Add
                  </Button>
                </div>
                {newCandidate.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newCandidate.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="gap-1">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (for organization)</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    placeholder="e.g., Frontend, Senior"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    Add
                  </Button>
                </div>
                {newCandidate.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newCandidate.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes about this candidate..."
                  value={newCandidate.notes}
                  onChange={(e) =>
                    setNewCandidate((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  rows={3}
                />
              </div>

              {/* Source */}
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Select
                  value={newCandidate.source}
                  onValueChange={(value) =>
                    setNewCandidate((prev) => ({ ...prev, source: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual Entry</SelectItem>
                    <SelectItem value="application">Application</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={adding}>
                Cancel
              </Button>
              <Button onClick={handleAddCandidate} disabled={adding}>
                {adding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add to Talent Pool"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Candidates</p>
                <p className="text-2xl font-bold">{talentPool.length}</p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">From Applications</p>
                <p className="text-2xl font-bold text-green-600">
                  {talentPool.filter((e) => e.source === "application").length}
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
                <p className="text-sm text-muted-foreground">Manual Entries</p>
                <p className="text-2xl font-bold">
                  {talentPool.filter((e) => e.source === "manual").length}
                </p>
              </div>
              <UserPlus className="w-8 h-8 text-muted-foreground" />
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

            {/* Tag Filter */}
            {allTags.length > 0 && (
              <Select value={tagFilter} onValueChange={setTagFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {allTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Source Filter */}
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="manual">Manual Entry</SelectItem>
                <SelectItem value="application">Application</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(searchQuery || tagFilter !== "all" || sourceFilter !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setTagFilter("all");
                  setSourceFilter("all");
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Talent Pool Grid */}
      {filteredTalentPool.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {talentPool.length === 0 ? "No candidates in talent pool" : "No candidates found"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {talentPool.length === 0
                  ? "Start building your talent pool by adding promising candidates."
                  : "Try adjusting your filters."}
              </p>
              {talentPool.length === 0 && (
                <Button onClick={() => setShowAddDialog(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add First Candidate
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTalentPool.map((entry) => (
            <Card key={entry.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={entry.photoURL} />
                      <AvatarFallback>
                        {entry.candidateName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{entry.candidateName}</h3>
                      {entry.currentTitle && (
                        <p className="text-sm text-muted-foreground truncate">
                          {entry.currentTitle}
                        </p>
                      )}
                      {entry.currentCompany && (
                        <p className="text-xs text-muted-foreground truncate">
                          at {entry.currentCompany}
                        </p>
                      )}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {entry.candidateId && (
                        <DropdownMenuItem
                          onClick={() => router.push(`/dashboard/candidates/${entry.candidateId}`)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Profile
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <a href={`mailto:${entry.candidateEmail}`}>
                          <Mail className="w-4 h-4 mr-2" />
                          Send Email
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleRemoveCandidate(entry.id, entry.candidateName)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Contact Info */}
                <div className="space-y-1 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{entry.candidateEmail}</span>
                  </div>
                  {entry.candidateLocation && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{entry.candidateLocation}</span>
                    </div>
                  )}
                </div>

                {/* Skills */}
                {entry.skills && entry.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {entry.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {entry.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{entry.skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                {/* Tags */}
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {entry.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Notes */}
                {entry.notes && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{entry.notes}</p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-xs pt-3 border-t">
                  <div>
                    <span className="text-muted-foreground">Added by </span>
                    <span className="font-medium">{entry.addedByName}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {entry.source}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
