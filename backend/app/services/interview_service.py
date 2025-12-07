"""
Interview Service - Manages interview dispatch, tracking, and workflow
"""
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from app.models.schemas import InterviewTemplate, InterviewSubmission, Candidate, Job
from app.db.database import engine
from app.utils.logger import AgentLogger
from sqlmodel import Session, select
import os


class InterviewService:
    """Service for managing interview workflows"""
    
    def __init__(self):
        self.company_name = os.getenv("COMPANY_NAME", "Our Company")
    
    async def create_template(
        self,
        job_id: int,
        interview_type: str,
        title: str,
        description: str,
        questions: List[Dict],
        evaluation_criteria: Dict,
        time_limit_hours: Optional[int] = None
    ) -> InterviewTemplate:
        """
        Create a new interview template
        
        Args:
            job_id: ID of the job this template is for
            interview_type: "takehome" or "phone_screen"
            title: Template title
            description: Detailed description
            questions: List of questions/tasks
            evaluation_criteria: Scoring rubric
            time_limit_hours: Time limit for completion
            
        Returns:
            Created template
        """
        with Session(engine) as session:
            template = InterviewTemplate(
                job_id=job_id,
                interview_type=interview_type,
                title=title,
                description=description,
                questions={"questions": questions},
                evaluation_criteria=evaluation_criteria,
                time_limit_hours=time_limit_hours
            )
            session.add(template)
            session.commit()
            session.refresh(template)
            
            AgentLogger.log_interview(
                f"Created {interview_type} template: {title}",
                job_id=job_id,
                template_id=template.id
            )
            
            return template
    
    async def dispatch_interview(
        self,
        candidate_id: int,
        job_id: int,
        template_id: int
    ) -> InterviewSubmission:
        """
        Dispatch an interview to a candidate
        
        Args:
            candidate_id: ID of the candidate
            job_id: ID of the job
            template_id: ID of the template to use
            
        Returns:
            Created submission record
        """
        with Session(engine) as session:
            # Get candidate and job info
            candidate = session.get(Candidate, candidate_id)
            job = session.get(Job, job_id)
            template = session.get(InterviewTemplate, template_id)
            
            if not all([candidate, job, template]):
                raise ValueError("Invalid candidate, job, or template ID")
            
            # Create submission record
            submission = InterviewSubmission(
                candidate_id=candidate_id,
                job_id=job_id,
                template_id=template_id,
                status="sent"
            )
            session.add(submission)
            session.commit()
            session.refresh(submission)
            
            AgentLogger.log_interview(
                f"Dispatched {template.interview_type} to {candidate.name} for {job.title}",
                job_id=job_id,
                candidate_id=candidate_id,
                submission_id=submission.id
            )
            
            # TODO: Send actual email/DM notification
            # await self._send_interview_notification(candidate, job, template, submission)
            
            return submission
    
    async def submit_response(
        self,
        submission_id: int,
        submission_data: Dict
    ) -> InterviewSubmission:
        """
        Record a candidate's submission
        
        Args:
            submission_id: ID of the submission
            submission_data: Response data (links, answers, etc.)
            
        Returns:
            Updated submission record
        """
        with Session(engine) as session:
            submission = session.get(InterviewSubmission, submission_id)
            if not submission:
                raise ValueError("Submission not found")
            
            submission.submission_data = submission_data
            submission.submitted_at = datetime.utcnow()
            submission.status = "submitted"
            submission.updated_at = datetime.utcnow()
            
            session.add(submission)
            session.commit()
            session.refresh(submission)
            
            AgentLogger.log_interview(
                f"Candidate submitted response for submission {submission_id}",
                job_id=submission.job_id,
                candidate_id=submission.candidate_id,
                submission_id=submission_id
            )
            
            return submission
    
    async def get_pending_reviews(self, job_id: Optional[int] = None) -> List[InterviewSubmission]:
        """
        Get submissions that need human review
        
        Args:
            job_id: Optional filter by job
            
        Returns:
            List of submissions ready for review
        """
        with Session(engine) as session:
            query = select(InterviewSubmission).where(
                InterviewSubmission.status == "reviewed",
                InterviewSubmission.human_reviewed == False
            )
            
            if job_id:
                query = query.where(InterviewSubmission.job_id == job_id)
            
            submissions = session.exec(query).all()
            return submissions
    
    async def approve_submission(
        self,
        submission_id: int,
        reviewer_name: str,
        reviewer_notes: Optional[str] = None,
        score_override: Optional[float] = None
    ) -> Dict:
        """
        Approve a submission and advance candidate to next stage
        
        Args:
            submission_id: ID of the submission
            reviewer_name: Name of the reviewer
            reviewer_notes: Optional review notes
            score_override: Optional override of AI score
            
        Returns:
            Result with status and next actions
        """
        with Session(engine) as session:
            submission = session.get(InterviewSubmission, submission_id)
            if not submission:
                raise ValueError("Submission not found")
            
            # Update submission
            submission.human_reviewed = True
            submission.reviewed_by = reviewer_name
            submission.reviewed_at = datetime.utcnow()
            submission.reviewer_notes = reviewer_notes
            submission.human_score_override = score_override
            submission.status = "approved"
            submission.updated_at = datetime.utcnow()
            
            session.add(submission)
            session.commit()
            
            AgentLogger.log_interview(
                f"Submission {submission_id} approved by {reviewer_name}",
                job_id=submission.job_id,
                candidate_id=submission.candidate_id,
                submission_id=submission_id,
                reviewer=reviewer_name,
                final_score=score_override or submission.ai_score
            )
            
            # TODO: Advance candidate stage
            # TODO: Send next stage invitation
            
            return {
                "success": True,
                "submission_id": submission_id,
                "status": "approved",
                "next_action": "send_next_stage_invitation"
            }
    
    async def reject_submission(
        self,
        submission_id: int,
        reviewer_name: str,
        reviewer_notes: Optional[str] = None
    ) -> Dict:
        """
        Reject a submission and update candidate stage
        
        Args:
            submission_id: ID of the submission
            reviewer_name: Name of the reviewer
            reviewer_notes: Optional review notes
            
        Returns:
            Result with status
        """
        with Session(engine) as session:
            submission = session.get(InterviewSubmission, submission_id)
            if not submission:
                raise ValueError("Submission not found")
            
            # Update submission
            submission.human_reviewed = True
            submission.reviewed_by = reviewer_name
            submission.reviewed_at = datetime.utcnow()
            submission.reviewer_notes = reviewer_notes
            submission.status = "rejected"
            submission.updated_at = datetime.utcnow()
            
            session.add(submission)
            session.commit()
            
            AgentLogger.log_interview(
                f"Submission {submission_id} rejected by {reviewer_name}",
                job_id=submission.job_id,
                candidate_id=submission.candidate_id,
                submission_id=submission_id,
                reviewer=reviewer_name,
                reason=reviewer_notes
            )
            
            # TODO: Update candidate stage to rejected
            # TODO: Send rejection email
            
            return {
                "success": True,
                "submission_id": submission_id,
                "status": "rejected",
                "next_action": "send_rejection_email"
            }
    
    def _format_questions_for_email(self, questions: List[Dict]) -> str:
        """Format questions for email template"""
        formatted = []
        for i, q in enumerate(questions, 1):
            formatted.append(f"{i}. {q.get('question', q.get('task', ''))}")
            if q.get('context'):
                formatted.append(f"   Context: {q['context']}")
        return "\n".join(formatted)
    
    def _generate_submission_link(self, submission_id: int) -> str:
        """Generate submission link for candidate"""
        base_url = os.getenv("APP_BASE_URL", "http://localhost:5173")
        return f"{base_url}/submit-interview/{submission_id}"


# Singleton instance
interview_service = InterviewService()

