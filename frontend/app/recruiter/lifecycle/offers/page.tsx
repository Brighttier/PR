"use client";

import { Award, Send, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function OffersPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Award className="w-8 h-8 text-green-600" />
            Offers
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage job offers
          </p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Send className="w-4 h-4 mr-2" />
          Send Offer
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl">12</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Accepted</CardDescription>
            <CardTitle className="text-3xl">45</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-600">92% acceptance rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Declined</CardDescription>
            <CardTitle className="text-3xl">4</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg Response Time</CardDescription>
            <CardTitle className="text-3xl">3.2d</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Days to respond</p>
          </CardContent>
        </Card>
      </div>

      {/* Offers List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Offers</CardTitle>
          <CardDescription>
            Track offer status and candidate responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                candidate: "Sarah Johnson",
                role: "Senior Frontend Developer",
                salary: "$140,000",
                sent: "2 days ago",
                status: "Pending",
                expires: "5 days",
              },
              {
                candidate: "Michael Chen",
                role: "Product Manager",
                salary: "$160,000",
                sent: "1 week ago",
                status: "Accepted",
                expires: null,
              },
              {
                candidate: "Emily Davis",
                role: "UX Designer",
                salary: "$120,000",
                sent: "3 days ago",
                status: "Pending",
                expires: "4 days",
              },
            ].map((offer, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold">
                    {offer.candidate.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{offer.candidate}</h3>
                    <p className="text-sm text-muted-foreground">{offer.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-semibold">{offer.salary}</p>
                    <p className="text-xs text-muted-foreground">Sent {offer.sent}</p>
                  </div>

                  {offer.status === "Pending" && offer.expires && (
                    <div className="text-right">
                      <p className="text-sm font-medium">Expires in</p>
                      <p className="text-xs text-orange-600">{offer.expires}</p>
                    </div>
                  )}

                  <Badge
                    variant={
                      offer.status === "Accepted"
                        ? "default"
                        : offer.status === "Declined"
                        ? "destructive"
                        : "secondary"
                    }
                    className="min-w-[80px] justify-center"
                  >
                    {offer.status === "Accepted" && (
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                    )}
                    {offer.status === "Declined" && (
                      <XCircle className="w-3 h-3 mr-1" />
                    )}
                    {offer.status === "Pending" && (
                      <Clock className="w-3 h-3 mr-1" />
                    )}
                    {offer.status}
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
