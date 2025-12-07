#!/usr/bin/env python3
"""
Database seeding script to populate the database with sample data
"""
import asyncio
from datetime import datetime, timedelta
from app.db.database import init_db, engine
from app.models.schemas import Job, Candidate, JobCandidate, XSignal, AgentLog
from app.utils.logger import AgentLogger
from sqlmodel import Session
import json

# Sample job data
SAMPLE_JOBS = [
    {
        "title": "Senior Frontend Engineer",
        "description": "Build beautiful, performant user interfaces for our AI-powered platform. You'll work with React, TypeScript, and modern web technologies.",
        "headcount": 3,
        "requirements": {
            "skills": ["React", "TypeScript", "5+ years experience", "System design"],
            "experience_years": 5,
            "must_have": ["React", "TypeScript"],
            "nice_to_have": ["Next.js", "GraphQL", "Design Systems"]
        }
    },
    {
        "title": "ML Engineer",
        "description": "Design and implement machine learning pipelines for our core recommendation engine. Experience with LLMs preferred.",
        "headcount": 2,
        "requirements": {
            "skills": ["Python", "PyTorch/TensorFlow", "LLMs", "MLOps"],
            "experience_years": 4,
            "must_have": ["Python", "Machine Learning"],
            "nice_to_have": ["LLMs", "MLOps", "Distributed Training"]
        }
    },
    {
        "title": "Backend Engineer",
        "description": "Build scalable APIs and services that power millions of requests. Strong systems background required.",
        "headcount": 4,
        "requirements": {
            "skills": ["Go/Rust", "Distributed Systems", "PostgreSQL", "Kubernetes"],
            "experience_years": 3,
            "must_have": ["Backend Development", "Distributed Systems"],
            "nice_to_have": ["Go", "Rust", "Kubernetes"]
        }
    }
]

# Sample candidate data
SAMPLE_CANDIDATES = [
    {
        "name": "Sarah Chen",
        "email": "sarah.chen@email.com",
        "x_handle": "@sarahcodes",
        "x_bio": "Senior Frontend Engineer @Stripe. React enthusiast. Building beautiful UIs that scale. Open source contributor.",
        "linkedin_data": {
            "profile_url": "https://linkedin.com/in/sarahchen",
            "headline": "Senior Frontend Engineer at Stripe",
            "location": "San Francisco, CA",
            "experience": [
                {"company": "Stripe", "role": "Senior Frontend Engineer", "duration": "3 years"},
                {"company": "Vercel", "role": "Frontend Engineer", "duration": "2 years"}
            ],
            "skills": ["React", "TypeScript", "Next.js", "Node.js", "GraphQL"],
            "github_stats": {
                "repos": 45,
                "stars": 2341,
                "contributions": 1823,
                "languages": ["TypeScript", "JavaScript", "CSS"]
            }
        }
    },
    {
        "name": "Marcus Johnson",
        "email": "marcus.j@email.com",
        "x_handle": "@marcusdev",
        "x_bio": "Frontend Developer @IBM. Learning React, love Angular. Always building something new.",
        "linkedin_data": {
            "profile_url": "https://linkedin.com/in/marcusjohnson",
            "headline": "Frontend Developer at IBM",
            "location": "Austin, TX",
            "experience": [
                {"company": "IBM", "role": "Frontend Developer", "duration": "4 years"}
            ],
            "skills": ["React", "Angular", "JavaScript", "CSS", "HTML"],
            "github_stats": {
                "repos": 23,
                "stars": 156,
                "contributions": 892,
                "languages": ["JavaScript", "TypeScript", "HTML"]
            }
        }
    },
    {
        "name": "Elena Rodriguez",
        "email": "elena.r@email.com",
        "x_handle": "@elena_dev",
        "x_bio": "Principal Engineer @Notion. Design systems architect. React Conf speaker. Building the future of productivity tools.",
        "linkedin_data": {
            "profile_url": "https://linkedin.com/in/elenarodriguez",
            "headline": "Principal Engineer at Notion",
            "location": "New York, NY",
            "experience": [
                {"company": "Notion", "role": "Principal Engineer", "duration": "2 years"},
                {"company": "Airbnb", "role": "Senior Engineer", "duration": "3 years"}
            ],
            "skills": ["React", "TypeScript", "Design Systems", "Architecture", "Team Leadership"],
            "github_stats": {
                "repos": 67,
                "stars": 5420,
                "contributions": 2891,
                "languages": ["TypeScript", "JavaScript", "Rust"]
            }
        }
    },
    {
        "name": "James Kim",
        "email": "james.kim@email.com",
        "x_handle": "@jameskim_dev",
        "x_bio": "SDE II @Amazon. Full-stack developer. React, Vue, and everything in between.",
        "linkedin_data": {
            "profile_url": "https://linkedin.com/in/jameskim",
            "headline": "SDE II at Amazon",
            "location": "Seattle, WA",
            "experience": [
                {"company": "Amazon", "role": "SDE II", "duration": "2 years"}
            ],
            "skills": ["React", "Vue", "JavaScript", "Python", "Java"],
            "github_stats": {
                "repos": 18,
                "stars": 89,
                "contributions": 567,
                "languages": ["JavaScript", "Python", "Java"]
            }
        }
    },
    {
        "name": "Priya Patel",
        "email": "priya.p@email.com",
        "x_handle": "@priya_codes",
        "x_bio": "Backend Engineer @Deliveroo. Python enthusiast. Building scalable systems that feed millions.",
        "linkedin_data": {
            "profile_url": "https://linkedin.com/in/priyapatel",
            "headline": "Backend Engineer at Deliveroo",
            "location": "London, UK",
            "experience": [
                {"company": "Deliveroo", "role": "Backend Engineer", "duration": "3 years"}
            ],
            "skills": ["Python", "Django", "PostgreSQL", "Docker"],
            "github_stats": {
                "repos": 12,
                "stars": 45,
                "contributions": 423,
                "languages": ["Python", "Go", "SQL"]
            }
        }
    }
]

