from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from app.db.database import get_session
from app.models.schemas import Candidate, JobCandidate, XSignal
from app.utils.logger import AgentLogger
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/candidates", tags=["candidates"])

# Valid candidate stages
VALID_STAGES = ["sourced", "reached_out", "phone_screened", "team_matched", "rejected"]

class StageUpdateRequest(BaseModel):
    stage: str
    notes: Optional[str] = None

@router.get("/stages")
def get_candidate_stages():
    """
    Get available candidate stages and their progression
    """
    stages = [
        {
            "id": "sourced",
            "name": "Sourced",
            "description": "Candidate has been identified and added to the pipeline",
            "color": "blue",
            "next_stages": ["reached_out", "rejected"]
        },
        {
            "id": "reached_out", 
            "name": "Reached Out",
            "description": "Initial outreach sent to candidate",
            "color": "yellow",
            "next_stages": ["phone_screened", "rejected"]
        },
        {
            "id": "phone_screened",
            "name": "Phone Screened", 
            "description": "Initial phone/video screening completed",
            "color": "orange",
            "next_stages": ["team_matched", "rejected"]
        },
        {
            "id": "team_matched",
            "name": "Team Matched",
            "description": "Candidate matched with team and ready for hire",
            "color": "green", 
            "next_stages": ["rejected"]  # Can still be rejected
        },
        {
            "id": "rejected",
            "name": "Rejected",
            "description": "Candidate not moving forward",
            "color": "red",
            "next_stages": []  # Terminal state
        }
    ]
    
    return {
        "stages": stages,
        "workflow": {
            "linear_progression": ["sourced", "reached_out", "phone_screened", "team_matched"],
            "can_reject_from_any": True
        }
    }

@router.get("/")
def get_candidates(
    session: Session = Depends(get_session),
    job_id: Optional[int] = Query(None, description="Filter candidates by job ID"),
    status: Optional[str] = Query(None, description="Filter by candidate status"),
    limit: int = Query(100, description="Maximum number of candidates to return", le=500),
    offset: int = Query(0, description="Number of candidates to skip")
):
    """
    Get candidates with optional filtering
    """
    if job_id:
        # Get job-candidate relationships first
        jc_query = select(JobCandidate).where(JobCandidate.job_id == job_id)
        if status:
            jc_query = jc_query.where(JobCandidate.stage == status)
        jc_query = jc_query.offset(offset).limit(limit)
        job_candidates = session.exec(jc_query).all()
        
        # Get corresponding candidates and combine data
        candidates = []
        for job_candidate in job_candidates:
            candidate = session.get(Candidate, job_candidate.candidate_id)
            if candidate:
                candidate_dict = {
                    "id": candidate.id,
                    "name": candidate.name,
                    "email": candidate.email,
                    "x_handle": candidate.x_handle,
                    "x_bio": candidate.x_bio,
                    "linkedin_data": candidate.linkedin_data,
                    "created_at": candidate.created_at,
                    "status": job_candidate.stage,
                    "aiScore": job_candidate.compatibility_score,
                    "aiReasoning": job_candidate.ai_reasoning,
                    "strengths": job_candidate.strengths,
                    "weaknesses": job_candidate.weaknesses,
                    "jobId": job_candidate.job_id
                }
                candidates.append(candidate_dict)
        
        return candidates
    else:
        # Get all candidates
        query = select(Candidate).offset(offset).limit(limit)
        candidates = session.exec(query).all()
        return candidates

