"use client";

import { UserPlus, Search, Upload, Users, TrendingUp, Database } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function SourcingPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <UserPlus className="w-8 h-8 text-green-600" />
            Sourcing
          </h1>
          <p className="text-muted-foreground mt-1">
            Find and attract top talent from multiple channels
          </p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Candidate
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Sourced</CardDescription>
            <CardTitle className="text-3xl">1,234</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Channels</CardDescription>
            <CardTitle className="text-3xl">8</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">LinkedIn, Indeed, Referrals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Response Rate</CardDescription>
            <CardTitle className="text-3xl">34%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+5% improvement</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Talent Pool</CardDescription>
            <CardTitle className="text-3xl">456</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Ready to engage</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="search" className="space-y-4">
        <TabsList>
          <TabsTrigger value="search">
            <Search className="w-4 h-4 mr-2" />
            Search Candidates
          </TabsTrigger>
          <TabsTrigger value="import">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </TabsTrigger>
          <TabsTrigger value="channels">
            <Database className="w-4 h-4 mr-2" />
            Channels
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Talent Database</CardTitle>
              <CardDescription>
                Search through millions of candidates using AI-powered matching
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search by skills, experience, location..."
                  className="flex-1"
                />
                <Button className="bg-green-600 hover:bg-green-700">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>

              {/* Mock Results */}
              <div className="space-y-3 mt-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold">
                              JD
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">John Doe</h3>
                              <p className="text-sm text-muted-foreground">
                                Senior Frontend Developer
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Badge variant="secondary">React</Badge>
                            <Badge variant="secondary">TypeScript</Badge>
                            <Badge variant="secondary">5+ years</Badge>
                            <Badge variant="outline">San Francisco, CA</Badge>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge className="bg-green-100 text-green-700">
                            95% Match
                          </Badge>
                          <Button size="sm" variant="outline">
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Candidates</CardTitle>
              <CardDescription>
                Upload resumes or import from external sources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-12 text-center space-y-4">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="font-medium">Drop files here or click to upload</p>
                  <p className="text-sm text-muted-foreground">
                    Supports PDF, DOC, DOCX (Max 10MB each)
                  </p>
                </div>
                <Button className="bg-green-600 hover:bg-green-700">
                  Choose Files
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { name: "LinkedIn", status: "Connected", count: 450 },
              { name: "Indeed", status: "Connected", count: 320 },
              { name: "Glassdoor", status: "Not Connected", count: 0 },
              { name: "Employee Referrals", status: "Active", count: 89 },
            ].map((channel) => (
              <Card key={channel.name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{channel.name}</CardTitle>
                    <Badge
                      variant={
                        channel.status === "Connected" ||
                        channel.status === "Active"
                          ? "default"
                          : "outline"
                      }
                    >
                      {channel.status}
                    </Badge>
                  </div>
                  <CardDescription>{channel.count} candidates sourced</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    {channel.status === "Not Connected"
                      ? "Connect"
                      : "View Details"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
