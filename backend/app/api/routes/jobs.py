from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select, func
from typing import List, Dict, Any
from app.models.schemas import Job, JobCandidate
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

@router.get("/")
async def list_jobs(session: Session = Depends(get_session)):
    """Get all jobs with candidate statistics"""
    # Get jobs
    jobs_query = select(Job)
    jobs = session.exec(jobs_query).all()
    
    # Get candidate counts for each job
    result = []
    for job in jobs:
        # Count total candidates
        total_count = session.exec(
            select(func.count(JobCandidate.id)).where(JobCandidate.job_id == job.id)
        ).first() or 0
        
        # Count screened candidates (those with scores)
        screened_count = session.exec(
            select(func.count(JobCandidate.id)).where(
                JobCandidate.job_id == job.id,
                JobCandidate.compatibility_score.is_not(None)
            )
        ).first() or 0
        
        job_dict = job.dict()
        job_dict.update({
            "candidateCount": total_count,
            "screenedCount": screened_count,
            "status": "active"  # Default status
        })
        result.append(job_dict)
    
    return result

@router.get("/{job_id}")
async def get_job(job_id: int, session: Session = Depends(get_session)):
    """Get a specific job by ID with candidate statistics"""
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Get candidate statistics
    total_count = session.exec(
        select(func.count(JobCandidate.id)).where(JobCandidate.job_id == job_id)
    ).first() or 0
    
    screened_count = session.exec(
        select(func.count(JobCandidate.id)).where(
            JobCandidate.job_id == job_id,
            JobCandidate.compatibility_score.is_not(None)
        )
    ).first() or 0
    
    job_dict = job.dict()
    job_dict.update({
        "candidateCount": total_count,
        "screenedCount": screened_count,
        "status": "active"
    })
    
    return job_dict

@router.get("/{job_id}/candidates")
async def get_job_candidates(job_id: int, session: Session = Depends(get_session)):
    """Get all candidates for a specific job"""
    # Verify job exists
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Get candidates with job-specific data
    query = (
        select(JobCandidate)
        .where(JobCandidate.job_id == job_id)
        .order_by(JobCandidate.compatibility_score.desc().nulls_last())
    )
    
    job_candidates = session.exec(query).all()
    return job_candidates

@router.get("/{job_id}/stats")
async def get_job_stats(job_id: int, session: Session = Depends(get_session)):
    """Get detailed statistics for a job"""
    # Verify job exists
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Count by stage
    stage_counts = {}
    stages = ["sourced", "screened", "takehome_assigned", "takehome_reviewed", "interview", "offer", "rejected"]
    
    for stage in stages:
        count = session.exec(
            select(func.count(JobCandidate.id)).where(
                JobCandidate.job_id == job_id,
                JobCandidate.stage == stage
            )
        ).first() or 0
        stage_counts[stage] = count
    
    # Average score
    avg_score = session.exec(
        select(func.avg(JobCandidate.compatibility_score)).where(
            JobCandidate.job_id == job_id,
            JobCandidate.compatibility_score.is_not(None)
        )
    ).first()
    
    return {
        "job_id": job_id,
        "stage_counts": stage_counts,
        "total_candidates": sum(stage_counts.values()),
        "average_score": round(avg_score, 2) if avg_score else None
    }

