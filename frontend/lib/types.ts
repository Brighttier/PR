// User roles
export type UserRole = 'candidate' | 'recruiter' | 'interviewer' | 'hr_admin' | 'platform_admin';

// User type
export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  companyId: string | null;
  photoURL?: string;
  createdAt: Date;
}

// Company type
export interface Company {
  companyId: string;
  name: string;
  industry: string;
  size: string;
  logoURL?: string;
  website: string;
  createdAt: Date;
}

// Job type
export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
export type JobStatus = 'Open' | 'Closed' | 'Archived';

export interface Job {
  id: string;
  companyId: string;
  title: string;
  department: string;
  location: string;
  type: JobType;
  experienceLevel: string;
  salaryMin: number;
  salaryMax: number;
  description: string;
  requiredSkills: string[];
  benefits: string;
  status: JobStatus;
  applicants: number;
  createdAt: Date;
  createdBy: string;
}

// Application status and stages
export type ApplicationStatus =
  | 'Applied'
  | 'Under Review'
  | 'Interview Scheduled'
  | 'Interview Completed'
  | 'Offer Extended'
  | 'Hired'
  | 'Rejected'
  | 'Withdrawn';

export type ApplicationStage =
  | 'Application Review'
  | 'Screening'
  | 'Technical Round'
  | 'Manager Round'
  | 'Final Round'
  | 'Offer'
  | 'Closed';

export type AIRecommendation =
  | 'Fast Track'
  | 'Strong Candidate'
  | 'Worth Reviewing'
  | 'Marginal Fit'
  | 'Not Recommended';

// Application type
export interface Application {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  resumeUrl: string;
  status: ApplicationStatus;
  stage: ApplicationStage;
  appliedAt: Date;
  matchScore: number;
  aiSummary: {
    oneLiner: string;
    executiveSummary: string;
    recommendation: AIRecommendation;
    strengths: string[];
    redFlags: string[];
  };
  consents: {
    aiProcessing: boolean;
    interviewRecording: boolean;
  };
}

// Interview types
export type InterviewType = 'ai_screening' | 'ai_technical' | 'face_to_face' | 'panel';
export type InterviewStatus = 'scheduled' | 'in_progress' | 'completed' | 'canceled';

export interface Interview {
  id: string;
  applicationId: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  companyId: string;
  type: InterviewType;
  status: InterviewStatus;
  scheduledAt: Date;
  duration: number;
  assignedInterviewers: string[];
  meetingLink?: string;
  location?: string;
  notes: string;
  completedAt?: Date;
  recordingUrl?: string;
  aiTranscript?: string;
  aiSummary?: string;
}

// Resume parsed data
export interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string[];
  experience: {
    company: string;
    title: string;
    startDate: string;
    endDate: string;
    description: string;
    achievements: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    field: string;
    graduationDate: string;
    gpa?: string;
  }[];
  certifications: string[];
  languages: string[];
}

// Match score details
export interface MatchScoreDetails {
  matchScore: number;
  skillsMatch: {
    matched: string[];
    missing: string[];
    score: number;
  };
  experienceMatch: {
    yearsRequired: number;
    yearsCandidate: number;
    score: number;
  };
  educationMatch: {
    required: string;
    candidate: string;
    met: boolean;
  };
  recommendation: AIRecommendation;
}
