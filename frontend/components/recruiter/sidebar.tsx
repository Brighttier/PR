"use client";

import {
  BarChart3,
  Briefcase,
  FileText,
  Users,
  Folder,
  Calendar,
  Settings,
  GitBranch,
  UserPlus,
  ClipboardCheck,
  MessageSquare,
  Award,
  UserCheck,
} from "lucide-react";
import BaseSidebar, { NavItem } from "@/components/layout/base-sidebar";

interface RecruiterSidebarProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  companyName?: string;
  onLogout?: () => void;
}

function RecruiterSidebar({
  user,
  companyName,
  onLogout,
}: RecruiterSidebarProps) {
  const navItems: NavItem[] = [
    {
      href: "/recruiter/dashboard",
      label: "Dashboard",
      icon: BarChart3,
    },
    {
      href: "/recruiter/jobs",
      label: "Jobs",
      icon: Briefcase,
    },
    {
      href: "/recruiter/applications",
      label: "Applications",
      icon: FileText,
    },
    {
      href: "/recruiter/candidates",
      label: "Candidates",
      icon: Users,
    },
    // Recruitment Lifecycle Module
    {
      label: "Recruitment Lifecycle",
      icon: GitBranch,
      children: [
        {
          href: "/recruiter/lifecycle/sourcing",
          label: "Sourcing",
          icon: UserPlus,
        },
        {
          href: "/recruiter/lifecycle/screening",
          label: "Screening",
          icon: ClipboardCheck,
        },
        {
          href: "/recruiter/lifecycle/interviews",
          label: "Interviews",
          icon: MessageSquare,
        },
        {
          href: "/recruiter/lifecycle/offers",
          label: "Offers",
          icon: Award,
        },
        {
          href: "/recruiter/lifecycle/onboarding",
          label: "Onboarding",
          icon: UserCheck,
        },
      ],
    },
    {
      href: "/recruiter/talent-pool",
      label: "Talent Pool",
      icon: Folder,
    },
    {
      href: "/recruiter/calendar",
      label: "Calendar",
      icon: Calendar,
    },
    {
      href: "/recruiter/settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  return (
    <BaseSidebar
      companyName={companyName || "TechCorp Inc."}
      portalName="Recruiter Portal"
      navItems={navItems}
      user={user}
      onLogout={onLogout}
    />
  );
}

// Named export for imports
export { RecruiterSidebar };

// Default export for backward compatibility
export default RecruiterSidebar;
