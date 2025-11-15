"use client";

import { useState, useEffect, useRef } from "react";
import { CompanyAdminSidebar } from "@/components/company-admin/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Eye,
  Palette,
  Layout,
  Image as ImageIcon,
  Type,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

interface CareerPageSettings {
  // Hero Section
  heroTitle: string;
  heroSubtitle: string;
  heroBackgroundUrl?: string;
  heroBackgroundType: "color" | "image";
  heroBackgroundColor: string;

  // About Section
  showAboutSection: boolean;
  aboutTitle: string;
  aboutContent: string;

  // Culture Section
  showCultureSection: boolean;
  cultureTitle: string;
  cultureValues: string[];

  // Benefits Section
  showBenefitsSection: boolean;
  benefitsTitle: string;
  benefits: string[];

  // Styling
  primaryColor: string;
  secondaryColor: string;
  fontFamily: "inter" | "poppins" | "roboto" | "montserrat";

  // Job Listing Display
  jobListingLayout: "grid" | "list";
  showSalaryRanges: boolean;
  showApplicationCount: boolean;

  // SEO
  metaTitle: string;
  metaDescription: string;

  // Footer
  showSocialLinks: boolean;
  footerText: string;
}

const fontOptions = [
  { value: "inter", label: "Inter" },
  { value: "poppins", label: "Poppins" },
  { value: "roboto", label: "Roboto" },
  { value: "montserrat", label: "Montserrat" },
];

const defaultCultureValues = [
  "Innovation",
  "Collaboration",
  "Diversity & Inclusion",
  "Work-Life Balance",
];

const defaultBenefits = [
  "Health Insurance",
  "401(k) Matching",
  "Flexible Work Hours",
  "Professional Development",
  "Paid Time Off",
];

