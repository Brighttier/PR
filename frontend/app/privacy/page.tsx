import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Persona Recruit AI",
  description: "Privacy Policy and data protection information for Persona Recruit AI",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          {/* Title */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
            <p className="text-muted-foreground">
              Last updated: November 16, 2025
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                At Persona Recruit AI, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered recruitment platform.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Database className="w-6 h-6 text-primary" />
                Information We Collect
              </h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">Personal Information</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Name, email address, phone number</li>
                <li>Resume and CV data</li>
                <li>Professional experience and education history</li>
                <li>Skills, certifications, and qualifications</li>
                <li>LinkedIn profile and portfolio links</li>
                <li>Video interview recordings (with consent)</li>
                <li>Location and job preferences</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Automatically Collected Information</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>IP address and device information</li>
                <li>Browser type and operating system</li>
                <li>Usage data and interaction patterns</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Eye className="w-6 h-6 text-primary" />
                How We Use Your Information
              </h2>
              <p className="text-muted-foreground mb-4">We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Process and analyze job applications using AI</li>
                <li>Match candidates with suitable job opportunities</li>
                <li>Facilitate communication between candidates and recruiters</li>
                <li>Generate AI-powered insights and recommendations</li>
                <li>Improve our platform and services</li>
                <li>Send notifications about application status and job matches</li>
                <li>Ensure platform security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            {/* AI Processing */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">AI Processing and Automation</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our platform uses artificial intelligence to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Parse and extract information from resumes</li>
                <li>Generate candidate profiles and summaries</li>
                <li>Calculate match scores between candidates and jobs</li>
                <li>Suggest additional skills based on experience</li>
                <li>Conduct initial screening interviews</li>
                <li>Analyze interview responses and performance</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                You have the right to opt-out of AI processing by contacting us at privacy@personarecruit.ai
              </p>
            </section>

            {/* Data Sharing */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Sharing and Disclosure</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may share your information with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Employers and Recruiters:</strong> When you apply for a job, we share your application with the hiring company</li>
                <li><strong>Service Providers:</strong> Third-party services that help us operate our platform (e.g., Google Cloud, Firebase)</li>
                <li><strong>AI Service Providers:</strong> Google Vertex AI for processing and analysis</li>
                <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We never sell your personal information to third parties.
              </p>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Lock className="w-6 h-6 text-primary" />
                Data Security
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement industry-standard security measures to protect your information, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
                <li>Encryption in transit and at rest</li>
                <li>Secure cloud infrastructure (Google Cloud Platform)</li>
                <li>Role-based access controls</li>
                <li>Regular security audits and monitoring</li>
                <li>Compliance with data protection regulations</li>
              </ul>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-primary" />
                Your Privacy Rights
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your data (right to be forgotten)</li>
                <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
                <li><strong>Objection:</strong> Object to certain processing of your data</li>
                <li><strong>Restriction:</strong> Request limitation of data processing</li>
                <li><strong>Withdraw Consent:</strong> Revoke consent for AI processing at any time</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                To exercise these rights, visit your account settings or contact us at privacy@personarecruit.ai
              </p>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar technologies to enhance your experience, analyze usage, and deliver personalized content. You can manage cookie preferences in your browser settings or through our cookie consent banner.
              </p>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your personal information for as long as necessary to provide our services and comply with legal obligations. Candidate data is typically retained for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
                <li>Active applications: Duration of recruitment process + 12 months</li>
                <li>Talent pool candidates: Until you request deletion or after 24 months of inactivity</li>
                <li>Account data: Until account deletion</li>
              </ul>
            </section>

            {/* International Transfers */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">International Data Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your data may be transferred to and processed in countries outside your residence. We ensure appropriate safeguards are in place through:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
                <li>EU Standard Contractual Clauses</li>
                <li>Privacy Shield certification (where applicable)</li>
                <li>Adequacy decisions by relevant authorities</li>
              </ul>
            </section>

            {/* Changes to Policy */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a prominent notice on our platform.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-muted p-4 rounded-lg mt-4 space-y-2">
                <p className="text-sm"><strong>Email:</strong> privacy@personarecruit.ai</p>
                <p className="text-sm"><strong>Data Protection Officer:</strong> dpo@personarecruit.ai</p>
                <p className="text-sm"><strong>Address:</strong> Bright Tier Solutions, [Your Address]</p>
              </div>
            </section>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-4 pt-8 border-t">
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Link href="/terms">
              <Button variant="ghost">View Terms of Service</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
