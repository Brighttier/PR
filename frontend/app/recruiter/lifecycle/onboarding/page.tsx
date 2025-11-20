"use client";

import { UserCheck, CheckSquare, FileText, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function OnboardingPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-green-600" />
            Onboarding
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage new hire onboarding process
          </p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <UserCheck className="w-4 h-4 mr-2" />
          Start Onboarding
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>In Progress</CardDescription>
            <CardTitle className="text-3xl">8</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">New hires onboarding</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl">134</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+15% this quarter</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg Completion</CardDescription>
            <CardTitle className="text-3xl">12.4d</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Days to complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Satisfaction</CardDescription>
            <CardTitle className="text-3xl">4.6/5</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-600">Excellent feedback</p>
          </CardContent>
        </Card>
      </div>

      {/* Onboarding List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Onboarding</CardTitle>
          <CardDescription>
            New employees currently in onboarding process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                name: "Sarah Johnson",
                role: "Senior Frontend Developer",
                startDate: "Dec 15, 2025",
                progress: 75,
                daysIn: 9,
              },
              {
                name: "Michael Chen",
                role: "Product Manager",
                startDate: "Dec 10, 2025",
                progress: 90,
                daysIn: 14,
              },
              {
                name: "Emily Davis",
                role: "UX Designer",
                startDate: "Dec 18, 2025",
                progress: 45,
                daysIn: 6,
              },
            ].map((employee, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold">
                    {employee.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div>
                      <h3 className="font-semibold">{employee.name}</h3>
                      <p className="text-sm text-muted-foreground">{employee.role}</p>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Started {employee.startDate}</span>
                      </div>
                      <Badge variant="outline">{employee.daysIn} days in</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right space-y-1 min-w-[150px]">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">{employee.progress}%</span>
                    </div>
                    <Progress value={employee.progress} className="h-2" />
                  </div>

                  <Button size="sm" variant="outline">
                    View Checklist
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Onboarding Checklist Template */}
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Checklist</CardTitle>
          <CardDescription>
            Standard onboarding tasks for new hires
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { task: "Complete HR paperwork", category: "Documentation" },
              { task: "Set up email and accounts", category: "IT Setup" },
              { task: "Complete security training", category: "Training" },
              { task: "Meet with manager", category: "Orientation" },
              { task: "Set up workspace", category: "Facilities" },
              { task: "Review company policies", category: "Compliance" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 border rounded-lg"
              >
                <CheckSquare className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.task}</p>
                </div>
                <Badge variant="secondary">{item.category}</Badge>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">
            <FileText className="w-4 h-4 mr-2" />
            Edit Template
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
