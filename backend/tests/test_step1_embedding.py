"""
Test STEP 1: Job Description → Embedding
"""
import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.sourcing_agent import SourcingAgent

async def test_step1():
    print("=" * 60)
    print("TESTING STEP 1: Job Description → Embedding")
    print("=" * 60)
    
    agent = SourcingAgent()
    
    # Test job
    job_id = 1
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
    
    # Run Step 1
    embedding, embedding_id = await agent.step1_generate_job_embedding(
        job_id, job_title, job_description
    )
    
    print(f"\n✅ Embedding Generated:")
    print(f"   - Embedding ID: {embedding_id}")
    print(f"   - Vector dimension: {len(embedding)}")
    print(f"   - First 5 values: {embedding[:5]}")
    
    print("\n✅ STEP 1 TEST PASSED")

if __name__ == "__main__":
    asyncio.run(test_step1())

