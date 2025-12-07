"""
X (Twitter) Outreach Service

Sends DMs to candidates about job opportunities
"""
import os
import tweepy
from typing import Dict, List
from dotenv import load_dotenv

load_dotenv()

def get_x_client():
    """Initialize X API v2 client for DMs"""
    return tweepy.Client(
        bearer_token=os.getenv("X_BEARER_TOKEN"),
        consumer_key=os.getenv("X_CONSUMER_KEY"),
        consumer_secret=os.getenv("X_CONSUMER_SECRET"),
        access_token=os.getenv("X_ACCESS_TOKEN"),
        access_token_secret=os.getenv("X_ACCESS_TOKEN_SECRET"),
        wait_on_rate_limit=True
    )

def generate_outreach_message(
    candidate_name: str,
    job_title: str,
    job_link: str,
    recommendation: str,
    compatibility_score: int
) -> str:
    """
    Generate personalized outreach message
    
    Args:
        candidate_name: Candidate's name
        job_title: Job title
        job_link: Link to job posting
        recommendation: takehome, interview, or fasttrack
        compatibility_score: 0-100 score
        
    Returns:
        Formatted DM message
    """
    
    if recommendation == "fasttrack":
        message = f"""Hi {candidate_name}! 👋

I came across your profile and I'm impressed by your background. We have an exciting {job_title} role that seems like a great match for your skills.

Based on your experience, we'd love to fast-track you to an interview. Would you be interested in learning more?

Role details: {job_link}

Let me know if you'd like to chat!"""
    
    elif recommendation == "interview":
        message = f"""Hi {candidate_name}! 👋

I noticed your work in the ML/AI space and wanted to reach out about a {job_title} position at our company.

Your background looks like a strong fit, and we'd love to schedule a conversation to learn more about your experience.

Role details: {job_link}

Interested in connecting?"""
    
    else:  # takehome
        message = f"""Hi {candidate_name}! 👋

I came across your profile while looking for talented engineers. We have a {job_title} role that might interest you.

We'd love to see your skills in action - would you be open to a short take-home assignment to showcase your abilities?

Role details: {job_link}

Let me know if you're interested!"""
    
    return message

def send_dm_to_candidate(
    username: str,
    message: str,
    dry_run: bool = True
) -> Dict:
    """
    Send a DM to a candidate on X
    
    Args:
        username: X username (without @)
        message: Message content
        dry_run: If True, don't actually send (for testing)
        
    Returns:
        {
            "success": bool,
            "message_id": str or None,
            "error": str or None
        }
    """
    
    if dry_run:
        print(f"   [DRY RUN] Would send DM to @{username}")
        print(f"   Message preview: {message[:100]}...")
        return {
            "success": True,
            "message_id": "dry_run_" + username,
            "error": None,
            "dry_run": True
        }
    
    try:
        client = get_x_client()
        
        # Get user ID from username
        user = client.get_user(username=username)
        if not user.data:
            return {
                "success": False,
                "message_id": None,
                "error": f"User @{username} not found"
            }
        
        user_id = user.data.id
        
        # Send DM
        # Note: This requires DM permissions in your X API app
        response = client.create_direct_message(
            participant_id=user_id,
            text=message
        )
        
        return {
            "success": True,
            "message_id": str(response.data['dm_event_id']),
            "error": None
        }
        
    except Exception as e:
        return {
            "success": False,
            "message_id": None,
            "error": str(e)
        }

def send_outreach_batch(
    candidates: List[Dict],
    job_title: str,
    job_link: str,
    dry_run: bool = True
) -> Dict:
    """
    Send outreach messages to a batch of candidates
    
    Args:
        candidates: List of candidate dicts with routing info
        job_title: Job title
        job_link: Link to job posting
        dry_run: If True, don't actually send
        
    Returns:
        {
            "sent": int,
            "failed": int,
            "results": [...]
        }
    """
    
    results = []
    sent = 0
    failed = 0
    
    for candidate in candidates:
        # Skip rejected candidates
        if candidate.get('recommendation') == 'reject':
            continue
        
        username = candidate['username']
        name = candidate.get('name', username)
        recommendation = candidate.get('recommendation', 'interview')
        score = candidate.get('compatibility', {}).get('compatibility_score', 0)
        
        # Generate message
        message = generate_outreach_message(
            candidate_name=name,
            job_title=job_title,
            job_link=job_link,
            recommendation=recommendation,
            compatibility_score=score
        )
        
        # Send DM
        result = send_dm_to_candidate(username, message, dry_run=dry_run)
        result['username'] = username
        result['recommendation'] = recommendation
        
        if result['success']:
            sent += 1
        else:
            failed += 1
        
        results.append(result)
    
    return {
        "sent": sent,
        "failed": failed,
        "results": results
    }

