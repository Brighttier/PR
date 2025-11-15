"use client";

import { useState, useEffect } from "react";
import { RecruiterSidebar } from "@/components/recruiter/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Users,
  Target,
  Folder,
  FolderPlus,
  Trash2,
  UserPlus,
  CheckCircle2,
  LinkedinIcon,
  Tag,
  FileText,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddCandidateDialog } from "@/components/dialogs/add-candidate-dialog";
import { DeleteConfirmationDialog } from "@/components/dialogs/delete-confirmation-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

interface TalentCandidate {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  linkedIn?: string;
  skills: string[];
  notes: string;
  companyId: string;
  addedBy: string;
  addedByName: string;
  source: string;
  createdAt: any;
  updatedAt: any;
  resumeFileName?: string;
  resumeUrl?: string;
}

interface TalentFolder {
  id: number;
  name: string;
  description: string;
  color: string;
  candidateCount: number;
  createdDate: string;
}

export default function RecruiterTalentPoolPage() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [skillFilter, setSkillFilter] = useState("all");
  const [selectedCandidate, setSelectedCandidate] = useState<TalentCandidate | null>(null);
  const [showCandidateDialog, setShowCandidateDialog] = useState(false);
  const [showAddCandidateDialog, setShowAddCandidateDialog] = useState(false);
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState<TalentCandidate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [candidates, setCandidates] = useState<TalentCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  // Create folder form state
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("blue");

  // Fetch candidates from Firestore
  useEffect(() => {
    const fetchCandidates = async () => {
      if (!userProfile?.companyId) return;

      try {
        setLoading(true);
        const q = query(
          collection(db, "talentPool"),
          where("companyId", "==", userProfile.companyId)
        );
        const querySnapshot = await getDocs(q);
        const candidatesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as TalentCandidate[];

        setCandidates(candidatesData);
      } catch (error) {
        console.error("Error fetching candidates:", error);
        toast({
          title: "Error",
          description: "Failed to load talent pool candidates.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [userProfile?.companyId, toast]);

  // Refresh candidates list
  const refreshCandidates = async () => {
    if (!userProfile?.companyId) return;

    try {
      const q = query(
        collection(db, "talentPool"),
        where("companyId", "==", userProfile.companyId)
      );
      const querySnapshot = await getDocs(q);
      const candidatesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TalentCandidate[];

      setCandidates(candidatesData);
    } catch (error) {
      console.error("Error refreshing candidates:", error);
    }
  };

  // Mock folders for demonstration (TODO: Implement Firestore folders)
  const folders: TalentFolder[] = [
    {
      id: 1,
      name: "Engineering Talent",
      description: "Top engineering candidates for future roles",
      color: "blue",
      candidateCount: 0,
      createdDate: "Oct 1, 2023",
    },
  ];

  const allSkills = Array.from(new Set(candidates.flatMap(c => c.skills)));

  const stats = {
    total: candidates.length,
    available: candidates.length, // TODO: Add status field
    passive: 0, // TODO: Add status field
    avgMatchScore: 0, // TODO: Implement match scoring
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.skills.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesSkill = skillFilter === "all" || candidate.skills.includes(skillFilter);

    return matchesSearch && matchesSkill;
  });

  const handleViewCandidate = (candidate: TalentCandidate) => {
    setSelectedCandidate(candidate);
    setShowCandidateDialog(true);
  };

  const handleDeleteCandidate = (candidate: TalentCandidate) => {
    setCandidateToDelete(candidate);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!candidateToDelete) return;

    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "talentPool", candidateToDelete.id));

      toast({
        title: "Candidate Removed",
        description: `${candidateToDelete.fullName} has been removed from your talent pool.`,
      });

      // Refresh the list
      await refreshCandidates();
      setShowDeleteDialog(false);
      setCandidateToDelete(null);
    } catch (error) {
      console.error("Error deleting candidate:", error);
      toast({
        title: "Error",
        description: "Failed to remove candidate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateFolder = () => {
    console.log("Creating folder:", {
      newFolderName,
      newFolderDescription,
      newFolderColor,
    });
    // TODO: Implement Firestore folder creation
    setShowCreateFolderDialog(false);
    setNewFolderName("");
    setNewFolderDescription("");
    setNewFolderColor("blue");
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch {
      return "Unknown";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <RecruiterSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Talent Pool</h1>
                <p className="text-muted-foreground">
                  Manage your saved candidates and build relationships for future opportunities
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateFolderDialog(true)}
                  className="gap-2"
                >
                  <FolderPlus className="w-4 h-4" />
                  Create Folder
                </Button>
                <Button onClick={() => setShowAddCandidateDialog(true)} className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  Add Candidate
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Candidates</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Available</p>
                      <p className="text-2xl font-bold">{stats.available}</p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">With Resumes</p>
                      <p className="text-2xl font-bold">
                        {candidates.filter(c => c.resumeUrl).length}
                      </p>
                    </div>
                    <FileText className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Unique Skills</p>
                      <p className="text-2xl font-bold">{allSkills.length}</p>
                    </div>
                    <Target className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={skillFilter} onValueChange={setSkillFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Skill" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skills</SelectItem>
                  {allSkills.slice(0, 20).map((skill) => (
                    <SelectItem key={skill} value={skill}>
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="candidates" className="space-y-4">
            <TabsList>
              <TabsTrigger value="candidates">Candidates ({filteredCandidates.length})</TabsTrigger>
              <TabsTrigger value="folders">Folders ({folders.length})</TabsTrigger>
            </TabsList>

            {/* Candidates Tab */}
            <TabsContent value="candidates">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading candidates...</p>
                </div>
              ) : filteredCandidates.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No candidates found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || skillFilter !== "all"
                      ? "Try adjusting your search or filters"
                      : "Add your first candidate to the talent pool"}
                  </p>
                  {!searchQuery && skillFilter === "all" && (
                    <Button onClick={() => setShowAddCandidateDialog(true)}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add First Candidate
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCandidates.map((candidate) => (
                    <Card
                      key={candidate.id}
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handleViewCandidate(candidate)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback>
                                {candidate.fullName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">{candidate.fullName}</h3>
                              <p className="text-sm text-muted-foreground">
                                {candidate.email}
                              </p>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `mailto:${candidate.email}`;
                              }}>
                                <Mail className="w-4 h-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                if (candidate.resumeUrl) {
                                  window.open(candidate.resumeUrl, '_blank');
                                }
                              }} disabled={!candidate.resumeUrl}>
                                <FileText className="w-4 h-4 mr-2" />
                                View Resume
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCandidate(candidate);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="space-y-3">
                          {candidate.phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="w-4 h-4" />
                              <span>{candidate.phone}</span>
                            </div>
                          )}
                          {candidate.linkedIn && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <LinkedinIcon className="w-4 h-4" />
                              <span className="truncate">{candidate.linkedIn}</span>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-1 pt-2">
                            {candidate.skills.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {candidate.skills.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{candidate.skills.length - 3}
                              </Badge>
                            )}
                          </div>

                          <div className="pt-2 text-xs text-muted-foreground">
                            Added {formatDate(candidate.createdAt)} by {candidate.addedByName}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Folders Tab */}
            <TabsContent value="folders">
              <div className="text-center py-12">
                <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Folders Coming Soon</h3>
                <p className="text-muted-foreground mb-4">
                  Organize your candidates into custom folders
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Candidate Details Dialog */}
      <Dialog open={showCandidateDialog} onOpenChange={setShowCandidateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedCandidate && (
            <>
              <DialogHeader>
                <DialogTitle>Candidate Profile</DialogTitle>
                <DialogDescription>
                  Detailed information about {selectedCandidate.fullName}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <Avatar className="w-20 h-20">
                    <AvatarFallback className="text-2xl">
                      {selectedCandidate.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">{selectedCandidate.fullName}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {selectedCandidate.email}
                      </div>
                      {selectedCandidate.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {selectedCandidate.phone}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-3">
                      {selectedCandidate.linkedIn && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => window.open(selectedCandidate.linkedIn, '_blank')}
                        >
                          <LinkedinIcon className="w-4 h-4" />
                          LinkedIn
                        </Button>
                      )}
                      {selectedCandidate.resumeUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => window.open(selectedCandidate.resumeUrl, '_blank')}
                        >
                          <FileText className="w-4 h-4" />
                          View Resume
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Notes */}
                {selectedCandidate.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {selectedCandidate.notes}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Added to talent pool</span>
                      <span className="font-medium">{formatDate(selectedCandidate.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Added by</span>
                      <span className="font-medium">{selectedCandidate.addedByName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Source</span>
                      <span className="font-medium">{selectedCandidate.source}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    className="flex-1 gap-2"
                    onClick={() => window.location.href = `mailto:${selectedCandidate.email}`}
                  >
                    <Mail className="w-4 h-4" />
                    Send Email
                  </Button>
                  {selectedCandidate.resumeUrl && (
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => window.open(selectedCandidate.resumeUrl, '_blank')}
                    >
                      <FileText className="w-4 h-4" />
                      View Resume
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Candidate Dialog */}
      <AddCandidateDialog
        open={showAddCandidateDialog}
        onOpenChange={setShowAddCandidateDialog}
        onSuccess={refreshCandidates}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        title="Remove Candidate from Talent Pool"
        description="Are you sure you want to remove this candidate from your talent pool?"
        itemName={candidateToDelete?.fullName}
        loading={isDeleting}
        destructiveAction="Remove"
      />

      {/* Create Folder Dialog */}
      <Dialog open={showCreateFolderDialog} onOpenChange={setShowCreateFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Talent Folder</DialogTitle>
            <DialogDescription>
              Organize candidates into folders
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Folder Name</Label>
              <Input
                placeholder="Senior Engineers"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Top senior engineering candidates..."
                value={newFolderDescription}
                onChange={(e) => setNewFolderDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <Select value={newFolderColor} onValueChange={setNewFolderColor}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="purple">Purple</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="orange">Orange</SelectItem>
                  <SelectItem value="pink">Pink</SelectItem>
                  <SelectItem value="yellow">Yellow</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCreateFolderDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleCreateFolder} className="flex-1">
                Create Folder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
