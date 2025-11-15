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
import {
  Building2,
  Mail,
  Lock,
  Phone,
  User,
  Globe,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CreditCard,
  Check
} from "lucide-react";

// Step types
type WizardStep = 1 | 2 | 3 | 4;

interface FormData {
  // Step 1: Company Information
  companyName: string;
  industry: string;
  companySize: string;
  websiteUrl: string;
  companyLogoFile: File | null;
  companyLogoUrl?: string;

  // Step 2: Primary Contact
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactTitle: string;

  // Step 3: Account Creation
  password: string;
  confirmPassword: string;
  role: "recruiter" | "hr_admin";

  // Step 4: Billing & Plan
  selectedPlan: "growth" | "professional" | "enterprise";
  billingFrequency: "monthly" | "annual";
  termsAccepted: boolean;
}

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
  "Retail",
  "Consulting",
  "Other"
];

const COMPANY_SIZES = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "500+"
];

const PLANS = [
  {
    id: "growth",
    name: "Growth",
    price: 249,
    features: [
      "Up to 5 team members",
      "10 active job postings",
      "AI-powered candidate matching",
      "Basic analytics",
      "Email support"
    ]
  },
  {
    id: "professional",
    name: "Professional",
    price: 599,
    features: [
      "Up to 20 team members",
      "Unlimited job postings",
      "Advanced AI features",
      "Custom AI agent configuration",
      "Advanced analytics",
      "Priority support",
      "API access"
    ],
    popular: true
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: null,
    features: [
      "Unlimited team members",
      "Unlimited job postings",
      "Custom AI models",
      "Dedicated account manager",
      "Custom integrations",
      "24/7 support",
      "SLA guarantees"
    ]
  }
];

