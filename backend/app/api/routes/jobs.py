from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from typing import List
from app.models.schemas import Job
from app.db.database import get_session
from app.services.grok_service import parse_job_description

router = APIRouter()

@router.post("/", response_model=Job)
async def create_job(job: Job, session: Session = Depends(get_session)):
    """
    Create a new job and parse JD with Grok
    
    Example Request:
    {
        "title": "Senior Backend Engineer",
        "description": "We are looking for...",
        "headcount": 2
    }
    """
    # Parse JD using Grok (extract structured requirements)
    requirements = await parse_job_description(job.description)
    job.requirements = requirements
    
    session.add(job)
    session.commit()
    session.refresh(job)
    
    return job

@router.get("/", response_model=List[Job])
async def list_jobs(session: Session = Depends(get_session)):
    """Get all jobs"""
    statement = select(Job)
    jobs = session.exec(statement).all()
    return jobs

@router.get("/{job_id}", response_model=Job)
async def get_job(job_id: int, session: Session = Depends(get_session)):
    """Get a specific job by ID"""
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

