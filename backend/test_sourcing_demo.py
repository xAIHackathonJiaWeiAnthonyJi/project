#!/usr/bin/env python3
"""
Demo script to show sourcing agent functionality without external APIs
"""
import asyncio
import random
from app.services.sourcing_agent import SourcingAgent
from app.db.database import init_db

# Mock data for demonstration
MOCK_X_USERS = [
    {
        "username": "sarah_dev",
        "name": "Sarah Chen",
        "bio": "Senior React developer @Stripe. TypeScript enthusiast. Building scalable frontends.",
        "followers": 2341,
        "posts": ["Just shipped a new React component library!", "TypeScript 5.0 features are amazing"]
    },
    {
        "username": "mike_python",
        "name": "Mike Rodriguez", 
        "bio": "Python backend engineer @Netflix. FastAPI and Django expert.",
        "followers": 1823,
        "posts": ["FastAPI performance tips", "Async Python patterns"]
    },
    {
        "username": "alex_ml",
        "name": "Alex Kim",
        "bio": "ML Engineer @OpenAI. PyTorch, transformers, and LLMs.",
        "followers": 3421,
        "posts": ["Training LLMs efficiently", "PyTorch 2.0 compilation tricks"]
    },
    {
        "username": "jen_fullstack",
        "name": "Jennifer Liu",
        "bio": "Full-stack developer. React + Node.js + PostgreSQL.",
        "followers": 892,
        "posts": ["Building real-time apps with WebSockets", "Database optimization tips"]
    },
    {
        "username": "carlos_devops",
        "name": "Carlos Santos",
        "bio": "DevOps engineer @AWS. Kubernetes, Docker, Terraform.",
        "followers": 1567,
        "posts": ["Kubernetes best practices", "Infrastructure as code"]
    }
]

def mock_step3_discover_x_users(topics, search_queries, max_per_query=10):
    """Mock X user discovery"""
    print(f"🐦 Searching X for users posting about: {', '.join(topics)}")
    
    # Filter users based on topics (simple keyword matching)
    relevant_users = []
    for user in MOCK_X_USERS:
        bio_lower = user['bio'].lower()
        posts_text = ' '.join(user['posts']).lower()
        
        # Check if any topic appears in bio or posts
        for topic in topics:
            if topic.lower() in bio_lower or topic.lower() in posts_text:
                relevant_users.append(user)
                break
    
    print(f"✅ Found {len(relevant_users)} relevant users")
    return relevant_users

def mock_step4_verify_developers(x_users, job_title):
    """Mock developer verification"""
    print(f"🤖 Verifying {len(x_users)} users are developers for {job_title}")
    
    # Simple verification based on bio keywords
    dev_keywords = ['developer', 'engineer', 'programmer', 'coder', 'architect']
    verified = []
    
    for user in x_users:
        bio_lower = user['bio'].lower()
        if any(keyword in bio_lower for keyword in dev_keywords):
            user['classification'] = {
                'is_developer': True,
                'role_type': 'software_engineer',
                'confidence': random.uniform(0.7, 0.95)
            }
            verified.append(user)
    
    print(f"✅ Verified {len(verified)} developers")
    return verified

def mock_step6_score_candidates(candidates, job_title, job_description):
    """Mock compatibility scoring"""
    print(f"📊 Scoring {len(candidates)} candidates for {job_title}")
    
    scored = []
    for candidate in candidates:
        # Simple scoring based on bio relevance and follower count
        bio = candidate['bio'].lower()
        
        # Base score from bio keywords
        score = 50
        if 'senior' in bio:
            score += 20
        if 'react' in bio and 'react' in job_description.lower():
            score += 15
        if 'python' in bio and 'python' in job_description.lower():
            score += 15
        if 'fastapi' in bio and 'fastapi' in job_description.lower():
            score += 10
        
        # Follower influence (small boost)
        if candidate['followers'] > 2000:
            score += 10
        elif candidate['followers'] > 1000:
            score += 5
        
        # Add some randomness
        score += random.randint(-10, 10)
        score = max(0, min(100, score))  # Clamp to 0-100
        
        candidate['compatibility'] = {
            'compatibility_score': score,
            'reasoning': f"Score based on bio relevance, experience level, and social proof. Bio mentions relevant technologies."
        }
        
        scored.append(candidate)
        print(f"  📈 {candidate['name']}: {score}/100")
    
    return scored

