"use client";

import { useState, useEffect } from "react";
import { CompanyAdminSidebar } from "@/components/company-admin/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Save,
  AlertCircle,
  Info,
  TrendingDown,
  Target,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

interface PipelineSettings {
  autoRejectEnabled: boolean;
  autoRejectThreshold: number;
  minimumApplications: number;
  sendRejectionEmail: boolean;
  autoAdvanceTopCandidates: boolean;
  topCandidateThreshold: number;
  requireManualReview: boolean;
}

export default function PipelineSettingsPage() {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<PipelineSettings>({
    autoRejectEnabled: false,
    autoRejectThreshold: 30,
    minimumApplications: 5,
    sendRejectionEmail: true,
    autoAdvanceTopCandidates: false,
    topCandidateThreshold: 85,
    requireManualReview: true,
  });

  useEffect(() => {
    fetchSettings();
  }, [userProfile?.companyId]);

  const fetchSettings = async () => {
    if (!userProfile?.companyId) return;

    try {
      setLoading(true);
      const settingsDoc = await getDoc(
        doc(db, "companies", userProfile.companyId, "settings", "pipeline")
      );

      if (settingsDoc.exists()) {
        setSettings({ ...settings, ...settingsDoc.data() });
      }
    } catch (error) {
      console.error("Error fetching pipeline settings:", error);
      toast({
        title: "Error",
        description: "Failed to load pipeline settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!userProfile?.companyId) return;

    setSaving(true);
    try {
      await setDoc(
        doc(db, "companies", userProfile.companyId, "settings", "pipeline"),
        {
          ...settings,
          updatedAt: serverTimestamp(),
          updatedBy: userProfile.email || "unknown",
        }
      );

      toast({
        title: "Settings Saved",
        description: "Pipeline settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving pipeline settings:", error);
      toast({
        title: "Error",
        description: "Failed to save pipeline settings.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <CompanyAdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <CompanyAdminSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Pipeline Settings</h1>
            <p className="text-muted-foreground">
              Configure automated filtering and application processing rules
            </p>
          </div>

          {/* Warning Alert */}
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Important:</strong> These settings affect how applications are automatically processed.
              Changes will apply to all future applications and active job postings.
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            {/* Auto-Reject Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                  Auto-Reject Settings
                </CardTitle>
                <CardDescription>
                  Automatically reject applications below a certain match score threshold
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Enable/Disable Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoReject" className="text-base">
                      Enable Auto-Reject
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically reject applications that don't meet the minimum threshold
                    </p>
                  </div>
                  <Switch
                    id="autoReject"
                    checked={settings.autoRejectEnabled}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, autoRejectEnabled: checked })
                    }
                  />
                </div>

                <Separator />

                {/* Threshold Slider */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Auto-Reject Threshold</Label>
                    <span className="text-2xl font-bold text-red-600">
                      {settings.autoRejectThreshold}%
                    </span>
                  </div>
                  <Slider
                    value={[settings.autoRejectThreshold]}
                    onValueChange={([value]) =>
                      setSettings({ ...settings, autoRejectThreshold: value })
                    }
                    min={0}
                    max={100}
                    step={5}
                    disabled={!settings.autoRejectEnabled}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Applications with match scores below {settings.autoRejectThreshold}% will be
                    automatically rejected. Currently rejecting the lowest{" "}
                    {settings.autoRejectThreshold}% of candidates.
                  </p>
                </div>

                <Separator />

                {/* Minimum Applications */}
                <div className="space-y-2">
                  <Label htmlFor="minApps">Minimum Applications Required</Label>
                  <Input
                    id="minApps"
                    type="number"
                    min={1}
                    max={100}
                    value={settings.minimumApplications}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        minimumApplications: parseInt(e.target.value) || 5,
                      })
                    }
                    disabled={!settings.autoRejectEnabled}
                  />
                  <p className="text-sm text-muted-foreground">
                    Auto-reject will only activate if at least this many applications exist for a
                    job. This prevents premature filtering with limited data.
                  </p>
                </div>

                <Separator />

                {/* Send Rejection Email */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sendEmail">Send Rejection Notification</Label>
                    <p className="text-sm text-muted-foreground">
                      Send email to candidates when they are auto-rejected
                    </p>
                  </div>
                  <Switch
                    id="sendEmail"
                    checked={settings.sendRejectionEmail}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, sendRejectionEmail: checked })
                    }
                    disabled={!settings.autoRejectEnabled}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Auto-Advance Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-500" />
                  Auto-Advance Top Candidates
                </CardTitle>
                <CardDescription>
                  Automatically move high-scoring candidates to the next stage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Enable/Disable Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoAdvance" className="text-base">
                      Enable Auto-Advance
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Fast-track candidates with exceptional match scores
                    </p>
                  </div>
                  <Switch
                    id="autoAdvance"
                    checked={settings.autoAdvanceTopCandidates}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, autoAdvanceTopCandidates: checked })
                    }
                  />
                </div>

                <Separator />

                {/* Threshold Slider */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Top Candidate Threshold</Label>
                    <span className="text-2xl font-bold text-green-600">
                      {settings.topCandidateThreshold}%
                    </span>
                  </div>
                  <Slider
                    value={[settings.topCandidateThreshold]}
                    onValueChange={([value]) =>
                      setSettings({ ...settings, topCandidateThreshold: value })
                    }
                    min={70}
                    max={100}
                    step={5}
                    disabled={!settings.autoAdvanceTopCandidates}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Candidates with match scores of {settings.topCandidateThreshold}% or higher will
                    automatically advance to the interview screening stage.
                  </p>
                </div>

                <Separator />

                {/* Require Manual Review */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="manualReview">Require Manual Review</Label>
                    <p className="text-sm text-muted-foreground">
                      Require HR admin approval before auto-advancing candidates
                    </p>
                  </div>
                  <Switch
                    id="manualReview"
                    checked={settings.requireManualReview}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, requireManualReview: checked })
                    }
                    disabled={!settings.autoAdvanceTopCandidates}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preview/Impact */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Info className="w-5 h-5" />
                  Current Configuration Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-blue-900">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Auto-Reject:</strong>{" "}
                    {settings.autoRejectEnabled
                      ? `Enabled - Rejecting candidates below ${settings.autoRejectThreshold}% match score (minimum ${settings.minimumApplications} applications required)`
                      : "Disabled - All applications will require manual review"}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Rejection Notifications:</strong>{" "}
                    {settings.sendRejectionEmail && settings.autoRejectEnabled
                      ? "Candidates will receive rejection emails"
                      : "No rejection emails will be sent"}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Auto-Advance:</strong>{" "}
                    {settings.autoAdvanceTopCandidates
                      ? `Enabled - Fast-tracking candidates with ${settings.topCandidateThreshold}%+ match scores${
                          settings.requireManualReview ? " (with manual review)" : ""
                        }`
                      : "Disabled - All candidates follow standard workflow"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={fetchSettings} disabled={saving}>
                Reset
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
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
          </div>
        </div>
      </main>
    </div>
  );
}
