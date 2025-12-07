"""
Grok service for Step 4: Role Verification

Uses Grok AI to classify X users as developers and match them to role types
"""
import os
import json
import httpx
from typing import Dict, Optional
from dotenv import load_dotenv

load_dotenv()

XAI_API_KEY = os.getenv("XAI_API_KEY")
GROK_API_URL = "https://api.x.ai/v1/chat/completions"

async def verify_developer_role(
    username: str,
    bio: str,
    recent_posts: list,
    job_title: str
) -> Optional[Dict]:
    """
    Use Grok AI to verify if an X user is a developer and classify their role
    
    Args:
        username: X username
        bio: User bio/description
        recent_posts: List of recent tweet texts
        job_title: The job we're hiring for (for context)
        
    Returns:
        {
            "is_developer": true/false,
            "role_type": "ml_engineer" | "backend" | "frontend" | "infra" | "systems" | "fullstack",
            "confidence": 0-100,
            "reasoning": "explanation",
            "signals": ["signal1", "signal2"]
        }
        or None if not a developer
    """
    
    if not XAI_API_KEY:
        # Return stub for development
        return {
            "is_developer": True,
            "role_type": "ml_engineer",
            "confidence": 75,
            "reasoning": "Stub response - API key not configured",
            "signals": ["Posts about ML", "Technical content"]
        }
    
    # Format recent posts
    posts_text = "\n".join([f"- {post[:100]}" for post in recent_posts[:5]])
    
    prompt = f"""
You are a technical recruiter AI. Analyze this X (Twitter) user to determine:
1. Are they a developer/engineer?
2. What type of role do they match?

Job We're Hiring For: {job_title}

X User Profile:
- Username: @{username}
- Bio: {bio}

Recent Posts:
{posts_text}

Analyze their technical background and classify them. Return ONLY a JSON object:
{{
    "is_developer": true or false,
    "role_type": "ml_engineer" | "backend" | "frontend" | "infra" | "systems" | "fullstack" | "unknown",
    "confidence": 0-100 (confidence score),
    "reasoning": "brief explanation",
    "signals": ["key signal 1", "key signal 2", "key signal 3"]
}}

Role definitions:
- ml_engineer: ML/AI, data science, LLMs, PyTorch, TensorFlow
- backend: APIs, databases, servers, microservices, Python/Go/Java
- frontend: React, JavaScript, UI/UX, web development
- infra: DevOps, cloud, Kubernetes, infrastructure
- systems: Low-level, C++, performance, OS, distributed systems
- fullstack: Both frontend and backend

Rules:
- Only mark is_developer=true if they clearly write code
- Match role_type to the job we're hiring for when possible
- Be strict - not everyone is a developer
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
                    "temperature": 0.3  # Lower temperature for more consistent classification
                },
                timeout=30.0
            )
            
            if response.status_code != 200:
                print(f"⚠️ Grok API error: {response.status_code} - {response.text}")
                return None
            
            result = response.json()
            content = result.get("choices", [{}])[0].get("message", {}).get("content", "{}")
            
            # Clean JSON from markdown
            content = content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()
            
            classification = json.loads(content)
            
            # Validate structure
            if "is_developer" not in classification:
                raise ValueError("Invalid JSON structure from Grok")
            
            # Return None if not a developer
            if not classification.get("is_developer"):
                return None
            
            return classification
            
    except Exception as e:
        print(f"⚠️ Error in role verification for @{username}: {e}")
        return None

async def verify_developers_batch(x_users: list, job_title: str) -> list:
    """
    Verify a batch of X users
    
    Args:
        x_users: List of user dicts from Step 3
        job_title: Job title for context
        
    Returns:
        List of verified developer profiles
    """
    verified = []
    
    for user in x_users:
        print(f"🔍 Verifying @{user['username']}...")
        
        # Extract recent post texts
        recent_posts = [signal['text'] for signal in user.get('signals', [])]
        
        # Verify with Grok
        classification = await verify_developer_role(
            username=user['username'],
            bio=user.get('bio', ''),
            recent_posts=recent_posts,
            job_title=job_title
        )
        
        if classification:
            # Add classification to user profile
            user['classification'] = classification
            verified.append(user)
            print(f"  ✅ Developer: {classification['role_type']} (confidence: {classification['confidence']}%)")
        else:
            print(f"  ❌ Not a developer or low confidence")
    
    return verified

