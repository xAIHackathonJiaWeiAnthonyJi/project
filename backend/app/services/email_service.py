"""
Email Notification Service - Sends automated emails to candidates
"""
from typing import Optional, Dict
from datetime import datetime, timedelta
import os
from app.utils.logger import AgentLogger


class EmailService:
    """Service for sending recruitment emails"""
    
    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("FROM_EMAIL", "noreply@company.com")
        self.company_name = os.getenv("COMPANY_NAME", "Our Company")
        self.app_url = os.getenv("APP_BASE_URL", "http://localhost:5173")
    
    async def send_interview_invitation(
        self,
        to_email: str,
        candidate_name: str,
        job_title: str,
        template_title: str,
        template_description: str,
        submission_link: str,
        time_limit_hours: int,
        questions: list
    ) -> bool:
        """Send take-home assignment invitation"""
        
        deadline = datetime.utcnow() + timedelta(hours=time_limit_hours)
        
        subject = f"Next Steps - {template_title} for {job_title}"
        
        questions_text = "\n".join([
            f"{i+1}. {q.get('task', q.get('question', ''))}"
            for i, q in enumerate(questions)
        ])
        
        body = f"""Hi {candidate_name},

Great news! Based on your profile, we'd like to move forward with a take-home assignment.

**Assignment:** {template_title}
**Time Limit:** {time_limit_hours} hours
**Deadline:** {deadline.strftime('%B %d, %Y at %I:%M %p UTC')}

**Description:**
{template_description}

**Tasks:**
{questions_text}

**What to Submit:**
Please submit your work via this link: {submission_link}

You can include:
- GitHub repository link
- Deployed demo link
- Any notes or explanations
- Time spent (optional)

**What We're Looking For:**
- Clean, well-organized code
- Problem-solving approach
- Technical correctness
- Best practices and patterns
- Testing and documentation

Questions? Reply to this email and we'll get back to you promptly.

Best regards,
{self.company_name} Recruiting Team

---
This is an automated message. Please do not reply directly to this email."""
        
        # Log the email (actual sending would happen here)
        AgentLogger.log_interview(
            f"Email notification: Interview invitation sent to {candidate_name} ({to_email})",
            email_type="interview_invitation",
            to_email=to_email,
            subject=subject,
            status="sent"  # Would be "sent" or "failed" in production
        )
        
        print(f"[EMAIL] Would send to {to_email}:")
        print(f"Subject: {subject}")
        print(f"Body:\n{body}\n")
        
        # TODO: Implement actual SMTP sending
        # try:
        #     import smtplib
        #     from email.mime.text import MIMEText
        #     from email.mime.multipart import MIMEMultipart
        #     
        #     msg = MIMEMultipart()
        #     msg['From'] = self.from_email
        #     msg['To'] = to_email
        #     msg['Subject'] = subject
        #     msg.attach(MIMEText(body, 'plain'))
        #     
        #     with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
        #         server.starttls()
        #         server.login(self.smtp_user, self.smtp_password)
        #         server.send_message(msg)
        #     
        #     return True
        # except Exception as e:
        #     AgentLogger.log_error("Failed to send email", error=e, to_email=to_email)
        #     return False
        
        return True  # Simulated success
    
    async def send_approval_notification(
        self,
        to_email: str,
        candidate_name: str,
        job_title: str,
        calendar_link: Optional[str] = None
    ) -> bool:
        """Send interview approval and next steps"""
        
        subject = f"Interview Invitation - {job_title} at {self.company_name}"
        
        calendar_section = ""
        if calendar_link:
            calendar_section = f"""
**Schedule Your Interview:**
{calendar_link}

Please book a time that works best for you within the next week.
"""
        else:
            calendar_section = """
Our team will reach out shortly to schedule your interview."""
        
        body = f"""Hi {candidate_name},

Congratulations! We were impressed with your take-home submission and would like to invite you for an interview with our team.

**Next Steps:**
{calendar_section}

**What to Expect:**
- Duration: 45-60 minutes
- Format: Video call
- Topics: Technical discussion, team fit, questions from both sides

**Interview Panel:**
- Engineering Manager
- Senior Team Member
- (Additional team members may join)

We're excited to learn more about you and share more about the role!

Looking forward to speaking with you soon.

Best regards,
{self.company_name} Recruiting Team"""
        
        AgentLogger.log_interview(
            f"Email notification: Approval and interview invite sent to {candidate_name}",
            email_type="approval_invitation",
            to_email=to_email,
            subject=subject
        )
        
        print(f"[EMAIL] Would send to {to_email}:")
        print(f"Subject: {subject}")
        print(f"Body:\n{body}\n")
        
        return True  # Simulated success
    
    async def send_rejection_notification(
        self,
        to_email: str,
        candidate_name: str,
        job_title: str,
        positive_note: Optional[str] = None
    ) -> bool:
        """Send professional rejection email"""
        
        subject = f"Update on Your Application - {job_title}"
        
        positive_section = ""
        if positive_note:
            positive_section = f"\n\nWe were particularly impressed by {positive_note}, and we encourage you to apply for future openings that match your skills."
        
        body = f"""Hi {candidate_name},

Thank you for taking the time to complete the interview for the {job_title} position.

After careful review, we've decided to move forward with other candidates whose experience more closely aligns with our current needs.{positive_section}

We've added your profile to our talent pool and will reach out if a better match becomes available in the future.

Thank you again for your interest in {self.company_name}. We wish you the best in your job search.

Best regards,
{self.company_name} Recruiting Team"""
        
        AgentLogger.log_interview(
            f"Email notification: Rejection email sent to {candidate_name}",
            email_type="rejection",
            to_email=to_email,
            subject=subject
        )
        
        print(f"[EMAIL] Would send to {to_email}:")
        print(f"Subject: {subject}")
        print(f"Body:\n{body}\n")
        
        return True  # Simulated success
    
    async def send_reminder(
        self,
        to_email: str,
        candidate_name: str,
        template_title: str,
        submission_link: str,
        hours_remaining: int
    ) -> bool:
        """Send reminder about pending submission"""
        
        subject = f"Reminder: {template_title} Due Soon"
        
        body = f"""Hi {candidate_name},

This is a friendly reminder that your {template_title} assignment is due in {hours_remaining} hours.

**Submission Link:**
{submission_link}

If you've already submitted, please disregard this message.

If you need more time or have any questions, please let us know by replying to this email.

Best regards,
{self.company_name} Recruiting Team"""
        
        AgentLogger.log_interview(
            f"Email notification: Reminder sent to {candidate_name}",
            email_type="reminder",
            to_email=to_email,
            hours_remaining=hours_remaining
        )
        
        print(f"[EMAIL] Would send to {to_email}:")
        print(f"Subject: {subject}")
        print(f"Body:\n{body}\n")
        
        return True  # Simulated success


# Singleton instance
email_service = EmailService()

