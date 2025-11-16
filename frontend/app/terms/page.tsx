import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Scale, Shield, AlertTriangle, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | Persona Recruit AI",
  description: "Terms of Service and usage agreement for Persona Recruit AI",
};

export default function TermsOfServicePage() {
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
              <Scale className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Terms of Service</h1>
            <p className="text-muted-foreground">
              Last updated: November 16, 2025
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Agreement to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using Persona Recruit AI ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Persona Recruit AI is operated by Bright Tier Solutions ("we," "us," or "our"). These terms govern your use of our AI-powered recruitment platform, including all features, services, and content.
              </p>
            </section>

            {/* Definitions */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                Definitions
              </h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>"Platform"</strong> refers to Persona Recruit AI, including all websites, applications, and services</li>
                <li><strong>"User"</strong> refers to any individual or organization using the Platform</li>
                <li><strong>"Candidate"</strong> refers to job seekers using the Platform</li>
                <li><strong>"Company"</strong> refers to employers and recruiters using the Platform</li>
                <li><strong>"Content"</strong> refers to all data, text, images, and files uploaded to the Platform</li>
                <li><strong>"AI Services"</strong> refers to our artificial intelligence-powered features</li>
              </ul>
            </section>

            {/* User Accounts */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                User Accounts and Registration
              </h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">Account Creation</h3>
              <p className="text-muted-foreground leading-relaxed">
                To access certain features, you must create an account. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information to keep it accurate</li>
                <li>Keep your password secure and confidential</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Account Types</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Candidate Accounts:</strong> Free for job seekers, subject to fair use policies</li>
                <li><strong>Company Accounts:</strong> Subscription-based with different pricing tiers</li>
                <li><strong>Team Member Accounts:</strong> Created by Company admins with role-based access</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Account Termination</h3>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to suspend or terminate accounts that violate these terms or engage in prohibited activities.
              </p>
            </section>

            {/* Acceptable Use */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                Acceptable Use Policy
              </h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">Permitted Uses</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Posting legitimate job opportunities (Companies)</li>
                <li>Submitting genuine job applications (Candidates)</li>
                <li>Conducting fair and legal hiring processes</li>
                <li>Using AI features to enhance recruitment workflows</li>
                <li>Communicating professionally with other users</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Prohibited Activities</h3>
              <p className="text-muted-foreground mb-3">You agree NOT to:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Post false, misleading, or fraudulent job listings</li>
                <li>Submit false or fabricated resumes or credentials</li>
                <li>Scrape, harvest, or collect user data without permission</li>
                <li>Discriminate based on protected characteristics</li>
                <li>Use the Platform for spam or unauthorized marketing</li>
                <li>Attempt to bypass security measures or access controls</li>
                <li>Reverse engineer, decompile, or extract source code</li>
                <li>Use automated scripts or bots (except authorized APIs)</li>
                <li>Interfere with Platform operations or other users</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </section>

            {/* AI Services */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">AI Services and Limitations</h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">AI-Powered Features</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Our Platform uses artificial intelligence to provide:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Resume parsing and information extraction</li>
                <li>Candidate-job matching and scoring</li>
                <li>Automated interview screening</li>
                <li>Interview transcription and analysis</li>
                <li>Skill recommendations and insights</li>
                <li>Job description generation</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">AI Disclaimer</h3>
              <p className="text-muted-foreground leading-relaxed">
                While we strive for accuracy, AI-generated results may contain errors or biases. You acknowledge that:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
                <li>AI recommendations are advisory, not definitive</li>
                <li>Human review is required for final hiring decisions</li>
                <li>AI may not capture all nuances of human experience</li>
                <li>Match scores are estimates based on available data</li>
                <li>We are not liable for AI inaccuracies or biases</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Fair Hiring Practices</h3>
              <p className="text-muted-foreground leading-relaxed">
                Companies using AI features must:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
                <li>Comply with equal employment opportunity laws</li>
                <li>Not use AI to discriminate illegally</li>
                <li>Provide human oversight of AI decisions</li>
                <li>Allow candidates to appeal AI-based rejections</li>
                <li>Maintain records for compliance purposes</li>
              </ul>
            </section>

            {/* Content and Intellectual Property */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Content and Intellectual Property</h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">Your Content</h3>
              <p className="text-muted-foreground leading-relaxed">
                You retain ownership of content you upload (resumes, job descriptions, etc.). By uploading content, you grant us:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
                <li>A license to store, process, and display your content</li>
                <li>Permission to use AI to analyze and enhance your content</li>
                <li>The right to share content with relevant parties (e.g., applications with employers)</li>
                <li>The ability to create anonymized, aggregated analytics</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Our Intellectual Property</h3>
              <p className="text-muted-foreground leading-relaxed">
                The Platform, including all software, designs, trademarks, and AI models, is owned by Bright Tier Solutions. You may not:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
                <li>Copy, modify, or distribute our proprietary technology</li>
                <li>Use our trademarks without written permission</li>
                <li>Create derivative works based on the Platform</li>
                <li>Train competing AI models using our data</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Third-Party Content</h3>
              <p className="text-muted-foreground leading-relaxed">
                We are not responsible for user-generated content. Users are solely responsible for ensuring their content does not violate third-party rights.
              </p>
            </section>

            {/* Subscriptions and Payments */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Subscriptions and Payments</h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">Pricing and Plans</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Candidate accounts are free with usage limits</li>
                <li>Company subscriptions are billed monthly or annually</li>
                <li>Pricing is subject to change with 30 days' notice</li>
                <li>Taxes and fees may apply based on your location</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Payment Terms</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Payments are processed securely via Stripe</li>
                <li>Subscriptions auto-renew unless canceled</li>
                <li>Refunds are provided only as required by law</li>
                <li>Unpaid accounts may be suspended or terminated</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Cancellation</h3>
              <p className="text-muted-foreground leading-relaxed">
                You may cancel your subscription at any time. Access continues until the end of the billing period. No refunds for partial months.
              </p>
            </section>

            {/* Privacy and Data Protection */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Privacy and Data Protection</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your privacy is important to us. Our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link> explains how we collect, use, and protect your data. Key points:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
                <li>We collect personal and professional information</li>
                <li>AI processing requires explicit consent</li>
                <li>You have rights to access, correct, and delete your data</li>
                <li>We comply with GDPR, CCPA, and other data protection laws</li>
                <li>Interview recordings require separate consent</li>
              </ul>
            </section>

            {/* Disclaimers and Limitations */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-primary" />
                Disclaimers and Limitations of Liability
              </h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">Platform "As Is"</h3>
              <p className="text-muted-foreground leading-relaxed">
                The Platform is provided "as is" and "as available" without warranties of any kind, express or implied, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
                <li>Merchantability or fitness for a particular purpose</li>
                <li>Uninterrupted or error-free operation</li>
                <li>Accuracy, reliability, or completeness of content</li>
                <li>Security or freedom from viruses</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Limitation of Liability</h3>
              <p className="text-muted-foreground leading-relaxed">
                To the maximum extent permitted by law, we are not liable for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
                <li>Indirect, incidental, or consequential damages</li>
                <li>Lost profits, data, or business opportunities</li>
                <li>Hiring decisions or employment outcomes</li>
                <li>User-generated content or third-party actions</li>
                <li>AI errors, biases, or inaccuracies</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Our total liability is limited to the amount you paid us in the 12 months prior to the claim.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Indemnification</h3>
              <p className="text-muted-foreground leading-relaxed">
                You agree to indemnify and hold us harmless from claims arising from your use of the Platform, violation of these terms, or infringement of third-party rights.
              </p>
            </section>

            {/* Compliance and Legal */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Legal Compliance</h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">Employment Laws</h3>
              <p className="text-muted-foreground leading-relaxed">
                Companies using the Platform must comply with all applicable employment laws, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
                <li>Equal Employment Opportunity (EEO) laws</li>
                <li>Fair Credit Reporting Act (FCRA) for background checks</li>
                <li>Americans with Disabilities Act (ADA)</li>
                <li>Age Discrimination in Employment Act (ADEA)</li>
                <li>State and local anti-discrimination laws</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">GDPR and Data Privacy</h3>
              <p className="text-muted-foreground leading-relaxed">
                For users in the European Union:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
                <li>You have rights under GDPR to access and control your data</li>
                <li>We process data lawfully with your consent or legitimate interest</li>
                <li>You can withdraw consent or request data deletion</li>
                <li>Data transfers comply with EU adequacy requirements</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">CCPA (California)</h3>
              <p className="text-muted-foreground leading-relaxed">
                California residents have additional rights:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
                <li>Right to know what personal information is collected</li>
                <li>Right to delete personal information</li>
                <li>Right to opt-out of data sales (we do not sell data)</li>
                <li>Right to non-discrimination for exercising rights</li>
              </ul>
            </section>

            {/* Dispute Resolution */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Dispute Resolution</h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">Governing Law</h3>
              <p className="text-muted-foreground leading-relaxed">
                These Terms are governed by the laws of [Your Jurisdiction], without regard to conflict of law principles.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Arbitration Agreement</h3>
              <p className="text-muted-foreground leading-relaxed">
                Any disputes will be resolved through binding arbitration rather than in court, except:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
                <li>Small claims court matters</li>
                <li>Intellectual property disputes</li>
                <li>Injunctive relief requests</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Arbitration will be conducted by a neutral arbitrator under the rules of [Arbitration Association].
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Class Action Waiver</h3>
              <p className="text-muted-foreground leading-relaxed">
                You agree to resolve disputes individually, not as part of a class action or representative proceeding.
              </p>
            </section>

            {/* Modifications */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update these Terms from time to time. Significant changes will be communicated via:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
                <li>Email notification to registered users</li>
                <li>Prominent notice on the Platform</li>
                <li>Updated "Last updated" date at the top of this page</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Continued use of the Platform after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Account Termination</h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">Termination by You</h3>
              <p className="text-muted-foreground leading-relaxed">
                You may delete your account at any time through account settings or by contacting support. Upon termination:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
                <li>Your access to the Platform will cease</li>
                <li>Active applications may be withdrawn</li>
                <li>Data will be deleted per our retention policies</li>
                <li>Subscription fees are non-refundable</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Termination by Us</h3>
              <p className="text-muted-foreground leading-relaxed">
                We may suspend or terminate accounts for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
                <li>Violation of these Terms</li>
                <li>Fraudulent or illegal activity</li>
                <li>Non-payment of subscription fees</li>
                <li>Extended inactivity (after notice)</li>
                <li>Protection of Platform security or integrity</li>
              </ul>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about these Terms, please contact us:
              </p>
              <div className="bg-muted p-4 rounded-lg mt-4 space-y-2">
                <p className="text-sm"><strong>Email:</strong> legal@personarecruit.ai</p>
                <p className="text-sm"><strong>Support:</strong> support@personarecruit.ai</p>
                <p className="text-sm"><strong>Address:</strong> Bright Tier Solutions, [Your Address]</p>
              </div>
            </section>

            {/* Severability */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">General Provisions</h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">Severability</h3>
              <p className="text-muted-foreground leading-relaxed">
                If any provision is found unenforceable, the remaining provisions remain in full effect.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Entire Agreement</h3>
              <p className="text-muted-foreground leading-relaxed">
                These Terms, along with our Privacy Policy, constitute the entire agreement between you and Persona Recruit AI.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">No Waiver</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our failure to enforce any provision does not waive our right to enforce it later.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Assignment</h3>
              <p className="text-muted-foreground leading-relaxed">
                You may not transfer your account or rights. We may assign our rights and obligations to a successor entity.
              </p>
            </section>

            {/* Acknowledgment */}
            <section className="bg-muted p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Acknowledgment</h3>
              <p className="text-muted-foreground leading-relaxed">
                By using Persona Recruit AI, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
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
            <Link href="/privacy">
              <Button variant="ghost">View Privacy Policy</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
