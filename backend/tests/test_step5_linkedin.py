"""
Test STEP 5: Experience Validation (LinkedIn Mock)
"""
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.sourcing_agent import SourcingAgent

def test_step5():
    print("=" * 60)
    print("TESTING STEP 5: LinkedIn Profile Lookup (Mock)")
    print("=" * 60)
    
    agent = SourcingAgent()
    
    # Test data: verified developers from Step 4
    verified_developers = [
        {
            "username": "mleng_sarah",
            "name": "Sarah Chen",
            "bio": "ML Engineer building LLM systems",
            "classification": {
                "is_developer": True,
                "role_type": "ml_engineer",
                "confidence": 95
            }
        },
        {
            "username": "backend_alex",
            "name": "Alex Rivera",
            "bio": "Backend engineer, Python & Go",
            "classification": {
                "is_developer": True,
                "role_type": "backend",
                "confidence": 90
            }
        },
        {
            "username": "unknown_dev",
            "name": "Unknown Developer",
            "bio": "Frontend developer",
            "classification": {
                "is_developer": True,
                "role_type": "frontend",
                "confidence": 85
            }
        }
    ]
    
    print(f"\n📝 Testing {len(verified_developers)} developers")
    
    # Enrich with LinkedIn
    print("\n💼 Enriching with LinkedIn data...")
    print("-" * 60)
    enriched = agent.enrich_with_linkedin(verified_developers)
    
    print(f"\n✅ Enrichment Complete:")
    print(f"   Total: {len(enriched)} candidates")
    
    # Show results
    for i, candidate in enumerate(enriched, 1):
        print(f"\n{i}. @{candidate['username']}")
        print(f"   Name: {candidate.get('name')}")
        print(f"   Has LinkedIn: {candidate['has_linkedin']}")
        
        linkedin = candidate.get('linkedin_data', {})
        print(f"   LinkedIn Headline: {linkedin.get('headline')}")
        print(f"   Experience: {linkedin.get('years_of_experience')} years")
        
        if linkedin.get('experience'):
            exp = linkedin['experience'][0]
            print(f"   Current Role: {exp.get('title')} @ {exp.get('company')}")
        
        if linkedin.get('skills'):
            skills = linkedin.get('skills', [])
            print(f"   Skills: {', '.join(skills[:3])}")
    
    # Validate
    assert len(enriched) == len(verified_developers), "All developers should be enriched"
    assert all('linkedin_data' in c for c in enriched), "All should have linkedin_data"
    
    print("\n\n✅ STEP 5 TEST PASSED")

if __name__ == "__main__":
    test_step5()

