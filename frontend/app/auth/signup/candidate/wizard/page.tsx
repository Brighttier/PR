"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import ResumePreviewCard from "@/components/candidate/resume-preview-card";
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Linkedin,
  FileText,
  CheckCircle2,
  AlertCircle,
  Upload,
  Loader2,
  Briefcase
} from "lucide-react";

// Step types
type WizardStep = 1 | 2 | 3 | 4;

interface FormData {
  // Step 1: Account
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;

  // Step 2: Profile
  phone: string;
  location: string;
  linkedinUrl: string;
  yearsOfExperience: number;

  // Step 3: Resume
  resumeFile: File | null;
  resumeUrl?: string;
  parsedData?: {
    skills: string[];
    experience: string;
    education: string;
  };

  // Step 4: Preferences
  desiredJobTitles: string[];
  preferredLocations: string[];
  remotePreference: "remote" | "onsite" | "hybrid" | "any";
  minSalary: string;
  maxSalary: string;
  aiProcessingConsent: boolean;
  emailNotificationsConsent: boolean;
  termsAccepted: boolean;
}

export default function CandidateSignupWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parsingStatus, setParsingStatus] = useState<string>("");
  const [parsedData, setParsedData] = useState<any>(null);
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [userId, setUserId] = useState<string>("");

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    location: "",
    linkedinUrl: "",
    yearsOfExperience: 0,
    resumeFile: null,
    desiredJobTitles: [],
    preferredLocations: [],
    remotePreference: "any",
    minSalary: "",
    maxSalary: "",
    aiProcessingConsent: false,
    emailNotificationsConsent: true,
    termsAccepted: false,
  });

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
        if (formData.password.length < 8) {
          setError("Password must be at least 8 characters long");
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          return false;
        }
        return true;

      case 2:
        if (!formData.phone.trim()) {
          setError("Please enter your phone number");
          return false;
        }
        if (!formData.location.trim()) {
          setError("Please enter your location");
          return false;
        }
        return true;

      case 3:
        if (!formData.resumeFile) {
          setError("Please upload your resume");
          return false;
        }
        return true;

      case 4:
        if (!formData.aiProcessingConsent) {
          setError("You must consent to AI processing to use this platform");
          return false;
        }
        if (!formData.termsAccepted) {
          setError("You must accept the Terms of Service and Privacy Policy");
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
      if (currentStep < 4) {
        setCurrentStep((prev) => (prev + 1) as WizardStep);
      }
    }
  };

  // Handle previous step
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep);
      setError("");
    }
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!validTypes.includes(file.type)) {
        setError("Please upload a PDF, DOC, or DOCX file");
        return;
      }

      // Validate file size (5MB max)
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
    if (!validateStep()) return;

    setLoading(true);
    setError("");

    try {
      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const userId = userCredential.user.uid;
      setUserId(userId); // Store userId in state for job recommendations

      // 2. Upload resume to Firebase Storage
      let resumeUrl = "";
      if (formData.resumeFile) {
        setUploadProgress(30);
        const resumeRef = ref(
          storage,
          `resumes/candidates/${userId}/${formData.resumeFile.name}`
        );
        await uploadBytes(resumeRef, formData.resumeFile);
        resumeUrl = await getDownloadURL(resumeRef);
        setUploadProgress(60);
      }

      // 3. Create user profile in Firestore
      await setDoc(doc(db, "users", userId), {
        uid: userId,
        email: formData.email,
        displayName: formData.fullName,
        role: "candidate",
        companyId: null,
        photoURL: null,
        createdAt: new Date(),
        profile: {
          phone: formData.phone,
          location: formData.location,
          linkedinUrl: formData.linkedinUrl,
          yearsOfExperience: formData.yearsOfExperience,
          resumeUrl,
          preferences: {
            desiredJobTitles: formData.desiredJobTitles,
            preferredLocations: formData.preferredLocations,
            remotePreference: formData.remotePreference,
            salaryRange: {
              min: formData.minSalary ? parseInt(formData.minSalary) : null,
              max: formData.maxSalary ? parseInt(formData.maxSalary) : null,
            },
          },
          consents: {
            aiProcessing: formData.aiProcessingConsent,
            emailNotifications: formData.emailNotificationsConsent,
            termsAccepted: formData.termsAccepted,
            termsAcceptedAt: new Date(),
          },
        },
      });

      setUploadProgress(90);

      // 4. Trigger AI resume parsing with progress updates
      setParsingStatus("Analyzing your resume with AI...");
      try {
        const parseResponse = await fetch('/api/ai/parse-resume', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, resumeUrl })
        });

        if (parseResponse.ok) {
          const parseResult = await parseResponse.json();
          console.log('✅ Resume parsed successfully:', parseResult);
          setParsingStatus("Resume parsed successfully!");
          setParsedData(parseResult.parsedData);
          setSkillSuggestions(parseResult.skillSuggestions || []);

          // Show preview of parsed data
          setShowPreview(true);
          setUploadProgress(100);

          // Auto-close preview and redirect after 5 seconds, or user can click Continue
          return; // Don't redirect yet, wait for user to review
        } else {
          console.warn('⚠️ Resume parsing failed, continuing without parsed data');
          setParsingStatus("Resume parsing failed, but your account was created successfully.");
        }
      } catch (parseError) {
        console.error('Resume parsing error:', parseError);
        setParsingStatus("Resume parsing failed, but your account was created successfully.");
      }

      setUploadProgress(100);

      // 5. Redirect to candidate dashboard (only if not showing preview)
      if (!showPreview) {
        setTimeout(() => router.push("/candidate"), 2000);
      }
    } catch (err: any) {
      console.error("Signup error:", err);

      // User-friendly error messages
      if (err.code === "auth/email-already-in-use") {
        setError("An account with this email already exists. Please sign in instead.");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Please choose a stronger password.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("An error occurred during signup. Please try again.");
      }
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // Calculate progress percentage
  const progressPercentage = (currentStep / 4) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <Briefcase className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Join as a Candidate</h1>
          <p className="text-muted-foreground mt-2">
            Create your account and start applying to jobs
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {currentStep} of 4</span>
            <span>{progressPercentage.toFixed(0)}% Complete</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Conditionally render preview or wizard */}
        {showPreview ? (
          <ResumePreviewCard
            parsedData={parsedData}
            skillSuggestions={skillSuggestions}
            userId={userId}
            onContinue={() => router.push("/candidate")}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>
                {currentStep === 1 && "Create Your Account"}
                {currentStep === 2 && "Profile Information"}
                {currentStep === 3 && "Upload Your Resume"}
                {currentStep === 4 && "Preferences & Consent"}
              </CardTitle>
              <CardDescription>
                {currentStep === 1 && "Enter your email and create a password"}
                {currentStep === 2 && "Tell us a bit about yourself"}
                {currentStep === 3 && "Upload your resume for AI analysis"}
                {currentStep === 4 && "Set your job preferences and review consents"}
              </CardDescription>
            </CardHeader>
            <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Step 1: Account Creation */}
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
                      disabled={loading}
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
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => updateFormData({ password: e.target.value })}
                      className="pl-10"
                      required
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters long
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => updateFormData({ confirmPassword: e.target.value })}
                      className="pl-10"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Profile Information */}
            {currentStep === 2 && (
              <div className="space-y-4">
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
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      type="text"
                      placeholder="San Francisco, CA"
                      value={formData.location}
                      onChange={(e) => updateFormData({ location: e.target.value })}
                      className="pl-10"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn URL (Optional)</Label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="linkedinUrl"
                      type="url"
                      placeholder="https://www.linkedin.com/in/yourusername"
                      value={formData.linkedinUrl}
                      onChange={(e) => updateFormData({ linkedinUrl: e.target.value })}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                  <Input
                    id="yearsOfExperience"
                    type="number"
                    min="0"
                    max="50"
                    value={formData.yearsOfExperience}
                    onChange={(e) =>
                      updateFormData({ yearsOfExperience: parseInt(e.target.value) || 0 })
                    }
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Resume Upload */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resume">Upload Resume *</Label>
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
                          disabled={loading}
                        >
                          Remove File
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <div className="space-y-2">
                          <p className="font-medium">
                            Click to upload or drag and drop
                          </p>
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
                          disabled={loading}
                        />
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your resume will be analyzed by AI to match you with relevant jobs
                  </p>
                </div>

                {uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                {parsingStatus && (
                  <Alert className="mt-4">
                    {parsingStatus.includes("Analyzing") ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    )}
                    <AlertDescription>{parsingStatus}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Step 4: Preferences & Consent */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Job Preferences</h3>

                  <div className="space-y-2">
                    <Label htmlFor="remotePreference">Work Location Preference</Label>
                    <select
                      id="remotePreference"
                      value={formData.remotePreference}
                      onChange={(e) =>
                        updateFormData({
                          remotePreference: e.target.value as FormData["remotePreference"],
                        })
                      }
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      disabled={loading}
                    >
                      <option value="any">Any</option>
                      <option value="remote">Remote Only</option>
                      <option value="onsite">On-site Only</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minSalary">Min Salary (Optional)</Label>
                      <Input
                        id="minSalary"
                        type="number"
                        placeholder="50000"
                        value={formData.minSalary}
                        onChange={(e) => updateFormData({ minSalary: e.target.value })}
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxSalary">Max Salary (Optional)</Label>
                      <Input
                        id="maxSalary"
                        type="number"
                        placeholder="100000"
                        value={formData.maxSalary}
                        onChange={(e) => updateFormData({ maxSalary: e.target.value })}
                        disabled={loading}
                      />
                    </div>
                  </div>
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
                      disabled={loading}
                    />
                    <Label htmlFor="aiProcessing" className="font-normal cursor-pointer">
                      I consent to my application being processed by AI for initial
                      screening and matching *
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="emailNotifications"
                      checked={formData.emailNotificationsConsent}
                      onCheckedChange={(checked) =>
                        updateFormData({ emailNotificationsConsent: checked as boolean })
                      }
                      disabled={loading}
                    />
                    <Label htmlFor="emailNotifications" className="font-normal cursor-pointer">
                      I want to receive email notifications about job matches and application
                      updates
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={formData.termsAccepted}
                      onCheckedChange={(checked) =>
                        updateFormData({ termsAccepted: checked as boolean })
                      }
                      disabled={loading}
                    />
                    <Label htmlFor="terms" className="font-normal cursor-pointer">
                      I agree to the{" "}
                      <a href="/terms" className="text-primary hover:underline" target="_blank">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="/privacy" className="text-primary hover:underline" target="_blank">
                        Privacy Policy
                      </a>{" "}
                      *
                    </Label>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || loading}
              >
                Back
              </Button>

              {currentStep < 4 ? (
                <Button onClick={handleNext} disabled={loading}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Complete Signup"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        )}

        {!showPreview && (
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <a href="/auth/login" className="text-primary hover:underline">
              Sign in
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
