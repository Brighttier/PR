"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth, storage } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Briefcase,
  User,
  Mail,
  Phone,
  Linkedin,
  Globe,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  FileText
} from "lucide-react";

type ApplicationStep = 1 | 2 | 3;

interface FormData {
  // Step 1: Personal Information
  fullName: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  portfolioUrl: string;

  // Step 2: Resume & Cover Letter
  resumeFile: File | null;
  resumeUrl?: string;
  coverLetter: string;

  // Step 3: Additional Information
  currentSalary: string;
  expectedSalary: string;
  noticePeriod: string;
  referralSource: string;
  aiProcessingConsent: boolean;
  interviewRecordingConsent: boolean;
}

export default function ApplicationFormPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;
  const [user, loadingAuth] = useAuthState(auth);

  const [currentStep, setCurrentStep] = useState<ApplicationStep>(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyId, setCompanyId] = useState("");

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    linkedinUrl: "",
    portfolioUrl: "",
    resumeFile: null,
    coverLetter: "",
    currentSalary: "",
    expectedSalary: "",
    noticePeriod: "",
    referralSource: "",
    aiProcessingConsent: false,
    interviewRecordingConsent: false,
  });

  // Check authentication and load user data
  useEffect(() => {
    const checkAuthAndLoadJob = async () => {
      if (loadingAuth) return;

      if (!user) {
        // Redirect to login with return URL
        router.push(`/auth/login?returnUrl=/careers/${jobId}/apply`);
        return;
      }

      try {
        // Load user profile data
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setFormData((prev) => ({
            ...prev,
            fullName: userData.displayName || user.displayName || "",
            email: user.email || "",
            phone: userData.profile?.phone || "",
            linkedinUrl: userData.profile?.linkedinUrl || "",
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            fullName: user.displayName || "",
            email: user.email || "",
          }));
        }

        // Load job details
        const jobRef = doc(db, "jobs", jobId);
        const jobSnap = await getDoc(jobRef);

        if (!jobSnap.exists()) {
          setError("Job not found");
          setLoading(false);
          return;
        }

        const jobData = jobSnap.data();
        setJobTitle(jobData.title);
        setCompanyId(jobData.companyId);

        // Load company name
        const companyRef = doc(db, "companies", jobData.companyId);
        const companySnap = await getDoc(companyRef);
        setCompanyName(companySnap.exists() ? companySnap.data().name : "Company");

        setLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("An error occurred while loading the application form");
        setLoading(false);
      }
    };

    checkAuthAndLoadJob();
  }, [user, loadingAuth, jobId, router]);

  // Update form data
  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  // Validate current step
  const validateStep = (): boolean => {
    setError("");

    switch (currentStep) {
      case 1:
        if (!formData.fullName.trim()) {
          setError("Please enter your full name");
          return false;
        }
        if (!formData.email.trim()) {
          setError("Please enter your email address");
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError("Please enter a valid email address");
          return false;
        }
        if (!formData.phone.trim()) {
          setError("Please enter your phone number");
          return false;
        }
        return true;

      case 2:
        if (!formData.resumeFile) {
          setError("Please upload your resume");
          return false;
        }
        return true;

      case 3:
        if (!formData.aiProcessingConsent) {
          setError("You must consent to AI processing to apply");
          return false;
        }
        if (!formData.interviewRecordingConsent) {
          setError("You must consent to interview recording to apply");
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < 3) {
        setCurrentStep((prev) => (prev + 1) as ApplicationStep);
      }
    }
  };

  // Handle previous step
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as ApplicationStep);
      setError("");
    }
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!validTypes.includes(file.type)) {
        setError("Please upload a PDF, DOC, or DOCX file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }

      updateFormData({ resumeFile: file });
      setError("");
    }
  };

  // Handle final submission
  const handleSubmit = async () => {
    if (!validateStep() || !user) return;

    setSubmitting(true);
    setError("");

    try {
      // Generate application ID
      const applicationId = `APP-${Date.now()}`;

      // 1. Upload resume to Firebase Storage
      let resumeUrl = "";
      if (formData.resumeFile) {
        setUploadProgress(20);
        const resumeRef = ref(
          storage,
          `resumes/${companyId}/${user.uid}/${formData.resumeFile.name}`
        );
        await uploadBytes(resumeRef, formData.resumeFile);
        resumeUrl = await getDownloadURL(resumeRef);
        setUploadProgress(50);
      }

      // 2. Create application document
      await setDoc(doc(db, "applications", applicationId), {
        id: applicationId,
        candidateId: user.uid,
        candidateName: formData.fullName,
        candidateEmail: formData.email,
        candidatePhone: formData.phone,
        jobId,
        jobTitle,
        companyId,
        status: "Applied",
        stage: "Application Review",
        appliedAt: new Date(),
        resumeUrl,
        coverLetter: formData.coverLetter,
        additionalInfo: {
          currentSalary: formData.currentSalary ? parseInt(formData.currentSalary) : null,
          expectedSalary: formData.expectedSalary ? parseInt(formData.expectedSalary) : null,
          noticePeriod: formData.noticePeriod,
          referralSource: formData.referralSource,
          linkedinUrl: formData.linkedinUrl,
          portfolioUrl: formData.portfolioUrl,
        },
        consents: {
          aiProcessing: formData.aiProcessingConsent,
          interviewRecording: formData.interviewRecordingConsent,
          consentedAt: new Date(),
        },
        // Placeholder for AI analysis (will be populated by Cloud Function)
        matchScore: null,
        aiSummary: null,
      });

      setUploadProgress(75);

      // 3. Update job applicants count
      const jobRef = doc(db, "jobs", jobId);
      await updateDoc(jobRef, {
        applicants: increment(1),
      });

      setUploadProgress(100);

      // 4. TODO: Trigger AI processing Cloud Function
      // This will be implemented in Phase 5
      // await fetch('/api/ai/process-application', {
      //   method: 'POST',
      //   body: JSON.stringify({ applicationId, candidateId: user.uid, jobId })
      // });

      // 5. Redirect to success page
      router.push(`/careers/${jobId}/apply/success?applicationId=${applicationId}`);
    } catch (err: any) {
      console.error("Application submission error:", err);
      setError("An error occurred while submitting your application. Please try again.");
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  // Calculate progress percentage
  const progressPercentage = (currentStep / 3) * 100;

  // Loading state
  if (loading || loadingAuth) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading application form...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !jobTitle) {
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
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <Link
            href={`/careers/${jobId}`}
            className="inline-flex items-center text-sm hover:underline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Job Details
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
              <Briefcase className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Apply for Position</h1>
            <p className="text-lg text-muted-foreground">
              {jobTitle} at {companyName}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Step {currentStep} of 3</span>
              <span>{progressPercentage.toFixed(0)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                {currentStep === 1 && "Personal Information"}
                {currentStep === 2 && "Resume & Cover Letter"}
                {currentStep === 3 && "Additional Information"}
              </CardTitle>
              <CardDescription>
                {currentStep === 1 && "Tell us about yourself"}
                {currentStep === 2 && "Upload your resume and optionally add a cover letter"}
                {currentStep === 3 && "Complete your application"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e) => updateFormData({ fullName: e.target.value })}
                        className="pl-10"
                        required
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => updateFormData({ email: e.target.value })}
                        className="pl-10"
                        required
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={formData.phone}
                        onChange={(e) => updateFormData({ phone: e.target.value })}
                        className="pl-10"
                        required
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedinUrl">LinkedIn Profile (Optional)</Label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="linkedinUrl"
                        type="url"
                        placeholder="https://www.linkedin.com/in/yourprofile"
                        value={formData.linkedinUrl}
                        onChange={(e) => updateFormData({ linkedinUrl: e.target.value })}
                        className="pl-10"
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="portfolioUrl">Portfolio/Website (Optional)</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="portfolioUrl"
                        type="url"
                        placeholder="https://yourportfolio.com"
                        value={formData.portfolioUrl}
                        onChange={(e) => updateFormData({ portfolioUrl: e.target.value })}
                        className="pl-10"
                        disabled={submitting}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Resume & Cover Letter */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="resume">Resume *</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                      {formData.resumeFile ? (
                        <div className="space-y-3">
                          <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
                          <div>
                            <p className="font-medium">{formData.resumeFile.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(formData.resumeFile.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateFormData({ resumeFile: null })}
                            disabled={submitting}
                          >
                            Remove File
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <div className="space-y-2">
                            <p className="font-medium">Click to upload or drag and drop</p>
                            <p className="text-sm text-muted-foreground">
                              PDF, DOC, or DOCX (max 5MB)
                            </p>
                          </div>
                          <Input
                            id="resume"
                            type="file"
                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={handleFileChange}
                            className="mt-4"
                            disabled={submitting}
                          />
                        </>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your resume will be analyzed by AI for matching
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
                    <Textarea
                      id="coverLetter"
                      placeholder="Tell us why you're a great fit for this role..."
                      value={formData.coverLetter}
                      onChange={(e) => updateFormData({ coverLetter: e.target.value })}
                      rows={6}
                      disabled={submitting}
                    />
                    <p className="text-xs text-muted-foreground">Max 500 characters</p>
                  </div>

                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} />
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Additional Information */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentSalary">Current Salary (Optional)</Label>
                      <Input
                        id="currentSalary"
                        type="number"
                        placeholder="75000"
                        value={formData.currentSalary}
                        onChange={(e) => updateFormData({ currentSalary: e.target.value })}
                        disabled={submitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expectedSalary">Expected Salary (Optional)</Label>
                      <Input
                        id="expectedSalary"
                        type="number"
                        placeholder="90000"
                        value={formData.expectedSalary}
                        onChange={(e) => updateFormData({ expectedSalary: e.target.value })}
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="noticePeriod">Notice Period (Optional)</Label>
                    <select
                      id="noticePeriod"
                      value={formData.noticePeriod}
                      onChange={(e) => updateFormData({ noticePeriod: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      disabled={submitting}
                    >
                      <option value="">Select notice period</option>
                      <option value="immediate">Immediate</option>
                      <option value="2weeks">2 weeks</option>
                      <option value="1month">1 month</option>
                      <option value="2months">2 months</option>
                      <option value="3months">3 months</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="referralSource">How did you hear about us?</Label>
                    <select
                      id="referralSource"
                      value={formData.referralSource}
                      onChange={(e) => updateFormData({ referralSource: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      disabled={submitting}
                    >
                      <option value="">Select source</option>
                      <option value="job_board">Job Board</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="referral">Referral</option>
                      <option value="company_website">Company Website</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="border-t pt-6 space-y-4">
                    <h3 className="font-medium">Required Consents</h3>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="aiProcessing"
                        checked={formData.aiProcessingConsent}
                        onCheckedChange={(checked) =>
                          updateFormData({ aiProcessingConsent: checked as boolean })
                        }
                        disabled={submitting}
                      />
                      <Label htmlFor="aiProcessing" className="font-normal cursor-pointer">
                        I consent to my application being processed by AI for initial screening
                        and matching *
                      </Label>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="interviewRecording"
                        checked={formData.interviewRecordingConsent}
                        onCheckedChange={(checked) =>
                          updateFormData({ interviewRecordingConsent: checked as boolean })
                        }
                        disabled={submitting}
                      />
                      <Label htmlFor="interviewRecording" className="font-normal cursor-pointer">
                        I consent to my interviews being recorded and transcribed for evaluation
                        purposes *
                      </Label>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4 mt-4">
                      <div className="flex items-start space-x-2">
                        <FileText className="w-5 h-5 text-primary mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium mb-1">AI-Powered Application Review</p>
                          <p className="text-muted-foreground">
                            Your application will be analyzed by our AI system to match your
                            skills and experience with the job requirements. This helps us
                            provide faster feedback and ensures fair evaluation.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1 || submitting}
                >
                  Back
                </Button>

                {currentStep < 3 ? (
                  <Button onClick={handleNext} disabled={submitting}>
                    Next
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
