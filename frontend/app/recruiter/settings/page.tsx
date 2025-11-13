"use client";

import { RecruiterSidebar } from "@/components/recruiter/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function RecruiterSettingsPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <RecruiterSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account and preferences
            </p>
          </div>

          <Card>
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Settings - Coming Soon</h3>
                <p className="text-muted-foreground">
                  Configure notifications, profile, and account settings
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
