"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Candidate Signup Entry Page
 * Redirects to the wizard for the full signup flow
 */
export default function CandidateSignupPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/auth/signup/candidate/wizard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-lg text-muted-foreground">
        Loading signup form...
      </div>
    </div>
  );
}
