"""
Adaptive Learning Service - RL-inspired continuous improvement for agents

This service implements a simple reinforcement learning approach:
1. Track outcomes (rewards) for agent predictions
2. Adjust scoring thresholds based on feedback
3. Update feature weights to improve accuracy
4. Learn from both positive (hired) and negative (rejected) outcomes
"""
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from app.models.schemas import (
    CandidateOutcome, AgentLearningParams, JobCandidate, 
    InterviewSubmission, TeamMatch
)
from app.db.database import engine
from app.utils.logger import AgentLogger
from sqlmodel import Session, select
import math


class AdaptiveLearningService:
    """
    Adaptive learning system that improves agent decisions over time
    
    Uses a simple RL-inspired approach:
    - Reward: +1 for correct predictions, -1 for incorrect
    - Policy: Adjust thresholds to maximize reward
    - Exploration: Occasional random adjustments to discover better thresholds
    """
    
    def __init__(self):
        self.exploration_rate = 0.1  # 10% chance to explore
        self.learning_rate = 0.1  # How fast to update
    
    # ========================================
    # FEEDBACK COLLECTION
    # ========================================
    
    async def record_outcome(
        self,
        candidate_id: int,
        job_id: int,
        outcome: str,
        outcome_reason: Optional[str] = None,
        performance_rating: Optional[float] = None,
        retention_months: Optional[int] = None,
        would_hire_again: Optional[bool] = None,
        reported_by: Optional[str] = None
    ) -> CandidateOutcome:
        """
        Record the actual outcome for a candidate
        
        Args:
            outcome: "hired", "rejected_interview", "rejected_screen", 
                    "rejected_sourcing", "withdrew"
            performance_rating: 1-5 stars (if hired)
            retention_months: How long they stayed (if hired)
            would_hire_again: Manager feedback (if hired)
        """
        with Session(engine) as session:
            # Get the original AI prediction
            job_candidate = session.exec(
                select(JobCandidate).where(
                    JobCandidate.candidate_id == candidate_id,
                    JobCandidate.job_id == job_id
                )
            ).first()
            
            if not job_candidate:
                raise ValueError("Job-candidate relationship not found")
            
            # Determine if AI was correct
            ai_was_correct = self._evaluate_prediction_quality(
                predicted_score=job_candidate.compatibility_score,
                outcome=outcome,
                performance_rating=performance_rating
            )
            
            # Create outcome record
            outcome_record = CandidateOutcome(
                candidate_id=candidate_id,
                job_id=job_id,
                predicted_compatibility_score=job_candidate.compatibility_score or 0,
                predicted_stage_recommendation=self._score_to_stage(
                    job_candidate.compatibility_score or 0
                ),
                outcome=outcome,
                outcome_reason=outcome_reason,
                performance_rating=performance_rating,
                retention_months=retention_months,
                would_hire_again=would_hire_again,
                ai_was_correct=ai_was_correct,
                reported_by=reported_by
            )
            
            session.add(outcome_record)
            session.commit()
            session.refresh(outcome_record)
            
            AgentLogger.log(
                logtype="learning",
                message=f"Recorded outcome for candidate {candidate_id}: {outcome}",
                job_id=job_id,
                candidate_id=candidate_id,
                outcome=outcome,
                ai_was_correct=ai_was_correct
            )
            
            # Trigger learning update
            await self.update_learning_params("sourcing_agent", outcome_record)
            
            return outcome_record
    
    def _score_to_stage(self, score: float) -> str:
        """Convert compatibility score to stage recommendation"""
        if score >= 90:
            return "fasttrack"
        elif score >= 75:
            return "interview"
        elif score >= 40:
            return "takehome"
        else:
            return "reject"
    
    def _evaluate_prediction_quality(
        self,
        predicted_score: float,
        outcome: str,
        performance_rating: Optional[float] = None
    ) -> bool:
        """
        Determine if the AI prediction was correct
        
        Logic:
        - Hired + good performance (>= 4 stars) = correct if score >= 75
        - Hired + poor performance (< 4 stars) = correct if score < 75
        - Rejected early = correct if score < 60
        - Withdrew = neutral (not counted)
        """
        if outcome == "hired":
            if performance_rating is not None:
                # Good performance should correlate with high scores
                if performance_rating >= 4.0:
                    return predicted_score >= 75
                else:
                    return predicted_score < 75
            else:
                # Without performance data, assume hire was good
                return predicted_score >= 60
        
        elif outcome == "rejected_interview":
            # Should have been caught earlier with lower score
            return predicted_score < 85
        
        elif outcome == "rejected_screen":
            # Should have been caught at sourcing
            return predicted_score < 70
        
        elif outcome == "rejected_sourcing":
            # AI correctly identified as poor fit
            return predicted_score < 60
        
        elif outcome == "withdrew":
            # Neutral - not the AI's fault
            return None  # Don't count for accuracy
        
        return False
    
    # ========================================
    # LEARNING & PARAMETER UPDATES
    # ========================================
    
    async def update_learning_params(
        self,
        agent_name: str,
        outcome: CandidateOutcome
    ) -> AgentLearningParams:
        """
        Update agent parameters based on outcome feedback
        
        Uses gradient descent-style updates:
        - If prediction was wrong, adjust thresholds in the direction that would fix it
        - Track precision/recall per stage
        - Maintain running accuracy
        """
        with Session(engine) as session:
            # Get current active params
            params = session.exec(
                select(AgentLearningParams).where(
                    AgentLearningParams.agent_name == agent_name,
                    AgentLearningParams.is_active == True
                )
            ).first()
            
            if not params:
                # Create initial params
                params = AgentLearningParams(agent_name=agent_name)
                session.add(params)
                session.flush()
            
            # Update metrics
            if outcome.ai_was_correct is not None:
                params.total_predictions += 1
                if outcome.ai_was_correct:
                    params.correct_predictions += 1
                
                params.accuracy = params.correct_predictions / params.total_predictions
            
            # Update precision metrics per stage
            predicted_stage = outcome.predicted_stage_recommendation
            actual_success = outcome.outcome == "hired" and (
                outcome.performance_rating is None or outcome.performance_rating >= 4.0
            )
            
            stage_metrics = params.precision_by_stage.get(predicted_stage, {"tp": 0, "fp": 0, "fn": 0})
            
            if actual_success:
                stage_metrics["tp"] += 1  # True positive
            else:
                stage_metrics["fp"] += 1  # False positive
            
            params.precision_by_stage[predicted_stage] = stage_metrics
            
            # Adjust thresholds based on error
            if outcome.ai_was_correct is False:
                params = self._adjust_thresholds(
                    params, 
                    outcome.predicted_compatibility_score,
                    outcome.outcome,
                    outcome.performance_rating
                )
            
            # Update timestamp and version
            params.last_updated_at = datetime.utcnow()
            params.version += 1
            
            session.add(params)
            session.commit()
            session.refresh(params)
            
            AgentLogger.log(
                logtype="learning",
                message=f"Updated learning params for {agent_name}: accuracy={params.accuracy:.2%}",
                agent_name=agent_name,
                accuracy=params.accuracy,
                total_predictions=params.total_predictions,
                version=params.version,
                thresholds={
                    "reject": params.threshold_reject,
                    "takehome": params.threshold_takehome,
                    "interview": params.threshold_interview,
                    "fasttrack": params.threshold_fasttrack
                }
            )
            
            return params
    
    def _adjust_thresholds(
        self,
        params: AgentLearningParams,
        predicted_score: float,
        outcome: str,
        performance_rating: Optional[float]
    ) -> AgentLearningParams:
        """
        Adjust scoring thresholds based on prediction error
        
        Principle:
        - If we predicted too high (rejected later), lower thresholds
        - If we predicted too low (great hire), raise thresholds
        """
        adjustment = self.learning_rate * 5  # 0.5 point adjustment
        
        if outcome == "hired" and performance_rating and performance_rating < 4.0:
            # Poor performer - we should have been more selective
            # Increase thresholds
            if predicted_score < 90:
                params.threshold_fasttrack = min(95, params.threshold_fasttrack + adjustment)
            if predicted_score < 75:
                params.threshold_interview = min(85, params.threshold_interview + adjustment)
        
        elif outcome in ["rejected_interview", "rejected_screen"]:
            # Rejected later - we should have caught this earlier
            # Lower thresholds for rejection, raise for advancement
            if predicted_score >= 75:
                params.threshold_interview = min(80, params.threshold_interview + adjustment)
            if predicted_score >= 60:
                params.threshold_takehome = min(70, params.threshold_takehome + adjustment)
        
        elif outcome == "hired" and performance_rating and performance_rating >= 4.5:
            # Great hire! We can be slightly more aggressive
            # Lower thresholds slightly to find more like this
            params.threshold_interview = max(70, params.threshold_interview - adjustment * 0.5)
            params.threshold_takehome = max(55, params.threshold_takehome - adjustment * 0.5)
        
        return params
    
    # ========================================
    # INFERENCE WITH LEARNED PARAMS
    # ========================================
    
    def get_active_params(self, agent_name: str = "sourcing_agent") -> AgentLearningParams:
        """Get current active learning parameters"""
        with Session(engine) as session:
            params = session.exec(
                select(AgentLearningParams).where(
                    AgentLearningParams.agent_name == agent_name,
                    AgentLearningParams.is_active == True
                )
            ).first()
            
            if not params:
                # Return defaults
                params = AgentLearningParams(agent_name=agent_name)
            
            return params
    
    def apply_learned_thresholds(
        self,
        score: float,
        agent_name: str = "sourcing_agent"
    ) -> str:
        """
        Apply learned thresholds to make a decision
        
        Returns:
            Stage recommendation: "fasttrack", "interview", "takehome", "reject"
        """
        params = self.get_active_params(agent_name)
        
        if score >= params.threshold_fasttrack:
            return "fasttrack"
        elif score >= params.threshold_interview:
            return "interview"
        elif score >= params.threshold_takehome:
            return "takehome"
        else:
            return "reject"
    
    # ========================================
    # ANALYTICS & REPORTING
    # ========================================
    
    async def get_learning_metrics(
        self,
        agent_name: str = "sourcing_agent",
        days: int = 30
    ) -> Dict:
        """
        Get learning metrics and performance over time
        """
        with Session(engine) as session:
            # Get current params
            params = self.get_active_params(agent_name)
            
            # Get recent outcomes
            since_date = datetime.utcnow() - timedelta(days=days)
            outcomes = session.exec(
                select(CandidateOutcome).where(
                    CandidateOutcome.reported_at >= since_date
                )
            ).all()
            
            # Calculate metrics
            total_outcomes = len(outcomes)
            hired_count = sum(1 for o in outcomes if o.outcome == "hired")
            avg_performance = sum(
                o.performance_rating for o in outcomes 
                if o.performance_rating is not None
            ) / max(1, sum(1 for o in outcomes if o.performance_rating is not None))
            
            # Calculate precision per stage
            stage_precision = {}
            for stage, metrics in params.precision_by_stage.items():
                tp = metrics.get("tp", 0)
                fp = metrics.get("fp", 0)
                precision = tp / (tp + fp) if (tp + fp) > 0 else 0
                stage_precision[stage] = {
                    "precision": precision,
                    "count": tp + fp
                }
            
            return {
                "agent_name": agent_name,
                "version": params.version,
                "accuracy": params.accuracy,
                "total_predictions": params.total_predictions,
                "correct_predictions": params.correct_predictions,
                "current_thresholds": {
                    "reject": params.threshold_reject,
                    "takehome": params.threshold_takehome,
                    "interview": params.threshold_interview,
                    "fasttrack": params.threshold_fasttrack
                },
                "stage_precision": stage_precision,
                "recent_outcomes": {
                    "total": total_outcomes,
                    "hired": hired_count,
                    "avg_performance_rating": round(avg_performance, 2),
                    "hire_rate": round(hired_count / max(1, total_outcomes), 2)
                },
                "last_updated": params.last_updated_at.isoformat() + "Z"
            }
    
    async def simulate_learning_improvement(
        self,
        iterations: int = 100
    ) -> List[Dict]:
        """
        Simulate the learning process with synthetic data
        
        Useful for demos to show how the system improves over time
        """
        import random
        
        results = []
        params = AgentLearningParams(agent_name="simulation")
        
        for i in range(iterations):
            # Simulate a candidate with ground truth quality
            true_quality = random.uniform(0, 100)
            
            # Add noise to prediction
            noise = random.gauss(0, 10)
            predicted_score = max(0, min(100, true_quality + noise))
            
            # Determine outcome based on true quality
            if true_quality >= 80:
                outcome = "hired"
                performance = random.uniform(4.0, 5.0)
            elif true_quality >= 60:
                outcome = random.choice(["hired", "rejected_interview"])
                performance = random.uniform(3.0, 4.5) if outcome == "hired" else None
            elif true_quality >= 40:
                outcome = random.choice(["rejected_screen", "rejected_interview"])
                performance = None
            else:
                outcome = "rejected_sourcing"
                performance = None
            
            # Apply current thresholds
            predicted_stage = self.apply_learned_thresholds_with_params(
                predicted_score, params
            )
            
            # Evaluate correctness
            correct = self._evaluate_prediction_quality(
                predicted_score, outcome, performance
            )
            
            if correct is not None:
                params.total_predictions += 1
                if correct:
                    params.correct_predictions += 1
                
                params.accuracy = params.correct_predictions / params.total_predictions
                
                # Update thresholds
                if not correct:
                    params = self._adjust_thresholds(
                        params, predicted_score, outcome, performance
                    )
            
            results.append({
                "iteration": i + 1,
                "accuracy": params.accuracy,
                "thresholds": {
                    "reject": params.threshold_reject,
                    "interview": params.threshold_interview,
                    "fasttrack": params.threshold_fasttrack
                }
            })
        
        return results
    
    def apply_learned_thresholds_with_params(
        self,
        score: float,
        params: AgentLearningParams
    ) -> str:
        """Helper for simulation"""
        if score >= params.threshold_fasttrack:
            return "fasttrack"
        elif score >= params.threshold_interview:
            return "interview"
        elif score >= params.threshold_takehome:
            return "takehome"
        else:
            return "reject"


# Singleton instance
adaptive_learning_service = AdaptiveLearningService()