export default function CareerPageSettingsPage() {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const heroImageInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [settings, setSettings] = useState<CareerPageSettings>({
    heroTitle: "Join Our Team",
    heroSubtitle: "Build your career with us",
    heroBackgroundType: "color",
    heroBackgroundColor: "#16a34a",
    showAboutSection: true,
    aboutTitle: "About Us",
    aboutContent: "",
    showCultureSection: true,
    cultureTitle: "Our Culture & Values",
    cultureValues: defaultCultureValues,
    showBenefitsSection: true,
    benefitsTitle: "Benefits & Perks",
    benefits: defaultBenefits,
    primaryColor: "#16a34a",
    secondaryColor: "#3b82f6",
    fontFamily: "inter",
    jobListingLayout: "grid",
    showSalaryRanges: true,
    showApplicationCount: false,
    metaTitle: "",
    metaDescription: "",
    showSocialLinks: true,
    footerText: "",
  });

  useEffect(() => {
    fetchSettings();
  }, [userProfile?.companyId]);

  const fetchSettings = async () => {
    if (!userProfile?.companyId) return;

    try {
      setLoading(true);
      const settingsDoc = await getDoc(
        doc(db, "companies", userProfile.companyId, "settings", "careerPage")
      );

      if (settingsDoc.exists()) {
        const data = settingsDoc.data() as Partial<CareerPageSettings>;
        setSettings({ ...settings, ...data });
      }
    } catch (error) {
      console.error("Error fetching career page settings:", error);
      toast({
        title: "Error",
        description: "Failed to load career page settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!userProfile?.companyId) return;

    // Validation
    if (!settings.heroTitle.trim()) {
      toast({
        title: "Validation Error",
        description: "Hero title is required.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      await setDoc(
        doc(db, "companies", userProfile.companyId, "settings", "careerPage"),
        {
          ...settings,
          updatedAt: serverTimestamp(),
          updatedBy: userProfile.email || "unknown",
        }
      );

      toast({
        title: "Settings Saved",
        description: "Career page settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving career page settings:", error);
      toast({
        title: "Error",
        description: "Failed to save career page settings.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Image must be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);
    try {
      // TODO: Implement actual file upload to Firebase Storage
      // For now, create a local preview URL
      const previewUrl = URL.createObjectURL(file);
      setSettings({ ...settings, heroBackgroundUrl: previewUrl, heroBackgroundType: "image" });

      toast({
        title: "Image Uploaded",
        description: "Hero background image uploaded. Remember to save changes!",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const addCultureValue = () => {
    setSettings({
      ...settings,
      cultureValues: [...settings.cultureValues, ""],
    });
  };

  const updateCultureValue = (index: number, value: string) => {
    const newValues = [...settings.cultureValues];
    newValues[index] = value;
    setSettings({ ...settings, cultureValues: newValues });
  };

  const removeCultureValue = (index: number) => {
    const newValues = settings.cultureValues.filter((_, i) => i !== index);
    setSettings({ ...settings, cultureValues: newValues });
  };

  const addBenefit = () => {
    setSettings({
      ...settings,
      benefits: [...settings.benefits, ""],
    });
  };

  const updateBenefit = (index: number, value: string) => {
    const newBenefits = [...settings.benefits];
    newBenefits[index] = value;
    setSettings({ ...settings, benefits: newBenefits });
  };

  const removeBenefit = (index: number) => {
    const newBenefits = settings.benefits.filter((_, i) => i !== index);
    setSettings({ ...settings, benefits: newBenefits });
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
        <div className="p-8 max-w-5xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Career Page Customization</h1>
              <p className="text-muted-foreground">
                Customize the look and content of your public career page
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Preview
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </div>

          <Tabs defaultValue="content" className="space-y-6">
            <TabsList>
              <TabsTrigger value="content">
                <Layout className="w-4 h-4 mr-2" />
                Content
              </TabsTrigger>
              <TabsTrigger value="styling">
                <Palette className="w-4 h-4 mr-2" />
                Styling
              </TabsTrigger>
              <TabsTrigger value="seo">
                <Type className="w-4 h-4 mr-2" />
                SEO
              </TabsTrigger>
            </TabsList>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-6">
              {/* Hero Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Hero Section</CardTitle>
                  <CardDescription>
                    The main banner at the top of your career page
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="heroTitle">
                      Hero Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="heroTitle"
                      value={settings.heroTitle}
                      onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                      placeholder="Join Our Team"
                      maxLength={100}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {settings.heroTitle.length}/100 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                    <Input
                      id="heroSubtitle"
                      value={settings.heroSubtitle}
                      onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                      placeholder="Build your career with us"
                      maxLength={200}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {settings.heroSubtitle.length}/200 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Background Type</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={settings.heroBackgroundType === "color"}
                          onChange={() => setSettings({ ...settings, heroBackgroundType: "color" })}
                          className="w-4 h-4"
                        />
                        <span>Solid Color</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={settings.heroBackgroundType === "image"}
                          onChange={() => setSettings({ ...settings, heroBackgroundType: "image" })}
                          className="w-4 h-4"
                        />
                        <span>Background Image</span>
                      </label>
                    </div>
                  </div>

                  {settings.heroBackgroundType === "color" ? (
                    <div className="space-y-2">
                      <Label htmlFor="heroColor">Background Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="heroColor"
                          type="color"
                          value={settings.heroBackgroundColor}
                          onChange={(e) =>
                            setSettings({ ...settings, heroBackgroundColor: e.target.value })
                          }
                          className="w-20 h-10"
                        />
                        <Input
                          value={settings.heroBackgroundColor}
                          onChange={(e) =>
                            setSettings({ ...settings, heroBackgroundColor: e.target.value })
                          }
                          placeholder="#16a34a"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>Background Image</Label>
                      <div className="flex items-center gap-4">
                        {settings.heroBackgroundUrl && (
                          <div className="w-32 h-20 rounded border overflow-hidden">
                            <img
                              src={settings.heroBackgroundUrl}
                              alt="Hero background"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <input
                            ref={heroImageInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleHeroImageUpload}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            onClick={() => heroImageInputRef.current?.click()}
                            disabled={uploadingImage}
                          >
                            {uploadingImage ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Image
                              </>
                            )}
                          </Button>
                          <p className="text-xs text-muted-foreground mt-1">
                            Recommended: 1920x600px (PNG or JPG, max 5MB)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* About Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>About Section</CardTitle>
                      <CardDescription>
                        Tell candidates about your company
                      </CardDescription>
                    </div>
                    <Switch
                      checked={settings.showAboutSection}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, showAboutSection: checked })
                      }
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="aboutTitle">Section Title</Label>
                    <Input
                      id="aboutTitle"
                      value={settings.aboutTitle}
                      onChange={(e) => setSettings({ ...settings, aboutTitle: e.target.value })}
                      placeholder="About Us"
                      disabled={!settings.showAboutSection}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aboutContent">Content</Label>
                    <Textarea
                      id="aboutContent"
                      value={settings.aboutContent}
                      onChange={(e) => setSettings({ ...settings, aboutContent: e.target.value })}
                      placeholder="Write about your company, mission, and what makes you unique..."
                      rows={6}
                      maxLength={1000}
                      disabled={!settings.showAboutSection}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {settings.aboutContent.length}/1000 characters
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Culture & Values Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Culture & Values</CardTitle>
                      <CardDescription>
                        Showcase your company culture and core values
                      </CardDescription>
                    </div>
                    <Switch
                      checked={settings.showCultureSection}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, showCultureSection: checked })
                      }
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cultureTitle">Section Title</Label>
                    <Input
                      id="cultureTitle"
                      value={settings.cultureTitle}
                      onChange={(e) => setSettings({ ...settings, cultureTitle: e.target.value })}
                      placeholder="Our Culture & Values"
                      disabled={!settings.showCultureSection}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Values</Label>
                    <div className="space-y-2">
                      {settings.cultureValues.map((value, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={value}
                            onChange={(e) => updateCultureValue(index, e.target.value)}
                            placeholder="Enter a value..."
                            disabled={!settings.showCultureSection}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeCultureValue(index)}
                            disabled={!settings.showCultureSection || settings.cultureValues.length <= 1}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addCultureValue}
                      disabled={!settings.showCultureSection}
                    >
                      + Add Value
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Benefits Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Benefits & Perks</CardTitle>
                      <CardDescription>
                        Highlight the benefits you offer to employees
                      </CardDescription>
                    </div>
                    <Switch
                      checked={settings.showBenefitsSection}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, showBenefitsSection: checked })
                      }
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="benefitsTitle">Section Title</Label>
                    <Input
                      id="benefitsTitle"
                      value={settings.benefitsTitle}
                      onChange={(e) => setSettings({ ...settings, benefitsTitle: e.target.value })}
                      placeholder="Benefits & Perks"
                      disabled={!settings.showBenefitsSection}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Benefits</Label>
                    <div className="space-y-2">
                      {settings.benefits.map((benefit, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={benefit}
                            onChange={(e) => updateBenefit(index, e.target.value)}
                            placeholder="Enter a benefit..."
                            disabled={!settings.showBenefitsSection}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeBenefit(index)}
                            disabled={!settings.showBenefitsSection || settings.benefits.length <= 1}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addBenefit}
                      disabled={!settings.showBenefitsSection}
                    >
                      + Add Benefit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Styling Tab */}
            <TabsContent value="styling" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Color Scheme</CardTitle>
                  <CardDescription>
                    Customize the colors used on your career page
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        className="w-20 h-10"
                      />
                      <Input
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        placeholder="#16a34a"
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Used for buttons, links, and accents
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={settings.secondaryColor}
                        onChange={(e) =>
                          setSettings({ ...settings, secondaryColor: e.target.value })
                        }
                        className="w-20 h-10"
                      />
                      <Input
                        value={settings.secondaryColor}
                        onChange={(e) =>
                          setSettings({ ...settings, secondaryColor: e.target.value })
                        }
                        placeholder="#3b82f6"
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Used for secondary elements and hover states
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Typography</CardTitle>
                  <CardDescription>
                    Choose the font family for your career page
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Label htmlFor="fontFamily">Font Family</Label>
                  <Select
                    value={settings.fontFamily}
                    onValueChange={(value: any) => setSettings({ ...settings, fontFamily: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Job Listing Display</CardTitle>
                  <CardDescription>
                    Configure how job listings are displayed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Layout</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={settings.jobListingLayout === "grid"}
                          onChange={() => setSettings({ ...settings, jobListingLayout: "grid" })}
                          className="w-4 h-4"
                        />
                        <span>Grid View</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={settings.jobListingLayout === "list"}
                          onChange={() => setSettings({ ...settings, jobListingLayout: "list" })}
                          className="w-4 h-4"
                        />
                        <span>List View</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Salary Ranges</Label>
                      <p className="text-sm text-muted-foreground">
                        Display salary information on job listings
                      </p>
                    </div>
                    <Switch
                      checked={settings.showSalaryRanges}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, showSalaryRanges: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Application Count</Label>
                      <p className="text-sm text-muted-foreground">
                        Display number of applications for each job
                      </p>
                    </div>
                    <Switch
                      checked={settings.showApplicationCount}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, showApplicationCount: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Footer</CardTitle>
                  <CardDescription>
                    Customize the footer section
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Social Links</Label>
                      <p className="text-sm text-muted-foreground">
                        Display social media links from company profile
                      </p>
                    </div>
                    <Switch
                      checked={settings.showSocialLinks}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, showSocialLinks: checked })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="footerText">Footer Text</Label>
                    <Textarea
                      id="footerText"
                      value={settings.footerText}
                      onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                      placeholder="© 2025 Your Company. All rights reserved."
                      rows={2}
                      maxLength={200}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {settings.footerText.length}/200 characters
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEO Tab */}
            <TabsContent value="seo" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Search Engine Optimization</CardTitle>
                  <CardDescription>
                    Improve your career page's visibility in search results
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="metaTitle">Meta Title</Label>
                    <Input
                      id="metaTitle"
                      value={settings.metaTitle}
                      onChange={(e) => setSettings({ ...settings, metaTitle: e.target.value })}
                      placeholder="Careers at [Company Name] - Join Our Team"
                      maxLength={60}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {settings.metaTitle.length}/60 characters
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Recommended: 50-60 characters. This appears in search engine results.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <Textarea
                      id="metaDescription"
                      value={settings.metaDescription}
                      onChange={(e) =>
                        setSettings({ ...settings, metaDescription: e.target.value })
                      }
                      placeholder="Explore career opportunities at [Company Name]. Join our team of talented professionals and build your career with us."
                      rows={3}
                      maxLength={160}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {settings.metaDescription.length}/160 characters
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Recommended: 150-160 characters. This appears below the title in search results.
                    </p>
                  </div>

                  <Alert className="border-blue-200 bg-blue-50">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong>SEO Tips:</strong> Include your company name and relevant keywords.
                      Make it compelling to encourage clicks from search results.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <div className="flex justify-end gap-3 mt-6">
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
      </main>
    </div>
  );
}
