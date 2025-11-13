"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Briefcase,
  Calendar,
  FileText,
  MapPin,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Github,
  Edit,
  Plus,
  Trash2,
  Upload,
  Play,
  Video,
  Award,
  GraduationCap,
  Building2,
  Check,
  X,
  Download,
  Eye,
  File,
} from "lucide-react";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);

  // Mock data - this would come from AI resume parsing
  const profile = {
    personal: {
      name: "John Candidate",
      title: "Senior Frontend Developer",
      location: "San Francisco, CA",
      email: "john.candidate@email.com",
      phone: "+1 (555) 123-4567",
      avatar: "JC",
      summary: "Passionate frontend developer with 5+ years of experience building scalable web applications. Specialized in React, TypeScript, and modern web technologies. Strong focus on user experience and performance optimization.",
      videoIntroUrl: "/videos/intro-john-candidate.mp4",
      videoThumbnail: null,
      hasVideo: true,
    },
    links: [
      { type: "linkedin", url: "https://linkedin.com/in/johncandidate", icon: Linkedin },
      { type: "github", url: "https://github.com/johncandidate", icon: Github },
      { type: "portfolio", url: "https://johncandidate.com", icon: Globe },
    ],
    experience: [
      {
        id: 1,
        title: "Senior Frontend Developer",
        company: "TechCorp Inc.",
        companyLogo: "TC",
        location: "San Francisco, CA",
        type: "Full-time",
        startDate: "Jan 2021",
        endDate: "Present",
        current: true,
        description: "Lead frontend development for enterprise SaaS platform serving 100k+ users.",
        achievements: [
          "Architected and implemented React-based design system used across 15+ products",
          "Improved application performance by 40% through code splitting and lazy loading",
          "Mentored team of 5 junior developers",
          "Led migration from JavaScript to TypeScript",
        ],
        skills: ["React", "TypeScript", "Redux", "GraphQL", "AWS"],
      },
      {
        id: 2,
        title: "Frontend Developer",
        company: "StartupXYZ",
        companyLogo: "SX",
        location: "Remote",
        type: "Full-time",
        startDate: "Jun 2019",
        endDate: "Dec 2020",
        current: false,
        description: "Developed customer-facing web applications for e-commerce platform.",
        achievements: [
          "Built responsive React components used by 50k+ daily active users",
          "Implemented real-time features using WebSockets",
          "Reduced bundle size by 60% through optimization",
        ],
        skills: ["React", "JavaScript", "Node.js", "MongoDB"],
      },
      {
        id: 3,
        title: "Junior Frontend Developer",
        company: "Digital Agency",
        companyLogo: "DA",
        location: "New York, NY",
        type: "Full-time",
        startDate: "Aug 2018",
        endDate: "May 2019",
        current: false,
        description: "Developed websites and web applications for various clients.",
        achievements: [
          "Delivered 20+ client projects on time and within budget",
          "Implemented responsive designs with 100% cross-browser compatibility",
        ],
        skills: ["HTML", "CSS", "JavaScript", "jQuery", "WordPress"],
      },
    ],
    education: [
      {
        id: 1,
        degree: "Bachelor of Science in Computer Science",
        institution: "Massachusetts Institute of Technology",
        logo: "MIT",
        location: "Cambridge, MA",
        startDate: "2014",
        endDate: "2018",
        gpa: "3.8/4.0",
        achievements: [
          "Dean's List all semesters",
          "Computer Science Student of the Year 2017",
          "Lead organizer of HackMIT",
        ],
      },
    ],
    skills: [
      { name: "React", level: "Expert", years: 5, endorsed: 45 },
      { name: "TypeScript", level: "Expert", years: 4, endorsed: 38 },
      { name: "JavaScript", level: "Expert", years: 6, endorsed: 52 },
      { name: "Node.js", level: "Advanced", years: 4, endorsed: 28 },
      { name: "GraphQL", level: "Advanced", years: 3, endorsed: 22 },
      { name: "Redux", level: "Advanced", years: 4, endorsed: 30 },
      { name: "Next.js", level: "Advanced", years: 3, endorsed: 25 },
      { name: "Tailwind CSS", level: "Advanced", years: 3, endorsed: 20 },
      { name: "AWS", level: "Intermediate", years: 2, endorsed: 15 },
      { name: "Docker", level: "Intermediate", years: 2, endorsed: 12 },
    ],
    certifications: [
      {
        id: 1,
        name: "AWS Certified Developer - Associate",
        issuer: "Amazon Web Services",
        issueDate: "Jan 2023",
        expiryDate: "Jan 2026",
        credentialId: "AWS-1234567890",
        logo: "AWS",
      },
      {
        id: 2,
        name: "Professional Scrum Master I",
        issuer: "Scrum.org",
        issueDate: "Mar 2022",
        expiryDate: null,
        credentialId: "PSM-9876543210",
        logo: "SM",
      },
    ],
    languages: [
      { name: "English", proficiency: "Native" },
      { name: "Spanish", proficiency: "Professional Working" },
      { name: "French", proficiency: "Limited Working" },
    ],
    projects: [
      {
        id: 1,
        name: "Open Source Design System",
        description: "Contributed to popular React component library with 50k+ GitHub stars",
        url: "https://github.com/design-system",
        role: "Core Contributor",
        technologies: ["React", "TypeScript", "Storybook"],
      },
      {
        id: 2,
        name: "Portfolio Website",
        description: "Personal portfolio showcasing projects and technical writing",
        url: "https://johncandidate.com",
        role: "Creator",
        technologies: ["Next.js", "Tailwind CSS", "Vercel"],
      },
    ],
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case "Expert": return "bg-green-100 text-green-800 border-green-200";
      case "Advanced": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Intermediate": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Persona Recruit</h1>
              <p className="text-xs text-muted-foreground">Candidate Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <a href="/candidate" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <FileText className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </a>
          <a href="/candidate/applications" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <Briefcase className="w-5 h-5" />
            <span className="font-medium">My Applications</span>
          </a>
          <a href="/candidate/interviews" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Interviews</span>
          </a>
          <a href="/candidate/profile" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground">
            <FileText className="w-5 h-5" />
            <span className="font-medium">My Profile</span>
          </a>
          <a href="/candidate/documents" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
            <File className="w-5 h-5" />
            <span className="font-medium">My Documents</span>
          </a>
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center font-semibold">
              {profile.personal.avatar}
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-sm">{profile.personal.name}</p>
              <p className="text-xs text-muted-foreground">{profile.personal.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-muted/30">
        <header className="border-b bg-card sticky top-0 z-10">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">My Profile</h2>
                <p className="text-muted-foreground">
                  Manage your professional information
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download Resume
                </Button>
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Update Resume
                </Button>
                <Button onClick={() => setIsEditing(!isEditing)}>
                  <Edit className="w-4 h-4 mr-2" />
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 max-w-6xl mx-auto space-y-6">
          {/* Profile Header Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-6">
                <div className="relative">
                  <Avatar className="w-32 h-32 bg-primary text-primary-foreground flex items-center justify-center text-4xl font-bold">
                    {profile.personal.avatar}
                  </Avatar>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90">
                      <Upload className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-1">{profile.personal.name}</h1>
                      <p className="text-xl text-muted-foreground mb-3">{profile.personal.title}</p>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {profile.personal.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {profile.personal.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {profile.personal.phone}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        {profile.links.map((link, idx) => {
                          const Icon = link.icon;
                          return (
                            <a
                              key={idx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-1.5 border rounded-md hover:bg-muted transition-colors text-sm"
                            >
                              <Icon className="w-4 h-4" />
                              {link.type}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <p className="text-muted-foreground leading-relaxed">
                    {profile.personal.summary}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video Introduction */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Video Introduction
                  </CardTitle>
                  <CardDescription>
                    10-second video recorded during onboarding
                  </CardDescription>
                </div>
                {isEditing && (
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Re-record Video
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {profile.personal.hasVideo ? (
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden group cursor-pointer">
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 group-hover:bg-black/40 transition-colors">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-primary-foreground ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-sm font-medium">10 second introduction</p>
                    <p className="text-xs text-white/80">Click to play</p>
                  </div>
                </div>
              ) : (
                <div className="aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center p-6">
                  <Video className="w-12 h-12 text-muted-foreground mb-3" />
                  <h3 className="font-semibold mb-2">No video introduction yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Record a 10-second video to introduce yourself to recruiters
                  </p>
                  <Button>
                    <Video className="w-4 h-4 mr-2" />
                    Record Introduction
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Experience */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Experience
                  </CardTitle>
                  <CardDescription>
                    Parsed from your resume by AI
                  </CardDescription>
                </div>
                {isEditing && (
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Experience
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {profile.experience.map((exp, idx) => (
                <div key={exp.id} className={`${idx !== 0 ? 'pt-6 border-t' : ''}`}>
                  <div className="flex gap-4">
                    <Avatar className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                      {exp.companyLogo}
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-lg">{exp.title}</h3>
                          <p className="text-muted-foreground">{exp.company} · {exp.type}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <span>{exp.startDate} - {exp.endDate}</span>
                            <span>•</span>
                            <span>{exp.location}</span>
                          </div>
                        </div>
                        {isEditing && (
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </div>

                      <p className="text-muted-foreground mb-3">{exp.description}</p>

                      <ul className="space-y-2 mb-3">
                        {exp.achievements.map((achievement, i) => (
                          <li key={i} className="flex gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{achievement}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="flex flex-wrap gap-2">
                        {exp.skills.map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Education
                  </CardTitle>
                  <CardDescription>
                    Academic background from your resume
                  </CardDescription>
                </div>
                {isEditing && (
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Education
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.education.map((edu) => (
                <div key={edu.id} className="flex gap-4">
                  <Avatar className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                    {edu.logo}
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold">{edu.institution}</h3>
                        <p className="text-muted-foreground">{edu.degree}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <span>{edu.startDate} - {edu.endDate}</span>
                          <span>•</span>
                          <span>GPA: {edu.gpa}</span>
                        </div>
                      </div>
                      {isEditing && (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <ul className="mt-2 space-y-1">
                      {edu.achievements.map((achievement, i) => (
                        <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Skills & Expertise</CardTitle>
                  <CardDescription>
                    Technical skills identified from your experience
                  </CardDescription>
                </div>
                {isEditing && (
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Skill
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.skills.map((skill, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{skill.name}</span>
                        <Badge className={`text-xs ${getSkillLevelColor(skill.level)}`}>
                          {skill.level}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{skill.years} years</span>
                        <span>•</span>
                        <span>{skill.endorsed} endorsements</span>
                      </div>
                    </div>
                    {isEditing && (
                      <Button variant="ghost" size="icon">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Certifications
                  </CardTitle>
                  <CardDescription>
                    Professional certifications and licenses
                  </CardDescription>
                </div>
                {isEditing && (
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Certification
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.certifications.map((cert) => (
                <div key={cert.id} className="flex gap-4">
                  <Avatar className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                    {cert.logo}
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold">{cert.name}</h3>
                        <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>Issued {cert.issueDate}</span>
                          {cert.expiryDate && (
                            <>
                              <span>•</span>
                              <span>Expires {cert.expiryDate}</span>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Credential ID: {cert.credentialId}
                        </p>
                      </div>
                      {isEditing && (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Languages */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Languages</CardTitle>
                  <CardDescription>
                    Language proficiency levels
                  </CardDescription>
                </div>
                {isEditing && (
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Language
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {profile.languages.map((lang, idx) => (
                  <div key={idx} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{lang.name}</p>
                        <p className="text-sm text-muted-foreground">{lang.proficiency}</p>
                      </div>
                      {isEditing && (
                        <Button variant="ghost" size="icon">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Projects */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Projects</CardTitle>
                  <CardDescription>
                    Notable projects and contributions
                  </CardDescription>
                </div>
                {isEditing && (
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Project
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.projects.map((project) => (
                <div key={project.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">{project.role}</p>
                    </div>
                    {isEditing && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <p className="text-sm mb-3">{project.description}</p>

                  <div className="flex items-center gap-4">
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary hover:underline ml-auto"
                    >
                      <Eye className="w-3 h-3" />
                      View Project
                    </a>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
