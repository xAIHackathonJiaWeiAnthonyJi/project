"""
Interview Evaluation Service - AI-powered scoring of interview submissions
"""
from typing import Dict, List, Optional
from datetime import datetime
from app.models.schemas import InterviewSubmission, InterviewTemplate, Job
from app.db.database import engine
from app.utils.logger import AgentLogger
from sqlmodel import Session
import httpx
import json
import os


class InterviewEvaluationService:
    """Service for AI evaluation of interview submissions"""
    
    def __init__(self):
        self.api_key = os.getenv("XAI_API_KEY")
        self.base_url = "https://api.x.ai/v1"
        self.model = "grok-beta"
    
    async def evaluate_submission(
        self,
        submission_id: int
    ) -> Dict:
        """
        Evaluate an interview submission using AI
        
        Args:
            submission_id: ID of the submission to evaluate
            
        Returns:
            Evaluation results with score, reasoning, strengths, weaknesses
        """
        with Session(engine) as session:
            submission = session.get(InterviewSubmission, submission_id)
            if not submission:
                raise ValueError("Submission not found")
            
            template = session.get(InterviewTemplate, submission.template_id)
            job = session.get(Job, submission.job_id)
            
            if submission.status != "submitted":
                raise ValueError("Submission not in submitted status")
            
            # Update status to evaluating
            submission.status = "evaluating"
            submission.updated_at = datetime.utcnow()
            session.add(submission)
            session.commit()
            
            AgentLogger.log_interview(
                f"Starting AI evaluation for submission {submission_id}",
                job_id=submission.job_id,
                candidate_id=submission.candidate_id,
                submission_id=submission_id
            )
            
            try:
                # Call AI evaluation based on type
                if template.interview_type == "takehome":
                    evaluation = await self._evaluate_takehome(
                        submission, template, job
                    )
                else:  # phone_screen
                    evaluation = await self._evaluate_phone_screen(
                        submission, template, job
                    )
                
                # Update submission with evaluation
                submission.ai_score = evaluation["score"]
                submission.ai_reasoning = evaluation["reasoning"]
                submission.ai_strengths = evaluation["strengths"]
                submission.ai_weaknesses = evaluation["weaknesses"]
                submission.ai_recommendation = evaluation["recommendation"]
                submission.status = "reviewed"
                submission.updated_at = datetime.utcnow()
                
                session.add(submission)
                session.commit()
                session.refresh(submission)
                
                AgentLogger.log_interview(
                    f"AI evaluation complete for submission {submission_id}: {evaluation['score']}/100",
                    job_id=submission.job_id,
                    candidate_id=submission.candidate_id,
                    submission_id=submission_id,
                    score=evaluation["score"],
                    recommendation=evaluation["recommendation"]
                )
                
                return evaluation
                
            except Exception as e:
                submission.status = "error"
                submission.updated_at = datetime.utcnow()
                session.add(submission)
                session.commit()
                
                AgentLogger.log_error(
                    f"AI evaluation failed for submission {submission_id}",
                    error=e,
                    submission_id=submission_id
                )
                raise
    
    async def _evaluate_takehome(
        self,
        submission: InterviewSubmission,
        template: InterviewTemplate,
        job: Job
    ) -> Dict:
        """Evaluate a take-home coding challenge"""
        
        prompt = self._build_takehome_prompt(submission, template, job)
        response = await self._call_grok_api(prompt)
        return self._parse_evaluation_response(response)
    
    async def _evaluate_phone_screen(
        self,
        submission: InterviewSubmission,
        template: InterviewTemplate,
        job: Job
    ) -> Dict:
        """Evaluate phone screen question responses"""
        
        prompt = self._build_phone_screen_prompt(submission, template, job)
        response = await self._call_grok_api(prompt)
        return self._parse_evaluation_response(response)
    
    def _build_takehome_prompt(
        self,
        submission: InterviewSubmission,
        template: InterviewTemplate,
        job: Job
    ) -> str:
        """Build evaluation prompt for take-home assignment"""
        
        questions = template.questions.get("questions", [])
        submission_data = submission.submission_data
        
        prompt = f"""You are evaluating a take-home coding assignment for a {job.title} position.

**Job Description:**
{job.description}

**Job Requirements:**
{json.dumps(job.requirements, indent=2)}

**Assignment:**
{template.description}

**Questions/Tasks:**
{json.dumps(questions, indent=2)}

**Candidate Submission:**
{json.dumps(submission_data, indent=2)}

**Evaluation Criteria:**
{json.dumps(template.evaluation_criteria, indent=2)}

Please evaluate this submission and provide your assessment in the following JSON format:
{{
    "score": <number 0-100>,
    "reasoning": "<detailed explanation of the score>",
    "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
    "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
    "recommendation": "<strong_yes|yes|maybe|no>",
    "technical_notes": "<any specific technical observations>",
    "follow_up_questions": ["<optional follow-up question 1>", "<optional follow-up question 2>"]
}}

Evaluate thoroughly considering:
- Code quality and organization
- Problem-solving approach
- Technical correctness
- Best practices
- Documentation and clarity
- Completeness

Be objective, constructive, and specific in your evaluation."""
        
        return prompt
    
    def _build_phone_screen_prompt(
        self,
        submission: InterviewSubmission,
        template: InterviewTemplate,
        job: Job
    ) -> str:
        """Build evaluation prompt for phone screen"""
        
        questions = template.questions.get("questions", [])
        submission_data = submission.submission_data
        
        # Format Q&A pairs
        qa_pairs = []
        for i, q in enumerate(questions):
            answer = submission_data.get(f"answer_{i+1}", "No answer provided")
            qa_pairs.append({
                "question": q.get("question", ""),
                "answer": answer
            })
        
        prompt = f"""You are evaluating a phone screening interview for a {job.title} position.

**Job Description:**
{job.description}

**Job Requirements:**
{json.dumps(job.requirements, indent=2)}

**Interview Questions and Candidate Responses:**
{json.dumps(qa_pairs, indent=2)}

**Evaluation Criteria:**
{json.dumps(template.evaluation_criteria, indent=2)}

Please evaluate these responses and provide your assessment in the following JSON format:
{{
    "score": <number 0-100>,
    "reasoning": "<detailed explanation of the score>",
    "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
    "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
    "recommendation": "<strong_yes|yes|maybe|no>",
    "communication_quality": "<assessment of communication skills>",
    "technical_depth": "<assessment of technical knowledge>",
    "follow_up_questions": ["<question to explore further>", "<another follow-up>"]
}}

Evaluate considering:
- Technical knowledge and accuracy
- Communication clarity
- Problem-solving approach
- Cultural fit indicators
- Depth of understanding

Be objective and provide specific examples from their responses."""
        
        return prompt
    
    async def _call_grok_api(self, prompt: str) -> str:
        """Call Grok API for evaluation"""
        
        if not self.api_key:
            raise ValueError("XAI_API_KEY not configured")
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": self.model,
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are an expert technical interviewer and evaluator. Provide thorough, objective, and constructive evaluations in valid JSON format."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "temperature": 0.3,
                    "max_tokens": 2000
                }
            )
            
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
    
    def _parse_evaluation_response(self, response: str) -> Dict:
        """Parse AI evaluation response"""
        
        try:
            # Try to parse as JSON
            evaluation = json.loads(response)
            
            # Validate required fields
            required_fields = ["score", "reasoning", "strengths", "weaknesses", "recommendation"]
            for field in required_fields:
                if field not in evaluation:
                    raise ValueError(f"Missing required field: {field}")
            
            # Ensure score is in valid range
            evaluation["score"] = max(0, min(100, float(evaluation["score"])))
            
            return evaluation
            
        except json.JSONDecodeError:
            # Try to extract JSON from markdown code blocks
            import re
            json_match = re.search(r'```json\n(.*?)\n```', response, re.DOTALL)
            if json_match:
                return self._parse_evaluation_response(json_match.group(1))
            
            # Fallback: create structured response from text
            return {
                "score": 50,
                "reasoning": response,
                "strengths": ["Unable to parse structured evaluation"],
                "weaknesses": ["Please review manually"],
                "recommendation": "maybe"
            }


# Singleton instance
interview_eval_service = InterviewEvaluationService()

