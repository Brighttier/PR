"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Bell,
  Lock,
  Mail,
  Loader2,
  Save,
  Settings as SettingsIcon,
} from "lucide-react";

export default function RecruiterSettingsPage() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile settings
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("");

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [newApplications, setNewApplications] = useState(true);
  const [interviewReminders, setInterviewReminders] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [candidateMessages, setCandidateMessages] = useState(true);

  // Load user data
  useEffect(() => {
    if (user && userProfile) {
      setDisplayName(userProfile.displayName || "");
      setEmail(user.email || "");
      setPhone(userProfile.phone || "");
      setTitle(userProfile.title || "");

      // Load notification preferences if they exist
      loadNotificationPreferences();
    }
  }, [user, userProfile]);

  const loadNotificationPreferences = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const prefsRef = doc(db, "users", user.uid);
      const prefsSnap = await getDoc(prefsRef);

      if (prefsSnap.exists()) {
        const data = prefsSnap.data();
        const prefs = data.notificationPreferences || {};

        setEmailNotifications(prefs.emailNotifications ?? true);
        setNewApplications(prefs.newApplications ?? true);
        setInterviewReminders(prefs.interviewReminders ?? true);
        setWeeklyDigest(prefs.weeklyDigest ?? false);
        setCandidateMessages(prefs.candidateMessages ?? true);
      }
    } catch (error) {
      console.error("Error loading notification preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.uid) return;

    setSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        displayName,
        phone,
        title,
        updatedAt: new Date(),
      });

      toast({
        title: "Profile Updated",
        description: "Your profile settings have been saved successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    if (!user?.uid) return;

    setSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        notificationPreferences: {
          emailNotifications,
          newApplications,
          interviewReminders,
          weeklyDigest,
          candidateMessages,
        },
        updatedAt: new Date(),
      });

      toast({
        title: "Notifications Updated",
        description: "Your notification preferences have been saved successfully.",
      });
    } catch (error) {
      console.error("Error updating notifications:", error);
      toast({
        title: "Error",
        description: "Failed to update notifications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="account">
            <Lock className="w-4 h-4 mr-2" />
            Account
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and how you appear to others
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="text-2xl">
                    {displayName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium mb-1">Profile Photo</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    JPG, PNG or GIF. Max size 2MB
                  </p>
                  <Button variant="outline" size="sm" disabled>
                    Upload Photo (Coming Soon)
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Full Name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Recruiter"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">All Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Master switch for all email notifications
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New Applications</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when someone applies to your jobs
                    </p>
                  </div>
                  <Switch
                    checked={newApplications}
                    onCheckedChange={setNewApplications}
                    disabled={!emailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Interview Reminders</p>
                    <p className="text-sm text-muted-foreground">
                      Reminders for upcoming interviews
                    </p>
                  </div>
                  <Switch
                    checked={interviewReminders}
                    onCheckedChange={setInterviewReminders}
                    disabled={!emailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Candidate Messages</p>
                    <p className="text-sm text-muted-foreground">
                      Notifications when candidates send you messages
                    </p>
                  </div>
                  <Switch
                    checked={candidateMessages}
                    onCheckedChange={setCandidateMessages}
                    disabled={!emailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weekly Digest</p>
                    <p className="text-sm text-muted-foreground">
                      Weekly summary of applications and activities
                    </p>
                  </div>
                  <Switch
                    checked={weeklyDigest}
                    onCheckedChange={setWeeklyDigest}
                    disabled={!emailNotifications}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveNotifications} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account security and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Password</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Change your password to keep your account secure
                </p>
                <Button variant="outline" disabled>
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password (Coming Soon)
                </Button>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Account Information</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Role</span>
                    <span className="font-medium capitalize">{userProfile?.role || "Unknown"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Company</span>
                    <span className="font-medium">{userProfile?.companyName || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Member Since</span>
                    <span className="font-medium">
                      {userProfile?.createdAt?.toDate
                        ? userProfile.createdAt.toDate().toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium text-destructive mb-2">Danger Zone</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Permanently delete your account and all associated data
                </p>
                <Button variant="destructive" disabled>
                  Delete Account (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
