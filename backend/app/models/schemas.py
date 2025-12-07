from typing import Optional, List, Dict
from sqlmodel import Field, SQLModel, JSON
from datetime import datetime

class Job(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str
    headcount: int = 1
    requirements: Dict = Field(default={}, sa_type=JSON)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Candidate(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: Optional[str] = None
    github_handle: Optional[str] = None
    resume_text: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

