"""
Test STEP 3: Topic → X Users Discovery
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.x_api_service import discover_users_from_topics, search_recent_tweets

async def test_step3():
    print("=" * 60)
    print("TESTING STEP 3: X User Discovery")
    print("=" * 60)
    
    # Test topics from Step 2
    topics = [
        "LLM inference optimization",
        "transformer model training",
        "distributed GPU training"
    ]
    
    queries = [
        "optimizing LLM inference",
        "transformer model tips",
        "distributed training GPU"
    ]
    
    print(f"\n📝 Topics: {topics}")
    print(f"📝 Search Queries: {queries}")
    
    # Test single query first
    print(f"\n🔍 Testing single query search...")
    test_query = queries[0]
    tweets = search_recent_tweets(test_query, max_results=10)
    print(f"✅ Found {len(tweets)} tweets for '{test_query}'")
    
    if tweets:
        print(f"\n📊 Sample Tweet:")
        tweet = tweets[0]
        print(f"   User: @{tweet['username']} ({tweet['name']})")
        print(f"   Bio: {tweet['bio'][:100]}...")
        print(f"   Followers: {tweet['followers']}")
        print(f"   Tweet: {tweet['tweet_text'][:100]}...")
    
    # Test full user discovery
    print(f"\n🐦 Discovering users from all topics...")
    users = discover_users_from_topics(topics, queries, max_per_query=10)
    
    print(f"\n✅ Found {len(users)} unique users")
    print(f"\n👥 Top Users:")
    for i, user in enumerate(users[:3], 1):
        print(f"\n   {i}. @{user['username']}")
        print(f"      Name: {user['name']}")
        print(f"      Bio: {user['bio'][:80]}...")
        print(f"      Followers: {user['followers']}")
        print(f"      Signals: {len(user['signals'])} posts")
    
    # Validate
    assert len(users) > 0, "No users discovered"
    
    print("\n✅ STEP 3 TEST PASSED")

if __name__ == "__main__":
    asyncio.run(test_step3())

