"use client";

import { useAuth } from "@/contexts/AuthContext";
import CompanyAdminSidebar from "@/components/company-admin/sidebar";
import TopBar from "@/components/layout/topbar";
import { useRouter } from "next/navigation";

export default function CompanyAdminLayout({
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
      title: "New Team Member",
      message: "Alex Thompson has accepted your team invitation",
      timestamp: "1 hour ago",
      read: false,
      type: "success" as const,
    },
    {
      id: "2",
      title: "AI Agent Update",
      message: "Resume Parser AI agent configuration has been updated",
      timestamp: "3 hours ago",
      read: false,
      type: "info" as const,
    },
    {
      id: "3",
      title: "Subscription Renewal",
      message: "Your subscription will renew in 7 days",
      timestamp: "1 day ago",
      read: true,
      type: "warning" as const,
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <CompanyAdminSidebar
        user={userData}
        companyName="TechCorp Inc."
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar
          user={userData}
          role="hr_admin"
          notifications={mockNotifications}
          onLogout={handleLogout}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-muted/30">
          {children}
        </main>
      </div>
    </div>
  );
}
