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

