"""
Team Match API Routes
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel
from app.db.database import get_session
from app.models.schemas import Team, TeamMatch, Candidate
from app.services.team_match_service import team_match_service

router = APIRouter(prefix="/teams", tags=["teams"])


# Request/Response Models
class CreateTeamRequest(BaseModel):
    name: str
    description: Optional[str] = None
    tech_stack: List[str]
    team_size: int
    manager_name: Optional[str] = None
    current_needs: List[str]
    team_culture: Optional[str] = None
    projects: Optional[List[str]] = None
    location: Optional[str] = None


class MatchCandidateRequest(BaseModel):
    candidate_id: int
    job_id: int


class ApproveMatchRequest(BaseModel):
    reviewer_name: str
    reviewer_notes: Optional[str] = None


# Team CRUD
@router.post("/")
async def create_team(
    request: CreateTeamRequest,
    session: Session = Depends(get_session)
):
    """Create a new team"""
    team = Team(
        name=request.name,
        description=request.description,
        tech_stack=request.tech_stack,
        team_size=request.team_size,
        manager_name=request.manager_name,
        current_needs=request.current_needs,
        team_culture=request.team_culture,
        projects=request.projects or [],
        location=request.location,
        is_active=True
    )
    
    session.add(team)
    session.commit()
    session.refresh(team)
    
    return team


@router.get("/")
async def list_teams(
    active_only: bool = True,
    session: Session = Depends(get_session)
):
    """List all teams"""
    query = select(Team)
    if active_only:
        query = query.where(Team.is_active == True)
    
    teams = session.exec(query).all()
    return teams


@router.get("/{team_id}")
async def get_team(
    team_id: int,
    session: Session = Depends(get_session)
):
    """Get team details"""
    team = session.get(Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    return team


@router.put("/{team_id}")
async def update_team(
    team_id: int,
    request: CreateTeamRequest,
    session: Session = Depends(get_session)
):
    """Update team details"""
    team = session.get(Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    team.name = request.name
    team.description = request.description
    team.tech_stack = request.tech_stack
    team.team_size = request.team_size
    team.manager_name = request.manager_name
    team.current_needs = request.current_needs
    team.team_culture = request.team_culture
    team.projects = request.projects or []
    team.location = request.location
    
    session.add(team)
    session.commit()
    session.refresh(team)
    
    return team


# Team Matching
@router.post("/match")
async def match_candidate_to_teams(
    request: MatchCandidateRequest,
    session: Session = Depends(get_session)
):
    """
    Match a candidate to teams using AI.
    Returns stack-ranked teams with scores and reasoning.
    """
    try:
        matches = await team_match_service.match_candidate_to_teams(
            candidate_id=request.candidate_id,
            job_id=request.job_id
        )
        
        # Enrich with team data
        result = []
        for match in matches:
            team = session.get(Team, match.team_id)
            result.append({
                "match_id": match.id,
                "team": {
                    "id": team.id,
                    "name": team.name,
                    "description": team.description,
                    "tech_stack": team.tech_stack,
                    "team_size": team.team_size,
                    "manager_name": team.manager_name,
                    "location": team.location
                } if team else None,
                "scores": {
                    "final_score": match.final_score,
                    "similarity_score": match.similarity_score,
                    "reasoning_adjustment": match.reasoning_adjustment
                },
                "match_reasoning": match.match_reasoning,
                "strengths": match.strengths,
                "concerns": match.concerns,
                "recommendation": match.recommendation,
                "status": match.status,
                "passes_threshold": match.passes_threshold,
                "profile_sent_to_manager": match.profile_sent_to_manager,
                "sent_to_manager_at": match.sent_to_manager_at.isoformat() if match.sent_to_manager_at else None,
                "manager_email": match.manager_email
            })
        
        return {
            "success": True,
            "matches": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/matches/{candidate_id}")
async def get_candidate_matches(
    candidate_id: int,
    job_id: Optional[int] = None,
    session: Session = Depends(get_session)
):
    """Get all team matches for a candidate"""
    query = select(TeamMatch).where(TeamMatch.candidate_id == candidate_id)
    if job_id:
        query = query.where(TeamMatch.job_id == job_id)
    
    query = query.order_by(TeamMatch.final_score.desc())
    matches = session.exec(query).all()
    
    # Enrich with team and candidate data
    result = []
    for match in matches:
        team = session.get(Team, match.team_id)
        candidate = session.get(Candidate, match.candidate_id)
        
        result.append({
            "id": match.id,
            "candidate": {
                "id": candidate.id,
                "name": candidate.name,
                "email": candidate.email
            } if candidate else None,
            "team": {
                "id": team.id,
                "name": team.name,
                "description": team.description,
                "tech_stack": team.tech_stack,
                "manager_name": team.manager_name,
                "location": team.location
            } if team else None,
            "scores": {
                "final_score": round(match.final_score, 3),
                "similarity_score": round(match.similarity_score, 3),
                "reasoning_adjustment": round(match.reasoning_adjustment, 3)
            },
            "match_reasoning": match.match_reasoning,
            "strengths": match.strengths,
            "concerns": match.concerns,
            "recommendation": match.recommendation,
            "human_reviewed": match.human_reviewed,
            "human_decision": match.human_decision,
            "reviewer_notes": match.reviewer_notes,
            "reviewed_by": match.reviewed_by,
            "status": match.status,
            "passes_threshold": match.passes_threshold,
            "profile_sent_to_manager": match.profile_sent_to_manager,
            "sent_to_manager_at": match.sent_to_manager_at.isoformat() if match.sent_to_manager_at else None,
            "manager_email": match.manager_email,
            "created_at": match.created_at
        })
    
    return result


@router.post("/matches/{match_id}/approve")
async def approve_match(
    match_id: int,
    request: ApproveMatchRequest
):
    """Approve a team match"""
    try:
        match = await team_match_service.approve_match(
            match_id=match_id,
            reviewer_name=request.reviewer_name,
            reviewer_notes=request.reviewer_notes
        )
        return {
            "success": True,
            "match_id": match.id,
            "status": match.status
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/matches/{match_id}")
async def get_match(
    match_id: int,
    session: Session = Depends(get_session)
):
    """Get detailed match information"""
    match = session.get(TeamMatch, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    team = session.get(Team, match.team_id)
    candidate = session.get(Candidate, match.candidate_id)
    
    return {
        "id": match.id,
        "candidate": {
            "id": candidate.id,
            "name": candidate.name,
            "email": candidate.email,
            "x_handle": candidate.x_handle
        } if candidate else None,
        "team": {
            "id": team.id,
            "name": team.name,
            "description": team.description,
            "tech_stack": team.tech_stack,
            "team_size": team.team_size,
            "manager_name": team.manager_name,
            "current_needs": team.current_needs,
            "team_culture": team.team_culture,
            "projects": team.projects,
            "location": team.location
        } if team else None,
        "scores": {
            "final_score": round(match.final_score, 3),
            "similarity_score": round(match.similarity_score, 3),
            "reasoning_adjustment": round(match.reasoning_adjustment, 3)
        },
        "match_reasoning": match.match_reasoning,
        "strengths": match.strengths,
        "concerns": match.concerns,
        "recommendation": match.recommendation,
        "human_reviewed": match.human_reviewed,
        "human_decision": match.human_decision,
        "reviewer_notes": match.reviewer_notes,
        "reviewed_by": match.reviewed_by,
        "reviewed_at": match.reviewed_at,
        "status": match.status,
        "offered_at": match.offered_at,
        "responded_at": match.responded_at,
        "created_at": match.created_at,
        "updated_at": match.updated_at
    }

