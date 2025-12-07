import os
from typing import Dict, List
import httpx
from dotenv import load_dotenv
from .x_service import x_service

load_dotenv()

GROK_API_KEY = os.getenv("GROK_API_KEY")
GROK_API_URL = "https://api.x.ai/v1/chat/completions"

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
        content = result.get("choices", [{}])[0].get("message", {}).get("content", "{}")
        
        try:
            import json
            return json.loads(content)
        except json.JSONDecodeError:
            # Fallback if response isn't valid JSON
            return {
                "required_skills": ["Python", "FastAPI"],
                "experience_years": 3,
                "education": "Bachelor's degree",
                "responsibilities": ["Build systems"]
            }


async def find_candidates_on_x(job_requirements: Dict) -> List[Dict]:
    """
    Use X API to find potential candidates based on job requirements
    
    Args:
        job_requirements: Dictionary with required_skills, experience_years, etc.
        
    Returns:
        List of potential candidates found on X
    """
    if not x_service.is_configured():
        return []
    
    required_skills = job_requirements.get("required_skills", [])
    location = job_requirements.get("location")
    
    # Find candidates using X service
    candidates = await x_service.find_tech_talent(required_skills, location)
    
    # Enhance candidate data with relevance scoring
    enhanced_candidates = []
    for candidate in candidates:
        # Calculate relevance score based on matched skills and social metrics
        skill_score = len(candidate.get("matched_skills", [])) * 10
        social_score = min(candidate.get("followers_count", 0) / 1000, 10)  # Cap at 10
        
        relevance_score = skill_score + social_score
        
        enhanced_candidate = {
            **candidate,
            "relevance_score": relevance_score,
            "platform": "X",
            "profile_url": f"https://x.com/{candidate['username']}"
        }
        enhanced_candidates.append(enhanced_candidate)
    
    # Sort by relevance score
    enhanced_candidates.sort(key=lambda x: x["relevance_score"], reverse=True)
    
    return enhanced_candidates[:10]  # Return top 10 candidates


async def analyze_candidate_activity(username: str) -> Dict:
    """
    Analyze a candidate's recent X activity to assess their technical engagement
    
    Args:
        username: X username (without @)
        
    Returns:
        Dictionary with activity analysis
    """
    if not x_service.is_configured():
        return {"error": "X API not configured"}
    
    tweets = await x_service.get_user_tweets(username, max_results=20)
    
    if not tweets:
        return {"error": "No tweets found or user not accessible"}
    
    # Analyze tweets for technical content
    tech_keywords = [
        "code", "programming", "development", "software", "api", "database",
        "python", "javascript", "react", "node", "sql", "git", "github",
        "opensource", "tech", "coding", "developer", "engineer"
    ]
    
    tech_tweet_count = 0
    total_engagement = 0
    recent_topics = []
    
    for tweet in tweets:
        text = tweet["text"].lower()
        
        # Check for technical content
        if any(keyword in text for keyword in tech_keywords):
            tech_tweet_count += 1
            
            # Extract topics from context annotations
            if tweet.get("context_annotations"):
                for annotation in tweet["context_annotations"]:
                    if annotation.get("entity", {}).get("name"):
                        recent_topics.append(annotation["entity"]["name"])
        
        # Calculate engagement
        metrics = tweet.get("public_metrics", {})
        engagement = (
            metrics.get("like_count", 0) +
            metrics.get("retweet_count", 0) +
            metrics.get("reply_count", 0)
        )
        total_engagement += engagement
    
    # Remove duplicate topics and get top 5
    unique_topics = list(set(recent_topics))[:5]
    
    analysis = {
        "total_tweets_analyzed": len(tweets),
        "tech_related_tweets": tech_tweet_count,
        "tech_engagement_ratio": tech_tweet_count / len(tweets) if tweets else 0,
        "average_engagement": total_engagement / len(tweets) if tweets else 0,
        "recent_topics": unique_topics,
        "activity_score": (tech_tweet_count * 5) + (total_engagement / 10)
    }
    
    return analysis

