"""
Mock Team Manager Notification Service
Simulates sending candidate profiles to team managers when they pass the threshold
"""
from typing import Dict
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# Mock threshold for matching (65% = good match or better)
MATCH_THRESHOLD = 0.65


def passes_threshold(final_score: float) -> bool:
    """Check if a match score passes the threshold"""
    return final_score >= MATCH_THRESHOLD


async def send_candidate_profile_to_manager(
    candidate: Dict,
    team: Dict,
    match_data: Dict
) -> Dict:
    """
    Mock function to send candidate profile to team manager.
    In production, this would send an actual email or Slack notification.
    
    Returns a dict with notification status.
    """
    manager_name = team.get("manager_name", "Team Manager")
    manager_email = f"{manager_name.lower().replace(' ', '.')}@company.com"
    
    # Mock email content
    email_subject = f"🎯 Strong Candidate Match: {candidate['name']} for {team['name']}"
    
    email_body = f"""
Hi {manager_name},

Great news! We've found a strong candidate match for your team: {team['name']}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CANDIDATE PROFILE:
  Name: {candidate['name']}
  Email: {candidate.get('email', 'N/A')}
  X Handle: @{candidate.get('x_handle', 'N/A')}
  
MATCH SCORE: {int(match_data['final_score'] * 100)}/100
  
  ✅ Similarity Score: {int(match_data['similarity_score'] * 100)}%
  ✅ Reasoning Adjustment: {int(match_data['reasoning_adjustment'] * 100)}%
  
RECOMMENDATION: {match_data['recommendation'].upper()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHY THIS IS A GOOD MATCH:
{match_data['match_reasoning']}

STRENGTHS:
"""
    
    for i, strength in enumerate(match_data.get('strengths', [])[:5], 1):
        email_body += f"  {i}. {strength}\n"
    
    if match_data.get('concerns'):
        email_body += f"\nCONSIDERATIONS:\n"
        for i, concern in enumerate(match_data.get('concerns', [])[:3], 1):
            email_body += f"  {i}. {concern}\n"
    
    email_body += f"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CANDIDATE SKILLS:
  {', '.join(candidate.get('skills', [])[:8])}

CANDIDATE EXPERIENCE:
"""
    
    for exp in candidate.get('experience', [])[:3]:
        email_body += f"  • {exp.get('role', 'Role')} at {exp.get('company', 'Company')} ({exp.get('duration', 'Duration')})\n"
    
    email_body += f"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NEXT STEPS:
1. Review the full candidate profile in the system
2. Schedule a screening call if interested
3. Provide feedback on the match quality

View full profile: https://recruiter.company.com/candidates/{candidate.get('id')}

Best regards,
AI Recruiting Team
"""
    
    # Mock sending - just log it
    logger.info(f"📧 [MOCK EMAIL SENT]")
    logger.info(f"   To: {manager_email}")
    logger.info(f"   Subject: {email_subject}")
    logger.info(f"   Match Score: {int(match_data['final_score'] * 100)}/100")
    logger.info(f"   Candidate: {candidate['name']}")
    logger.info(f"   Team: {team['name']}")
    
    # Return mock notification data
    return {
        "success": True,
        "manager_email": manager_email,
        "manager_name": manager_name,
        "sent_at": datetime.utcnow().isoformat(),
        "notification_type": "email",
        "subject": email_subject,
        "body_preview": email_body[:200] + "...",
        "match_score": match_data['final_score'],
        "candidate_name": candidate['name'],
        "team_name": team['name']
    }


async def send_batch_notifications(matches_above_threshold: list) -> Dict:
    """
    Send batch notifications for multiple matches that pass the threshold.
    Returns summary of sent notifications.
    """
    sent_notifications = []
    
    for match in matches_above_threshold:
        try:
            notification = await send_candidate_profile_to_manager(
                candidate=match['candidate'],
                team=match['team'],
                match_data=match['match_data']
            )
            sent_notifications.append(notification)
        except Exception as e:
            logger.error(f"Failed to send notification for match {match.get('id')}: {e}")
    
    return {
        "total_sent": len(sent_notifications),
        "notifications": sent_notifications,
        "threshold_used": MATCH_THRESHOLD
    }


def format_match_summary_for_manager(match_data: Dict) -> str:
    """Format a concise match summary for quick manager review"""
    score = int(match_data['final_score'] * 100)
    rec = match_data['recommendation'].replace('_', ' ').title()
    
    summary = f"""
🎯 Match Score: {score}/100 | {rec}

Key Strengths:
{chr(10).join(f'  ✓ {s}' for s in match_data.get('strengths', [])[:3])}

Match Reasoning:
  {match_data['match_reasoning'][:200]}...
"""
    return summary

