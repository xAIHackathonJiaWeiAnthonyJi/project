from pinecone import Pinecone, ServerlessSpec
from typing import List, Dict, Optional
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize Pinecone client
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

# Index name
INDEX_NAME = "grok-recruiter"

def init_pinecone():
    """Initialize Pinecone index if it doesn't exist"""
    try:
        # Check if index exists
        if INDEX_NAME not in pc.list_indexes().names():
            # Create index with 1536 dimensions (OpenAI text-embedding-3-small)
            pc.create_index(
                name=INDEX_NAME,
                dimension=1536,
                metric="cosine",
                spec=ServerlessSpec(
                    cloud="aws",
                    region="us-east-1"  # Free tier region
                )
            )
            print(f"✅ Created Pinecone index: {INDEX_NAME}")
        
        return pc.Index(INDEX_NAME)
    except Exception as e:
        print(f"⚠️ Pinecone initialization error: {e}")
        raise

def get_index():
    """Get Pinecone index (lazy loading)"""
    return pc.Index(INDEX_NAME)

def store_job_embedding(job_id: int, embedding: List[float], metadata: Dict) -> str:
    """
    Store job embedding in Pinecone
    
    Returns:
        Embedding ID (string)
    """
    index = get_index()
    embedding_id = f"job_{job_id}"
    
    # Pinecone upsert format
    index.upsert(
        vectors=[{
            "id": embedding_id,
            "values": embedding,
            "metadata": {
                "type": "job",
                "job_id": job_id,
                **metadata
            }
        }]
    )
    return embedding_id

def search_similar_jobs(embedding: List[float], top_k: int = 5) -> List[Dict]:
    """
    Find similar jobs based on embedding
    """
    index = get_index()
    results = index.query(
        vector=embedding,
        top_k=top_k,
        filter={"type": "job"},
        include_metadata=True
    )
    return results

def store_candidate_embedding(candidate_id: int, embedding: List[float], metadata: Dict) -> str:
    """
    Store candidate embedding in Pinecone
    """
    index = get_index()
    embedding_id = f"candidate_{candidate_id}"
    
    index.upsert(
        vectors=[{
            "id": embedding_id,
            "values": embedding,
            "metadata": {
                "type": "candidate",
                "candidate_id": candidate_id,
                **metadata
            }
        }]
    )
    return embedding_id

