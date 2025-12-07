"""
Test STEP 2: Embedding → Topic Discovery
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.grok_topic_service import discover_topics_from_job

async def test_step2():
    print("=" * 60)
    print("TESTING STEP 2: Topic Discovery with Grok AI")
    print("=" * 60)
    
    # Test job
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
    
    print(f"\n📝 Job Title: {job_title}")
    print(f"📝 Job Description: {job_description[:100]}...")
    
    # Run Step 2
    print(f"\n🤖 Calling Grok API...")
    topic_data = await discover_topics_from_job(job_title, job_description)
    
    print(f"\n✅ Topic Discovery Complete:")
    print(f"\n🏷️  Topics ({len(topic_data['topics'])}):")
    for i, topic in enumerate(topic_data['topics'], 1):
        print(f"   {i}. {topic}")
    
    print(f"\n🔍 Search Queries ({len(topic_data['search_queries'])}):")
    for i, query in enumerate(topic_data['search_queries'], 1):
        print(f"   {i}. {query}")
    
    # Validate
    assert len(topic_data['topics']) > 0, "No topics generated"
    assert len(topic_data['search_queries']) > 0, "No search queries generated"
    
    print("\n✅ STEP 2 TEST PASSED")

if __name__ == "__main__":
    asyncio.run(test_step2())

