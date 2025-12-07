import os
import httpx
import secrets
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse
from urllib.parse import urlencode
from dotenv import load_dotenv

load_dotenv()

X_CLIENT_ID = os.getenv("X_CLIENT_ID")
X_CLIENT_SECRET = os.getenv("X_CLIENT_SECRET")
REDIRECT_URI = "http://localhost:8000/api/auth/callback"

router = APIRouter()

# Store state temporarily (in production, use a proper database)
auth_states = {}

@router.get("/login")
async def login():
    """Start OAuth 2.0 flow to get user access token for DMs"""
    if not X_CLIENT_ID:
        raise HTTPException(status_code=503, detail="X_CLIENT_ID not configured")
    
    # Generate state for security
    state = secrets.token_urlsafe(32)
    auth_states[state] = True
    
    # OAuth 2.0 authorization URL
    params = {
        "response_type": "code",
        "client_id": X_CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "scope": "users.read dm.read dm.write",
        "state": state,
        "code_challenge": "challenge",  # For PKCE (simplified)
        "code_challenge_method": "plain"
    }
    
    auth_url = f"https://x.com/i/oauth2/authorize?{urlencode(params)}"
    
    return {
        "message": "Visit this URL to authorize the app",
        "auth_url": auth_url,
        "instructions": "After authorizing, you'll be redirected back and get your access token"
    }

@router.get("/callback")
async def callback(code: str = None, state: str = None, error: str = None):
    """Handle OAuth callback and exchange code for access token"""
    
    if error:
        raise HTTPException(status_code=400, detail=f"OAuth error: {error}")
    
    if not code or not state:
        raise HTTPException(status_code=400, detail="Missing code or state parameter")
    
    if state not in auth_states:
        raise HTTPException(status_code=400, detail="Invalid state parameter")
    
    # Clean up state
    del auth_states[state]
    
    # Exchange code for access token
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.x.com/2/oauth2/token",
            headers={
                "Content-Type": "application/x-www-form-urlencoded"
            },
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": REDIRECT_URI,
                "client_id": X_CLIENT_ID,
                "client_secret": X_CLIENT_SECRET,
                "code_verifier": "challenge"  # For PKCE (simplified)
            }
        )
    
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail=f"Token exchange failed: {response.text}")
    
    token_data = response.json()
    access_token = token_data.get("access_token")
    
    return {
        "success": True,
        "message": "Authorization successful! Copy this access token to your .env file as X_USER_ACCESS_TOKEN",
        "access_token": access_token,
        "env_instruction": f"X_USER_ACCESS_TOKEN={access_token}"
    }