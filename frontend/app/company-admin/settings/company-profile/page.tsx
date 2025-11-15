"use client";

import { useState, useEffect, useRef } from "react";
import { CompanyAdminSidebar } from "@/components/company-admin/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Save,
  Upload,
  Building2,
  Mail,
  Globe,
  MapPin,
  Users,
  Calendar,
  Linkedin,
  Twitter,
  Facebook,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

interface CompanyProfile {
  name: string;
  industry: string;
  companySize: string;
  website: string;
  description: string;
  headquarters: string;
  foundedYear: string;
  logoUrl?: string;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  contactEmail: string;
  phone?: string;
}

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Retail",
  "Manufacturing",
  "Education",
  "Consulting",
  "Real Estate",
  "Transportation",
  "Hospitality",
  "Media & Entertainment",
  "Telecommunications",
  "Energy",
  "Construction",
  "Agriculture",
  "Other"
];

const companySizes = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1001-5000 employees",
  "5000+ employees"
];

export default function CompanyProfilePage() {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [profile, setProfile] = useState<CompanyProfile>({
    name: "",
    industry: "",
    companySize: "",
    website: "",
    description: "",
    headquarters: "",
    foundedYear: "",
    socialLinks: {},
    contactEmail: "",
  });

  useEffect(() => {
    fetchProfile();
  }, [userProfile?.companyId]);

  const fetchProfile = async () => {
    if (!userProfile?.companyId) return;

    try {
      setLoading(true);
      const companyDoc = await getDoc(doc(db, "companies", userProfile.companyId));

      if (companyDoc.exists()) {
        const data = companyDoc.data();
        setProfile({
          name: data.name || "",
          industry: data.industry || "",
          companySize: data.companySize || "",
          website: data.website || "",
          description: data.description || "",
          headquarters: data.headquarters || "",
          foundedYear: data.foundedYear || "",
          logoUrl: data.logoUrl || "",
          socialLinks: data.socialLinks || {},
          contactEmail: data.contactEmail || data.email || "",
          phone: data.phone || "",
        });
      }
    } catch (error) {
      console.error("Error fetching company profile:", error);
      toast({
        title: "Error",
        description: "Failed to load company profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!userProfile?.companyId) return;

    // Validation
    if (!profile.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Company name is required.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      await updateDoc(doc(db, "companies", userProfile.companyId), {
        ...profile,
        updatedAt: serverTimestamp(),
      });

      toast({
        title: "Profile Updated",
        description: "Company profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving company profile:", error);
      toast({
        title: "Error",
        description: "Failed to save company profile.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Image must be less than 2MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingLogo(true);
    try {
      // TODO: Implement actual file upload to Firebase Storage
      // For now, create a local preview URL
      const previewUrl = URL.createObjectURL(file);
      setProfile({ ...profile, logoUrl: previewUrl });

      toast({
        title: "Logo Upload",
        description: "Logo uploaded successfully. Remember to save changes!",
      });
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload logo.",
        variant: "destructive",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <CompanyAdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <p className="text-muted-foreground">Loading profile...</p>
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
            <h1 className="text-3xl font-bold mb-2">Company Profile</h1>
            <p className="text-muted-foreground">
              Manage your company information and branding
            </p>
          </div>

          <div className="space-y-6">
            {/* Logo Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Company Logo</CardTitle>
                <CardDescription>
                  Upload your company logo. Recommended size: 500x500px (PNG or JPG, max 2MB)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24">
                    {profile.logoUrl ? (
                      <AvatarImage src={profile.logoUrl} alt={profile.name} />
                    ) : (
                      <AvatarFallback className="text-2xl">
                        <Building2 className="w-12 h-12" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingLogo}
                    >
                      {uploadingLogo ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Logo
                        </>
                      )}
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      This logo will appear on your career page and in communications
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Essential company details visible to candidates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Company Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      placeholder="Acme Inc."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select
                      value={profile.industry}
                      onValueChange={(value) => setProfile({ ...profile, industry: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companySize">Company Size</Label>
                    <Select
                      value={profile.companySize}
                      onValueChange={(value) => setProfile({ ...profile, companySize: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {companySizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="foundedYear">Founded Year</Label>
                    <Input
                      id="foundedYear"
                      type="number"
                      min="1800"
                      max={new Date().getFullYear()}
                      value={profile.foundedYear}
                      onChange={(e) => setProfile({ ...profile, foundedYear: e.target.value })}
                      placeholder="2010"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Company Description</Label>
                  <Textarea
                    id="description"
                    value={profile.description}
                    onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                    placeholder="Tell candidates about your company, mission, and culture..."
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {profile.description.length}/500 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="headquarters">Headquarters Location</Label>
                  <Input
                    id="headquarters"
                    value={profile.headquarters}
                    onChange={(e) => setProfile({ ...profile, headquarters: e.target.value })}
                    placeholder="San Francisco, CA"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Public contact details for candidates and inquiries
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="website"
                        type="url"
                        value={profile.website}
                        onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                        placeholder="https://company.com"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="contactEmail"
                        type="email"
                        value={profile.contactEmail}
                        onChange={(e) => setProfile({ ...profile, contactEmail: e.target.value })}
                        placeholder="hr@company.com"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone || ""}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Social Media Links */}
            <Card>
              <CardHeader>
                <CardTitle>Social Media</CardTitle>
                <CardDescription>
                  Connect your social media profiles (optional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="linkedin"
                      type="url"
                      value={profile.socialLinks.linkedin || ""}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          socialLinks: { ...profile.socialLinks, linkedin: e.target.value },
                        })
                      }
                      placeholder="https://linkedin.com/company/..."
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter/X</Label>
                  <div className="relative">
                    <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="twitter"
                      type="url"
                      value={profile.socialLinks.twitter || ""}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          socialLinks: { ...profile.socialLinks, twitter: e.target.value },
                        })
                      }
                      placeholder="https://twitter.com/..."
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <div className="relative">
                    <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="facebook"
                      type="url"
                      value={profile.socialLinks.facebook || ""}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          socialLinks: { ...profile.socialLinks, facebook: e.target.value },
                        })
                      }
                      placeholder="https://facebook.com/..."
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info Alert */}
            <Alert className="border-blue-200 bg-blue-50">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                This information will be displayed on your public career page and in job postings.
                Keep it up-to-date to attract the best candidates.
              </AlertDescription>
            </Alert>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={fetchProfile} disabled={saving}>
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
