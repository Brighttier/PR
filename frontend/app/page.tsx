import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Brain,
  Zap,
  Shield,
  Users,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Star,
  Building2,
  Globe,
  MessageSquare,
  BarChart3,
  Clock,
  Target,
  Award,
  Rocket
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-green-50/20">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
              Persona Recruit AI
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-green-600 transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-green-600 transition-colors">
              Pricing
            </Link>
            <Link href="#testimonials" className="text-sm font-medium hover:text-green-600 transition-colors">
              Testimonials
            </Link>
            <Link href="/careers" className="text-sm font-medium hover:text-green-600 transition-colors">
              Careers
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/auth/signup/company/wizard">
              <Button size="sm" className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute left-0 top-0 -z-10 h-full w-full">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
          <div className="absolute top-0 -right-4 w-72 h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
        </div>

        <div className="container relative">
          <div className="mx-auto max-w-4xl text-center space-y-8">
            <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
              <Sparkles className="h-3 w-3 mr-1" />
              Powered by Advanced AI
            </Badge>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              Hire Smarter with{" "}
              <span className="bg-gradient-to-r from-green-600 via-green-500 to-green-600 bg-clip-text text-transparent animate-gradient">
                AI-Powered
              </span>{" "}
              Recruiting
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Transform your hiring process with intelligent candidate screening, AI interviews,
              and data-driven insights. Reduce time-to-hire by 70% while finding the perfect fit.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth/signup/company/wizard">
                <Button size="lg" className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 h-12 px-8 text-base group">
                  Start Free 14-Day Trial
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#demo">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base border-2">
                  Watch Demo
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-8 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto">
            {[
              { label: "Time Saved", value: "70%", icon: Clock },
              { label: "Better Matches", value: "95%", icon: Target },
              { label: "Companies", value: "500+", icon: Building2 },
              { label: "Hires Made", value: "50K+", icon: Users }
            ].map((stat, i) => (
              <div key={i} className="text-center space-y-2">
                <div className="flex justify-center">
                  <stat.icon className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" className="border-green-200 text-green-700">
              Features
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold">
              Everything you need to hire{" "}
              <span className="bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                exceptional talent
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built for modern recruiting teams who demand speed, accuracy, and insights
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: "AI Resume Screening",
                description: "Automatically parse and analyze resumes with 95% accuracy. Our AI understands context, not just keywords.",
                gradient: "from-green-500 to-green-600"
              },
              {
                icon: Sparkles,
                title: "Smart Candidate Matching",
                description: "Match candidates to jobs using semantic understanding. Find hidden gems that keyword matching misses.",
                gradient: "from-green-600 to-green-700"
              },
              {
                icon: MessageSquare,
                title: "AI Voice Interviews",
                description: "Conduct initial screenings with natural AI interviews. Save 10+ hours per week on phone screens.",
                gradient: "from-green-500 to-green-600"
              },
              {
                icon: BarChart3,
                title: "Real-Time Analytics",
                description: "Track your hiring funnel, time-to-hire, and source effectiveness with beautiful dashboards.",
                gradient: "from-green-600 to-green-700"
              },
              {
                icon: Shield,
                title: "Bias Reduction",
                description: "Remove unconscious bias with blind screening and structured evaluation criteria.",
                gradient: "from-green-500 to-green-600"
              },
              {
                icon: Zap,
                title: "Automated Workflows",
                description: "Set up triggers and automations for rejection emails, interview scheduling, and more.",
                gradient: "from-green-600 to-green-700"
              },
              {
                icon: Users,
                title: "Collaborative Hiring",
                description: "Share feedback, scorecards, and notes with your team. Everyone stays in sync.",
                gradient: "from-green-500 to-green-600"
              },
              {
                icon: Globe,
                title: "Branded Career Pages",
                description: "Create beautiful, mobile-optimized career pages that showcase your company culture.",
                gradient: "from-green-600 to-green-700"
              },
              {
                icon: TrendingUp,
                title: "Predictive Analytics",
                description: "Predict candidate success and cultural fit using historical data and AI models.",
                gradient: "from-green-500 to-green-600"
              }
            ].map((feature, i) => (
              <Card
                key={i}
                className="group hover:shadow-lg transition-all duration-300 hover:border-green-200 hover:-translate-y-1"
              >
                <CardHeader>
                  <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section id="testimonials" className="py-20 bg-gradient-to-b from-background to-green-50/20">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" className="border-green-200 text-green-700">
              Testimonials
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold">
              Loved by{" "}
              <span className="bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                recruiting teams
              </span>{" "}
              worldwide
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah Chen",
                role: "Head of Talent",
                company: "TechCorp Inc.",
                avatar: "SC",
                quote: "Persona Recruit cut our time-to-hire from 45 days to just 12. The AI screening is remarkably accurate.",
                rating: 5
              },
              {
                name: "Michael Rodriguez",
                role: "VP of HR",
                company: "Global Solutions",
                avatar: "MR",
                quote: "The AI interviews feel natural and save us countless hours. We've made 3x more quality hires this quarter.",
                rating: 5
              },
              {
                name: "Emily Watson",
                role: "Recruiting Manager",
                company: "StartupX",
                avatar: "EW",
                quote: "Best ATS we've used. The analytics help us optimize every step of our hiring funnel. Game changer!",
                rating: 5
              }
            ].map((testimonial, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role}, {testimonial.company}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-background">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" className="border-green-200 text-green-700">
              Pricing
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold">
              Simple,{" "}
              <span className="bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                transparent pricing
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Start free, scale as you grow. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Growth",
                price: "$249",
                period: "/month",
                description: "Perfect for growing teams",
                features: [
                  "Up to 50 active jobs",
                  "500 AI screenings/month",
                  "5 team members",
                  "Basic analytics",
                  "Email support",
                  "Branded career page"
                ],
                cta: "Start Free Trial",
                popular: false
              },
              {
                name: "Professional",
                price: "$599",
                period: "/month",
                description: "For scaling companies",
                features: [
                  "Unlimited active jobs",
                  "2,000 AI screenings/month",
                  "15 team members",
                  "Advanced analytics",
                  "Priority support",
                  "Custom workflows",
                  "API access",
                  "White-label options"
                ],
                cta: "Start Free Trial",
                popular: true
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "",
                description: "For large organizations",
                features: [
                  "Unlimited everything",
                  "Unlimited AI screenings",
                  "Unlimited team members",
                  "Dedicated success manager",
                  "24/7 phone support",
                  "Custom integrations",
                  "SLA guarantees",
                  "Advanced security"
                ],
                cta: "Contact Sales",
                popular: false
              }
            ].map((plan, i) => (
              <Card
                key={i}
                className={`relative ${plan.popular ? 'border-green-500 border-2 shadow-xl scale-105' : 'hover:shadow-lg'} transition-all`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <Badge className="bg-gradient-to-r from-green-600 to-green-500 text-white">
                      <Award className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-8 pt-8">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <div className="mb-2">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                  </div>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.cta === "Contact Sales" ? "#contact" : "/auth/signup/company/wizard"} className="block">
                    <Button
                      className={`w-full ${plan.popular ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600' : ''}`}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 via-green-500 to-green-600 text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur">
              <Rocket className="h-8 w-8" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold">
              Ready to transform your hiring?
            </h2>
            <p className="text-xl text-green-50">
              Join 500+ companies using AI to hire faster and smarter.
              Start your free trial today—no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup/company/wizard">
                <Button size="lg" className="bg-white text-green-600 hover:bg-green-50 h-12 px-8 text-base">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#contact">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 h-12 px-8 text-base">
                  Talk to Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-12">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                  Persona Recruit AI
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                AI-powered recruiting platform helping companies hire exceptional talent faster.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-green-600 transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-green-600 transition-colors">Pricing</Link></li>
                <li><Link href="/careers" className="hover:text-green-600 transition-colors">Careers</Link></li>
                <li><Link href="#demo" className="hover:text-green-600 transition-colors">Demo</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#about" className="hover:text-green-600 transition-colors">About</Link></li>
                <li><Link href="#contact" className="hover:text-green-600 transition-colors">Contact</Link></li>
                <li><Link href="#privacy" className="hover:text-green-600 transition-colors">Privacy</Link></li>
                <li><Link href="#terms" className="hover:text-green-600 transition-colors">Terms</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#blog" className="hover:text-green-600 transition-colors">Blog</Link></li>
                <li><Link href="#docs" className="hover:text-green-600 transition-colors">Documentation</Link></li>
                <li><Link href="#support" className="hover:text-green-600 transition-colors">Support</Link></li>
                <li><Link href="#api" className="hover:text-green-600 transition-colors">API</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>&copy; 2025 Persona Recruit AI. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-green-600 transition-colors">Twitter</Link>
              <Link href="#" className="hover:text-green-600 transition-colors">LinkedIn</Link>
              <Link href="#" className="hover:text-green-600 transition-colors">GitHub</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
