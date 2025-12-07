import os
from typing import List
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

def get_client():
    """Lazy load OpenAI client"""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY not found in environment variables")
    return OpenAI(api_key=api_key)

def generate_embedding(text: str, model: str = "text-embedding-3-small") -> List[float]:
    """
    Generate vector embedding using OpenAI
    
    Args:
        text: Text to embed
        model: OpenAI embedding model
        
    Returns:
        List of floats representing the embedding vector
    """
    client = get_client()
    response = client.embeddings.create(
        input=text,
        model=model
    )
    return response.data[0].embedding

def generate_embeddings_batch(texts: List[str], model: str = "text-embedding-3-small") -> List[List[float]]:
    """
    Generate embeddings for multiple texts in one API call
    
    Args:
        texts: List of texts to embed
        model: OpenAI embedding model
        
    Returns:
        List of embedding vectors
    """
    client = get_client()
    response = client.embeddings.create(
        input=texts,
        model=model
    )
    return [item.embedding for item in response.data]

