"use client";

import { useState } from "react";
import { CompanyAdminSidebar } from "@/components/company-admin/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Clock,
  MapPin,
  Video,
  Users,
  Bell,
  Download,
  User,
  Briefcase,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// Types
interface CalendarEvent {
  id: string;
  title: string;
  type: "ai_screening" | "ai_interview" | "video_call" | "in_person" | "meeting" | "assessment";
  candidateName?: string;
  jobRole?: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
  location?: string;
  meetingLink?: string;
  attendees: string[];
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  notes?: string;
  reminder?: number; // minutes before
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  availability: "available" | "busy" | "away";
}

// Mock data
const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "AI Screening - Sarah Johnson",
    type: "ai_screening",
    candidateName: "Sarah Johnson",
    jobRole: "Senior Frontend Developer",
    date: new Date(2025, 10, 15, 10, 0),
    startTime: "10:00 AM",
    endTime: "10:30 AM",
    duration: 30,
    attendees: ["AI Agent"],
    status: "scheduled",
    reminder: 30,
  },
  {
    id: "2",
    title: "Video Interview - Michael Chen",
    type: "video_call",
    candidateName: "Michael Chen",
    jobRole: "Product Manager",
    date: new Date(2025, 10, 15, 14, 0),
    startTime: "02:00 PM",
    endTime: "03:00 PM",
    duration: 60,
    meetingLink: "https://meet.google.com/xyz-abc-def",
    attendees: ["John Doe", "Jane Smith"],
    status: "scheduled",
    reminder: 15,
  },
  {
    id: "3",
    title: "In-Person Interview - Emily Rodriguez",
    type: "in_person",
    candidateName: "Emily Rodriguez",
    jobRole: "UX Designer",
    date: new Date(2025, 10, 16, 11, 0),
    startTime: "11:00 AM",
    endTime: "12:00 PM",
    duration: 60,
    location: "Conference Room A, 5th Floor",
    attendees: ["Sarah Williams", "Tom Anderson"],
    status: "scheduled",
    reminder: 60,
  },
  {
    id: "4",
    title: "Team Sync - Weekly Planning",
    type: "meeting",
    date: new Date(2025, 10, 17, 9, 0),
    startTime: "09:00 AM",
    endTime: "10:00 AM",
    duration: 60,
    meetingLink: "https://zoom.us/j/123456789",
    attendees: ["All Team Members"],
    status: "scheduled",
    reminder: 15,
  },
  {
    id: "5",
    title: "Technical Assessment - David Kim",
    type: "assessment",
    candidateName: "David Kim",
    jobRole: "Backend Engineer",
    date: new Date(2025, 10, 18, 15, 0),
    startTime: "03:00 PM",
    endTime: "04:30 PM",
    duration: 90,
    attendees: ["AI Proctor"],
    status: "scheduled",
  },
];