export default function CompanySignupWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    industry: "",
    companySize: "",
    websiteUrl: "",
    companyLogoFile: null,
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    contactTitle: "",
    password: "",
    confirmPassword: "",
    role: "hr_admin",
    selectedPlan: "professional",
    billingFrequency: "monthly",
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
        if (!formData.companyName.trim()) {
          setError("Please enter your company name");
          return false;
        }
        if (!formData.industry) {
          setError("Please select your industry");
          return false;
        }
        if (!formData.companySize) {
          setError("Please select your company size");
          return false;
        }
        return true;

      case 2:
        if (!formData.contactName.trim()) {
          setError("Please enter your full name");
          return false;
        }
        if (!formData.contactEmail.trim()) {
          setError("Please enter your email address");
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
          setError("Please enter a valid email address");
          return false;
        }
        if (!formData.contactPhone.trim()) {
          setError("Please enter your phone number");
          return false;
        }
        return true;

      case 3:
        if (formData.password.length < 8) {
          setError("Password must be at least 8 characters long");
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          return false;
        }
        return true;

      case 4:
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
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];

      if (!validTypes.includes(file.type)) {
        setError("Please upload a PNG, JPG, or SVG file");
        return;
      }

      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        setError("File size must be less than 2MB");
        return;
      }

      updateFormData({ companyLogoFile: file });
      setError("");
    }
  };

  // Handle final submission
  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    setError("");

    try {
      // Generate company ID
      const companyId = `company_${Date.now()}`;

      // 1. Upload company logo if provided
      let companyLogoUrl = "";
      if (formData.companyLogoFile) {
        const logoRef = ref(
          storage,
          `companies/${companyId}/logo/${formData.companyLogoFile.name}`
        );
        await uploadBytes(logoRef, formData.companyLogoFile);
        companyLogoUrl = await getDownloadURL(logoRef);
      }

      // 2. Create company document in Firestore
      await setDoc(doc(db, "companies", companyId), {
        companyId,
        name: formData.companyName,
        industry: formData.industry,
        size: formData.companySize,
        website: formData.websiteUrl,
        logoUrl: companyLogoUrl,
        subscription: {
          plan: formData.selectedPlan,
          status: "trial",
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
          billingFrequency: formData.billingFrequency,
        },
        createdAt: new Date(),
        settings: {
          pipeline: {
            autoRejectEnabled: false,
            autoRejectThreshold: 30,
            minApplicationsThreshold: 5,
          },
          aiAgents: {
            resumeParser: { enabled: true },
            jobMatcher: { enabled: true },
            candidateSummarizer: { enabled: true },
            interviewer: { enabled: true },
          },
        },
      });

      // 3. Create Firebase Auth user for primary contact
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.contactEmail,
        formData.password
      );

      const userId = userCredential.user.uid;

      // 4. Create user profile in Firestore
      await setDoc(doc(db, "users", userId), {
        uid: userId,
        email: formData.contactEmail,
        displayName: formData.contactName,
        role: formData.role,
        companyId,
        photoURL: null,
        phone: formData.contactPhone,
        title: formData.contactTitle,
        createdAt: new Date(),
      });

      // 5. TODO: Create Stripe customer and trial subscription
      // This will be implemented in Phase 3
      // await fetch('/api/billing/create-trial', {
      //   method: 'POST',
      //   body: JSON.stringify({ companyId, userId, plan: formData.selectedPlan })
      // });

      // 6. Redirect based on role
      if (formData.role === "hr_admin") {
        router.push("/company-admin/dashboard");
      } else {
        router.push("/recruiter/dashboard");
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
            <Building2 className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Create Company Account</h1>
          <p className="text-muted-foreground mt-2">
            Start hiring with AI-powered recruitment
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

        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Company Information"}
              {currentStep === 2 && "Primary Contact"}
              {currentStep === 3 && "Account Creation"}
              {currentStep === 4 && "Choose Your Plan"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Tell us about your company"}
              {currentStep === 2 && "Who will be the main point of contact?"}
              {currentStep === 3 && "Create your login credentials"}
              {currentStep === 4 && "Select a plan that fits your needs"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Step 1: Company Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="companyName"
                      type="text"
                      placeholder="Acme Corporation"
                      value={formData.companyName}
                      onChange={(e) => updateFormData({ companyName: e.target.value })}
                      className="pl-10"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <select
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => updateFormData({ industry: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    required
                    disabled={loading}
                  >
                    <option value="">Select an industry</option>
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companySize">Company Size *</Label>
                  <select
                    id="companySize"
                    value={formData.companySize}
                    onChange={(e) => updateFormData({ companySize: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    required
                    disabled={loading}
                  >
                    <option value="">Select company size</option>
                    {COMPANY_SIZES.map((size) => (
                      <option key={size} value={size}>
                        {size} employees
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Website URL (Optional)</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="websiteUrl"
                      type="url"
                      placeholder="https://www.example.com"
                      value={formData.websiteUrl}
                      onChange={(e) => updateFormData({ websiteUrl: e.target.value })}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyLogo">Company Logo (Optional)</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    {formData.companyLogoFile ? (
                      <div className="space-y-3">
                        <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto" />
                        <div>
                          <p className="font-medium text-sm">{formData.companyLogoFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(formData.companyLogoFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateFormData({ companyLogoFile: null })}
                          disabled={loading}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">
                          PNG, JPG, or SVG (max 2MB)
                        </p>
                        <Input
                          id="companyLogo"
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                          onChange={handleLogoChange}
                          className="text-sm"
                          disabled={loading}
                        />
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recommended: 500x500px square image
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Primary Contact */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Your Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="contactName"
                      type="text"
                      placeholder="John Doe"
                      value={formData.contactName}
                      onChange={(e) => updateFormData({ contactName: e.target.value })}
                      className="pl-10"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Your Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="you@company.com"
                      value={formData.contactEmail}
                      onChange={(e) => updateFormData({ contactEmail: e.target.value })}
                      className="pl-10"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Your Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="contactPhone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.contactPhone}
                      onChange={(e) => updateFormData({ contactPhone: e.target.value })}
                      className="pl-10"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactTitle">Your Role/Title *</Label>
                  <Input
                    id="contactTitle"
                    type="text"
                    placeholder="e.g., HR Manager, Recruiter"
                    value={formData.contactTitle}
                    onChange={(e) => updateFormData({ contactTitle: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Account Creation */}
            {currentStep === 3 && (
              <div className="space-y-4">
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

                <div className="space-y-2">
                  <Label htmlFor="role">Your Role in the Platform *</Label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) =>
                      updateFormData({ role: e.target.value as FormData["role"] })
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    disabled={loading}
                  >
                    <option value="hr_admin">HR Admin (Full access)</option>
                    <option value="recruiter">Recruiter (Limited access)</option>
                  </select>
                  <p className="text-xs text-muted-foreground">
                    You can invite more team members later
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Billing & Plan */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Choose Your Plan</h3>

                  <div className="grid gap-4">
                    {PLANS.map((plan) => (
                      <div
                        key={plan.id}
                        onClick={() =>
                          updateFormData({
                            selectedPlan: plan.id as FormData["selectedPlan"],
                          })
                        }
                        className={`relative cursor-pointer rounded-lg border-2 p-6 transition-all ${
                          formData.selectedPlan === plan.id
                            ? "border-primary bg-primary/5"
                            : "border-muted hover:border-muted-foreground/50"
                        }`}
                      >
                        {plan.popular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                            Most Popular
                          </div>
                        )}

                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-lg">{plan.name}</h4>
                            <p className="text-2xl font-bold mt-1">
                              {plan.price ? (
                                <>
                                  ${plan.price}
                                  <span className="text-sm font-normal text-muted-foreground">
                                    /month
                                  </span>
                                </>
                              ) : (
                                <span className="text-xl">Contact Sales</span>
                              )}
                            </p>
                          </div>
                          {formData.selectedPlan === plan.id && (
                            <CheckCircle2 className="w-6 h-6 text-primary" />
                          )}
                        </div>

                        <ul className="space-y-2">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start text-sm">
                              <Check className="w-4 h-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Start with a 14-day free trial</p>
                        <p className="text-sm text-muted-foreground">
                          No credit card required
                        </p>
                      </div>
                      <CreditCard className="w-6 h-6 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
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
                      <a
                        href="/terms"
                        className="text-primary hover:underline"
                        target="_blank"
                      >
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a
                        href="/privacy"
                        className="text-primary hover:underline"
                        target="_blank"
                      >
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
                    "Complete Setup & Start Trial"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <a href="/auth/login" className="text-primary hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
