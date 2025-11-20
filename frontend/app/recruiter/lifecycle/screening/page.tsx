"use client";

import { ClipboardCheck, FileText, Brain, TrendingUp, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function ScreeningPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <ClipboardCheck className="w-8 h-8 text-green-600" />
            Screening
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered candidate screening and assessment
          </p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Filter className="w-4 h-4 mr-2" />
          Configure Filters
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending Review</CardDescription>
            <CardTitle className="text-3xl">87</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Applications waiting</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>AI Screened</CardDescription>
            <CardTitle className="text-3xl">543</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>95% accuracy rate</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Passed Screening</CardDescription>
            <CardTitle className="text-3xl">234</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Ready for interview</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg Time to Screen</CardDescription>
            <CardTitle className="text-3xl">2.4h</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>70% faster with AI</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Screenings</CardTitle>
          <CardDescription>
            Candidates screened by AI with match scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "Sarah Johnson", role: "Senior Developer", score: 92, status: "Passed" },
              { name: "Michael Chen", role: "Product Manager", score: 88, status: "Passed" },
              { name: "Emily Davis", role: "UX Designer", score: 76, status: "Review Needed" },
              { name: "James Wilson", role: "Data Scientist", score: 45, status: "Rejected" },
            ].map((candidate, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold">
                    {candidate.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{candidate.name}</h3>
                    <p className="text-sm text-muted-foreground">{candidate.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium mb-1">AI Match Score</p>
                    <div className="flex items-center gap-2">
                      <Progress value={candidate.score} className="w-24" />
                      <span className="text-sm font-semibold">{candidate.score}%</span>
                    </div>
                  </div>

                  <Badge
                    variant={
                      candidate.status === "Passed"
                        ? "default"
                        : candidate.status === "Review Needed"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {candidate.status}
                  </Badge>

                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