@router.get("/{candidate_id}", response_model=Candidate)
def get_candidate(candidate_id: int, session: Session = Depends(get_session)):
    """
    Get a specific candidate by ID
    """
    candidate = session.get(Candidate, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate

@router.get("/{candidate_id}/jobs")
def get_candidate_jobs(candidate_id: int, session: Session = Depends(get_session)):
    """
    Get all jobs a candidate has been considered for
    """
    query = select(JobCandidate).where(JobCandidate.candidate_id == candidate_id)
    job_candidates = session.exec(query).all()
    return job_candidates

@router.get("/{candidate_id}/signals", response_model=List[XSignal])
def get_candidate_signals(candidate_id: int, session: Session = Depends(get_session)):
    """
    Get X signals for a candidate
    """
    query = select(XSignal).where(XSignal.candidate_id == candidate_id)
    signals = session.exec(query).all()
    return signals

@router.post("/{candidate_id}/jobs/{job_id}/update-stage")
def update_candidate_stage(
    candidate_id: int,
    job_id: int,
    request: StageUpdateRequest,
    session: Session = Depends(get_session)
):
    """
    Update a candidate's stage for a specific job
    """
    # Validate stage
    if request.stage not in VALID_STAGES:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid stage. Must be one of: {', '.join(VALID_STAGES)}"
        )
    
    # Find the job-candidate relationship
    query = select(JobCandidate).where(
        JobCandidate.candidate_id == candidate_id,
        JobCandidate.job_id == job_id
    )
    job_candidate = session.exec(query).first()
    
    if not job_candidate:
        raise HTTPException(status_code=404, detail="Job-candidate relationship not found")
    
    # Get candidate name for logging
    candidate = session.get(Candidate, candidate_id)
    candidate_name = candidate.name if candidate else f"Candidate {candidate_id}"
    
    # Store previous stage for logging
    previous_stage = job_candidate.stage
    
    # Update stage and timestamp
    job_candidate.stage = request.stage
    job_candidate.updated_at = datetime.utcnow()
    session.add(job_candidate)
    session.commit()
    session.refresh(job_candidate)
    
    # Log the stage change
    stage_display = {
        "sourced": "Sourced",
        "reached_out": "Reached Out",
        "phone_screened": "Phone Screened", 
        "team_matched": "Team Matched",
        "rejected": "Rejected"
    }
    
    log_message = f"Stage updated for {candidate_name}: {stage_display.get(previous_stage, previous_stage)} → {stage_display.get(request.stage, request.stage)}"
    if request.notes:
        log_message += f" (Notes: {request.notes})"
    
    AgentLogger.log(
        logtype="stage_change",
        message=log_message,
        job_id=job_id,
        candidate_id=candidate_id,
        previous_stage=previous_stage,
        new_stage=request.stage,
        notes=request.notes
    )
    
    return {
        "success": True, 
        "previous_stage": previous_stage,
        "new_stage": request.stage,
        "candidate_name": candidate_name,
        "updated_at": job_candidate.updated_at.isoformat() + "Z"
    }

# Keep the old endpoint for backward compatibility
@router.post("/{candidate_id}/jobs/{job_id}/update-status")
def update_candidate_status(
    candidate_id: int,
    job_id: int,
    status: str,
    session: Session = Depends(get_session)
):
    """
    Update a candidate's status for a specific job (legacy endpoint)
    """
    request = StageUpdateRequest(stage=status)
    return update_candidate_stage(candidate_id, job_id, request, session)

@router.get("/stages")
def get_candidate_stages():
    """
    Get available candidate stages and their progression
    """
    stages = [
        {
            "id": "sourced",
            "name": "Sourced",
            "description": "Candidate has been identified and added to the pipeline",
            "color": "blue",
            "next_stages": ["reached_out", "rejected"]
        },
        {
            "id": "reached_out", 
            "name": "Reached Out",
            "description": "Initial outreach sent to candidate",
            "color": "yellow",
            "next_stages": ["phone_screened", "rejected"]
        },
        {
            "id": "phone_screened",
            "name": "Phone Screened", 
            "description": "Initial phone/video screening completed",
            "color": "orange",
            "next_stages": ["team_matched", "rejected"]
        },
        {
            "id": "team_matched",
            "name": "Team Matched",
            "description": "Candidate matched with team and ready for hire",
            "color": "green", 
            "next_stages": ["rejected"]  # Can still be rejected
        },
        {
            "id": "rejected",
            "name": "Rejected",
            "description": "Candidate not moving forward",
            "color": "red",
            "next_stages": []  # Terminal state
        }
    ]
    
    return {
        "stages": stages,
        "workflow": {
            "linear_progression": ["sourced", "reached_out", "phone_screened", "team_matched"],
            "can_reject_from_any": True
        }
    }