def create_sample_logs():
    """Create sample agent logs"""
    logs = []
    base_time = datetime.utcnow() - timedelta(hours=2)
    
    # Agent pipeline logs for job 2 (ML Engineer)
    pipeline_logs = [
        ("sourcing", "Starting sourcing pipeline for ML Engineer role", {"agent": "A1", "pipeline_id": "pip_2001"}),
        ("embedding", "Starting embedding generation for job 2: ML Engineer", {"job_id": 2}),
        ("embedding", "Successfully generated embedding for job 2. Embedding ID: emb_ml_2001", {"job_id": 2, "embedding_id": "emb_ml_2001", "embedding_dimensions": 1536}),
        ("sourcing", "Starting topic discovery for job: ML Engineer", {}),
        ("sourcing", "Successfully discovered 5 topics and 8 search queries", {"topics": ["machine learning", "pytorch", "tensorflow", "llm", "mlops"], "search_queries": ["ML engineer", "PyTorch developer", "TensorFlow", "LLM inference", "MLOps engineer", "machine learning python", "deep learning", "neural networks"]}),
        ("search", "Starting X user discovery for 5 topics and 8 search queries", {"topics": ["machine learning", "pytorch", "tensorflow", "llm", "mlops"], "search_queries": ["ML engineer", "PyTorch developer", "TensorFlow", "LLM inference", "MLOps engineer", "machine learning python", "deep learning", "neural networks"]}),
        ("search", "Successfully discovered 19 X users posting about relevant topics", {"users_found": 19, "topics_searched": 5}),
        ("scoring", "Starting role verification for 19 X users against ML Engineer role", {"users_to_verify": 19, "target_role": "ML Engineer"}),
        ("scoring", "Role verification complete: 7 developers verified, 12 filtered out", {"developers_verified": 7, "users_filtered": 12, "verification_rate": "36.8%"}),
        ("sourcing", "Starting LinkedIn enrichment for 7 verified developers", {"developers_to_enrich": 7}),
        ("sourcing", "LinkedIn enrichment complete: 3 real profiles found, 4 synthetic profiles created", {"profiles_enriched": 7, "real_linkedin_profiles": 3, "synthetic_profiles": 4}),
        ("scoring", "Starting compatibility scoring for 7 candidates against ML Engineer", {"candidates_to_score": 7, "job_title": "ML Engineer"}),
        ("scoring", "Compatibility scoring complete: 7 candidates scored, average score: 72.3/100", {"candidates_scored": 7, "average_score": 72.3, "score_range": "45.2-89.1"}),
        ("sourcing", "Starting candidate routing with thresholds: reject<40, takehome<60, interview<75", {"candidates_to_route": 7, "thresholds": {"reject": 40, "takehome": 60, "interview": 75}}),
        ("sourcing", "Candidate routing complete: 1 fasttrack, 2 interview, 4 takehome, 0 reject", {"routing_results": {"fasttrack": 1, "interview": 2, "takehome": 4, "reject": 0, "total_outreach": 7}}),
    ]
    
    # Outreach logs
    outreach_logs = [
        ("outreach", "Sent personalized X mention to @Antonio_M_85 about ML Engineer role", {"username": "Antonio_M_85", "tweet_id": "1997634366974083126", "recommendation": "interview", "platform": "X", "message_type": "mention"}),
        ("outreach", "Sent personalized X mention to @grok about ML Engineer role", {"username": "grok", "tweet_id": "1997634368064626943", "recommendation": "takehome", "platform": "X", "message_type": "mention"}),
        ("outreach", "Sent personalized X mention to @DeepLearn007 about ML Engineer role", {"username": "DeepLearn007", "tweet_id": "1997634369054462355", "recommendation": "takehome", "platform": "X", "message_type": "mention"}),
        ("outreach", "Sent personalized X mention to @ml_sarah about ML Engineer role", {"username": "ml_sarah", "tweet_id": "1997634370123456789", "recommendation": "fasttrack", "platform": "X", "message_type": "mention"}),
    ]
    
    # Response logs
    response_logs = [
        ("outreach", "Received positive DM response from @amitcoder1: \"Yes, I'm interested! Would love to learn more.\"", {"username": "amitcoder1", "message": "Yes, I'm interested! Would love to learn more.", "sentiment": "positive", "response_type": "dm"}),
        ("outreach", "Received interested DM response from @Antonio_M_85: \"Sounds interesting, tell me more about the team\"", {"username": "Antonio_M_85", "message": "Sounds interesting, tell me more about the team", "sentiment": "positive", "response_type": "dm"}),
        ("outreach", "Received enthusiastic DM response from @ml_sarah: \"This looks perfect for my background! When can we chat?\"", {"username": "ml_sarah", "message": "This looks perfect for my background! When can we chat?", "sentiment": "very_positive", "response_type": "dm"}),
    ]
    
    # Create logs with timestamps
    all_log_data = pipeline_logs + outreach_logs + response_logs
    
    for i, (logtype, message, metadata) in enumerate(all_log_data):
        timestamp = base_time + timedelta(minutes=i * 2)
        job_id = 2 if "ML Engineer" in message or "Step" in message else None
        
        logs.append(AgentLog(
            logtype=logtype,
            log=message,
            timestamp=timestamp,
            job_id=job_id,
            context=metadata
        ))
    
    # Add some general activity logs
    general_logs = [
        ("sourcing", "Successfully discovered 12 X users posting about frontend topics", {"source": "X_search", "users_found": 12, "topics_searched": 4}),
        ("scoring", "Scored candidate @sarahcodes: 85.0/100", {"candidate_username": "sarahcodes", "score": 85.0, "reasoning": "Strong React/TypeScript experience with 6 years at top tech companies. Active open-source contributor"}),
        ("sourcing", "Recruiter manually updated Marcus Johnson status to take-home", {"candidate": "Marcus Johnson", "action": "manual_override", "old_status": "screened", "new_status": "takehome_assigned"}),
        ("sourcing", "Elena Rodriguez advanced to interview stage", {"candidate": "Elena Rodriguez", "stage": "interview", "score": 91.0}),
        ("sourcing", "Updated routing thresholds for better candidate quality", {"old_interview_threshold": 65, "new_interview_threshold": 70, "reason": "quality_improvement"}),
        ("scoring", "Compatibility scoring complete: 8 candidates scored, average score: 67.2/100", {"candidates_scored": 8, "average_score": 67.2, "job_title": "Backend Engineer"}),
    ]
    
    for i, (logtype, message, metadata) in enumerate(general_logs):
        timestamp = base_time - timedelta(hours=1) + timedelta(minutes=i * 15)
        job_id = 1 if "Sarah Chen" in message or "Marcus Johnson" in message or "Elena Rodriguez" in message else None
        
        logs.append(AgentLog(
            logtype=logtype,
            log=message,
            timestamp=timestamp,
            job_id=job_id,
            context=metadata
        ))
    
    return logs

