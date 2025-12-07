"""
X (Twitter) Mention Service

Sends public tweet mentions to candidates instead of DMs
"""
import os
import tweepy
from typing import Dict, List
from dotenv import load_dotenv

load_dotenv()

def get_x_client():
    """Initialize X API v2 client"""
    return tweepy.Client(
        bearer_token=os.getenv("X_BEARER_TOKEN"),
        consumer_key=os.getenv("X_CONSUMER_KEY"),
        consumer_secret=os.getenv("X_CONSUMER_SECRET"),
        access_token=os.getenv("X_ACCESS_TOKEN"),
        access_token_secret=os.getenv("X_ACCESS_TOKEN_SECRET"),
        wait_on_rate_limit=True
    )

def generate_mention_message(
    username: str,
    candidate_name: str,
    job_title: str,
    job_link: str,
    recommendation: str
) -> str:
    """
    Generate tweet mention message
    
    Args:
        username: X username (without @)
        candidate_name: Candidate's name
        job_title: Job title
        job_link: Link to job posting
        recommendation: takehome, interview, or fasttrack
        
    Returns:
        Tweet text (280 char limit)
    """
    
    if recommendation == "fasttrack":
        message = f"@{username} Hi {candidate_name}! We're hiring a {job_title} and your background looks like an exceptional match. We'd love to fast-track you to an interview. Interested? DM us! {job_link}"
    
    elif recommendation == "interview":
        message = f"@{username} Hi {candidate_name}! We have a {job_title} role that aligns perfectly with your skills. Would love to chat - DM us if interested! {job_link}"
    
    else:  # takehome
        message = f"@{username} Hi {candidate_name}! We're hiring a {job_title}. Your profile caught our attention - would you be open to a take-home assignment? DM us! {job_link}"
    
    # Ensure under 280 chars
    if len(message) > 280:
        # Truncate job title if needed
        short_title = job_title[:30] + "..." if len(job_title) > 30 else job_title
        message = f"@{username} Hi! We're hiring a {short_title} - your profile is a great fit! Interested? DM us: {job_link}"
    
    return message

def send_mention_to_candidate(
    username: str,
    message: str,
    dry_run: bool = True
) -> Dict:
    """
    Send a public tweet mentioning a candidate
    
    Args:
        username: X username (without @)
        message: Tweet content
        dry_run: If True, don't actually send
        
    Returns:
        {
            "success": bool,
            "tweet_id": str or None,
            "error": str or None
        }
    """
    
    if dry_run:
        print(f"   [DRY RUN] Would tweet: {message[:100]}...")
        return {
            "success": True,
            "tweet_id": "dry_run_" + username,
            "error": None,
            "dry_run": True
        }
    
    try:
        client = get_x_client()
        
        # Send tweet
        response = client.create_tweet(text=message)
        
        return {
            "success": True,
            "tweet_id": str(response.data['id']),
            "error": None
        }
        
    except Exception as e:
        return {
            "success": False,
            "tweet_id": None,
            "error": str(e)
        }

def send_mentions_batch(
    candidates: List[Dict],
    job_title: str,
    job_link: str,
    dry_run: bool = True
) -> Dict:
    """
    Send tweet mentions to a batch of candidates
    
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
        
        # Generate message
        message = generate_mention_message(
            username=username,
            candidate_name=name.split()[0] if name else username,  # Use first name
            job_title=job_title,
            job_link=job_link,
            recommendation=recommendation
        )
        
        # Send tweet
        result = send_mention_to_candidate(username, message, dry_run=dry_run)
        result['username'] = username
        result['recommendation'] = recommendation
        result['message'] = message
        
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

