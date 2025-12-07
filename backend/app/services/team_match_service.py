"""
Team Match Service - AI-powered team placement using embeddings + LLM
"""
import json
import numpy as np
from typing import List, Dict, Optional
import os
from openai import OpenAI
import httpx
from app.models.schemas import Candidate, Team, TeamMatch, Job
from app.db.database import engine
from app.utils.logger import AgentLogger
from app.services.team_manager_notification import (
    send_candidate_profile_to_manager,
    passes_threshold,
    MATCH_THRESHOLD
)
from sqlmodel import Session, select
from datetime import datetime

# OpenAI client for embeddings
openai_client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

# Grok API configuration
GROK_API_KEY = os.getenv("XAI_API_KEY")
GROK_BASE_URL = "https://api.x.ai/v1"


def embed(text: str) -> List[float]:
    """Deterministic embedding function using OpenAI embeddings."""
    resp = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=text,
    )
    return resp.data[0].embedding


def cosine_similarity(a: List[float], b: List[float]) -> float:
    """Calculate cosine similarity between two vectors."""
    a = np.array(a)
    b = np.array(b)
    if np.linalg.norm(a) == 0 or np.linalg.norm(b) == 0:
        return 0.0
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


def compute_similarity_scores(candidate: Dict, teams: List[Dict]):
    """Compute deterministic cosine similarity between candidate and each team."""
    # Embed candidate once
    candidate_text = (
        f"Skills: {', '.join(candidate.get('skills', []))}\n"
        f"Experience: {', '.join(candidate.get('experience', []))}\n"
        f"Interests: {', '.join(candidate.get('interests', []))}"
    )
    cand_vec = embed(candidate_text)
    
    results = []
    for team in teams:
        team_text = (
            f"{team['name']} | "
            f"Tech: {', '.join(team.get('tech_stack', []))}\n"
            f"Needs: {', '.join(team.get('current_needs', []))}\n"
            f"Culture: {team.get('team_culture', '')}"
        )
        team_vec = embed(team_text)
        sim = cosine_similarity(cand_vec, team_vec)
        
        results.append({
            "team": team["name"],
            "team_id": team.get("id"),
            "similarity": sim,
            "team_profile": team_text
        })
    
    return results


SYSTEM_PROMPT = """
You are a deterministic team-matching engine for engineering placement.

Your task:
- Analyze candidate skills/experience vs team tech stack/needs
- Refine numeric similarity scores into final ranked scores
- Provide clear reasoning for each match
- Identify strengths and concerns

Scoring formula:
final_score = (0.7 * similarity) + (0.3 * reasoning_adjustment)

Where:
- similarity: numeric cosine similarity (0–1)
- reasoning_adjustment: 0–1 (based on factors like seniority match, tech overlap, culture fit)

Return ONLY valid JSON with this structure:
{
  "matches": [
    {
      "team": "Team Name",
      "team_id": 1,
      "final_score": 0.85,
      "reasoning_adjustment": 0.9,
      "match_reasoning": "Strong technical alignment...",
      "strengths": ["5+ years React", "Led teams before", "Excited about scaling challenges"],
      "concerns": ["No GraphQL experience", "Prefers remote work"],
      "recommendation": "strong_match"
    }
  ]
}

Recommendations:
- strong_match: 0.80+
- good_match: 0.65-0.79
- possible_match: 0.50-0.64
- not_recommended: <0.50
"""


async def refine_scores(sim_results: List[Dict], candidate: Dict):
    """Uses Grok to refine scores deterministically with JSON output."""
    user_payload = {
        "candidate": candidate,
        "teams": [
            {
                "team": r["team"],
                "team_id": r.get("team_id"),
                "similarity": r["similarity"],
                "team_profile": r["team_profile"]
            }
            for r in sim_results
        ]
    }
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{GROK_BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {GROK_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "grok-beta",
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": json.dumps(user_payload)}
                ],
                "temperature": 0.3,
                "max_tokens": 2000
            }
        )
        
        response.raise_for_status()
        data = response.json()
        content = data["choices"][0]["message"]["content"]
        
        # Parse JSON from response
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            # Try to extract JSON from markdown code blocks
            import re
            json_match = re.search(r'```json\n(.*?)\n```', content, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(1))
            raise ValueError("Could not parse JSON from Grok response")


async def match_teams(candidate: Dict, teams: List[Dict]) -> Dict:
    """Main function to match candidate with teams and return ranked results."""
    sim_scores = compute_similarity_scores(candidate, teams)
    results = await refine_scores(sim_scores, candidate)
    return results


