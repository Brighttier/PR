"use client";

import { useState, useEffect } from "react";
import { RecruiterSidebar } from "@/components/recruiter/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  MapPin,
  User,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

interface Interview {
  id: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  type: string;
  scheduledAt: any;
  duration: number;
  status: string;
  meetingLink?: string;
  location?: string;
  interviewers?: string[];
  companyId: string;
}

export default function RecruiterCalendarPage() {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    fetchInterviews();
  }, [userProfile?.companyId]);

  const fetchInterviews = async () => {
    if (!userProfile?.companyId) return;

    try {
      setLoading(true);
      const q = query(
        collection(db, "interviews"),
        where("companyId", "==", userProfile.companyId),
        orderBy("scheduledAt", "asc")
      );

      const querySnapshot = await getDocs(q);
      const interviewsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Interview[];

      setInterviews(interviewsData);
    } catch (error) {
      console.error("Error fetching interviews:", error);
      toast({
        title: "Error",
        description: "Failed to load interviews.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredInterviews = interviews.filter((interview) => {
    const matchesType = typeFilter === "all" || interview.type === typeFilter;

    // Filter by selected date based on view mode
    const interviewDate = interview.scheduledAt?.toDate
      ? interview.scheduledAt.toDate()
      : new Date(interview.scheduledAt);

    if (viewMode === "day") {
      return (
        matchesType &&
        interviewDate.toDateString() === selectedDate.toDateString()
      );
    } else if (viewMode === "week") {
      const weekStart = getWeekStart(selectedDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return matchesType && interviewDate >= weekStart && interviewDate < weekEnd;
    } else {
      // month view
      return (
        matchesType &&
        interviewDate.getMonth() === selectedDate.getMonth() &&
        interviewDate.getFullYear() === selectedDate.getFullYear()
      );
    }
  });

  const upcomingInterviews = interviews.filter((interview) => {
    const interviewDate = interview.scheduledAt?.toDate
      ? interview.scheduledAt.toDate()
      : new Date(interview.scheduledAt);
    return interviewDate >= new Date() && interview.status !== "completed";
  });

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "";
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  const getInterviewTypeBadge = (type: string) => {
    const badges: Record<string, string> = {
      ai_screening: "bg-purple-50 text-purple-700 border-purple-200",
      ai_technical: "bg-blue-50 text-blue-700 border-blue-200",
      face_to_face: "bg-green-50 text-green-700 border-green-200",
      panel: "bg-orange-50 text-orange-700 border-orange-200",
    };
    return badges[type] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const getInterviewTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      ai_screening: "AI Screening",
      ai_technical: "AI Technical",
      face_to_face: "Face-to-Face",
      panel: "Panel Interview",
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      scheduled: "bg-blue-50 text-blue-700 border-blue-200",
      in_progress: "bg-yellow-50 text-yellow-700 border-yellow-200",
      completed: "bg-green-50 text-green-700 border-green-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
    };
    return badges[status] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    if (viewMode === "day") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    }
    setSelectedDate(newDate);
  };

  const stats = {
    total: upcomingInterviews.length,
    today: interviews.filter((i) => {
      const date = i.scheduledAt?.toDate
        ? i.scheduledAt.toDate()
        : new Date(i.scheduledAt);
      return date.toDateString() === new Date().toDateString();
    }).length,
    thisWeek: interviews.filter((i) => {
      const date = i.scheduledAt?.toDate
        ? i.scheduledAt.toDate()
        : new Date(i.scheduledAt);
      const weekStart = getWeekStart(new Date());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return date >= weekStart && date < weekEnd;
    }).length,
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <RecruiterSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Interview Calendar</h1>
                <p className="text-muted-foreground">
                  Manage and track all scheduled interviews
                </p>
              </div>
              <div className="flex gap-3">
                <Select value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => setSelectedDate(new Date())}>
                  Today
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Upcoming Interviews</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <CalendarIcon className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Today</p>
                      <p className="text-2xl font-bold">{stats.today}</p>
                    </div>
                    <Clock className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">This Week</p>
                      <p className="text-2xl font-bold">{stats.thisWeek}</p>
                    </div>
                    <Video className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Navigation and Filters */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={() => navigateDate("prev")}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-lg font-semibold min-w-[200px] text-center">
                  {viewMode === "day" && selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                  })}
                  {viewMode === "week" && `Week of ${getWeekStart(selectedDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric"
                  })}`}
                  {viewMode === "month" && selectedDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric"
                  })}
                </h2>
                <Button variant="outline" size="icon" onClick={() => navigateDate("next")}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Interview Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="ai_screening">AI Screening</SelectItem>
                    <SelectItem value="ai_technical">AI Technical</SelectItem>
                    <SelectItem value="face_to_face">Face-to-Face</SelectItem>
                    <SelectItem value="panel">Panel Interview</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Calendar View */}
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Interviews</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading interviews...</p>
                </div>
              ) : filteredInterviews.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No interviews scheduled</h3>
                  <p className="text-muted-foreground">
                    {typeFilter !== "all" || viewMode !== "month"
                      ? "Try adjusting your filters or view"
                      : "Schedule interviews from the applications page"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredInterviews.map((interview) => (
                    <Card
                      key={interview.id}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback>
                              {interview.candidateName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold">{interview.candidateName}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {interview.jobTitle}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Badge
                                  variant="outline"
                                  className={getInterviewTypeBadge(interview.type)}
                                >
                                  {getInterviewTypeLabel(interview.type)}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={getStatusBadge(interview.status)}
                                >
                                  {interview.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="w-4 h-4" />
                                <span>{formatDate(interview.scheduledAt)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>
                                  {formatTime(interview.scheduledAt)} ({interview.duration} min)
                                </span>
                              </div>
                              {interview.meetingLink && (
                                <div className="flex items-center gap-1">
                                  <Video className="w-4 h-4" />
                                  <span>Remote</span>
                                </div>
                              )}
                              {interview.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{interview.location}</span>
                                </div>
                              )}
                              {interview.interviewers && interview.interviewers.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  <span>{interview.interviewers.length} interviewer(s)</span>
                                </div>
                              )}
                            </div>
                            {interview.meetingLink && (
                              <div className="mt-3">
                                <Button
                                  size="sm"
                                  onClick={() => window.open(interview.meetingLink, "_blank")}
                                >
                                  <Video className="w-4 h-4 mr-2" />
                                  Join Meeting
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
