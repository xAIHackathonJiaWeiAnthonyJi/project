from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select, func
from datetime import datetime, timedelta
from app.db.database import get_session
from app.models.schemas import AgentLog, Job, Candidate, JobCandidate

router = APIRouter(prefix="/activity", tags=["activity"])

@router.get("/feed")
def get_activity_feed(
    session: Session = Depends(get_session),
    job_id: Optional[int] = Query(None, description="Filter by job ID"),
    limit: int = Query(50, description="Maximum number of activities to return", le=200),
    offset: int = Query(0, description="Number of activities to skip")
):
    """
    Get activity feed combining agent logs and other events
    """
    query = select(AgentLog)
    
    if job_id:
        query = query.where(AgentLog.job_id == job_id)
    
    query = query.order_by(AgentLog.timestamp.desc()).offset(offset).limit(limit)
    logs = session.exec(query).all()
    
    # Convert logs to activity format
    activities = []
    for log in logs:
        # Map log types to activity types
        activity_type = map_log_type_to_activity_type(log.logtype)
        
        activity = {
            "id": f"log_{log.id}",
            "type": activity_type,
            "description": log.log,
            "timestamp": log.timestamp,
            "jobId": str(log.job_id) if log.job_id else None,
            "candidateId": str(log.candidate_id) if log.candidate_id else None,
            "metadata": log.context or {}
        }
        activities.append(activity)
    
    return activities

@router.get("/stats")
def get_activity_stats(
    session: Session = Depends(get_session),
    days: int = Query(7, description="Number of days to look back for stats")
):
    """
    Get activity statistics for the dashboard
    """
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    # Total activities
    total_activities = session.exec(
        select(func.count(AgentLog.id)).where(AgentLog.timestamp >= cutoff_date)
    ).first() or 0
    
    # Activities by type
    activity_types = session.exec(
        select(AgentLog.logtype, func.count(AgentLog.id))
        .where(AgentLog.timestamp >= cutoff_date)
        .group_by(AgentLog.logtype)
    ).all()
    
    type_counts = {logtype: count for logtype, count in activity_types}
    
    # Recent job activity
    recent_jobs = session.exec(
        select(AgentLog.job_id, func.count(AgentLog.id))
        .where(
            AgentLog.timestamp >= cutoff_date,
            AgentLog.job_id.is_not(None)
        )
        .group_by(AgentLog.job_id)
        .order_by(func.count(AgentLog.id).desc())
        .limit(5)
    ).all()
    
    job_activity = [{"job_id": job_id, "activity_count": count} for job_id, count in recent_jobs]
    
    return {
        "total_activities": total_activities,
        "activity_by_type": type_counts,
        "most_active_jobs": job_activity,
        "period_days": days
    }

@router.get("/pipeline/{job_id}")
def get_pipeline_activity(job_id: int, session: Session = Depends(get_session)):
    """
    Get pipeline-specific activity for a job
    """
    # Get all logs for this job
    query = (
        select(AgentLog)
        .where(AgentLog.job_id == job_id)
        .order_by(AgentLog.timestamp.desc())
    )
    logs = session.exec(query).all()
    
    # Group by pipeline stages
    pipeline_stages = {
        "embedding": [],
        "sourcing": [],
        "scoring": [],
        "outreach": [],
        "search": []
    }
    
    other_activities = []
    
    for log in logs:
        if log.logtype in pipeline_stages:
            pipeline_stages[log.logtype].append({
                "id": log.id,
                "message": log.log,
                "timestamp": log.timestamp,
                "metadata": log.context
            })
        else:
            other_activities.append({
                "id": log.id,
                "type": log.logtype,
                "message": log.log,
                "timestamp": log.timestamp,
                "metadata": log.context
            })
    
    return {
        "job_id": job_id,
        "pipeline_stages": pipeline_stages,
        "other_activities": other_activities
    }

@router.get("/recent-outreach")
def get_recent_outreach(
    session: Session = Depends(get_session),
    limit: int = Query(20, description="Maximum number of outreach events to return")
):
    """
    Get recent outreach activities
    """
    query = (
        select(AgentLog)
        .where(AgentLog.logtype == "outreach")
        .order_by(AgentLog.timestamp.desc())
        .limit(limit)
    )
    
    outreach_logs = session.exec(query).all()
    
    activities = []
    for log in outreach_logs:
        activity = {
            "id": f"outreach_{log.id}",
            "type": "tweet_sent" if "mention" in log.log.lower() else "dm_sent",
            "description": log.log,
            "timestamp": log.timestamp,
            "jobId": str(log.job_id) if log.job_id else None,
            "metadata": log.context or {}
        }
        activities.append(activity)
    
    return activities

def map_log_type_to_activity_type(log_type: str) -> str:
    """Map database log types to frontend activity types"""
    mapping = {
        "sourcing": "agent_pipeline_start",
        "embedding": "agent_step", 
        "scoring": "screened",
        "outreach": "tweet_sent",
        "search": "agent_step",
        "error": "error"
    }
    return mapping.get(log_type, "agent_step")