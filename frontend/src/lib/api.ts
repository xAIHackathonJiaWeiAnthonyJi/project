import { Job, Candidate, ActivityEvent, AgentLog, JobCandidate } from "@/types";

const API_BASE_URL = "http://localhost:8000/api";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new ApiError(response.status, `API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Job API
export const jobsApi = {
  async getAll(): Promise<Job[]> {
    const jobs = await fetchApi<Job[]>("/jobs/");
    // Convert date strings to Date objects and ensure proper types
    return jobs.map(job => ({
      ...job,
      createdAt: new Date(job.created_at),
      requirements: Array.isArray(job.requirements) ? job.requirements : job.requirements?.skills || []
    }));
  },

  async getById(id: number): Promise<Job> {
    const job = await fetchApi<Job>(`/jobs/${id}`);
    return {
      ...job,
      createdAt: new Date(job.created_at),
      requirements: Array.isArray(job.requirements) ? job.requirements : job.requirements?.skills || []
    };
  },

  async create(job: Omit<Job, "id" | "created_at" | "candidateCount" | "screenedCount">): Promise<Job> {
    return await fetchApi<Job>("/jobs/", {
      method: "POST",
      body: JSON.stringify(job),
    });
  },

  async getCandidates(jobId: number): Promise<JobCandidate[]> {
    return await fetchApi<JobCandidate[]>(`/jobs/${jobId}/candidates`);
  },

  async getStats(jobId: number): Promise<{
    job_id: number;
    stage_counts: Record<string, number>;
    total_candidates: number;
    average_score: number | null;
  }> {
    return await fetchApi(`/jobs/${jobId}/stats`);
  }
};

// Candidates API
export const candidatesApi = {
  async getAll(params?: {
    job_id?: number;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<Candidate[]> {
    const searchParams = new URLSearchParams();
    if (params?.job_id) searchParams.append("job_id", params.job_id.toString());
    if (params?.status) searchParams.append("status", params.status);
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.offset) searchParams.append("offset", params.offset.toString());

    const candidates = await fetchApi<Candidate[]>(`/candidates/?${searchParams.toString()}`);
    return candidates.map(candidate => ({
      ...candidate,
      createdAt: new Date(candidate.created_at),
      lastUpdated: new Date(candidate.created_at), // Use created_at as fallback
      // Map backend fields to frontend expectations
      email: candidate.email,
      twitterHandle: candidate.x_handle,
      location: candidate.linkedin_data?.location,
      skills: candidate.linkedin_data?.skills || [],
      experience: candidate.linkedin_data?.experience || [],
      githubStats: candidate.linkedin_data?.github_stats,
      aiSummary: candidate.linkedin_data?.headline,
      aiRecommendation: getRecommendationFromScore(candidate.aiScore)
    }));
  },

  async getById(id: number): Promise<Candidate> {
    const candidate = await fetchApi<Candidate>(`/candidates/${id}`);
    return {
      ...candidate,
      createdAt: new Date(candidate.created_at),
      lastUpdated: new Date(candidate.created_at),
      email: candidate.email,
      twitterHandle: candidate.x_handle,
      location: candidate.linkedin_data?.location,
      skills: candidate.linkedin_data?.skills || [],
      experience: candidate.linkedin_data?.experience || [],
      githubStats: candidate.linkedin_data?.github_stats,
      aiSummary: candidate.linkedin_data?.headline,
      aiRecommendation: getRecommendationFromScore(candidate.aiScore)
    };
  },

  async updateStatus(candidateId: number, jobId: number, status: string): Promise<{ success: boolean; new_status: string }> {
    return await fetchApi(`/candidates/${candidateId}/jobs/${jobId}/update-status`, {
      method: "POST",
      body: JSON.stringify({ status }),
    });
  }
};

// Activity API
export const activityApi = {
  async getFeed(params?: {
    job_id?: number;
    limit?: number;
    offset?: number;
  }): Promise<ActivityEvent[]> {
    const searchParams = new URLSearchParams();
    if (params?.job_id) searchParams.append("job_id", params.job_id.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.offset) searchParams.append("offset", params.offset.toString());

    const activities = await fetchApi<ActivityEvent[]>(`/activity/feed?${searchParams.toString()}`);
    return activities.map(activity => ({
      ...activity,
      timestamp: new Date(activity.timestamp)
    }));
  },

  async getStats(days: number = 7): Promise<{
    total_activities: number;
    activity_by_type: Record<string, number>;
    most_active_jobs: { job_id: number; activity_count: number }[];
    period_days: number;
  }> {
    return await fetchApi(`/activity/stats?days=${days}`);
  },

  async getPipelineActivity(jobId: number): Promise<{
    job_id: number;
    pipeline_stages: Record<string, any[]>;
    other_activities: any[];
  }> {
    return await fetchApi(`/activity/pipeline/${jobId}`);
  },

  async getRecentOutreach(limit: number = 20): Promise<ActivityEvent[]> {
    const activities = await fetchApi<ActivityEvent[]>(`/activity/recent-outreach?limit=${limit}`);
    return activities.map(activity => ({
      ...activity,
      timestamp: new Date(activity.timestamp)
    }));
  }
};

// Logs API
export const logsApi = {
  async getAll(params?: {
    logtype?: string;
    job_id?: number;
    candidate_id?: number;
    limit?: number;
    offset?: number;
  }): Promise<AgentLog[]> {
    const searchParams = new URLSearchParams();
    if (params?.logtype) searchParams.append("logtype", params.logtype);
    if (params?.job_id) searchParams.append("job_id", params.job_id.toString());
    if (params?.candidate_id) searchParams.append("candidate_id", params.candidate_id.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.offset) searchParams.append("offset", params.offset.toString());

    return await fetchApi<AgentLog[]>(`/logs/?${searchParams.toString()}`);
  },

  async getRecent(limit: number = 50): Promise<AgentLog[]> {
    return await fetchApi<AgentLog[]>(`/logs/recent?limit=${limit}`);
  },

  async getTypes(): Promise<{ log_types: string[] }> {
    return await fetchApi("/logs/types");
  }
};

// Helper function to map scores to recommendations
function getRecommendationFromScore(score?: number): "reject" | "takehome" | "interview" | "fasttrack" | undefined {
  if (!score) return undefined;
  if (score >= 85) return "fasttrack";
  if (score >= 70) return "interview";
  if (score >= 50) return "takehome";
  return "reject";
}

// Export all APIs
export const api = {
  jobs: jobsApi,
  candidates: candidatesApi,
  activity: activityApi,
  logs: logsApi,
};