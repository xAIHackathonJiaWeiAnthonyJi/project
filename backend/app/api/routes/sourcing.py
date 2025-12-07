from typing import Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlmodel import Session, select
from pydantic import BaseModel
from app.db.database import get_session
from app.models.schemas import Job
from app.services.sourcing_agent import SourcingAgent
from app.utils.logger import AgentLogger
import asyncio

router = APIRouter(prefix="/sourcing", tags=["sourcing"])

class SourcingRequest(BaseModel):
    job_id: int
    send_outreach: bool = False
    dry_run: bool = True
    job_link: Optional[str] = None

class SourcingResponse(BaseModel):
    success: bool
    message: str
    job_id: int
    pipeline_id: Optional[str] = None

# Store running pipelines
running_pipelines: Dict[int, str] = {}

@router.post("/start", response_model=SourcingResponse)
async def start_sourcing_pipeline(
    request: SourcingRequest,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session)
):
    """
    Start the sourcing pipeline for a specific job
    """
    # Check if job exists
    job = session.get(Job, request.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Check if pipeline is already running for this job
    if request.job_id in running_pipelines:
        return SourcingResponse(
            success=False,
            message=f"Sourcing pipeline is already running for job {request.job_id}",
            job_id=request.job_id,
            pipeline_id=running_pipelines[request.job_id]
        )
    
    # Generate pipeline ID
    pipeline_id = f"pipeline_{request.job_id}_{int(asyncio.get_event_loop().time())}"
    running_pipelines[request.job_id] = pipeline_id
    
    # Log pipeline start
    AgentLogger.log_sourcing(
        f"Starting sourcing pipeline for job {request.job_id}: {job.title}",
        job_id=request.job_id,
        pipeline_id=pipeline_id,
        send_outreach=request.send_outreach,
        dry_run=request.dry_run
    )
    
    # Start pipeline in background
    background_tasks.add_task(
        run_sourcing_pipeline_background,
        request.job_id,
        job.title,
        job.description,
        request.job_link,
        request.send_outreach,
        request.dry_run,
        pipeline_id
    )
    
    return SourcingResponse(
        success=True,
        message=f"Sourcing pipeline started for job: {job.title}",
        job_id=request.job_id,
        pipeline_id=pipeline_id
    )

@router.get("/status/{job_id}")
async def get_sourcing_status(job_id: int):
    """
    Get the status of sourcing pipeline for a job
    """
    is_running = job_id in running_pipelines
    pipeline_id = running_pipelines.get(job_id)
    
    return {
        "job_id": job_id,
        "is_running": is_running,
        "pipeline_id": pipeline_id,
        "status": "running" if is_running else "idle"
    }

@router.post("/stop/{job_id}")
async def stop_sourcing_pipeline(job_id: int):
    """
    Stop the sourcing pipeline for a job (if running)
    """
    if job_id in running_pipelines:
        pipeline_id = running_pipelines.pop(job_id)
        
        AgentLogger.log_sourcing(
            f"Sourcing pipeline stopped manually for job {job_id}",
            job_id=job_id,
            pipeline_id=pipeline_id,
            action="manual_stop"
        )
        
        return {
            "success": True,
            "message": f"Sourcing pipeline stopped for job {job_id}",
            "pipeline_id": pipeline_id
        }
    else:
        return {
            "success": False,
            "message": f"No running pipeline found for job {job_id}"
        }

async def run_sourcing_pipeline_background(
    job_id: int,
    job_title: str,
    job_description: str,
    job_link: Optional[str],
    send_outreach: bool,
    dry_run: bool,
    pipeline_id: str
):
    """
    Run the sourcing pipeline in the background
    """
    try:
        # Initialize sourcing agent
        agent = SourcingAgent()
        
        # Run the full pipeline
        result = await agent.run_full_pipeline(
            job_id=job_id,
            job_title=job_title,
            job_description=job_description,
            job_link=job_link,
            send_outreach=send_outreach,
            dry_run=dry_run
        )
        
        # Log completion
        AgentLogger.log_sourcing(
            f"Sourcing pipeline completed successfully for job {job_id}",
            job_id=job_id,
            pipeline_id=pipeline_id,
            candidates_sourced=result.get("candidates_sourced", 0),
            top_candidates_count=len(result.get("top_candidates", [])),
            result_summary=str(result)[:500]  # First 500 chars
        )
        
    except Exception as e:
        # Log error
        AgentLogger.log_error(
            f"Sourcing pipeline failed for job {job_id}: {job_title}",
            error=e,
            job_id=job_id,
            pipeline_id=pipeline_id
        )
        
    finally:
        # Remove from running pipelines
        if job_id in running_pipelines:
            running_pipelines.pop(job_id)

@router.get("/pipelines")
async def list_running_pipelines():
    """
    List all currently running pipelines
    """
    return {
        "running_pipelines": [
            {
                "job_id": job_id,
                "pipeline_id": pipeline_id
            }
            for job_id, pipeline_id in running_pipelines.items()
        ],
        "total_running": len(running_pipelines)
    }