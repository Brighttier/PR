"use client";

import { useAuth } from "@/contexts/AuthContext";
import CandidateSidebar from "@/components/candidate/sidebar";
import TopBar from "@/components/layout/topbar";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Calendar,
  User,
  FileText,
} from "lucide-react";

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  // User data from Firebase Auth
  const userData = {
    name: user?.displayName || "User",
    email: user?.email || "",
    avatar: user?.photoURL || undefined,
  };

  // Mock notifications - replace with real data
  const mockNotifications = [
    {
      id: "1",
      title: "Application Update",
      message: "Your application for Senior Frontend Developer has been reviewed",
      timestamp: "2 hours ago",
      read: false,
      type: "info" as const,
    },
    {
      id: "2",
      title: "Interview Scheduled",
      message: "You have an interview scheduled for tomorrow at 10:00 AM",
      timestamp: "5 hours ago",
      read: false,
      type: "success" as const,
    },
  ];

  // Navigation items for mobile
  const navItems = [
    {
      href: "/candidate",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/candidate/applications",
      label: "My Applications",
      icon: Briefcase,
      badge: 12,
    },
    {
      href: "/candidate/interviews",
      label: "Interviews",
      icon: Calendar,
      badge: 3,
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
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <CandidateSidebar
        user={userData}
        applicationCount={12}
        interviewCount={3}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar
          user={userData}
          role="candidate"
          notifications={mockNotifications}
          onLogout={handleLogout}
          companyName="Persona Recruit"
          portalName="Candidate Portal"
          navItems={navItems}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-muted/30">
          {children}
        </main>
      </div>
    </div>
  );
}
