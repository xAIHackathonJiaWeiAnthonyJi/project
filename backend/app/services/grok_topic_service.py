"""
Grok service for Step 2: Topic Discovery

Uses Grok to convert job embeddings into relevant search topics for X
"""
import os
import json
import httpx
from typing import Dict, List
from dotenv import load_dotenv

load_dotenv()

XAI_API_KEY = os.getenv("XAI_API_KEY")
GROK_API_URL = "https://api.x.ai/v1/chat/completions"

async def discover_topics_from_job(job_title: str, job_description: str) -> Dict[str, List[str]]:
    """
    Use Grok to generate relevant topics and search queries from a job description
    
    Args:
        job_title: Job title
        job_description: Full job description text
        
    Returns:
        {
            "topics": ["topic1", "topic2", ...],
            "search_queries": ["query1", "query2", ...]
        }
    """
    
    if not XAI_API_KEY:
        # Return stub for development without API key
        return {
            "topics": ["machine learning", "python programming", "backend engineering"],
            "search_queries": [
                "LLM inference optimization",
                "PyTorch performance tuning",
                "distributed training setup"
            ]
        }
    
    prompt = f"""
You are a technical recruiter AI. Given a job description, extract:
1. Core technical topics that candidates would discuss on X (Twitter)
2. Specific search queries to find active developers in this domain

Job Title: {job_title}

Job Description:
{job_description}

Return ONLY a JSON object with this exact structure:
{{
    "topics": ["topic1", "topic2", "topic3", "topic4", "topic5"],
    "search_queries": ["query1", "query2", "query3", "query4", "query5"]
}}

Rules:
- Topics should be 2-4 words, technical and specific
- Search queries should be phrases developers actually post about
- Focus on technical keywords, not soft skills
- Return exactly 5 topics and 5 search queries
- NO markdown, NO explanation, ONLY the JSON object
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
                    "temperature": 0.7
                },
                timeout=30.0
            )
            
            if response.status_code != 200:
                print(f"⚠️ Grok API error: {response.status_code} - {response.text}")
                # Fallback to stub
                return {
                    "topics": ["machine learning", "python", "backend"],
                    "search_queries": ["ML engineering", "Python development", "API design"]
                }
            
            result = response.json()
            content = result.get("choices", [{}])[0].get("message", {}).get("content", "{}")
            
            # Parse JSON from content
            # Grok might wrap it in markdown code blocks, so clean it
            content = content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()
            
            topics_data = json.loads(content)
            
            # Validate structure
            if "topics" not in topics_data or "search_queries" not in topics_data:
                raise ValueError("Invalid JSON structure from Grok")
            
            return topics_data
            
    except Exception as e:
        print(f"⚠️ Error in topic discovery: {e}")
        # Fallback to stub
        return {
            "topics": ["machine learning", "python", "backend engineering"],
            "search_queries": ["ML model optimization", "Python API development", "distributed systems"]
        }

