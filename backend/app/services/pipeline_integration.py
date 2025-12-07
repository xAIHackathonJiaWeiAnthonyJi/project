"""
Pipeline Integration Service - Connects sourcing and interview agents
"""
from typing import Optional
from app.models.schemas import JobCandidate, InterviewTemplate
from app.services.interview_service import interview_service
from app.utils.logger import AgentLogger
from app.db.database import engine
from sqlmodel import Session, select


class PipelineIntegration:
    """Service for integrating agents across the recruitment pipeline"""
    
    async def handle_stage_change(
        self,
        candidate_id: int,
        job_id: int,
        old_stage: str,
        new_stage: str
    ):
        """
        Handle automatic actions when candidate stage changes
        
        Args:
            candidate_id: ID of the candidate
            job_id: ID of the job
            old_stage: Previous stage
            new_stage: New stage
        """
        
        # When candidate moves to takehome_assigned, auto-dispatch interview
        if new_stage == "takehome_assigned":
            await self._auto_dispatch_takehome(candidate_id, job_id)
        
        # When candidate moves to interview stage (after takehome approval)
        elif new_stage == "interview" and old_stage == "takehome_assigned":
            AgentLogger.log_interview(
                f"Candidate {candidate_id} advanced to interview stage after takehome approval",
                job_id=job_id,
                candidate_id=candidate_id,
                auto_action="stage_transition"
            )
            # TODO: Send calendar invite email
    
    async def _auto_dispatch_takehome(self, candidate_id: int, job_id: int):
        """
        Automatically dispatch take-home interview when candidate reaches that stage
        """
        with Session(engine) as session:
            # Check if template exists for this job
            query = select(InterviewTemplate).where(
                InterviewTemplate.job_id == job_id,
                InterviewTemplate.interview_type == "takehome"
            )
            template = session.exec(query).first()
            
            if not template:
                AgentLogger.log_interview(
                    f"No take-home template found for job {job_id}, skipping auto-dispatch",
                    job_id=job_id,
                    candidate_id=candidate_id,
                    auto_dispatch=False,
                    reason="no_template"
                )
                return
            
            # Check if interview already dispatched
            from app.models.schemas import InterviewSubmission
            existing = session.exec(
                select(InterviewSubmission).where(
                    InterviewSubmission.candidate_id == candidate_id,
                    InterviewSubmission.job_id == job_id,
                    InterviewSubmission.template_id == template.id
                )
            ).first()
            
            if existing:
                AgentLogger.log_interview(
                    f"Interview already dispatched for candidate {candidate_id}, job {job_id}",
                    job_id=job_id,
                    candidate_id=candidate_id,
                    auto_dispatch=False,
                    reason="already_sent"
                )
                return
            
            # Dispatch interview
            try:
                submission = await interview_service.dispatch_interview(
                    candidate_id=candidate_id,
                    job_id=job_id,
                    template_id=template.id
                )
                
                AgentLogger.log_interview(
                    f"Auto-dispatched take-home interview to candidate {candidate_id}",
                    job_id=job_id,
                    candidate_id=candidate_id,
                    submission_id=submission.id,
                    auto_dispatch=True,
                    template_id=template.id
                )
                
            except Exception as e:
                AgentLogger.log_error(
                    f"Failed to auto-dispatch interview for candidate {candidate_id}",
                    error=e,
                    job_id=job_id,
                    candidate_id=candidate_id
                )
    
    async def on_interview_approved(
        self,
        submission_id: int,
        candidate_id: int,
        job_id: int
    ):
        """
        Handle actions when interview is approved
        
        Advances candidate stage and triggers next steps
        """
        with Session(engine) as session:
            # Update candidate stage
            job_candidate = session.exec(
                select(JobCandidate).where(
                    JobCandidate.candidate_id == candidate_id,
                    JobCandidate.job_id == job_id
                )
            ).first()
            
            if job_candidate:
                old_stage = job_candidate.stage
                job_candidate.stage = "interview"  # Move to next stage
                session.add(job_candidate)
                session.commit()
                
                AgentLogger.log_interview(
                    f"Candidate {candidate_id} advanced from {old_stage} to interview after approval",
                    job_id=job_id,
                    candidate_id=candidate_id,
                    submission_id=submission_id,
                    auto_action="stage_advancement"
                )
                
                # Send approval email
                try:
                    from app.services.email_service import email_service
                    from app.models.schemas import Candidate, Job
                    candidate = session.get(Candidate, candidate_id)
                    job = session.get(Job, job_id)
                    if candidate and candidate.email and job:
                        await email_service.send_approval_notification(
                            to_email=candidate.email,
                            candidate_name=candidate.name,
                            job_title=job.title,
                            calendar_link=None  # TODO: Add calendly integration
                        )
                except Exception as e:
                    AgentLogger.log_error(
                        f"Failed to send approval email",
                        error=e,
                        candidate_id=candidate_id
                    )
    
    async def on_interview_rejected(
        self,
        submission_id: int,
        candidate_id: int,
        job_id: int
    ):
        """
        Handle actions when interview is rejected
        
        Updates candidate stage and triggers rejection email
        """
        with Session(engine) as session:
            # Update candidate stage
            job_candidate = session.exec(
                select(JobCandidate).where(
                    JobCandidate.candidate_id == candidate_id,
                    JobCandidate.job_id == job_id
                )
            ).first()
            
            if job_candidate:
                old_stage = job_candidate.stage
                job_candidate.stage = "rejected"
                session.add(job_candidate)
                session.commit()
                
                AgentLogger.log_interview(
                    f"Candidate {candidate_id} rejected after interview evaluation",
                    job_id=job_id,
                    candidate_id=candidate_id,
                    submission_id=submission_id,
                    old_stage=old_stage,
                    auto_action="rejection"
                )
                
                # Send rejection email
                try:
                    from app.services.email_service import email_service
                    from app.models.schemas import Candidate, Job, InterviewSubmission
                    candidate = session.get(Candidate, candidate_id)
                    job = session.get(Job, job_id)
                    submission = session.get(InterviewSubmission, submission_id)
                    
                    positive_note = None
                    if submission and submission.ai_strengths:
                        positive_note = ", ".join(submission.ai_strengths[:2])
                    
                    if candidate and candidate.email and job:
                        await email_service.send_rejection_notification(
                            to_email=candidate.email,
                            candidate_name=candidate.name,
                            job_title=job.title,
                            positive_note=positive_note
                        )
                except Exception as e:
                    AgentLogger.log_error(
                        f"Failed to send rejection email",
                        error=e,
                        candidate_id=candidate_id
                    )


# Singleton instance
pipeline_integration = PipelineIntegration()

