"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Briefcase, Mail, Lock, User, AlertCircle, Loader2, Building2, CheckCircle2 } from "lucide-react";

interface InviteData {
  email: string;
  displayName: string;
  role: string;
  companyId: string;
  companyName: string;
  invitedBy: string;
  invitedByName: string;
  status: string;
  expiresAt: Date;
}

export default function AcceptInvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [inviteData, setInviteData] = useState<InviteData | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Fetch invite data on mount
  useEffect(() => {
    const fetchInvite = async () => {
      if (!token) {
        setError("Invalid invitation link. Please check the URL and try again.");
        setLoading(false);
        return;
      }

      try {
        // Query invites collection for the token
        // For simplicity, we're using token as document ID
        // In production, you might want to add an index on token field
        const inviteRef = doc(db, "invites", token);
        const inviteSnap = await getDoc(inviteRef);

        if (!inviteSnap.exists()) {
          setError("Invitation not found. It may have been deleted or already accepted.");
          setLoading(false);
          return;
        }

        const data = inviteSnap.data() as any;

        // Check if invite has expired
        const expiresAt = data.expiresAt.toDate();
        if (new Date() > expiresAt) {
          setError("This invitation has expired. Please contact your administrator for a new invite.");
          setLoading(false);
          return;
        }

        // Check if invite has already been accepted
        if (data.status === "accepted") {
          setError("This invitation has already been accepted.");
          setLoading(false);
          return;
        }

        // Fetch company name
        const companyRef = doc(db, "companies", data.companyId);
        const companySnap = await getDoc(companyRef);
        const companyName = companySnap.exists() ? companySnap.data().name : "Company";

        setInviteData({
          email: data.email,
          displayName: data.displayName,
          role: data.role,
          companyId: data.companyId,
          companyName,
          invitedBy: data.invitedBy,
          invitedByName: data.invitedByName,
          status: data.status,
          expiresAt,
        });

        setDisplayName(data.displayName || "");
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching invite:", err);
        setError("An error occurred while loading the invitation. Please try again.");
        setLoading(false);
      }
    };

    fetchInvite();
  }, [token]);

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!displayName.trim()) {
      setError("Please enter your name");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!inviteData) {
      setError("Invitation data not found");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        inviteData.email,
        password
      );

      const userId = userCredential.user.uid;

      // 2. Create user profile in Firestore
      await setDoc(doc(db, "users", userId), {
        uid: userId,
        email: inviteData.email,
        displayName: displayName.trim(),
        role: inviteData.role,
        companyId: inviteData.companyId,
        photoURL: null,
        createdAt: new Date(),
        invitedBy: inviteData.invitedBy,
      });

      // 3. Update invite status
      const inviteRef = doc(db, "invites", token!);
      await updateDoc(inviteRef, {
        status: "accepted",
        acceptedAt: new Date(),
        acceptedBy: userId,
      });

      // 4. Redirect based on role
      switch (inviteData.role) {
        case "interviewer":
          router.push("/interviewer/dashboard");
          break;
        case "hr_admin":
          router.push("/company-admin/dashboard");
          break;
        case "recruiter":
        default:
          router.push("/recruiter/dashboard");
          break;
      }
    } catch (err: any) {
      console.error("Accept invite error:", err);

      // User-friendly error messages
      if (err.code === "auth/email-already-in-use") {
        setError(
          "An account with this email already exists. Please sign in instead or contact your administrator."
        );
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Please choose a stronger password.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("An error occurred while creating your account. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error && !inviteData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
              <Briefcase className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Invalid Invitation</h1>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  If you believe this is an error, please contact your administrator.
                </p>
                <Button variant="outline" onClick={() => router.push("/auth/login")}>
                  Go to Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Success state - show acceptance form
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <Briefcase className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Accept Invitation</h1>
          <p className="text-muted-foreground mt-2">
            Create your account to join the team
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>You've been invited!</CardTitle>
            <CardDescription>
              {inviteData?.invitedByName} has invited you to join {inviteData?.companyName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Invite Details */}
            <div className="bg-muted/50 rounded-lg p-4 mb-6 space-y-3">
              <div className="flex items-center text-sm">
                <Building2 className="w-4 h-4 text-muted-foreground mr-2" />
                <span className="font-medium">{inviteData?.companyName}</span>
              </div>
              <div className="flex items-center text-sm">
                <Mail className="w-4 h-4 text-muted-foreground mr-2" />
                <span className="text-muted-foreground">{inviteData?.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle2 className="w-4 h-4 text-muted-foreground mr-2" />
                <span className="text-muted-foreground">
                  Role: <span className="font-medium text-foreground capitalize">
                    {inviteData?.role.replace("_", " ")}
                  </span>
                </span>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleAcceptInvite} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Your Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="John Doe"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="pl-10"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={inviteData?.email || ""}
                    className="pl-10 bg-muted"
                    disabled
                    readOnly
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  This email was used to send you the invitation
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    disabled={submitting}
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
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Accept Invitation & Create Account"
                )}
              </Button>
            </form>
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
