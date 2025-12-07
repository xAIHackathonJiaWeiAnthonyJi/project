import { Job, Candidate, ActivityEvent, AgentLog, JobCandidate, CandidateStage, StageUpdateRequest, CandidateStatus } from "@/types";

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
    // Ensure proper types for requirements field
    return jobs.map(job => ({
      ...job,
      requirements: typeof job.requirements === 'object' && !Array.isArray(job.requirements) 
        ? job.requirements 
        : { skills: Array.isArray(job.requirements) ? job.requirements : [] }
    }));
  },

  async getById(id: number): Promise<Job> {
    const job = await fetchApi<Job>(`/jobs/${id}`);
    return {
      ...job,
      requirements: typeof job.requirements === 'object' && !Array.isArray(job.requirements)
        ? job.requirements
        : { skills: Array.isArray(job.requirements) ? job.requirements : [] }
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

    const candidates = await fetchApi<any[]>(`/candidates/?${searchParams.toString()}`);
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
      githubUrl: candidate.linkedin_data?.github_stats ? `https://github.com/${candidate.x_handle?.replace('@', '')}` : undefined,
      aiSummary: candidate.aiReasoning || candidate.linkedin_data?.headline,
      aiScore: candidate.aiScore,
      status: candidate.status || 'sourced',
      aiRecommendation: getRecommendationFromScore(candidate.aiScore),
      strengths: candidate.strengths,
      weaknesses: candidate.weaknesses
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
  },

  async updateStage(candidateId: number, jobId: number, request: StageUpdateRequest): Promise<{
    success: boolean;
    previous_stage: CandidateStatus;
    new_stage: CandidateStatus;
    candidate_name: string;
    updated_at: string;
  }> {
    return await fetchApi(`/candidates/${candidateId}/jobs/${jobId}/update-stage`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  async getStages(): Promise<{
    stages: CandidateStage[];
    workflow: {
      linear_progression: CandidateStatus[];
      can_reject_from_any: boolean;
    };
  }> {
    return await fetchApi("/candidates/stages");
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
    return activities;
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
    return activities;
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

// Sourcing API
export const sourcingApi = {
  async startPipeline(jobId: number, options: {
    sendOutreach?: boolean;
    dryRun?: boolean;
    jobLink?: string;
  } = {}): Promise<{
    success: boolean;
    message: string;
    job_id: number;
    pipeline_id?: string;
  }> {
    return await fetchApi("/sourcing/start", {
      method: "POST",
      body: JSON.stringify({
        job_id: jobId,
        send_outreach: options.sendOutreach || false,
        dry_run: options.dryRun !== false, // Default to true
        job_link: options.jobLink
      }),
    });
  },

  async getStatus(jobId: number): Promise<{
    job_id: number;
    is_running: boolean;
    pipeline_id?: string;
    status: string;
  }> {
    return await fetchApi(`/sourcing/status/${jobId}`);
  },

  async stopPipeline(jobId: number): Promise<{
    success: boolean;
    message: string;
    pipeline_id?: string;
  }> {
    return await fetchApi(`/sourcing/stop/${jobId}`, {
      method: "POST",
    });
  },

  async listRunningPipelines(): Promise<{
    running_pipelines: { job_id: number; pipeline_id: string }[];
    total_running: number;
  }> {
    return await fetchApi("/sourcing/pipelines");
  }
};

// Interview API
export const interviewsApi = {
  async createTemplate(data: {
    job_id: number;
    interview_type: string;
    title: string;
    description: string;
    questions: any[];
    evaluation_criteria: any;
    time_limit_hours?: number;
  }) {
    return await fetchApi("/interviews/templates", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getTemplates(params?: { job_id?: number; interview_type?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.job_id) searchParams.append("job_id", params.job_id.toString());
    if (params?.interview_type) searchParams.append("interview_type", params.interview_type);
    return await fetchApi(`/interviews/templates?${searchParams.toString()}`);
  },

  async dispatchInterview(data: {
    candidate_id: number;
    job_id: number;
    template_id: number;
  }) {
    return await fetchApi("/interviews/dispatch", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getSubmissions(params?: {
    job_id?: number;
    candidate_id?: number;
    status?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.job_id) searchParams.append("job_id", params.job_id.toString());
    if (params?.candidate_id) searchParams.append("candidate_id", params.candidate_id.toString());
    if (params?.status) searchParams.append("status", params.status);
    return await fetchApi(`/interviews/?${searchParams.toString()}`);
  },

  async getSubmission(id: number) {
    return await fetchApi(`/interviews/${id}`);
  },

  async submitResponse(id: number, data: any) {
    return await fetchApi(`/interviews/${id}/submit`, {
      method: "POST",
      body: JSON.stringify({ submission_data: data }),
    });
  },

  async triggerEvaluation(id: number) {
    return await fetchApi(`/interviews/${id}/evaluate`, {
      method: "POST",
    });
  },

  async reviewSubmission(id: number, data: {
    reviewer_name: string;
    action: "approve" | "reject";
    reviewer_notes?: string;
    score_override?: number;
  }) {
    return await fetchApi(`/interviews/${id}/review`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getPendingReviews(job_id?: number) {
    const url = job_id 
      ? `/interviews/pending-reviews/?job_id=${job_id}`
      : "/interviews/pending-reviews/";
    return await fetchApi(url);
  },

  async getStats(job_id: number) {
    return await fetchApi(`/interviews/stats/${job_id}`);
  },
};

// Teams API
export const teamsApi = {
  async getAll() {
    return await fetchApi("/teams/");
  },

  async getById(id: number) {
    return await fetchApi(`/teams/${id}`);
  },

  async create(data: {
    name: string;
    description?: string;
    tech_stack: string[];
    team_size: number;
    manager_name?: string;
    current_needs: string[];
    team_culture?: string;
    projects?: string[];
    location?: string;
  }) {
    return await fetchApi("/teams/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async matchCandidate(candidateId: number, jobId: number) {
    return await fetchApi("/teams/match", {
      method: "POST",
      body: JSON.stringify({
        candidate_id: candidateId,
        job_id: jobId,
      }),
    });
  },

  async getCandidateMatches(candidateId: number, jobId?: number) {
    const params = new URLSearchParams();
    if (jobId) params.append("job_id", jobId.toString());
    return await fetchApi(`/teams/matches/${candidateId}?${params.toString()}`);
  },

  async getMatch(matchId: number) {
    return await fetchApi(`/teams/matches/${matchId}`);
  },

  async approveMatch(matchId: number, reviewerName: string, notes?: string) {
    return await fetchApi(`/teams/matches/${matchId}/approve`, {
      method: "POST",
      body: JSON.stringify({
        reviewer_name: reviewerName,
        reviewer_notes: notes,
      }),
    });
  },
};

// Export all APIs
export const api = {
  jobs: jobsApi,
  candidates: candidatesApi,
  activity: activityApi,
  logs: logsApi,
  sourcing: sourcingApi,
  interviews: interviewsApi,
  teams: teamsApi,
};