const mockTeamMembers: TeamMember[] = [
  { id: "1", name: "John Doe", role: "Senior Recruiter", availability: "available" },
  { id: "2", name: "Jane Smith", role: "HR Manager", availability: "busy" },
  { id: "3", name: "Sarah Williams", role: "Technical Interviewer", availability: "available" },
  { id: "4", name: "Tom Anderson", role: "Team Lead", availability: "available" },
  { id: "5", name: "Emma Davis", role: "Recruiter", availability: "away" },
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 15)); // November 15, 2025
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  // New event form state
  const [newEvent, setNewEvent] = useState({
    title: "",
    type: "video_call" as CalendarEvent["type"],
    candidateName: "",
    jobRole: "",
    date: "",
    startTime: "",
    duration: 30,
    location: "",
    meetingLink: "",
    attendees: [] as string[],
    notes: "",
    reminder: 15,
  });

  // Calendar generation
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    return mockEvents.filter((event) => {
      const eventDate = event.date;
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getFilteredEvents = () => {
    let filtered = mockEvents;

    if (filterType !== "all") {
      filtered = filtered.filter((event) => event.type === filterType);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.candidateName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.jobRole?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return mockEvents
      .filter((event) => event.date >= now && event.status === "scheduled")
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);
  };

  const getEventTypeIcon = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "ai_screening":
      case "ai_interview":
        return <CheckCircle2 className="w-3 h-3" />;
      case "video_call":
        return <Video className="w-3 h-3" />;
      case "in_person":
        return <MapPin className="w-3 h-3" />;
      case "meeting":
        return <Users className="w-3 h-3" />;
      case "assessment":
        return <Briefcase className="w-3 h-3" />;
    }
  };

  const getEventTypeColor = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "ai_screening":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "ai_interview":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "video_call":
        return "bg-green-100 text-green-700 border-green-200";
      case "in_person":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "meeting":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "assessment":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  const getStatusColor = (status: CalendarEvent["status"]) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "rescheduled":
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDialog(true);
  };

  const handleCreateEvent = () => {
    // In a real app, this would make an API call
    console.log("Creating event:", newEvent);
    setShowCreateDialog(false);
    // Reset form
    setNewEvent({
      title: "",
      type: "video_call",
      candidateName: "",
      jobRole: "",
      date: "",
      startTime: "",
      duration: 30,
      location: "",
      meetingLink: "",
      attendees: [],
      notes: "",
      reminder: 15,
    });
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const days = getDaysInMonth(currentDate);

  return (
    <div className="flex h-screen bg-gray-50">
      <CompanyAdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage interviews, meetings, and events
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button size="sm" onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Schedule Event
              </Button>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Schedule New Event</DialogTitle>
                    <DialogDescription>
                      Create a new interview, meeting, or event
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-type">Event Type</Label>
                      <Select
                        value={newEvent.type}
                        onValueChange={(value) =>
                          setNewEvent({ ...newEvent, type: value as CalendarEvent["type"] })
                        }
                      >
                        <SelectTrigger id="event-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ai_screening">AI Screening</SelectItem>
                          <SelectItem value="ai_interview">AI Interview</SelectItem>
                          <SelectItem value="video_call">Video Call</SelectItem>
                          <SelectItem value="in_person">In-Person Interview</SelectItem>
                          <SelectItem value="meeting">Team Meeting</SelectItem>
                          <SelectItem value="assessment">Assessment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="event-title">Event Title</Label>
                      <Input
                        id="event-title"
                        placeholder="e.g., Technical Interview - John Doe"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      />
                    </div>

                    {(newEvent.type === "ai_screening" ||
                      newEvent.type === "ai_interview" ||
                      newEvent.type === "video_call" ||
                      newEvent.type === "in_person" ||
                      newEvent.type === "assessment") && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="candidate-name">Candidate Name</Label>
                            <Input
                              id="candidate-name"
                              placeholder="e.g., John Doe"
                              value={newEvent.candidateName}
                              onChange={(e) =>
                                setNewEvent({ ...newEvent, candidateName: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="job-role">Job Role</Label>
                            <Input
                              id="job-role"
                              placeholder="e.g., Senior Frontend Developer"
                              value={newEvent.jobRole}
                              onChange={(e) =>
                                setNewEvent({ ...newEvent, jobRole: e.target.value })
                              }
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="event-date">Date</Label>
                        <Input
                          id="event-date"
                          type="date"
                          value={newEvent.date}
                          onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="start-time">Start Time</Label>
                        <Input
                          id="start-time"
                          type="time"
                          value={newEvent.startTime}
                          onChange={(e) =>
                            setNewEvent({ ...newEvent, startTime: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Select
                        value={newEvent.duration.toString()}
                        onValueChange={(value) =>
                          setNewEvent({ ...newEvent, duration: parseInt(value) })
                        }
                      >
                        <SelectTrigger id="duration">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="90">1.5 hours</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {newEvent.type === "video_call" && (
                      <div className="space-y-2">
                        <Label htmlFor="meeting-link">Meeting Link</Label>
                        <Input
                          id="meeting-link"
                          type="url"
                          placeholder="https://meet.google.com/..."
                          value={newEvent.meetingLink}
                          onChange={(e) =>
                            setNewEvent({ ...newEvent, meetingLink: e.target.value })
                          }
                        />
                      </div>
                    )}

                    {newEvent.type === "in_person" && (
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          placeholder="e.g., Conference Room A, 5th Floor"
                          value={newEvent.location}
                          onChange={(e) =>
                            setNewEvent({ ...newEvent, location: e.target.value })
                          }
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="reminder">Reminder</Label>
                      <Select
                        value={newEvent.reminder.toString()}
                        onValueChange={(value) =>
                          setNewEvent({ ...newEvent, reminder: parseInt(value) })
                        }
                      >
                        <SelectTrigger id="reminder">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No reminder</SelectItem>
                          <SelectItem value="5">5 minutes before</SelectItem>
                          <SelectItem value="15">15 minutes before</SelectItem>
                          <SelectItem value="30">30 minutes before</SelectItem>
                          <SelectItem value="60">1 hour before</SelectItem>
                          <SelectItem value="1440">1 day before</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add any additional notes or instructions..."
                        rows={3}
                        value={newEvent.notes}
                        onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateEvent}>Schedule Event</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column - Calendar */}
            <div className="lg:col-span-3 space-y-6">
              {/* Calendar Controls */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button variant="outline" size="sm" onClick={handleToday}>
                        Today
                      </Button>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={handlePreviousMonth}>
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <h2 className="text-lg font-semibold min-w-[200px] text-center">
                          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h2>
                        <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          placeholder="Search events..."
                          className="pl-9 w-64"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-[180px]">
                          <Filter className="w-4 h-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Events</SelectItem>
                          <SelectItem value="ai_screening">AI Screening</SelectItem>
                          <SelectItem value="ai_interview">AI Interview</SelectItem>
                          <SelectItem value="video_call">Video Calls</SelectItem>
                          <SelectItem value="in_person">In-Person</SelectItem>
                          <SelectItem value="meeting">Meetings</SelectItem>
                          <SelectItem value="assessment">Assessments</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                    {/* Day Headers */}
                    {dayNames.map((day) => (
                      <div
                        key={day}
                        className="bg-gray-50 p-2 text-center text-sm font-semibold text-gray-700"
                      >
                        {day}
                      </div>
                    ))}

                    {/* Calendar Days */}
                    {days.map((day, index) => {
                      const events = getEventsForDate(day);
                      const isToday =
                        day &&
                        day.getDate() === new Date().getDate() &&
                        day.getMonth() === new Date().getMonth() &&
                        day.getFullYear() === new Date().getFullYear();

                      return (
                        <div
                          key={index}
                          className={`bg-white p-2 min-h-[120px] ${
                            !day ? "bg-gray-50" : ""
                          }`}
                        >
                          {day && (
                            <>
                              <div
                                className={`text-sm font-medium mb-1 ${
                                  isToday
                                    ? "bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center"
                                    : "text-gray-700"
                                }`}
                              >
                                {day.getDate()}
                              </div>
                              <div className="space-y-1">
                                {events.slice(0, 2).map((event) => (
                                  <button
                                    key={event.id}
                                    onClick={() => handleEventClick(event)}
                                    className={`w-full text-left p-1 rounded text-xs border ${getEventTypeColor(
                                      event.type
                                    )} hover:opacity-80 transition-opacity`}
                                  >
                                    <div className="flex items-center gap-1 mb-0.5">
                                      {getEventTypeIcon(event.type)}
                                      <span className="font-medium truncate">
                                        {event.startTime}
                                      </span>
                                    </div>
                                    <div className="truncate">{event.title}</div>
                                  </button>
                                ))}
                                {events.length > 2 && (
                                  <div className="text-xs text-gray-500 pl-1">
                                    +{events.length - 2} more
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-purple-100 border border-purple-200"></div>
                      <span>AI Screening</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-blue-100 border border-blue-200"></div>
                      <span>AI Interview</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-green-100 border border-green-200"></div>
                      <span>Video Call</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-orange-100 border border-orange-200"></div>
                      <span>In-Person</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-gray-100 border border-gray-200"></div>
                      <span>Meeting</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-200"></div>
                      <span>Assessment</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* All Events List */}
              <Card>
                <CardHeader>
                  <CardTitle>All Events</CardTitle>
                  <CardDescription>Complete list of scheduled events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getFilteredEvents().map((event) => (
                      <button
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className={getEventTypeColor(event.type)}>
                                {getEventTypeIcon(event.type)}
                                <span className="ml-1 capitalize">
                                  {event.type.replace("_", " ")}
                                </span>
                              </Badge>
                              <Badge variant="secondary" className={getStatusColor(event.status)}>
                                {event.status}
                              </Badge>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-1">{event.title}</h4>
                            {event.candidateName && (
                              <p className="text-sm text-gray-600 mb-1">
                                <User className="w-3 h-3 inline mr-1" />
                                {event.candidateName} - {event.jobRole}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="w-3 h-3" />
                                {event.date.toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {event.startTime} - {event.endTime}
                              </span>
                              {event.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {event.location}
                                </span>
                              )}
                              {event.meetingLink && (
                                <span className="flex items-center gap-1">
                                  <Video className="w-3 h-3" />
                                  Video call
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-gray-400">
                            <Users className="w-4 h-4 inline mr-1" />
                            {event.attendees.length}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Upcoming Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Upcoming Events</CardTitle>
                  <CardDescription className="text-xs">Next 5 scheduled events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getUpcomingEvents().map((event) => (
                      <button
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <div
                            className={`w-2 h-2 rounded-full mt-1.5 ${
                              event.type === "ai_screening" || event.type === "ai_interview"
                                ? "bg-purple-500"
                                : event.type === "video_call"
                                ? "bg-green-500"
                                : event.type === "in_person"
                                ? "bg-orange-500"
                                : event.type === "assessment"
                                ? "bg-yellow-500"
                                : "bg-gray-500"
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {event.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {event.date.toLocaleDateString()} at {event.startTime}
                            </p>
                            {event.reminder && (
                              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                <Bell className="w-3 h-3" />
                                {event.reminder} min before
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Team Availability */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Team Availability</CardTitle>
                  <CardDescription className="text-xs">Current team status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockTeamMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.role}</p>
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className={
                            member.availability === "available"
                              ? "bg-green-100 text-green-700"
                              : member.availability === "busy"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }
                        >
                          {member.availability}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">This Week</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Events</span>
                    <span className="text-lg font-semibold">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Interviews</span>
                    <span className="text-lg font-semibold">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Meetings</span>
                    <span className="text-lg font-semibold">4</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Completed</span>
                    <span className="text-lg font-semibold text-green-600">6</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Event Details Dialog */}
      {selectedEvent && (
        <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedEvent.title}</DialogTitle>
              <DialogDescription>Event details and information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getEventTypeColor(selectedEvent.type)}>
                  {getEventTypeIcon(selectedEvent.type)}
                  <span className="ml-1 capitalize">
                    {selectedEvent.type.replace("_", " ")}
                  </span>
                </Badge>
                <Badge variant="secondary" className={getStatusColor(selectedEvent.status)}>
                  {selectedEvent.status}
                </Badge>
              </div>

              {selectedEvent.candidateName && (
                <div className="space-y-1">
                  <Label>Candidate</Label>
                  <p className="text-sm">{selectedEvent.candidateName}</p>
                </div>
              )}

              {selectedEvent.jobRole && (
                <div className="space-y-1">
                  <Label>Job Role</Label>
                  <p className="text-sm">{selectedEvent.jobRole}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Date</Label>
                  <p className="text-sm flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    {selectedEvent.date.toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label>Time</Label>
                  <p className="text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {selectedEvent.startTime} - {selectedEvent.endTime}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <Label>Duration</Label>
                <p className="text-sm">{selectedEvent.duration} minutes</p>
              </div>

              {selectedEvent.location && (
                <div className="space-y-1">
                  <Label>Location</Label>
                  <p className="text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {selectedEvent.location}
                  </p>
                </div>
              )}

              {selectedEvent.meetingLink && (
                <div className="space-y-1">
                  <Label>Meeting Link</Label>
                  <a
                    href={selectedEvent.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-2"
                  >
                    <Video className="w-4 h-4" />
                    {selectedEvent.meetingLink}
                  </a>
                </div>
              )}

              <div className="space-y-1">
                <Label>Attendees</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedEvent.attendees.map((attendee, index) => (
                    <Badge key={index} variant="secondary">
                      {attendee}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedEvent.reminder && (
                <div className="space-y-1">
                  <Label>Reminder</Label>
                  <p className="text-sm flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    {selectedEvent.reminder} minutes before
                  </p>
                </div>
              )}

              {selectedEvent.notes && (
                <div className="space-y-1">
                  <Label>Notes</Label>
                  <p className="text-sm text-gray-600">{selectedEvent.notes}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                Close
              </Button>
              <Button variant="outline">
                <AlertCircle className="w-4 h-4 mr-2" />
                Reschedule
              </Button>
              <Button>
                {selectedEvent.type === "video_call" && "Join Meeting"}
                {selectedEvent.type === "in_person" && "View Details"}
                {(selectedEvent.type === "ai_screening" ||
                  selectedEvent.type === "ai_interview") &&
                  "View Results"}
                {selectedEvent.type === "assessment" && "View Assessment"}
                {selectedEvent.type === "meeting" && "View Notes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
