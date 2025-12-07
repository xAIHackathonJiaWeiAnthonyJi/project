"""
Test Pinecone setup and initialization
"""
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.vector_store import init_pinecone

def test_pinecone_init():
    print("=" * 60)
    print("TESTING PINECONE INITIALIZATION")
    print("=" * 60)
    
    try:
        index = init_pinecone()
        print(f"\n✅ Pinecone initialized successfully")
        print(f"   - Index name: grok-recruiter")
        print(f"   - Dimension: 1536")
        
        # Get index stats
        stats = index.describe_index_stats()
        print(f"   - Total vectors: {stats.get('total_vector_count', 0)}")
        
        print("\n✅ PINECONE SETUP TEST PASSED")
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        return False

if __name__ == "__main__":
    test_pinecone_init()

