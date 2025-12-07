import { Job, Candidate, ActivityEvent } from "@/types";

export const mockJobs: Job[] = [
  {
    id: "1",
    title: "Senior Frontend Engineer",
    description: "Build beautiful, performant user interfaces for our AI-powered platform. You'll work with React, TypeScript, and modern web technologies.",
    headcount: 3,
    requirements: ["React", "TypeScript", "5+ years experience", "System design"],
    createdAt: new Date("2024-01-15"),
    status: "active",
    candidateCount: 47,
    screenedCount: 23,
  },
  {
    id: "2",
    title: "ML Engineer",
    description: "Design and implement machine learning pipelines for our core recommendation engine. Experience with LLMs preferred.",
    headcount: 2,
    requirements: ["Python", "PyTorch/TensorFlow", "LLMs", "MLOps"],
    createdAt: new Date("2024-01-20"),
    status: "active",
    candidateCount: 31,
    screenedCount: 15,
  },
  {
    id: "3",
    title: "Backend Engineer",
    description: "Build scalable APIs and services that power millions of requests. Strong systems background required.",
    headcount: 4,
    requirements: ["Go/Rust", "Distributed Systems", "PostgreSQL", "Kubernetes"],
    createdAt: new Date("2024-01-25"),
    status: "active",
    candidateCount: 52,
    screenedCount: 28,
  },
];

export const mockCandidates: Candidate[] = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah.chen@email.com",
    githubUrl: "https://github.com/sarahchen",
    twitterHandle: "@sarahcodes",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    location: "San Francisco, CA",
    status: "screened",
    aiScore: 8.5,
    aiRecommendation: "interview",
    aiReasoning: "Strong React/TypeScript experience with 6 years at top tech companies. Active open-source contributor with 2k+ GitHub stars. Great communication skills evident from Twitter presence.",
    aiSummary: "Senior frontend engineer with deep React expertise. Previously at Stripe and Vercel. Maintains popular open-source UI component library.",
    skills: ["React", "TypeScript", "Next.js", "Node.js", "GraphQL"],
    experience: [
      { company: "Stripe", role: "Senior Frontend Engineer", duration: "3 years" },
      { company: "Vercel", role: "Frontend Engineer", duration: "2 years" },
    ],
    githubStats: {
      repos: 45,
      stars: 2341,
      contributions: 1823,
      languages: ["TypeScript", "JavaScript", "CSS"],
    },
    createdAt: new Date("2024-01-16"),
    lastUpdated: new Date("2024-01-28"),
  },
  {
    id: "2",
    name: "Marcus Johnson",
    email: "marcus.j@email.com",
    githubUrl: "https://github.com/marcusj",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    location: "Austin, TX",
    status: "takehome_assigned",
    aiScore: 6.2,
    aiRecommendation: "takehome",
    aiReasoning: "Promising background with 4 years experience. GitHub shows consistent activity but fewer public projects. Take-home will help assess practical skills.",
    aiSummary: "Mid-level frontend developer transitioning from Angular to React. Shows strong fundamentals and eagerness to learn modern tooling.",
    skills: ["React", "Angular", "JavaScript", "CSS", "HTML"],
    experience: [
      { company: "IBM", role: "Frontend Developer", duration: "4 years" },
    ],
    githubStats: {
      repos: 23,
      stars: 156,
      contributions: 892,
      languages: ["JavaScript", "TypeScript", "HTML"],
    },
    createdAt: new Date("2024-01-17"),
    lastUpdated: new Date("2024-01-27"),
  },
  {
    id: "3",
    name: "Elena Rodriguez",
    email: "elena.r@email.com",
    githubUrl: "https://github.com/elenarodriguez",
    twitterHandle: "@elena_dev",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    location: "New York, NY",
    status: "interview",
    aiScore: 9.1,
    aiRecommendation: "fasttrack",
    aiReasoning: "Exceptional candidate. Led frontend architecture at a unicorn startup. Multiple successful open-source projects. Strong Twitter presence showing thought leadership.",
    aiSummary: "Principal frontend engineer with architecture experience. Built design systems used by 100+ engineers. Speaker at React Conf.",
    skills: ["React", "TypeScript", "Design Systems", "Architecture", "Team Leadership"],
    experience: [
      { company: "Notion", role: "Principal Engineer", duration: "2 years" },
      { company: "Airbnb", role: "Senior Engineer", duration: "3 years" },
    ],
    githubStats: {
      repos: 67,
      stars: 5420,
      contributions: 2891,
      languages: ["TypeScript", "JavaScript", "Rust"],
    },
    createdAt: new Date("2024-01-15"),
    lastUpdated: new Date("2024-01-28"),
  },
  {
    id: "4",
    name: "James Kim",
    email: "james.kim@email.com",
    githubUrl: "https://github.com/jameskim",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    location: "Seattle, WA",
    status: "sourced",
    aiScore: undefined,
    aiRecommendation: undefined,
    aiReasoning: undefined,
    aiSummary: undefined,
    skills: ["React", "Vue", "JavaScript"],
    experience: [
      { company: "Amazon", role: "SDE II", duration: "2 years" },
    ],
    githubStats: {
      repos: 18,
      stars: 89,
      contributions: 567,
      languages: ["JavaScript", "Python", "Java"],
    },
    createdAt: new Date("2024-01-28"),
    lastUpdated: new Date("2024-01-28"),
  },
  {
    id: "5",
    name: "Priya Patel",
    email: "priya.p@email.com",
    githubUrl: "https://github.com/priyapatel",
    twitterHandle: "@priya_codes",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
    location: "London, UK",
    status: "rejected",
    aiScore: 3.2,
    aiRecommendation: "reject",
    aiReasoning: "Experience doesn't align with role requirements. Primarily backend focused with limited frontend exposure. Would be better suited for backend roles.",
    aiSummary: "Backend engineer with Python expertise. Limited React experience based on GitHub activity.",
    skills: ["Python", "Django", "PostgreSQL", "Docker"],
    experience: [
      { company: "Deliveroo", role: "Backend Engineer", duration: "3 years" },
    ],
    githubStats: {
      repos: 12,
      stars: 45,
      contributions: 423,
      languages: ["Python", "Go", "SQL"],
    },
    createdAt: new Date("2024-01-18"),
    lastUpdated: new Date("2024-01-26"),
  },
];

