"""
Grok service for Step 6: Compatibility Scoring

Uses Grok AI to compute candidate-job fit scores
"""
import os
import json
import httpx
from typing import Dict
from dotenv import load_dotenv

load_dotenv()

XAI_API_KEY = os.getenv("XAI_API_KEY")
GROK_API_URL = "https://api.x.ai/v1/chat/completions"

async def compute_compatibility_score(
    job_title: str,
    job_description: str,
    candidate: Dict
) -> Dict:
    """
    Use Grok AI to compute candidate-job compatibility score
    
    Args:
        job_title: Job title
        job_description: Full job description
        candidate: Enriched candidate dict with X signals + LinkedIn data
        
    Returns:
        {
            "compatibility_score": 0-100,
            "strengths": ["strength1", "strength2", "strength3"],
            "weaknesses": ["weakness1", "weakness2"],
            "reasoning": "detailed explanation",
            "skill_match": 0-100,
            "experience_match": 0-100,
            "domain_alignment": 0-100
        }
    """
    
    if not XAI_API_KEY:
        # Return stub
        return {
            "compatibility_score": 75,
            "strengths": ["Technical skills", "Domain experience"],
            "weaknesses": ["Limited team size experience"],
            "reasoning": "Stub response - API key not configured",
            "skill_match": 80,
            "experience_match": 70,
            "domain_alignment": 75
        }
    
    # Extract candidate data
    x_bio = candidate.get('bio', '')
    x_signals = [s.get('text', '')[:100] for s in candidate.get('signals', [])[:3]]
    classification = candidate.get('classification', {})
    linkedin = candidate.get('linkedin_data', {})
    
    # Format LinkedIn experience
    experience_text = ""
    if linkedin.get('experience'):
        for exp in linkedin['experience'][:2]:
            experience_text += f"- {exp.get('title')} @ {exp.get('company')} ({exp.get('duration')})\n"
    
    prompt = f"""
You are a technical recruiter AI. Evaluate how well this candidate matches this job.

JOB:
Title: {job_title}
Description: {job_description[:500]}

CANDIDATE:
X Bio: {x_bio}
Role Classification: {classification.get('role_type')} ({classification.get('confidence')}% confidence)
Recent X Posts:
{chr(10).join(f"- {s}" for s in x_signals)}

LinkedIn Experience:
{experience_text}
Years of Experience: {linkedin.get('years_of_experience', 'Unknown')}
Skills: {', '.join(linkedin.get('skills', [])[:5])}

Evaluate the candidate and return ONLY a JSON object:
{{
    "compatibility_score": 0-100 (overall fit),
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "weaknesses": ["weakness 1", "weakness 2"],
    "reasoning": "2-3 sentence explanation",
    "skill_match": 0-100,
    "experience_match": 0-100,
    "domain_alignment": 0-100
}}

Scoring criteria:
- 90-100: Exceptional match, top 5%
- 75-89: Strong match, interview immediately
- 60-74: Good match, worth considering
- 40-59: Moderate match, take-home assignment
- 0-39: Weak match, likely reject

Be honest and critical. NO markdown, ONLY JSON.
"""

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                GROK_API_URL,
                headers={
                    "Authorization": f"Bearer {XAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "grok-3",
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are a technical recruiter AI. Return only valid JSON, no markdown."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "temperature": 0.4
                },
                timeout=30.0
            )
            
            if response.status_code != 200:
                print(f"⚠️ Grok API error: {response.status_code}")
                return _fallback_score(candidate)
            
            result = response.json()
            content = result.get("choices", [{}])[0].get("message", {}).get("content", "{}")
            
            # Clean JSON
            content = content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()
            
            score_data = json.loads(content)
            
            # Validate
            if "compatibility_score" not in score_data:
                raise ValueError("Invalid JSON from Grok")
            
            return score_data
            
    except Exception as e:
        print(f"⚠️ Error in compatibility scoring: {e}")
        return _fallback_score(candidate)

def _fallback_score(candidate: Dict) -> Dict:
    """Generate a simple fallback score based on confidence"""
    confidence = candidate.get('classification', {}).get('confidence', 50)
    
    return {
        "compatibility_score": min(confidence + 10, 85),
        "strengths": ["Technical background", "Active in community"],
        "weaknesses": ["Limited information available"],
        "reasoning": "Fallback scoring based on role classification confidence",
        "skill_match": confidence,
        "experience_match": 70,
        "domain_alignment": confidence
    }

