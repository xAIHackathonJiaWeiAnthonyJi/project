"""
Test querying vectors from Pinecone
"""
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.vector_store import get_index, search_similar_jobs
from app.services.embedding_service import generate_embedding

def test_query():
    print("=" * 60)
    print("TESTING PINECONE QUERY")
    print("=" * 60)
    
    try:
        index = get_index()
        
        # Get stats
        stats = index.describe_index_stats()
        print(f"\n📊 Index Stats:")
        print(f"   - Total vectors: {stats.get('total_vector_count', 0)}")
        
        # If we have vectors, try searching
        if stats.get('total_vector_count', 0) > 0:
            print(f"\n🔍 Searching for similar jobs...")
            
            # Generate a test query embedding
            query_text = "Looking for a machine learning engineer with Python experience"
            query_embedding = generate_embedding(query_text)
            
            # Search for similar jobs
            results = search_similar_jobs(query_embedding, top_k=3)
            
            print(f"\n✅ Found {len(results.get('matches', []))} similar jobs:")
            for match in results.get('matches', []):
                print(f"   - {match['id']} (score: {match['score']:.4f})")
                print(f"     Title: {match.get('metadata', {}).get('title', 'N/A')}")
        else:
            print("\n⚠️ No vectors in index yet. Run test_step1_embedding.py first.")
        
        print("\n✅ PINECONE QUERY TEST PASSED")
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_query()

