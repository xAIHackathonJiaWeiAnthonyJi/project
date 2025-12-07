from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from app.db.database import get_session
from app.models.schemas import Candidate, JobCandidate, XSignal

router = APIRouter(prefix="/candidates", tags=["candidates"])

@router.get("/", response_model=List[Candidate])
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
        # Get candidates for a specific job with their job-specific data
        query = (
            select(Candidate, JobCandidate)
            .join(JobCandidate, Candidate.id == JobCandidate.candidate_id)
            .where(JobCandidate.job_id == job_id)
        )
        
        if status:
            query = query.where(JobCandidate.stage == status)
            
        query = query.offset(offset).limit(limit)
        results = session.exec(query).all()
        
        # Combine candidate and job-candidate data
        candidates = []
        for candidate, job_candidate in results:
            candidate_dict = candidate.dict()
            candidate_dict.update({
                "status": job_candidate.stage,
                "aiScore": job_candidate.compatibility_score,
                "aiReasoning": job_candidate.ai_reasoning,
                "strengths": job_candidate.strengths,
                "weaknesses": job_candidate.weaknesses,
                "jobId": job_candidate.job_id
            })
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

@router.post("/{candidate_id}/jobs/{job_id}/update-status")
def update_candidate_status(
    candidate_id: int,
    job_id: int,
    status: str,
    session: Session = Depends(get_session)
):
    """
    Update a candidate's status for a specific job
    """
    query = select(JobCandidate).where(
        JobCandidate.candidate_id == candidate_id,
        JobCandidate.job_id == job_id
    )
    job_candidate = session.exec(query).first()
    
    if not job_candidate:
        raise HTTPException(status_code=404, detail="Job-candidate relationship not found")
    
    job_candidate.stage = status
    session.add(job_candidate)
    session.commit()
    session.refresh(job_candidate)
    
    return {"success": True, "new_status": status}