"use client";

import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Users,
  Settings,
  FileText,
} from "lucide-react";
import BaseSidebar, { NavItem } from "@/components/layout/base-sidebar";

interface InterviewerSidebarProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  pendingFeedbackCount?: number;
  onLogout?: () => void;
}

export default function InterviewerSidebar({
  user,
  pendingFeedbackCount = 0,
  onLogout,
}: InterviewerSidebarProps) {
  const navItems: NavItem[] = [
    {
      href: "/interviewer/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/interviewer/interviews",
      label: "My Interviews",
      icon: Calendar,
    },
    {
      href: "/interviewer/feedback",
      label: "Feedback",
      icon: MessageSquare,
      badge: pendingFeedbackCount > 0 ? pendingFeedbackCount : undefined,
    },
    {
      href: "/interviewer/candidates",
      label: "Candidates",
      icon: Users,
    },
    {
      href: "/interviewer/calendar",
      label: "Calendar",
      icon: Calendar,
    },
    {
      href: "/interviewer/settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  return (
    <BaseSidebar
      companyName="Persona Recruit"
      portalName="Interviewer Portal"
      navItems={navItems}
      user={user}
      onLogout={onLogout}
    />
  );
}
