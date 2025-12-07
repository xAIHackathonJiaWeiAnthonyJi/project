"""
Database migration script for adaptive learning tables

Adds:
- CandidateOutcome: Tracks actual hiring outcomes for learning
- AgentLearningParams: Stores learned parameters and thresholds
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.db.database import init_db, engine
from app.models.schemas import CandidateOutcome, AgentLearningParams
from sqlmodel import SQLModel, Session


def migrate():
    """Run migration to add adaptive learning tables"""
    
    print("=" * 60)
    print("🔄 ADAPTIVE LEARNING MIGRATION")
    print("=" * 60)
    print()
    
    # Initialize database (creates tables if they don't exist)
    print("📊 Creating database tables...")
    init_db()
    print("✅ Tables created successfully!")
    print()
    
    # Create default learning params for sourcing agent
    print("🤖 Initializing default learning parameters...")
    with Session(engine) as session:
        # Check if params already exist
        existing = session.query(AgentLearningParams).filter(
            AgentLearningParams.agent_name == "sourcing_agent",
            AgentLearningParams.is_active == True
        ).first()
        
        if existing:
            print(f"✅ Sourcing agent params already exist (version {existing.version})")
        else:
            # Create default params
            params = AgentLearningParams(
                agent_name="sourcing_agent",
                version=1,
                threshold_reject=40.0,
                threshold_takehome=60.0,
                threshold_interview=75.0,
                threshold_fasttrack=90.0,
                is_active=True
            )
            session.add(params)
            session.commit()
            print("✅ Created default sourcing agent params (version 1)")
        
        # Same for interview agent
        existing_interview = session.query(AgentLearningParams).filter(
            AgentLearningParams.agent_name == "interview_agent",
            AgentLearningParams.is_active == True
        ).first()
        
        if existing_interview:
            print(f"✅ Interview agent params already exist (version {existing_interview.version})")
        else:
            params = AgentLearningParams(
                agent_name="interview_agent",
                version=1,
                threshold_reject=40.0,
                threshold_takehome=60.0,
                threshold_interview=75.0,
                threshold_fasttrack=90.0,
                is_active=True
            )
            session.add(params)
            session.commit()
            print("✅ Created default interview agent params (version 1)")
    
    print()
    print("=" * 60)
    print("✅ MIGRATION COMPLETE!")
    print("=" * 60)
    print()
    print("Next steps:")
    print("  1. Run the backend: uvicorn app.main:app --reload")
    print("  2. Run the demo: python test_adaptive_learning.py")
    print("  3. View dashboard: http://localhost:3000/learning")
    print()


if __name__ == "__main__":
    migrate()

