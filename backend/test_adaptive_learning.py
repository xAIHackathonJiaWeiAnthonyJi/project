"""
Demo script for adaptive learning system

This shows how the system:
1. Records outcomes
2. Updates thresholds based on feedback
3. Improves accuracy over time
"""
import asyncio
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.services.adaptive_learning_service import adaptive_learning_service
from app.models.schemas import Candidate, Job, JobCandidate
from app.db.database import engine, init_db
from sqlmodel import Session


async def demo_adaptive_learning():
    """Demo the adaptive learning system"""
    
    print("=" * 60)
    print("🧠 ADAPTIVE LEARNING DEMO")
    print("=" * 60)
    print()
    
    # Initialize database
    init_db()
    
    # Create a test job and candidates if they don't exist
    with Session(engine) as session:
        # Get or create job
        job = Job(
            title="Senior ML Engineer",
            description="Looking for an ML engineer with 5+ years experience",
            requirements={"skills": ["Python", "PyTorch", "MLOps"]}
        )
        session.add(job)
        session.commit()
        session.refresh(job)
        
        # Get or create candidates
        candidates_data = [
            {"name": "Alice Chen", "score": 85, "outcome": "hired", "performance": 4.5},
            {"name": "Bob Smith", "score": 92, "outcome": "hired", "performance": 5.0},
            {"name": "Charlie Davis", "score": 78, "outcome": "rejected_interview", "performance": None},
            {"name": "Diana Martinez", "score": 55, "outcome": "rejected_screen", "performance": None},
            {"name": "Eric Johnson", "score": 88, "outcome": "hired", "performance": 3.5},  # Poor performer
        ]
        
        print("📝 Creating test candidates and job-candidate relationships...")
        print()
        
        for data in candidates_data:
            # Create candidate
            candidate = Candidate(
                name=data["name"],
                x_handle=f"@{data['name'].lower().replace(' ', '')}",
                x_bio=f"ML Engineer passionate about AI"
            )
            session.add(candidate)
            session.flush()
            
            # Create job-candidate relationship
            job_candidate = JobCandidate(
                job_id=job.id,
                candidate_id=candidate.id,
                compatibility_score=data["score"],
                ai_reasoning=f"Strong fit based on X activity and experience",
                stage="phone_screened"
            )
            session.add(job_candidate)
            session.commit()
            session.refresh(job_candidate)
            
            # Record outcome
            print(f"  Recording outcome for {data['name']}:")
            print(f"    - Predicted Score: {data['score']}")
            print(f"    - Outcome: {data['outcome']}")
            if data['performance']:
                print(f"    - Performance: {data['performance']}★")
            
            outcome = await adaptive_learning_service.record_outcome(
                candidate_id=candidate.id,
                job_id=job.id,
                outcome=data["outcome"],
                performance_rating=data["performance"],
                reported_by="demo_script"
            )
            
            print(f"    - AI was correct? {outcome.ai_was_correct}")
            print()
    
    print("=" * 60)
    print("📊 LEARNING METRICS AFTER FEEDBACK")
    print("=" * 60)
    print()
    
    # Get learning metrics
    metrics = await adaptive_learning_service.get_learning_metrics("sourcing_agent", days=30)
    
    print(f"🎯 Agent: {metrics['agent_name']}")
    print(f"📈 Version: v{metrics['version']}")
    print(f"✅ Accuracy: {metrics['accuracy']:.1%}")
    print(f"📊 Total Predictions: {metrics['total_predictions']}")
    print(f"🎉 Correct Predictions: {metrics['correct_predictions']}")
    print()
    
    print("🎚️  Adaptive Thresholds:")
    for stage, threshold in metrics['current_thresholds'].items():
        print(f"  - {stage.capitalize():12s}: {threshold:.1f}")
    print()
    
    print("🎯 Stage Precision:")
    for stage, data in metrics['stage_precision'].items():
        if data['count'] > 0:
            print(f"  - {stage.capitalize():12s}: {data['precision']:.1%} ({data['count']} predictions)")
    print()
    
    print("=" * 60)
    print("🔮 RUNNING LEARNING SIMULATION")
    print("=" * 60)
    print()
    
    print("Running 100 iterations with synthetic data...")
    simulation = await adaptive_learning_service.simulate_learning_improvement(iterations=100)
    
    print(f"✅ Initial Accuracy: {simulation[0]['accuracy']:.1%}")
    print(f"✅ Final Accuracy: {simulation[-1]['accuracy']:.1%}")
    print(f"📈 Improvement: +{(simulation[-1]['accuracy'] - simulation[0]['accuracy']):.1%}")
    print()
    
    print("📊 Threshold Evolution:")
    print(f"  - Reject:     {simulation[0]['thresholds']['reject']:.1f} → {simulation[-1]['thresholds']['reject']:.1f}")
    print(f"  - Interview:  {simulation[0]['thresholds']['interview']:.1f} → {simulation[-1]['thresholds']['interview']:.1f}")
    print(f"  - Fasttrack:  {simulation[0]['thresholds']['fasttrack']:.1f} → {simulation[-1]['thresholds']['fasttrack']:.1f}")
    print()
    
    print("=" * 60)
    print("✅ DEMO COMPLETE!")
    print("=" * 60)
    print()
    print("💡 Key Takeaways:")
    print("  1. System learns from actual hiring outcomes")
    print("  2. Thresholds adjust automatically based on feedback")
    print("  3. Accuracy improves over time with more data")
    print("  4. Poor performers (Eric) teach system to be more selective")
    print("  5. Great hires (Bob) teach system to be more aggressive")
    print()
    print("🌐 View the dashboard at: http://localhost:3000/learning")
    print()


if __name__ == "__main__":
    asyncio.run(demo_adaptive_learning())

