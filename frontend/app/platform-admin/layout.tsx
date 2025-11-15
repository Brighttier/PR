"use client";

import { useAuth } from "@/contexts/AuthContext";
import PlatformAdminSidebar from "@/components/platform-admin/sidebar";
import TopBar from "@/components/layout/topbar";
import { useRouter } from "next/navigation";

export default function PlatformAdminLayout({
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
    name: user?.displayName || "Admin User",
    email: user?.email || "admin@personarecruit.com",
    avatar: user?.photoURL || undefined,
  };

  // Mock notifications - replace with real data
  const mockNotifications = [
    {
      id: "1",
      title: "System Alert",
      message: "Database backup completed successfully",
      timestamp: "15 minutes ago",
      read: false,
      type: "success" as const,
    },
    {
      id: "2",
      title: "New Company",
      message: "Acme Corp has signed up for the Professional plan",
      timestamp: "2 hours ago",
      read: false,
      type: "info" as const,
    },
    {
      id: "3",
      title: "Performance Warning",
      message: "API response time exceeded threshold in us-west-2",
      timestamp: "4 hours ago",
      read: false,
      type: "warning" as const,
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <PlatformAdminSidebar
        user={userData}
        companiesCount={142}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar
          user={userData}
          role="platform_admin"
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
