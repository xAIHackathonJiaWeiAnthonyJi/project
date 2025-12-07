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
  id: number;
  title: string;
  description: string;
  headcount: number;
  requirements: {
    skills?: string[];
    experience_years?: number;
    must_have?: string[];
    nice_to_have?: string[];
  };
  created_at: string;
  status: "active" | "paused" | "closed";
  candidateCount: number;
  screenedCount: number;
  embedding_id?: string;
}

export interface Candidate {
  id: number;
  name: string;
  email?: string;
  x_handle?: string;
  x_bio?: string;
  linkedin_data?: {
    profile_url?: string;
    headline?: string;
    location?: string;
    experience?: {
      company: string;
      role: string;
      duration: string;
    }[];
    skills?: string[];
    github_stats?: {
      repos: number;
      stars: number;
      contributions: number;
      languages: string[];
    };
  };
  created_at: string;
  
  // Job-specific fields (when fetched in context of a job)
  status?: CandidateStatus;
  aiScore?: number;
  aiReasoning?: string;
  strengths?: string[];
  weaknesses?: string[];
  jobId?: number;
}

export interface JobCandidate {
  id: number;
  job_id: number;
  candidate_id: number;
  compatibility_score?: number;
  ai_reasoning?: string;
  strengths?: string[];
  weaknesses?: string[];
  stage: CandidateStatus;
  created_at: string;
  updated_at: string;
}

export interface ActivityEvent {
  id: string;
  type: "sourced" | "screened" | "override" | "status_change" | "policy_update" | 
        "agent_pipeline_start" | "agent_step" | "tweet_sent" | "dm_received" | "error";
  description: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
  jobId?: string;
  candidateId?: string;
}

export interface AgentLog {
  id: number;
  logtype: string;
  log: string;
  timestamp: string;
  job_id?: number;
  candidate_id?: number;
  context?: Record<string, unknown>;
}
