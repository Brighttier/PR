"use client";

import { useAuth } from "@/contexts/AuthContext";
import RecruiterSidebar from "@/components/recruiter/sidebar";
import TopBar from "@/components/layout/topbar";
import { useRouter } from "next/navigation";

export default function RecruiterLayout({
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
      title: "New Application",
      message: "John Doe applied for Senior Frontend Developer",
      timestamp: "10 minutes ago",
      read: false,
      type: "info" as const,
    },
    {
      id: "2",
      title: "High Match Score",
      message: "Jane Smith is a 95% match for Senior React Developer",
      timestamp: "1 hour ago",
      read: false,
      type: "success" as const,
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <RecruiterSidebar
        user={userData}
        companyName="TechCorp Inc."
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar
          user={userData}
          role="recruiter"
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
