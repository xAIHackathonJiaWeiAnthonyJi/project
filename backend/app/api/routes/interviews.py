"""
Interview API Routes
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlmodel import Session, select
from pydantic import BaseModel
from app.db.database import get_session
from app.models.schemas import InterviewTemplate, InterviewSubmission, Candidate, Job
from app.services.interview_service import interview_service
from app.services.interview_eval_service import interview_eval_service
from datetime import datetime

router = APIRouter(prefix="/interviews", tags=["interviews"])


# Request/Response Models
class CreateTemplateRequest(BaseModel):
    job_id: int
    interview_type: str  # "takehome" or "phone_screen"
    title: str
    description: str
    questions: List[dict]
    evaluation_criteria: dict
    time_limit_hours: Optional[int] = None


class DispatchInterviewRequest(BaseModel):
    candidate_id: int
    job_id: int
    template_id: int


class SubmitResponseRequest(BaseModel):
    submission_data: dict


class ReviewRequest(BaseModel):
    reviewer_name: str
    reviewer_notes: Optional[str] = None
    score_override: Optional[float] = None
    action: str  # "approve" or "reject"


# Template Management
@router.post("/templates")
async def create_template(
    request: CreateTemplateRequest,
    session: Session = Depends(get_session)
):
    """Create a new interview template"""
    
    # Verify job exists
    job = session.get(Job, request.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    template = await interview_service.create_template(
        job_id=request.job_id,
        interview_type=request.interview_type,
        title=request.title,
        description=request.description,
        questions=request.questions,
        evaluation_criteria=request.evaluation_criteria,
        time_limit_hours=request.time_limit_hours
    )
    
    return template


@router.get("/templates")
async def list_templates(
    job_id: Optional[int] = None,
    interview_type: Optional[str] = None,
    session: Session = Depends(get_session)
):
    """List interview templates"""
    
    query = select(InterviewTemplate)
    
    if job_id:
        query = query.where(InterviewTemplate.job_id == job_id)
    if interview_type:
        query = query.where(InterviewTemplate.interview_type == interview_type)
    
    templates = session.exec(query).all()
    return templates


@router.get("/templates/{template_id}")
async def get_template(
    template_id: int,
    session: Session = Depends(get_session)
):
    """Get a specific template"""
    
    template = session.get(InterviewTemplate, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    return template


# Interview Dispatch & Submissions
@router.post("/dispatch")
async def dispatch_interview(
    request: DispatchInterviewRequest,
    session: Session = Depends(get_session)
):
    """Dispatch an interview to a candidate"""
    
    submission = await interview_service.dispatch_interview(
        candidate_id=request.candidate_id,
        job_id=request.job_id,
        template_id=request.template_id
    )
    
    return {
        "success": True,
        "submission_id": submission.id,
        "status": submission.status,
        "message": "Interview dispatched successfully"
    }


@router.get("/")
async def list_submissions(
    job_id: Optional[int] = None,
    candidate_id: Optional[int] = None,
    status: Optional[str] = None,
    session: Session = Depends(get_session)
):
    """List interview submissions"""
    
    query = select(InterviewSubmission)
    
    if job_id:
        query = query.where(InterviewSubmission.job_id == job_id)
    if candidate_id:
        query = query.where(InterviewSubmission.candidate_id == candidate_id)
    if status:
        query = query.where(InterviewSubmission.status == status)
    
    submissions = session.exec(query).all()
    
    # Enrich with candidate and job info
    result = []
    for sub in submissions:
        candidate = session.get(Candidate, sub.candidate_id)
        job = session.get(Job, sub.job_id)
        template = session.get(InterviewTemplate, sub.template_id)
        
        result.append({
            **sub.dict(),
            "candidate_name": candidate.name if candidate else None,
            "candidate_x_handle": candidate.x_handle if candidate else None,
            "job_title": job.title if job else None,
            "template_title": template.title if template else None,
            "template_type": template.interview_type if template else None
        })
    
    return result


@router.get("/{submission_id}")
async def get_submission(
    submission_id: int,
    session: Session = Depends(get_session)
):
    """Get detailed submission information"""
    
    submission = session.get(InterviewSubmission, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    # Enrich with related data
    candidate = session.get(Candidate, submission.candidate_id)
    job = session.get(Job, submission.job_id)
    template = session.get(InterviewTemplate, submission.template_id)
    
    return {
        **submission.dict(),
        "candidate": {
            "id": candidate.id,
            "name": candidate.name,
            "email": candidate.email,
            "x_handle": candidate.x_handle,
            "x_bio": candidate.x_bio
        } if candidate else None,
        "job": {
            "id": job.id,
            "title": job.title,
            "description": job.description
        } if job else None,
        "template": {
            "id": template.id,
            "title": template.title,
            "description": template.description,
            "interview_type": template.interview_type,
            "questions": template.questions,
            "evaluation_criteria": template.evaluation_criteria
        } if template else None
    }


@router.post("/{submission_id}/submit")
async def submit_response(
    submission_id: int,
    request: SubmitResponseRequest,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session)
):
    """Submit a response to an interview"""
    
    submission = await interview_service.submit_response(
        submission_id=submission_id,
        submission_data=request.submission_data
    )
    
    # Trigger AI evaluation in background
    background_tasks.add_task(
        interview_eval_service.evaluate_submission,
        submission_id
    )
    
    return {
        "success": True,
        "submission_id": submission.id,
        "status": submission.status,
        "message": "Response submitted successfully. AI evaluation in progress."
    }


@router.post("/{submission_id}/evaluate")
async def trigger_evaluation(
    submission_id: int,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session)
):
    """Manually trigger AI evaluation for a submission"""
    
    submission = session.get(InterviewSubmission, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    if submission.status != "submitted":
        raise HTTPException(
            status_code=400,
            detail=f"Submission must be in 'submitted' status (current: {submission.status})"
        )
    
    # Trigger evaluation in background
    background_tasks.add_task(
        interview_eval_service.evaluate_submission,
        submission_id
    )
    
    return {
        "success": True,
        "submission_id": submission_id,
        "message": "AI evaluation started"
    }


@router.post("/{submission_id}/review")
async def review_submission(
    submission_id: int,
    request: ReviewRequest,
    session: Session = Depends(get_session)
):
    """Human review of a submission (approve or reject)"""
    
    if request.action == "approve":
        result = await interview_service.approve_submission(
            submission_id=submission_id,
            reviewer_name=request.reviewer_name,
            reviewer_notes=request.reviewer_notes,
            score_override=request.score_override
        )
    elif request.action == "reject":
        result = await interview_service.reject_submission(
            submission_id=submission_id,
            reviewer_name=request.reviewer_name,
            reviewer_notes=request.reviewer_notes
        )
    else:
        raise HTTPException(status_code=400, detail="Action must be 'approve' or 'reject'")
    
    return result


@router.get("/pending-reviews/")
async def get_pending_reviews(
    job_id: Optional[int] = None
):
    """Get submissions that need human review"""
    
    submissions = await interview_service.get_pending_reviews(job_id=job_id)
    return submissions


# Statistics
@router.get("/stats/{job_id}")
async def get_interview_stats(
    job_id: int,
    session: Session = Depends(get_session)
):
    """Get interview statistics for a job"""
    
    query = select(InterviewSubmission).where(InterviewSubmission.job_id == job_id)
    submissions = session.exec(query).all()
    
    if not submissions:
        return {
            "job_id": job_id,
            "total_interviews": 0,
            "status_breakdown": {},
            "average_ai_score": None,
            "approval_rate": 0
        }
    
    # Calculate statistics
    status_breakdown = {}
    ai_scores = []
    approved_count = 0
    reviewed_count = 0
    
    for sub in submissions:
        status = sub.status
        status_breakdown[status] = status_breakdown.get(status, 0) + 1
        
        if sub.ai_score is not None:
            ai_scores.append(sub.ai_score)
        
        if sub.human_reviewed:
            reviewed_count += 1
            if sub.status == "approved":
                approved_count += 1
    
    avg_score = sum(ai_scores) / len(ai_scores) if ai_scores else None
    approval_rate = (approved_count / reviewed_count * 100) if reviewed_count > 0 else 0
    
    return {
        "job_id": job_id,
        "total_interviews": len(submissions),
        "status_breakdown": status_breakdown,
        "average_ai_score": round(avg_score, 2) if avg_score else None,
        "approval_rate": round(approval_rate, 2),
        "reviewed_count": reviewed_count,
        "pending_review": status_breakdown.get("reviewed", 0)
    }

