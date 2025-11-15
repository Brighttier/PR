"use client";

import { useState, useEffect } from "react";
import { CompanyAdminSidebar } from "@/components/company-admin/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
} from "@/components/ui/dialog";
import {
  Save,
  Plus,
  Edit,
  Trash2,
  Mail,
  Copy,
  Eye,
  Info,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

interface EmailTemplate {
  id: string;
  name: string;
  category: "application" | "interview" | "offer" | "rejection" | "general";
  subject: string;
  body: string;
  variables: string[];
  companyId: string;
  isDefault?: boolean;
  createdAt: any;
  updatedAt: any;
}

const templateCategories = [
  { value: "application", label: "Application Response" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "rejection", label: "Rejection" },
  { value: "general", label: "General" },
];

const availableVariables = [
  { key: "{{candidateName}}", description: "Candidate's full name" },
  { key: "{{candidateFirstName}}", description: "Candidate's first name" },
  { key: "{{jobTitle}}", description: "Job position title" },
  { key: "{{companyName}}", description: "Your company name" },
  { key: "{{interviewDate}}", description: "Interview date" },
  { key: "{{interviewTime}}", description: "Interview time" },
  { key: "{{meetingLink}}", description: "Video meeting link" },
  { key: "{{location}}", description: "Interview location" },
  { key: "{{interviewerName}}", description: "Interviewer's name" },
  { key: "{{applicationDate}}", description: "Application submission date" },
];

const defaultTemplates: Partial<EmailTemplate>[] = [
  {
    name: "Application Received",
    category: "application",
    subject: "Application Received - {{jobTitle}} at {{companyName}}",
    body: `Dear {{candidateName}},

Thank you for your application for the {{jobTitle}} position at {{companyName}}. We have received your application and our team will review it shortly.

We appreciate your interest in joining our team. If your qualifications match our requirements, we will contact you to discuss the next steps.

Best regards,
{{companyName}} Recruitment Team`,
    variables: ["candidateName", "jobTitle", "companyName"],
  },
  {
    name: "Interview Invitation",
    category: "interview",
    subject: "Interview Invitation - {{jobTitle}} at {{companyName}}",
    body: `Dear {{candidateName}},

Congratulations! We were impressed with your application and would like to invite you for an interview for the {{jobTitle}} position.

Interview Details:
- Date: {{interviewDate}}
- Time: {{interviewTime}}
- Meeting Link: {{meetingLink}}

Please confirm your availability at your earliest convenience.

We look forward to speaking with you!

Best regards,
{{interviewerName}}
{{companyName}}`,
    variables: ["candidateName", "jobTitle", "companyName", "interviewDate", "interviewTime", "meetingLink", "interviewerName"],
  },
  {
    name: "Offer Extended",
    category: "offer",
    subject: "Job Offer - {{jobTitle}} at {{companyName}}",
    body: `Dear {{candidateName}},

We are delighted to extend you an offer for the {{jobTitle}} position at {{companyName}}!

After careful consideration, we believe you would be an excellent addition to our team. Please find the formal offer letter attached to this email.

Please review the offer details and let us know if you have any questions. We look forward to welcoming you to {{companyName}}!

Best regards,
{{companyName}} HR Team`,
    variables: ["candidateName", "jobTitle", "companyName"],
  },
  {
    name: "Application Rejected",
    category: "rejection",
    subject: "Update on Your Application - {{jobTitle}}",
    body: `Dear {{candidateName}},

Thank you for your interest in the {{jobTitle}} position at {{companyName}} and for taking the time to apply.

After careful review, we have decided to move forward with other candidates whose qualifications more closely match our current needs.

We truly appreciate your interest in {{companyName}} and encourage you to apply for future positions that align with your skills and experience.

Best of luck in your job search!

Best regards,
{{companyName}} Recruitment Team`,
    variables: ["candidateName", "jobTitle", "companyName"],
  },
];

export default function EmailTemplatesPage() {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<Partial<EmailTemplate> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, [userProfile?.companyId]);

  const fetchTemplates = async () => {
    if (!userProfile?.companyId) return;

    try {
      setLoading(true);
      const q = query(
        collection(db, "emailTemplates"),
        where("companyId", "==", userProfile.companyId)
      );

      const querySnapshot = await getDocs(q);
      const templatesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as EmailTemplate[];

      setTemplates(templatesData);
    } catch (error) {
      console.error("Error fetching email templates:", error);
      toast({
        title: "Error",
        description: "Failed to load email templates.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setCurrentTemplate({
      name: "",
      category: "general",
      subject: "",
      body: "",
      variables: [],
    });
    setShowEditDialog(true);
  };

  const handleEdit = (template: EmailTemplate) => {
    setCurrentTemplate(template);
    setShowEditDialog(true);
  };

  const handleDuplicate = async (template: EmailTemplate) => {
    if (!userProfile?.companyId) return;

    try {
      const duplicatedTemplate = {
        ...template,
        name: `${template.name} (Copy)`,
        companyId: userProfile.companyId,
        isDefault: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      delete (duplicatedTemplate as any).id;

      await addDoc(collection(db, "emailTemplates"), duplicatedTemplate);

      toast({
        title: "Template Duplicated",
        description: "Template has been duplicated successfully.",
      });

      await fetchTemplates();
    } catch (error) {
      console.error("Error duplicating template:", error);
      toast({
        title: "Error",
        description: "Failed to duplicate template.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (template: EmailTemplate) => {
    setCurrentTemplate(template);
    setShowDeleteDialog(true);
  };

  const handlePreview = (template: EmailTemplate) => {
    setCurrentTemplate(template);
    setShowPreviewDialog(true);
  };

  const confirmDelete = async () => {
    if (!currentTemplate?.id) return;

    setDeleting(true);
    try {
      await deleteDoc(doc(db, "emailTemplates", currentTemplate.id));

      toast({
        title: "Template Deleted",
        description: "Email template has been deleted successfully.",
      });

      await fetchTemplates();
      setShowDeleteDialog(false);
      setCurrentTemplate(null);
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({
        title: "Error",
        description: "Failed to delete template.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!userProfile?.companyId || !currentTemplate) return;

    // Validation
    if (!currentTemplate.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Template name is required.",
        variant: "destructive",
      });
      return;
    }

    if (!currentTemplate.subject?.trim()) {
      toast({
        title: "Validation Error",
        description: "Subject line is required.",
        variant: "destructive",
      });
      return;
    }

    if (!currentTemplate.body?.trim()) {
      toast({
        title: "Validation Error",
        description: "Email body is required.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const templateData = {
        name: currentTemplate.name.trim(),
        category: currentTemplate.category || "general",
        subject: currentTemplate.subject.trim(),
        body: currentTemplate.body.trim(),
        variables: extractVariables(currentTemplate.subject + " " + currentTemplate.body),
        companyId: userProfile.companyId,
        updatedAt: serverTimestamp(),
      };

      if (currentTemplate.id) {
        // Update existing template
        await updateDoc(doc(db, "emailTemplates", currentTemplate.id), templateData);
        toast({
          title: "Template Updated",
          description: "Email template has been updated successfully.",
        });
      } else {
        // Create new template
        await addDoc(collection(db, "emailTemplates"), {
          ...templateData,
          createdAt: serverTimestamp(),
        });
        toast({
          title: "Template Created",
          description: "Email template has been created successfully.",
        });
      }

      await fetchTemplates();
      setShowEditDialog(false);
      setCurrentTemplate(null);
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: "Failed to save template.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const extractVariables = (text: string): string[] => {
    const regex = /\{\{(\w+)\}\}/g;
    const matches = text.match(regex);
    return matches ? [...new Set(matches)] : [];
  };

  const insertVariable = (variable: string) => {
    if (!currentTemplate) return;

    const textarea = document.getElementById("templateBody") as HTMLTextAreaElement;
    const cursorPosition = textarea?.selectionStart || currentTemplate.body?.length || 0;
    const currentBody = currentTemplate.body || "";
    const newBody =
      currentBody.slice(0, cursorPosition) +
      variable +
      currentBody.slice(cursorPosition);

    setCurrentTemplate({ ...currentTemplate, body: newBody });
  };

  const loadDefaultTemplates = async () => {
    if (!userProfile?.companyId) return;

    try {
      for (const template of defaultTemplates) {
        await addDoc(collection(db, "emailTemplates"), {
          ...template,
          companyId: userProfile.companyId,
          isDefault: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      toast({
        title: "Default Templates Loaded",
        description: `${defaultTemplates.length} default templates have been added.`,
      });

      await fetchTemplates();
    } catch (error) {
      console.error("Error loading default templates:", error);
      toast({
        title: "Error",
        description: "Failed to load default templates.",
        variant: "destructive",
      });
    }
  };

  const filteredTemplates =
    selectedCategory === "all"
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <CompanyAdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <p className="text-muted-foreground">Loading templates...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <CompanyAdminSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-6xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Email Templates</h1>
              <p className="text-muted-foreground">
                Create and manage email templates for candidate communications
              </p>
            </div>
            <div className="flex gap-3">
              {templates.length === 0 && (
                <Button variant="outline" onClick={loadDefaultTemplates}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Load Defaults
                </Button>
              )}
              <Button onClick={handleCreateNew}>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex items-center gap-4">
            <Label className="text-sm font-medium">Category:</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {templateCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground ml-auto">
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Templates Grid */}
          {filteredTemplates.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Mail className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No templates found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {selectedCategory === "all"
                    ? "Create your first email template to get started"
                    : "No templates in this category"}
                </p>
                <div className="flex gap-3">
                  {templates.length === 0 && (
                    <Button variant="outline" onClick={loadDefaultTemplates}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Load Default Templates
                    </Button>
                  )}
                  <Button onClick={handleCreateNew}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{template.name}</CardTitle>
                        <div className="flex gap-2">
                          <Badge variant="outline">
                            {templateCategories.find((c) => c.value === template.category)?.label}
                          </Badge>
                          {template.isDefault && (
                            <Badge variant="secondary">Default</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <CardDescription className="mt-2">
                      Subject: {template.subject}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {template.body}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handlePreview(template)}>
                        <Eye className="w-3 h-3 mr-1" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(template)}>
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDuplicate(template)}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Duplicate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(template)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Edit/Create Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentTemplate?.id ? "Edit Template" : "Create New Template"}
            </DialogTitle>
            <DialogDescription>
              Create email templates with dynamic variables for personalized communication
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">
                Template Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="templateName"
                value={currentTemplate?.name || ""}
                onChange={(e) =>
                  setCurrentTemplate({ ...currentTemplate, name: e.target.value })
                }
                placeholder="e.g., Interview Invitation"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="templateCategory">Category</Label>
              <Select
                value={currentTemplate?.category || "general"}
                onValueChange={(value: any) =>
                  setCurrentTemplate({ ...currentTemplate, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {templateCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="templateSubject">
                Subject Line <span className="text-red-500">*</span>
              </Label>
              <Input
                id="templateSubject"
                value={currentTemplate?.subject || ""}
                onChange={(e) =>
                  setCurrentTemplate({ ...currentTemplate, subject: e.target.value })
                }
                placeholder="e.g., Interview Invitation - {{jobTitle}}"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="templateBody">
                Email Body <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="templateBody"
                value={currentTemplate?.body || ""}
                onChange={(e) =>
                  setCurrentTemplate({ ...currentTemplate, body: e.target.value })
                }
                placeholder="Write your email template here. Use {{variableName}} for dynamic content."
                rows={12}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Click on variables below to insert them at cursor position
              </p>
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Available Variables:</strong>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {availableVariables.map((variable) => (
                    <button
                      key={variable.key}
                      onClick={() => insertVariable(variable.key)}
                      className="text-left p-2 rounded hover:bg-blue-100 transition-colors text-sm"
                    >
                      <code className="bg-blue-100 px-1 rounded">{variable.key}</code>
                      <span className="text-xs block text-blue-700 mt-1">
                        {variable.description}
                      </span>
                    </button>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate} disabled={saving}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {currentTemplate?.id ? "Update Template" : "Create Template"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
            <DialogDescription>
              This is how the email will appear (with sample variable values)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="mb-2 pb-2 border-b">
                <p className="text-sm text-muted-foreground">Subject:</p>
                <p className="font-semibold">{currentTemplate?.subject}</p>
              </div>
              <div className="whitespace-pre-wrap text-sm">
                {currentTemplate?.body}
              </div>
            </div>

            <Alert className="border-yellow-200 bg-yellow-50">
              <Info className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Note:</strong> Variables like {"{"}
                {"{"}candidateName{"}}"}
                {" "}
                will be automatically replaced with actual values when sending emails.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowPreviewDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Email Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{currentTemplate?.name}"? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Template
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
