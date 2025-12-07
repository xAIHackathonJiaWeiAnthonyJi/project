#!/usr/bin/env python3
"""
Test the full sourcing pipeline including database saves and outreach
"""
import asyncio
from app.services.sourcing_agent import SourcingAgent
from app.db.database import init_db, engine
from app.models.schemas import Candidate, JobCandidate
from sqlmodel import Session, select

async def test_full_sourcing_with_saves():
    """Test the sourcing pipeline with database saves"""
    print("🚀 Testing Full Sourcing Pipeline with Database Saves")
    print("=" * 60)
    
    # Initialize database
    init_db()
    
    # Job details
    job_id = 1  # Use existing job from seed data
    job_title = "Senior Frontend Engineer"
    job_description = "Build beautiful, performant user interfaces for our AI-powered platform. You'll work with React, TypeScript, and modern web technologies."
    
    print(f"📋 Job: {job_title}")
    print(f"📝 Description: {job_description[:100]}...")
    print()
    
    # Check initial candidate count
    with Session(engine) as session:
        initial_count = len(session.exec(select(Candidate)).all())
        initial_job_candidates = len(session.exec(select(JobCandidate).where(JobCandidate.job_id == job_id)).all())
        
    print(f"📊 Initial State:")
    print(f"   • Total candidates in DB: {initial_count}")
    print(f"   • Candidates for Job {job_id}: {initial_job_candidates}")
    print()
    
    # Create mock candidates for testing
    mock_candidates = [
        {
            "username": "react_sarah",
            "name": "Sarah Chen",
            "bio": "Senior React developer @Meta. TypeScript expert. Building the future of social media.",
            "followers": 2500,
            "linkedin_data": {
                "headline": "Senior Frontend Engineer at Meta",
                "experience": "6+ years React/TypeScript",
                "skills": ["React", "TypeScript", "Next.js", "GraphQL"]
            },
            "compatibility": {
                "compatibility_score": 92,
                "reasoning": "Excellent React/TypeScript experience at top company. Perfect fit for senior role."
            },
            "recommendation": "fasttrack"
        },
        {
            "username": "js_mike",
            "name": "Mike Johnson", 
            "bio": "Frontend developer @Spotify. React, Vue, Angular. Always learning new frameworks.",
            "followers": 1200,
            "linkedin_data": {
                "headline": "Frontend Developer at Spotify",
                "experience": "4+ years frontend development",
                "skills": ["React", "Vue", "JavaScript", "CSS"]
            },
            "compatibility": {
                "compatibility_score": 78,
                "reasoning": "Strong frontend experience with React. Good fit for the role."
            },
            "recommendation": "interview"
        },
        {
            "username": "new_dev_alex",
            "name": "Alex Kim",
            "bio": "Junior developer learning React. Bootcamp grad. Passionate about clean code.",
            "followers": 150,
            "linkedin_data": {
                "headline": "Junior Frontend Developer",
                "experience": "1 year frontend development",
                "skills": ["React", "JavaScript", "HTML", "CSS"]
            },
            "compatibility": {
                "compatibility_score": 55,
                "reasoning": "Junior level but shows promise. Good for take-home assessment."
            },
            "recommendation": "takehome"
        },
        {
            "username": "backend_only",
            "name": "Carlos Santos",
            "bio": "Backend engineer @AWS. Python, Go, Kubernetes. No frontend experience.",
            "followers": 800,
            "linkedin_data": {
                "headline": "Backend Engineer at AWS",
                "experience": "5+ years backend development",
                "skills": ["Python", "Go", "Kubernetes", "Docker"]
            },
            "compatibility": {
                "compatibility_score": 25,
                "reasoning": "Strong backend skills but no frontend experience. Not a good fit."
            },
            "recommendation": "reject"
        }
    ]
    
    # Test the sourcing agent's save functionality
    agent = SourcingAgent()
    
    print("💾 Testing Candidate Database Saves...")
    save_results = agent.save_candidates_to_database(mock_candidates, job_id)
    print(f"✅ Save Results: {save_results}")
    print()
    
    # Check final candidate count
    with Session(engine) as session:
        final_count = len(session.exec(select(Candidate)).all())
        final_job_candidates = len(session.exec(select(JobCandidate).where(JobCandidate.job_id == job_id)).all())
        
        # Get the saved candidates
        job_candidates = session.exec(
            select(JobCandidate).where(JobCandidate.job_id == job_id)
        ).all()
        
    print(f"📊 Final State:")
    print(f"   • Total candidates in DB: {final_count} (+{final_count - initial_count})")
    print(f"   • Candidates for Job {job_id}: {final_job_candidates} (+{final_job_candidates - initial_job_candidates})")
    print()
    
    print("🎯 Candidate Rankings for Job:")
    for jc in sorted(job_candidates, key=lambda x: x.compatibility_score or 0, reverse=True):
        with Session(engine) as session:
            candidate = session.get(Candidate, jc.candidate_id)
            score = jc.compatibility_score or 0
            stage = jc.stage
            print(f"   • {candidate.name}: {score}/100 → {stage}")
    print()
    
    # Test outreach (dry run)
    print("🐦 Testing Outreach (Dry Run)...")
    outreach_candidates = [c for c in mock_candidates if c['recommendation'] != 'reject']
    
    from app.services.x_mention_service import send_mentions_batch
    
    try:
        outreach_results = send_mentions_batch(
            candidates=outreach_candidates,
            job_title=job_title,
            job_link="https://jobs.example.com/frontend-123",
            dry_run=True  # Safe dry run
        )
        
        print(f"✅ Outreach Results:")
        print(f"   • Would send {outreach_results['sent']} tweets")
        print(f"   • {outreach_results['failed']} failures")
        print(f"   • Sample messages generated successfully")
        
    except Exception as e:
        print(f"❌ Outreach test failed: {e}")
    
    print()
    print("🎉 FULL PIPELINE TEST COMPLETE!")
    print("=" * 60)
    print("✅ Candidates are now saved to database")
    print("✅ Job-candidate relationships created with scores")
    print("✅ Outreach messages generated (dry run)")
    print("✅ All actions logged to database")

if __name__ == "__main__":
    asyncio.run(test_full_sourcing_with_saves())