"""
Test STEP 4: X Users → Role Verification
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.grok_role_service import verify_developer_role, verify_developers_batch

async def test_step4():
    print("=" * 60)
    print("TESTING STEP 4: Role Verification with Grok AI")
    print("=" * 60)
    
    # Test single user verification
    print("\n🔍 Test 1: Single User Verification")
    print("-" * 60)
    
    test_user = {
        "username": "test_ml_engineer",
        "bio": "ML Engineer @OpenAI. Working on LLM inference optimization. PyTorch enthusiast.",
        "signals": [
            {"text": "Just optimized our transformer inference pipeline - 2x speedup!"},
            {"text": "Working on distributed training with PyTorch DDP"},
            {"text": "New blog post: Fine-tuning LLMs efficiently"}
        ]
    }
    
    print(f"Username: @{test_user['username']}")
    print(f"Bio: {test_user['bio']}")
    print(f"Recent Posts: {len(test_user['signals'])}")
    
    classification = await verify_developer_role(
        username=test_user['username'],
        bio=test_user['bio'],
        recent_posts=[s['text'] for s in test_user['signals']],
        job_title="Senior ML Engineer"
    )
    
    if classification:
        print(f"\n✅ Classification Result:")
        print(f"   Is Developer: {classification['is_developer']}")
        print(f"   Role Type: {classification['role_type']}")
        print(f"   Confidence: {classification['confidence']}%")
        print(f"   Reasoning: {classification['reasoning']}")
        print(f"   Signals: {', '.join(classification['signals'])}")
    else:
        print(f"\n❌ Not classified as a developer")
    
    # Test batch verification
    print("\n\n🔍 Test 2: Batch Verification")
    print("-" * 60)
    
    test_users = [
        {
            "username": "ml_dev",
            "bio": "Machine Learning Engineer. Building LLM systems.",
            "signals": [{"text": "Working on PyTorch optimization"}]
        },
        {
            "username": "backend_dev",
            "bio": "Backend Engineer @Stripe. Python, Go, PostgreSQL.",
            "signals": [{"text": "Just deployed our new API with FastAPI"}]
        },
        {
            "username": "random_user",
            "bio": "Marketing professional. Love coffee and travel.",
            "signals": [{"text": "Great coffee this morning!"}]
        }
    ]
    
    print(f"Testing {len(test_users)} users...")
    
    verified = await verify_developers_batch(test_users, "Senior Backend Engineer")
    
    print(f"\n✅ Verification Complete:")
    print(f"   Total Users: {len(test_users)}")
    print(f"   Verified Developers: {len(verified)}")
    
    for dev in verified:
        print(f"\n   @{dev['username']}")
        print(f"      Role: {dev['classification']['role_type']}")
        print(f"      Confidence: {dev['classification']['confidence']}%")
    
    # Validate
    assert classification is not None, "Single user verification failed"
    assert classification['is_developer'] == True, "Test user should be classified as developer"
    
    print("\n\n✅ STEP 4 TEST PASSED")

if __name__ == "__main__":
    asyncio.run(test_step4())

