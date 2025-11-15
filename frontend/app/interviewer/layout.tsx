"use client";

import { useAuth } from "@/contexts/AuthContext";
import InterviewerSidebar from "@/components/interviewer/sidebar";
import TopBar from "@/components/layout/topbar";
import { useRouter } from "next/navigation";

export default function InterviewerLayout({
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
      title: "Interview Reminder",
      message: "Interview with John Doe scheduled in 1 hour",
      timestamp: "30 minutes ago",
      read: false,
      type: "warning" as const,
    },
    {
      id: "2",
      title: "Feedback Required",
      message: "Please submit feedback for yesterday's interview with Jane Smith",
      timestamp: "2 hours ago",
      read: false,
      type: "info" as const,
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <InterviewerSidebar
        user={userData}
        pendingFeedbackCount={3}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar
          user={userData}
          role="interviewer"
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