async def demo_sourcing_pipeline():
    """Run a demo of the sourcing pipeline"""
    print("🚀 Starting Sourcing Agent Demo")
    print("=" * 50)
    
    # Initialize database
    init_db()
    
    # Job details
    job_id = 999  # Demo job
    job_title = "Senior Full-Stack Engineer"
    job_description = "We need a Python developer with FastAPI and React experience to build scalable web applications."
    
    print(f"📋 Job: {job_title}")
    print(f"📝 Description: {job_description}")
    print()
    
    agent = SourcingAgent()
    
    # Step 1: Skip embedding (would need OpenAI API)
    print("📊 Step 1: Job Embedding (Skipped - would generate 1536-dim vector)")
    
    # Step 2: Mock topic discovery
    print("🔍 Step 2: Topic Discovery")
    topics = ["python", "fastapi", "react", "full-stack", "web development"]
    search_queries = ["Python FastAPI", "React developer", "full-stack engineer"]
    print(f"✅ Topics: {topics}")
    print(f"✅ Search Queries: {search_queries}")
    print()
    
    # Step 3: Mock X user discovery
    print("🐦 Step 3: X User Discovery")
    x_users = mock_step3_discover_x_users(topics, search_queries)
    print()
    
    # Step 4: Mock developer verification
    print("🤖 Step 4: Developer Verification")
    verified_devs = mock_step4_verify_developers(x_users, job_title)
    print()
    
    # Step 5: Mock LinkedIn enrichment
    print("💼 Step 5: LinkedIn Enrichment")
    for dev in verified_devs:
        dev['linkedin_data'] = {
            'headline': f"{dev['bio'].split('.')[0]}",
            'experience': f"5+ years in software development",
            'has_linkedin': True
        }
    print(f"✅ Enriched {len(verified_devs)} profiles")
    print()
    
    # Step 6: Mock compatibility scoring
    print("🎯 Step 6: Compatibility Scoring")
    scored_candidates = mock_step6_score_candidates(verified_devs, job_title, job_description)
    print()
    
    # Step 7: Apply thresholds (use real agent method)
    print("📊 Step 7: Candidate Routing")
    routed = await agent.step7_apply_thresholds(scored_candidates, job_id)
    
    print()
    print("🎉 SOURCING COMPLETE!")
    print("=" * 50)
    print(f"📈 Results Summary:")
    print(f"   🚀 Fast-track: {len(routed['fasttrack'])} candidates")
    print(f"   🎯 Interview: {len(routed['interview'])} candidates") 
    print(f"   📝 Take-home: {len(routed['takehome'])} candidates")
    print(f"   ❌ Reject: {len(routed['reject'])} candidates")
    
    print(f"\n📧 Total candidates to reach out: {len(routed['fasttrack']) + len(routed['interview']) + len(routed['takehome'])}")
    
    # Show top candidates
    all_candidates = routed['fasttrack'] + routed['interview'] + routed['takehome']
    if all_candidates:
        print(f"\n🏆 Top Candidates:")
        sorted_candidates = sorted(all_candidates, key=lambda x: x['compatibility']['compatibility_score'], reverse=True)
        for i, candidate in enumerate(sorted_candidates[:3], 1):
            score = candidate['compatibility']['compatibility_score']
            recommendation = candidate['recommendation']
            print(f"   {i}. {candidate['name']} - {score}/100 ({recommendation})")
            print(f"      Bio: {candidate['bio'][:60]}...")

if __name__ == "__main__":
    asyncio.run(demo_sourcing_pipeline())