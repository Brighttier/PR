"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, ArrowRight, Sparkles, Users, TrendingUp, Zap } from "lucide-react";

export default function CompanySignupPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to wizard immediately
    router.push("/auth/signup/company/wizard");
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to Persona Recruit AI
          </h1>
          <p className="text-lg text-gray-600">
            Transform your hiring process with AI-powered recruitment
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">Company Signup</CardTitle>
            <CardDescription className="text-base">
              Join leading companies using AI to find the perfect candidates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
                <Sparkles className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">AI-Powered Screening</h3>
                  <p className="text-sm text-gray-600">
                    Automatically screen and rank candidates with advanced AI
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
                <Users className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Team Collaboration</h3>
                  <p className="text-sm text-gray-600">
                    Invite recruiters and interviewers to collaborate seamlessly
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
                <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Smart Matching</h3>
                  <p className="text-sm text-gray-600">
                    Vector-based matching to find candidates that truly fit
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
                <Zap className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Automated Workflows</h3>
                  <p className="text-sm text-gray-600">
                    Save time with AI interviews and automated communications
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <Button
                onClick={() => router.push("/auth/signup/company/wizard")}
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-600 pt-4 border-t">
              Already have an account?{" "}
              <button
                onClick={() => router.push("/auth/login")}
                className="text-green-600 hover:text-green-700 font-semibold"
              >
                Sign in
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            By signing up, you agree to our{" "}
            <a href="/terms" className="text-green-600 hover:text-green-700 underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-green-600 hover:text-green-700 underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
