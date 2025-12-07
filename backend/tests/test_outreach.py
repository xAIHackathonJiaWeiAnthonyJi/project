"""
Test X Outreach Service
"""
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.x_outreach_service import generate_outreach_message, send_outreach_batch

def test_outreach():
    print("=" * 60)
    print("TESTING X OUTREACH SERVICE")
    print("=" * 60)
    
    # Test message generation
    print("\n📝 Test 1: Message Generation")
    print("-" * 60)
    
    message = generate_outreach_message(
        candidate_name="Sarah Chen",
        job_title="Senior ML Engineer",
        job_link="https://jobs.example.com/ml-engineer",
        recommendation="fasttrack",
        compatibility_score=92
    )
    
    print(f"Fast-track message:\n{message}\n")
    
    # Test batch outreach (dry run)
    print("\n📧 Test 2: Batch Outreach (Dry Run)")
    print("-" * 60)
    
    test_candidates = [
        {
            "username": "ml_dev",
            "name": "Alice Johnson",
            "recommendation": "fasttrack",
            "compatibility": {"compatibility_score": 92}
        },
        {
            "username": "backend_dev",
            "name": "Bob Smith",
            "recommendation": "interview",
            "compatibility": {"compatibility_score": 78}
        },
        {
            "username": "junior_dev",
            "name": "Charlie Brown",
            "recommendation": "takehome",
            "compatibility": {"compatibility_score": 55}
        },
        {
            "username": "weak_match",
            "name": "David Lee",
            "recommendation": "reject",
            "compatibility": {"compatibility_score": 30}
        }
    ]
    
    results = send_outreach_batch(
        candidates=test_candidates,
        job_title="Senior ML Engineer",
        job_link="https://jobs.example.com/ml-engineer",
        dry_run=True
    )
    
    print(f"\n✅ Results:")
    print(f"   Sent: {results['sent']}")
    print(f"   Failed: {results['failed']}")
    print(f"   Total processed: {len(results['results'])}")
    
    print(f"\n📊 Breakdown:")
    for result in results['results']:
        status = "✅" if result['success'] else "❌"
        print(f"   {status} @{result['username']} - {result['recommendation']}")
    
    # Validate
    assert results['sent'] == 3, "Should send to 3 candidates (not rejected one)"
    assert results['failed'] == 0, "Dry run should not fail"
    
    print("\n✅ OUTREACH TEST PASSED")

if __name__ == "__main__":
    test_outreach()