async def seed_database():
    """Seed the database with sample data"""
    print("🌱 Seeding database with sample data...")
    
    # Initialize database
    init_db()
    
    with Session(engine) as session:
        # Clear existing data (optional - comment out if you want to keep existing data)
        print("🧹 Clearing existing data...")
        session.query(AgentLog).delete()
        session.query(JobCandidate).delete()
        session.query(XSignal).delete()
        session.query(Candidate).delete()
        session.query(Job).delete()
        session.commit()
        
        # Create jobs
        print("📋 Creating jobs...")
        jobs = []
        for i, job_data in enumerate(SAMPLE_JOBS, 1):
            job = Job(
                id=i,
                title=job_data["title"],
                description=job_data["description"],
                headcount=job_data["headcount"],
                requirements=job_data["requirements"],
                created_at=datetime.utcnow() - timedelta(days=15-i*5)
            )
            jobs.append(job)
            session.add(job)
        
        session.commit()
        print(f"✅ Created {len(jobs)} jobs")
        
        # Create candidates
        print("👥 Creating candidates...")
        candidates = []
        for i, candidate_data in enumerate(SAMPLE_CANDIDATES, 1):
            candidate = Candidate(
                id=i,
                name=candidate_data["name"],
                email=candidate_data["email"],
                x_handle=candidate_data["x_handle"],
                x_bio=candidate_data["x_bio"],
                linkedin_data=candidate_data["linkedin_data"],
                created_at=datetime.utcnow() - timedelta(days=12-i*2)
            )
            candidates.append(candidate)
            session.add(candidate)
        
        session.commit()
        print(f"✅ Created {len(candidates)} candidates")
        
        # Create job-candidate relationships
        print("🔗 Creating job-candidate relationships...")
        job_candidates = [
            # Sarah Chen - Frontend Engineer (Job 1) - High score
            JobCandidate(
                job_id=1, candidate_id=1, 
                compatibility_score=85.0,
                ai_reasoning="Strong React/TypeScript experience with 6 years at top tech companies. Active open-source contributor with 2k+ GitHub stars. Great communication skills evident from Twitter presence.",
                strengths=["React expertise", "TypeScript", "Open source contributions", "Top company experience"],
                weaknesses=["No design systems experience mentioned"],
                stage="screened"
            ),
            # Marcus Johnson - Frontend Engineer (Job 1) - Medium score
            JobCandidate(
                job_id=1, candidate_id=2,
                compatibility_score=62.0,
                ai_reasoning="Promising background with 4 years experience. GitHub shows consistent activity but fewer public projects. Take-home will help assess practical skills.",
                strengths=["Solid fundamentals", "Consistent activity", "Eager to learn"],
                weaknesses=["Limited public projects", "Transitioning from Angular"],
                stage="takehome_assigned"
            ),
            # Elena Rodriguez - Frontend Engineer (Job 1) - Very high score
            JobCandidate(
                job_id=1, candidate_id=3,
                compatibility_score=91.0,
                ai_reasoning="Exceptional candidate. Led frontend architecture at a unicorn startup. Multiple successful open-source projects. Strong Twitter presence showing thought leadership.",
                strengths=["Architecture experience", "Leadership", "Open source", "Thought leadership"],
                weaknesses=["May be overqualified"],
                stage="interview"
            ),
            # James Kim - Frontend Engineer (Job 1) - Not scored yet
            JobCandidate(
                job_id=1, candidate_id=4,
                stage="sourced"
            ),
            # Priya Patel - Frontend Engineer (Job 1) - Low score (mismatch)
            JobCandidate(
                job_id=1, candidate_id=5,
                compatibility_score=32.0,
                ai_reasoning="Experience doesn't align with role requirements. Primarily backend focused with limited frontend exposure. Would be better suited for backend roles.",
                strengths=["Strong backend skills", "Python expertise"],
                weaknesses=["Limited frontend experience", "No React background"],
                stage="rejected"
            ),
        ]
        
        for jc in job_candidates:
            session.add(jc)
        
        session.commit()
        print(f"✅ Created {len(job_candidates)} job-candidate relationships")
        
        # Create X signals
        print("🐦 Creating X signals...")
        x_signals = [
            XSignal(
                candidate_id=1, x_handle="@sarahcodes",
                post_text="Just shipped a new React component library with TypeScript support! 🚀 #react #typescript",
                engagement_type="post", topic="React development"
            ),
            XSignal(
                candidate_id=3, x_handle="@elena_dev",
                post_text="Speaking at React Conf next month about design systems at scale. Excited to share our learnings! 🎤",
                engagement_type="post", topic="Design systems"
            ),
            XSignal(
                candidate_id=2, x_handle="@marcusdev",
                post_text="Finally migrating our Angular app to React. The component patterns are so much cleaner! 💯",
                engagement_type="post", topic="React migration"
            ),
        ]
        
        for signal in x_signals:
            session.add(signal)
        
        session.commit()
        print(f"✅ Created {len(x_signals)} X signals")
        
        # Create agent logs
        print("📊 Creating agent logs...")
        logs = create_sample_logs()
        
        for log in logs:
            session.add(log)
        
        session.commit()
        print(f"✅ Created {len(logs)} agent logs")
        
        print("🎉 Database seeding completed successfully!")
        print("\n📈 Summary:")
        print(f"   • {len(jobs)} jobs")
        print(f"   • {len(candidates)} candidates") 
        print(f"   • {len(job_candidates)} job-candidate relationships")
        print(f"   • {len(x_signals)} X signals")
        print(f"   • {len(logs)} agent logs")
        print("\n🔗 You can now access the data via API:")
        print("   • Jobs: http://localhost:8000/api/jobs/")
        print("   • Logs: http://localhost:8000/api/logs/")

if __name__ == "__main__":
    asyncio.run(seed_database())