export const mockActivity: ActivityEvent[] = [
  // Agent Pipeline Events
  {
    id: "a1",
    type: "agent_pipeline_start",
    description: "Agent A1 started sourcing pipeline for ML Engineer role",
    timestamp: new Date("2024-01-28T15:00:00"),
    jobId: "2",
    metadata: { agent: "A1", pipeline_id: "pip_2001" }
  },
  {
    id: "a2",
    type: "agent_step",
    description: "Step 1/7: Generated job embedding (1536-dim vector)",
    timestamp: new Date("2024-01-28T15:00:15"),
    jobId: "2",
    metadata: { step: 1, agent: "A1" }
  },
  {
    id: "a3",
    type: "agent_step",
    description: "Step 2/7: Grok AI discovered 5 topics (LLM inference, PyTorch, distributed training...)",
    timestamp: new Date("2024-01-28T15:00:42"),
    jobId: "2",
    metadata: { step: 2, agent: "A1", topics_count: 5 }
  },
  {
    id: "a4",
    type: "agent_step",
    description: "Step 3/7: Found 19 active X users posting about ML topics",
    timestamp: new Date("2024-01-28T15:01:23"),
    jobId: "2",
    metadata: { step: 3, agent: "A1", users_found: 19 }
  },
  {
    id: "a5",
    type: "agent_step",
    description: "Step 4/7: Grok AI verified 7 developers (filtered 12 non-developers)",
    timestamp: new Date("2024-01-28T15:03:45"),
    jobId: "2",
    metadata: { step: 4, agent: "A1", developers_verified: 7 }
  },
  {
    id: "a6",
    type: "agent_step",
    description: "Step 5/7: Enriched 7 candidates with LinkedIn data",
    timestamp: new Date("2024-01-28T15:04:12"),
    jobId: "2",
    metadata: { step: 5, agent: "A1" }
  },
  {
    id: "a7",
    type: "agent_step",
    description: "Step 6/7: Computed compatibility scores (avg: 72/100)",
    timestamp: new Date("2024-01-28T15:06:33"),
    jobId: "2",
    metadata: { step: 6, agent: "A1", avg_score: 72 }
  },
  {
    id: "a8",
    type: "agent_step",
    description: "Step 7/7: Routed candidates - 1 interview, 6 take-home, 0 reject",
    timestamp: new Date("2024-01-28T15:06:45"),
    jobId: "2",
    metadata: { step: 7, agent: "A1", interview: 1, takehome: 6, reject: 0 }
  },
  
  // Outreach Events
  {
    id: "o1",
    type: "tweet_sent",
    description: "Tweeted mention to @Antonio_M_85 about ML Engineer role",
    timestamp: new Date("2024-01-28T15:07:12"),
    jobId: "2",
    metadata: { 
      username: "Antonio_M_85", 
      tweet_id: "1997634366974083126",
      recommendation: "interview"
    }
  },
  {
    id: "o2",
    type: "tweet_sent",
    description: "Tweeted mention to @grok about ML Engineer role",
    timestamp: new Date("2024-01-28T15:07:15"),
    jobId: "2",
    metadata: { 
      username: "grok", 
      tweet_id: "1997634368064626943",
      recommendation: "takehome"
    }
  },
  {
    id: "o3",
    type: "tweet_sent",
    description: "Tweeted mention to @DeepLearn007 about ML Engineer role",
    timestamp: new Date("2024-01-28T15:07:18"),
    jobId: "2",
    metadata: { 
      username: "DeepLearn007", 
      tweet_id: "1997634369054462355",
      recommendation: "takehome"
    }
  },
  
  // DM Responses
  {
    id: "d1",
    type: "dm_received",
    description: "@amitcoder1 responded: \"Yes, I'm interested! Would love to learn more.\"",
    timestamp: new Date("2024-01-28T16:23:45"),
    jobId: "2",
    metadata: { 
      username: "amitcoder1",
      message: "Yes, I'm interested! Would love to learn more.",
      sentiment: "positive"
    }
  },
  {
    id: "d2",
    type: "dm_received",
    description: "@Antonio_M_85 responded: \"Sounds interesting, tell me more about the team\"",
    timestamp: new Date("2024-01-28T17:15:22"),
    jobId: "2",
    metadata: { 
      username: "Antonio_M_85",
      message: "Sounds interesting, tell me more about the team",
      sentiment: "positive"
    }
  },
  
  // Original events
  {
    id: "1",
    type: "sourced",
    description: "AI sourced 12 new candidates from GitHub",
    timestamp: new Date("2024-01-28T14:30:00"),
    jobId: "1",
  },
  {
    id: "2",
    type: "screened",
    description: "AI completed screening for Sarah Chen (Score: 8.5/10)",
    timestamp: new Date("2024-01-28T14:15:00"),
    jobId: "1",
    candidateId: "1",
  },
  {
    id: "3",
    type: "override",
    description: "Recruiter moved Marcus Johnson to take-home (was: interview)",
    timestamp: new Date("2024-01-28T13:45:00"),
    jobId: "1",
    candidateId: "2",
  },
  {
    id: "4",
    type: "status_change",
    description: "Elena Rodriguez advanced to interview stage",
    timestamp: new Date("2024-01-28T12:00:00"),
    jobId: "1",
    candidateId: "3",
  },
  {
    id: "5",
    type: "policy_update",
    description: "Routing threshold updated: interview cutoff raised from 6.5 to 7.0",
    timestamp: new Date("2024-01-28T11:30:00"),
  },
  {
    id: "6",
    type: "screened",
    description: "AI completed batch screening for 8 candidates",
    timestamp: new Date("2024-01-28T10:00:00"),
    jobId: "2",
  },
];
