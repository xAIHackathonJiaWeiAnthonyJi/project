from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select
from app.db.database import get_session
from app.models.schemas import AgentLog

router = APIRouter(prefix="/logs", tags=["logs"])

@router.get("/", response_model=List[AgentLog])
def get_logs(
    session: Session = Depends(get_session),
    logtype: Optional[str] = Query(None, description="Filter by log type"),
    job_id: Optional[int] = Query(None, description="Filter by job ID"),
    candidate_id: Optional[int] = Query(None, description="Filter by candidate ID"),
    limit: int = Query(100, description="Maximum number of logs to return", le=1000),
    offset: int = Query(0, description="Number of logs to skip")
):
    """
    Retrieve agent logs with optional filtering
    """
    query = select(AgentLog)
    
    # Apply filters
    if logtype:
        query = query.where(AgentLog.logtype == logtype)
    if job_id:
        query = query.where(AgentLog.job_id == job_id)
    if candidate_id:
        query = query.where(AgentLog.candidate_id == candidate_id)
    
    # Order by timestamp (newest first) and apply pagination
    query = query.order_by(AgentLog.timestamp.desc()).offset(offset).limit(limit)
    
    logs = session.exec(query).all()
    return logs

@router.get("/types")
def get_log_types(session: Session = Depends(get_session)):
    """
    Get all unique log types in the system
    """
    query = select(AgentLog.logtype).distinct()
    log_types = session.exec(query).all()
    return {"log_types": log_types}

@router.get("/recent", response_model=List[AgentLog])
def get_recent_logs(
    session: Session = Depends(get_session),
    limit: int = Query(50, description="Number of recent logs to return", le=200)
):
    """
    Get the most recent agent logs
    """
    query = select(AgentLog).order_by(AgentLog.timestamp.desc()).limit(limit)
    logs = session.exec(query).all()
    return logs