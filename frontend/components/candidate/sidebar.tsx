"use client";

import {
  LayoutDashboard,
  Briefcase,
  Calendar,
  User,
  FileText,
} from "lucide-react";
import BaseSidebar, { NavItem } from "@/components/layout/base-sidebar";

interface CandidateSidebarProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  applicationCount?: number;
  interviewCount?: number;
  onLogout?: () => void;
}

export default function CandidateSidebar({
  user,
  applicationCount = 0,
  interviewCount = 0,
  onLogout,
}: CandidateSidebarProps) {
  const navItems: NavItem[] = [
    {
      href: "/candidate",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/candidate/applications",
      label: "My Applications",
      icon: Briefcase,
      badge: applicationCount > 0 ? applicationCount : undefined,
    },
    {
      href: "/candidate/interviews",
      label: "Interviews",
      icon: Calendar,
      badge: interviewCount > 0 ? interviewCount : undefined,
    },
    {
      href: "/candidate/profile",
      label: "My Profile",
      icon: User,
    },
    {
      href: "/candidate/documents",
      label: "My Documents",
      icon: FileText,
    },
  ];

  return (
    <BaseSidebar
      companyName="Persona Recruit"
      portalName="Candidate Portal"
      navItems={navItems}
      user={user}
      onLogout={onLogout}
    />
  );
}
