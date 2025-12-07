export type CandidateStatus = 
  | "sourced" 
  | "screened" 
  | "takehome_assigned" 
  | "takehome_reviewed" 
  | "interview" 
  | "offer" 
  | "rejected";

export type AIRecommendation = "reject" | "takehome" | "interview" | "fasttrack";

export interface Job {
  id: string;
  title: string;
  description: string;
  headcount: number;
  requirements: string[];
  createdAt: Date;
  status: "active" | "paused" | "closed";
  candidateCount: number;
  screenedCount: number;
}

export interface Candidate {
  id: string;
  name: string;
  email?: string;
  githubUrl?: string;
  twitterHandle?: string;
  linkedinUrl?: string;
  avatarUrl?: string;
  location?: string;
  status: CandidateStatus;
  aiScore?: number;
  aiRecommendation?: AIRecommendation;
  aiReasoning?: string;
  aiSummary?: string;
  skills: string[];
  experience: {
    company: string;
    role: string;
    duration: string;
  }[];
  githubStats?: {
    repos: number;
    stars: number;
    contributions: number;
    languages: string[];
  };
  createdAt: Date;
  lastUpdated: Date;
}

export interface JobCandidate {
  jobId: string;
  candidateId: string;
  status: CandidateStatus;
  aiScore: number;
  aiRecommendation: AIRecommendation;
  aiReasoning: string;
  humanOverride?: {
    decision: AIRecommendation;
    reason: string;
    overriddenBy: string;
    overriddenAt: Date;
  };
}

export interface ActivityEvent {
  id: string;
  type: "sourced" | "screened" | "override" | "status_change" | "policy_update";
  description: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
  jobId?: string;
  candidateId?: string;
}
