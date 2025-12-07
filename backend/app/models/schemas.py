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

