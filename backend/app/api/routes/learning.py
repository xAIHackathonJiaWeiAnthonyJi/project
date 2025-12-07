"""
Learning & Outcomes API Routes - Track AI performance and adaptive learning
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel
from app.db.database import get_session
from app.models.schemas import CandidateOutcome, AgentLearningParams, Candidate, Job
from datetime import datetime

router = APIRouter(prefix="/learning", tags=["learning"])


# Request/Response Models
class CreateOutcomeRequest(BaseModel):
    candidate_id: int
    job_id: int
    predicted_compatibility_score: float
    predicted_stage_recommendation: str
    outcome: str
    outcome_reason: Optional[str] = None
    performance_rating: Optional[float] = None
    retention_months: Optional[int] = None
    would_hire_again: Optional[bool] = None
    ai_was_correct: Optional[bool] = None
    feedback_notes: Optional[str] = None
    reported_by: Optional[str] = None


class UpdateLearningParamsRequest(BaseModel):
    threshold_reject: Optional[float] = None
    threshold_takehome: Optional[float] = None
    threshold_interview: Optional[float] = None
    threshold_fasttrack: Optional[float] = None
    weights: Optional[dict] = None
    learning_rate: Optional[float] = None


# Candidate Outcomes
@router.post("/outcomes")
async def create_outcome(
    request: CreateOutcomeRequest,
    session: Session = Depends(get_session)
):
    """Record a candidate outcome for learning"""
    outcome = CandidateOutcome(
        candidate_id=request.candidate_id,
        job_id=request.job_id,
        predicted_compatibility_score=request.predicted_compatibility_score,
        predicted_stage_recommendation=request.predicted_stage_recommendation,
        outcome=request.outcome,
        outcome_reason=request.outcome_reason,
        performance_rating=request.performance_rating,
        retention_months=request.retention_months,
        would_hire_again=request.would_hire_again,
        ai_was_correct=request.ai_was_correct,
        feedback_notes=request.feedback_notes,
        reported_by=request.reported_by,
        reported_at=datetime.utcnow()
    )
    
    session.add(outcome)
    session.commit()
    session.refresh(outcome)
    
    return outcome


@router.get("/outcomes")
async def list_outcomes(
    job_id: Optional[int] = None,
    outcome: Optional[str] = None,
    session: Session = Depends(get_session)
):
    """Get all candidate outcomes"""
    query = select(CandidateOutcome)
    
    if job_id:
        query = query.where(CandidateOutcome.job_id == job_id)
    if outcome:
        query = query.where(CandidateOutcome.outcome == outcome)
    
    query = query.order_by(CandidateOutcome.reported_at.desc())
    outcomes = session.exec(query).all()
    
    # Enrich with candidate and job data
    result = []
    for o in outcomes:
        candidate = session.get(Candidate, o.candidate_id)
        job = session.get(Job, o.job_id)
        
        result.append({
            "id": o.id,
            "candidate": {
                "id": candidate.id,
                "name": candidate.name,
                "email": candidate.email
            } if candidate else None,
            "job": {
                "id": job.id,
                "title": job.title
            } if job else None,
            "predicted_compatibility_score": o.predicted_compatibility_score,
            "predicted_stage_recommendation": o.predicted_stage_recommendation,
            "outcome": o.outcome,
            "outcome_reason": o.outcome_reason,
            "performance_rating": o.performance_rating,
            "retention_months": o.retention_months,
            "would_hire_again": o.would_hire_again,
            "ai_was_correct": o.ai_was_correct,
            "feedback_notes": o.feedback_notes,
            "reported_by": o.reported_by,
            "reported_at": o.reported_at,
            "created_at": o.created_at
        })
    
    return result


@router.get("/outcomes/stats")
async def get_outcome_stats(
    job_id: Optional[int] = None,
    session: Session = Depends(get_session)
):
    """Get aggregate statistics on outcomes"""
    query = select(CandidateOutcome)
    if job_id:
        query = query.where(CandidateOutcome.job_id == job_id)
    
    outcomes = session.exec(query).all()
    
    total = len(outcomes)
    if total == 0:
        return {
            "total_outcomes": 0,
            "hired_count": 0,
            "rejected_count": 0,
            "ai_accuracy": 0,
            "avg_performance_rating": 0,
            "avg_retention_months": 0
        }
    
    hired = sum(1 for o in outcomes if o.outcome == "hired")
    rejected = sum(1 for o in outcomes if o.outcome.startswith("rejected"))
    withdrew = sum(1 for o in outcomes if o.outcome == "withdrew")
    
    ai_correct = sum(1 for o in outcomes if o.ai_was_correct is True)
    ai_total = sum(1 for o in outcomes if o.ai_was_correct is not None)
    
    performance_ratings = [o.performance_rating for o in outcomes if o.performance_rating is not None]
    retention_months = [o.retention_months for o in outcomes if o.retention_months is not None]
    
    return {
        "total_outcomes": total,
        "hired_count": hired,
        "rejected_count": rejected,
        "withdrew_count": withdrew,
        "ai_accuracy": (ai_correct / ai_total * 100) if ai_total > 0 else 0,
        "avg_performance_rating": sum(performance_ratings) / len(performance_ratings) if performance_ratings else 0,
        "avg_retention_months": sum(retention_months) / len(retention_months) if retention_months else 0,
        "outcome_distribution": {
            "hired": hired,
            "rejected": rejected,
            "withdrew": withdrew
        }
    }


# Agent Learning Parameters
@router.get("/params/{agent_name}")
async def get_learning_params(
    agent_name: str,
    session: Session = Depends(get_session)
):
    """Get current learning parameters for an agent"""
    query = select(AgentLearningParams).where(
        AgentLearningParams.agent_name == agent_name,
        AgentLearningParams.is_active == True
    ).order_by(AgentLearningParams.version.desc())
    
    params = session.exec(query).first()
    
    if not params:
        # Return default params if none exist
        return {
            "agent_name": agent_name,
            "version": 0,
            "threshold_reject": 40.0,
            "threshold_takehome": 60.0,
            "threshold_interview": 75.0,
            "threshold_fasttrack": 90.0,
            "weights": {
                "x_activity": 0.2,
                "linkedin_experience": 0.3,
                "technical_signals": 0.3,
                "cultural_fit": 0.2
            },
            "total_predictions": 0,
            "correct_predictions": 0,
            "accuracy": 0.0,
            "learning_rate": 0.1,
            "is_active": False
        }
    
    return params


@router.get("/params")
async def list_all_params(
    session: Session = Depends(get_session)
):
    """Get all agent learning parameters"""
    query = select(AgentLearningParams).where(
        AgentLearningParams.is_active == True
    ).order_by(AgentLearningParams.agent_name)
    
    params = session.exec(query).all()
    return params


@router.put("/params/{agent_name}")
async def update_learning_params(
    agent_name: str,
    request: UpdateLearningParamsRequest,
    session: Session = Depends(get_session)
):
    """Update learning parameters for an agent"""
    # Get current params
    query = select(AgentLearningParams).where(
        AgentLearningParams.agent_name == agent_name,
        AgentLearningParams.is_active == True
    )
    current_params = session.exec(query).first()
    
    if current_params:
        # Deactivate old version
        current_params.is_active = False
        session.add(current_params)
        
        # Create new version
        new_version = current_params.version + 1
    else:
        new_version = 1
    
    # Create new params
    new_params = AgentLearningParams(
        agent_name=agent_name,
        version=new_version,
        threshold_reject=request.threshold_reject or (current_params.threshold_reject if current_params else 40.0),
        threshold_takehome=request.threshold_takehome or (current_params.threshold_takehome if current_params else 60.0),
        threshold_interview=request.threshold_interview or (current_params.threshold_interview if current_params else 75.0),
        threshold_fasttrack=request.threshold_fasttrack or (current_params.threshold_fasttrack if current_params else 90.0),
        weights=request.weights or (current_params.weights if current_params else {}),
        learning_rate=request.learning_rate or (current_params.learning_rate if current_params else 0.1),
        total_predictions=current_params.total_predictions if current_params else 0,
        correct_predictions=current_params.correct_predictions if current_params else 0,
        accuracy=current_params.accuracy if current_params else 0.0,
        precision_by_stage=current_params.precision_by_stage if current_params else {},
        is_active=True
    )
    
    session.add(new_params)
    session.commit()
    session.refresh(new_params)
    
    return new_params


@router.get("/params/{agent_name}/history")
async def get_params_history(
    agent_name: str,
    session: Session = Depends(get_session)
):
    """Get version history of learning parameters"""
    query = select(AgentLearningParams).where(
        AgentLearningParams.agent_name == agent_name
    ).order_by(AgentLearningParams.version.desc())
    
    params = session.exec(query).all()
    return params
