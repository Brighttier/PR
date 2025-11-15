"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Briefcase, ArrowRight, Home } from "lucide-react";

export default function ApplicationSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const applicationId = searchParams?.get("applicationId");

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardContent className="pt-12 pb-8 text-center">
            {/* Success Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>

            {/* Success Message */}
            <h1 className="text-3xl font-bold mb-3">Application Submitted!</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Thank you for applying. Your application has been successfully submitted.
            </p>

            {/* Application ID */}
            {applicationId && (
              <div className="bg-muted/50 rounded-lg p-4 mb-8 inline-block">
                <p className="text-sm text-muted-foreground mb-1">Application ID</p>
                <p className="font-mono font-semibold">{applicationId}</p>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8 text-left">
              <h2 className="font-semibold mb-3 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-primary" />
                What happens next?
              </h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-2">1.</span>
                  <span>
                    Our AI will analyze your application and match it with the job requirements
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">2.</span>
                  <span>You'll receive an email confirmation shortly</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">3.</span>
                  <span>
                    The hiring team will review your application and reach out if you're a good
                    fit
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">4.</span>
                  <span>
                    You can track your application status in your candidate dashboard
                  </span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href="/candidate">
                  View My Applications
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/careers">
                  <Home className="w-4 h-4 mr-2" />
                  Browse More Jobs
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Didn't receive a confirmation email?{" "}
          <a href="mailto:support@personarecruit.ai" className="text-primary hover:underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
