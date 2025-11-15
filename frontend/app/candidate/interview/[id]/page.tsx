"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import LiveInterviewSession from "@/components/interview/live-interview-session";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface InterviewData {
  jobTitle: string;
  jobId: string;
  companyName: string;
  companyId: string;
  companyLogoUrl?: string;
  type: string;
  scheduledDuration: number;
  candidateId: string;
  candidateName: string;
  status: string;
}

export default function InterviewSessionPage() {
  const params = useParams();
  const interviewId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);

  // Load interview data
  useEffect(() => {
    const loadInterview = async () => {
      try {
        const interviewRef = doc(db, "interviews", interviewId);
        const interviewSnap = await getDoc(interviewRef);

        if (!interviewSnap.exists()) {
          setError("Interview not found");
          setLoading(false);
          return;
        }

        const data = interviewSnap.data() as InterviewData;

        // Validate interview status
        if (data.status === "completed") {
          setError("This interview has already been completed.");
          setLoading(false);
          return;
        }

        if (data.status === "cancelled") {
          setError("This interview has been cancelled.");
          setLoading(false);
          return;
        }

        setInterviewData({
          jobTitle: data.jobTitle || "Position",
          jobId: data.jobId || "",
          companyName: data.companyName || "Company",
          companyId: data.companyId || "",
          companyLogoUrl: data.companyLogoUrl,
          type: data.type || "AI Screening",
          scheduledDuration: data.scheduledDuration || 1800,
          candidateId: data.candidateId || "",
          candidateName: data.candidateName || "",
          status: data.status || "scheduled",
        });

        setLoading(false);
      } catch (err) {
        console.error("Error loading interview:", err);
        setError("Failed to load interview details");
        setLoading(false);
      }
    };

    if (interviewId) {
      loadInterview();
    }
  }, [interviewId]);


  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-2">Unable to Load Interview</div>
              <p>{error}</p>
              <div className="mt-4">
                <a
                  href="/candidate"
                  className="text-sm underline hover:no-underline"
                >
                  Return to Dashboard
                </a>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!interviewData) {
    return null;
  }

  return (
    <LiveInterviewSession
      interviewId={interviewId}
      companyName={interviewData.companyName}
      companyLogoUrl={interviewData.companyLogoUrl}
      jobTitle={interviewData.jobTitle}
      maxDuration={interviewData.scheduledDuration}
    />
  );
}
