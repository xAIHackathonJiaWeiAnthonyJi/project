from typing import Optional, List, Dict
from sqlmodel import Field, SQLModel, JSON, Column, String, Text
from datetime import datetime

class Job(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str
    headcount: int = 1
    requirements: Dict = Field(default={}, sa_type=JSON)
    embedding_id: Optional[str] = None  # ChromaDB ID for job embedding
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Candidate(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: Optional[str] = None
    x_handle: Optional[str] = None  # X (Twitter) handle
    x_bio: Optional[str] = Field(default=None, sa_column=Column(Text))
    linkedin_data: Optional[Dict] = Field(default=None, sa_type=JSON)  # Mocked LinkedIn profile
    created_at: datetime = Field(default_factory=datetime.utcnow)

class XSignal(SQLModel, table=True):
    """Behavioral signals from X (Twitter)"""
    id: Optional[int] = Field(default=None, primary_key=True)
    candidate_id: int = Field(foreign_key="candidate.id")
    x_handle: str
    post_text: Optional[str] = Field(default=None, sa_column=Column(Text))
    engagement_type: str  # "post", "reply", "like", "retweet"
    topic: str  # Topic this signal relates to
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class JobCandidate(SQLModel, table=True):
    """Relationship between jobs and candidates with sourcing metadata"""
    id: Optional[int] = Field(default=None, primary_key=True)
    job_id: int = Field(foreign_key="job.id")
    candidate_id: int = Field(foreign_key="candidate.id")
    
    # Sourcing metadata
    compatibility_score: Optional[float] = None  # 0-100
    ai_reasoning: Optional[str] = Field(default=None, sa_column=Column(Text))
    strengths: Optional[List[str]] = Field(default=None, sa_type=JSON)
    weaknesses: Optional[List[str]] = Field(default=None, sa_type=JSON)
    
    # Pipeline stage - updated with new workflow
    stage: str = "sourced"  # sourced, reached_out, phone_screened, team_matched, rejected
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class AgentLog(SQLModel, table=True):
    """Logs for tracking all agent actions and operations"""
    id: Optional[int] = Field(default=None, primary_key=True)
    logtype: str  # Type of action: "sourcing", "scoring", "outreach", "search", "embedding", etc.
    log: str = Field(sa_column=Column(Text))  # Detailed log message/description
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    # Optional context for additional data
    job_id: Optional[int] = Field(default=None, foreign_key="job.id")
    candidate_id: Optional[int] = Field(default=None, foreign_key="candidate.id")
    context: Optional[Dict] = Field(default=None, sa_type=JSON)  # Additional context data

class InterviewTemplate(SQLModel, table=True):
    """Templates for take-home assignments and phone screen questions"""
    id: Optional[int] = Field(default=None, primary_key=True)
    job_id: int = Field(foreign_key="job.id")
    interview_type: str  # "takehome" or "phone_screen"
    title: str
    description: str = Field(sa_column=Column(Text))
    questions: Dict = Field(default={}, sa_type=JSON)  # List of questions/prompts
    evaluation_criteria: Dict = Field(default={}, sa_type=JSON)  # Scoring rubric
    time_limit_hours: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class InterviewSubmission(SQLModel, table=True):
    """Tracks interview submissions and AI + human evaluations"""
    id: Optional[int] = Field(default=None, primary_key=True)
    candidate_id: int = Field(foreign_key="candidate.id")
    job_id: int = Field(foreign_key="job.id")
    template_id: int = Field(foreign_key="interviewtemplate.id")
    
    # Submission details
    submitted_at: Optional[datetime] = None
    submission_data: Dict = Field(default={}, sa_type=JSON)  # Responses/links/files
    
    # Phone screen transcript (for phone interviews)
    call_transcript: Optional[str] = Field(default=None, sa_column=Column(Text))
    call_duration_minutes: Optional[int] = None
    call_recording_url: Optional[str] = None
    
    # AI Evaluation
    ai_score: Optional[float] = None  # 0-100
    ai_reasoning: Optional[str] = Field(default=None, sa_column=Column(Text))
    ai_strengths: Optional[List[str]] = Field(default=None, sa_type=JSON)
    ai_weaknesses: Optional[List[str]] = Field(default=None, sa_type=JSON)
    ai_recommendation: Optional[str] = None  # "strong_yes", "yes", "maybe", "no"
    
    # Human Review
    human_reviewed: bool = False
    human_score_override: Optional[float] = None
    reviewer_notes: Optional[str] = Field(default=None, sa_column=Column(Text))
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    
    # Status
    status: str = "sent"  # sent, submitted, evaluating, reviewed, approved, rejected
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Team(SQLModel, table=True):
    """Engineering teams available for placement"""
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = Field(default=None, sa_column=Column(Text))
    tech_stack: List[str] = Field(sa_type=JSON)  # ["React", "Node.js", "AWS"]
    team_size: int
    manager_name: Optional[str] = None
    current_needs: List[str] = Field(sa_type=JSON)  # ["Senior Frontend", "Backend Engineer"]
    team_culture: Optional[str] = Field(default=None, sa_column=Column(Text))
    projects: Optional[List[str]] = Field(default=None, sa_type=JSON)
    location: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class TeamMatch(SQLModel, table=True):
    """AI-generated team matches for candidates"""
    id: Optional[int] = Field(default=None, primary_key=True)
    candidate_id: int = Field(foreign_key="candidate.id")
    job_id: int = Field(foreign_key="job.id")
    team_id: int = Field(foreign_key="team.id")
    
    # AI matching scores
    similarity_score: float  # 0-1 from embeddings
    reasoning_adjustment: float  # 0-1 from LLM
    final_score: float  # (0.7 * similarity) + (0.3 * reasoning)
    
    # AI reasoning
    match_reasoning: Optional[str] = Field(default=None, sa_column=Column(Text))
    strengths: Optional[List[str]] = Field(default=None, sa_type=JSON)
    concerns: Optional[List[str]] = Field(default=None, sa_type=JSON)
    recommendation: str  # "strong_match", "good_match", "possible_match", "not_recommended"
    
    # Threshold and Manager Notifications
    passes_threshold: bool = False  # True if final_score >= 0.65
    profile_sent_to_manager: bool = False
    sent_to_manager_at: Optional[datetime] = None
    manager_email: Optional[str] = None
    manager_notified: bool = False
    
    # Human decision
    human_reviewed: bool = False
    human_decision: Optional[str] = None  # "approved", "rejected", "needs_discussion"
    reviewer_notes: Optional[str] = Field(default=None, sa_column=Column(Text))
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    
    # Placement status
    status: str = "pending"  # pending, offered, accepted, declined
    offered_at: Optional[datetime] = None
    responded_at: Optional[datetime] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class CandidateOutcome(SQLModel, table=True):
    """Tracks actual hiring outcomes for adaptive learning"""
    id: Optional[int] = Field(default=None, primary_key=True)
    candidate_id: int = Field(foreign_key="candidate.id")
    job_id: int = Field(foreign_key="job.id")
    
    # Original AI predictions
    predicted_compatibility_score: float  # What the AI predicted
    predicted_stage_recommendation: str  # fasttrack, interview, takehome, reject
    
    # Actual outcome
    outcome: str  # "hired", "rejected_interview", "rejected_screen", "rejected_sourcing", "withdrew"
    outcome_reason: Optional[str] = Field(default=None, sa_column=Column(Text))
    
    # Performance feedback (if hired)
    performance_rating: Optional[float] = None  # 1-5 stars from manager
    retention_months: Optional[int] = None  # How long they stayed
    would_hire_again: Optional[bool] = None  # Manager feedback
    
    # Feedback on AI decision quality
    ai_was_correct: Optional[bool] = None  # Did AI make the right call?
    feedback_notes: Optional[str] = Field(default=None, sa_column=Column(Text))
    
    # Metadata
    reported_by: Optional[str] = None
    reported_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AgentLearningParams(SQLModel, table=True):
    """Adaptive learning parameters that evolve based on outcomes"""
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Agent identifier
    agent_name: str  # "sourcing_agent", "interview_agent", "team_match_agent"
    version: int = 1  # Increments with each update
    
    # Scoring thresholds (dynamic)
    threshold_reject: float = 40.0  # Below this = reject
    threshold_takehome: float = 60.0  # Above this = takehome
    threshold_interview: float = 75.0  # Above this = interview
    threshold_fasttrack: float = 90.0  # Above this = fasttrack
    
    # Feature weights for compatibility scoring
    weights: Dict = Field(default={
        "x_activity": 0.2,
        "linkedin_experience": 0.3,
        "technical_signals": 0.3,
        "cultural_fit": 0.2
    }, sa_type=JSON)
    
    # Learning metrics
    total_predictions: int = 0
    correct_predictions: int = 0
    accuracy: float = 0.0
    
    # Performance by prediction type
    precision_by_stage: Dict = Field(default={
        "fasttrack": {"tp": 0, "fp": 0, "fn": 0},
        "interview": {"tp": 0, "fp": 0, "fn": 0},
        "takehome": {"tp": 0, "fp": 0, "fn": 0},
        "reject": {"tp": 0, "fp": 0, "fn": 0}
    }, sa_type=JSON)
    
    # Learning rate
    learning_rate: float = 0.1  # How fast to adapt
    
    # Metadata
    last_updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True  # Use this version for predictions

