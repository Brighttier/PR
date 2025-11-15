"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Briefcase, ArrowRight, Clock, MessageSquare, Loader2 } from "lucide-react";

interface InterviewSummary {
  duration: number;
  questionsAsked: number;
  completedAt: Date;
  jobTitle: string;
  companyName: string;
}

export default function InterviewCompletePage() {
  const params = useParams();
  const interviewId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<InterviewSummary | null>(null);

  useEffect(() => {
    const loadInterviewSummary = async () => {
      try {
        const interviewRef = doc(db, "interviews", interviewId);
        const interviewSnap = await getDoc(interviewRef);

        if (interviewSnap.exists()) {
          const data = interviewSnap.data();
          setSummary({
            duration: data.duration || 0,
            questionsAsked: data.questionsAsked || 0,
            completedAt: data.completedAt?.toDate() || new Date(),
            jobTitle: data.jobTitle || "Position",
            companyName: data.companyName || "Company",
          });
        }
      } catch (error) {
        console.error("Error loading interview summary:", error);
      } finally {
        setLoading(false);
      }
    };

    if (interviewId) {
      loadInterviewSummary();
    }
  }, [interviewId]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} min ${secs} sec`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl">
        <Card>
          <CardContent className="pt-12 pb-8">
            {/* Success Animation */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full animate-in zoom-in duration-500">
                <CheckCircle2 className="w-16 h-16 text-green-600" />
              </div>
            </div>

            {/* Success Message */}
            <h1 className="text-4xl font-bold mb-3 text-center">Interview Complete!</h1>
            <p className="text-lg text-muted-foreground mb-8 text-center max-w-xl mx-auto">
              Thank you for completing your AI interview{summary ? ` for ${summary.jobTitle} at ${summary.companyName}` : ""}. Your responses have been recorded and will be reviewed by the hiring team.
            </p>

            {/* Interview Summary */}
            {summary && (
              <>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
                  <h2 className="font-semibold mb-4 text-center">Interview Summary</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
                      <div className="text-2xl font-bold">{formatDuration(summary.duration)}</div>
                      <div className="text-sm text-muted-foreground">Total Duration</div>
                    </div>
                    <div className="text-center">
                      <MessageSquare className="w-6 h-6 text-primary mx-auto mb-2" />
                      <div className="text-2xl font-bold">{summary.questionsAsked}</div>
                      <div className="text-sm text-muted-foreground">Questions Answered</div>
                    </div>
                    <div className="text-center">
                      <CheckCircle2 className="w-6 h-6 text-primary mx-auto mb-2" />
                      <div className="text-2xl font-bold">100%</div>
                      <div className="text-sm text-muted-foreground">Completion Rate</div>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />
              </>
            )}

            {/* Interview ID */}
            <div className="bg-muted/50 rounded-lg p-4 mb-8 text-center">
              <p className="text-sm text-muted-foreground mb-1">Interview ID</p>
              <p className="font-mono font-semibold text-lg">{interviewId}</p>
            </div>

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
                    Your interview recording and transcript are being processed by AI
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">2.</span>
                  <span>The hiring team will review your interview within 2-3 business days</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">3.</span>
                  <span>
                    You'll receive an email with feedback and next steps
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">4.</span>
                  <span>
                    Track your application status in your candidate dashboard
                  </span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href="/candidate">
                  View Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/candidate/applications">
                  <Briefcase className="w-4 h-4 mr-2" />
                  My Applications
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Questions about your interview?{" "}
          <a href="mailto:support@personarecruit.ai" className="text-primary hover:underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