class TeamMatchService:
    """Service for team matching operations"""
    
    async def match_candidate_to_teams(
        self,
        candidate_id: int,
        job_id: int
    ) -> List[TeamMatch]:
        """
        Match a candidate to available teams
        
        Args:
            candidate_id: ID of the candidate
            job_id: ID of the job they're being hired for
            
        Returns:
            List of TeamMatch records with scores and reasoning
        """
        with Session(engine) as session:
            # Get candidate data
            candidate = session.get(Candidate, candidate_id)
            if not candidate:
                raise ValueError(f"Candidate {candidate_id} not found")
            
            # Get active teams
            teams = session.exec(select(Team).where(Team.is_active == True)).all()
            if not teams:
                raise ValueError("No active teams available")
            
            # Prepare candidate profile
            linkedin_data = candidate.linkedin_data or {}
            candidate_profile = {
                "name": candidate.name,
                "skills": linkedin_data.get("skills", []),
                "experience": [
                    f"{exp.get('title', '')} at {exp.get('company', '')} ({exp.get('duration', '')})"
                    for exp in linkedin_data.get("experience", [])
                ],
                "interests": linkedin_data.get("interests", []),
                "bio": candidate.x_bio or ""
            }
            
            # Prepare team profiles
            team_profiles = [
                {
                    "id": team.id,
                    "name": team.name,
                    "tech_stack": team.tech_stack,
                    "current_needs": team.current_needs,
                    "team_culture": team.team_culture or "",
                    "description": team.description or ""
                }
                for team in teams
            ]
            
            # Run matching algorithm
            AgentLogger.log_sourcing(
                f"Starting team matching for candidate {candidate.name}",
                job_id=job_id,
                candidate_id=candidate_id,
                num_teams=len(teams)
            )
            
            match_results = await match_teams(candidate_profile, team_profiles)
            
            # Save matches to database and send notifications for matches above threshold
            team_matches = []
            notifications_sent = 0
            
            for match in match_results.get("matches", []):
                # Calculate final score
                similarity = match.get("similarity", 0) or next(
                    (r["similarity"] for r in compute_similarity_scores(candidate_profile, team_profiles)
                     if r["team_id"] == match.get("team_id")), 0
                )
                reasoning_adj = match.get("reasoning_adjustment", 0.5)
                final_score = (0.7 * similarity) + (0.3 * reasoning_adj)
                
                # Check if passes threshold (default 0.65 = good match or better)
                passes_match_threshold = passes_threshold(final_score)
                
                # Get team for notification
                team = session.get(Team, match.get("team_id"))
                manager_email = None
                
                # Send notification to team manager if passes threshold
                if passes_match_threshold and team:
                    try:
                        notification_result = await send_candidate_profile_to_manager(
                            candidate={
                                "id": candidate_id,
                                "name": candidate.name,
                                "email": candidate.email,
                                "x_handle": candidate.x_handle,
                                "skills": candidate_profile.get("skills", []),
                                "experience": linkedin_data.get("experience", [])
                            },
                            team={
                                "id": team.id,
                                "name": team.name,
                                "manager_name": team.manager_name,
                                "tech_stack": team.tech_stack,
                                "description": team.description
                            },
                            match_data={
                                "final_score": final_score,
                                "similarity_score": similarity,
                                "reasoning_adjustment": reasoning_adj,
                                "recommendation": match.get("recommendation", "possible_match"),
                                "match_reasoning": match.get("match_reasoning", ""),
                                "strengths": match.get("strengths", []),
                                "concerns": match.get("concerns", [])
                            }
                        )
                        
                        if notification_result.get("success"):
                            manager_email = notification_result.get("manager_email")
                            notifications_sent += 1
                            
                            AgentLogger.log_sourcing(
                                f"📧 Profile sent to {team.manager_name} for {team.name}",
                                job_id=job_id,
                                candidate_id=candidate_id,
                                team_id=team.id,
                                match_score=int(final_score * 100)
                            )
                    except Exception as e:
                        AgentLogger.log_sourcing(
                            f"Failed to notify manager: {str(e)}",
                            job_id=job_id,
                            candidate_id=candidate_id,
                            team_id=team.id
                        )
                
                team_match = TeamMatch(
                    candidate_id=candidate_id,
                    job_id=job_id,
                    team_id=match.get("team_id"),
                    similarity_score=similarity,
                    reasoning_adjustment=reasoning_adj,
                    final_score=final_score,
                    match_reasoning=match.get("match_reasoning"),
                    strengths=match.get("strengths", []),
                    concerns=match.get("concerns", []),
                    recommendation=match.get("recommendation", "possible_match"),
                    passes_threshold=passes_match_threshold,
                    profile_sent_to_manager=passes_match_threshold and manager_email is not None,
                    sent_to_manager_at=datetime.utcnow() if passes_match_threshold and manager_email else None,
                    manager_email=manager_email,
                    manager_notified=passes_match_threshold and manager_email is not None,
                    status="pending"
                )
                
                session.add(team_match)
                team_matches.append(team_match)
            
            session.commit()
            
            # Refresh to get IDs
            for tm in team_matches:
                session.refresh(tm)
            
            # Count matches above threshold
            above_threshold = sum(1 for tm in team_matches if tm.passes_threshold)
            
            AgentLogger.log_sourcing(
                f"Team matching complete: {len(team_matches)} teams ranked, "
                f"{above_threshold} above threshold (>={int(MATCH_THRESHOLD*100)}%), "
                f"{notifications_sent} managers notified",
                job_id=job_id,
                candidate_id=candidate_id,
                top_match=team_matches[0].team_id if team_matches else None,
                top_score=team_matches[0].final_score if team_matches else None
            )
            
            return team_matches
    
    async def approve_match(
        self,
        match_id: int,
        reviewer_name: str,
        reviewer_notes: Optional[str] = None
    ):
        """Approve a team match"""
        with Session(engine) as session:
            match = session.get(TeamMatch, match_id)
            if not match:
                raise ValueError("Match not found")
            
            match.human_reviewed = True
            match.human_decision = "approved"
            match.reviewer_notes = reviewer_notes
            match.reviewed_by = reviewer_name
            match.reviewed_at = datetime.utcnow()
            match.status = "offered"
            match.offered_at = datetime.utcnow()
            match.updated_at = datetime.utcnow()
            
            session.add(match)
            session.commit()
            session.refresh(match)
            
            AgentLogger.log_sourcing(
                f"Team match approved by {reviewer_name}",
                match_id=match_id,
                candidate_id=match.candidate_id,
                team_id=match.team_id
            )
            
            return match


# Singleton instance
team_match_service = TeamMatchService()

