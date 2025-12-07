"""
X (Twitter) API v2 Service for Step 3: Topic → Active X Users

Uses X API v2 Premium tier to search for users posting about specific topics
"""
import os
import tweepy
from typing import List, Dict, Optional
from dotenv import load_dotenv

load_dotenv()

def get_x_client():
    """Initialize X API v2 client with Bearer Token"""
    bearer_token = os.getenv("X_BEARER_TOKEN")
    if not bearer_token:
        raise ValueError("X_BEARER_TOKEN not found in environment variables")
    
    return tweepy.Client(
        bearer_token=bearer_token,
        consumer_key=os.getenv("X_CONSUMER_KEY"),
        consumer_secret=os.getenv("X_CONSUMER_SECRET"),
        access_token=os.getenv("X_ACCESS_TOKEN"),
        access_token_secret=os.getenv("X_ACCESS_TOKEN_SECRET"),
        wait_on_rate_limit=True
    )

def search_recent_tweets(query: str, max_results: int = 10) -> List[Dict]:
    """
    Search recent tweets for a specific query
    
    Args:
        query: Search query (X API query syntax)
        max_results: Number of tweets to return (10-100 for Premium)
        
    Returns:
        List of tweet data with user info
    """
    try:
        client = get_x_client()
        
        # Search recent tweets
        response = client.search_recent_tweets(
            query=query,
            max_results=max_results,
            tweet_fields=['created_at', 'public_metrics', 'author_id'],
            user_fields=['username', 'name', 'description', 'public_metrics', 'verified'],
            expansions=['author_id']
        )
        
        if not response.data:
            return []
        
        # Build user lookup
        users = {user.id: user for user in (response.includes.get('users', []) or [])}
        
        # Format results
        results = []
        for tweet in response.data:
            user = users.get(tweet.author_id)
            if not user:
                continue
                
            results.append({
                'tweet_id': tweet.id,
                'tweet_text': tweet.text,
                'created_at': str(tweet.created_at),
                'user_id': user.id,
                'username': user.username,
                'name': user.name,
                'bio': user.description or "",
                'followers': user.public_metrics.get('followers_count', 0),
                'following': user.public_metrics.get('following_count', 0),
                'verified': user.verified or False,
                'engagement': {
                    'retweets': tweet.public_metrics.get('retweet_count', 0),
                    'likes': tweet.public_metrics.get('like_count', 0),
                    'replies': tweet.public_metrics.get('reply_count', 0)
                }
            })
        
        return results
        
    except Exception as e:
        print(f"⚠️ X API error: {e}")
        return []

def discover_users_from_topics(topics: List[str], queries: List[str], max_per_query: int = 10) -> List[Dict]:
    """
    Search X for users posting about specific topics
    
    Args:
        topics: List of topic strings
        queries: List of search queries
        max_per_query: Max results per query
        
    Returns:
        List of unique users with their signals
    """
    all_users = {}
    
    # Try specific queries first
    for query in queries[:3]:  # Limit to 3 queries to avoid rate limits
        print(f"🔍 Searching X for: {query}")
        tweets = search_recent_tweets(query, max_results=max_per_query)
        
        if tweets:
            print(f"  ✅ Found {len(tweets)} tweets")
        else:
            print(f"  ⚠️ No results, trying broader query...")
        
        # Deduplicate users
        for tweet in tweets:
            username = tweet['username']
            if username not in all_users:
                all_users[username] = {
                    'username': username,
                    'name': tweet['name'],
                    'bio': tweet['bio'],
                    'followers': tweet['followers'],
                    'following': tweet['following'],
                    'verified': tweet['verified'],
                    'signals': []  # Behavioral signals
                }
            
            # Add signal
            all_users[username]['signals'].append({
                'type': 'post',
                'text': tweet['tweet_text'],
                'engagement': tweet['engagement'],
                'created_at': tweet['created_at'],
                'topic': query
            })
    
    # If we found very few users, try broader fallback queries
    if len(all_users) < 5:
        print(f"⚠️ Only found {len(all_users)} users, trying broader fallback queries...")
        
        # Extract key terms from topics
        fallback_queries = []
        for topic in topics[:2]:
            # Extract first 1-2 words as broader search
            words = topic.lower().split()[:2]
            fallback_queries.append(' '.join(words))
        
        for query in fallback_queries:
            print(f"🔍 Fallback search: {query}")
            tweets = search_recent_tweets(query, max_results=max_per_query)
            
            if tweets:
                print(f"  ✅ Found {len(tweets)} tweets")
            
            for tweet in tweets:
                username = tweet['username']
                if username not in all_users:
                    all_users[username] = {
                        'username': username,
                        'name': tweet['name'],
                        'bio': tweet['bio'],
                        'followers': tweet['followers'],
                        'following': tweet['following'],
                        'verified': tweet['verified'],
                        'signals': []
                    }
                
                all_users[username]['signals'].append({
                    'type': 'post',
                    'text': tweet['tweet_text'],
                    'engagement': tweet['engagement'],
                    'created_at': tweet['created_at'],
                    'topic': query
                })
    
    return list(all_users.values())

def get_user_by_username(username: str) -> Optional[Dict]:
    """
    Get detailed user profile by username
    
    Args:
        username: X username (without @)
        
    Returns:
        User profile dict
    """
    try:
        client = get_x_client()
        
        user = client.get_user(
            username=username,
            user_fields=['description', 'public_metrics', 'verified', 'created_at']
        )
        
        if not user.data:
            return None
        
        u = user.data
        return {
            'user_id': u.id,
            'username': u.username,
            'name': u.name,
            'bio': u.description or "",
            'followers': u.public_metrics.get('followers_count', 0),
            'following': u.public_metrics.get('following_count', 0),
            'verified': u.verified or False,
            'account_created': str(u.created_at)
        }
        
    except Exception as e:
        print(f"⚠️ Error fetching user {username}: {e}")
        return None

