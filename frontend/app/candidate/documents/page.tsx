"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Briefcase,
  Calendar,
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Search,
  Filter,
  File,
  FileCheck,
  Shield,
  CreditCard,
  GraduationCap,
  Heart,
  FileSpreadsheet,
  Building2,
  Plus,
  X,
} from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";

type DocumentStatus = "uploaded" | "pending" | "verified" | "rejected" | "expired";

interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  description: string;
  required: boolean;
  status: DocumentStatus;
  uploadedDate?: string;
  expiryDate?: string;
  verifiedDate?: string;
  fileName?: string;
  fileSize?: string;
  requestedBy?: string;
  notes?: string;
  icon: any;
}

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  // Default document requirements for USA, India, UK, Philippines
  const documents: Document[] = [
    // Identity Documents
    {
      id: "1",
      name: "Government-Issued ID",
      type: "government_id",
      category: "Identity",
      description: "Passport, Driver's License, National ID, Aadhaar (India), or any government-issued photo ID",
      required: true,
      status: "uploaded",
      uploadedDate: "2024-01-15",
      verifiedDate: "2024-01-16",
      fileName: "passport_john_doe.pdf",
      fileSize: "2.4 MB",
      icon: CreditCard,
    },
    {
      id: "2",
      name: "Social Security / National Insurance",
      type: "ssn",
      category: "Identity",
      description: "SSN (USA), National Insurance Number (UK), PAN Card (India), SSS Number (Philippines)",
      required: true,
      status: "uploaded",
      uploadedDate: "2024-01-15",
      verifiedDate: "2024-01-16",
      fileName: "ssn_card.pdf",
      fileSize: "1.2 MB",
      icon: Shield,
    },
    {
      id: "3",
      name: "Proof of Address",
      type: "address_proof",
      category: "Identity",
      description: "Utility bill, bank statement, or lease agreement (not older than 3 months)",
      required: true,
      status: "uploaded",
      uploadedDate: "2024-01-20",
      fileName: "utility_bill_jan_2024.pdf",
      fileSize: "856 KB",
      icon: Building2,
    },

    // Work Authorization
    {
      id: "4",
      name: "Work Authorization",
      type: "work_auth",
      category: "Work Authorization",
      description: "Work Permit, Visa, I-9 (USA), Right to Work (UK), or equivalent documentation",
      required: true,
      status: "verified",
      uploadedDate: "2024-01-10",
      verifiedDate: "2024-01-11",
      expiryDate: "2026-01-10",
      fileName: "h1b_visa.pdf",
      fileSize: "3.1 MB",
      requestedBy: "HR Team",
      icon: FileCheck,
    },

    // Education
    {
      id: "5",
      name: "Degree Certificate",
      type: "degree",
      category: "Education",
      description: "Bachelor's, Master's, or highest degree certificate",
      required: true,
      status: "uploaded",
      uploadedDate: "2024-01-12",
      verifiedDate: "2024-01-13",
      fileName: "bachelor_degree_mit.pdf",
      fileSize: "1.8 MB",
      icon: GraduationCap,
    },
    {
      id: "6",
      name: "Academic Transcripts",
      type: "transcripts",
      category: "Education",
      description: "Official transcripts from all attended institutions",
      required: false,
      status: "uploaded",
      uploadedDate: "2024-01-12",
      fileName: "transcripts_mit.pdf",
      fileSize: "4.2 MB",
      icon: FileSpreadsheet,
    },
    {
      id: "7",
      name: "Professional Certifications",
      type: "certifications",
      category: "Education",
      description: "AWS, Google Cloud, Microsoft, or other professional certifications",
      required: false,
      status: "uploaded",
      uploadedDate: "2024-01-18",
      fileName: "aws_developer_cert.pdf",
      fileSize: "1.1 MB",
      icon: FileCheck,
    },

    // Employment History
    {
      id: "8",
      name: "Previous Employment Letter",
      type: "employment_letter",
      category: "Employment",
      description: "Employment verification letter from previous employer",
      required: false,
      status: "uploaded",
      uploadedDate: "2024-01-14",
      fileName: "techcorp_employment_letter.pdf",
      fileSize: "945 KB",
      requestedBy: "TechCorp Inc.",
      icon: Briefcase,
    },
    {
      id: "9",
      name: "Pay Slips / Salary Proof",
      type: "pay_slips",
      category: "Employment",
      description: "Last 3 months pay slips or salary statements",
      required: false,
      status: "pending",
      requestedBy: "StartupXYZ",
      notes: "Required for salary verification",
      icon: FileSpreadsheet,
    },
    {
      id: "10",
      name: "Relieving Letter",
      type: "relieving_letter",
      category: "Employment",
      description: "Letter from previous employer confirming your last date of employment",
      required: false,
      status: "pending",
      requestedBy: "Digital Solutions",
      icon: File,
    },

    // Background Verification
    {
      id: "11",
      name: "Background Check Consent",
      type: "bg_check",
      category: "Background Verification",
      description: "Signed consent form for background verification",
      required: true,
      status: "uploaded",
      uploadedDate: "2024-01-16",
      fileName: "bg_check_consent.pdf",
      fileSize: "234 KB",
      icon: Shield,
    },
    {
      id: "12",
      name: "Police Clearance / Criminal Record Check",
      type: "police_clearance",
      category: "Background Verification",
      description: "Police clearance certificate or criminal record check (if required by employer)",
      required: false,
      status: "pending",
      notes: "Valid for positions requiring security clearance",
      icon: Shield,
    },
    {
      id: "13",
      name: "Reference Letters",
      type: "references",
      category: "Background Verification",
      description: "Professional reference letters (2-3 references)",
      required: false,
      status: "uploaded",
      uploadedDate: "2024-01-17",
      fileName: "references_combined.pdf",
      fileSize: "1.5 MB",
      icon: File,
    },

    // Financial & Tax
    {
      id: "14",
      name: "Bank Account Details",
      type: "bank_details",
      category: "Financial",
      description: "Bank account details for salary deposit (voided check or bank letter)",
      required: true,
      status: "uploaded",
      uploadedDate: "2024-01-15",
      fileName: "bank_details.pdf",
      fileSize: "567 KB",
      icon: Building2,
    },
    {
      id: "15",
      name: "Tax Forms",
      type: "tax_forms",
      category: "Financial",
      description: "W-4 (USA), P45/P60 (UK), Form 16 (India), BIR Form 2316 (Philippines)",
      required: true,
      status: "pending",
      requestedBy: "HR Team",
      notes: "Required for payroll processing",
      icon: FileSpreadsheet,
    },

    // Health & Insurance
    {
      id: "16",
      name: "Health Insurance Details",
      type: "health_insurance",
      category: "Health",
      description: "Current health insurance information or enrollment forms",
      required: false,
      status: "pending",
      icon: Heart,
    },
    {
      id: "17",
      name: "Medical Fitness Certificate",
      type: "medical_cert",
      category: "Health",
      description: "Medical fitness certificate (if required for specific roles)",
      required: false,
      status: "pending",
      notes: "May be required for certain positions",
      icon: Heart,
    },

    // Resume & Portfolio
    {
      id: "18",
      name: "Updated Resume / CV",
      type: "resume",
      category: "Professional",
      description: "Your latest resume in PDF format",
      required: true,
      status: "uploaded",
      uploadedDate: "2024-01-10",
      verifiedDate: "2024-01-10",
      fileName: "john_candidate_resume_2024.pdf",
      fileSize: "345 KB",
      icon: FileText,
    },
    {
      id: "19",
      name: "Portfolio / Work Samples",
      type: "portfolio",
      category: "Professional",
      description: "Links or files showcasing your work (GitHub, portfolio website, projects)",
      required: false,
      status: "uploaded",
      uploadedDate: "2024-01-10",
      fileName: "portfolio_link.pdf",
      fileSize: "128 KB",
      icon: Briefcase,
    },

    // Other Documents
    {
      id: "20",
      name: "Non-Disclosure Agreement (NDA)",
      type: "nda",
      category: "Legal",
      description: "Signed NDA document",
      required: false,
      status: "pending",
      requestedBy: "Enterprise Co.",
      notes: "Required before technical interview",
      icon: Shield,
    },
  ];

  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case "uploaded":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "verified":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "expired":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case "uploaded":
        return <Clock className="w-4 h-4" />;
      case "verified":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <AlertCircle className="w-4 h-4" />;
      case "rejected":
        return <X className="w-4 h-4" />;
      case "expired":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      doc.status === filterStatus ||
      (filterStatus === "required" && doc.required);

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: documents.length,
    uploaded: documents.filter((d) => d.status === "uploaded" || d.status === "verified").length,
    pending: documents.filter((d) => d.status === "pending").length,
    verified: documents.filter((d) => d.status === "verified").length,
    required: documents.filter((d) => d.required).length,
  };

  const categories = Array.from(new Set(documents.map((d) => d.category)));

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Persona Recruit</h1>
              <p className="text-xs text-muted-foreground">Candidate Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <a href="/candidate" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <FileText className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </a>
          <a href="/candidate/applications" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <Briefcase className="w-5 h-5" />
            <span className="font-medium">My Applications</span>
          </a>
          <a href="/candidate/interviews" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Interviews</span>
          </a>
          <a href="/candidate/profile" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <FileText className="w-5 h-5" />
            <span className="font-medium">My Profile</span>
          </a>
          <a href="/candidate/documents" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground">
            <File className="w-5 h-5" />
            <span className="font-medium">My Documents</span>
            {stats.pending > 0 && (
              <Badge variant="secondary" className="ml-auto bg-yellow-500 text-white">
                {stats.pending}
              </Badge>
            )}
          </a>
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center font-semibold">
              JC
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-sm">John Candidate</p>
              <p className="text-xs text-muted-foreground">candidate@example.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-muted/30">
        <header className="border-b bg-card sticky top-0 z-10">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">My Documents</h2>
                <p className="text-muted-foreground">
                  Manage and upload required documents
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-5 gap-3">
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <File className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Required</p>
                      <p className="text-2xl font-bold">{stats.required}</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Uploaded</p>
                      <p className="text-2xl font-bold">{stats.uploaded}</p>
                    </div>
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Verified</p>
                      <p className="text-2xl font-bold">{stats.verified}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold">{stats.pending}</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search documents by name, category, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Documents</SelectItem>
                    <SelectItem value="required">Required Only</SelectItem>
                    <SelectItem value="pending">Pending Upload</SelectItem>
                    <SelectItem value="uploaded">Uploaded</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Documents by Category */}
          {categories.map((category) => {
            const categoryDocs = filteredDocuments.filter((d) => d.category === category);
            if (categoryDocs.length === 0) return null;

            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-lg">{category}</CardTitle>
                  <CardDescription>
                    {categoryDocs.filter((d) => d.required).length > 0 && (
                      <span className="text-orange-600">
                        {categoryDocs.filter((d) => d.required).length} required document(s)
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryDocs.map((doc) => {
                      const Icon = doc.icon;
                      return (
                        <div
                          key={doc.id}
                          className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold">{doc.name}</h3>
                                  {doc.required && (
                                    <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                                      Required
                                    </Badge>
                                  )}
                                  <Badge className={`text-xs border ${getStatusColor(doc.status)}`}>
                                    <span className="flex items-center gap-1">
                                      {getStatusIcon(doc.status)}
                                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                                    </span>
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {doc.description}
                                </p>

                                {doc.fileName && (
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <File className="w-3 h-3" />
                                      {doc.fileName}
                                    </span>
                                    <span>{doc.fileSize}</span>
                                    {doc.uploadedDate && (
                                      <span>Uploaded: {doc.uploadedDate}</span>
                                    )}
                                    {doc.verifiedDate && (
                                      <span className="text-green-600">
                                        Verified: {doc.verifiedDate}
                                      </span>
                                    )}
                                  </div>
                                )}

                                {doc.requestedBy && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Requested by: <span className="font-medium">{doc.requestedBy}</span>
                                  </p>
                                )}

                                {doc.notes && (
                                  <div className="flex items-start gap-1 mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                                    <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    <span>{doc.notes}</span>
                                  </div>
                                )}

                                {doc.expiryDate && (
                                  <p className="text-xs text-orange-600 mt-1">
                                    Expires: {doc.expiryDate}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {doc.status === "pending" ? (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm">
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Upload {doc.name}</DialogTitle>
                                    <DialogDescription>
                                      {doc.description}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                                      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                      <p className="font-medium mb-1">Click to upload or drag and drop</p>
                                      <p className="text-sm text-muted-foreground">
                                        PDF, DOC, DOCX, JPG, PNG (max 10MB)
                                      </p>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button className="flex-1">Upload File</Button>
                                      <Button variant="outline" className="flex-1">Cancel</Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            ) : (
                              <>
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Upload className="w-4 h-4 mr-2" />
                                  Replace
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredDocuments.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No documents found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
