"use client";

import {
  BarChart3,
  Briefcase,
  FileText,
  Users,
  UsersRound,
  Folder,
  Calendar,
  GitBranch,
  Sparkles,
  Settings,
  Brain,
} from "lucide-react";
import BaseSidebar, { NavItem } from "@/components/layout/base-sidebar";

interface CompanyAdminSidebarProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  companyName?: string;
  onLogout?: () => void;
}

function CompanyAdminSidebar({
  user,
  companyName,
  onLogout,
}: CompanyAdminSidebarProps) {
  const navItems: NavItem[] = [
    {
      href: "/company-admin/dashboard",
      label: "Dashboard",
      icon: BarChart3,
    },
    {
      href: "/company-admin/jobs",
      label: "Jobs",
      icon: Briefcase,
    },
    {
      href: "/company-admin/applications",
      label: "Applications",
      icon: FileText,
    },
    {
      href: "/company-admin/candidates",
      label: "Candidates",
      icon: Users,
    },
    {
      href: "/company-admin/team",
      label: "Team",
      icon: UsersRound,
    },
    {
      href: "/company-admin/talent-pool",
      label: "Talent Pool",
      icon: Folder,
    },
    {
      href: "/company-admin/calendar",
      label: "Calendar",
      icon: Calendar,
    },
    {
      href: "/company-admin/interview-workflow",
      label: "Interview Workflow",
      icon: GitBranch,
    },
    {
      href: "/company-admin/ai-agents",
      label: "AI Agents",
      icon: Sparkles,
    },
    {
      href: "/company-admin/ai-agents/custom",
      label: "Custom Agents",
      icon: Brain,
    },
    {
      href: "/company-admin/settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  return (
    <BaseSidebar
      companyName={companyName || "TechCorp Inc."}
      portalName="Company Admin"
      navItems={navItems}
      user={user}
      onLogout={onLogout}
    />
  );
}

// Named export for imports
export { CompanyAdminSidebar };

// Default export for backward compatibility
export default CompanyAdminSidebar;
