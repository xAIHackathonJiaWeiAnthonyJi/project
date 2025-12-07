"""
Test FULL PIPELINE: Steps 1-7 End-to-End
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.sourcing_agent import SourcingAgent

async def test_full_pipeline():
    print("=" * 70)
    print("TESTING FULL SOURCING PIPELINE (Steps 1-7)")
    print("=" * 70)
    
    agent = SourcingAgent()
    
    # Test job
    job_id = 999  # Test job ID
    job_title = "Senior ML Engineer"
    job_description = """
    We are looking for an experienced Machine Learning Engineer to join our team.
    
    Requirements:
    - 5+ years of experience with Python and ML frameworks (PyTorch, TensorFlow)
    - Strong understanding of LLM inference and optimization
    - Experience with distributed training and GPU programming
    - Excellent communication skills
    
    Responsibilities:
    - Build and optimize ML inference pipelines
    - Work on transformer model optimization
    - Collaborate with research team on new architectures
    """
    
    print(f"\n📋 Job: {job_title}")
    print(f"📋 Job ID: {job_id}")
    print(f"📋 Description: {job_description[:100]}...")
    
    # Run full pipeline
    print(f"\n🚀 Starting full sourcing pipeline...")
    print("=" * 70)
    
    result = await agent.run_full_pipeline(job_id, job_title, job_description)
    
    print("\n" + "=" * 70)
    print("📊 PIPELINE RESULTS")
    print("=" * 70)
    
    print(f"\n✅ Status: {result['status']}")
    print(f"\n📈 Funnel Metrics:")
    print(f"   X Users Found: {result['x_users_found']}")
    print(f"   Verified Developers: {result['verified_developers']}")
    print(f"   Scored Candidates: {result['scored_candidates']}")
    print(f"   Candidates to Reach Out: {result['reach_out_count']}")
    
    routed = result['routed_candidates']
    print(f"\n🎯 Routing Breakdown:")
    print(f"   Fast-track: {len(routed['fasttrack'])} (score ≥ 90)")
    print(f"   Interview: {len(routed['interview'])} (score 75-89)")
    print(f"   Take-home: {len(routed['takehome'])} (score 40-74)")
    print(f"   Reject: {len(routed['reject'])} (score < 40)")
    
    # Show candidates we'll reach out to
    all_outreach = routed['fasttrack'] + routed['interview'] + routed['takehome']
    
    print(f"\n📧 Candidates to Reach Out ({len(all_outreach)}):")
    for i, candidate in enumerate(all_outreach[:5], 1):
        compat = candidate.get('compatibility', {})
        print(f"\n   {i}. @{candidate['username']} - {candidate.get('name', 'Unknown')}")
        print(f"      Score: {compat.get('compatibility_score', 0)}/100")
        print(f"      Recommendation: {candidate.get('recommendation', 'unknown').upper()}")
        print(f"      Role: {candidate.get('classification', {}).get('role_type', 'unknown')}")
        print(f"      Strengths: {', '.join(compat.get('strengths', [])[:2])}")
    
    # Validate
    assert result['status'].startswith('✅'), "Pipeline should complete successfully"
    assert result['x_users_found'] > 0, "Should find X users"
    
    print("\n" + "=" * 70)
    print("✅ FULL PIPELINE TEST PASSED")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(test_full_pipeline())

