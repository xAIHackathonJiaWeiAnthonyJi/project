import os
from typing import Dict, List, Optional
from xdk import XClient
from dotenv import load_dotenv

load_dotenv()

# X API credentials
X_API_KEY = os.getenv("X_API_KEY")
X_API_SECRET = os.getenv("X_API_SECRET")
X_ACCESS_TOKEN = os.getenv("X_ACCESS_TOKEN")
X_ACCESS_TOKEN_SECRET = os.getenv("X_ACCESS_TOKEN_SECRET")
X_BEARER_TOKEN = os.getenv("X_BEARER_TOKEN")

class XService:
    """Service for interacting with X (Twitter) API using the official X SDK"""
    
    def __init__(self):
        self.client = None
        if X_BEARER_TOKEN:
            self.client = XClient(bearer_token=X_BEARER_TOKEN)
        elif all([X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET]):
            self.client = XClient(
                api_key=X_API_KEY,
                api_secret=X_API_SECRET,
                access_token=X_ACCESS_TOKEN,
                access_token_secret=X_ACCESS_TOKEN_SECRET
            )
    
    def is_configured(self) -> bool:
        """Check if X API credentials are properly configured"""
        return self.client is not None
    
    async def search_tweets_by_hashtag(self, hashtag: str, max_results: int = 10) -> List[Dict]:
        """
        Search for tweets by hashtag
        
        Args:
            hashtag: The hashtag to search for (without #)
            max_results: Maximum number of tweets to return
            
        Returns:
            List of tweet dictionaries with relevant information
        """
        if not self.is_configured():
            return []
        
        try:
            query = f"#{hashtag} -is:retweet"
            response = await self.client.search_recent_tweets(
                query=query,
                max_results=max_results,
                tweet_fields=['created_at', 'author_id', 'public_metrics', 'context_annotations']
            )
            
            tweets = []
            if response.data:
                for tweet in response.data:
                    tweets.append({
                        'id': tweet.id,
                        'text': tweet.text,
                        'created_at': tweet.created_at,
                        'author_id': tweet.author_id,
                        'public_metrics': tweet.public_metrics,
                        'context_annotations': getattr(tweet, 'context_annotations', [])
                    })
            
            return tweets
        except Exception as e:
            print(f"Error searching tweets: {e}")
            return []
    
    async def search_users_by_keyword(self, keyword: str, max_results: int = 10) -> List[Dict]:
        """
        Search for users by keyword in their bio/description
        
        Args:
            keyword: The keyword to search for
            max_results: Maximum number of users to return
            
        Returns:
            List of user dictionaries with relevant information
        """
        if not self.is_configured():
            return []
        
        try:
            # Search for tweets containing the keyword and get unique users
            query = f"{keyword} -is:retweet"
            response = await self.client.search_recent_tweets(
                query=query,
                max_results=max_results,
                tweet_fields=['author_id'],
                expansions=['author_id'],
                user_fields=['username', 'name', 'description', 'public_metrics', 'location']
            )
            
            users = []
            if response.includes and 'users' in response.includes:
                for user in response.includes['users']:
                    users.append({
                        'id': user.id,
                        'username': user.username,
                        'name': user.name,
                        'description': user.description,
                        'location': getattr(user, 'location', None),
                        'public_metrics': user.public_metrics
                    })
            
            return users
        except Exception as e:
            print(f"Error searching users: {e}")
            return []
    
    async def get_user_tweets(self, username: str, max_results: int = 10) -> List[Dict]:
        """
        Get recent tweets from a specific user
        
        Args:
            username: The username (without @)
            max_results: Maximum number of tweets to return
            
        Returns:
            List of tweet dictionaries
        """
        if not self.is_configured():
            return []
        
        try:
            # First get user by username
            user_response = await self.client.get_user_by_username(username)
            if not user_response.data:
                return []
            
            user_id = user_response.data.id
            
            # Get user's tweets
            tweets_response = await self.client.get_users_tweets(
                user_id,
                max_results=max_results,
                tweet_fields=['created_at', 'public_metrics', 'context_annotations']
            )
            
            tweets = []
            if tweets_response.data:
                for tweet in tweets_response.data:
                    tweets.append({
                        'id': tweet.id,
                        'text': tweet.text,
                        'created_at': tweet.created_at,
                        'public_metrics': tweet.public_metrics,
                        'context_annotations': getattr(tweet, 'context_annotations', [])
                    })
            
            return tweets
        except Exception as e:
            print(f"Error getting user tweets: {e}")
            return []
    
    async def find_tech_talent(self, skills: List[str], location: Optional[str] = None) -> List[Dict]:
        """
        Find potential tech talent based on skills and location
        
        Args:
            skills: List of technical skills to search for
            location: Optional location filter
            
        Returns:
            List of potential candidates with their information
        """
        if not self.is_configured():
            return []
        
        candidates = []
        
        for skill in skills[:3]:  # Limit to first 3 skills to avoid rate limits
            # Create search query
            query = f"{skill} developer OR {skill} engineer"
            if location:
                query += f" {location}"
            query += " -is:retweet"
            
            try:
                response = await self.client.search_recent_tweets(
                    query=query,
                    max_results=20,
                    tweet_fields=['author_id', 'created_at'],
                    expansions=['author_id'],
                    user_fields=['username', 'name', 'description', 'location', 'public_metrics']
                )
                
                if response.includes and 'users' in response.includes:
                    for user in response.includes['users']:
                        # Filter users who mention relevant skills in their bio
                        bio = (user.description or "").lower()
                        if any(skill.lower() in bio for skill in skills):
                            candidate = {
                                'id': user.id,
                                'username': user.username,
                                'name': user.name,
                                'description': user.description,
                                'location': getattr(user, 'location', None),
                                'followers_count': user.public_metrics.get('followers_count', 0),
                                'following_count': user.public_metrics.get('following_count', 0),
                                'tweet_count': user.public_metrics.get('tweet_count', 0),
                                'matched_skills': [s for s in skills if s.lower() in bio],
                                'source_skill': skill
                            }
                            candidates.append(candidate)
            
            except Exception as e:
                print(f"Error searching for {skill} talent: {e}")
                continue
        
        # Remove duplicates and sort by relevance
        unique_candidates = {}
        for candidate in candidates:
            if candidate['id'] not in unique_candidates:
                unique_candidates[candidate['id']] = candidate
            else:
                # Merge matched skills
                existing = unique_candidates[candidate['id']]
                existing['matched_skills'] = list(set(existing['matched_skills'] + candidate['matched_skills']))
        
        # Sort by number of matched skills and follower count
        sorted_candidates = sorted(
            unique_candidates.values(),
            key=lambda x: (len(x['matched_skills']), x['followers_count']),
            reverse=True
        )
        
        return sorted_candidates[:20]  # Return top 20 candidates

# Global instance
x_service = XService()