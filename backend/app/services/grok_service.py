import os
from typing import Dict
import httpx
from dotenv import load_dotenv

load_dotenv()

GROK_API_KEY = os.getenv("GROK_API_KEY")
GROK_API_URL = "https://api.x.ai/v1/chat/completions"  # Update with actual Grok endpoint

async def parse_job_description(description: str) -> Dict:
    """
    Use Grok to parse a job description and extract structured requirements
    
    Returns:
    {
        "required_skills": ["Python", "FastAPI", "SQL"],
        "experience_years": 3,
        "education": "Bachelor's in CS or related",
        "responsibilities": ["Build APIs", "Design systems"]
    }
    """
    
    # TODO: Replace with actual Grok API call
    # For now, return a stub
    
    if not GROK_API_KEY:
        # Stub response for development
        return {
            "required_skills": ["Python", "FastAPI", "SQLite"],
            "experience_years": 3,
            "education": "Bachelor's degree",
            "responsibilities": ["Build backend systems", "Design APIs"]
        }
    
    # Actual Grok API call (when key is available)
    prompt = f"""
    Parse the following job description and extract structured information.
    
    Job Description:
    {description}
    
    Return JSON with:
    - required_skills (list of strings)
    - experience_years (number)
    - education (string)
    - responsibilities (list of strings)
    """
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            GROK_API_URL,
            headers={
                "Authorization": f"Bearer {GROK_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "grok-beta",  # Update with actual model name
                "messages": [
                    {"role": "system", "content": "You are a job description parser. Return only valid JSON."},
                    {"role": "user", "content": prompt}
                ]
            }
        )
        
        if response.status_code != 200:
            # Fallback to stub on error
            return {
                "required_skills": ["Python", "FastAPI"],
                "experience_years": 3,
                "education": "Bachelor's degree",
                "responsibilities": ["Build systems"]
            }
        
        # Parse Grok response
        result = response.json()
        # Extract structured data from Grok's response
        # This will depend on Grok's actual response format
        return result.get("choices", [{}])[0].get("message", {}).get("content", {})

